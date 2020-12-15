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

var EventEmitter = require('events').EventEmitter,
    util         = require('util'),
    nodePath     = require("path"),
    Run          = require(nodePath.join(__dirname, "Classes", "Run")),
    repl         = require(nodePath.join(__dirname, "..", "..", "SodaREPL"));

/**
 * @module SodaCore/ActionManager
 * @description Returns an Action constructor, to create actions from JSON files
 * @param {object} $ The Soda library
 * @returns {Action} An action constructor
 */
module.exports = function (soda) {

    /**
     * Create an action from an asset object
     * @param {object} asset The asset object to create the action from (e.g. Screen, Menu, Action, Test, or Popup object)
     * @param {object} run The run object to start the action with
     * @returns {*}
     * @constructor
     * @augments EventEmitter
     */
    function Action (asset, run) {

        var err = arguments.sodaexpect("object", "object|undefined|null").error;
        if(err) { throw err; }

        var self = this;

        /////////////////////////////////////////////// HELPER FUNCTIONS ///////////////////////////////////////////////

        /**
         * Replaces variables using the syntax's variable format,
         * then clones the action item before sending it to the syntax's event handlers
         * @param {Array} args The args passed to the syntax event handler
         * @returns {*}
         */
        function cloneAndReplaceWithVariables (args) {

            var modifiedArgs = [args[0], args[1].sodaclone(), args[2], args[3]],
                m, re = soda.config.get("variableFormat"),
                obj = modifiedArgs[1];

            // Strip out the ignore key if it exists
            if(typeof modifiedArgs[1] === "object" && "ignore" in modifiedArgs[1])
                delete modifiedArgs[1].ignore;

            // Strip out the "platforms" key, if it exists
            if(typeof modifiedArgs[1] === "object" && "platforms" in modifiedArgs[1])
                delete modifiedArgs[1].platforms;

            var lazy = modifiedArgs[1].lazy === true;

            modifiedArgs[1].sodaeach(function checkForVariable (item, key) {
                if((item || item === 0) && typeof item === "object") {
                    var oo = obj;
                    obj = item;
                    if(item) item.sodaeach(checkForVariable);
                    obj = oo;
                }
                else {
                    if(soda.config.get("variableFormat") && !lazy) {
                        re.exec("");

                        while (m = re.exec(item)) { // jshint ignore:line
                            obj[key] = soda.config.get("variableOnMatch")(soda.vars, m, obj[key]);
                        }

                        re.exec("");
                        if(re.test(modifiedArgs[1][key]) === true)
                            checkForVariable(obj, key);
                    }
                }
            });
            return modifiedArgs;
        }

        /**
         * Strips comments from action items, and logs them to the stdout using Console.comment
         * @param  {Object} obj The action object to strip and log the comments from
         * @return {Object} The action object with the comments stripped
         */
        function stripAndLogComments (obj) {
            var keys = obj.getKeys.sodaascending,
                idx  = keys.indexOf("comment"),
                comment;

            if(idx > -1) {
                comment = obj[keys[idx]];
                keys.splice(idx, 1);
            }

            idx  = keys.indexOf("platforms");
            if(idx > -1) keys.splice(idx, 1);

            idx  = keys.indexOf("ignore");
            if(idx > -1) keys.splice(idx, 1);

            if(comment) soda.console.comment(comment);
            return keys;
        }

        /**
         * Handles the current action and continues to the next
         * @param {Object} useLast The last item used
         * @param {string} realpath The path of this action
         * @param {Object} params The parameters for this action
         * @param {string} msg The message of the action
         * 
         * @return {Object} The action object with the comments stripped
         */
        function continueToNextAction (useLast, realpath, params, msg) {
            var item = useLast ? useLast : params.queue.shift();

            if(item) {
                var newKeys = stripAndLogComments(item[1]),
                eventArguments, orphanError;

                item[0] = item[3].meta.path + ((newKeys.length > 0) ? ":" + newKeys.join(":") : "");
                eventArguments = cloneAndReplaceWithVariables(item);

                if(self.listenerCount(eventArguments[0]) > 0 && eventArguments[0] !== "") {
                    if(soda.config.get("logVerbose")) soda.console.verbose(eventArguments[1]);
                    ++params.stats.emissions;
                    run.emit("current", eventArguments[1]);
                    self.emit.apply(self, eventArguments);
                }
                else if(newKeys && newKeys.length > 0) {
                    orphanError = new soda.exception.OrphanedActionError("Orphaned action in `" + asset.getPath() + "`\n" + "    ...at path `" + realpath + "` with key signature `" + eventArguments[0] + "`");
                    params.complete.call(self, orphanError, false, orphanError.message, false);
                }
                else {
                    process.nextTick(() => continueToNextAction(false, params.realpath, params, msg));
                }
            }
            else {
                run.popChain().printChain();
                params.complete.call(null, null, true, msg, false);
            }

            soda.config.set("syntax"           , params.syntax);
            soda.config.set("variableFormat"   , params.variableFormat);
            soda.config.set("variableOnMatch"  , params.variableOnMatch);
        }

        /**
         * Invoked after the test keysignature event has called its "reply" callback
         * @param  {boolean} result The result of the current test action
         * @param  {string} msg The result message
         * @param {boolean} stopped The current state
         * @return {undefined}
         */
        function onReply (result, msg, stopped) {
            if(run.state === "waiting") run.state = run.tempState || "paused";
            if(stopped) run.state = "stopped";

            var last   = this, // jshint ignore:line
                params = last[3].params;

            if(soda.config.get("interactiveMode") !== true) {
                if(msg && result === true) {
                    if(msg) soda.console.pass(" ✔  " + msg);
                }
                else if(msg) {
                    soda.console.fail(" ✘  " + msg);
                }

                if(result && run.state !== 'stopped') {
                    process.nextTick(() => continueToNextAction(false, params.realpath, params, msg));
                }
                else {
                    run.popChain().printChain();
                    params.queue = [];
                    params.complete.call(null, null, result, msg, false);
                }
            }
            else {
                if(run.state !== "finished" && run.state !== "stopped") {
                    if(msg && result === true) {
                        if(msg) soda.console.pass(" ✔  " + msg);
                    }
                    else if(msg) {
                        soda.console.fail(" ✘  " + msg);
                    }

                    if(result !== true) run.state = "failed";

                    // When the user presses 's' or 'c' the following will be invoked
                    run.onStop = run.onContinue = function () {
                        var stopped  = (run.state === "stopped");
                        run.chain    = [];
                        params.queue = [];
                        params.complete.call(null, null, result, msg, stopped);
                    };

                    // When the user presses 'l' the following will be invoked
                    run.onLast = function () {
                        params.tree.update(function () {
                            run.state = run.tempState === "failed" ? "running" : run.tempState;
                            run.emit("allow", { pause: true, last: false, next: false, resume: false, stop: true, skip: false, end: false });
                            process.nextTick(() => continueToNextAction(last, params.realpath, params, msg));
                        });
                    };

                    // When the user presses 'r' or 'n' the following will be invoked
                    run.onResume = run.onNext = function () {
                        run.emit("allow", { pause: true, last: false, next: false, resume: false, stop: true, skip: false, end: false });
                        process.nextTick(() => continueToNextAction(false, params.realpath, params, msg));
                    };

                    // When the user presses 'k' the following will be invoked
                    run.onSkip = function () {
                        run.emit("allow", { pause: true, last: false, next: false, resume: false, stop: true, skip: false, end: false });
                        process.nextTick(() => continueToNextAction(false, params.realpath, params, msg));
                    };

                    run.onInquiry = function () {
                        console.log("Current Action Info:");
                        console.log("Path:"                   , params.asset.path);
                        console.log("Time in asset:"          , (Date.now() - params.stats.started).clockTime());
                        console.log("Remaining Test Items:"   , params.queue.length);
                        console.log("Stats:"                  , params.stats);
                        console.log("Current Syntax:"         , params.syntax);
                    };

                    if(run.state === "failed") {
                        /**
                        * Emitted when a action/test is failed
                        * @event Run#failed
                        */
                        run.emit("failed");

                        run.emit("allow", { pause: false, last: true, next: false, resume: false, stop: false, skip: true, end: true });
                        soda.console.fail("Action Failed: " + asset.getPath());
                        soda.console.error("Press (l) to repeat the last evaluation, (k) to skip failed evaluation, or (e) to end test...");
                    }
                    else if(run.state === "paused") {
                        /**
                         * Emitted when a action/test is paused
                         * @event Run#paused
                         */
                        run.emit("paused");

                        run.emit("allow", { pause: false, last: true, next: true, resume: true, stop: true, skip: false, end: false });
                        soda.console.warn("Test Paused. Press (n) to step to next test evaluation, (l) to repeat the last evaluation, (s) to stop test run, or (r) to resume testing...");
                    }
                    else if(run.state === "stopped") {
                        /**
                         * Emitted when a action/test is stopped
                         * @event Run#stopped
                         */
                        run.emit("stopped");

                        run.emit("allow", { pause: false, last: false, next: false, resume: false, stop: false, skip: false, end: false });
                        soda.console.warn("Test aborted!");
                        run.onStop();
                    }
                    else {
                        run.state = "running";
                        run.emit("running");
                        run.emit("allow", { pause: true, last: false, next: false, resume: false, stop: true, skip: false, end: false });
                        process.nextTick(() => continueToNextAction(false, params.realpath, params, msg));
                    }
                }
                else {
                    var stop = (run.state === "stopped");
                    run.state = "finished";
                    run.popChain();

                    if(run.chain.length > 0 && !stop) run.printChain();
                    params.queue = [];
                    params.complete.call(null, null, result, msg, stop);
                }
            }
        }

        /**
         * Find a match for the given action object and emit the action event keysignature
         * @param  {Array} keys The keyset of the current action
         * @param  {object} obj The action object at this particular path
         * @param  {string} path The current path in the action (using * for Arrays)
         * @param  {string} realpath The current path in the action (using the actual index for Arrays)
         * @param  {object} params The testing parameters object (@see Action.evaluate)
         * @return {undefined}
         */
        function findSyntaxMatch (keys, obj, path, realpath, params) {
            var platform = "all",
                comment  = null,
                ignored  = false,
                idx      = keys.indexOf("platforms");

            if(idx > -1) {
                platform = obj[keys[idx]];
                keys.splice(idx, 1);
            }

            idx = keys.indexOf("comment");
            if(idx > -1) {
                keys.splice(idx, 1);
            }

            idx = keys.indexOf("ignore");
            if(idx > -1) {
                if(
                    (typeof obj.ignore === "string" && obj.ignore.toLowerCase() === soda.config.get("platform")) ||
                    (obj.ignore instanceof Array && obj.ignore.indexOf( soda.config.get("platform")) > -1)       ||
                    (obj.ignore === true)
                ) {
                    soda.console.warn("Action at " + realpath + " has been flagged for ignore and will be skipped!");
                    ignored = true;
                }
                keys.splice(idx, 1);
            }

            var keySignature = keys.length > 0 ? ":" + keys.join(":") : "",
                fullpath     = path + keySignature,
                toPush;

            if(!ignored && self.listenerCount(path + keySignature) < 1 && soda.config.get("stopOnOrphanedAction")) {
                return new soda.exception.OrphanedActionError(
                    "Orphaned action in `" + asset.getPath() + "`\n" + "    ...at path `" + realpath + "` with key signature `" + keySignature + "`"
                );
            }
            else if(!ignored && (platform === "all" ||
                   (platform instanceof Array && platform.indexOf(soda.config.get("platform").toLowerCase()) > -1) ||
                   (typeof platform === "string" && platform === soda.config.get("platform").toLowerCase())
               )) {

                params.realpath = realpath;
                toPush = [
                    fullpath,
                    obj,
                    null,
                    {
                        vars        : soda.vars,
                        framework   : soda.framework,
                        user        : soda.element,
                        device      : soda.device,
                        soda        : soda,
                        params      : params,
                        tree        : params.tree,
                        elements    : params.tree.elements,
                        config      : soda.config,
                        console     : soda.console,
                        assets      : params.asset.collection,
                        run         : params.run,
                        meta        : {
                            signature : fullpath,
                            path      : path,
                            realpath  : params.fullpath,
                            filepath  : asset.getPath(),
                            keys      : keys
                        }
                    }
                ];

                toPush[2] = onReply.bind(toPush);
                params.queue.push(toPush);
            }
        }

        /**
         * Recursively rolls through the action (or screen or menu).
         * @param  {object} obj The object at this iteration through the action file contents
         * @param  {object} params The testing parameters object (@see Action.evaluate)
         * @param  {string} path The current path in the action (using * for Arrays)
         * @param  {string} realpath The current path in the action (using the actual index for Arrays)
         * @return {undefined}
         */
        function buildActionQueue (obj, params, path, realpath) {
            path     = path     || "";
            realpath = realpath || "";

            var i, res;

            for(i in obj) {
                if(obj.hasOwnProperty(i)) {

                    var value     = obj[i],
                        keys      = value ? value.getKeys.sodaascending : null,
                        localPath = path,
                        localReal = realpath;

                    ++params.stats.iterations;

                    if(value && value.isAnObject) {
                        localPath = localPath + (obj.isAnArray ? "*" : i) + "/";
                        localReal = localReal + i + "/";

                        if(params.syntax.actionPaths.indexOf(localPath) > -1) {
                            res = findSyntaxMatch(keys, value, localPath, localReal, params);
                            if(res instanceof soda.exception.SodaError || res instanceof Error) {
                                params.complete.call(
                                    self,
                                    res,
                                    false,
                                    res.message,
                                    false
                                );

                                params.queue = [];
                                return res;
                            }
                        }
                        res = buildActionQueue(value, params, localPath, localReal);
                        if(res !== undefined) return;
                    }
                }
            }
        }

        /**
         * Runs an action file (or action) using the provided syntax tree...
         * @param {Function} done A callback for completion
         * @param {Object=} Tree The initial tree to associate with this action. If no tree is provided, the framework will be polled for a new tree.
         * @composes Run
         * @returns {Action} The current Action instance
         */
        this.evaluate = function (done, tree) {
            var err = arguments.sodaexpect("function", "object|undefined|null").error;
            if(err) {
                if(done instanceof Function) done.call(self, err, null, false);
                return self;
            }

            if(!run)  {
                run = new Run(soda);
                soda.console.debug("Action " + asset.name + " has started a new run...");
            }

            repl.addCommand("set-test-mode-" + run.id, "tm|testMode", run.replTestMode);

            run.pushToChain(asset.name) // Push the basepath (e.g. asset name) into the chain, parents will have lower indices than children actions
                .setTestMode(true);     // Put the console into raw mode

            soda.console.warn("\r ⚑  Evaluating: `" + asset.path + "`");
            run.printChain();

            var previousMapping = {
                suite  : soda.config.get("suiteMapping"),
                module : soda.config.get("moduleMapping"),
            };

            // Set the suite mapping
            soda.config.set("suiteMapping", asset.suite.getMapping);

            // Set the module mapping
            soda.config.set("moduleMapping", asset.module.getMapping);

            var version, name, lang, params;

            asset.getContents(function (err, contents) {
                if(err) {
                    if(done instanceof Function) done.call(self, err, null, false);
                    return self;
                }

                // Set the action syntax version
                version = asset.syntax.version || soda.framework.defaultSyntaxVersion || soda.config.get("defaultSyntaxVersion");
                name    = asset.syntax.name    || soda.framework.defaultSyntaxName    || soda.config.get("defaultSyntaxName");

                // Load the action's syntax based on the above
                soda.console.debug("Setting syntax to " + name + " v" + version);
                lang = soda.syntax.get(self, name, version);

                soda.config.set("syntax", { name: name, version: version });
                soda.config.set("variableFormat",  lang.syntax.variableFormat  || soda.config.get("defaultVariableFormat"));
                soda.config.set("variableOnMatch", lang.syntax.variableOnMatch || soda.config.get("defaultVariableMatch"));

                /**
                 * Emitted when the current syntax is being "defined" in the action. That is, when an action is parsing its
                 * events, using the current syntax. Listen on this event to add custom syntax definitions to a syntax.
                 * @event module.SodaCore/Syntax.Syntax#define
                 * @argument self The current Action instance
                 */
                soda.syntax.emit("define", self);

                // Set some testing parameters for this Action
                params = {
                    syntax          : { name: name, version: version, actionPaths: lang.syntax.actionPaths },
                    variableFormat  : soda.config.get("variableFormat"),
                    variableOnMatch : soda.config.get("variableOnMatch"),
                    queue           : [],
                    run             : run,
                    tree            : tree,
                    asset           : asset,

                    complete        : function () {
                        if(done) {
                            if(run.chain.length === 0) {
                                run.setTestMode(false);
                                repl.removeCommand("set-test-mode-" + run.id);
                            }

                            // Reset the selector mappings
                            soda.config.set("suiteMapping" , previousMapping.suite );
                            soda.config.set("moduleMapping", previousMapping.module);

                            done.apply(self, arguments);
                            done = null;
                        }
                    },
                    stats: {
                        started      : Date.now(),
                        totalObjects : contents.countR,
                        iterations   : 0,
                        emissions    : 0
                    }
                };

                /**
                 * This callback is invoked after we know there's a tree available for the
                 * action to execute against
                 * @param  {object} err The current error
                 * @param  {object} tree The DOM tree for this action
                 * @return {undefined}
                 */
                function onInitialTree (err, tree) {
                    if(err) {
                        done.call(self, err, null, null, false);
                        return self;
                    }

                    // Set the tree to work with
                    params.tree = tree;

                    // Buld the action queue
                    buildActionQueue(contents, params);

                    // Start shifting the queue and evaluating each action
                    if(params.queue.length > 0) {
                        if(self.listenerCount(params.queue[0][0]) > 0) {
                            ++params.stats.emissions;
                            var testItem = params.queue.shift();
                            stripAndLogComments(testItem[1]);
                            soda.console.verbose(testItem[1]);

                            /**
                             * Emitted when the run starts or enters a "running" state
                             * @event Run#running
                             */
                            run.emit("running");

                            /**
                             * Emitted for the Soda VisualEditor to know which states are allowable, based on the Run's current state
                             * @event Run#allow
                             * @param {Object} states The allowable states
                             */
                            run.emit("allow", { pause: true, last: false, next: false, resume: false, stop: true, skip: false, end: false });

                            /**
                             * Emitted with the current test item
                             * @event Run#current
                             * @param {Object} currentTestItem The current test item object
                             */
                            run.emit("current", testItem[1]);

                            self.emit.apply(self, cloneAndReplaceWithVariables(testItem));
                        }
                        else {
                            if(done instanceof Function) done.call(self, null, false, "Initial: Orphaned action", false);
                        }
                    }
                    else {
                        if(done instanceof Function) done.call(self, null, true, "No test items to evaluate", false);
                    }
                }

                // Check that we have a tree to start with, if not get the tree from the framework
                if(tree) {
                    onInitialTree(null, tree);
                }
                else {
                    soda.framework.getTree(onInitialTree);
                }
            });
            return self;
        };
    }

    util.inherits(Action, EventEmitter);
    return Action;
};
