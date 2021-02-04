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
 * @module SodaCore/Soda
 * @description The Simple Object Driven Automation Framework
 */

// Node.js core dependencies
var util         = require("util"),
    EventEmitter = require("events").EventEmitter,
    fs           = require("fs"),
    nodePath     = require("path"),
    pkgInfo      = require(nodePath.join(__dirname, "..", "..", "package.json"));
    
require(nodePath.join(__dirname, "..", "..", "SodaCommon", "ProtoLib"));

    // Soda common dependencies
var Console     = require(nodePath.join(__dirname, "..", "..", "SodaCommon", "Console")),
    exception   = require(nodePath.join(__dirname, "..", "..", "SodaCommon", "Exception")),
    assert      = require(nodePath.join(__dirname, "..", "..", "SodaCommon", "Assert")),
    exec        = require(nodePath.join(__dirname, "..", "..", "SodaCommon", "Exec")),
    Config      = require(nodePath.join(__dirname, "..", "..", "SodaCommon", "Config")),

    // Soda class dependencies
    Framework       = require(nodePath.join(__dirname, "Classes", "Framework")),
    Vars            = require(nodePath.join(__dirname, "Classes", "Vars")),
    Syntax          = require(nodePath.join(__dirname, "Classes", "Syntax")),
    TestRunner      = require(nodePath.join(__dirname, "Classes", "TestRunner")),
    DevInteractions = require(nodePath.join(__dirname, "Classes", "DeviceInteractions")),
    EleInteractions = require(nodePath.join(__dirname, "Classes", "ElementInteractions")),
    Assets          = require(nodePath.join(__dirname, "Classes", "Assets")),

    // Soda object dependencies
    tree        = require(nodePath.join(__dirname, "Tree")),
    action      = require(nodePath.join(__dirname, "Action")),
    coreSyntax  = require(nodePath.join(__dirname, "CoreSyntax")),

    /**
     * A static property which increments on each new Soda instance.
     * Serves as each Soda instance's identifier (e.g. "yid")
     * @type {Number}
     */
    sids = 0;

/**
 * Used to replace function values in JSON.stringify to their Function.toString() equivalent
 * @param  {string} key The key of the JSON.stringify replacement item
 * @param  {*} value The value of the object in the JSON.stringify replacement item
 * @return {*} The replaced value
 */
function jsonFunctionReplacer (key, value) {
    if(typeof value === "function") return value.name ? "[Function:" + value.name + "]" : "[Function:anonymous]";
    return value;
}

/**
 * The Simple Object Driven Automation Framework
 * @constructor
 * @augments EventEmitter
 * @param {Object} options Overwrite inital options using this parameter
 * @param {Function} onInit A callback for completion, which will be called once Soda has been initialized
 */
