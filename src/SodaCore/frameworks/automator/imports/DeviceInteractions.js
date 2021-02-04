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
 * @module Automator/DeviceInteractions
 */

/**
 * DeviceInteractions for the Automator framework
 * @constructor
 * @param {object} soda The Soda library
 * @param {object} settings Automator settings
 * @param {object} emulatorControl Automator emulator control object
 */
var DeviceInteractions = function (soda, settings, emulatorControl) {

    var adb  = settings.ADB_PATH,
        exec = require("child_process").exec;

    /**
     * Take a screen shot using the device
     * @param {object} device The device to take the screenshot on (the device object)
     * @param {object} options Options to capture the screenshot with. Should include destination
     * @param {function} complete A callback for completion
     */
    this.captureScreen = function (device, options, complete) {
        var err = arguments.sodaexpect("object", "object", "function").error;
        if(err) throw err;

        var temp = options['filename'] || Date.now();

        soda.console.debug("Taking screenshot on device `" + device.name + "`");
        exec(adb + " -s " + device['serial'] + " shell screencap /sdcard/" + temp + ".png", function (err, stdout, stderr) {

            if(err) {
                if(complete) complete(err, false);
            }
            else if(stderr) {
                if(complete) complete(new Error(stderr), false);
            }
            else if(options['destination']) {
                emulatorControl.pull(device, "/sdcard/" + temp + ".png", options['destination'], function (err) {
                    soda.console.debug("Screenshot saved for `" + device.name + "` in " + options['destination']);
                    if(complete) return err ? complete(err, false) : complete(null, true);
                });
            }
            else {
                if(complete) complete(null, true);
            }
        });
    };

    /**
     * Collects header of options.name
     * @param {Object} options Options to take the screen shot with including file destination and/or filename
     * @param {Function=} done A callback for completion
     */
    this.captureHeader = function (device, options, complete) {
        var err = arguments.sodaexpect("object", "object", "function").error;
        if(err) throw err;

        if(complete) complete(null, "");
    };

    /**
     * Rotate the device. Options should include a key/value pair "orientation"/(0|1|2|3|4)
     * @param {object} device The device to take the screenshot on (the device object)
     * @param {object} options Options to capture the screenshot with. Should include destination
     * @param {function} complete A callback for completion
     */
    this.rotateDevice = function (device, options, complete) {
        exec(adb + " shell content insert --uri content://settings/system --bind name:s:accelerometer_rotation --bind value:i:0", function (err) {
            if(err) return complete(err, false);

            exec(adb + " shell content insert --uri content://settings/system --bind name:s:user_rotation --bind value:i:" + options.orientation.toString(), function (err) {
                if(err) {
                    complete(err, false);
                }
                else {
                    complete(err, true);
                }
            });
        });
    };

    /**
     * Hide the app for the specified number of seconds
     * @param {object} device The device in which to hide the foreground app
     * @param {{}=} options Options to capture the screenshot with. Should include destination
     * @param {function} complete A callback for completion
     */
    this.hideAppForSeconds = function (device, options, complete) {
        emulatorControl.doKeyEvent(device, settings.KEY_EVENTS.HOME, function (err) {
            if (err && complete) {
                complete(err, null);
                return;
            }

            setTimeout(function () {
                emulatorControl.startApp(device, complete);
            }, options['seconds'] * 1000 || 10000);
        });
    };

    /**
     * Tap screen coordinates
     * @param {object} device The device in which to hide the foreground app
     * @param {{}=} options Options to capture the screenshot with. Should include destination
     * @param {function} complete A callback for completion
     */
    this.tapXY = function (device, options, complete) {
        exec(adb + " -s " + device.serial + " shell input tap " + options.x + " " + options.y, function (err) {
            if(complete) return err ? complete(err, false) : complete(null, true);
        });
    };

    /**
     * Scrolls the screen to the given coordinates
     * @param {object} device The device in which to hide the foreground app
     * @param {{}=} options Options to provide the coordinates. Should be in the form of x0, x1, y0, y1
     * @param {function} complete A callback for completion
     */
    this.scrollScreen = function (device, options, complete) {
        if(typeof options !== "object") options = {};

        if(!options.x0) options.x0 = 0;
        if(!options.x1) options.x1 = 0;
        if(!options.y0) options.y0 = 0;
        if(!options.y1) options.y1 = 0;

        exec(adb + " -s " + device.serial + " shell input swipe " + options.x0 + " " + options.y0 + " " + options.x1 + " " + options.y1, function scrollScreen (err) {
            if(err) {
                if(complete instanceof Function) complete(err, false);
            }
            else {
                if(complete instanceof Function) complete(null, true);
            }
        });
    };

    /**
     * Press the back button on the Android device
     * @param {object} device The device in which to hide the foreground app
     * @param {{}=} options Options to capture the screenshot with. Should include destination
     * @param {function} complete A callback for completion
     */
    this.back = function (device, options, complete) {
        emulatorControl.doKeyEvent(device, settings.KEY_EVENTS.BACK, function (err) {
            if (err && complete) {
                complete(err, null);
                return;
            }
            complete(null, true);
        });
    };
};

module.exports = DeviceInteractions;
