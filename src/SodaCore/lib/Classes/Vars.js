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
 * @module SodaCore/Vars
 */

var util = require("util"),
    EventEmitter = require("events").EventEmitter,
    globalVariables = {},
    globalsSaved = false,

    /**
     * Store and save variables to use in testing
     * @constructor
     * @param {Soda} soda Soda instance this vars is associated with
     * @augments EventEmitter
     */
    Vars = function(soda) {
        var self = this,
            variables = {};

        /**
         * Returns all variables (global and local to this Soda instance)
         * @param  {Boolean=} getNonReporting Whether or not to get non-reporting variables
         * @return {Object} A dictionary of variables
         */
        this.getAllVariables = function(getNonReporting) {
            var allVars = {};

            function pushVar(v, k) {
                if (v.report !== false || getNonReporting) allVars[k] = v;
            }

            variables.sodaeach(pushVar);
            globalVariables.sodaeach(pushVar);

            return allVars;
        };

        /**
         * Returns all non-persistent variables (global and local to this Soda instance)
         * @return {Object} A dictionary of non-persistent variables
         */
        this.getAllNonPersistent = function() {
            var nonPersistent = {};

            variables.sodaeach(function(v, k) {
                if (typeof v === "object" && v.report !== false) nonPersistent[k] = v.value;
            });

            globalVariables.sodaeach(function(v, k) {
                if (v.report !== false) nonPersistent[k] = v.value;
            });
            return nonPersistent;
        };

        /**
         * Empty all non-persistent stored variables
         * @return {Vars} The current Vars instance
         */
        this.empty = function() {
            var resetVars = {},
                resetGlobalVars = {};

            /**
             * Emitted when the non-persistent variables are being emptied
             * @event module.SodaCore/Vars.Vars#empty
             * @argument variables The variables object just before it's been emptied
             */
            self.emit("empty", variables);

            variables.sodaeach(function(v, k) {
                if (typeof v === "object" && v.persistent === true)
                    resetVars[k] = v;
            });

            globalVariables.sodaeach(function(v, k) {
                if (v.persistent === true) {
                    resetGlobalVars[k] = v;
                    resetVars[k] = "__soda_global";
                }
            });

            soda.console.debug("*** Non-persistent variables emptied ***");
            variables = resetVars;
            globalVariables = resetGlobalVars;
            return self;
        };

        /**
         * Store a variable
         * @param {string} key The key to store the variable with
         * @param {*} value The value to store the variable with
         * @param {boolean=} persistent If the variable is persistent it will persist between test
         * @param {boolean=} isGlobal True if the variable should be global
         * @param {boolean=} dontReport Don't report the variable in the results JSON file
         * @return {Vars} The current Vars instance
         */
        this.save = function(key, value, persistent, isGlobal, dontReport) {
            var err = arguments.sodaexpect("string", "*", "boolean|undefined|null", "boolean|undefined|null", "boolean|undefined|null").error;
            if (err) throw err;

            function regularSave() {
                if (variables[key]) soda.console.warn("Overwriting variable `" + key + "` with value `" + value + "`");

                if (!!isGlobal || variables[key] === "__soda_global") {
                    variables[key] = "__soda_global";
                    globalVariables[key] = {
                        persistent: !!persistent,
                        value: value,
                        report: !dontReport
                    };
                } else {
                    soda.console.debug("Storing variable `" + key + "` with value " + ((value || value === 0) ? value.stringified() : "(null)"));
                    variables[key] = {
                        persistent: !!persistent,
                        value: value,
                        report: !dontReport
                    };
                }
            }

            var keys, obj, path, actualVariable, last;
            if (key.indexOf(".") > -1) {
                keys = key.split(".").toTruthy;
                obj = keys[0];
                last = keys[keys.length - 1];
                path = keys.slice(1).slice(0, -1).join(".");

                actualVariable = (variables[obj] === "__soda_global") ? globalVariables[obj] : variables[obj];
                if (typeof actualVariable === "object") {
                    var o = actualVariable.value.findChildByPath(path, ".");
                    if (o !== undefined && o !== null) {
                        o[last] = value;
                    } else {
                        regularSave();
                    }
                }
            } else {
                regularSave();
            }

            /**
             * Emitted after a variable is saved
             * @event module.SodaCore/Vars.Vars#save
             * @argument {String} key The key used to get the variable
             * @argument {*} The returned variable
             */
            self.emit("save", key, variables[key] === "__soda_global" ? globalVariables[key] : variables[key]);
            return self;
        };

        /**
         * Retrieve a stored variable
         * @param {string} key The key to use to retrieve the variable with
         * @returns {*}
         */
        this.get = function(key) {
            var err = arguments.sodaexpect("string|number").error;
            if (err) throw err;

            var obj, path, keys, actualVariable;

            if (key.indexOf(".") > -1) {
                keys = key.split(".").toTruthy;
                obj = keys[0];
                path = keys.slice(1).join(".");

                actualVariable = (variables[obj] === "__soda_global") ? globalVariables[obj] : variables[obj];

                /**
                 * Emitted just before a variable is received
                 * @event module.SodaCore/Vars.Vars#get
                 * @argument {String} key The key used to get the variable
                 * @argument {*} The returned variable
                 */
                self.emit("get", key, actualVariable);
                if (typeof actualVariable === "object" && typeof actualVariable.value === "object" && actualVariable.value !== undefined && actualVariable.value !== null) {
                    return actualVariable.value.findChildByPath(path, ".");
                } else if (keys.length === 2 && actualVariable && actualVariable.value !== undefined && actualVariable.value !== null && actualVariable.value[keys[1]] !== null && actualVariable.value[keys[1]] !== undefined) {
                    return actualVariable.value[keys[1]];
                }
            } else {
                actualVariable = variables[key] === "__soda_global" ? globalVariables[key] : variables[key];
                self.emit("get", key, actualVariable);
                return (typeof actualVariable === "object") ? actualVariable.value : null;
            }
            return null;
        };

        /**
         * Saves date vars
         * @param {object} array of recognized holidays
         * @memberof module.SodaCore/Vars.Vars
         */
        this.saveDateVars = function(holidays) {

            self.save("_today_", new Date().longdate(), true, true, true);
            self.save("_today_web_", new Date().ddmmyyyy('/'), true, true, true);
            self.save("_today_medium_formatted_", new Date().mediumdatenozero(), true, true, true);
            self.save("_today_medium_zero_formatted_", new Date().mediumdate(), true, true, true);
            self.save("_scheduled_today_", "Your Scheduled Delivery Date is Today, " + new Date().longdate(), true, true, true);

            var i;
            for (i = 1; i < 365; i++) {
                self.save("_" + i + "_" + (i > 1 ? "days" : "day") + "_from_now_", new Date().advanceDays(i).yyyymmdd('-'), true, true, true);
                self.save("_" + i + "_" + (i > 1 ? "days" : "day") + "_from_now_formatted_", new Date().advanceDays(i).longdate(), true, true, true);
                self.save("_" + i + "_" + (i > 1 ? "days" : "day") + "_from_now_medium_formatted_", new Date().advanceDays(i).mediumdate(), true, true, true);
                self.save("_" + i + "_" + (i > 1 ? "days" : "day") + "_from_now_web_", new Date().advanceDays(i).ddmmyyyy('/'), true, true, true);
            }
            for (i = 1; i < 365; i++) {
                self.save("_" + i + "_" + (i > 1 ? "days" : "day") + "_from_now_not_weekend_", new Date().advanceDays(i, true, holidays).yyyymmdd('-'), true, true, true);
                self.save("_" + i + "_" + (i > 1 ? "days" : "day") + "_from_now_not_weekend_formatted_", new Date().advanceDays(i, true, holidays).longdate(), true, true, true);
                self.save("_" + i + "_" + (i > 1 ? "days" : "day") + "_from_now_not_weekend_nozero_formatted_", new Date().advanceDaysNoZero(i, true, holidays).mediumdatenozero(), true, true, true);
                self.save("_" + i + "_" + (i > 1 ? "days" : "day") + "_from_now_not_medium_weekend_formatted_", new Date().advanceDays(i, true, holidays).mediumdate(), true, true, true);
                self.save("_" + i + "_" + (i > 1 ? "days" : "days") + "_from_now_web_not_weekend_", new Date().advanceDays(i, true, holidays).mmddyyyy('/'), true, true, true);
            }
            for (i = 1; i < 12; i++) {
                self.save("_" + i + "_" + (i > 1 ? "months" : "month") + "_from_now_", new Date().advanceMonths(i).yyyymmdd('-'), true, true, true);
                self.save("_" + i + "_" + (i > 1 ? "months" : "month") + "_from_now_web_", new Date().advanceMonths(i).mmddyyyy('/'), true, true, true);
                self.save("_" + i + "_" + (i > 1 ? "months" : "month") + "_from_now_formatted_", new Date().advanceMonths(i).longdate(), true, true, true);
                self.save("_" + i + "_" + (i > 1 ? "months" : "month") + "_from_now_medium_formatted_", new Date().advanceMonths(i).mediumdate(), true, true, true);
            }
            for (i = 1; i < 12; i++) {
                self.save("_" + i + "_" + (i > 1 ? "months" : "month") + "_from_now_not_weekend_", new Date().advanceMonths(i, true, holidays).yyyymmdd('-'), true, true, true);
                self.save("_" + i + "_" + (i > 1 ? "months" : "month") + "_from_now_not_weekend_formatted_", new Date().advanceMonths(i, true, holidays).longdate(), true, true, true);
                self.save("_" + i + "_" + (i > 1 ? "months" : "month") + "_from_now_not_medium_weekend_formatted_", new Date().advanceMonths(i, true, holidays).mediumdate(), true, true, true);
            }
            for (i = 1; i < 7; i++) {
                self.save("_" + i + "_" + (i > 1 ? "years" : "year") + "_from_now_", new Date().advanceYears(i).yyyymmdd('-'), true, true, true);
                self.save("_" + i + "_" + (i > 1 ? "years" : "year") + "_from_now_formatted_", new Date().advanceYears(i).longdate(), true, true, true);
                self.save("_" + i + "_" + (i > 1 ? "years" : "year") + "_from_now_medium_formatted_", new Date().advanceYears(i).mediumdate(), true, true, true);
            }
            for (i = 1; i < 7; i++) {
                self.save("_" + i + "_" + (i > 1 ? "years" : "year") + "_from_now_not_weekend_", new Date().advanceYears(i, true, holidays).yyyymmdd('-'), true, true, true);
                self.save("_" + i + "_" + (i > 1 ? "years" : "year") + "_from_now_not_weekend_formatted_", new Date().advanceYears(i, true, holidays).longdate(), true, true, true);
                self.save("_" + i + "_" + (i > 1 ? "years" : "year") + "_from_now_not_medium_weekend_formatted_", new Date().advanceYears(i, true, holidays).mediumdate(), true, true, true);
            }
        };

        /**
         * Delete a variable, if the variable is persistent, this will do nothing.
         * @param {string} key The key of the value to delete
         * @memberof module.SodaCore/Vars.Vars
         * @returns {boolean}
         */
        this["delete"] = function(key) {
            var err = arguments.sodaexpect("string").error;
            if (err) throw err;

            var actualVariable = variables[key] === "__soda_global" ? globalVariables[key] : variables[key],
                isGlobal = variables[key] === "__soda_global";

            if (typeof actualVariable === "object" && actualVariable.persistent === false) {
                /**
                 * Emitted just before a variable is deleted
                 * @event module.SodaCore/Vars.Vars#delete
                 * @argument {String} key The key used to get the variable
                 * @argument {*} The returned variable
                 */
                self.emit("delete", key, actualVariable);

                if (isGlobal) {
                    delete globalVariables[key];
                } else {
                    delete variables[key];
                }

                soda.console.debug("Variable `" + key + "` deleted.");
                return true;
            }

            soda.console.debug("Variable `" + key + "` not deleted.");
            return false;
        };

        if (!globalsSaved) {
            globalsSaved = true;

            var globalN = 0,
                localN = 0;

            self.save("global_n", {
                get next() {
                    return ++globalN;
                },
                get curr() {
                    return globalN;
                },
                get prev() {
                    return --globalN;
                },
            }, true, true, false);

            self.save("n", {
                get next() {
                    return ++localN;
                },
                get curr() {
                    return localN;
                },
                get prev() {
                    return --localN;
                },
            }, true, false, false);

            self.save("_now_", {
                get unix() {
                    return Date.now();
                },
                get hhmmss() {
                    return new Date().clockTime;
                },
                get yyyymmdd() {
                    return new Date().yyyymmdd();
                },
                get ddmmyyyy() {
                    return new Date().ddmmyyyy();
                }
            }, true, true, true);

            self.save("regex_usd", "\\soda((\\d{1, 3},)+)?\\d{1,3}\\.\\d{2}", true, true, true);

            self.save("regex_month_dd", "(January|February|March|April|May|June|July|August|September|October|November|December) ([1-9]|[1-2]\\d|3[0-1])", true, true, true);
            self.save("regex_month_dd_yyyy", "(January|February|March|April|May|June|July|August|September|October|November|December) ([1-9]|[1-2]\\d|3[0-1]), \\d{4}", true, true, true);
            self.save("regex_month_dd_yy", "(January|February|March|April|May|June|July|August|September|October|November|December) ([1-9]|[1-2]\\d|3[0-1]), \\d{2}", true, true, true);

            var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

            self.save("_currentYear_", new Date().getFullYear(), true, true, true);
            self.save("_currentMonth_", monthNames[new Date().getMonth()], true, true, true);
        }
    };

util.inherits(Vars, EventEmitter);
module.exports = Vars;