var Soda = function (options, onInit) {

    var self = this, use = [], databaseEmitters = {};

    // Allow for the ability to reset the sids on start...helpful for unit tests
    if (typeof options === "object" && options.reset) {
        sids = 0;
        Vars            = require(nodePath.join(__dirname, "Classes", "Vars"));
    }

    /**
     * The soda instance id
     * @type {Number}
     */
    this.yid = sids++;

    /**
     * The current process id
     * @type {String}
     */
    this.pid = process.pid;

    /**
     * The soda alias
     * @type {String}
     */
    this.alias = typeof options === "object" ? options.alias ? options.alias : null : null;

    /**
     * The current soda version
     * @type {String}
     */
    this.version = pkgInfo.version;

    /**
     * A boolean indicating whether or not the current Soda instance initialization has completed
     * @type {Boolean}
     */
    this.initialized = false;

    /**
     * A flag to indicate whether or not this Soda instance is invalid
     * @type {Boolean}
     */
    this.killed = false;

    this.isDBPath = function (s) {
        return /^@database(:\w+)?$/.test(s) || /^@nofs(:\w+)?$/.test(s);
    };

    this.isLambdaPath = function (s) {
        return /^@lambda(:.*)?$/.test(s) || /^@nofs(:.*)?$/.test(s);
    };

    /**
     * For hooking into database events
     * @type {EventEmitter}
     * @aggregates EventEmitter
     */
    this.database = function (named) {
        if(typeof named === "string") {
            if(!databaseEmitters[named]) {
                databaseEmitters[named] = new EventEmitter();
                databaseEmitters[named].close = () => {
                    delete databaseEmitters[named];
                    databaseEmitters[named] = null;
                };
            }
            return databaseEmitters[named];
        }
        else {
            throw new Error("Argument for parameter `db` must be a string!");
        }
    };

    /**
     * Deletes the temp folder
     * @type {EventEmitter}
     * @aggregates EventEmitter
     */
    this.dumpTemp = function (done) {
        done = done instanceof Function ? done : () => {};
        if(self.initialized) {
            fs.rmdir(self.config.get("temp"), { recursive: true }, () => {
                fs.mkdir(self.config.get('temp'), function (err) {
                    return done.call(self, err || null);
                });
            });
        }
        else {
            return done.call(self, null);
        }
    };

    /**
     * Alias for Soda.database
     * @type {EventEmitter}
     */
    this.useDb = self.database;

    /**
     * Alias for Soda.database
     * @type {EventEmitter}
     */
    this.useLambda = self.database;

    /**
     * Alias for Soda.database
     * @type {EventEmitter}
     */
    this.noFs = self.database;

    /**
     * Get the "name" of this soda instance
     * @return {string}
     */
    this.toString = function () {
        return (self.alias ? self.alias.titleCase + ":" : "Soda:") + process.pid + ":" + self.yid;
    };

    /**
     * Returns a file name version of Soda.toString()
     * @return {string}
     */
    this.toSafeString = function () {
        return self.toString().replace(/[^a-zA-Z0-9]/g, '-');
    };


    /**
     * Loads the test assets
     * @param  {Function} done A callback for completion
     * @return {object<Soda>} The current Soda instance
     * @invokes module.SodaCore/Assets.Assets.load
     */
    this.loadAssets = function (testPath, done) {
        if(!done && testPath instanceof Function) {
            done     = testPath;
            testPath = done;
        }

        done = done instanceof Function ? done : () => {};

        self.checkForSodaJson(testPath, err => {
            if(err) {
                done.call(self, err, self);
            }
            else {
                self.console.log("Soda id: " + self.yid + " and loading assets from resource: " + testPath + "...");
                self.assets.load(testPath, (err, assetCollection) => {
                    if(err) {
                        done.call(self, err, self);
                    }
                    // Check for assets file descriptions
                    else if(!assetCollection) {
                        done.call(self, new self.exception.AssetsParseError("Soda id: " + self.yid + " and unable to load assets"), null);
                    }
                    // Assets are okay
                    else {
                        done.call(self, null, assetCollection);
                    }
                });
            }
        });
        return self;
    };

    /**
     * Cleans the test assets
     * @param  {Function} done A callback for completion
     * @return {object<Soda>} The current Soda instance
     */
    this.cleanTestResults = function(path, done) {
        done = done instanceof Function ? done : () => {};

        try {
          fs.rmdir(nodePath.join(path, self.config.get("testResultsDir")), { recursive: true }, (err) => {
              done.call(self, null, self);
          });
        }
        catch (e) {
          done.call(self, null, self);
        }
    };

    /**
     * Checks for the existence of the "soda.json" file
     * @param  {Function} done A callback for completion
     * @return {object<Soda>} The current Soda instance
     */
    this.checkForSodaJson = function (path, done) {
        done = done instanceof Function ? done : () => {};

        if(self.isDBPath(path) === false && self.isLambdaPath(path) === false) {
            fs.readFile(nodePath.join(path, "soda.json"), err => {
                if (err) {
                    done.call(self, new self.exception.IOError("Missing `soda.json`! Soda must be started from a Soda project directory."), self);
                    return;
                }
                else {
                    try {
                      fs.mkdir(nodePath.join(path, self.config.get("testResultsDir"))             , function () { /* No Op */ });
                      fs.mkdir(nodePath.join(path, self.config.get("testResultsDir"), "failures") , function () { /* No Op */ });
                      fs.mkdir(nodePath.join(path, self.config.get("testResultsDir"), "traces"  ) , function () { /* No Op */ });
                      done.call(self, null, self);
                    }
                    catch (e) {
                        done.call(self, null, self);
                    }
                }
            });
        }
        else {
            done.call(self, null, self);
        }
        return self;
    };

    /**
     * Cleans the Soda temp folder if no other soda processes/instances are running
     * @param  {Function} done A callback for completion
     * @return {object<Soda>} The current Soda instance
     */
    this.cleanSodaTemp = function (done) {
        done = done instanceof Function ? done : () => {};

        exec.checkForRunningSodas((err, stdout) => {
            var sodaCount = err || !stdout ? [] : stdout.trim().split("\n");
            self.console.debug("*** Soda *process* count is: " + sodaCount.length + " sids: " + sids + " ***");

            // No other Sodas, clean the temp folder
            if(sodaCount.length === 1 && sids === 1) {
                self.console.debug("*** No Soda processes running, cleaning temp folder ***");                
                fs.rmdir(self.config.get("temp"), { recursive: true }, (err) => {
                    fs.mkdir(self.config.get("temp"), { recursive: true }, (err) => {
                        done.call(self, null);
                    });
                });

                /**
                 * Emitted when the soda temp folder is cleaned
                 * @event module.SodaCore/Soda.Soda#soda temp cleaned
                 */
                self.emit("soda temp cleaned");
            }
            // Other Sodas running, don't clean or in-use data could be wiped...
            else {
                self.console.debug("*** Other Soda processes currently running, temp folder will not be cleaned ***");
                done.call(self, null);
            }
        });
    };

    /**
     * Gets an array of soda ids
     * @return {Array} The current sodaids
     */
    this.sids = function () {
        return sids;
    };

    /**
     * Sends a killed event and removes the soda id
     */
    this.kill = function () {
        sids--;
        this.killed = true;

        /**
         * Emitted this instance of Soda has been "killed", or marked for non-use (garbage collection)
         * @event module.SodaCore/Soda.Soda#soda killed
         */
        self.emit("soda killed", self);
    };

    /**
     * Set Soda configuration options
     * @param  {Object} options A object with configuration key/value pairs
     * @return {object<Soda>} The current Soda instance
     */
    this.setOptions = function (options) {
        if(options && options.isObjectNotArray) {
            options.sodaeach((value, option) => {
                if(value !== undefined) self.config.set(option, value);
            });
        }

        // Set console options
        if(typeof options === "object" && options) {
            if(typeof options.logDebug     === "boolean") self.config.set("console.log.debug"   , options.logDebug);
            if(typeof options.logColors    === "boolean") self.config.set("console.color"       , options.logColors);
            if(typeof options.logVerbose   === "boolean") self.config.set("console.log.verbose" , options.logVerbose);
            if(typeof options.logSupressed === "boolean") self.config.set("console.supress"     , options.logSupressed);
            if(typeof options.testResultsDir  === "string") self.config.set("testResultsDir"    , options.testResultsDir);
            if(typeof options.sodauser  === "string") self.config.set("sodauser", options.sodauser);
        }

        self.console.setOptions(self.config.get("console"));
        return self;
    };

    /**
     * Set a Soda configuration options
     * @param  {string} option An option or path to an option using the string dot-notation
     * @return {object<Soda>} The current Soda instance
     */
    this.setOption = function (option, value) {
        self.config.set(option, value);
        return self;
    };

    /**
     * Add custom Soda event listeners
     * @param  {Function} callback The custom listener to add
     * @return {Object<Soda>} The current Soda instance
     */
    this.use = function (callback) {
        if(callback instanceof Function) use.push(callback);
        return self;
    };

    /**
     * Remove a custom Soda event listener
     * @param  {Function} callback The custom listener to remove
     * @return {Object<Soda>} The current Soda instance
     */
    this.stopUsing = function (listener) {
        var idx = use.indexOf(listener);
        if(listener instanceof Function && idx > -1) use.splice(idx, 1);
        return self;
    };

    /**
     * Dump a variable or object to the specified path as JSON
     * @param  {*} what The object to dump
     * @param  {string} path The destination to dump the object contents to (the fullpath, e.g. with filename and extension)
     * @param  {Function} done A callback for completion
     * @return {Object<Soda>} The current Soda instance
     */
    this.dump = function (what, path, done) {
        if(!done && path instanceof Function) {
            done = path;
            path     = undefined;
        }

        done = done instanceof Function ? done : () => {};

        var stringified, err;
        if(!path) path = nodePath.join(self.config.get("userHome"), "sodadump-" + Date.now() + ".json");

        if(!what) {
            done.call(self, new Error("Cannot dump `undefined`"), path, false);
            return self;
        }

        try {
            stringified = JSON.stringify(what, jsonFunctionReplacer, '    ');
        }
        catch(e) {
            err = new exception.IOError("Unable to stringify dump contents, dump aborted");
            done.call(self, err, path, false);
            return self;
        }

        fs.writeFile(path, stringified, e => {
            if(err) {
                err = new exception.IOError("Unable to write dump contents to `" + path + "`, dump aborted with error message:\n" + e.message);
                done.call(self, err, path, false);
            }
            else {
                done.call(self, null, path, true);
            }
        });
        return self;
    };

    /**
     * Initalize the Soda instance
     * @param {Object} options Overwrite inital options using this parameter
     * @param {Function} done A callback for completion
     * @return {Object<Soda>} The current Soda instance
     */
    this.init = function (done) {
        if(!(this instanceof Soda)) return self.init.call(self, options, done);
        
        if(!done && options instanceof Function) {
            done    = options;
            options = undefined;
        }

        done = done instanceof Function ? done : () => {};

        /**
         * An exception library, that Soda uses
         * @type {Exception}
         * @aggregates Exception
         */
        this.exception = exception;

        /**
         * An assertion library, that Soda uses
         * @type {Assert}
         * @aggregates Assert
         */
        this.assert = assert;

        /**
         * A Config class object, that allows for CRUD operations for "globals"
         * @type {SodaConfig}
         * @composes SodaConfig
         */
        this.config = new Config();

        var onTmpCheck = function () {
            /**
             * A console object, that Soda utilizes for logging purposes
             * @type {Console}
             * @composes Console
             */
            self.console = new Console({ log4js: self.config.get("log4js") ? self.config.get("log4js"): false });

            // Set initial options
            self.setOptions(options);

            if(self.initialized === false) {
                self.config.on("config set", (name) => {
                    if(/^console(\.\w+)*/.test(name)) self.console.setOptions(self.config.get("console"));
                });

                self.config.on("config set", (name, value) => {
                    if(name === "env") self.vars.save("_env_", value);
                    if(name === "testurl") self.vars.save("_testurl_", value);
                });
            }

            var configVals = self.config.get();

            Object.keys(configVals).forEach(key => {
                configVals[key] = key === 'proxy' ? '******' : configVals[key];
            });

            self.console.debug("Soda initialized with options:\n", configVals);

            /////////////////////////////////////////// Add library dependencies ///////////////////////////////////////////

            /**
             * An object that manages the testing variables and their life-cycle.
             * @type {Vars}
             * @memberof module.Soda.Soda
             * @composes Vars
             */
            self.vars = new Vars(self);

            /**
             * A class that will be used to generate new Tree objects, in regard to the DOM
             * @type {Tree}
             * @memberof module.Soda.Soda
             * @associates Tree
             */
            self.Tree = tree(self);

            /**
             * An object that manages loading, starting, and stopping the current Soda framework.
             * @type {Framework}
             * @memberof module.Soda.Soda
             * @composes Framework
             */
            self.framework = new Framework(self);

            /**
             * Device Interaction methods that are used to operate on the loaded device
             * @type {DeviceInteractions}
             * @memberof module.Soda.Soda
             * @composes DeviceInteractions
             */

            self.device = new DevInteractions(self);

            /**
             * Element Interaction methods that are used to operate on elements in the current DOM Tree
             * @type {ElementInteractions}
             * @memberof module.Soda.Soda
             * @composes ElementInteractions
             */
            self.element = new EleInteractions(self);

            /**
             * An object that manages Soda syntaxes, i.e. loading, and un-loading them.
             * @type {Syntax}
             * @memberof module.Soda.Soda
             * @composes Syntax
             */
            self.syntax = new Syntax(self);

            /**
             * The Action Soda uses
             * @type {Action}
             * @memberof module.Soda.Soda
             * @composes ActionManager
             */
            self.Action = action(self);

            /**
             * The assets Soda uses
             * @type {Assets}
             * @memberof module.Soda.Soda
             * @composes Assets
             */
            self.assets = new Assets(self);

            /**
             * The test runner Soda uses
             * @type {TestRunner}
             * @memberof module.Soda.Soda
             * @composes TestRunner
             */
            self.runner = new TestRunner(self);

            /**
             * The core syntax Soda uses
             * @type {CoreSyntax}
             * @memberof module.Soda.Soda
             * @aggregates CoreSyntax
             */
            self.core = coreSyntax;

            // Store the _env_ variable
            self.vars.save("_env_", self.config.get("env"), true);

            // Store the _testurl_ variable
            self.vars.save("_testurl_", self.config.get("testURL"), true);

            // Setup custom listeners
            use.sodaeach(function (listener) { listener.call(self, self); });

            // Setup custom event files
            fs.exists(nodePath.join(self.config.get("root"), "custom.js"), function (exists) {
                if(exists) {
                    try {
                        var custom = require(nodePath.join(self.config.get("root"), "custom.js"));
                        if(custom instanceof Function) custom.call(self, self);
                    }
                    catch (e) { /* No Op */ }
                }

                // Clean the temp folder
                self.cleanSodaTemp(err => {
                    /**
                    * Emitted after the Soda library is initialized
                    * @event module.SodaCore/Soda.Soda#soda initialized
                    */
                    self.emit("soda initialized");
                    self.initialized = true;
                    done.call(self, err, self);
                });
            });
        };

        self.emit('pre init', self);

        // Check that the tmp folder exists...
        fs.stat(self.config.get("temp"), (err, stat) => {
            if(err && err.name !== "EEXIST" || (stat && stat.isFile())) {
                fs.mkdir(self.config.get("temp"), err => {
                    if(err) {
                        done.call(self, err, null);
                        return;
                    }
                    onTmpCheck();
                });
            }
            else {
                onTmpCheck();
            }
        });

        return self;
    };

    /////////////////////////////////////////////////// CONSTRUCTOR ////////////////////////////////////////////////////

    if(!onInit && options instanceof Function) {
        onInit  = options;
        options = null;
    }
};

module.exports = Soda;
util.inherits(Soda, EventEmitter);
