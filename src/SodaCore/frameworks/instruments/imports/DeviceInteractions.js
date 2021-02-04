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
 * Actions that could be performed by a user. A (more friendly) alternative to using the method on the UIAElement class
 * @module Instruments/DeviceInteractions
 */
var DeviceInteractions = (function DeviceInteractions () {
    /**
     * Actions that could be performed by a user. A (more friendly) alternative to using the method on the UIAElement class
     * @type {Object}
     */
    var deviceInteractions = {

        /**
         * Hides the application for N number of seconds
         * @param {object=} options The options for how long to hide the app for
         * @memberof module.Instruments/DeviceInteractions
         */
        hideAppForSeconds: function (options) {

            if(typeof options !== "object")
                return new Error("DeviceInteractions.hideAppForSeconds expected parameter `options` to be of type object, but got `" + typeof options + "`");

            Simulator.target.deactivateAppForDuration(1);
            Simulator.target.deactivateAppForDuration(parseInt(options.seconds, 10));
            return true;
        },

        /**
         * Tap the screen using and array ([x, y]) set of coordinates
         * @param {object=} options The options to tap with
         * @memberof module.Instruments/DeviceInteractions
         */
        tapXY: function (options) {
            if(typeof options !== "object")
                return new Error("DeviceInteractions.tapXY expected parameter `options` to be of type object, but got `" + typeof options + "`");

            if(typeof options.x !== "number")
                return new Error("DeviceInteractions.tapXY expected parameter `options.x` to be of type number, but got `" + typeof options.x + "`");

            if(typeof options.y !== "number")
                return new Error("DeviceInteractions.tapXY expected parameter `options.y` to be of type number, but got `" + typeof options.y + "`");

            var x = options.x,
                y = options.y;

            delete options.x;
            delete options.y;

            try {
                Simulator.target.tapWithOptions({ x: x, y: y }, options);
            }
            catch(e) {
                return e;
            }

            return true;
        },

        /**
         * Simulate device rotation
         * @param {object=} options Settings for the particular interaction
         * @memberof module.Instruments/DeviceInteractions
         * @returns {*}
         */
        rotateDevice: function (options) {
            try {
                Simulator.target.setDeviceOrientation(options.orientation);
            }
            catch (e) {
                return e;
            }

            return true;
        },

        /**
         * Take a screen shot with the options provided
         * @param {object=} options Settings for the particular interaction
         * @memberof module.Instruments/DeviceInteractions
         * @returns {*}
         */
        captureScreen: function (options) {
            if(typeof options !== "object")
                return new Error("DeviceInteractions.captureScreen expected parameter `options` to be of type object, but got `" + typeof options + "`");

            if(typeof options.filename !== "string")
                return new Error("DeviceInteractions.captureScreen expected parameter `options.seconds` to be of type string, but got `" + typeof options.filename + "`");

            Simulator.target.captureScreenWithName(options.filename.replace(/\.png$/, ""));
            if(options["destination"] && /^Screen-Soda.*/.test(options.filename) === false) {
                Simulator.target.delay(2);

                for(var i = 1; i < 8; i++) {
                    var res = IO.movefile(Vars.PATHS.RESULTS_PATH + "/Run\ "    + i + "/"  + options.filename.replace(/\.png$/, "") + ".png", options["destination"]);
                    if(res.exitCode === 0) break;

                    var resAlt = IO.movefile(Vars.PATHS.RESULTS_PATH + "/Run\ 1 (" + i + ")/" + options.filename.replace(/\.png$/, "") + ".png", options["destination"]);
                    if(resAlt.exitCode === 0) break;
                }
                if(i >= 8) return new Error("Couldn't move screen capture because: code: " + res.exitCode + ", message: " + res.stderr);
            }
            return true;
        },

        /**
         * Collects header of options.name
         * @param {Object} options Options to take the screen shot with including file destination and/or filename
         * @param {Function=} done A callback for completion
         */
        captureHeader: function (options) {
            if(typeof options !== "object")
                return new Error("DeviceInteractions.captureHeader expected parameter `options` to be of type object, but got `" + typeof options + "`");

            return "";
        },

        /**
         * Type on the device keyboard
         * @param {object=} options Settings for the particular interaction
         * @memberof module.Instruments/DeviceInteractions
         * @returns {*}
         */
        typeOnKeyboard: function (options) {
            if(typeof options !== "object")
                return new Error("DeviceInteractions.typeOnKeyboard expected parameter `options` to be of type object, but got `" + typeof options + "`");

            if(typeof options.string !== "string")
                return new Error("DeviceInteractions.typeOnKeyboard expected parameter `options.seconds` to be of type string, but got `" + typeof options.string + "`");

            try {
                Simulator.app.keyboard().typeString(options.string);
            }
            catch(e) {
                return e;
            }
            return true;
        }

    };

    return Object.freeze(deviceInteractions);

}());
