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
 * @module Engine/Syntaxes/Mobile/Functions
 * @description The perfecto v2.0 Soda stynax callback library
 */

var path = require("path"),
    core = require(path.join(__dirname, "..", "..", "..", "..", "lib", "CoreSyntax"));

/**
* Reset the application's data
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param scope {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.resetAppData = function (action, reply, scope) {
    scope.device.resetAppData(function (err) {
        if(err) {
            reply(false, "Should reset application data" + " " + err.message);
            return;
        }

        reply(true, "Should reset application data");
    });
};

//////////////////////////////////////////////////////// SWIPE /////////////////////////////////////////////////////////

/**
* Swipe an element with options
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.swipeOptions = function (action, reply, scope) {
    action.using = "selector";
    exports.swipeUsingOptions(action, reply, scope);
};

/**
* Swipe an element
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.swipe = function (action, reply, scope) {
    action.options = {};
    exports.swipeOptions(action, reply, scope);
};

/**
* Swipe an element with options and specifying a selector type
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.swipeUsingOptions = function (action, reply, scope) {
    if(core.checkUsing(scope.elements(), action.using, reply)) {
        var e = scope.elements()["with" + action.using.ucFirst](action.swipe);
        core.checkExistsAndIsSingleElement("swipe", e, action.using, action.swipe, scope, reply, function () {
            core.performElementInteraction("swipe", e[0], reply, action.options, action.swipe, action.refresh, scope);
        });
    }
};

/**
* Swipe an element specifing a selector type
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.swipeUsing = function (action, reply, scope) {
    action.options = {};
    exports.swipeUsingOptions(action, reply, scope);
};

///////////////////////////////////////////////////////// TAP //////////////////////////////////////////////////////////

/**
* Tap an element, providing options
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.tapOptions = function (action, reply, scope) {
    action.using = "selector";
    exports.tapUsingOptions(action, reply, scope);
};

/**
* Tap an element
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.tap = function (action, reply, scope) {
    action.options = {};
    exports.tapOptions(action, reply, scope);
};

/**
* Long press an element
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.longPress = function (action, reply, scope) {
    action.options = {duration: action.duration};
    exports.tapOptions(action, reply, scope);
};

/**
 * Click an element, if it exists
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.tapIfExists = function (action, reply, scope) {
    action.using = "selector";
    if(core.checkUsing(scope.elements(), action.using, reply)) {
        var e = scope.elements()["with" + action.using.ucFirst](action.tapIfExists);

        if(e.length === 1) {
            core.performElementInteraction("tap", e[0], reply, action.options, action.tapIfExists, action.refresh, scope);
        }
        else if (e.length === 0) {
            reply(true, "Should tap `" + action.tapIfExists + "` if it exists (Element did not exist, tap skipped)");
        }
        else {
            reply(false, "Should tap `" + action.tapIfExists + "` if it exists (Expected a single element or no element, but selector returned " + e.length + ")");
        }
    }
};


/**
 * Tap an element, providing options
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.tapAllOptions = function (action, reply, scope) {
    action.using = "selector";
    exports.tapAllUsingOptions(action, reply, scope);
};

/**
 * Tap an element
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.tapAll = function (action, reply, scope) {
    action.options = {};
    exports.tapAllOptions(action, reply, scope);
};

/**
 * Tap an element
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.tapAllUsing = function (action, reply, scope) {
    action.options = {};
    exports.tapAllUsingOptions(action, reply, scope);
};

/**
 * Tap an element providing options
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.tapAllUsingOptions = function (action, reply, scope) {
    if(core.checkUsing(scope.elements(), action.using, reply)) {
        var e = scope.elements()["with" + action.using.ucFirst](action.tapAll);
        core.checkElementExists("tapAll", e, action.using, action.tapAll, scope, reply, function (newE) {
            core.performElementInteraction("tap", newE, reply, action.options, action.tapAll, action.refresh, scope);
        });
    }
};

/**
* Tap screen coordinates
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.tapXY = function (action, reply, scope) {
    action.options = {};

    if(!(action.tapXY instanceof Array))
        return reply(false, "Should tap screen coordinates (TapXY expected an array, but got: " + typeof action.tapXY + ")");

    if(action.tapXY.length < 2)
        return reply(false, "Should tap screen coordinates (TapXY expected an array of at least length 2");

    scope.device.tapXY(action.tapXY[0], action.tapXY[1], function (err, performed) {
        if(err) return reply(false, "Should tap screen coordinates [" + action.tapXY[0] + ", " + action.tapXY[1] + "] (" + err.message + ")");
        if(!performed) return reply(false, "Should tap screen coordinates [" + action.tapXY[0] + ", " + action.tapXY[1] + "] (Device interaction failed)");

        if(action.refresh !== false) {
            scope.tree.update(function (err, tree) {
                if(err || !tree) {
                    reply(false, "Should tap screen coordinates [" + action.tapXY[0] + ", " + action.tapXY[1] + "]" + (err ? "(" + err.message + ")" : ""));
                }
                else {
                    reply(true, "Should tap screen coordinates [" + action.tapXY[0] + ", " + action.tapXY[1] + "]");
                }
            });
        }
        else {
            reply(true, "Should tap screen coordinates [" + action.tapXY[0] + ", " + action.tapXY[1] + "]");
        }
    });
};

/**
* Tap screen coordinates, relative to the given parent
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.tapXYRelativeTo = function (action, reply, scope) {
    action.using = "selector";

    if(!(action.tapXY instanceof Array))
        return reply(false, "Should tap screen coordinates (TapXY expected an array, but got: " + typeof action.tapXY + ")");

    if(action.tapXY.length < 2)
        return reply(false, "Should tap screen coordinates (TapXY expected an array of at least length 2");

    if(core.checkUsing(scope.elements(), action.using, reply)) {
        var e = scope.elements()["with" + action.using.ucFirst](action.relativeTo);
        core.checkExistsAndIsSingleElement("tapXY", e, action.using, action.relativeTo, scope, reply, function (newE) {
            action.tapXY = [newE[0].rect.origin.x + action.tapXY[0], newE[0].rect.origin.y + action.tapXY[1]];
            exports.tapXY(action, reply, scope);
        });
    }
};

/**
* Tap an element providing options
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.tapUsingOptions = function (action, reply, scope) {
    if(core.checkUsing(scope.elements(), action.using, reply)) {
        var e = scope.elements()["with" + action.using.ucFirst](action.tap);
        core.checkExistsAndIsSingleElement("tap", e, action.using, action.tap, scope, reply, function (newE) {
            core.performElementInteraction("tap", newE[0], reply, action.options, action.tap, action.refresh, scope);
        });
    }
};

/**
* Tap an element
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.tapUsing = function (action, reply, scope) {
    action.options = {};
    exports.tapUsingOptions(action, reply, scope);
};

///////////////////////////////////////////////// DEVICE INTERACTIONS //////////////////////////////////////////////////

/**
* Hide the app for the specified number of seconds
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.hideAppFor = function (action, reply, scope) {
    scope.console.log("Hiding app for " + action.hideAppFor + " seconds...");

    scope.device.hideAppForSeconds(action.hideAppFor, function (err, res) {
        if(err) {
            reply(false, "Should hide app for `" + action.hideAppFor + "` seconds (" + err.message + ")");
            return;
        }
        else if(!res) {
            reply(false, "Should hide app for `" + action.hideAppFor + "` seconds (Framework replied false)");
            return;
        }

        reply(true, "Should hide app for `" + action.hideAppFor + "` seconds");
    });
};

/**
* Type on the on-screen keyboard
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.typeOnKeyboard = function (action, reply, scope) {
    scope.device.typeOnKeyboard(action.typeOnKeyboard, function (err, res) {
        if(err) {
            reply(false, "Should type `" + action.typeOnKeyboard + "` on keyboard (" + err.message + ")");
        }
        else if(!res) {
            reply(false, "Should type `" + action.typeOnKeyboard + "` on keyboard (Framework replied false)");
        }
        else {
            reply(true, "Should type `" + action.typeOnKeyboard + "` on keyboard");
        }
    });
};

/**
* Press the back button on the device (Android Only, iOS will throw error)
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.back = function (action, reply, scope) {
    scope.device.back(function (err, res) {
        if(err) {
            reply(false, "Should press back button (" + err.message + ")");
        }
        else if(!res) {
            reply(false, "Should press back button (Framework replied false)");
        }
        else {
            reply(true, "Should press back button");
        }
    });
};

////////////////////////////////////////////////// SCROLL TO VISIBLE ///////////////////////////////////////////////////

/**
* For perfecto, swipe from to coordinate
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.swipe = function (action, reply, scope) {
    var opts   = action.scroll;

    scope.device.swipe(opts, function (err, res) {
        if(err) {
            reply(false, "Should swipe (" + err.message + ")");
        }
        else if(!res) {
            reply(false, "Should swipe (Framework replied false)");
        }
        else {
            reply(true, "Should swipe");
        }
    });
};

/**
 * For Automator framework only. A helper function for scrollToVisible, scrollToBottom, and scrollToTop
 * @param  {string} direction The direction to scroll
 * @param  {object} scope The scope object, as passed into the action event callback
 * @param  {object} windowInfo An object containing the window (or sub-element) size, center, and offset
 * @param  {object} complete A callback for completion
 * @return {undefined}
 */
