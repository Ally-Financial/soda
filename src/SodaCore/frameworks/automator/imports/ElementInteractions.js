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
 * @module Automator/ElementInteractions
 */

/**
 * Used in self.scroll, gets the coordinates command for `adb shell input swipe x1 y1 x2 y2`
 * @param {object} e The element to use for scrolling
 * @param {string} direction The direction to scroll
 * @param {number|string} amount The amount to scroll. 1 === the element height (or width in a horizontal scroll)
 * @returns {*}
 */
function getCmd (e, direction, amount) {

    var x1 = e.hitpoint.x,
        y1 = e.hitpoint.y,
        h  = e.rect.size.height,
        x2, y2, cmd;

    switch(direction) {

        case "down":
            y2 = (y1 - amount * h) > 0 ? (y1 - amount * h) : 0;
            cmd = "shell input swipe " + x1 + " " + y1 + " " + x1 + " " + y2;
            break;

        case "up":
            y2 = (y1 + amount * h);
            cmd = "shell input swipe " + x1 + " " + y1 + " " + x1 + " " + y2;
            break;

        case "left":
            x2 = (x1 - amount * h) > 0 ? (x1 - amount * h) : 0;
            cmd = "shell input swipe " + x1 + " " + y1 + " " + x2 + " " + y1;
            break;

        case "right":
            x2 = (x1 + amount * h);
            cmd = "shell input swipe " + x1 + " " + y1 + " " + x2 + " " + y1;
            break;
        
        default:
            y2 = (y1 - amount * h) > 0 ? (y1 - amount * h) : 0;
            cmd = "shell input swipe " + x1 + " " + y1 + " " + x1 + " " + y2;
            break;

    }

    return cmd;
}

/**
 * @constructor
 * @param {object} soda The Soda library
 * @param {object} settings Automator settings
 * @param {object} emulatorControl Automator emulator control object
 */
var ElementInteractions = function (soda, settings, emulatorControl) {

    var adb  = settings.ADB_PATH,
        exec = require("child_process").exec,
        self = this;

    /**
     * Set an element's value
     * @param {object} device The device to take the screenshot on (the device object)
     * @param {Array} elements An array of elements to set their value
     * @param {object} options Options to set the element values with
     * @param {function} complete A callback for completion
     */
    this.setValue = function (device, elements, options, complete) {

        var err = arguments.sodaexpect("object", "array", "object", "function").error;
        if(err) throw err;

        var i = 0;
        emulatorControl.setValue(device, elements[i], options.value, function typeAll (err) {

            if(err) {
                complete(err, false);
                i = elements.length;
                return;
            }

            i = i + 1;

            if(i < elements.length) {
                emulatorControl.setValue(device, elements[i], options.value, typeAll);
            }
            else {
                complete(null, true);
            }
        });
    };

    /**
     * Tap an element
     * @param {object} device The device to take the screenshot on (the device object)
     * @param {Array} elements An array of elements to tap
     * @param {{}} options Options to tap with
     * @param {function} complete A callback for completion
     */
    this.tap = function (device, elements, options, complete) {

        var err = arguments.sodaexpect("object", "array", "object", "function").error;
        if(err) throw err;

        var i = 0;
        emulatorControl.tap(device, elements[i], function tapAll (err) {

            if(err) {
                complete(err, false);
                i = elements.length;
                return;
            }

            i = i + 1;

            if(i < elements.length) {
                emulatorControl.tap(device, elements[i], tapAll);
            }
            else {
                complete(null, true);
            }
        });
    };

    /**
     * Scroll an element
     * @param {object} device The device to take the screenshot on (the device object)
     * @param {Array} elements An array of elements to scroll
     * @param {{}} options Options to scroll with
     * @param {function} complete A callback for completion
     */
    this.scroll = function (device, elements, options, complete) {

        var err = arguments.sodaexpect("object", "array", "object", "function").error;

        if(err) {
            if(complete instanceof Function) complete.call(self, err, null);
            return;
        }

        if(!options.amount) options.amount = 1;
        options.direction = options.direction ? options.direction.toLowerCase() : "down";

        if(options.direction === "top") {
            options.direction = "up";
            options.amount = 999;
        }

        if(options.direction === "bottom") {
            options.direction = "down";
            options.amount = 999;
        }

        var i = 0,
            amount = parseFloat(options.amount);

        var cmd = getCmd(elements[0], options.direction, amount);
        exec(adb + " -s " + device.serial + " " + cmd, function doScroll (err) {

            if(err) {
                complete(err, false);
                i = elements.length;
                return;
            }

            i = i + 1;

            if(i < elements.length) {
                exec(adb + " -s " + device.serial + " " + getCmd(elements[i], options.direction, amount), doScroll);
            }
            else {
                if(complete instanceof Function) complete(null, true);
            }
        });
    };
};

module.exports = ElementInteractions;
