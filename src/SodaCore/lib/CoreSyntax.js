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
 * @module SodaCore/CoreSyntax
 * @description A set of basic functions to aid in the creation of custom syntaxes.<br>
 * Use these to generate more robust syntaxes, or to stop from re-creating the wheel
 */

var exec = require("child_process").exec;

/////////////////////////////////////////////////////// HELPERS ////////////////////////////////////////////////////////

/**
 * A utility function to attempt to find elements n times
 * @param  {object} e A set of elements
 * @param  {string} selectorType e.g. selector, name, label, id, etc.
 * @param  {string} selector The actual selector value
 * @param  {object} scope The scope object passed to the event handler
 * @param  {function=} complete A callback for completion
 * @param  {number} n For recursion only
 * @return {undefined}
 */
function findElementRetry (e, selectorType, selector, scope, complete, n) {
    if(scope.run.state === "stopped") {
        if(complete instanceof Function) complete(null, null);
        return;
    } else if (scope.run.state === "paused") {
        scope.run.tempState = "waiting";
        if(complete instanceof Function) complete(null, null);
        return;
    }

    n = n || 0;
    scope.console.debug("Element not found, retry attempt:", n + 1);

    if(e && e.length > 0) {
        if(complete instanceof Function) complete(null, e);
        return;
    }

    scope.tree.update(function (err, tree) {
        if(err) {
            if(complete instanceof Function) complete(err, null);
            return;
        }

        var newE = tree.elements()["with" + selectorType.ucFirst](selector);
        if (newE && newE.length > 0) {
            if(complete instanceof Function) complete(null, newE);
        }
        else if (n < scope.config.get("findElementRetries") - 1) {
            findElementRetry(newE, selectorType, selector, scope, complete, ++n);
        }
        else {
            if(complete instanceof Function) complete(null, null);
        }
    });
}

/**
* Perform an interaction with an element
* @param {string} name The name of the element interaction to perform
* @param {object} e The element to perform the interaction upon
* @param {function} reply The action completion callback
* @param {object} options Options to pass to the framework
* @param {string} selector The selector used to find this element
*/
exports.performElementInteraction = function (name, e, reply, options, selector, refresh, scope, n, refreshTemp) {

    n           = n || 0;
    refreshTemp = refreshTemp || false;

    if(e instanceof Array) {
        var elIntCallback = function (passed, msg) {
            if(passed === false || n >= e.length) {
                reply(passed, msg);
            }
            else {
                exports.performElementInteraction(
                    name,
                    e[n],
                    elIntCallback,
                    options,
                    selector,
                    n === e.length - 1 ? refreshTemp : false,
                    scope,
                    ++n
                );
            }
        };

        exports.performElementInteraction(
            name,
            e[n],
            elIntCallback,
            options,
            selector,
            false,
            scope,
            n,
            refresh
        );
    }
    else {
        e[name](options || {}, function (err, performed) {
            if(performed) {
                if(refresh !== false) {
                    scope.tree.update(function (err, tree) {
                        if(err || !tree) {
                            reply(false, "Should " + name + " `" + selector + "`" + (err ? "(" + err.message + ")" : ""));
                        }
                        else {
                            reply(true, "Should " + name + " `" + selector + "`");
                        }
                    });
                }
                else {
                    reply(true, "Should " + name + " `" + selector + "`");
                }
            }
            else {
                reply(false, "Should " + name + " `" + selector + "`" + (err ? "(" + err.message + ")" : ""));
            }
        });
    }
};

/**
* Set the value of an element
* @param {object} e The element to perform the interaction upon
* @param {function} reply The action completion callback
* @param {string} value The value to set the element with
* @param {string} selector The selector used to find this element
*/
exports.setValue = function (e, value, reply, selector, mask) {
    e.setValue(value, function (err, performed) {
        return ((err || !performed) && !err.message.includes("element not visible")) ?
        reply(false, "Should set value of `" + selector + "`" + (err ? "(" + err.message + ")" : "")) :
        reply(true, "Should set value of " + " `" + selector + "`");
    }, mask);
};

/**
* Checks than an element exists in the element array, and that only one element exists within the array.
* @param {string} actionName The name of the action
* @param {Array|Error} e An array of elements
* @param {function} reply The action completion callback
* @param {string} selectorType The selector type
* @param {string} selector The selector used to find this element
*/
exports.checkExistsAndIsSingleElement = function (actionName, e, selectorType, selector, scope, reply, complete) {
    if(e instanceof Error) {
        reply(false, "Should " + actionName + " `" + selector + "` (" + e.message + ")");
    }
    else if(e && e.length > 1) {
        reply(false, "Should " + actionName + " `" + selector + "` (AmbiguousSelector: Unable to " + actionName + " multiple elements)");
    }
    else if(!e || e.length === 0) {
        findElementRetry(e, selectorType, selector, scope, function (err, e) {
            if(err || !e || (e && e.length <= 0)) {
                reply(false, "Should " + actionName + " `" + selector + "` (No elements found with " + selectorType + " `" + selector + "`)");
            }
            else {
                if(complete instanceof Function) complete(e);
            }
        });
    }
    else {
        if(complete instanceof Function) complete(e);
    }
};

/**
*
* @param actionName
* @param e
* @param selectorType
* @param selector
* @param reply
* @returns {boolean}
*/
exports.checkElementExists = function (actionName, e, selectorType, selector, scope, reply, complete) {
    if(e instanceof Error) {
        reply(false, "Should " + actionName + " `" + selector + "` (" + e.message + ")");
    }
    else if(!e || e.length === 0) {
        findElementRetry(e, selectorType, selector, scope, function (err, e) {
            if(err || !e || (e && e.length <= 0)) {
                reply(false, "Should " + actionName + " `" + selector + "` (No elements found with " + selectorType + " `" + selector + "`)");
            }
            else {
                if(complete instanceof Function) complete(e);
            }
        });
    }
    else {
        if(complete instanceof Function) complete(e);
    }
};

/**
*
* @param actionName
* @param e
* @param selectorType
* @param selector
* @param reply
* @returns {boolean}
*/
exports.checkElementDoesNotExist = function (actionName, e, selectorType, selector, scope, reply, complete) {
    if(e instanceof Error) {
        reply(false, "Should " + actionName + " `" + selector + "` (" + e.message + ")");
    }
    else if(!e || e.length === 0) {
        if(complete instanceof Function) complete(e);
    }
    else {
        if(complete instanceof Function) complete(e);
    }
};

