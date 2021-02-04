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
 * @module SodaREPL/REPL
 * @description The Soda interactive CLI-REPL (read, evaluate, print, loop)
 */

var readline     = require("readline"),
    nodePath     = require("path"),
    EventEmitter = require('events').EventEmitter,
    util         = require("util"),
    sodaLib      = require(nodePath.join(__dirname, "Commands")),
    stdLib       = require(nodePath.join(__dirname, "StdLib")),
    evalSafe     = require(nodePath.join("..", "..", "SodaCommon", "EvalSafe")),
    Console      = require(nodePath.join("..", "..", "SodaCommon", "Console")),
    fs           = require("fs"),
    userHome     = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'],

/**
 * The Soda interactive CLI-REPL (read, evaluate, print, loop)
 * @constructor
 * @augments EventEmitter
 * @param {object} consoleOptions Console options for this REPL instance
 */
REPL = function () {

    var self           = this,
        autoPrompt     = true,
        $rl            = null,
        commands       = {},
        paused         = false,
        gotSigInt      = 0,
        sodas          = {},
        tmpHistory     = null,
        currentSoda    = null,
        wstream        = null,

        /**
         * A Console object for this REPL isntance
         * @type Console
         * @composes Console
         */
        console = new Console({ log: { debug: false }});

    Object.defineProperty(self, "rsole", {
        configurable : false,
        enumerable   : true,
        get          : function () { return console; }
    });

    /**
     * The character used to signify that user input is a command
     * @type {String}
     */
    this.COMMAND_DELIMITER = ":";

    /**
     * The character (or string) used to split arguments
     * @type {String}
     */
    this.ARG_SPLITTER = " ";

    /**
     * The maximum REPL history limit
     * @type {Number}
     */
    this.HISTORY_LIMIT = 50;

    /**
     * The file location to store REPL history
     * @type {String}
     */
    this.HISTORY_LOCATION = nodePath.join(userHome, ".sodareplhistory");

    /**
     * Whether or not this REPL instance has been started
     * @type {Boolean}
     */
    this.isStarted = false;

    // Write stream for saving repl history
    wstream = fs.createWriteStream(self.HISTORY_LOCATION, { flags: 'a' });

    // Load old history from file
    fs.readFile(self.HISTORY_LOCATION, function (err, contents) {
        if(!err) {
            try {
                var lines = contents.toString('utf-8').trim().split("\n").reverse();
                if(lines.length > self.HISTORY_LIMIT) {
                    lines = lines.slice(0, self.HISTORY_LIMIT);

                    fs.writeFile(self.HISTORY_LOCATION, lines.reverse().join("\n") + "\n", function () {
                        /* No Op */
                    });

                    lines.reverse();
                }
                tmpHistory = lines;
            }
            catch (e) {
                tmpHistory = null;
            }
        }
    });

    /**
     * The EvalSafe module instance
     * @type {object}
     * @composes EvalSafe
     */
    this.evalSafe = evalSafe;

    Object.defineProperties(self, {

        /**
         * The node Readline isntance associated with the REPL
         * @type {Readline}
         */
        rl: {
            configurable : false,
            enumerable   : true,
            get () { return $rl; }
        },

        /**
         * A dictionary of this REPL's active commands
         * @type {Object}
         */
        commands: {
            configurable : false,
            enumerable   : true,
            get () { return commands; }
        },

        /**
         * Whether or not the REPL has been paused
         * @type {Boolean}
         */
        paused: {
            configurable : false,
            enumerable   : true,
            get () { return paused; }
        },

        /**
         * A Console object for this REPL isntance
         * @type Console
         * @composes Console
         */
        console: {
            configurable : false,
            enumerable   : true,
            get () { return console; }
        },

        /**
         * The current Soda instance active in the REPL
         * @associates Soda
         * @type {Soda}
         */
        currentSoda: {
            configurable : false,
            enumerable   : true,
            get () { return currentSoda; }
        }
    });

    // Handle uncaught exception for the REPL
    process.on("uncaughtException", function (e) {
        console.log(e.stack);
        if(self.currentSoda) self.currentSoda.config.set("testingInProgress", false);
        if(self.isStarted === true) self.resume().prompt();
    });

    /**
     * Prompt the REPL after each console log
     * @return {undefined}
     */
    function promptOnLog () { if(self.isStarted) self.prompt(); }
    function resetLine(messages) { messages.sodaeach(function (message, key, i) { if(i === 0) messages[key] = "\u001b[2K\r" + message; }); }
    function replOnLine (line) {
        try {
            var res = evalSafe.evaluate(line, currentSoda);
            if(res instanceof Error) throw res;

            try { 
                res = JSON.stringify(res, console.jsonFunctionReplacer, '    '); 
            } 
            catch(e) { 
                /* No op */ 
            }
            console.log(":=", res);
        }
        catch(e) {
            console.error(e.message);
        }
    }

    console.on("post log", promptOnLog);
    console.on("log", resetLine);

    /**
     * When no command is present, just evaluate the line as JavaScript
     */
    self.on("line", replOnLine);

    /**
     * Callback provided to line subscribers to provide a "code" and "message" upon completion
     * @param {number} c The code (should be a standard UNIX code)
     * @param {string} msg The message to print (color printed is based on code)
     * @param {boolean} prompt Prompt the user after a successful code callback?
     */
    function code (c, msg, prompt) {
        if(typeof msg === "string" && msg !== "") {
            switch(parseInt(c, 10)) {
                case 1:
                case 99:
                    if(currentSoda) {
                        currentSoda.console.error(msg);
                    }
                    else {
                        console.error(msg);
                    }
                    break;

                case 2:
                    if(currentSoda) {
                        currentSoda.console.warn(msg);
                    }
                    else {
                        console.warn(msg);
                    }
                    break;

                default:
                    if(currentSoda) {
                        currentconsole.log(msg);
                    }
                    else {
                        console.log(msg);
                    }
                    break;
            }
        }

        if(parseInt(c, 10) === 99) { self.kill(); } // Code to stop the readline...
        if(prompt === true) { $rl.prompt(); }
    }

    /**
    * Callback for when the user presses ^C
    */
    function replSigInt () {
        var listenerCount = self.listenerCount("got sigint"),
            done = 0;

        if(paused === false) {
            if (gotSigInt === 0) {
                console.warn("Press ^C again to exit...");
                setTimeout(function () { gotSigInt = 0; }, 700);
                self.prompt();
            }
            else {
                if(listenerCount > 0) {
                    /**
                    * Emitted when the REPL has received 2 SIGINT signals, and will be closing
                    * @event module.SodaREPL/REPL.REPL#got sigint
                    */
                    self.emit("got sigint", function next () {
                        if(++done === listenerCount)
                            self.kill(function () { process.exit(0); });
                    });
                }
                else {
                    self.kill(function () { process.exit(0); });
                }
            }
            gotSigInt++;
        }
    }

    this.listSodas = function () {
        var output = [];
        sodas.sodaeach(function (y) {
            output.push(y.toString());
        });
        console.log(output);
    };

    /**
     * Remove a Soda instance from the REPL
     * @param  {Soda} soda A Soda instance
     * @return {REPL} The current REPL instance
     */
    this.removeSoda = function (soda) {
        if(typeof soda === "object" && (soda.yid || soda.yid === 0)) {
            soda.console.removeListener("log", resetLine);
            soda.console.removeListener("post log", promptOnLog);
            sodas[soda.yid] = null;
            delete sodas[soda.yid];
            if(currentSoda === soda) {
                if(sodas.last) {
                    self.switchToSodaUsingYid(sodas.last.yid);
                }
                else {
                    currentSoda = null;
                    self.removeAllSodaCommands();
                }
            }

        }
        return self;
    };

    /**
     * Add a Soda instance to the REPL
     * @param  {Soda} soda A Soda instance
     * @return {REPL} The current REPL instance
     */
    this.addSoda = function (soda) {
        if(typeof soda === "object" && (soda.yid || soda.yid === 0) && !sodas[soda.yid]) {
            sodas[soda.yid] = soda;

            soda.config.on("config set", function (name) {
                if (/console(\.\w+)*/.test(name) && currentSoda === sodas[soda.yid]) {
                    console.setOptions(soda.config.get("console"));
                }
            });

            soda.once("soda killed", function () {
                self.removeSoda(soda);
            });
        }
        return self;
    };

    /**
     * Switch to a Soda isntance by Soda ID
     * @param  {string|number} yid The Soda instance ID
     * @return {REPL} The current REPL instance
     */
    this.switchToSodaUsingYid = function (yid) {
        if(typeof yid === "string" || typeof yid === "number") {
            if(sodas[yid] && currentSoda !== sodas[yid]) {
                self.switchToSoda(sodas[yid]);
                console.log("REPL switched to", sodas[yid].toString());
            }
            else if(!sodas[yid]) {
                console.error("REPL has no Soda instance with id", yid, "attached");
            }
        }
        else {
            console.error("Cannot switch to Soda, as no YID was provided.");
        }
        return self;
    };

    /**
     * Switch REPL command from one Soda instance to another
     * @param  {Soda} soda The soda instance to switch to
     * @return {REPL} The current REPL instance
     */
    this.switchToSoda = function (soda) {
        if(self.isStarted && typeof soda === "object" && (soda.yid || soda.yid === 0) && sodas[soda.yid]) {
            currentSoda = sodas[soda.yid];
            $rl.setPrompt(soda.toString() + " > ");

            // Set soda in the eval scope
            evalSafe.set("soda", soda);
            evalSafe.set("repl", self);
            self.removeAllSodaCommands();

            // Reset the commands with the current Soda instance
            sodaLib(soda, self);

            currentSoda.console.removeListener("log", resetLine);
            currentSoda.console.removeListener("post log", promptOnLog);

            soda.console.on("log", resetLine);
            soda.console.on("post log", promptOnLog);

            console.setOptions(soda.config.get("console"));
            self.prompt();
        }
        return self;
    };

    /**
     * Initializes the REPL, kills the REPL and re-initializes if it's already been initialized.
     * @returns {REPL} The current REPL isntance
     */
    this.reset = function (soda) {
        gotSigInt = 0;
        if($rl) $rl.close();

        $rl = readline.createInterface({ input: process.stdin, output : process.stdout, historySize: self.HISTORY_LIMIT });
        $rl.setPrompt("REPL:" + process.pid + ":" + " > ");
        $rl.on("SIGINT", replSigInt);

        if(tmpHistory) $rl.history = tmpHistory;

        // Handle line event
        // Loop through the commands list and look for matches
        $rl.on("line", function (line) {
            if(line.trim() !== "") wstream.write(line + "\n");

            var handled  = false,
                noprompt = false;

            if(new RegExp("^" + self.COMMAND_DELIMITER + ".*$").test(line) === true) { // Got a command
                if(!paused) {
                    var args = line.split(/(\{.*}?|\[.*]|'.*?'|".*?"|\S+)/g).toTruthy.slice(1);

                    args.sodaeach(function (a, k) {
                        args[k] = a.replace(/^"(.*)"$/, '$1').replace(/~/g, userHome.withoutTrailingSlash);
                        try {
                            args[k] = JSON.parse(args[k]);
                        }
                        catch (e) { /* No op.. */ }
                    });

                    if(args.length > 0)
                        console.debug("REPL Got arguments: " + args.join(", "));

                    for(var i in self.commands) {
                        if(self.commands.hasOwnProperty(i) && 
                        (new RegExp("^" + self.COMMAND_DELIMITER + "(\\s+)?(?:(" + self.commands[i].regexp + "))(?:\\s+(.+))?(\\s+)?$").exec(line) !== null) && 
                        (typeof self.commands[i] === "object" && self.commands[i].callback instanceof Function)) {
                            try {
                                self.commands[i].callback.call(self, code, args);
                            }
                            catch(e) {
                                console.error(e.stack);
                                self.prompt();
                            }
                            handled  = true;
                            noprompt = self.commands[i] && self.commands[i].noprompt ? !!self.commands[i].noprompt : true;
                        }
                    }

                    if(handled === false) {
                        console.error("Command `" + line.replace(/^:(\w+).*/, '$1') + "` not found! Either it doesn't exist or it's module hasn't been initialized.");
                        /**
                         * Emitted when a REPL command was entered, but there are no subscribers to the command
                         * @event module.SodaREPL/REPL.REPL#command not found
                         */
                        self.emit("command not found", line);
                        if(autoPrompt === true) self.prompt();
                    }
                    else {
                        if(autoPrompt === true && noprompt === false) self.prompt();
                    }
                }
            }
            else { // We didn't get a command, just emit a regular line
                /**
                 * Emitted when the REPL receives a "regular" line (which is not a command)
                 * @event module.SodaREPL/REPL.REPL#line
                 */
                self.emit("line", line);
                if(autoPrompt === true) self.prompt();
            }
        });

        if(soda && sodas[soda.yid]) self.switchToSoda(soda);
        if(autoPrompt === true) self.prompt();
        self.isStarted = true;
        return self;
    };

    /**
     * Initializes the REPL, starts the read-line interface, calls self.reset(), and returns the REPL module.
     * @returns {REPL} The current REPL isntance
     */
    this.init = function (soda, consoleOptions) {
        if(!consoleOptions && soda && typeof soda.yid !== "number") {
            consoleOptions = soda;
            soda           = undefined;
        }

        self.isStarted = true;
        if(typeof consoleOptions === "object") console.setOptions(consoleOptions);

        if(soda) self.addSoda(soda);
        if($rl !== null) return self;

        self.reset(soda);
        return self;
    };

    /**
    * Destroys the read-line interface and sets $rl to null.
    * @returns {REPL} The current REPL isntance
    */
    this.kill = function (done) {
        /**
        * Emitted just before the REPL is closed
        * @event module.SodaREPL/REPL.REPL#close
        */
        self.emit("close", self);

        if($rl) $rl.close();
        $rl = null;

        /**
        * Emitted just after the REPL is closed
        * @event module.SodaREPL/REPL.REPL#closed
        */
        self.emit("closed", self);
        if(done instanceof Function) done.call(self);
        return self;
    };

    /**
     * Adds a command to watch for when a new line is entered into the REPL
     * @param {string} name The "alias" for the command. This is used merely to store is as a key
     * @param {string} regexpMatch The *string* regular expression to match to call the command
     * @param {function} callback The callback to execute when a match is found
     * @param {boolean=} noprompt Force a post prompt decision after the command is executed
     * @param {boolean=} isSodaCommand True if this command is bound to the current Soda instance. False would indicate that
     * it is global (doesn't operate on the current Soda intance)
     * @returns {REPL} The current REPL isntance
     */
    this.addCommand = function (name, regexpMatch, callback, noprompt, isSodaCommand) {
        commands[name] = {
            regexp   : regexpMatch,
            callback : callback,
            noprompt : noprompt,
            isSoda   : !!isSodaCommand
        };
        return self;
    };

    /**
     * Removes a command from the REPL
     * @param {string} name The name (alias) of the command to remove
     * @returns {REPL} The current REPL isntance
     */
    this.removeCommand = function (name) {
        commands[name] = null;
        delete commands[name];
        return self;
    };

    /**
     * Removes all REPL commands
     * @returns {REPL} The current REPL isntance
     */
    this.removeAllCommands = function () {
        commands.sodaeach(function (c, k) {
            self.removeCommand(k);
        });
        return self;
    };

    /**
     * Removes all REPL Soda commands
     * @returns {REPL} The current REPL isntance
     */
    this.removeAllSodaCommands = function () {
        commands.sodaeach(function (c, k) {
            if(c.isSoda) self.removeCommand(k);
        });
        return self;
    };

    /**
     * Safely pause the read-line interface...
     * @returns {REPL} The current REPL isntance
     */
    this.pause = function () {
        if($rl && !paused) {
            sodas.sodaeach(function (y) {
                y.console.removeListener("log", resetLine);
                y.console.removeListener("post log", promptOnLog);
            });

            console.removeListener("log", resetLine);
            console.removeListener("post log", promptOnLog);
            self.removeListener("line", replOnLine);

            tmpHistory = $rl.history; // Save the old repl history :)
            $rl.close();
            paused = true;
        }
        return self;
    };

    /**
     * Safely resume the read-line interface...
     * @returns {REPL} The current REPL isntance
     */
    this.resume = function (soda) {
        if(paused) {
            paused = false;
            self.reset(soda || currentSoda);

            sodas.sodaeach(function (y) {
                y.console.on("log", resetLine);
                y.console.on("post log", promptOnLog);
            });

            console.on("log", resetLine);
            console.on("post log", promptOnLog);
            self.on("line", replOnLine);
        }
        return self;
    };

    /**
     * Safely prompt the read-line interface..
     * @returns {REPL} The current REPL isntance.
     */
    this.prompt = function () {
        if($rl && paused === false) $rl.prompt(true);
        return self;
    };

    /**
     * Disable internal REPL prompts, for things like the ODA Repl
     * @param {boolean} setting True or false
     * @returns {REPL} The current REPL isntance
     */
    this.setAutoPrompt = function (setting) {
        autoPrompt = !!setting;
        return self;
    };

    // Add stdLib commands to REPL
    stdLib(self);
};

util.inherits(REPL, EventEmitter);
module.exports = new REPL(); // Singleton
