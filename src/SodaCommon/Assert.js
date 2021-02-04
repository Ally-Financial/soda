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

var nodePath  = require("path"),
    exception = require(nodePath.join(__dirname, "Exception"));

/**
 * An assertion library
 * @namespace
 */
var Assert = (function () {
    /**
     * Fail an assertion
     * @function
     * @param actual The actual value received
     * @param expected The expected value
     * @param message The failure message
     * @param operator The comparison operator used to compared the actual and expected values
     */
    function fail(/** string */ actual, /** string */ expected, /** string */ message, /** string= */ operator) {
        var except = new exception.AssertionError({
            message  : message,
            actual   : actual,
            expected : expected,
            operator : operator
        });

        throw except;
    }

    return Object.freeze(
        {
            /**
             * Assert an item is true
             * @memberof Assert
             * @param {*} actual The item to assert
             * @param {string} message The failure message
             */
            "true": function (actual, message) {
                if (actual !== true) fail(actual, "true", message);
            },

            /**
             * Assert an item is false
             * @memberof Assert
             * @param {*} actual The item to assert
             * @param {string} message The failure message
             */
            "false": function (actual, message) {
                if (actual !== false) fail(actual, "false", message);
            },

            /**
             * Assert an item is either false, null or undefined
             * @memberof Assert
             * @param {*} actual The item to assert
             * @param {string} message The failure message
             */
            empty: function (actual, message) {
                if (actual !== false && actual !== null && actual !== undefined) fail(actual, "undefined/null/false", message);
            },

            /**
             * Assert an item is not false, null and undefined
             * @memberof Assert
             * @param {*} actual The item to assert
             * @param {string} message The failure message
             */
            defined: function (actual, message) {
                if (actual === false || actual === null || actual === undefined) fail(actual, "defined", message);
            },

            /**
             * Assert that an argument has the value `expected` using ==
             * @memberof Assert
             * @param {*} actual The item to assert
             * @param {*} expected The expected value
             * @param {string} message The failure message
             */
            equal: function (actual, expected, message) {
                if (actual != expected) fail(actual, expected, message, '=='); // jshint ignore:line
            },

            /**
             * Assert that an argument has the value `expected` using ===
             * @memberof Assert
             * @param {*} actual The item to assert
             * @param {*} expected The expected value
             * @param {string} message The failure message
             */
            strictEqual: function (actual, expected, message) {
                if (actual !== expected) fail(actual, expected, message, '===');
            },

            /**
             * Assert that an argument does not have the value `expected` using ==
             * @memberof Assert
             * @param {*} actual The item to assert
             * @param {*} expected The expected value
             * @param {string} message The failure message
             */
            notEqual: function (actual, expected, message) {
                if (actual == expected) fail(actual, expected, message, '!='); // jshint ignore:line
            },

            /**
             * Assert that an argument does not have the value `expected` using ===
             * @memberof Assert
             * @param {*} actual The item to assert
             * @param {*} expected The expected value
             * @param {string} message The failure message
             */
            strictNotEqual: function (actual, expected, message) {
                if (actual === expected) fail(actual, expected, message, '!==');
            }
        }
    );
}());

module.exports = Assert;
