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
 * An exception library
 * @module SodaCommon/Exception
 */


/**
 * @namespace Exception
 */
var Exception = (function namespaceException () {

    /**
     * The parent class for all Exceptions form the Exception namespace
     * @param {string} name The name of the exception
     * @param {string} msg The message of the exception
     * @constructor
     * @memberof module.SodaCommon/Exception.Exception
     * @extends Error
     */
    function SodaError (name, msg) { // jshint ignore:line
        Error.call(this);

        // Roll the stacktrace back a few steps for a more accurate error description
        // * Only works in V8 *
        Error.captureStackTrace(this, arguments.callee.caller);

        this.name       = name;
        this.message    = msg;
        this.toString   = function () {
            return this.name + ': "' + this.message + '"';
        };
    }

    return Object.freeze(
        {
            SodaError: SodaError,

            /**
             * @memberof module.SodaCommon/Exception.Exception
             * @param {string} msg The message
             * @returns {SodaError}
             * @aggregates SodaError
             */
            SodaGenericError: function (msg) {
                return new SodaError("SodaError", msg);
            },

            /**
             * @memberof module.SodaCommon/Exception.Exception
             * @param {string} msg The message
             * @returns {SodaError}
             * @aggregates SodaError
             */
            ConfigurationError: function (msg) {
                return new SodaError("ConfigurationError", msg);
            },

            /**
             * @memberof module.SodaCommon/Exception.Exception
             * @param {string} msg The message
             * @returns {SodaError}
             * @aggregates SodaError
             */
            ExecutionError: function (msg) {
                return new SodaError("ExecutionError", msg);
            },

            /**
             * @memberof module.SodaCommon/Exception.Exception
             * @param {string} msg The message
             * @returns {SodaError}
             * @aggregates SodaError
             */
            IOError: function (msg) {
                return new SodaError("IOError", msg);
            },

            /**
             * @memberof module.SodaCommon/Exception.Exception
             * @param {string} msg The message
             * @returns {SodaError}
             * @aggregates SodaError
             */
            InvalidFrameworkError: function (msg) {
                return new SodaError("InvalidFrameworkError", msg);
            },

            /**
             * @memberof module.SodaCommon/Exception.Exception
             * @param {string} msg The message
             * @returns {SodaError}
             * @aggregates SodaError
             */
            InvalidFrameworkArguments: function (msg) {
                return new SodaError("InvalidFrameworkArguments", msg);
            },

            /**
             * @memberof module.SodaCommon/Exception.Exception
             * @param {string} msg The message
             * @returns {SodaError}
             * @aggregates SodaError
             */
            NoFrameworkStartedError: function (msg) {
                return new SodaError("NoFrameworkStartedError", msg);
            },

            /**
             * @memberof module.SodaCommon/Exception.Exception
             * @param {string} msg The message
             * @returns {SodaError}
             * @aggregates SodaError
             */
            REPLError: function (msg) {
                return new SodaError("REPLError", msg);
            },

            /**
             * @memberof module.SodaCommon/Exception.Exception
             * @param {string} msg The message
             * @returns {SodaError}
             * @aggregates SodaError
             */
            ElementNotFoundError: function (msg) {
                return new SodaError("ElementNotFoundError", msg || "Element Not Found");
            },

            /**
             * @memberof module.SodaCommon/Exception.Exception
             * @param {string} msg The message
             * @returns {SodaError}
             * @aggregates SodaError
             */
            InvalidElementError: function (msg) {
                return new SodaError("InvalidElementError", msg || "Invalid Element");
            },

            /**
             * @memberof module.SodaCommon/Exception.Exception
             * @param {string} msg The message
             * @returns {SodaError}
             * @aggregates SodaError
             */
            InvalidActionError: function (msg) {
                return new SodaError("InvalidAction", msg || "Invalid Action");
            },

            /**
             * @memberof module.SodaCommon/Exception.Exception
             * @param {string} msg The message
             * @returns {SodaError}
             * @aggregates SodaError
             */
            InvalidDefinitionError: function (msg) {
                return new SodaError("InvalidDefinitionError", msg || "Invalid Syntax Definition");
            },

            /**
             * @memberof module.SodaCommon/Exception.Exception
             * @param {string} msg The message
             * @returns {SodaError}
             * @aggregates SodaError
             */
            OrphanedActionError: function (msg) {
                return new SodaError("OrphanedActionError", msg || "Unhandled Action");
            },

            /**
             * @memberof module.SodaCommon/Exception.Exception
             * @param {string} msg The message
             * @returns {SodaError}
             * @aggregates SodaError
             */
            InvalidArgumentsError: function (msg) {
                return new SodaError("InvalidArgumentsError", msg || "Invalid Arguments");
            },

            /**
             * @memberof module.SodaCommon/Exception.Exception
             * @param {string} msg The message
             * @returns {SodaError}
             * @aggregates SodaError
             */
            InvalidSyntaxError: function (msg) {
                return new SodaError("InvalidSyntaxError", msg || "Invalid Syntax");
            },

            /**
             * @memberof module.SodaCommon/Exception.Exception
             * @param {string} msg The message
             * @returns {SodaError}
             * @aggregates SodaError
             */
            AssetsParseError: function (msg) {
                return new SodaError("AssetsParseError", msg);
            },

            /**
             * @memberof module.SodaCommon/Exception.Exception
             * @param {string} msg The message
             * @returns {SodaError}
             * @aggregates SodaError
             */
            AssetGenericError: function (msg) {
                return new SodaError("AssetGenericError", msg);
            },

            /**
             * @memberof module.SodaCommon/Exception.Exception
             * @param {string} msg The message
             * @returns {SodaError}
             * @aggregates SodaError
             */
            AssetNotFoundError: function (msg) {
                return new SodaError("AssetNotFoundError", msg);
            },

            /**
             * @memberof module.SodaCommon/Exception.Exception
             * @param {string} msg The message
             * @returns {SodaError}
             * @aggregates SodaError
             */
            AssetNoDriverLoadedError: function (msg) {
                return new SodaError("AssetNoDriverLoadedError", msg);
            },

            /**
             * @memberof module.SodaCommon/Exception.Exception
             * @returns {SodaError}
             * @aggregates SodaError
             * @param {object} options An object, which should have the keys `actual`, `expected`, and `operator`
             */
            AssertionError: function (options) {
                var err = new SodaError("AssertionError", options["message"]);

                err.actual   = options["actual"];
                err.expected = options["expected"];
                err.operator = options["operator"];

                err.toString = function() {
                    return this.name + ": Expected: `" + this.expected + "` " +
                        ((this.operator) ? this.operator : ", Actual: ") + " `" + this.actual + "`" +
                        ((this.message) ? "\n\t..." + this.message : "");
                };

                return err;
            },

            /**
             * @memberof module.SodaCommon/Exception.Exception
             * @returns {SodaError}
             * @aggregates SodaError
             * @param {object} options An object, which should have the keys `id` and `idtype`
             */
            ElementAssertionError: function (options) {
                var err = new SodaError("AssertionError", options['message'].replace(/([\n\t])/g, ' '));

                err.id     = options.id;
                err.idtype = options["idtype"];

                err.toString = function() {
                    return this.name + ": " + this.message.replace(/([\n\t])/g, ' ');
                };

                return err;
            }
        }
    );
}());

module.exports = Exception;