function scrollInDirection (direction, scope, windowInfo, complete) {
    var opts   = {};
    switch(direction) {
        case "up": // Scroll up (swipe down)
            opts = {
                x0: windowInfo.center.x,
                x1: windowInfo.center.x,
                y0: windowInfo.offset.top,
                y1: windowInfo.offset.top + (windowInfo.amount * windowInfo.size.y)
            };
            break;

        case "left": // Scroll left (swipe right)
            opts = {
                x0: windowInfo.offset.left,
                x1: windowInfo.offset.left + (windowInfo.amount * windowInfo.size.x),
                y0: windowInfo.center.y,
                y1: windowInfo.center.y,
            };
            break;

        case "right": // Scroll right (swipe left)
            opts = {
                x0: windowInfo.offset.right,
                x1: windowInfo.offset.right - (windowInfo.amount * windowInfo.size.x),
                y0: windowInfo.center.y,
                y1: windowInfo.center.y,
            };
            break;

        case "down": // jshint ignore:line
        default:
            opts = {
                x0: windowInfo.center.x,
                x1: windowInfo.center.x,
                y0: windowInfo.offset.bottom,
                y1: windowInfo.offset.bottom - (windowInfo.amount * windowInfo.size.y)
            };
            break;
    }
    scope.device.scrollWindow(opts, complete);
}

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
            y2 = (y1 - amount ) > 0 ? (y1 - amount) : 0;
            cmd = '&param.start='+ x1 + ',' + y1 + '&param.end=' + x1 + ',' + y2;
            break;

        case "up":
            y1 = screenHeight - 200;
            y2 = (y1 - amount ) > 0 ? (y1 - amount) : 0;
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
            break;
    }

    return cmd;
}