/**
* Check that the value of `using` passed in, is a property of elements
* @param {Array} elements The elements Tree object
* @param {string} using The value to assert is a property of elements
* @param {function} reply The action completion callback, if failed this will be called
* @returns {boolean}
*/
exports.checkUsing = function (elements, using, reply) {
    if(!elements["with" + using.ucFirst]) {
        reply(false, "Invalid value for key `using`");
        return false;
    }
    return true;
};

//////////////////////////////////////////////////////// DEBUG /////////////////////////////////////////////////////////

/**
* Print objects to the screen, for debugging. This will print all keys, value pairs in the action
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
*/
exports.debug = function (action, reply, scope) {
    action.sodaeach(function (value, key) {
        var val = value;
        try { 
            val = JSON.stringify(val, null, '    '); 
        } 
        catch (e) { 
            /* No Op */ 
        }
        scope.console.log("Action Debug >> " + key + ": " + val);
    });

    reply(true);
};

/**
* Refresh the screen
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param scope {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.refresh = function (action, reply, scope) {
    scope.tree.update(function (err, tree) {
        if (err) {
            reply(false, "Should refresh screen (" + err.message + ")");
        }
        else if(tree) {
            reply(true, "Should refresh screen");
        }
        else {
            reply(false, "Should refresh screen (Screen refresh failed)");
        }
    });
};

/////////////////////////////////////////////////////// SCROLL /////////////////////////////////////////////////////////

/**
* Scroll an element if it is visible with a using clause
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.scrollToVisibleUsing = function (action, reply, scope) {
    if(exports.checkUsing(scope.elements(), action.using, reply)) {
        var e = scope.elements()["with" + action.using.ucFirst](action.scrollToVisible);
        if (e.length > 0 && !e.visible) {
          exports.checkExistsAndIsSingleElement("scrollToVisible", e, action.using, action.scrollToVisible, scope, reply, function () {
              exports.performElementInteraction("scrollToVisible", e[0], reply, {}, action.scrollToVisible, action.refresh, scope);
          });
        }
        else {
          reply(true, "Didn't need to scroll because it already was visible");
        }
    }
};

/**
* Scroll an element if it is visible
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.scrollToVisible = function (action, reply, scope) {
    action.using = "selector";
    exports.scrollToVisibleUsing(action, reply, scope);
};

/**
* Scroll an element that matches the text
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.scrollToVisibleText = function (action, reply, scope) {
    exports.performElementInteraction("scrollToVisibleText", action.scrollToVisibleText, reply, {}, action.scrollToVisibleText, action.refresh, scope);
};

/**
* Scroll an element if it is visible in a particular direction
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.scrollToVisibleWithDirection = function (action, reply, scope) {
    action.using = "selector";

    if(exports.checkUsing(scope.elements(), action.using, reply)) {
        var e = scope.elements()["with" + action.using.ucFirst](action.scrollToVisibleWithDirection);
        exports.checkExistsAndIsSingleElement("scroll", e, action.using, action.scrollToVisibleWithDirection, scope, reply, function () {
            exports.performElementInteraction("scroll", e[0], reply, { direction: action.direction }, action.scrollToVisibleWithDirection, action.refresh, scope);
        });
    }
};

/**
* Scroll an element
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.scrollDirectionUsing = function (action, reply, scope) {
    if(exports.checkUsing(scope.elements(), action.using, reply)) {
        var e = scope.elements()["with" + action.using.ucFirst](action.scroll);
        exports.checkExistsAndIsSingleElement("scroll", e, action.using, action.scroll, scope, reply, function () {
            exports.performElementInteraction("scroll", e[0], reply, { direction: action.direction, amount: action.amount || 1 }, action.scroll, action.refresh, scope);
        });
    }
};

/**
* Scroll an element
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.scrollDirection = function (action, reply, scope) {
    action.using = "selector";
    exports.scrollDirectionUsing(action, reply, scope);
};

/**
* Scroll an element
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.scroll = function (action, reply, scope) {
    action.direction = "down";
    action.using = "selector";
    exports.scrollDirectionUsing(action, reply, scope);
};

////////////////////////////////////////////////////// VARIABLES ///////////////////////////////////////////////////////

/**
* Store a variable with the specified value
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.storeAs = function (action, reply, scope) {
    if(action['capture']) {
        var captured = null;

        try {
            captured = action['store'].match(new RegExp(action['capture'], (typeof action['flags'] === "string" ? action['flags'] : "")));
        }
        catch (e) {
            reply(false, "Should capture /" + action['capture'] + "/" + (action['flags'] ? action['flags'] : "") + " from `" + action['store'] + "` as `" + action['as'] + "` (CaptureFailure: Invalid regular expression)");
            return;
        }

        if(!captured) {
            reply(false, "Should capture /" + action['capture'] + "/" + (action['flags'] ? action['flags'] : "") + " from `" + action['store'] + "` as `" + action['as'] + "` (CaptureFailure: Capture was null)");
        }
        else {
            if(action.index && captured[action.index] !== undefined) {
                scope.vars.save(action['as'], captured[action.index], !!action['persistent']);
                reply(true, "Should capture /" + action['capture'] + "/" + (action['flags'] ? action['flags'] : "") + " from `" + action['store'] + "` with index " + action.index + " as `" + action['as'] + "`");
            }
            else {
                if(!action.index) {
                    scope.vars.save(action['as'], captured, !!action['persistent']);
                    reply(true, "Should capture /" + action['capture'] + "/" + (action['flags'] ? action['flags'] : "") + " from `" + action['store'] + "` as `" + action['as'] + "`");
                }
                else {
                    reply(false, "Should capture /" + action['capture'] + "/" + (action['flags'] ? action['flags'] : "") + " from `" + action['store'] + "` as `" + action['as'] + "` (CaptureFailure: Index `" + action.index + "` doesn't exist)");
                }
            }
        }
    }
    else {
        scope.vars.save(action['as'], action['store'], !!action['persistent']);
        reply(true, "Should store `" + action['store'] + "` as `" + action['as'] + "`");
    }
};

/**
* Store a variable with the specified value using a lazy method, no substitutions
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.storeLazyAs = function (action, reply, scope) {
    if(action['capture']) {
        var captured = null;

        try {
            captured = action['store'].match(new RegExp(action['capture'], (typeof action['flags'] === "string" ? action['flags'] : "")));
        }
        catch (e) {
            reply(false, "Should capture /" + action['capture'] + "/" + (action['flags'] ? action['flags'] : "") + " from `" + action['store'] + "` as `" + action['as'] + "` (CaptureFailure: Invalid regular expression)");
            return;
        }

        if(!captured) {
            reply(false, "Should capture /" + action['capture'] + "/" + (action['flags'] ? action['flags'] : "") + " from `" + action['store'] + "` as `" + action['as'] + "` (CaptureFailure: Capture was null)");
        }
        else {
            if(action.index && captured[action.index] !== undefined) {
                scope.vars.save(action['as'], captured[action.index], !!action['persistent']);
                reply(true, "Should capture /" + action['capture'] + "/" + (action['flags'] ? action['flags'] : "") + " from `" + action['store'] + "` with index " + action.index + " as `" + action['as'] + "`");
            }
            else {
                if(!action.index) {
                    scope.vars.save(action['as'], captured, !!action['persistent']);
                    reply(true, "Should capture /" + action['capture'] + "/" + (action['flags'] ? action['flags'] : "") + " from `" + action['store'] + "` as `" + action['as'] + "`");
                }
                else {
                    reply(false, "Should capture /" + action['capture'] + "/" + (action['flags'] ? action['flags'] : "") + " from `" + action['store'] + "` as `" + action['as'] + "` (CaptureFailure: Index `" + action.index + "` doesn't exist)");
                }
            }
        }
    }
    else {
        scope.vars.save(action['as'], action['store'], !!action['persistent']);
        reply(true, "Should store lazy `" + action['store'] + "` as `" + action['as'] + "`");
    }
};

/**
* Save an element property as a variable
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.saveAsPropertyUsing = function (action, reply, scope) {
    if(exports.checkUsing(scope.elements(), action.using, reply)) {
        var e = scope.elements()["with" + action.using.ucFirst](action.save);
        exports.checkExistsAndIsSingleElement("save", e, action.using, action.save, scope, reply, function (newE) {
            var childProperty = newE[0].findChildByPath(action.property, ".");

            if(childProperty !== null && childProperty !== undefined) {
                if(action['capture']) {

                    var captured = null;

                    try {
                        captured = childProperty.match(new RegExp(action.capture, (typeof action['flags'] === "string" ? action['flags'] : "")));
                    }
                    catch (e) {
                        reply(false, "Should save `" + action['save'] + "` property `" + action.property + "` as `" + action['as'] + "` (CaptureFailure: Invalid regular expression)");
                        return;
                    }

                    if(!captured) {
                        reply(false, "Should save `" + action['save'] + "` property `" + action.property + "` as `" + action['as'] + "` (CaptureFailure: Capture was null)");
                        return;
                    }
                    else {
                        if(action.index !== null && action.index !== undefined) {
                            if(captured[action.index] === undefined) {
                                reply(false, "Should save `" + action['save'] + "` property `" + action.property + "` as `" + action['as'] + "` (CaptureFailure: Index " + action.index + " doesn't exist)");
                            }
                            else {
                                scope.vars.save(action['as'], captured[action.index], false);
                                reply(true, "Should save `" + action['save'] + "` property `" + action.property + "` as `" + action['as'] + "`, capturing /" + action.capture + "/ at index " + action.index + "`");
                            }
                        }
                        else {
                            scope.vars.save(action['as'], captured, false);
                            reply(true, "Should save `" + action['save'] + "` property `" + action.property + "` as `" + action['as'] + "`, capturing /" + action.capture + '/');
                        }
                    }
                }
                else {
                    scope.vars.save(action['as'], childProperty, false);
                    reply(true, "Should save `" + action['save'] + "` property `" + action.property + "` as `" + action['as'] + "`");
                }
            }
            else {
                reply(false, "Should save `" + action['save'] + "` property `" + action.property + "` as `" + action['as'] + "` (InvalidProperty: Property doesn't exist)");
            }
        });
    }
};

/**
* Save an element property as a variable
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.saveAsProperty = function (action, reply, scope) {
    action.using = "selector";
    exports.saveAsPropertyUsing(action, reply, scope);
};

/**
* Save an element as a variable
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.saveAsUsing = function (action, reply, scope) {
    if(exports.checkUsing(scope.elements(), action.using, reply)) {
        var e = scope.elements()["with" + action.using.ucFirst](action.save);
        exports.checkExistsAndIsSingleElement("save", e, action.using, action.save, scope, reply, function () {
            scope.vars.save(action['as'], e[0]);
            reply(true, "Should save `" + action['save'] + "` as `" + action['as'] + "`");
        });
    }
};

/**
* Save an element as a variable if it exists, otherwise set as default
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.saveAsIfExistsUsing = function (action, reply, scope) {
    if(exports.checkUsing(scope.elements(), action.using, reply)) {
        var e = scope.elements()["with" + action.using.ucFirst](action.saveIfExists);

        if(e instanceof Error) {
            scope.vars.save(action['as'], action.default);
            reply(true, "Should save `" + action['saveIfExists'] + "` as `" + action['default'] + "`");
        }
        else if(e && e.length > 1) {
            scope.vars.save(action['as'], action.default);
            reply(true, "Should save `" + action['saveIfExists'] + "` as `" + action['default'] + "`");
        }
        else if(!e || e.length === 0) {
            scope.vars.save(action['as'], action.default);
            reply(true, "Should save `" + action['saveIfExists'] + "` as `" + action['default'] + "`");
        }
        else {
            if (action.property) {
                var prop = e[0].findChildByPath(action.property, ".");

                if(prop === null) {
                  scope.vars.save(action['as'], action.default);
                  reply(true, "Should save `" + action['saveIfExists'] + "` as `" + action['default'] + "`");
                }
                else if(prop === undefined) {
                    scope.vars.save(action['as'], action.default);
                    reply(true, "Should save `" + action['saveIfExists'] + "` as `" + action['default'] + "`");
                }
                else {
                    scope.vars.save(action['as'], prop);

                    reply(true, "Should save `" + action['saveIfExists'] + "` as `" + prop + "`");
                }
            }
            else {
                scope.vars.save(action['as'], e[0]);

                reply(true, "Should save `" + action['saveIfExists'] + "` as `" + e[0] + "`");
            }
        }
    }
};

/**
* Save an element as a variable
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.saveAs = function (action, reply, scope) {
    action.using = "selector";
    exports.saveAsUsing(action, reply, scope);
};

/**
* Save an element as a variable if exists, otherwise save default
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.saveAsIfExists = function (action, reply, scope) {
    action.using = "selector";
    exports.saveAsIfExistsUsing(action, reply, scope);
};


///////////////////////////////////////////////////// SAVE AS ALL //////////////////////////////////////////////////////
///
/**
* Save an element property as a variable
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.saveAllAsPropertyUsing = function (action, reply, scope) {
    if(exports.checkUsing(scope.elements(), action.using, reply)) {
        var e = scope.elements()["with" + action.using.ucFirst](action.saveAll);
        scope.vars.save(action.as, [], false);
        e.sodaeach(function(el) {

            var childProperty = el.findChildByPath(action.property, "."),
                variable;

            if(childProperty !== null && childProperty !== undefined) {
                if(action.capture) {
                    var captured = null;

                    try {
                        captured = childProperty.match(new RegExp(action.capture, (typeof action.flags === "string" ? action.flags : "")));
                    }
                    catch (e) {
                        reply(false, "Should save `" + action.saveAll  + "` property `" + action.property + "` as `" + action.as + "` (CaptureFailure: Invalid regular expression)");
                        return;
                    }

                    if(!captured) {
                        reply(false, "Should save `" + action.saveAll  + "` property `" + action.property + "` as `" + action.as + "` (CaptureFailure: Capture was null)");
                        return false;
                    }
                    else {
                        if(action.index !== null && action.index !== undefined) {
                            if(captured[action.index] === undefined) {
                                reply(false, "Should save `" + action.saveAll + "` property `" + action.property + "` as `" + action.as + "` (CaptureFailure: Index " + action.index + " doesn't exist)");
                                return false;
                            }
                            else {
                                scope.vars.save(action.as, captured[action.index], false);
                                if(el === e.sodalast()) reply(true, "Should save `" + action.saveAll  + "` property `" + action.property + "` as `" + action.as + "`, capturing /" + action.capture + "/ at index " + action.index + "`");
                            }
                        }
                        else {
                            variable = scope.vars.get(action.as);
                            variable.push(childProperty);
                            if(el === e.sodalast()) reply(true, "Should save `" + action.saveAll  + "` property `" + action.property + "` as `" + action.as + "`, capturing /" + action.capture + '/');
                        }
                    }
                }
                else {
                    variable = scope.vars.get(action.as);
                    variable.push(childProperty);
                    if(el === e.sodalast()) reply(true, "Should save `" + action.saveAll  + "` property `" + action.property + "` as `" + action.as + "`");
                }
            }
            else {
                reply(false, "Should save `" + action.saveAll  + "` property `" + action.property + "` as `" + action.as + "` (InvalidProperty: Property doesn't exist)");
                return false;
            }
        });
    }
};

/**
* Save an element property as a variable
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.saveAllAsProperty = function (action, reply, scope) {
    action.using = "selector";
    exports.saveAllAsPropertyUsing(action, reply, scope);
};

/**
* Save an element as a variable
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.saveAllAsUsing = function (action, reply, scope) {
    if(exports.checkUsing(scope.elements(), action.using, reply)) {
        var e = scope.elements()["with" + action.using.ucFirst](action.saveAll);
        scope.vars.save(action.as, e);
        reply(true, "Should save `" + action.saveAll + "` as `" + action.as + "`");
    }
};

/**
* Save an element as a variable
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.saveAllAs = function (action, reply, scope) {
    action.using = "selector";
    exports.saveAllAsUsing(action, reply, scope);
};

/////////////////////////////////////////////////// SET ELEMENT VALUE //////////////////////////////////////////////////

/**
* Set an element's value
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.setTo = function (action, reply, scope) {
    action.using = "selector";
    exports.setToUsing(action, reply, scope);
};

/**
* Type a value in an element
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.setToUsing = function (action, reply, scope) {
    if(exports.checkUsing(scope.elements(), action.using, reply)) {
        var e = scope.elements()["with" + action.using.ucFirst](action.set);
        exports.checkExistsAndIsSingleElement("set", e, action.using, action.set, scope, reply, function () {
            exports.setValue(e[0], action.to, reply, action.set, action.mask);
        });
    }
};

/**
* Type a value in an element
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.typeIn = function (action, reply, scope) {
    action.using = "selector";
    exports.typeInUsing(action, reply, scope);
};

/**
* Type a value in an element
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.typeInUsing = function (action, reply, scope) {
    if(exports.checkUsing(scope.elements(), action.using, reply)) {
        var e = scope.elements()["with" + action.using.ucFirst](action.typeIn);
        exports.checkExistsAndIsSingleElement("typeIn", e, action.using, action.typeIn, scope, reply, function (newE) {
            exports.performElementInteraction("typeIn", newE[0], reply, { value: action.value }, action.typeIn, action.refresh, scope);
        });
    }
};

/**
* Send keys to an element
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.sendKeys = function (action, reply, scope) {
    action.using = "selector";
    exports.sendKeysUsing(action, reply, scope);
};

/**
* Send keys to an element
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.sendKeysUsing = function (action, reply, scope) {
    if(exports.checkUsing(scope.elements(), action.using, reply)) {
        var e = scope.elements()["with" + action.using.ucFirst](action.sendKeys);
        exports.checkExistsAndIsSingleElement("sendKeys", e, action.using, action.sendKeys, scope, reply, function (newE) {
            exports.performElementInteraction("sendKeys", newE[0], reply, { value: action.value }, action.sendKeys, action.refresh, scope);
        });
    }
};

//////////////////////////////////////////////////////// EXECUTE ///////////////////////////////////////////////////////

/**
* Execute an action file
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.executeType = function (action, reply, scope) {
    var lastModule = scope.config.get("module");

    scope.assets.resolve(
        {
            type     : action.type || "action",
            name     : action.execute,
            suite    : scope.config.get("suite"),
            module   : action.module || scope.config.get("module"),
            accept   : { global: true, common: true },
            platform : scope.config.get("platform"),
            run      : scope.run
        },
        function (err, asset, obj) {
            if(asset) {
                scope.config.set("module", action.module || scope.config.get("module"));

                scope.vars.save("_asset_info_", {
                    name        : obj.name,
                    suite       : obj.suite.name,
                    module      : obj.module.name,
                    platform    : obj.platform.name,
                    description : obj.description,
                    id          : obj.id,
                    path        : obj.path
                });

                asset.evaluate(function (err, result, msg, stopped) {
                    scope.config.set("module", lastModule);
                    reply(result, "Should execute `" + action.execute +  "` ❯ " + (err ? err.message : msg), stopped);
                }, scope.tree);
            }
            else {
                reply(false, "Should execute `" + action.execute +  "` (" + (err ? err.message : action.type + " not found") + ")", false);
            }
        }
    );
};

/**
* Execute an action file multiple times
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.executeAndRepeatType = function (action, reply, scope) {
    var lastModule = scope.config.get("module");

    var doRepeat = function (n) {
        scope.vars.save("n", n);
        scope.vars.save("temp", n);
        scope.assets.resolve(
            {
                type     : action.type || "action",
                name     : action.execute,
                suite    : scope.config.get("suite"),
                module   : action.module || scope.config.get("module"),
                accept   : { global: true, common: true },
                platform : scope.config.get("platform"),
                run      : scope.run
            },
            function (err, asset, obj) {
                if(asset) {
                    scope.config.set("module", action.module || scope.config.get("module"));

                    scope.vars.save("_asset_info_", {
                        name        : obj.name,
                        suite       : obj.suite.name,
                        module      : obj.module.name,
                        platform    : obj.platform.name,
                        description : obj.description,
                        id          : obj.id,
                        path        : obj.path
                    });

                    asset.evaluate(function (err, result, msg, stopped) {
                        if(err || !result) {
                            scope.config.set("module", lastModule);
                            reply(result, "Should execute `" + action.execute +  "` ❯ " + (err ? err.message : msg), stopped);
                        }
                        else if(n === action.repeat - 1) {
                            scope.config.set("module", lastModule);
                            reply(result, "Should execute `" + action.execute +  "`", stopped);
                        }
                        else if(n < action.repeat) {
                            doRepeat(++n);
                        }
                    }, scope.tree);
                }
                else {
                    reply(false, "Should execute `" + action.execute +  "` (" + (err ? err.message : action.type + " not found") + ")", false);
                }
            }
        );
    };

    action.repeat = parseInt(action.repeat, 10);
    if(isNaN(action.repeat)) {
        reply(false, "Should execute `" + action.execute +  "` (Repeat must be an integer)");
    }
    else if(action.repeat > 0) {
        doRepeat(0);
    }
    else {
        reply(true, "Should execute `" + action.execute +  "` (Repeat was zero)");
    }
};


/**
* Execute and repeat over an array
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.executeOverType = function (action, reply, scope) {
    var lastModule = scope.config.get("module");

    if(!(action.over instanceof Array)) {
        return reply(false, "Should execute and repeat over `" + action.execute +  "` (The `over` key value must be an array!)");
    }

    var doRepeat = function (n) {
        scope.vars.save("n", n);
        scope.vars.save("temp", action.over[n]);
        scope.assets.resolve(
            {
                type     : action.type || "action",
                name     : action.execute,
                suite    : scope.config.get("suite"),
                module   : action.module || scope.config.get("module"),
                accept   : { global: true, common: true },
                platform : scope.config.get("platform"),
                run      : scope.run
            },
            function (err, asset, obj) {
                if(asset) {
                    scope.config.set("module", action.module || scope.config.get("module"));

                    scope.vars.save("_asset_info_", {
                        name        : obj.name,
                        suite       : obj.suite.name,
                        module      : obj.module.name,
                        platform    : obj.platform.name,
                        description : obj.description,
                        id          : obj.id,
                        path        : obj.path
                    });

                    asset.evaluate(function (err, result, msg, stopped) {

                        if(err || !result) {
                            scope.config.set("module", lastModule);
                            reply(result, "Should execute and repeat over `" + action.execute +  "` ❯ " + (err ? err.message : msg), stopped);
                        }
                        if(n === action.repeat - 1) {
                            scope.config.set("module", lastModule);
                            reply(result, "Should execute and repeat over `" + action.execute +  "`", stopped);
                        }
                        else if(n < action.repeat) {
                            doRepeat(++n);
                        }

                    }, scope.tree);
                }
                else {
                    reply(false, "Should execute and repeat over `" + action.execute +  "` (" + (err ? err.message : action.type + " not found") + ")", false);
                }
            }
        );
    };

    action.repeat = action.over.length;
    if(action.repeat === 0) {
        reply(true, "Should execute and repeat over `" + action.execute +  "` (Nothing to execute, over key value has length zero)");
    }
    else {
        doRepeat(0);
    }
};

/**
* Execute and repeat over an array
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.executeOver = function (action, reply, scope) {
    action.type = "action";
    exports.executeOverType(action, reply, scope);
};


/**
* Execute and repeat over an array
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.executeOverVariable = function (action, reply, scope) {
    action.type = "action";
    if(typeof action.overVariable === "string") {
        action.over = scope.vars.get(action.overVariable);

        if(action.over && action.over instanceof Array) {
            exports.executeOver(action, reply, scope);
        }
        else if(action.over && action.over instanceof Object) {
            action.over = scope.vars.get(action.overVariable).value;
            exports.executeOver(action, reply, scope);
        }
        else {
            reply(false, "Should execute and repeat over variable `" + action.execute +  "` (Could not executeOver value `" + action.over + "`)");
        }
    }
    else {
        action.over = action.overVariable;
        exports.executeOver(action, reply, scope);
    }
};

/**
* Execute an action file
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.execute = function (action, reply, scope) {
    action.type = "action";
    exports.executeType(action, reply, scope);
};

/**
* Execute a widget
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.executeWidget = function (action, reply, scope) {
    action.execute = action.executeWidget;
    exports.executeType(action, reply, scope);
};

/**
* Execute an action file multiple times
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.executeAndRepeat = function (action, reply, scope) {
    action.type = "action";
    exports.executeAndRepeatType(action, reply, scope);
};

/////////////////////////////////////////////////////// VALIDATE ///////////////////////////////////////////////////////

/**
* Validate a screen, menu, or popup
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.validateType = function (action, reply, scope) {

    if(action.type === "action")
    reply(false, "Should validate `" + action.validate + "` (Validate is for screen, menus, and popups... use execute for actions!)");

    scope.assets.resolve(
        {
            type     : action.type || "screen",
            name     : action.validate,
            suite    : scope.config.get("suite"),
            module   : scope.config.get("module"),
            accept   : { global: true, common: true },
            platform : scope.config.get("platform"),
            run      : scope.run
        },
        function (err, asset, obj) {
            if(asset) {

                scope.vars.save("_asset_info_", {
                    name        : obj.name,
                    suite       : obj.suite.name,
                    module      : obj.module.name,
                    platform    : obj.platform.name,
                    description : obj.description,
                    id          : obj.id,
                    path        : obj.path
                });

                asset.evaluate(function (err, result, msg, stopped) {
                    scope.console.debug(action.type.ucFirst + " Validation complete...");
                    reply(result, "Should validate `" + action.validate +  "` ❯ " + msg, stopped);
                }, scope.tree);
            }
            else {
                reply(false, "Should validate `" + action.validate +  "` (" + (err.message || action.type + " not found") + ")", false);
            }
        }
    );
};

/**
* Validate a screen, menu, or popup
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.validate = function (action, reply, scope) {
    action.type = "screen";
    exports.validateType(action, reply, scope);
};

///////////////////////////////////////////////////////// WAIT /////////////////////////////////////////////////////////

/**
* Wait for the specified number of seconds
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
*/
exports.wait = function (action, reply, scope) {
    scope.console.log("Waiting for " + action.wait + " seconds...");

    if(action.wait.isNumeric) {
        if (parseFloat(action.wait) > 150) {
          setTimeout(function () {
              scope.soda.framework.getTree(function(err, result) {
                scope.console.log('Keeping session alive');
              });
          }, parseFloat(action.wait)/2 * 1000);
        }

        setTimeout(function () {
            reply(true, "Should wait " + action.wait + " seconds");
        }, parseFloat(action.wait) * 1000);
    }
    else {
        reply(false, "Should wait " + action.wait + " seconds (Wait expected a numeric value, but got " + typeof action.wait + ")");
    }
};

