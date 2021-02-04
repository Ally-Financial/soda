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
 * @module Perfecto/ElementInteractions
 */

/**
 * @constructor
 * @param {object} soda The Soda library
 * @param {object} settings Automator settings
 * @param {object} driver Perfecto driver control object
 */
var ElementInteractions = function (soda, settings, driverControl) {
    var self = this;

    /**
     * Used in self.scroll, gets the coordinates command for `adb shell input swipe x1 y1 x2 y2`
     * @param {object} e The element to use for scrolling
     * @param {string} direction The direction to scroll
     * @param {number|string} amount The amount to scroll. 1 === the element height (or width in a horizontal scroll)
     * @returns {*}
     */
    function getCmd (e, direction, amount, screenHeight, screenWidth) {

        var x1 = e.hitpoint.x,
            y1 = e.hitpoint.y,
            h  = e.rect.size.height,
            x2, y2, cmd;

        if (y1 > screenHeight) {
          y1 = screenHeight - (y1 - screenHeight);
        }

        switch(direction) {

            case "down":
                y2 = (y1 - amount * h) > 0 ? (y1 - amount * h) : 0;
                cmd = '&param.start='+ x1 + ',' + y1 + '&param.end=' + x1 + ',' + y2;
                break;

            case "up":
                y1 = screenHeight - 200;
                y2 = (y1 - amount);
                cmd = '&param.start='+ x1 + ',' + y2 + '&param.end=' + x1 + ',' + y1;
                break;

            case "left":
                x2 = (x1 - amount * h) > 0 ? (x1 - amount * h) : 0;
                cmd = '&param.start='+ x1 + ',' + y1 + '&param.end=' + x2 + ',' + y1;
                break;

            case "right":
                x2 = (x1 + amount * h);
                cmd = '&param.start='+ x1 + ',' + y1 + '&param.end=' + x2 + ',' + y1;
                break;

            default:
                y2 = (y1 - amount * h) > 0 ? (y1 - amount * h) : 0;
                cmd = '&param.start='+ x1 + ',' + y1 + '&param.end=' + x1 + ',' + y2;
                break;
        }

        return cmd;
    }

    /**
     * Set an element's value
     * @param {object} device The device to take the screenshot on (the device object)
     * @param {Array} elements An array of elements to set their value
     * @param {object} options Options to set the element values with
     * @param {function} complete A callback for completion
     */
    this.setValue = function (elements, options, complete) {

        var err = arguments.sodaexpect("array", "object", "function").error;
        if(err) throw err;

        var i = 0;
        driverControl.setValue(elements[i], options.value, elements[i].web, function typeAll (err) {

            if(err) {
                complete(err, false);
                i = elements.length;
                return;
            }

            i = i + 1;

            if(i < elements.length) {
                driverControl.setValue(elements[i], options.value, elements[i].web, typeAll);
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
    this.tap = function (elements, options, complete) {
        var err = arguments.sodaexpect("array", "object", "function").error;
        if(err) throw err;

        var i = 0;
        driverControl.tap(elements[i], options, function tapAll (err) {

            if(err) {
                complete(err, false);
                i = elements.length;
                return;
            }

            i = i + 1;

            if(i < elements.length) {
                driverControl.tap(elements[i], options, tapAll);
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
    this.scroll = function (elements, options, complete) {

        var err = arguments.sodaexpect("array", "object", "function").error;

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

        driverControl.getResolution(function (err, windowSize) {
          var height = windowSize[1];
          var width = windowSize[0];

          var i = 0,
              amount = parseFloat(options.amount);

          var cmd = getCmd(elements[0], options.direction, amount, height, width);

          driverControl.scrollCalculated(cmd, function doScroll (err, result) {
              soda.console.debug(result);

              if(err) {
                  complete(err, false);
                  i = elements.length;
                  return;
              }

              i = i + 1;

              if(i < elements.length) {
                  driverControl.scrollCalculated(getCmd(elements[i], options.direction, amount, height, width), doScroll);
              }
              else {
                  if(complete instanceof Function) complete(null, true);
              }
          });
        });
    };

    /**
     * scrollToVisible an element
     * @param {object} device The device to take the screenshot on (the device object)
     * @param {Array} elements An array of elements to scrollToVisible
     * @param {{}} options Options to scrollToVisible with
     * @param {function} complete A callback for completion
     */
    this.scrollToVisible = function (elements, options, complete) {
        var self = this;
        var err = arguments.sodaexpect("array", "object", "function").error;

        if(err) {
            soda.console.error(err);
            if(complete instanceof Function) complete.call(self, err, null);
            return;
        }

        var valueToFind = elements[0].value !== null ? elements[0].value : elements[0].label !== null ? elements[0].label : elements[0].name;

        driverControl.findElementWithScroll(valueToFind, function (error, result) {
          complete(null, result);
        });
    };

    /**
    * Type on the device keyboard
    * @param {string=} string The string to type on the keyboard
    * @param {function=} complete A callback for completion
    * @returns {*}
    */
    this.typeOnKeyboard = function (options, complete) {
        var err = arguments.sodaexpect("object", "function").error;

        if(err) {
            complete(err, false);
            return;
        }

        driverControl.typeOnKeyboard(options.string, function (error) {
          if(error) {
              complete(error, false);
              return;
          }

          complete(null, true);
        });
    };
};

module.exports = ElementInteractions;