/**
 * findAndScrollToTextPerfecto an element
 * @param {object} device The device to take the screenshot on (the device object)
 * @param {Array} elements An array of elements to scrollToVisible
 * @param {{}} options Options to scrollToVisible with
 * @param {function} complete A callback for completion
 */
function findAndScrollToTextPerfecto(scope, text, complete) {
    scope.device.findElementWithScroll(text, function (error, result) {
      complete(null, result);
    });
}

/**
 * findAndScrollPerfecto an element
 * @param {object} device The device to take the screenshot on (the device object)
 * @param {Array} elements An array of elements to scrollToVisible
 * @param {{}} options Options to scrollToVisible with
 * @param {function} complete A callback for completion
 */
function findAndScrollPerfecto(scope, elements, options, complete) {
    if (elements[0]) {
      var valueToFind = elements[0].value !== null ? elements[0].value : elements[0].label  !== null ? elements[0].label : elements[0].name;

      scope.device.findElementWithScroll(valueToFind, function (error, result) {
        complete(null, result);
      });
    }
    else {
      complete(false, "No element found to scroll to");
    }
}

/**
* For android, use custom scrollToVisible, use core version for all others...
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.scrollToVisible = function (action, reply, scope) {
    action.using = "selector";

    if (scope.soda.framework.name.toLowerCase() === "perfecto") {
      scope.console.debug("Executing *perfecto* scrollToVisible...");

      scope.tree.findElementsBySelector(action.scrollToVisible, function findElementsComplete (err, elems) {
          if(err) return reply(false, "Should scroll `" + action.scrollToVisible + "` into view (" + err.message + ")");
          elems = elems.toTruthy;

          findAndScrollPerfecto(scope, elems, action, function(err, result) {
            reply(result, "Should scroll `" + action.scrollToVisible + "` into view (Elements with selector `" + action.scrollToVisible + "`)");
          });
      });
    }
    else if(scope.soda.framework.name.toLowerCase() === "automator" || ((scope.soda.config.get("platform").toLowerCase() === "android" || scope.soda.config.get("platform").toLowerCase() === "androidtab" || scope.soda.config.get("platform").toLowerCase() === "iphone" || scope.soda.config.get("platform").toLowerCase() === "ipad"))) {
        scope.console.debug("Executing *special* scrollToVisible...");

        var hash = scope.tree.hash;
        scope.soda.framework.getScreenBounds(function (err, windowSize) {
            if(err) return reply(false, "Should scroll `" + action.scrollToVisible + "` into view (" + err.message + ")");
            var _window = null;

            if(action.parent) {
                var parent = scope.tree.findElementsBySelector(action.parent);
                if(parent.length > 0) {
                    scope.console.debug("Got valid parent for scrollToVisible...");
                    _window = parent[0];
                }
            }

            var windowInfo,
                directions = ["down", "up", "left", "right"],
                direction  = 0,
                totalTimes = 0;

            if(!_window) {
                windowInfo = {
                    center: {
                        x: windowSize[0] / 2,
                        y: windowSize[1] / 2
                    },
                    size: {
                        x: windowSize[0],
                        y: windowSize[1]
                    },
                    offset: {
                        top    : 100,
                        bottom : windowSize[1] - 100,
                        left   : 0,
                        right  : 0
                    },
                    amount: action.amount || 1
                };
            }
            else {
                windowInfo = {
                    center: {
                        x: _window.rect.origin.x + (_window.rect.size.width  / 2),
                        y: _window.rect.origin.y + (_window.rect.size.height / 2)
                    },
                    size: {
                        x: _window.rect.size.width,
                        y: _window.rect.size.height
                    },
                    offset: {
                        top    : _window.rect.origin.y + (_window.rect.size.height * 0.10),
                        bottom : _window.rect.origin.y + _window.rect.size.height - (_window.rect.size.height * 0.10),
                        left   : _window.rect.origin.x + (_window.rect.size.width * 0.10),
                        right  : _window.rect.origin.x + _window.rect.size.width - (_window.rect.size.width * 0.10)
                    },
                    amount: action.amount || 1
                };
            }

            scope.tree.findElementsBySelector(action.scrollToVisible, function findElementsComplete (err, elems) {
                if(err) return reply(false, "Should scroll `" + action.scrollToVisible + "` into view (" + err.message + ")");
                elems = elems.toTruthy;

                // Happy Case, element is already in view
                if(elems.length > 0 && elems[0].visible && elems[0].hitpoint.y <= windowSize[1]) {
                    reply(true, "Should scroll `" + action.scrollToVisible + "` into view");
                }
                // Element is not in view
                else {
                    totalTimes++;
                    scrollInDirection(directions[direction], scope, windowInfo, function scrollInDirectionComplete (err) {
                        if(err) return reply(false, "Should scroll `" + action.scrollToVisible + "` into view (" + err.message + ") with direction `" + directions[direction] + "`");

                        scope.tree.update(function (err, tree) {
                            if(err) return reply(false, "Should scroll `" + action.scrollToVisible + "` into view (" + err.message + ") with direction `" + directions[direction] + "`");

                            // Lock out this direction, no use in scrolling... the tree is the same..
                            if(tree.hash === hash) direction++;

                            hash = tree.hash;
                            scope.console.debug("Got tree hash:", hash);

                            if(direction < directions.length && (totalTimes < action.maxAttempts || 16)) { // 16 === 4 swipes for each...
                                scope.tree.findElementsBySelector(action.scrollToVisible, findElementsComplete);
                            }
                            else {
                                reply(false, "Should scroll `" + action.scrollToVisible + "` into view (Elements with selector `" + action.scrollToVisible + "` not found) with direction `" + directions[direction] + "`");
                            }
                        });
                    });
                }
            });
        });
    }
    else {
        return core.scrollToVisibleUsing(action, reply, scope);
    }
};

/**
* For android, use custom scrollToVisibleText, use core version for all others...
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.scrollToVisibleText = function (action, reply, scope) {
    action.using = "selector";

    if (scope.soda.framework.name.toLowerCase() === "perfecto") {
      scope.console.debug("Executing *perfecto* scrollToVisibleText...");

      findAndScrollToTextPerfecto(scope, action.scrollToVisibleText, function(err, result) {
        reply(result, "Should scroll `" + action.scrollToVisibleText + "` into view (Elements with text `" + action.scrollToVisibleText + "`)");
      });
    }
    else {
        return core.scrollToVisibleUsing(action, reply, scope);
    }
};

/**
 * A helper function for scrollToTop and scrollToBottom
 * @param  {string} direction The direction to scroll
 * @param  {object} key The key to get the element from (e.g. scrollToTop or scrollToBottom)
 * @param  {object} action The action object, as passed into the action event callback
 * @param  {Function} reply The reply function, as passed into the action event callback
 * @param  {object} scope The scope object, as passed into the action event callback
 * @return {undefined}
 */
