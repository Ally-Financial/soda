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
 * @module SodaCore/Framework
 */

var EventEmitter = require('events').EventEmitter,
    util         = require("util"),
    nodePath     = require("path"),
    fs     = require("fs"),
    fsPromises = fs.promises;

/**
 * Loads and manages frameworks. A generic wrapper around each frameworks index.js module.
 * @constructor
 * @augments EventEmitter
 * @composes Instruments
 * @composes Automator
 * @composes Selenium
 * @composes Puppeteer
 * @composes Shell
 * @param {object} soda The Soda library
 */
var Framework = function (soda) {

    var self = this,
    namelessProcessTitle = null,

    /**
     * A generic "error" function used as placeholders for getTree, performElementInteraction, start, stop, and restart
     * before any framework is loaded.
     */
    noFramework = function () {
        soda.console.error("No framework loaded...");
        if(arguments.sodalast() instanceof Function) {
            arguments.sodalast().call(
                Framework,
                new soda.exception.InvalidFrameworkError("No framework loaded."),
                null
            );
        }
    },

    /**
     * A local object to store the current framework object for retrieval between modules
     * @type {Object}
     */
    framework = {
        name     : null,
        platform : null,
        version  : null,
        object   : null,
        args     : null,
        device   : null,
        started  : false,
        process  : null,

        defaultSyntaxName    : null,
        defaultSyntaxVersion : null
    };

    /**
     * When the framework process is exited, perform this function...
     * @param {Number} code The code of the exited child process
     * @param {String=} signal The signal (if one was provided) of the closed process
     */
    function frameworkExit (code, signal) {
        soda.console[code === 0 ? "log" : "error"](framework.name + " has exited with code: " + code + (signal ? " and signal " + signal : ""));
        framework.started = false;

        /**
         * Emitted when the framework instance process has exited completely
         * @event module.SodaCore/Framework.Framework#exited
         * @argument {Instruments|Automator|Selenium|Puppeteer} The framework class
         */
        self.emit("exited", framework);

        self.getTree                   = noFramework;
        self.performElementInteraction = noFramework;
        self.performDeviceInteraction  = noFramework;
        self.start                     = noFramework;
        self.stop                      = noFramework;
        self.restart                   = noFramework;
        self.build                     = noFramework;
        self.upload                    = noFramework;
        self.reset                     = noFramework;
    }

    /**
     * Validates a framework, ensuring it contains the necessary properties and methods...
     * @param {object} f The framework to validate
     */
    function validateFramework (f) {
        var err = arguments.sodaexpect("object").error,
            properties = ["name", "version", "platform", "defaultSyntaxVersion", "defaultSyntaxName"],
            methods    = f.platform === 'Rest' ? ["getTree", "start", "stop"] : ["getTree", "getOrientation", "getScreenBounds", "performElementInteraction", "performDeviceInteraction", "start", "stop", "restart", "listAvailableDevices"],
            hasAllProperties, hasAllMethods;
            
        if(err) throw err;

        hasAllProperties = properties.sodaeach(function (prop) {
            if(!f[prop] || typeof f[prop] !== "string") return false;
        });

        hasAllMethods = methods.sodaeach(function (method) {
            if(!f[method] || typeof f[method] !== "function") return false;
        });

        if(hasAllProperties === false) throw new soda.exception.InvalidFrameworkError("Framework is invalid: missing properties.");
        if(hasAllMethods    === false) throw new soda.exception.InvalidFrameworkError("Framework is invalid: missing methods."   );

        return f;
    }

    Object.defineProperties(self, {

        /**
         * The loaded framework's name
         * @type {string}
         * @memberof module.SodaCore/Framework.Framework
         */
        name: {
            enumerable: true,
            get: function () { return framework.name; }
        },

        /**
         * The loaded framework's version
         * @type {string}
         * @memberof module.SodaCore/Framework.Framework
         */
        version: {
            enumerable: true,
            get: function () { return framework.version; }
        },

        /**
         * The loaded framework's platform
         * @type {string}
         * @memberof module.SodaCore/Framework.Framework
         */
        platform: {
            enumerable: true,
            get: function () { return framework.platform; }
        },

        /**
         * The loaded framework's start arguments
         * @type {String}
         * @memberof module.SodaCore/Framework.Framework
         */
        args: {
            enumerable: true,
            get: function () { return framework.args; }
        },

        /**
         * Whether or not the current framework is started
         * @type {string}
         * @memberof module.SodaCore/Framework.Framework
         */
        started: {
            configurable: true,
            enumerable: true,
            get: function () { return framework.started; }
        },

        /**
         * The device the framework is running
         * @type {string}
         * @memberof module.SodaCore/Framework.Framework
         */
        device: {
            enumerable: true,
            get: function () { return framework.device; }
        },

        /**
         * The actual framework process instance (ChildProcess)
         * @type {object}
         * @memberof module.SodaCore/Framework.Framework
         */
        process: {
            enumerable: true,
            get: function () { return framework.process; }
        },

        /**
         * The framework's default syntax name
         * @type {object}
         * @memberof module.SodaCore/Framework.Framework
         */
        defaultSyntaxName: {
            enumerable: true,
            get: function () { return framework.defaultSyntaxName; }
        },

        /**
         * The framework's default syntax version
         * @type {object}
         * @memberof module.SodaCore/Framework.Framework
         */
        defaultSyntaxVersion: {
            enumerable: true,
            get: function () { return framework.defaultSyntaxVersion; }
        },

    });

    /**
     * Gets a list of available devices for the specified framework
     * @return {Array} A list of currently available devices
     */
    this.listAvailableDevices = function (forFramework, done) {
        try {
            var framework = (require(nodePath.join(__dirname, "..", "..", "frameworks", forFramework.toLowerCase(), "index.js")))(soda);

            framework.listAvailableDevices(done);
            framework = null;
        }
        catch(e) {
            if(done instanceof Function) done.call(null, []);
        }
    };

    /**
     * Gets a list of available devices for the specified framework
     * @return {Array} A list of currently available devices
     */
    this.findDevice = function (forFramework, device, done) {
        try {
            var framework = (require(nodePath.join(__dirname, "..", "..", "frameworks", forFramework.toLowerCase(), "index.js")))(soda);

            framework.findDevice(device, done);
            framework = null;
        }
        catch(e) {
            if(done instanceof Function) done.call(null, []);
        }
    };

    /**
     * Sets and loads the current framework
     * @param {string} name The name of the framework to load as it relates to its directory name
     * @returns {null|*}
     */
    this.load = function (name) {
        var f = null;
        if(typeof name !== "string")
            throw new soda.exception.InvalidFrameworkError("No framework specified. Framework.load expected parameter `name` to receive a string, but got " + typeof name + ".");
        try {
            f = validateFramework(require(nodePath.join(__dirname, "..", "..", "frameworks", name.toLowerCase(), "index.js"))(soda));
            
            framework = {
                name     : f.name,
                version  : f.version,
                platform : f.platform,
                object   : f,
                started  : false,

                defaultSyntaxName    : f.defaultSyntaxName,
                defaultSyntaxVersion : f.defaultSyntaxVersion
            };

            /**
             * Emitted when a new Framework is loaded
             * @event module.SodaCore/Framework.Framework#load
             * @argument {Error|null} err An error
             * @argument f The framework object
             */
            self.emit("load", null, f);
            console.log(framework.name.ucFirst + " (" + framework.platform + ")" + " v" + framework.version + " loaded");

        }
        catch (e) {
            self.emit("load", e, null);
            throw new soda.exception.InvalidFrameworkError("Couldn't load framework " + name + " because: " + e.message);
        }

        self.isSimulator = function() {
            return f.isDeviceASimulator();
        };

        /**
         * Gets the current device orientation
         * @memberof module.SodaCore/Framework.Framework
         * @param {function} complete A callback for completion
         */
        self.getOrientation = function (complete) {
            /**
             * Emitted when the device orientation is requested
             * @event module.SodaCore/Framework.Framework#get orientation
             * @argument {Error|null} err An error
             * @argument f The framework object
             */
            self.emit("get orientation", null, f);
            return f.getOrientation(function (err, orientation) {

                /**
                 * Emitted when the device orientation request is finished
                 * @event module.SodaCore/Framework.Framework#got orientation
                 * @argument {Error|null} err An error
                 * @argument f The framework object
                 */
                self.emit("got orientation", null, f);
                if(complete instanceof Function) complete(err, orientation);
            });
        };

        /**
         * Gets the current device screen bounds as an [width, height] array
         * @memberof module.SodaCore/Framework.Framework
         * @param {function} complete A callback for completion
         */
        self.getScreenBounds = function (complete) {
            /**
             * Emitted when the device screen bounds are requested
             * @event module.SodaCore/Framework.Framework#get screen bounds
             * @argument {Error} err An error, if one occured while trying to get the screen bounds
             * @argument {Automator|Instruments|Selenium|Puppeteer} f The framework object
             */
            self.emit("get screen bounds", null, f);
            return f.getScreenBounds(function (err, bounds) {

                /**
                 * Emitted when the device screen bound request is finished
                 * @event module.SodaCore/Framework.Framework#got screen bounds
                 * @argument {Error} err An error, if one occured while trying to get the screen bounds
                 * @argument {Automator|Instruments|Selenium|Puppeteer} f The framework object
                 */
                self.emit("got screen bounds", null, f);
                if(complete instanceof Function) complete(err, bounds);
            });
        };

        /**
         * Gets the DOM tree using the current framework
         * @memberof module.SodaCore/Framework.Framework
         * @param {function=} complete A callback for completion
         * @param {boolean} dontInstantiate Return a new Tree item, or just the response?
         */
        self.getTree = function (complete, dontInstantiate, times) {
            soda.console.debug(f.name + ": Getting element tree...");
            times = times || 0;

            f.getTree(function (err, tree) {
                if(err) {
                    complete.call(self, err, null);
                    soda.console.error(f.name + ": Tree retrieval failed...\n" + (err instanceof Error ? err.message : err));
                    return;
                }

                try {
                    if(typeof tree === "string") tree = JSON.parse(tree);
                }
                catch (e) {
                    if(++times < 3) {
                        self.getTree.apply(self, complete, dontInstantiate, times);
                    }
                    else {
                        if (complete instanceof Function)
                            complete.call(self, new Error("Unable to get tree after 3 attempts. Framework tree retrieval error."), null);
                    }
                    return;
                }

                tree = dontInstantiate ? tree : new soda.Tree(tree);
                soda.console.debug(f.name + ": Element tree retrieval successful...");

                if(!dontInstantiate) {
                    /**
                     * Sets the update function for this tree...
                     * @memberof module.SodaCore/Tree.TreeWrapper.Tree
                     * @param {function=} complete A callback for completion
                     */
                    tree.update = function (complete) {
                        var err = arguments.sodaexpect("function|undefined").error;
                        if (err) throw err;

                        self.getTree(function (err, newTree) {
                            if (err) {
                                soda.console.error(f.name + ": Tree retrieval failed...\n" + (err instanceof Error ? err.message : err));
                                if (complete) complete.call(this, err, null);
                                return;
                            }

                            tree.contents = newTree;
                            if (complete instanceof Function) complete.call(this, null, tree);
                        }, true);
                    };
                }

                if(soda.config.get("SSOnDOM")) {
                    var dir = nodePath.join(soda.config.get("SSOnDOMDir"), soda.config.get("platform"), soda.config.get("module"), soda.config.get("test"));
                    var hash = tree.hash || new soda.Tree(tree).hash,
                        hashes = soda.config.get("treeHashes");

                    soda.console.debug("Got tree with hash: " + hash);
                    if(!hashes[hash]) {
                        hashes[hash] = hash;
                        fsPromises.mkdir(dir, { recursive: true }).then( made => {
                            var dest = nodePath.join(dir, Date.now().toString() + "-" + hash + ".png");
                            soda.config.set("treeHashes", hashes);
                            soda.device.captureScreen({ filename: Date.now().toString() + "-" + hash, destination: dest }, function (err) {
                                if(err) soda.console.warn(err.message);
                                if(complete instanceof Function) complete.call(self, err, tree);
                            });
                        });
                    }
                    else {
                        if(complete instanceof Function) complete.call(self, err, tree);
                    }
                }
                else {
                    if(complete instanceof Function) complete.call(self, err, tree);
                }
            });
        };

        /**
         * Performs a user interaction on an element using the current framework
         * @memberof module.SodaCore/Framework.Framework
         * @param {string} interaction The name of the element interaction to perform
         * @param {Array} elems An array of elements to perform the interaction upon
         * @param {object|function} options Options to be used to perform the interaction
         * @param {function=} complete A callback for completion
         */
        self.performElementInteraction = function (interaction, elems, options, complete) {
            soda.console.debug(f.name + ": Performing element interaction `" + interaction + "`...");
            var err = arguments.sodaexpect("string", "object|undefined|null", "object|string|undefined", "function|undefined").error;

            if(!complete && options instanceof Function) {
                complete = options;
                options  = {};
            }

            if(err) {
                soda.console.error(f.name + ": Performing element interaction `" + interaction + "`...with error `" + err + "`");
                if(complete) complete.call(self, err, false);
                return;
            }

            if(!(elems instanceof Array)) elems = [elems];

            f.performElementInteraction(interaction, elems, options, function (err, performed) {
                /**
                 * Emitted when an element interaction has been performed
                 * @event module.SodaCore/Framework.Framework#performed element interaction
                 * @argument {Error} err An error, if one occured while trying to get the screen bounds
                 * @argument {String} interaction The name of the interaction performed
                 * @argument {Array<Object>} elems The elements the interaction was performed upon
                 * @argument {Object} options The options used in the interaction
                 */
                self.emit("performed element interaction", err, interaction, elems, options);

                if(err) {
                    soda.console.error(f.name + ": Element interaction failed");
                    if(complete) complete.call(self, err, false);
                    return;
                }

                soda.console.debug(f.name + ": Element interaction returned: " + performed);
                if(complete) complete.call(self, err, performed);
            });
        };

        /**
         * Performs a device interaction on the loaded device using the current framework
         * @memberof module.SodaCore/Framework.Framework
         * @param {string} interaction The name of the element interaction to perform
         * @param {object|function} options Options to be used to perform the interaction
         * @param {function=} complete A callback for completion
         */
        self.performDeviceInteraction = function (interaction, options, complete) {
            soda.console.debug(f.name + ": Performing device interaction `" + interaction + "`...");
            var err = arguments.sodaexpect("string", "object|string|undefined", "function|undefined").error;

            if(!complete && options instanceof Function) {
                complete = options;
                options  = {};
            }

            if(err) {
                if(complete) complete.call(self, err, false);
                return;
            }

            f.performDeviceInteraction(interaction, options, function (err, performed) {
                /**
                 * Emitted when a device interaction has been performed
                 * @event module.SodaCore/Framework.Framework#performed device interaction
                 * @argument {Error} err An error, if one occured while trying to get the screen bounds
                 * @argument {String} interaction The name of the interaction performed
                 * @argument {Object} options The options used in the interaction
                 */
                self.emit("performed device interaction", err, interaction, options);

                if(err) {
                    soda.console.error(f.name + ": Device interaction " + interaction + " failed!");
                    if(complete) complete.call(self, err, false);
                    return;
                }

                soda.console.debug(f.name + ": Device interaction `" + interaction + "` completed successfully");
                if(complete) complete.apply(self, arguments);
            });
        };

        /**
         * Starts a framework using the provided arguments
         * @memberof module.SodaCore/Framework.Framework
         */
        self.start = function () {
            var args         = arguments.getArray,
                originalArgs = arguments.getArray;

            console.log("Starting " + framework.name + " on device " + args[0] + "...");

            /**
             * Emitted just before a framework is started
             * @event module.SodaCore/Framework.Framework#start
             * @argument {Object} f The framework object
             */
            self.emit("start", f);

            if(args.sodalast() instanceof Function) {
                var complete = args.sodalast();
                args[args.length - 1] = function (err, started, instance) {
                    if(instance && typeof instance === "object" && instance.on instanceof Function)
                        instance.on("exit", frameworkExit);

                    if(err) {
                        soda.console.error("Framework " + framework.name.ucFirst + " failed to start...");
                    }
                    else {
                        soda.config.set("resetDevice", false);
                        framework.args    = originalArgs;
                        framework.device  = args[0];
                        framework.process = instance;

                        if(!soda.config.get("noTitle")) {
                            namelessProcessTitle = process.title;
                            process.title += " - " + framework.name.ucFirst + " (" + framework.device + ")";
                        }

                        /**
                         * Emitted just after a framework is started
                         * @event module.SodaCore/Framework.Framework#started
                         * @argument {boolean} started True if the framework was successfully started, false otherwise
                         * @argument {Automator|Instruments|Selenium|Puppeteer} f The framework object
                         */
                        self.emit("started", started, f);
                        console.log("Framework " + framework.name.ucFirst + " started successfully!");
                    }
                    complete.apply(self, arguments);
                };
            }
            else {
                args.push(function (err, started, instance) {
                    if(err) return soda.console.error(err.message);
                    soda.config.set("resetDevice", false);

                    if(typeof instance === "object" && instance.on instanceof Function)
                        instance.on("exit", frameworkExit);

                    framework.args    = originalArgs;
                    framework.device  = args[0];
                    framework.process = instance;

                    self.emit("started", started, f);
                    console.log("Framework " + framework.name.ucFirst + " started successfully!");
                });
            }
            
            // Defer the start of the framework, to the next event loop tick.
            process.nextTick(() => f.start.apply(null, args));
            return self;
        };

        /**
         * Stops a framework
         * @memberof module.SodaCore/Framework.Framework
         */
        self.stop = function () {
            soda.console.warn("Stopping " + framework.name + " framework...");

            /**
             * Emitted just before a framework is stopped
             * @event module.SodaCore/Framework.Framework#stop
             * @argument {Automator|Instruments|Selenium|Puppeteer} f The framework object
             */
            self.emit("stop", f);
            var args = arguments.getArray;

            if(args.sodalast() instanceof Function) {
                var complete = args.sodalast();
                args[args.length - 1] = function (err, stopped) {
                    if(namelessProcessTitle) process.title = namelessProcessTitle;
                    /**
                     * Emitted just after a framework is stopped
                     * @event module.SodaCore/Framework.Framework#stopped
                     * @argument {boolean} stopped True if the framework was successfully stopped, false otherwise
                     * @argument {Automator|Instruments|Selenium|Puppeteer} f The framework object
                     */
                    self.emit("stopped", stopped, f);
                    complete.apply(self, arguments);
                };
            }
            else {
                args.push(function (err, stopped) {
                    if(namelessProcessTitle) process.title = namelessProcessTitle;
                    self.emit("stopped", stopped, f);
                });
            }

            f.stop.apply(null, args);
            return self;
        };

        /**
         * Performs a device interaction on the loaded device using the current framework
         * @memberof module.SodaCore/Framework.Framework
         * @param {string} interaction The name of the element interaction to perform
         * @param {object|function} options Options to be used to perform the interaction
         * @param {function=} complete A callback for completion
         */
        self.restartApplication = function (complete) {
            soda.console.debug("Performing restart application...");

            f.restartApplication(function (err, performed) {
                soda.console.debug("Restart applciation completed successfully");
                if(complete) complete.apply(self, arguments);
            });
        };

        /**
         * Restarts a framework by first shutting it down, then uses the last start options to re-start it.
         * @memberof module.SodaCore/Framework.Framework
         */
        self.restart = function () {
            soda.console.warn("Restarting " + framework.name + " framework...");

            /**
             * Emitted just before a framework is restarted
             * @argument {Automator|Instruments|Selenium|Puppeteer} f The framework object
             * @event module.SodaCore/Framework.Framework#restart
             */
            self.emit("restart", f);
            f.restart.apply(null, arguments);

            /**
             * Emitted just after a framework is restarted
             * @event module.SodaCore/Framework.Framework#restarted
             * @argument {Automator|Instruments|Selenium|Puppeteer} f The framework object
             */
            self.emit("restarted", f);
        };

        /**
         * Builds a project via the framework
         * @memberof module.SodaCore/Framework.Framework
         */
        self.build = function () {
            var args          = arguments.getArray,
                count         = 0,
                listenerCount = self.listenerCount("build");

            var done = function (err) {
                if(err) console.error(err);
                if(++count === listenerCount) {
                    f.build.apply(f, args);
                    /**
                     * Emitted just after a framework is built
                     * @event module.SodaCore/Framework.Framework#post build
                     */
                    self.emit("post build", f, args);
                }
            };

            /**
             * Emitted just before a framework is built
             * @event module.SodaCore/Framework.Framework#build
             */
            self.emit("build", f, args, done);
            if(listenerCount === 0) {
                count = -1;
                done(null);
            }
        };

        /**
         * Uploads a project via the framework
         * @memberof module.SodaCore/Framework.Framework
         */
        self.upload = function () {
            var args          = arguments.getArray,
                count         = 0,
                listenerCount = self.listenerCount("upload");

            var done = function (err) {
                if(err) console.error(err);
                if(++count === listenerCount) {
                    f.upload.apply(f, args);
                    /**
                     * Emitted just after a framework is built
                     * @event module.SodaCore/Framework.Framework#post build
                     */
                    self.emit("post upload", f, args);
                }
            };

            /**
             * Emitted just before a framework is built
             * @event module.SodaCore/Framework.Framework#build
             */
            self.emit("upload", f, args, done);
            if(listenerCount === 0) {
                count = -1;
                done(null);
            }
        };

        /**
         * Reset a simulator via the framework
         * @memberof module.SodaCore/Framework.Framework
         */
        self.reset = f.restart;

        return self;
    };

    /**
     * Get's the device orientation
     * @type {function}
     */
    this.getOrientation = noFramework;

    /**
     * Get's the device screen size
     * @type {function}
     */
    this.getScreenBounds = noFramework;

    /**
     * Get's the element tree
     * @type {function}
     */
    this.getTree = noFramework;

    /**
     * Perform an interaction on an element
     * @type {function}
     */
    this.performElementInteraction = noFramework;

    /**
     * Perform an interaction on the device
     * @type {function}
     */
    this.performDeviceInteraction = noFramework;

    /**
     * Start the framework
     * @type {function}
     */
    this.start = noFramework;

    /**
     * Stop the currently loaded framework
     * @type {function}
     */
    this.stop = noFramework;

    /**
     * Restart the currently loaded framework
     * @type {function}
     */
    this.restart = noFramework;

    /**
     * Call the currently loaded framework's build method
     * @type {function}
     */
    this.build = noFramework;

    /**
     * Call the currently loaded framework's upload method
     * @type {function}
     */
    this.upload = noFramework;

    /**
     * Call the framework's reset method
     * @type {function}
     */
    this.reset = noFramework;

    // Modify the started property when the framework starts and stops
    self.on("started", function () {
        framework.started = true;
    });

    self.on("stopped", function () {
        framework.started = false;
    });
};

util.inherits(Framework, EventEmitter);
module.exports = Framework;
