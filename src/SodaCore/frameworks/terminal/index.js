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
 * @module Shell
 */

var path  = require("path"),
    os       = require('os').platform(),
    spawn = require("child_process").spawn;

module.exports = function (soda) {
    /**
     * The Shell framework driver for Soda
     * @constructor
     */
    var Shell = function (soda) {

        var self    = this,
            proc    = null,
            started = false,
            lastStartOptions,

            history = {
                stdout: {
                    id               : "root:0",
                    type             : "root",
                    name             : "stdout-root",
                    label            : "stdout-root",
                    value            : "stdout-root",
                    rect             : {
                        origin : {
                            x : 0,
                            y : 0
                        },
                        size   : {
                            width  : 0,
                            height : 0
                        }
                    },
                    hitpoint: {
                        x: 0,
                        y: 0
                    },
                    enabled          : true,
                    visible          : true,
                    hasKeyboardFocus : false,
                    valid            : true,
                    children         : {},
                    index            : 0,
                    parent           : null
                },
                stderr: {
                    id               : "root:1",
                    type             : "root",
                    name             : "stderr-root",
                    label            : "stderr-root",
                    value            : "stderr-root",
                    rect             : {
                        origin : {
                            x : 0,
                            y : 0
                        },
                        size   : {
                            width  : 0,
                            height : 0
                        }
                    },
                    hitpoint: {
                        x: 0,
                        y: 0
                    },
                    enabled          : true,
                    visible          : true,
                    hasKeyboardFocus : false,
                    valid            : true,
                    children         : {},
                    index            : 0,
                    parent           : null
                }
            };

        this.name     = "Shell";
        this.platform = os;
        this.version  = "1.0";

        this.defaultSyntaxVersion = "1.0";
        this.defaultSyntaxName    = "console";

        /**
         * Selenium doesn't support this method, and it will just call the completion callback with an error
         * @param  {Function} done A callback for completion
         * @return {Shell} The current Shell framework instance
         */
        this.build = function (done) {
            if(done instanceof Function) done(new Error("The Shell Soda driver does not implement `Framework.build`"), null);
            return self;
        };

        /**
         * Lists all available browsers
         * @param {Function} done A callback for completion
         * @return {Array} A list of available browsers
         */
        this.listAvailableDevices = function (done) {
            var appExists = [];

            if (os === "win32" || os === "win64") {        
                appExists = ["cmd", "powershell"];
            }
            else {
                appExists = ["sh", "bash"];
            }

            if(done instanceof Function) done.call(self, appExists);
        };

        /**
         * Starts the Shell framework driver
         * @param {object|function} options to start the Shell process with
         * @param {function} done A callback for completion
         * @return {Shell} The current Shell framework instance
         */
        this.start = function (options, done) {
            if(started === false) {
                try {
                    if(arguments.sodalast() instanceof Function) done = arguments.sodalast();

                    if(typeof options !== "object") options = {};
                    options.stdio = ['pipe', 'pipe', 'pipe'];

                    proc = spawn(options.shell, ['-v'], options);

                    proc.stdout.on("data", function (data) {
                        soda.console.comment(data.toString('utf-8').replace(/\n$/, ''));
                    });

                    proc.stderr.on("data", function (data) {
                        soda.console.comment(data.toString('utf-8').replace(/\n$/, ''));
                    });

                    proc.stderr.on("close", function () {
                        started = false;
                    });

                    proc.stdin.setEncoding('utf-8');
                    lastStartOptions = options;
                }
                catch (e) {
                    if(done instanceof Function) done.call(self, e, false, null);
                }
            }

            if(done instanceof Function) done.call(self, null, true, proc);
            return self;
        };

        /**
         * Stops the Selenium framework
         * @param {function=} done A callback for completion
         * @return {Shell} The current Shell framework instance
         */
        this.stop = function (done) {
            if(started) {
                proc.kill('SIGINT');
                if(done instanceof Function) done.call(self, null);
            }
            else {
                if(done instanceof Function) done.call(self, null);
            }
            return self;
        };

        /**
         * Restarts the Shell framework using the initial starting arguments
         * @param {function=} done A callback for completion
         * @return {Shell} The current Shell framework instance
         */
        this.restart = function (done) {
            self.stop(function () {
                self.start.apply(self, [lastStartOptions, done]);
            });
            return self;
        };

        /**
         * Perform a user interaction on an element in the current DOM-Tree
         * @param {string} interaction The interaction name
         * @param {Array} elems An array of elements
         * @param {object} options Options
         * @param {function=} done A callback for completion
         * @return {Shell} The current Shell framework instance
         */
        this.performElementInteraction = function (interaction, elems, options, done) {
            return self;
        };

        /**
         * Perform a device interaction
         * @param {string} interaction The interaction name
         * @param {object} options Options to pass onto Instruments
         * @param {function=} done A callback for completion
         * @return {Shell} The current Shell framework instance
         */
        this.performDeviceInteraction = function (interaction, options, done) {
            return self;
        };

        /**
         * Gets the DOM tree from Shell.
         * responds, it calls the completion callback with the results.
         * @param {{}|function} options Options to pass to instruments
         * @param {function=} done A callback for completion
         * @return {Shell} The current Shell framework instance
         */
        this.getTree = function (options, done) {
            if(done instanceof Function) done.call(self, null, history);
            return self;
        };

        /**
         * Gets the device orientation<br>
         * Results will always be 1, since *most* monitors cannot rotate
         * @param {function=} done A callback for completion
         * @return {Shell} The current Shell framework instance
         */
        this.getOrientation = function (done) {
            if(done instanceof Function) done.call(self, null, 1);
            return self;
        };

        /**
         * Gets the device orientation<br>
         * Results will always be 1, since *most* monitors cannot rotate
         * @param {function=} done A callback for completion
         * @return {Shell} The current Shell framework instance
         */
        this.getScreenBounds = function (done) {
            if(done instanceof Function) done.call(self, null, [0, 0]);
            return self;
        };
    };

    return Object.freeze(new Shell (soda));
};