function scrollToGeneric (direction, key, action, reply, scope) {
    if(scope.soda.framework.name.toLowerCase() === "automator" || (scope.soda.framework.name.toLowerCase() === "perfecto" && (scope.soda.config.get("platform").toLowerCase() === "android" || scope.soda.config.get("platform").toLowerCase() === "androidtab")) || (scope.soda.framework.name.toLowerCase() === "perfecto" && (scope.soda.config.get("platform").toLowerCase() === "androidweb" || scope.soda.config.get("platform").toLowerCase() === "androidtabweb"))) {
        var hash = scope.tree.hash;

        if(core.checkUsing(scope.elements(), "selector", reply)) {
            var e = scope.elements()["withSelector"](action[key]);
            core.checkExistsAndIsSingleElement(key, e, "selector", action[key], scope, reply, function (newE) {
                var windowInfo;
                e = newE[0];

                windowInfo = {
                    center: {
                        x: e.rect.origin.x + (e.rect.size.width  / 2),
                        y: e.rect.origin.y + (e.rect.size.height / 2)
                    },
                    size: {
                        x: e.rect.size.width,
                        y: e.rect.size.height
                    },
                    offset: {
                        top    : e.rect.origin.y + 10,
                        bottom : e.rect.origin.y + e.rect.size.height - 10,
                        left   : e.rect.origin.x + 10,
                        right  : e.rect.origin.x + e.rect.size.height - 10
                    },
                    amount: action.amount || 1
                };

                scrollInDirection(direction, scope, windowInfo, function scrollInDirectionComplete (err) {
                    if(err) return reply(false, "Should " + key + " `" + action[key] + "` (" + err.message + ")");

                    scope.tree.update(function (err, tree) {                      
                        if(err) return reply(false, "Should " + key + " `" + action[key] + "` (" + err.message + ")");
                        scope.console.debug("Got tree hash:", hash);

                        var execute = function (done) {
                            if(typeof action.execute === "string") {
                                core.execute(action, function (response, msg) {
                                    if(!response) return reply(false, "Should " + key + " `" + action[key] + "` (" + msg + ")");
                                    done();
                                }, scope);
                            }
                            else if (typeof action.validate === "string") {
                                if(!action.type) action.type = "screen";

                                core.validateType(action, function (response, msg) {
                                    if(!response) return reply(false, "Should " + key + " `" + action[key] + "` (" + msg + ")");
                                    done();
                                }, scope);
                            }
                            else {
                                done();
                            }
                        };

                        execute(function () {
                            if(tree.hash === hash) {
                                reply(true, "Should " + key + " `" + action[key] + "`");
                            }
                            else {
                                hash = tree.hash;
                                scrollInDirection(direction, scope, windowInfo, scrollInDirectionComplete);
                            }
                        });
                    });
                });
            });
        }
    }
    else {
        reply(false, "Action `" + key + "` only applies to the Automator framework!");
    }
}

