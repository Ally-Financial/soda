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
 * @module Soda/EvalSafe
 * @description This module provides a way to limit the scope of the REPL evaluate
 * By making this a module, the only variables available to evaluate are
 * the ones set globally (local to this file) in evaluate, and the arguments
 * passed in. Be sure to either clone or use getter/setters when passing to this
 * module.
 * @type {REPL|exports|module.exports}
 */

/**
 * Evaluates `what`
 * @param $ The Soda library
 * @returns {Object}
 */
function evalInPrivateScope (what, soda) { // jshint ignore:line
    return eval(what); // jshint ignore:line
}

/**
 * A wrapper for evalInPrivateScope
 * @param {Soda} soda A Soda instace
 * @param {String} what An evaluation string
 * @returns {*} The results of the evaluation of "what"
 */
exports.evaluate = function (what, soda) {
    return evalInPrivateScope(what, soda); // jshint ignore:line
};

/**
 * Set a variable available to evaluate (global)
 * @param {String} name The name of the global to set
 * @param {String} what The value of the global variable to set
 * @param {*} what The value to set the variable to
 */
exports.set = function (name, what) {
    var err = arguments.sodaexpect("string", "*").error; // jshint ignore:line
    if(err) throw err;
    global[name] = what;
};
