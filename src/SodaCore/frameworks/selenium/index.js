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
 * @module Selenium
 * @description The Web Selenium framework for the Soda Test Engine
 */

var path = require("path"),
    exec = require(path.join(__dirname, "..", "..", "..", "SodaCommon", "Exec")),
    os   = require("os");

module.exports = function (soda) {
    /**
     * The Selenium framework driver for Soda
     * @constructor
     */
    var Selenium = function (soda) {
        var self   = this,

            /**
             * @composes SeleniumDriver
             * @type Selenium
             */
            driver = new (require(path.join(__dirname, "imports", "Driver.js")))(soda),
            Driver = null;

        /**
         * The framework name
         * @type {String}
         */
        this.name = "Selenium";

        /**
         * The framework platform
         * @type {String}
         */
        this.platform = "Web";

        /**
         * The platform version
         * @type {String}
         */
        this.version  = "1.0";

        /**
         * The default syntax version
         * @type {String}
         */
        this.defaultSyntaxVersion = "1.0";

        /**
         * The default syntax name
         * @type {String}
         */
        this.defaultSyntaxName    = "web";

        /**
         * Selenium doesn't support this method, and it will just call the completion callback with an error
         * @param  {Function} done A callback for completion
         * @return {Selenium} The current Selenium framework instance
         */
        this.build = function (done) {
            if(done instanceof Function) done(new Error("The selenium Soda driver does not implement `Framework.build`"), null);
            return self;
        };

        /**
         * Lists all available browsers
         * @param {Function} done A callback for completion
         * @return {Array} A list of available browsers
         */
        this.listAvailableDevices = function (done) {
            var appExists = ["phantom"], totalReceived = 0,
                browsers  = ["chrome", "firefox", "safari", "internet explorer"],
                useList   = browsers;
            // Parallel Arrays, use "useList" with modified browser paths for Windows
            if(os.platform() === "win32") {
                useList = ["Google", "Mozilla Firefox", "Safari", "Internet Explorer"];
            }

            for(var i = 0; i < browsers.length; i++) {
      				exec.appExists(useList[i], function (exists) {
      					if(exists) appExists.push(useList[this]);
      					if(++totalReceived === browsers.length) {
      						appExists.sort(function (a, b) { return a < b ? -1 : a > b ? 1 : 0; });
      						if(done instanceof Function) done.call(appExists, appExists);
      					}
      				}.bind(i)); // jshint ignore:line
      			}
        };

        /**
         * Starts the Selenium framework driver
         * @param {string} browser The name of the browser to start
         * @param {string} initialURL The initial URL to navigate to
         * @param {object|function} options Command line flags
         * @param {function} done A callback for completion
         * @return {Selenium} The current Selenium framework instance
         */
        this.start = function (browser, initialURL, options, done) {
            if(arguments.sodalast() instanceof Function) done = arguments.sodalast();

            driver.start(
                typeof browser === "string" ? browser : "chrome",
                typeof options === "object" ? options : {},
                function (err, started, d) {
                    if(err) {
                        if(done instanceof Function) done(err, false, null);
                        return;
                    }

                    if(!started) {
                        if(done instanceof Function) done(new Error("Unable to start the Selenium framework"), false, null);
                        return;
                    }

                    soda.config.set("findElementRetries", 120);
                    Driver = d;

                    var postGoto = function (err) {
                        if(done instanceof Function) {
                            if(err) return done(err, false, null);
                            return done(null, true, Driver.instance);
                        }
                    };

                    if(initialURL) {
                        d.goto(initialURL, postGoto);
                    }
                    else {
                        d.goto("about:blank", postGoto);
                    }
                }
            );
            return self;
        };

        /**
         * Stops the Selenium framework
         * @param {function=} done A callback for completion
         * @return {Selenium} The current Selenium framework instance
         */
        this.stop = function (done) {
            driver.stop(function (res) {
                if(done instanceof Function) {
                    if(res instanceof Error) {
                        done(res, false);
                    }
                    else {
                        done(null, true);
                    }

                    Driver = null;
                }
            });
            return self;
        };

        /**
         * Restarts the Selenium framework using the initial starting arguments
         * @param {function=} done A callback for completion
         * @return {Selenium} The current Selenium framework instance
         */
        this.restart = function (done) {
            driver.restart(done);
            return self;
        };

        /**
         * Perform a user interaction on an element in the current DOM-Tree
         * @param {string} interaction The interaction name
         * @param {Array} elems An array of elements
         * @param {object} options Options
         * @param {function=} done A callback for completion
         * @return {Selenium} The current Selenium framework instance
         */
        this.performElementInteraction = function (interaction, elems, options, done) {
            if(Driver) {
                switch(interaction) {
                    case "setValue":
                        Driver.setValue(elems, options, done);
                        break;

                    case "click":
                    case "tap":
                        Driver.click(elems, options, done);
                        break;

                    case "scrollToVisible":
                        Driver.scrollToVisible(elems, options, done);
                        break;

                    default:
                        if(done instanceof Function) done(new Error("Unknown or unsupported element interaction `" + interaction + "`"), null);
                }
            }
            else {
                if(done instanceof Function)
                    done(new Error("Cannot perform element interaction, since the driver hasn't been started yet."), false);
            }
            return self;
        };

        /**
         * Perform a user interaction on an element in the current DOM-Tree
         * @param {string} interaction The interaction name
         * @param {object} options Options to pass onto Instruments
         * @param {function=} done A callback for completion
         * @return {Selenium} The current Selenium framework instance
         */
        this.performDeviceInteraction = function (interaction, options, done) {
            if(Driver) {
                switch(interaction) {
                    case "captureScreen":
                        Driver.takeScreenshot(options, done);
                        break;

                    case "captureHeader":
                        Driver.captureHeader(options, done);
                        break;

                    case "forward":
                        Driver.forward(options, done);
                        break;

                    case "resizeWindow":
                        Driver.resizeWindow(options.frame, done);
                        break;

                    case "maximizeWindow":
                        Driver.maximizeWindow(options, done);
                        break;

                    case "getVariable":
                        Driver.getVariable(options, done);
                        break;

                    case "back":
                        Driver.back(options, done);
                        break;

                    case "deleteAllCookies":
                        Driver.deleteAllCookies(done);
                        break;

                    case "goto":
                        Driver.goto(options.url, done);
                        break;

                    case "reload":
                        Driver.reload(options, done);
                        break;

                    case "close":
                        Driver.close(options, done);
                        break;

                    case "reset":
                        Driver.reset(done);
                        break;

                    case "switchToFrame":
                        Driver.switchToFrame(options, done);
                        break;

                    case "executeScript":
                        Driver.performScript(options.executeScript, done);
                        break;

                    case "executeScriptWithString":
                        Driver.performScriptWithString(options, done);
                        break;

                    default:
                        if(done instanceof Function) done(new Error("Unsupported or unknown device interaction `" + interaction + "`"), null);
                }
            }
            else {
                if(done instanceof Function)
                    done(new Error("Cannot perform device interaction, since the driver hasn't been started yet."), false);
            }
            return self;
        };

        /**
         * Gets the DOM tree from Instruments. First it sends a request to build the tree to instruments, then when instruments
         * responds, it calls the completion callback with the results.
         * @param {{}|function} options Options to pass to Selenium
         * @param {function=} done A callback for completion
         * @return {Selenium} The current Selenium framework instance
         */
        this.getTree = function (options, done) {

            if(!done && options instanceof Function) {
                done     = options;
                options  = undefined;
            }

            if(Driver) {
                console.log("About to get SourceTree");
                Driver.getSourceTree("body", done);
            }
            else {
                if(done instanceof Function)
                    done(new Error("Cannot get element tree, since the driver hasn't been started yet."), false);
            }
            return self;
        };

        /**
         * Gets the device orientation<br>
         * Results will always be 1, since *most* monitors cannot rotate
         * @param {function=} done A callback for completion
         * @return {Selenium} The current Selenium framework instance
         */
        this.getOrientation = function (done) {
            if(done instanceof Function) done(null, 1);
            return self;
        };

        /**
         * Gets the device orientation<br>
         * Results will always be 1, since *most* monitors cannot rotate
         * @param {function=} done A callback for completion
         * @return {Selenium} The current Selenium framework instance
         */
        this.getScreenBounds = function (done) {
            if(Driver) {
                Driver.getSize(done);
            }
            else {
                if(done instanceof Function)
                    done(new Error("Cannot get window size, since the driver hasn't been started yet."), null);
            }

            return self;
        };
    };

    return Object.freeze(new Selenium (soda));
};
