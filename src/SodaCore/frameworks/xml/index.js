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
 * @module XML
 * @description The XML framework for the Soda Test Engine
 */

var path = require("path");

module.exports = function (soda) {
    /**
     * The XML framework driver for Soda
     * @constructor
     */
    var XML = function (soda) {
        var self   = this,

        /**
         * @composes XMLDriver
         * @type XML
         */
        driver = new (require(path.join(__dirname, "imports", "Driver.js")))(soda),

        /**
         * @composes Tree
         */
        Tree = new (require("./imports/Tree.js"))(soda);

        /**
         * The framework name
         * @type {String}
         */
        this.name = "XML";

        /**
         * The framework platform
         * @type {String}
         */
        this.platform = "XML";

        /**
         * The platform version
         * @type {String}
         */
        this.version  = "1.0";

        this.defaultSyntaxVersion = "1.0";
        this.defaultSyntaxName    = "XML";

        /**
         * XML doesn't support this method, and it will just call the completion callback with an error
         * @param  {Function} done A callback for completion
         * @return {XML} The current XML framework instance
         */
        this.build = function (done) {
            if(done instanceof Function) done(new Error("The XML Soda driver does not implement `Framework.build`"), null);
            return self;
        };

        /**
         * Starts the XML framework driver
         * @param {object|function} options Command line flags
         * @param {function} done A callback for completion
         * @return {XML} The current XML framework instance
         */
        this.start = function (options, done) {

            if(arguments.sodalast() instanceof Function) done = arguments.sodalast();

            driver.start(
                typeof options === "object" ? options : {},
                function (err, started, d) {
                    if(err) {
                        if(done instanceof Function) done(err, false, null);
                        return;
                    }

                    if(!started) {
                        if(done instanceof Function) done(new Error("Unable to start the XML framework"), false, null);
                        return;
                    }

                    soda.config.set("findElementRetries", 120);

                    done.call(self, null);
                }
            );
            return self;
        };

        /**
         * Stops the XML framework
         * @param {function=} done A callback for completion
         * @return {XML} The current XML framework instance
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
                }
            });
            return self;
        };

        /**
         * Restarts the XML framework using the initial starting arguments
         * @param {function=} done A callback for completion
         * @return {XML} The current XML framework instance
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
         * @return {XML} The current XML framework instance
         */
        this.performElementInteraction = function (interaction, elems, options, done) {
            if(driver) {
                if(done instanceof Function) done(new Error("Unknown or unsupported element interaction `" + interaction + "`"), null);
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
         * @return {XML} The current XML framework instance
         */
        this.performDeviceInteraction = function (interaction, options, done) {
            if(driver) {
                switch(interaction) {
                    case "captureScreen":
                        driver.takeScreenshot(options, done);
                        break;
                    case "getVariable":
                        driver.getVariable(options, done);
                        break;
                    case "close":
                        driver.close(options, done);
                        break;
                    case "reset":
                        driver.reset(options, done);
                        break;
                    case "post":
                        driver.post(options.url, options.headers, options.body, done);
                        break;
                    case "get":
                        driver.get(options.url, options.headers, options.body, done);
                        break;
                    case "delete":
                        driver.del(options.url, options.headers, options.body, done);
                        break;
                    case "deleteAllCookies":
                        driver.deleteAllCookies(done);
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
         * Gets the device orientation<br>
         * Results will always be 1, since *most* monitors cannot rotate
         * @param {function=} done A callback for completion
         * @return {XML} The current XML framework instance
         */
        this.getOrientation = function (done) {
            if(done instanceof Function) done(null, 1);
            return self;
        };

        /**
         * Gets the DOM tree from XML. First it sends a request to build the tree to XML, then when XML
         * responds, it calls the completion callback with the results.
         * @param {{}|function} options Options to pass to XML
         * @param {function=} done A callback for completion
         * @return {XML} The current XML framework instance
         */
         this.getTree = function (options, complete) {
           if(!complete && options instanceof Function) {
               complete     = options;
               options  = undefined;
           }

           if(driver) {
             driver.getSourceTree(function(err, result) {
                 var tree = Tree.buildTree(result, {});

                   if (tree === false && complete) {
                       complete(new Error("Could not get tree from Instruments"), false);
                   }

                   if (complete) complete(null, tree);

                 return tree;
               });
           }
           else {
               if(complete instanceof Function)
                   complete(new Error("Cannot get element tree, since the driver hasn't been started yet."), false);
           }

           return self;
         };
    };

    return Object.freeze(new XML (soda));
};
