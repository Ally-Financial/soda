/*
 * Copyright 2020 Ally Financial, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */

 /**
 * @module SodaCore/Trace
 */

var EventEmitter = require('events').EventEmitter;

/**
 * A very simple interaction tracer
 * @constructor
 * @param {Soda} soda A Soda instance, which contains a Framework instance
 */
var Trace = function (soda) {
    var trace = [], self = this, started = false, n = 0,

    /**
     * A representation of the current Framework
     * @type {Object}
     */
    framework = {

        /**
         * The framework name
         * @type {String}
         */
        name: soda.framework.name,

        /**
         * The framework version
         * @type {String}
         */
        version: soda.framework.version,

        /**
         * The arguments used to start the framework
         * @type {Array<String|Object>}
         */
        args: soda.framework.args
    },

    options = soda.config.get();

    /**
     * Callback for "performed element interaction"
     * @param  {Object} err Error object
     * @param  {Object} interaction Interaction object
     * @param  {Object} elems Elements to add
     * @param  {Object} options Options
     */
    function addElementInteraction (err, interaction, elems, options) {
        var els = elems.sodaclone();

        els.sodaeach(function (e) {
            e.children = null;
            delete e.children;
        });

        var now = Date.now();

        if (interaction === "setValue" && options.mask) {
            var maskedOptions = JSON.parse(JSON.stringify(options));
            maskedOptions.value = "******";
            trace.push({
                timestamp   : now,
                date        : (new Date(now)).toUTCString(),
                type        : "element",
                interaction : interaction,
                event       : n++,
                error       : err,
                targets     : els,
                options     : maskedOptions
            });
        }
        else {
            trace.push({
                timestamp   : now,
                date        : (new Date(now)).toUTCString(),
                type        : "element",
                interaction : interaction,
                event       : n++,
                error       : err,
                targets     : els,
                options     : options
            });
        }
    }

    /**
     * Callback for "performed device interaction"
     * @param  {Object} err Error object
     * @param  {Object} interaction Interaction object
     * @param  {Object} options Options
     */
    function addDeviceInteraction (err, interaction, options) {
        var now = Date.now();
        trace.push({
            timestamp   : now,
            date        : (new Date(now)).toUTCString(),
            type        : "device",
            interaction : interaction,
            event       : n++,
            error       : err,
            options     : options
        });
    }

    /**
     * Start tracing device/element interactions
     * @return {Trace} The current Trace instance
     */
    this.start = function () {
        if(soda.config.get("traceInteractions")) {
            soda.framework.on("performed element interaction", addElementInteraction);
            soda.framework.on("performed device interaction" , addDeviceInteraction );
            started = true;
        }
        return self;
    };

    /**
     * Stop tracing device/element interactions
     * @return {Trace} The current Trace instance
     */
    this.stop = function () {
        if(started) {
            soda.framework.removeListener("performed element interaction", addElementInteraction);
            soda.framework.removeListener("performed device interaction" , addDeviceInteraction );
            started = false;
        }
        return self;
    };

    /**
     * Clear the trace's backlog
     * @return {Trace} The current Trace instance
     */
    this.clear = function () {
        n = 0;
        trace = [];
        return self;
    };

    /**
     * Get the current trace
     * @return {Trace} The current Trace instance
     */
    this.get = function () {
        return {
            framework : framework.sodaclone(),
            options   : options,
            trace     : trace.sodaclone()
        };
    };
};

/**
 * An event emitter for static method purposes
 */
Trace.emitter = new EventEmitter();

/**
 * Execute a trace line item
 * @param  {object} traceItem A trace line item
 * @param  {object} trace The whole trace object
 * @param  {Soda} soda The current Soda instance
 * @param  {Function} done A callback for completion
 * @return {undefined}
 */
