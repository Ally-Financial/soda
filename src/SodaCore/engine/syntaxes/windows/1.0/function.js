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
 * @description The windows v1.0 Soda stynax callback library
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

///////////////////////////////////////////////// DEVICE INTERACTIONS //////////////////////////////////////////////////
