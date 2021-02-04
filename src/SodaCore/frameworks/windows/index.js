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
 * @module Windows
 * @description The Windows framework for the Soda Test Engine
 */

var path     = require("path");

module.exports = function (soda) {
    /**
     * The Windows framework driver for Soda
     * @constructor
     */
    var Windows = function (soda) {
        var self   = this,

        /**
         * @composes WindowsDriver
         * @type Windows
         */
        driver = new (require(path.join(__dirname, "imports", "Driver.js")))(soda),
        /**
         * @composes WindowsConfig
         * @type Windows
         */
        config = new (require(path.join(__dirname, "imports", "Config.js")))(soda);

        this.name     = "Windows";
        this.platform = "Windows";
        this.version  = "1.0";

        this.defaultSyntaxVersion = "1.0";
        this.defaultSyntaxName    = "windows";
        this.applicationPath      = "";
        this.args                 = [];

        /**
         * Windows does not currently support this method, and it will just call the completion callback with an error
         * @param  {Function} done A callback for completion
         * @return {Selenium} The current Selenium framework instance
         */
        this.build = function (done) {
            if(done instanceof Function) done(new Error("The windows Soda driver does not implement `Framework.build`"), null);
            return self;
        };

        /**
         * Lists all available applications
         * @param {Function} done A callback for completion
         * @return {Array} A list of available browsers
         */
        this.listAvailableDevices = function (done) {
            var appsAvailable = [];

            driver.availableApplications(function (result) {
                appsAvailable = result;

                (appsAvailable || []).sort(function (a, b) { return a < b ? -1 : a > b ? 1 : 0; });
                if(done instanceof Function) done.call(null, appsAvailable);
            });
        };

        /**
         * Starts the Selenium framework driver
         * @param {string} applicationPath The application path of the app to start
         * @param {object} arguments The arguments to pass to the application
         * @param {function} done A callback for completion
         * @return {Selenium} The current Selenium framework instance
         */
        this.startApplication = function (application, applicationPath, args, done) {
            if(arguments.sodalast() instanceof Function) done = arguments.sodalast();
            self.application = application;
            self.applicationPath = applicationPath;
            self.args = args;

            var formattedArgs = [];

            for (var i = 0; i < args.length; i++) {
                formattedArgs.push({ "arg": "\"" + args[i] + "\""});
            }

            driver.startApplication(function(response) {
                if (response.result === "success") {
                    done.call(this, null, true);
                }
                else {
                    done.call(this, new Error("Could not start application:  `" + applicationPath + "`"), false);
                }
            }, applicationPath, formattedArgs);

            return self;
        };

        /**
         * Starts the Selenium framework driver
         * @param {string} applicationPath The application path of the app to start
         * @param {object} arguments The arguments to pass to the application
         * @param {function} done A callback for completion
         * @return {Selenium} The current Selenium framework instance
         */
        this.start = function (application, applicationPath, args, done) {
            self.application = application;
            self.applicationPath = applicationPath;
            self.args = args;
            soda.config.set("findElementRetries", config.FIND_ELEMENT_COMMAND_COUNT);
            done.call(this, null, true);
            return self;
        };

        /**
         * Stops the Windows framework
         * @param {function=} done A callback for completion
         * @return {Selenium} The current Selenium framework instance
         */
        this.stop = function (done) {
            done(null, true);
            return self;
        };

        /**
         * Restarts the Selenium framework using the initial starting arguments
         * @param {function=} done A callback for completion
         * @return {Selenium} The current Selenium framework instance
         */
        this.restart = function (done) {
            self.stop(function(err, res) {
                self.start(self.application, self.applicationPath, self.args, done);
            });
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
            if(driver) {
                switch(interaction) {
                    case "sendKeys":
                        elems.sodaeach(function(elem) {
                            driver.sendApplicationKeys(done, elem.id, JSON.stringify(options.value));
                        });
                        break;

                    case "setValue":
                        elems.sodaeach(function(elem) {
                            driver.setByIdentifer(done, elem.id, options.value.toString());
                        });
                        break;

                    case "typeIn":
                        elems.sodaeach(function(elem) {
                            driver.typeInIdentifer(done, elem.id, options.value.toString());
                        });
                        break;

                    case "click":
                    case "tap":
                        elems.sodaeach(function(elem) {
                            driver.clickApplicationIdentifer(done, elem.id);
                        });

                        break;

                    case "scrollIntoView":
                        driver.scrollIntoView(elems, options, done);
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
            if(driver) {
                switch(interaction) {
                    case "startApp":
                        driver.startApplication(done, options.path, options.args);
                        break;
                    case "startAppAndWait":
                        driver.startApplicationAndWait(done, options.path, options.args);
                        break;
                    case "captureScreen":
                        driver.takeScreenshot(done);
                        break;

                    case "captureHeader":
                        driver.captureHeader(options, done);
                        break;

                    case "close":
                        driver.close(options, done);
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

            if(driver) {
                driver.getDesktopTree(done);
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
            if(driver) {
                driver.getSize(done);
            }
            else {
                if(done instanceof Function)
                    done(new Error("Cannot get window size, since the driver hasn't been started yet."), null);
            }

            return self;
        };
    };

    return new Windows (soda);
};