/**
* Wait for an element
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
* @param {number=} n For recursion only
*/
exports.waitForUsing = function (action, reply, scope, n) {

    if(scope.run.state === "stopped") {
      reply(false, "Should wait for elements with " + action.using + "`" + action.waitFor + "` (Element with " + action.using + " `" +
      action.waitFor + "` stopped)");
      return;
    }
    else if (scope.run.state === "paused") {
      scope.run.tempState = "waiting";
      reply(false, "Should wait for elements with " + action.using + "`" + action.waitFor + "` (Element with " + action.using + " `" +
      action.waitFor + "` paused)");
      return;
    }

    scope.console.debug("Waiting for element `" + action.waitFor + '`');
    var retries = scope.config.get("findElementRetries");
    n = n || 0;

    var e = scope.elements()["with" + action.using.ucFirst](action.waitFor);
    if(e && e.length > 0 && e[0].visible && scope.soda.framework.name.toLowerCase() === "perfecto") {
        reply(true, "Should wait for elements `" + action.waitFor + "`");
        return;
    }
    else if (e && e.length > 0) {
        reply(true, "Should wait for elements `" + action.waitFor + "`");
        return;
    }
    scope.tree.update(function (err, tree) {

        scope.console.debug("Waiting for element: tree update");
        if(err) {
            reply(true, "Should wait for elements with " + action.using + " `" + action.waitFor + "` (" + err.message + ")");
            return;
        }

        var e = tree.elements()["with" + action.using.ucFirst](action.waitFor);
        if(e && e.length > 0 && e[0].visible && scope.soda.framework.name.toLowerCase() === "perfecto") {
            reply(true, "Should wait for elements with " + action.using + " `" + action.waitFor + "`");
            return;
        }

        if (e && e.length && scope.soda.framework.name.toLowerCase() !== "perfecto") {
            reply(true, "Should wait for elements with " + action.using + " `" + action.waitFor + "`");
            return;
        }
        else if (n < retries) {
            exports.waitForUsing(action, reply, scope, ++n);
            return;
        }
        else {
            reply(false, "Should wait for elements with " + action.using + " `" + action.waitFor + "` (Element with " + action.using + " `" + action.waitFor + "` not found)");
        }
    });
};

