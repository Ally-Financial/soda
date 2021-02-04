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
 * @module Windows/Driver
 */

var net  = require("net");

/**
 * Driver connector for Soda to Windows
 * @param {Soda} soda A Soda instance
 * @constructor
 */
var WindowsDriver = function (soda) {
    var
        /**
         * @associates SeleniumConfiguration
         * @type {Object}
         */
        settings = (require('./Config.js'))(soda);

    /**
     * A common method to send command to Windows
     * @param {Function} done A callback for completion
     * @param {string} command The command to send
     * @param {number} count The current count of commands being sent
     */
    function sendWindowsCommand(done, command, count) {
        var client = new net.Socket(),
            buffer = new Buffer.from("", 'utf-8');
        count = count || 0;
        client.on("data", function(data){
            buffer = Buffer.concat([buffer, new Buffer.from(data,'utf-8')]);
        });

        client.on("end", function () {
            var jsonResult    = buffer.toString().replace("<EOF>", "");

            try {
                var windowsResult = JSON.parse(jsonResult);
                done.call(this, windowsResult.result);
            } catch (e) {
                console.log('Exception', e);
                if (count < settings.RETRY_COMMAND_COUNT) {
                     sendWindowsCommand(done, command, count++);
                }
                else {
                    done.call(this, null);
                }
            }

            client.destroy();
        });

        console.log('About to connect to: ', settings.WINDOWS_SERVER_PORT, settings.WINDOWS_SERVER_IP);
        client.connect(settings.WINDOWS_SERVER_PORT, settings.WINDOWS_SERVER_IP, function () {
            client.write(command+"<EOF>");
        });

        client.once("error", function () {
            done.call(this, null);
        });
    }

    /**
     * Gets the currently Available Applications
     * @param {Function} done A callback for completion
     */
    this.availableApplications = function(done) {
        sendWindowsCommand(done, settings.GET_AVAILABLE_APPLICATIONS);
    };

    /**
     * Gets the currently Running Applications
     * @param {Function} done A callback for completion
     */
    this.runningApplications = function(done) {
        sendWindowsCommand(function(result) {
            done(null, result);
        }, settings.GET_RUNNING_APPLICATIONS);
    };

    /**
     * Gets the PNG format of the current application's screen
     * @param {Function} done A callback for completion
     * @param {string} processName The name of the process to get a screenshot of
     */
    this.takeScreenShotFromApplication = function(done, processName) {
        sendWindowsCommand(function(result) {
            done(null, result);
        }, '[{\"command\": \"takeScreenShot\"}, {\"process\": \"' + processName + '\"}]');
    };

    /**
     * Gets the application tree of the application's screen
     * @param {Function} done A callback for completion
     */
    this.getDesktopTree = function(done) {
        sendWindowsCommand(function(result) {
            done(null, result);
        }, '[{\"command\": \"gettree\"}]');
    };

    /**
     * Gets the screen shop desktop
     * @param {Function} done A callback for completion
     */
    this.takeScreenshot = function(done) {
        sendWindowsCommand(function(result) {
            done(null, true, result);
        }, '[{\"command\": \"takeScreenShot\"}]');
    };

    /**
     * Collects header of options.name
     * @param {Function} done A callback for completion
     */
    this.captureHeader = function(done) {
        done(null, "");
    },

    /**
     * Starts an application
     * @param {Function} done A callback for completion
     * @param {string} applicationPath The path to the application to start
     * @param {string} args The arguments to pass to the start applciation command
     */
    this.startApplication = function(done, applicationPath, args) {
        sendWindowsCommand(function(result) {
            done(null, true, result);
        }, '[{\"command\": \"start\"}, {\"apppath\": \"' + applicationPath + '\"}, {\"args\": ' + args + '}]');
    };

    /**
     * Starts an application and waits for it to have completed startup
     * @param {Function} done A callback for completion
     * @param {string} applicationPath The path to the application to start
     * @param {string} args The arguments to pass to the start applciation command
     */
    this.startApplicationAndWait = function(done, applicationPath, args) {
        sendWindowsCommand(function(result) {
            done(null, true, result);
        }, '[{\"command\": \"startAndWait\"}, {\"apppath\": \"' + applicationPath + '\"}, {\"args\": ' + args + '}]');
    };

    /**
     * Sends keys to an application
     * @param {Function} done A callback for completion
     * @param {string} identifier Send keys to an application by identifier
     * @param {string} args The arguments to pass to the start applciation command
     */
    this.sendApplicationKeys = function(done, identifier, args) {
        sendWindowsCommand(function(result) {
            done(null, true, result);
        }, '[{\"command\": \"sendkeys\"}, {\"keys\": ' + args + '}, {\"identifier\": \"' + identifier + '\"}]');
    };

    /**
     * Sends keys to an application
     * @param {Function} done A callback for completion
     * @param {array} commands A list of commands to send to an application
     */
    this.sendApplicationCommands = function(done, commands) {
        sendWindowsCommand(function(result) {
            done(null, result);
        }, '[{\"commands\": ' + JSON.stringify(commands) + '}]');
    };

    /**
     * Taps an element to an application
     * @param {Function} done A callback for completion
     * @param {string} identifier Send keys to an application by identifier
     */
    this.tapApplicationIdentifer = function(done, identifier) {
        sendWindowsCommand(function(result) {
            done(null, result);
        }, '[{\"command\": \"tap\"}, {\"identifier\": \"' + identifier + '\"}]');
    };

    /**
     * Taps an element to an application
     * @param {Function} done A callback for completion
     * @param {string} identifier Send keys to an application by identifier
     */
    this.clickApplicationIdentifer = function(done, identifier) {
        sendWindowsCommand(function(result) {
            done(null, result);
        }, '[{\"command\": \"clickByIdentifier\"}, {\"identifier\": \"' + identifier + '\"}]');
    };

    /**
     * Sets a field in an application
     * @param {Function} done A callback for completion
     * @param {string} identifier Send keys to an application by identifier
     * @param {string} value The value to set
     */
    this.setByIdentifer = function(done, identifier, value) {
        sendWindowsCommand(function(result) {
            done(null, result);
        }, '[{\"command\": \"set\"}, {\"identifier\": \"' + identifier + '\"}, {\"value\": \"' + value + '\"}]');
    };

    /**
     * Types in the application
     * @param {Function} done A callback for completion
     * @param {string} identifier Send keys to an application by identifier
     * @param {string} value The value to set
     */
    this.typeInIdentifer = function(done, identifier, value) {
        sendWindowsCommand(function(result) {
            done(null, result);
        }, '[{\"command\": \"type\"}, {\"value\": \"' + value + '\"}, {\"identifier\": \"' + identifier + '\"}]');
    };

    /**
     * Types in the application
     * @param {Function} done A callback for completion
     */
    this.getSize = function(done) {
        sendWindowsCommand(function(result) {
            done(null, result);
        }, '[{\"command\": \"getsize\"}]');
    };
};

module.exports = WindowsDriver;