function performTraceItem (traceItem, trace, soda, done, performCount) {
    performCount = performCount || 0;

    soda.framework.getTree(function (err) { // Get a new tree on each trace item update
        if(err) {
            if(done instanceof Function) done(err);
            return;
        }

        var method = traceItem.type === "device" ? "performDeviceInteraction" : "performElementInteraction",
            args,

            complete = function (err) {
                if(err) {
                    if(performCount < soda.config.get("findElementRetries") && traceItem.type === "device") {
                        performTraceItem(traceItem, trace, soda, done, ++performCount);
                    }
                    else {
                        if(method === "performDeviceInteraction") {
                            soda.console.fail("Should perform device interaction " + traceItem.interaction);
                        }
                        else {
                            soda.console.fail("Should " + traceItem.interaction + " #" + traceItem.targets[0].id);
                        }
                        if(done instanceof Function) done(err);
                    }
                    return;
                }

                if(method === "performDeviceInteraction") {
                    soda.console.pass("Should perform device interaction " + traceItem.interaction);
                }
                else {
                    soda.console.pass("Should " + traceItem.interaction + " #" + traceItem.targets[0].id);
                }

                traceItem = trace.trace.shift();

                if(traceItem) {
                    performTraceItem(traceItem, trace, soda, done);
                }
                else {
                    if(done instanceof Function) done(null);
                }
            };

        if(method === "performDeviceInteraction") {
            args = [traceItem.interaction, traceItem.options, complete];
        }
        else {
            args = [traceItem.interaction, traceItem.targets, traceItem.options, complete];
        }

        if(Trace.emitter.listenerCount("trace line item") > 0) {
            Trace.emitter.emit("trace line item", traceItem, trace, soda, args, function (perform) {
                if(perform) {
                    soda.framework[method].apply(soda.framework, args);
                }
                else {
                    complete();
                }
            });
        }
        else {
            soda.framework[method].apply(soda.framework, args);
        }
    });
}

/**
 * Execute a trace line item. A wrapper for performTraceItem function
 * @param  {object} traceItem A trace line item
 * @param  {object} trace The whole trace object
 * @param  {Soda} soda The current Soda instance
 * @param  {Function} done A callback for completion
 * @return {undefined}
 */
function run (trace, soda, done) {
    if(trace.trace.length > 0) {
        var traceItem = trace.trace.shift();
        performTraceItem(traceItem, trace, soda, done);
    }
    else {
        soda.console.warn("Trace trail was empty...");
        if(done instanceof Function) done(null);
    }
}

/**
 * Run a trace file (or trace object)
 * @param  {object|Trace} trace The trace JSON file contents, JS object, or Trace object
 * @param  {object} soda An instance of Soda
 * @param  {Function} done A callback for completion
 * @return {undefined}
 */
Trace.run = function (trace, soda, done) {
    soda.config.set("dontKillAutomatorApp", true);

    if(!trace) {
        if(done instanceof Function) done.call(Trace, new Error("Bad arguments list, missing argument #0: `trace`"));
        return;
    }

    // Try to parse JSON string into trace object
    if(typeof trace === "string") {
        try {
            trace = JSON.parse(trace);
        }
        catch (e) {
            if(done instanceof Function) done.call(Trace, e, null);
        }
    }

    // If we got a trace object, get it's trace contents
    if(trace instanceof Trace) trace = trace.get();

    // Check that we have a valid trace object
    if(typeof trace !== "object" || !trace.framework || !trace.trace || !trace.options) {
        if(done instanceof Function) done.call(Trace, new Error("Invalid trace file"), null);
        return;
    }

    // Run the trace
    if(soda.framework.started === true) {
        run(trace, soda, done);
    }
    else {
        trace.framework.args[trace.framework.args.length - 1] = function () {
            run(trace, soda, done);
        };

        soda.setOptions(trace.options)
            .framework
                .load(trace.framework.name)
                .start.apply(soda.framework, trace.framework.args);
    }
};

module.exports = Trace;