/**
* For android only, scroll an element to top, and optionally execute an action file each time...
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.scrollToTop = function (action, reply, scope) {
    return scrollToGeneric("up", "scrollToTop", action, reply, scope);
};

/**
* For android only, scroll an element to bottom, and optionally execute an action file each time...
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.scrollToBottom = function (action, reply, scope) {
    return scrollToGeneric("down", "scrollToBottom", action, reply, scope);
};




//////////////////////////////////////////////////////// MONKEY ////////////////////////////////////////////////////////

/**
* Tap random elements, n times
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.monkey = function (action, reply, scope, n, tempSelector) {
    n = n || 0;

    var orientations = ["landscape left", "landscape right", "portrait", "portrait upsidedown"],
        e            = scope.elements().randomWithSelector(tempSelector || action.selector || "*"),
        newReply;

    tempSelector = null;

    newReply = function (passed, msg) {
        var max = parseInt(action.monkey, 10);
        if(isNaN(max)) max = 10;
        if(++n < max) {
            scope.console.pass(msg);

            if(/text/ig.test(e.type)) {
                var randomString = String.randomString();
                var setAction = { set: "#" + e.id, to: randomString };
                core.setTo(setAction, function () { exports.monkey(action, reply, scope, n); }, scope);
            }
            else {
                if(action.randomRotation) {
                    var rand = Math.floor(Math.sodarandom() * 4);
                    scope.device.rotateDevice(orientations[rand], function () {
                        scope.tree.update(function (err) {
                            if(err) return reply(false, "Should perform monkey for " + action.monkey + "taps (" + err + ")");
                            exports.monkey(action, reply, scope, n);
                        });
                    });
                }
                else {
                    exports.monkey(action, reply, scope, n);
                }
            }
        }
        else {
            reply(passed, "Should perform monkey for " + action.monkey + " taps (" + msg + ")");
        }
    };

    if(e) {
        var options;

        if(action.randomTouchEffects === true) {
            options = {
                tapCount   : Math.floor(Math.sodarandom() * 3) + 1,
                touchCount : Math.floor(Math.sodarandom() * 5) + 1,
                duration   : Math.floor(Math.sodarandom() * 6)
            };
        }
        else {
            options = {};
        }

        core.performElementInteraction("tap", e, newReply, options, e.id, true, scope);
    }
    else {
        exports.monkey(action, reply, scope, n, "*[visible=true]");
    }
};

/**
* Tap random screen coordinates, for n seconds
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.superMonkey = function (action, reply, scope) {
    scope.soda.framework.getScreenBounds(function (err, bounds) {

        var maxX = bounds[0],
            maxY = bounds[1],
            x, y,

        time = Date.now(),
        performTap = function () {
            x = Math.floor(Math.sodarandom() * (maxX + 1));
            y = Math.floor(Math.sodarandom() * (maxY + 1));

            scope.device.tapXY(x, y, function (err, performed) {
                if(err) return reply(false, "Should tap screen coordinates [" + x + ", " + y + "] (" + err.message + ")");
                if(!performed) return reply(false, "Should tap screen coordinates [" + x + ", " + y + "] (Device interaction failed)");

                scope.console.pass("Should tap screen coordinates [" + x + ", " + y + "]");

                if((Date.now() - time) / 1000 <= action.superMonkey) {
                    performTap();
                }
                else {
                    reply(true, "Should perform super monkey for " + action.superMonkey + " seconds.");
                }
            });
        };
        performTap();
    });
};

/**
* Tap random screen coordinates, with 1-5 touches (fingers), for a random duration for n seconds
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.ultraMonkey = function (action, reply, scope) {
    scope.soda.framework.getScreenBounds(function (err, bounds) {

        var maxX = bounds[0],
            maxY = bounds[1],

        i = 0, done = 0;

        while(i < action.ultraMonkey) {
            i++;

            var x = Math.floor(Math.sodarandom() * (maxX + 1)),
                y = Math.floor(Math.sodarandom() * (maxY + 1)),

                options = {
                    tapCount   : Math.floor(Math.sodarandom() * 3) + 1,
                    touchCount : Math.floor(Math.sodarandom() * 5) + 1,
                    duration   : Math.floor(Math.sodarandom() * 6)
                };

            scope.device.tapXY(x, y, options, function (err, performed) {
                done++;

                if(err) {
                    scope.console.fail(false, "Should tap screen coordinates [" + this.x + ", " + this.y + "] (" + err.message + ")");
                }
                else if(!performed) {
                    scope.console.fail(false, "Should tap screen coordinates [" + this.x + ", " + this.y + "] (Device interaction failed)");
                }
                else {
                    scope.console.pass("Should tap screen coordinates [" + this.x + ", " + this.y + "]");
                }

                if(i === done) {
                    reply(true, "Should perform ultra monkey for " + action.ultraMonkey + " taps.");
                }
            }.bind({ x: x, y: y }));
        }
    });
};

//////////////////////////////////////////////////// ROTATE DEVICE /////////////////////////////////////////////////////

/**
 * Rotates a device in a particular direction
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.rotateDevice = function (action, reply, scope) {
    scope.device.rotateDevice(action.rotateDevice, function (err, rotated) {
        if(err) return reply(false, "Should rotate device (" + err.message + ")");
        if(!rotated) return reply(false, "Should rotate device (Unable to rotate device: framework replied false)");

        scope.tree.update(function () {
            reply(true, "Should rotate device");
        });
    });
};

/**
 * Starts an application
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.startApp = function (action, reply, scope) {
    scope.device.startApp(action.startApp, action.args, function (err, res) {
        if(err) {
            reply(false, "Should start `" + action.startApp + "` (" + err.message + ")");
        }
        else if(!res) {
            reply(false, "Should start `" + action.startApp + "` (Framework replied false)");
        }
        else {
            reply(true, "Should start `" + action.startApp + "`");
        }
    });
};

/**
 * Starts an application and waits for its completion
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.startAppAndWait = function (action, reply, scope) {
    scope.device.startAppAndWait(action.startAppAndWait, action.args, function (err, res) {
        if(err) {
            reply(false, "Should start `" + action.startAppAndWait + "` on args (" + err.message + ")");
        }
        else if(!res) {
            reply(false, "Should start `" + action.startAppAndWait + "` on args (Framework replied false)");
        }
        else {
            reply(true, "Should start `" + action.startAppAndWait + "` on args");
        }
    });
};

/**
 * Stops an application
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.stopApp = function (action, reply, scope) {
    scope.device.stopApp(action.stopApp, action.args, function (err, res) {
        if(err) {
            reply(false, "Should stop `" + action.stopApp + "` (" + err.message + ")");
        }
        else if(!res) {
            reply(false, "Should stop `" + action.stopApp + "` (Framework replied false)");
        }
        else {
            reply(true, "Should stop `" + action.stopApp + "`");
        }
    });
};

/**
 * Opens an application
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.openApp = function (action, reply, scope) {
    scope.device.startApp(action.openApp, {}, function (err, res) {
        if(err) {
            reply(false, "Should open `" + action.openApp + "` (" + err.message + ")");
        }
        else if(!res) {
            reply(false, "Should open `" + action.openApp + "` (Framework replied false)");
        }
        else {
            reply(true, "Should open `" + action.openApp + "`");
        }
    });
};

/**
 * Closes an application
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.closeApp = function (action, reply, scope) {
    scope.device.stopApp(action.closeApp, {}, function (err, res) {
        if(err) {
            reply(false, "Should close `" + action.closeApp + "` (" + err.message + ")");
        }
        else if(!res) {
            reply(false, "Should close `" + action.closeApp + "` (Framework replied false)");
        }
        else {
            reply(true, "Should close `" + action.closeApp + "`");
        }
    });
};

/**
 * Sends a key command to a device
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.sendKeyCommand = function (action, reply, scope) {
    scope.device.sendKeyCommand(action.sendKeyCommand, function (err, res) {
        if(err) {
            reply(false, "Should send key command `" + action.sendKeyCommand + "` (" + err.message + ")");
        }
        else if(!res) {
            reply(false, "Should send key command `" + action.sendKeyCommand + "` (Framework replied false)");
        }
        else {
            reply(true, "Should send key command `" + action.sendKeyCommand + "`");
        }
    });
};

/**
 * Takes a device to the home screen
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.homeScreen = function (action, reply, scope) {
    scope.device.homeScreen(function (err, res) {
        if(err) {
            reply(false, "Should go to home screen (" + err.message + ")");
        }
        else if(!res) {
            reply(false, "Should go to home screen (Framework replied false)");
        }
        else {
            reply(true, "Should go to home screen");
        }
    });
};

/**
 * Swipes on a device
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.deviceSwipe = function (action, reply, scope) {
    scope.device.deviceSwipe(action.deviceSwipe, function (err, res) {
        if(err) {
            reply(false, "Should swipe (" + err.message + ")");
        }
        else if(!res) {
            reply(false, "Should swipe (Framework replied false)");
        }
        else {
            reply(true, "Should swipe");
        }
    });
};

/**
 * Swipes left on a device
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.deviceSwipeLeft = function (action, reply, scope) {
    scope.device.deviceSwipe("25%,50%,15%,50%", function (err, res) {
        if(err) {
            reply(false, "Should swipe left (" + err.message + ")");
        }
        else if(!res) {
            reply(false, "Should swipe left (Framework replied false)");
        }
        else {
            reply(true, "Should swipe left");
        }
    });
};

/**
 * Swipes right on a device
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.deviceSwipeRight = function (action, reply, scope) {
    scope.device.deviceSwipe("15%,50%,25%,50%", function (err, res) {
        if(err) {
            reply(false, "Should swipe right (" + err.message + ")");
        }
        else if(!res) {
            reply(false, "Should swipe right (Framework replied false)");
        }
        else {
            reply(true, "Should swipe right");
        }
    });
};

/**
 * Swipes up on a device
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.deviceSwipeUp = function (action, reply, scope) {
    scope.device.deviceSwipe("50%,50%,50%,35%", function (err, res) {
        if(err) {
            reply(false, "Should swipe up (" + err.message + ")");
        }
        else if(!res) {
            reply(false, "Should swipe up (Framework replied false)");
        }
        else {
            reply(true, "Should swipe up");
        }
    });
};

/**
 * Swipes down on a device
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.deviceSwipeDown = function (action, reply, scope) {
    var setup = "50%,35%,50%,50%";
    if (action.deviceSwipeDown !== true) {
        setup = action.deviceSwipeDown;
    }

    scope.device.deviceSwipe(setup, function (err, res) {
        if(err) {
            reply(false, "Should swipe down (" + err.message + ")");
        }
        else if(!res) {
            reply(false, "Should swipe down (Framework replied false)");
        }
        else {
            reply(true, "Should swipe down");
        }
    });
};

/**
 * Sets a persona
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.persona = function (action, reply, scope) {
    scope.device.persona(action.persona, function (err, res) {
        if(err) {
            reply(false, "Should set persona (" + err.message + ")");
        }
        else if(!res) {
            reply(false, "Should set persona (Framework replied false)");
        }
        else {
            reply(true, "Should set persona");
        }
    });
};

/**
 * Locks a screen on a device for a set number of seconds
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.lockScreen = function (action, reply, scope) {
    scope.device.lockScreen(action.lockScreen, function (err, res) {
        if(err) {
            reply(false, "Should lock screen (" + err.message + ")");
        }
        else if(!res) {
            reply(false, "Should lock screen (Framework replied false)");
        }
        else {
            reply(true, "Should lock screen");
        }
    });
};