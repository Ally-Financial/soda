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
 * A representation of a "test" or "action" run
 * @module SodaCore/Run
 */

var util         = require("util"),
    EventEmitter = require("events").EventEmitter,
    nodePath     = require("path"),
    repl         = require(nodePath.join(__dirname, "..", "..", "..", "SodaREPL")),
    Trace        = require(nodePath.join(__dirname, "Trace")),
    fs           = require("fs"),
    runIds       = 0,

/**
 * A representation of a "test" or "action" run
 * @constructor
 * @extends EventEmitter
 * @param {Soda} soda The soda instance this run is associated with
 * @param {number} id Force a specific run identifier
 * @param {boolean} reset Force reset of the runId
 */
Run = function (soda, id, reset= false) {
    var self = this;

    if (reset) runIds = 0;

    /**
     * This Run's unique id
     * @type Number
     */
    this.id = (id || id === 0) ? id : "r" + runIds++;

    /**
     * The current state of the run. Options are: "running", "stopped", "waiting", "finished", or "paused".
     * @type {String}
     */
    this.state = "running";

    /**
     * The current chain path. The chain path is an array of string action file references which have called each other (e.g. Action -> Action 2 -> Action 3)
     * @type {Array<String>}
     */
    this.chain = [];

    /**
     * Whether or not the stdin is in test mode (raw keypress mode, or line mode). The first is "test mode".
     * @type {Boolean}
     */
    this.inTestMode = false;

    /**
     * The Trace associated with this Run
     * @type {Trace}
     * @composes Trace
     */
    this.trace = new Trace(soda);

    /**
     * A callback for when the user repeats the last action (presses the "l" key)
     * @type {Function}
     */
    this.onLast = null;

    /**
     * A callback for when the user skips to the next action (presses the "n" key)
     * @type {Function}
     */
    this.onNext = null;

    /**
     * A callback for when the user ends the test on a failure (presses the "c" or "e" keys)
     * @type {Function}
     */
    this.onContinue = null;

    /**
     * A callback for when the user resumes a paused test (presses the "r" key)
     * @type {Function}
     */
    this.onResume = null;

    /**
     * A callback for when the user skips an action item (presses the "k" key)
     * @type {Function}
     */
    this.onSkip = null;

    soda.console.debug("Initiating run with id", self.id);

    /**
     * Callback for setting REPL test mode
     * @returns {Run} The current run instance
     */
    this.replTestMode = function (code, args) {
        self.setTestMode(args[0] || !self.chain.inTestMode);
        return self;
    };

    /**
     * Prints the chain list
     * @returns {Run} The current run instance
     */
    this.printChain = function () {
        if(self.chain.length > 0) {
            var c = self.chain.sodaclone();
            c[c.length - 1] = "[" + c.sodalast() + "]";
            console.log("In asset:", c.join(" ❯ ").ellipses(150, "front"));
        }
        return self;
    };

    /**
     * Pop an item off the run chain
     * @returns {Run} The current run instance
     */
    this.popChain = function () {
        self.chain.pop();
        return self;
    };

    /**
     * Push an item to the test chain
     * @param i The item to push to the chain
     * @returns {Run} The current run instance
     */
    this.pushToChain = function (i) {
        self.chain.push(i);
        return self;
    };

    /**
     * Callback for when a key is pressed
     * @param ch The character that was presses
     * @param key An object with the key information
     * @see process.stdin.on("keypress")
     */
    this.onKeypress = function (ch, key) {
        if(typeof key === "object" && "name" in key) {
            switch(key.name) {
                case "p":
                    return self.state === "running" ? self.pause() : self.resume();

                case "r":
                    if(self.state === "paused") self.resume();
                    break;

                case "c":
                case "e":
                    self.continue();
                    break;

                case "n":
                    self.nextItem();
                    break;

                case "i":
                    self.inquiry();
                    break;

                case "k":
                    self.skip();
                    break;

                case "l":
                    self.lastItem();
                    break;

                case "s":
                    self.stop();
                    break;

                case "x":
                    self.setTestMode(false);
                    break;

                case "d":
                    console.log("Defined Variables:");
                    console.log(soda.vars.getAllNonPersistent());
                    break;

                case "t":
                    var fn = nodePath.join(soda.config.get("userHome"), "trace") + Date.now() + ".json";
                    console.log("Writing trace file to:", fn);
                    try {
                        fs.writeFile(fn, JSON.stringify(self.trace.get(), null, '    '), function (err) {
                            if(err) soda.console.error(err);
                        });
                    }
                    catch (e) {
                        soda.console.error("Unable to write trace file:", e.message);
                    }
                    break;

                case "y":
                    console.log("Current Trace:");
                    console.log(self.trace.get());
                    break;

                default:
                    break;
            }
        }
    };

    /**
     * Stops the current run
     * @returns {Run} The current run instance
     */
    this.stop = function () {
        if(self.state === "running") {
            soda.console.warn("Stopping run...");
            self.state = "stopped";
        }
        else if(self.state === "paused" && self.onStop instanceof Function) {
            soda.console.warn("Stopping run...");
            self.state = "stopped";
            self.onStop();
        }
        return self;
    };

    /**
     * Pauses the current run
     * @return {Run} The current run instance
     */
    this.pause = function () {
        if(self.state === "running") {
            soda.console.warn("Pausing test...");
            self.state = "paused";
        }
        return self;
    };

    /**
     * Resumes the current run
     * @returns {Run} The current run instance
     */
    this.resume = function () {      
        if(self.onResume instanceof Function && self.state === "paused") {
            soda.console.warn("Continuing test...");
            self.state = "running";
            self.onResume();
        }
        return self;
    };

    /**
     * Continues (fails) the current run
     * @returns {Run} The current run instance
     */
    this.continue = function () {
        if(self.onContinue instanceof Function && self.state === "failed") {
            soda.console.warn("Continuing test...");
            self.state = "finished";
            self.onContinue();
        }
        return self;
    };

    /**
     * Steps to the next test item
     * @returns {Run} The current run instance
     */
    this.nextItem = function () {
        if(self.onNext instanceof Function && (self.state === "paused" || self.state === "failed")) {
            soda.console.warn("Evaluating next test item...");
            self.tempState = self.state;
            self.state = "waiting";
            self.onNext();
        }
        return self;
    };

    /**
     * Repeats the last test item
     * @returns {Run} The current run instance
     */
    this.lastItem = function () {
        if(self.onLast instanceof Function && (self.state === "paused" || self.state === "failed")) {
            soda.console.warn("Repeating last test item...");
            self.tempState = self.state;
            self.state = "waiting";
            self.onLast();
        }
        return self;
    };

    /**
     * Skips the current test item
     * @returns {Run} The current run instance
     */
    this.skip = function () {
        if(self.onSkip instanceof Function && (self.state === "paused" || self.state === "failed")) {
            soda.console.warn("Skipping failed test item...");
            self.state = "running";
            self.onSkip();
        }
        return self;
    };

    /**
     * Print information (defined variables, stats, etc.) about this run to the screen
     * @returns {Run} The current run instance
     */
    this.inquiry = function () {
        if(self.onInquiry instanceof Function) self.onInquiry();
        return self;
    };

    /**
     * Releases the console, kills the REPL, sets process.stdin.setRawMode to true, and accepts keypress input
     * Typically, this should be called only by TestRunner.js
     * @returns {Run} The current run instance
     */
    this.setTestMode = function (yes) {
        if(soda.config.get("interactiveMode")) {
            process.stdin.removeListener('keypress', self.onKeypress);
            if(yes) {
                self.inTestMode = true;
                if(repl.isStarted) repl.pause();
                if(process.stdin.setRawMode) process.stdin.setRawMode(true);
                process.stdin.on('keypress', self.onKeypress);
                process.stdin.resume();
            }
            else {
                self.inTestMode = false;
                if(repl.isStarted) repl.resume(soda).prompt();
            }
        }
        return self;
    };
};

util.inherits(Run, EventEmitter);
module.exports = Run;
