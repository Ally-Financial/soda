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
 * @module Engine/Syntaxes/Web/Functions
 * @description The web v1.0 Soda stynax callback library
 */

var path = require("path"),
    core = require(path.join(__dirname, "..", "..", "..", "..", "lib", "CoreSyntax"));

//////////////////////////////////////////////////////// CLICK /////////////////////////////////////////////////////////

/**
 * Click an element, providing options
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.clickOptions = function (action, reply, scope) {
    action.using = "selector";
    exports.clickUsingOptions(action, reply, scope);
};

/**
 * Click an element
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.click = function (action, reply, scope) {
    action.options = {};
    exports.clickOptions(action, reply, scope);
};

/**
 * Click an element providing options
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.clickUsingOptions = function (action, reply, scope) {
    if(core.checkUsing(scope.elements(), action.using, reply)) {
        var e = scope.elements()["with" + action.using.ucFirst](action.click);
        core.checkExistsAndIsSingleElement("click", e, action.using, action.click, scope, reply, function (newE) {
            core.performElementInteraction("click", newE[0], reply, action.options, action.click, action.refresh, scope);
        });
    }
};

/**
 * Click an element
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.clickUsing = function (action, reply, scope) {
    action.options = {};
    exports.clickUsingOptions(action, reply, scope);
};

////////////////////////////////////////////////////// CLICK ALL ///////////////////////////////////////////////////////

/**
 * Click an element, providing options
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.clickAllOptions = function (action, reply, scope) {
    action.using = "selector";
    exports.clickAllUsingOptions(action, reply, scope);
};

/**
 * Click an element
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.clickAll = function (action, reply, scope) {
    action.options = {};
    exports.clickAllOptions(action, reply, scope);
};

/**
 * Click an element providing options
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.clickAllUsingOptions = function (action, reply, scope) {
    if(core.checkUsing(scope.elements(), action.using, reply)) {
        var e = scope.elements()["with" + action.using.ucFirst](action.clickAll);
        core.checkElementExists("clickAll", e, action.using, action.clickAll, scope, reply, function (newE) {
            core.performElementInteraction("click", newE, reply, action.options, action.clickAll, action.refresh, scope);
        });
    }
};

/**
 * Click an element
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.clickAllUsing = function (action, reply, scope) {
    action.options = {};
    exports.clickAllUsingOptions(action, reply, scope);
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
exports.clickIfExists = function (action, reply, scope) {
    action.using = "selector";
    if(core.checkUsing(scope.elements(), action.using, reply)) {
        var e = scope.elements()["with" + action.using.ucFirst](action.clickIfExists);

        if(e.length === 1) {
            core.performElementInteraction("click", e[0], reply, action.options, action.clickIfExists, action.refresh, scope);
        }
        else if (e.length === 0) {
            reply(true, "Should click `" + action.clickIfExists + "` if it exists (Element did not exist, click skipped)");
        }
        else {
            reply(false, "Should click `" + action.clickIfExists + "` if it exists (Expected a single element or no element, but selector returned " + e.length + ")");
        }
    }
};

///////////////////////////////////////////////// DEVICE INTERACTIONS //////////////////////////////////////////////////

/**
 * Press the back button on the browser
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
            reply(false, "Should navigate back (" + err.message + ")");
        }
        else if(!res) {
            reply(false, "Should navigate back (Framework replied false)");
        }
        else {
            reply(true, "Should navigate back");
        }
    });
};

/**
 * Close the browser window
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.close = function (action, reply, scope) {
    scope.device.close(function (err, res) {
        if(err) {
            reply(false, "Should close the browser window (" + err.message + ")");
        }
        else if(!res) {
            reply(false, "Should close the browser window (Framework replied false)");
        }
        else {
            reply(true, "Should close the browser window");
        }
    });
};

/**
 * Close and Reopen the browser window
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.reset = function (action, reply, scope) {
    scope.device.reset(function (err, res) {
        if(err) {
            reply(false, "Should close and reopen the browser window (" + err.message + ")");
        }
        else if(!res) {
            reply(false, "Should close and reopen the browser window (Framework replied false)");
        }
        else {
            reply(true, "Should close and reopen the browser window");
        }
    });
};

/**
 * Press the forward button on the browser
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.forward = function (action, reply, scope) {
    scope.device.forward(function (err, res) {
        if(err) {
            reply(false, "Should navigate forward (" + err.message + ")");
        }
        else if(!res) {
            reply(false, "Should navigate forward (Framework replied false)");
        }
        else {
            reply(true, "Should navigate forward");
        }
    });
};

/**
 * Refresh the browser window
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.reload = function (action, reply, scope) {
    scope.device.reload(function (err, res) {
        if(err) {
            reply(false, "Should reload (" + err.message + ")");
        }
        else if(!res) {
            reply(false, "Should reload (Framework replied false)");
        }
        else {
            reply(true, "Should reload");
        }
    });
};

/**
 * Delete all cookies in the browser
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.deleteAllCookies = function (action, reply, scope) {
    scope.device.deleteAllCookies(function (err, res) {
        if(err) {
            reply(false, "Should delete All Cookies in browser");
        }
        else {
            reply(true, "Should delete All Cookies in browser");
        }
    });
};

/**
 * Go to a new URL
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.goto = function (action, reply, scope) {
    scope.device.goto(action.goto, function (err, res) {
        if(err) {
            reply(false, "Should go to URL `" + action.goto + "` (" + err.message + ")");
        }
        else {
            scope.tree.update(function (err, tree) {
                if(err || !tree) {
                    reply(false, "Should go to URL `" + action.goto + "`" + (err ? "(" + err.message + ")" : ""));
                }
                else if(!res) {
                    reply(false, "Should go to URL `" + action.goto + "` (Framework replied false)");
                }
                else {
                    reply(true, "Should go to URL `" + action.goto + "`");
                }
            });
        }
    });
};

/////////////////////////////////////////////////// SWITCH TO FRAME ////////////////////////////////////////////////////

/**
 * Switches to a frame within a page within a particular element
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.switchToFrameUsing = function (action, reply, scope) {
    if(core.checkUsing(scope.elements(), action.using, reply)) {
        var e = scope.elements()["with" + action.using.ucFirst](action.switchToFrame);

        if(action.switchToFrame !== "default") {
            core.checkExistsAndIsSingleElement("switchToFrame", e, action.using, action.switchToFrame, scope, reply, function (newE) {
                scope.device.switchToFrame({ element: newE[0].id }, function (err, res) {
                    if(err) {
                        reply(false, "Should switch to frame (" + err.message + ")");
                    }
                    else if(!res) {
                        reply(false, "Should switch to frame (Framework replied false)");
                    }
                    else {
                        reply(true, "Should switch to frame `" + action.switchToFrame + "`");
                    }
                });
            });
        }
        else {
            scope.device.switchToFrame({ element: "default" }, function (err, res) {
                if(err) {
                    reply(false, "Should switch to frame (" + err.message + ")");
                }
                else if(!res) {
                    reply(false, "Should switch to frame (Framework replied false)");
                }
                else {
                    reply(true, "Should switch to frame `" + action.switchToFrame + "`");
                }
            });
        }
    }
};

/**
 * Switches to a frame within a page
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.switchToFrame = function (action, reply, scope) {
    action.using = "selector";
    exports.switchToFrameUsing(action, reply, scope);
};

/**
 * Resizes a window
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.resizeWindow = function (action, reply, scope) {
    scope.device.resizeWindow(action.resizeWindow, function (err, res) {
        if(err) {
            reply(false, "Should resize (" + err.message + ")");
        }
        else if(!res) {
            reply(false, "Should resize (Framework replied false)");
        }
        else {
            reply(true, "Should resize");
        }
    });
};

/**
 * Maximizes a window
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.maximizeWindow = function (action, reply, scope) {
    scope.device.maximizeWindow(action.maximizeWindow, function (err, res) {
        if(err) {
            reply(false, "Should maximize (" + err.message + ")");
        }
        else if(!res) {
            reply(false, "Should maximize (Framework replied false)");
        }
        else {
            reply(true, "Should maximize");
        }
    });
};

/**
 * Gets a variable within a page and stores it as a particular variable within sODA
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.getVariable = function (action, reply, scope) {
    scope.device.getVariable(action.getVariable, action.storeIn, function (err, res) {
        if(err) {
            reply(false, "Should get variable (" + err.message + ")");
        }
        else if(!res) {
            reply(false, "Should get variable (Framework replied false)");
        }
        else {
            reply(true, "Should get variable");
        }
    });
};

/**
 * Executes a JavaScript file
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.executeScript = function (action, reply, scope) {
    scope.device.executeScript(action, function (err, res) {
        if(err) {
            reply(false, "Should execute script (" + err.message + ")");
        }
        else if(!res) {
            reply(false, "Should execute script (Framework replied false)");
        }
        else {
            reply(true, "Should execute script");
        }
    });
};

/**
 * Executes a string
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.executeScriptWithString = function (action, reply, scope) {
    scope.device.executeScriptWithString(action, function (err, res) {
        if(err) {
            reply(false, "Should execute script (" + err.message + ")");
        }
        else if(!res) {
            reply(false, "Should execute script (Framework replied false)");
        }
        else {
            reply(true, "Should execute script");
        }
    });
};