/**
* Wait for an element
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.waitFor = function (action, reply, scope) {
    action.using = "selector";
    exports.waitForUsing(action, reply, scope);
};

////////////////////////////////////////////////////// VALIDATIONS /////////////////////////////////////////////////////

/**
* Assert a collection of elements has a certain length
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.assertHasCountUsing = function (action, reply, scope) {
    var e = scope.elements()["with" + action.using.ucFirst](action.assert);

    if (e.length === 0 && parseFloat(action.hasCount) === 0) {
        return reply(true, "Elements with " + action.using + " `" + action.assert + "` should return " + action.hasCount + " elements.");
    }

    exports.checkElementExists("assertHasCountUsing", e, action.using, action.assert, scope, reply, function () {
        try {
            if(e.length === parseFloat(action.hasCount)) {
                reply(true, "Elements with " + action.using + " `" + action.assert + "` should return " + action.hasCount + " elements.");
            }
            else {
                reply(false, "Elements with " + action.using + " `" + action.assert + "` should return " + action.hasCount + " elements (Got " + (e instanceof Array ? e.length : 0) + " element(s)).");
            }
        }
        catch(e) {
            reply(false, "Elements with " + action.using + " `" + action.assert + "` should return " + action.hasCount + " elements (" + e.message + ").");
        }
    });
};

/**
* Assert a collection of elements has a certain length
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.assertHasCountGreaterThanUsing = function (action, reply, scope) {
    var e = scope.elements()["with" + action.using.ucFirst](action.assert);

    if (e.length === 0 && parseFloat(action.hasCountGreaterThan) < 0) {
        return reply(true, "Elements with " + action.using + " `" + action.assert + "` should return more than " + action.hasCountGreaterThan + " elements.");
    }

    exports.checkElementExists("assertHasCountGreaterThanUsing", e, action.using, action.assert, scope, reply, function () {
        try {
            if(e.length > parseFloat(action.hasCountGreaterThan)) {
                reply(true, "Elements with " + action.using + " `" + action.assert + "` should return more than " + action.hasCountGreaterThan + " elements.");
            }
            else {
                reply(false, "Elements with " + action.using + " `" + action.assert + "` should return more than " + action.hasCountGreaterThan + " elements (Got " + (e instanceof Array ? e.length : 0) + " element(s)).");
            }
        }
        catch(e) {
            reply(false, "Elements with " + action.using + " `" + action.assert + "` should return more than " + action.hasCountGreaterThan + " elements (" + e.message + ").");
        }
    });
};

/**
* Assert a collection of elements has a certain length
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.assertHasCountLessThanUsing = function (action, reply, scope) {
    var e = scope.elements()["with" + action.using.ucFirst](action.assert);

    if (e.length === 0 && parseFloat(action.hasCountLessThan) > 0) {
        return reply(true, "Elements with " + action.using + " `" + action.assert + "` should return no more than " + action.hasCountLessThan + " elements.");
    }
    exports.checkElementExists("assertHasCountLessThanUsing", e, action.using, action.assert, scope, reply, function () {
        try {
            if(e.length < parseFloat(action.hasCountLessThan)) {
                reply(true, "Elements with " + action.using + " `" + action.assert + "` should return no more than " + action.hasCountLessThan + " elements.");
            }
            else {
                reply(false, "Elements with " + action.using + " `" + action.assert + "` should return no more than " + action.hasCountLessThan + " elements (Got " + (e instanceof Array ? e.length : 0) + " element(s)).");
            }
        }
        catch(e) {
            reply(false, "Elements with " + action.using + " `" + action.assert + "` should return no more than " + action.hasCountLessThan + " elements (" + e.message + ").");
        }
    });
};

/**
* Assert a collection of elements has a certain length
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.assertHasCount = function (action, reply, scope) {
    action.using = "selector";
    exports.assertHasCountUsing(action, reply, scope);
};

/**
* Assert a collection of elements has a certain length
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.assertHasCountGreaterThan = function (action, reply, scope) {
    action.using = "selector";
    exports.assertHasCountGreaterThanUsing(action, reply, scope);
};

/**
* Assert a collection of elements has a certain length
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.assertHasCountLessThan = function (action, reply, scope) {
    action.using = "selector";
    exports.assertHasCountLessThanUsing(action, reply, scope);
};

/**
* Assert than an element has the specified value
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.assertIsUsingProperty = function (action, reply, scope) {
    var e = scope.elements()["with" + action.using.ucFirst](action.assert);
    exports.checkElementExists("assertIsUsing", e, action.using, action.assert, scope, reply, function () {

        var allMatch = e.sodaeach(function (el) {
            var prop = el.findChildByPath(action.property, ".");
            if(prop === null) {
                reply(false,
                    (e.length + " " || "") + "Element(s) with " + action.using + " `" + action.assert + "` and property `" + action.property + "` should have value `" + action.is + "`\n" +
                    "    (Element property `" + action.property + "` is null)"
                );
                return false;
            }
            else if(prop === undefined) {
                reply(false,
                    (e.length + " " || "") + "Element(s) with " + action.using + " `" + action.assert + "` and property `" + action.property + "` should have value `" + action.is + "`\n" +
                    "    (Element property `" + action.property + "` is undefined)"
                );
                return false;
            }
            else if(prop !== action.is) {
                reply(false,
                    (e.length + " " || "") + "Element(s) with " + action.using + " `" + action.assert + "` and property `" + action.property + "` should have value `" + action.is + "`\n" +
                    "    (Element property `" + action.property + "` !== `" + action.is + "`)"
                );
                return false;
            }
        });
        if(allMatch !== false) reply(true, (e.length + " " || "") + "Element(s) with " + action.using + " `" + action.assert + "` and property `" + action.property + "` should have value `" + action.is + "`");
    });
};

/**
* Assert than an element has the specified value
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.assertIsUsing = function (action, reply, scope) {
    action.property = "value";
    exports.assertIsUsingProperty(action, reply, scope);
};

/**
* Assert than an element has the specified value
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.assertIsProperty = function (action, reply, scope) {
    action.using = "selector";
    exports.assertIsUsingProperty(action, reply, scope);
};

/**
* Assert than an element has the specified value
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.assertIs = function (action, reply, scope) {
    action.property = "value";
    action.using = "selector";
    exports.assertIsUsingProperty(action, reply, scope);
};

/**
* Assert than an element matches a regular expression
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.assertMatchesUsingProperty = function (action, reply, scope) {
    var e = scope.elements()["with" + action.using.ucFirst](action.assert);
    exports.checkElementExists("assertMatchingUsing", e, action.using, action.assert, scope, reply, function () {
        var allMatch = e.sodaeach(function (el) {
            var prop = el.findChildByPath(action.property, ".");
            if(prop === null || prop === undefined) {
              try {
                  if(new RegExp(action.matches, (typeof action.flags === "string" ? action.flags : "")).test(prop) === false) {
                      reply(
                          false,
                          (e.length + " " || "") + "Element(s) with " + action.using + " `" + action.assert + "` and property `" + action.property + "` should match /" + action.matches + "/"
                      );
                      return false;
                  }
              }
              catch (e) {
                  reply(
                      false,
                      (e.length + " " || "") + "Element(s) with " + action.using + " `" + action.assert + "` and property `" + action.property + "` should match /" + action.matches + "/\n" +
                      "    (Invalid regular expression!)"
                  );
                  return false;
              }
            }
            else if(prop === undefined) {
                reply(
                    false,
                    (e.length + " " || "") + "Element(s) with " + action.using + " `" + action.assert + "` and property `" + action.property + "` should match /" + action.matches + "/\n" +
                    "    (Element(s) property `" + action.property + "` doesn't exist)"
                );
                return false;
            }
            else {
                try {
                    if(new RegExp(action.matches, (typeof action.flags === "string" ? action.flags : "")).test(prop) === false) {
                        reply(
                            false,
                            (e.length + " " || "") + "Element(s) with " + action.using + " `" + action.assert + "` and property `" + action.property + "` should match /" + action.matches + "/"
                        );
                        return false;
                    }
                }
                catch (e) {
                    reply(
                        false,
                        (e.length + " " || "") + "Element(s) with " + action.using + " `" + action.assert + "` and property `" + action.property + "` should match /" + action.matches + "/\n" +
                        "    (Invalid regular expression!)"
                    );
                    return false;
                }
            }
        });
        if(allMatch !== false) reply(true, (e.length + " " || "") + "Element(s) with " + action.using + " `" + action.assert + "` and property `" + action.property + "` should match /" + action.matches + "/");
    });
};

/**
* Assert than an element matches a regular expression
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.assertMatchesUsing = function (action, reply, scope) {
    action.property = "value";
    exports.assertMatchesUsingProperty(action, reply, scope);
};

/**
* Assert than an element matches a regular expression
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.assertMatchesProperty = function (action, reply, scope) {
    action.using = "selector";
    exports.assertMatchesUsingProperty(action, reply, scope);
};

/**
* Assert than an element matches a regular expression
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.assertMatches = function (action, reply, scope) {
    action.using = "selector";
    action.property = "value";
    exports.assertMatchesUsingProperty(action, reply, scope);
};

/**
* Assert than an element exists
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.assertExistsUsing = function (action, reply, scope) {
    var oldE = scope.elements()["with" + action.using.ucFirst](action.assert);
    if (action.exists === false) {
        exports.checkElementDoesNotExist("assertExistsUsing", oldE, action.using, action.assert, scope, reply, function (e) {
            if(e instanceof Error) {
                reply(false, (e.length > 0 ? e.length + " " : "") + "Element(s) with " + action.using + " `" + action.assert + "` should " + (action.exists ? "exist" : "not exist") + " (" + e.message + ")");
            }
            else if(e.length === 0 && action.exists === false) {
                reply(true, (e.length > 0 ? e.length + " " : "") + "Element(s) with " + action.using + " `" + action.assert + "` should " + (action.exists ? "exist" : "not exist"));
            }
            else {
                reply(false, (e.length > 0 ? e.length + " " : "") + "Element(s) with " + action.using + " `" + action.assert + "` should " + (action.exists ? "exist" : "not exist"));
            }
        });
    }
    else {
        exports.checkElementExists("assertExistsUsing", oldE, action.using, action.assert, scope, reply, function (e) {
            if(e instanceof Error) {
                reply(false, (e.length > 0 ? e.length + " " : "") + "Element(s) with " + action.using + " `" + action.assert + "` should " + (action.exists ? "exist" : "not exist") + " (" + e.message + ")");
            }
            else if(e.length > 0 && action.exists === true) {
                reply(true, (e.length > 0 ? e.length + " " : "") + "Element(s) with " + action.using + " `" + action.assert + "` should " + (action.exists ? "exist" : "not exist"));
            }
            else if(e.length === 0 && action.exists === false) {
                reply(true, (e.length > 0 ? e.length + " " : "") + "Element(s) with " + action.using + " `" + action.assert + "` should " + (action.exists ? "exist" : "not exist"));
            }
            else {
                reply(false, (e.length > 0 ? e.length + " " : "") + "Element(s) with " + action.using + " `" + action.assert + "` should " + (action.exists ? "exist" : "not exist"));
            }
        });
    }
};

/**
* Assert than an element exists
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.assertExists = function (action, reply, scope) {
    action.using = "selector";
    exports.assertExistsUsing(action, reply, scope);
};

///////////////////////////////////////////////////////// MISC /////////////////////////////////////////////////////////

/**
* Get a configuration variable and store it as a test variable
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.getConfigAs = function (action, reply, scope) {
    if(typeof action.getConfig === "string") {
        var variable = scope.config.get(action.getConfig);
        if(!variable) {
            reply(false, "Should get configuration variable (No configuration variable `" + action.getConfig + "` exists)");
        }
        else {
            if(typeof action.as === "string") {
                scope.vars.save(action.as, variable);
                reply(true, "Should get configuration variable");
            }
            else {
                reply(false, "Should get configuration variable (getConfigAs expected argument `as` to be a string, but got: " + (typeof action.as) + ")");
            }
        }
    }
    else {
        reply(false, "Should get configuration variable (getConfigAs expected argument `getConfig` to be a string, but got: " + (typeof action.getConfig) + ")");
    }
};

/**
* Execute a shell command
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.osexec = function (action, reply, scope) {
    var cmd = action.osexec;

    if(typeof action.osexec === "string") {
        var args = " ";

        if(action.args instanceof Array) args = args + action.args.join(" ");
        cmd = action.osexec + args;

        exec(cmd, { maxBuffer: scope.config.get("maxBuffer") }, function (err, stdout, stderr) {
            if(err) {
                reply(false, "Should execute shell command `" + cmd + "` (" + err.message + ")");
            }
            else {
                if(typeof action.saveResultsAs === "string") {
                    scope.vars.save(action.saveResultsAs, { stdout: stdout, stderr: stderr });
                }
                reply(true, "Should execute shell command `" + cmd + "`");
            }
        });
    }
    else {
        reply(false, "Should execute shell command `" + cmd + "` (osexec expected argument `osexec` to be a string, but got: " + (typeof cmd) + ")");
    }
};

/**
* Save string or JSON to a specified file, requires full file path to be entered
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.saveToFile = function (action, reply, scope) {
	var fs = require('fs');
	var savetofile = action.savetofile;
	var input = action.input;

    if(typeof input === "object") {
		var cleaninput = JSON.stringify(action.input, null, "    ");
		fs.writeFile(savetofile, cleaninput, function(err) {
			if(err) {
				return console.error(err);
			}
			console.log("Input saved to " + savetofile);
		});
	}
	else
	{
		fs.writeFile(savetofile, input, function(err) {
			if(err) {
				return console.error(err);
			}
			console.log("Input saved to " + savetofile);
		});
	}
};

/**
* Set the number of element retries during testing
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.retries = function (action, reply, scope) {
    var retries = parseInt(action.retries, 10);

    if(isNaN(retries)) {
        reply(false, "Should set element retry count to `" + action.retries + "` (Cannot set element retries to a non-integer value!)");
    }
    else {
        scope.config.set("findElementRetries", parseInt(action.retries, 10));
        reply(true, "Should set element retry count to `" + action.retries + "`");
    }
};

/**
* Set a config value during testing
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.setConfigTo = function (action, reply, scope) {
    if(!action.setConfig) {
        reply(false, "Should set config `" + action.setConfig + "` (Cannot set config value with empty key!)");
    }
    else {
        scope.config.set(action.setConfig, action.to);
        reply(true, "Should set config `" + action.setConfig + "`");
    }
};

///////////////////////////////////////////////////////// VARS /////////////////////////////////////////////////////////

/**
* Save a variable. This differs from "storeAs", as it doesn't do string replacements... which allows the user to
* reference an object.
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.saveObjectAs = function (action, reply, scope) {
    if(typeof action.as === "string") {
        var variable = scope.vars.get(action.saveObject);
        if(variable) {
            scope.vars.save(action.as, variable, !!action.persist);
            reply(true, "Should save object `" + action.saveObject + "` as `" + action.as + "`");
        }
        else {
            reply(false, "Should save object `" + action.saveObject + "` as `" + action.as + "` (No variable named `" + action.saveObject + "` defined)");
        }
    }
    else {
        reply(false, "Should save object `" + action.saveObject + "` as `" + action.as + "` (Expected string for  key `as`, but got: " + typeof action.as + ")");
    }
};


/**
* Delete a variable
* @param {object} action A copy of the action being evaluated, with variables replaced
* @param {function} reply A completion callback.<br>
*     This must be called when you are done evaluating the current action or the test will hang forever.<br>
*     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
*     message
* @param {object} scope Library objects (includes) that have been passed in, in their current state
*/
exports.deleteVar = function (action, reply, scope) {
    if(typeof action.delete === "string") {
        scope.vars.delete(action.delete);
        reply(true, "Should delete variable `" + action.delete + "`");
    }
    else {
        reply(false, "Should delete variable `" + action.delete + "` (Expected string for  key `delete`, but got: " + typeof action.delete + ")");
    }
};
