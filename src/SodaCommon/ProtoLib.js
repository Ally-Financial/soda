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
 * @module SodaCommon/ProtoLib
 * @description A prototype library, that adds utility methods to various prototype chains
 */

var path = require("path"),
    exec = require("child_process").exec,
    os = require("os"),
    crypto = require('crypto'),
    exception = require(path.join(__dirname, "Exception")),
    defined = false;

if (defined === false) { // So these are added to the prototype only once: using defined as a flag...
    Object.defineProperties(Object.prototype, {
        /**
         * Returns the "size" of an object.
         *      String   -> The string's length
         *      Number   -> The number of digits
         *      Object   -> The number of keys
         *      Array    -> The number of items
         *      Function -> 1
         *
         * @type {Number}
         * @returns {Number}
         */
        sodamembers: {
            configurable: false,
            enumerable: false,
            get: function() {
                "use strict";
                switch (true) {

                    case this instanceof Array:
                    case typeof this === "string":
                        return this.length;

                    case typeof this === "object":
                        return Object.keys(this).length;

                    case typeof this === "function":
                        return 1;

                    case typeof this === "number":
                        return this.toString().length;

                    default:
                        return this;
                }
            }
        },

        /**
         * Determines if an object can be converted to a number
         * @returns {boolean}
         */
        isNumeric: {
            configurable: false,
            enumerable: false,
            get: function() {
                "use strict";
                return !isNaN(parseFloat(this)) && isFinite(this);
            }
        },

        /**
         * Determines if an object has no keys, if an array has no items, or if a string === ""
         */
        sodaIsEmpty: {
            configurable: true,
            enumerable: false,
            writable: true,
            value: function() {
                "use strict";
                return this.sodamembers === 0;
            }
        },

        /**
         * Convers an object to an integer, if possible
         * @returns {boolean}
         */
        toInteger: {
            configurable: false,
            enumerable: false,
            get: function() {
                "use strict";
                return this.isNumeric ? parseInt(this, 10) : this;
            }
        },

        /**
         * Returns a new array / object with null and undefined stripped from the original.
         * @returns {Array|object}
         */
        sodaTruthy: {
            configurable: false,
            enumerable: false,
            get: function() {
                "use strict";
                var i, o, keys;

                switch (true) {

                    case this instanceof Array:

                        o = [];
                        for (i = 0; i < this.length; i++) {
                            if (this[i] !== null && this[i] !== undefined && /^\s*$/.test(this[i]) === false) o.push(this[i]);
                        }
                        return o;

                    case typeof this === "object":

                        o = {};
                        keys = Object.keys(this);
                        for (i = 0; i < keys.length; i++) {
                            if (this[keys[i]] !== null && this[keys[i]] !== undefined && /^\s*$/.test(this[i]) === false) {
                                o[keys[i]] = this[keys[i]];
                            }
                        }
                        return o;

                    default:
                        return this;
                }
            }
        },

        /**
         * Modifies the array / object by stripping out null and undefined.
         * @returns {self}
         */
        toTruthy: {
            configurable: false,
            enumerable: false,
            get: function() {
                "use strict";
                var i, keys;

                if (this instanceof Array) {
                    for (i = 0; i < this.length; i++) {
                        if (this[i] === null || this[i] === undefined || /^\s*$/.test(this[i]) === true) {
                            this.splice(i, 1);
                            i--;
                        }
                    }
                }
                else if (typeof this === "object") {
                    keys = Object.keys(this);
                    for (i = 0; i < keys.length; i++) {
                        if (this[keys[i]] === null || this[keys[i]] === undefined || /^\s*$/.test(this[i]) === true) {
                            this[keys[i]] = null;
                            delete this[keys[i]];
                        }
                    }
                }

                return this;
            }
        },

        /**
         * Returns the object an an array, if passed a function, string, or number, and empty array will be returned.
         * @returns {Array}
         */
        getArray: {
            configurable: false,
            enumerable: false,
            get: function() {
                "use strict";
                return (this instanceof Array) ? this : [].slice.call(this);
            }
        },

        /**
         * Returns an array made up of the values within this object.
         * @returns {Array}
         */
        sodaToArray: {
            configurable: false,
            enumerable: false,
            get: function() {
                "use strict";
                var self = this;
                return (self instanceof Array) ? self : Object.keys(self).map(function(k) {
                    return self[k];
                });
            }
        },

        /**
         * Expects members of the object to be the same type as the respective argument.
         * Arguments can be a type, null, undefined, or a compound type (e.g. `string|number`)
         * Returns an object with the following properties<br>
         *      result   : True or false, depending on whether or not the properties passes the expectations<br>
         *      value    : The value the assertion failed on, or null if passed<br>
         *      expected : The expected type of the failed value, or null if passed<br>
         *      got      : The actual type of the failed value, or null if passed<br>
         *      number   : The position of the failed item in the object/array (zero based), or the size of the object if passed<br>
         *      error    : An error, or null depending on the result
         * @type {Function}
         * @returns {object}
         */
        sodaexpect: {
            configurable: true,
            enumerable: false,
            writable: true,
            value: function() {
              "use strict";
                if (typeof this !== "object") return this;

                var args = arguments.getArray,
                    hasError, i, n, keys, arg, type, err, e, argArr;

                if (!(this instanceof Array)) keys = Object.keys(this);

                if (args.length === 1) {
                    arg = args[0];
                    args = [];
                    for (n = 0; n < (this.sodamembers || 1); n++) args[n] = arg;
                }

                for (i = 0; i < args.length; i++) {

                    if (this instanceof Array) {
                        e = this[i];
                    } else if (typeof this === "object") {
                        e = this[keys[i]];
                    }

                    type = e === null ? "null" : (typeof e).toLowerCase();
                    arg = args[i] ? args[i].toLowerCase() : args[i];

                    argArr = arg.split("|").toTruthy;
                    var item;

                    if (args instanceof arguments.constructor) {
                        item = "Argument ";
                    } else {
                        item = "Key ";
                    }

                    var errObj = new exception.InvalidArgumentsError(item + i + ": expected `" + arg + "`, but got `" + type + "`");

                    err = {
                        result: false,
                        value: e,
                        expected: arg,
                        got: type,
                        number: i,
                        error: errObj
                    };

                    argLoop: for (n = 0; n < argArr.length; n++) {
                        hasError = true;
                        arg = argArr[n];

                        switch (arg) {

                            case "boolean":
                                if (e === true || e === false) {
                                    hasError = false;
                                    break argLoop;
                                }
                                break;

                            case null:
                            case "null":
                                if (e === null) {
                                    hasError = false;
                                    break argLoop;
                                }
                                break;

                            case "undefined":
                            case undefined:
                                if (e === undefined) {
                                    hasError = false;
                                    break argLoop;
                                }
                                break;

                            case "array":
                                if (e instanceof Array) {
                                    hasError = false;
                                    break argLoop;
                                }
                                break;

                            case "defined":
                                if (e === undefined || e === null) {
                                    hasError = false;
                                    break argLoop;
                                }
                                break;

                            case "*":
                                hasError = false;
                                break argLoop;

                            case "function":
                            case "string":
                            case "number":
                            case "object":
                                if (arg === type) {
                                    hasError = false;
                                    break argLoop;
                                }
                                break;

                            default:

                                errObj = new exception.InvalidArgumentsError("Unexpected type `" + arg + "`");

                                return {
                                    result: false,
                                    value: e,
                                    expected: arg,
                                    got: type,
                                    number: i,
                                    error: errObj
                                };
                        }

                    }

                    if (hasError === true) return err;
                }

                return {
                    result: true,
                    value: null,
                    expected: null,
                    got: null,
                    number: i,
                    error: null
                };
            }

        },

        /**
         * Iterates through each item in the object/array/string/number and calls the provided callback.
         * Iteration will stop if the provided callback returns false, or no callback is provided.
         * Returns false if iteration is stopped, or if no callback is provided.
         * @param {function=} callback A callback for completion
         * @type {Function}
         * @returns {boolean}
         */
        sodaeach: {
            configurable: false,
            enumerable: false,
            writable: true,
            value: function(callback) {
                "use strict";

                if (!callback || !(callback instanceof Function)) {
                    return false;
                }

                var i = 0,
                    keys = [];

                switch (true) {

                    case this instanceof Array:
                    case typeof this === "string":

                        for (i = 0; i < this.length; i++) {
                            // Intentional second `i` argument in callback to match layout the object callback case, as below.
                            if (callback.call(this, this[i], i, i, this) === false) return false;
                        }
                        break;

                    case typeof this === "number":

                        var s = this.toString();
                        for (i = 0; i < s.length; i++) {
                            if (callback.call(s, s[i], i, this) === false) return false;
                        }
                        break;

                    case typeof this === "object":

                        keys = Object.keys(this);
                        for (i = 0; i < keys.length; i++) {
                            if (callback.call(this, this[keys[i]], keys[i], i, this) === false) return false;
                        }
                        break;                    
                    default:
                        break;

                }
                return true;
            }
        },

        /**
         * Determines if the last item in an object/array is a function
         * @returns {boolean}
         */
        hasTrailingCallback: {
            configurable: false,
            enumerable: false,
            get: function() {
                "use strict";

                switch (true) {
                    case this instanceof Array:
                        return this[this.length - 1] instanceof Function;

                    case typeof this === "object":
                        var keys = Object.keys(this);
                        return this[keys[keys.length - 1]] instanceof Function;

                    default:
                        return false;
                }
            }
        },

        /**
         * Get the class name of the object
         * @returns {string} The class name of the object
         */
        sodaClassName: {
            configurable: false,
            enumerable: false,
            get: function() {
                "use strict";
                return this.constructor.name;
            }
        },

        /**
         * Finds a child of an object/array by "path" using the delimiter `delim`.
         * Ex: "a/b/c" would the be path to key "c" in { a: { b: { c: "will return this string" } } }
         * @param {string} path The path to walk down the item to return
         * @param {string=} delim The delimiter to use for the path (commonly: "/" or "."), "/" by default
         * @type {Function}
         * @returns {*} The child at the path specified, or null if not found
         */
        findChildByPath: {
            configurable: false,
            enumerable: false,
            writable: false,
            value: function(path, delim) {
                "use strict";

                var type = typeof this,
                    o = this,
                    err, i;

                if (type !== "object") return null;

                err = arguments.sodaexpect("string", "string|undefined").error;
                if (err !== null) throw err;

                path = path.split(delim || "/").toTruthy;

                for (i = 0; i < path.length; i++) {
                    if (o[path[i]] !== undefined) {
                        o = o[path[i]];
                    } else {
                        return null;
                    }
                }
                return o;
            }
        },

        /**
         * Clones an object
         * @returns {*} The cloned object
         */
        sodaclone: {
            configurable: true,
            enumerable: false,
            writable: true,
            value: function() {
                "use strict";
                if (typeof this !== "object") return this;
                try {
                    return JSON.parse(JSON.stringify(this));
                } catch (e) {
                    throw new Error("Cannot clone, because: " + e.message);
                }
            }
        },

        /**
         * Returns a random array item, random object property, random character in a string, or random digit in a number.
         * @returns {*}
         */
        sodarandom: {
            configurable: false,
            enumerable: false,
            get: function() {
                "use strict";
                if (typeof this === "object") {
                    return this instanceof Array ?
                        this[Math.floor(Math.random() * this.length)] :
                        this[Object.keys(this)[Math.floor(Math.random() * Object.keys(this).length)]];
                } else if (typeof this === "string" || typeof this === "number") {
                    return this.toString()[Math.floor(Math.random() * this.toString().length)];
                }

                return this;
            }
        },


        /**
         * Returns the nth item in the object/array/string/number...
         * @type {Function}
         * @returns {*}
         */
        nth: {
            configurable: false,
            enumerable: false,
            writable: false,
            value: function(n) {
                "use strict";

                var err = arguments.sodaexpect("number").error;
                if (err) throw err;

                if (typeof this === "object") {
                    return this instanceof Array ?
                        this[n] :
                        this[Object.keys(this)[n]];
                } else if (typeof this === "string" || typeof this === "number") {
                    return typeof this === "string" ?
                        this.toString()[n] :
                        parseFloat(this.toString()[n]);
                }

                return this;
            }
        },

        /**
         * Determines if an object contains the specified key `k`
         * @param {string} k The key to check for specificity
         * @type {Function}
         * @returns {boolean}
         */
        hasKey: {
            configurable: false,
            enumerable: false,
            writable: false,
            value: function(k) {
                "use strict";
                var err = arguments.sodaexpect("string|number").error;
                if (err) throw err;
                return this[k] !== undefined;
            }
        },

        /**
         * Determines if an object contains the specified keys (the arguments passed)
         * @type {Function}
         * @returns {boolean}
         */
        hasKeys: {
            configurable: false,
            enumerable: false,
            writable: false,
            value: function() {
                "use strict";
                var err = arguments.sodaexpect("string|number").error;
                if (err) throw err;

                return arguments.sodaeach(function(k) {
                    if (this[k] === undefined) return false;
                });
            }
        },

        /**
         * Returns the key count, recursively
         * @returns {number}
         */
        countR: {
            configurable: false,
            enumerable: false,
            get: function() {
                "use strict";

                var count = 0;
                this.sodaeach(function(c) {
                    count++;
                    if (typeof c === "object" && c) count += c.countR;
                });

                return count;
            }
        },


        /**
         * Determines if the object is an object (and not array, string, or number)
         * @returns {boolean}
         */
        isObjectNotArray: {
            configurable: false,
            enumerable: false,
            get: function() {
                "use strict";
                return typeof this === "object" && !(this instanceof Array);
            }
        },

        /**
         * Determines if the object is an object (and not string or number)
         * @returns {boolean}
         */
        isAnObject: {
            configurable: false,
            enumerable: false,
            get: function() {
                "use strict";
                return typeof this === "object";
            }
        },

        /**
         * Determines if the object is an array
         * @returns {boolean}
         */
        isAnArray: {
            configurable: false,
            enumerable: false,
            get: function() {
                "use strict";
                return this instanceof Array;
            }
        },

        /**
         * Determines if the object is a string
         * @type {Function}
         * @returns {boolean}
         */
        isAString: {
            configurable: false,
            enumerable: false,
            writable: false,
            value: function() {
                "use strict";
                return typeof this === "string";
            }
        },

        /**
         * Returns the object's keys
         * @returns {Array}
         */
        getKeys: {
            configurable: false,
            enumerable: false,
            get: function() {
                "use strict";
                return Object.keys(this);
            }
        },

        /**
         * Determines if the object has any child objects
         * @returns {boolean}
         */
        containsNoObjects: {
            configurable: false,
            enumerable: false,
            get: function() {
                "use strict";
                if (this.isAnObject) {
                    return this.sodaeach(function(value) {
                        if (value && value.isAnObject) return false;
                    });
                }
                return true;
            }
        },

        /**
         * Gets the value of the Object using JSON.stringify
         * @param {function|Array=} replacer see JSON.stringify
         * @param {string=} whitespace see JSON.stringify
         * @returns {string} A string representation of a JSON Object.
         * @type {Function}
         */
        stringified: {
            configurable: false,
            enumerable: false,
            writable: false,
            value: function(replacer, whitespace) {
                "use strict";
                return JSON.stringify(this, replacer, whitespace);
            }
        },

        /**
         * Returns the last item in the Object/Array
         * @returns {string} Th last item in the Object/Array
         */
        sodalast: {
            configurable: true,
            enumerable: false,
            writable: true,
            value: function() {
                "use strict";
                var keys = this.getKeys;
                return this[keys[keys.sodamembers - 1]];
            }
        }

    }); // End Object.defineProperties(Object.prototype...

    /**
     * Generate a random string of alphanumeric characters
     * @param  {number} length The maximum length of the string
     * @type {Function}
     * @memberof module.SodaCommon/ProtoLib
     * @returns {string} A random string
     */
    String.randomString = function(length) {
        "use strict";

        var text = "",
            possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        length = length || Math.floor(Math.random() * 101);

        for (var i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    };

    Object.defineProperties(String.prototype, {

        /**
         * Return the value of the number, plus one
         * @type {Function}
         * @returns {string} The incremented number
         */
        plusone: {
            configurable: false,
            enumerable: false,
            get: function() {
                "use strict";
                return (parseFloat(this) + 1).toString();
            }
        },

        /**
         * Return the value of the number, plus one
         * @type {Function}
         * @returns {string} The incremented number
         */
        minusone: {
            configurable: false,
            enumerable: false,
            get: function() {
                "use strict";
                return (parseFloat(this) - 1).toString();
            }
        },

        /**
         * Return a truncated string using ellipses
         * @returns {string} A truncated string
         * @type {Function}
         */
        ellipses: {
            configurable: false,
            enumerable: false,
            writable: false,
            value: function(length, place, ellipses) {
                "use strict";

                if (length < 0) length = 0;
                if (this.length <= length) return this;

                ellipses = ellipses || "...";

                if (!place || place !== "front") {
                    return this.substr(0, length - ellipses.length) + ellipses;
                } else {
                    return ellipses + this.substr(-(length - ellipses.length));
                }
            }
        },

        /**
         * Splices a string.
         * @param {number} i The index to splice the string at
         * @param {number=} rem The number of characters to remove from the string
         * @param {string=} s The string to insert into the original string
         * @type {Function}
         * @returns {string} a sliced string
         */
        splice: {
            configurable: false,
            enumerable: false,
            writable: false,
            value: function(i, rem, s) {
                "use strict";
                return (this.slice(0, i) + s + this.slice(i + Math.abs(rem)));
            }
        },

        /**
         * Escapes a string for regex.
         * @type {Function}
         * @returns {string} a regex safe string
         */
        regexpsafe: {
            configurable: false,
            enumerable: false,
            get: function() {
                "use strict";
                return this.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            }
        },

        /**
         * Uses OSX's say command to say the string
         * @param {function=} complete A callback for completion
         * @type {Function}
         */
        say: {
            configurable: false,
            enumerable: false,
            writable: false,
            value: function(complete) {
                "use strict";
                if (os.type().toLowerCase() === "darwin") {
                    var err = arguments.sodaexpect("function|undefined").error;
                    if (err) throw err;
                    exec("say " + this, complete);
                }
            }
        },

        /**
         * Alias for path.resolve()
         * @returns {string} The resolved (absolute) path
         */
        resolve: {
            configurable: false,
            enumerable: false,
            get: function() {
                "use strict";
                if (typeof this === "string") return path.resolve(this);
                else return "";
            }
        },

        /**
         * Pads a string with `delim` characters up to length
         * @returns {string} The padded string
         * @type {Function}
         */
        pad: {
            configurable: false,
            enumerable: false,
            writable: false,
            value: function(length, delim, post) {
                "use strict";
                var s = this,
                    i;

                var expectations = arguments.sodaexpect("number|undefined", "string|undefined");
                if (expectations.error) throw expectations.error;

                if (!delim) {
                    delim = "0";
                }
                if (!length) {
                    length = s.length;
                }
                length = parseInt(length, 10);

                if (!post) {
                    for (i = 0; i < length; i++) {
                        s = delim + s;
                    }
                    return s.slice(-length);
                } else {
                    for (i = 0; i < length; i++) {
                        s += delim;
                    }
                    return s.slice(0, length);
                }
            }
        },

        /**
         * Capitalizes the first letter of a string
         * @returns {string} The capitalized string
         */
        ucFirst: {
            configurable: false,
            enumerable: false,
            get: function() {
                "use strict";
                return (this.charAt(0).toUpperCase() + this.slice(1));
            }
        },

        /**
         * Capitalizes the first letter of word in a string
         * @returns {string} The tile cased string
         */
        titleCase: {
            configurable: false,
            enumerable: false,
            get: function() {
                "use strict";
                var i, words;

                words = this.split(' ');
                for (i = 0; i < words.length; i++) words[i] = words[i].ucFirst;

                return words.join(' ');
            }
        },

        /**
         * Escapes regexp special characters
         * @returns {string}
         */
        regexpSafe: {
            configurable: false,
            enumerable: false,
            get: function() {
                "use strict";
                return this.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            }
        },

        /**
         * Generate a hash from a string
         * @param {string} algorithm The algorithm to hash the string with
         * @returns {string} The hashed string
         * @type {Function}
         */
        hash: {
            configurable: false,
            enumerable: false,
            writable: false,
            value: function(algorithm) {
                "use strict";
                var err = arguments.sodaexpect("string|undefined").error;
                if (err) throw err;
                if (typeof this === "string") return crypto.createHash(algorithm || "md5").update(this).digest("hex");
                else return "";
            }
        },

        /**
         * Generate a md5 hash from a string
         * @returns {string} The md5 string
         */
        md5: {
            configurable: false,
            enumerable: false,
            get: function() {
                "use strict";
                return this.hash("md5");
            }
        },

        /**
         * Strips the trailing slash from a string
         * @returns {string} The string without a trailing slash.
         */
        withoutTrailingSlash: {
            configurable: false,
            enumerable: false,
            get: function() {
                "use strict";
                if (os.platform === "win32" || os.platform === "win64") return this.replace(/\\$/, '');
                return this.replace(/\/$/, '');
            }
        },

        withTrailingSlash: {
            configurable: false,
            enumerable: false,
            get: function() {
                "use strict";
                if (os.platform === "win32" || os.platform === "win64") return (/\\$/.test(this) === false) ? this + "\\" : this;
                return (/\/$/.test(this) === false) ? this + "/" : this;
            }
        }

    }); // End Object.defineProperties(String.prototype...

    Object.defineProperties(Date.prototype, {

        /**
         * Moves a date forward `daysInTheFuture` days
         * @param {number} daysInTheFuture The number of days in the future to advance the date
         * @param {boolean} adjustForWeekend Whether or not the date should fall on a weekend day
         * @type {Function}
         * @returns {string}
         */
        advanceDays: {
            configurable: false,
            enumerable: false,
            writable: false,
            value: function(daysInTheFuture, adjustForWeekend, holidays) {
                "use strict";

                var expectations = arguments.sodaexpect("number", "boolean|undefined", "object|undefined|null");
                if (expectations.error) {
                    throw expectations.error;
                }

                holidays = holidays ? holidays : [];

                if (adjustForWeekend) {

                    var dayStr, monStr, dateStr = "";
                    var isHoliday = false;

                    for (var i = 0; i < daysInTheFuture; i++) {

                        this.setTime(this.getTime() + 86400000);

                        for (var k1 in holidays) {
                            if (holidays.hasOwnProperty(k1)) {
                                dayStr = (this.getDate() < 10) ? "0" + this.getDate() : this.getDate();
                                monStr = (this.getMonth() < 10) ? "0" + (this.getMonth() + 1) : (this.getMonth() + 1);
                                dateStr = dayStr + "," + monStr + "," + this.getFullYear();

                                if (dateStr === holidays[k1]) {
                                    isHoliday = true;
                                    break;
                                }
                            }
                        }
                        if (adjustForWeekend && (this.getDay() === 0 || this.getDay() === 6) || isHoliday) {
                            i--;
                            isHoliday = false;
                        }
                    }
                } else {
                    this.setTime(this.getTime() + daysInTheFuture * 86400000);
                }
                return this;
            }
        },

        /**
         * Moves a date forward `daysInTheFuture` days
         * @param {number} daysInTheFuture The number of days in the future to advance the date
         * @param {boolean} adjustForWeekend Whether or not the date should fall on a weekend day
         * @type {Function}
         * @returns {string}
         */
        advanceDaysNoZero: {
            configurable: false,
            enumerable: false,
            writable: false,
            value: function(daysInTheFuture, adjustForWeekend, holidays) {
                "use strict";

                var expectations = arguments.sodaexpect("number", "boolean|undefined", "object|undefined|null");
                if (expectations.error) {
                    throw expectations.error;
                }

                holidays = holidays ? holidays : [];

                if (adjustForWeekend) {

                    var dayStr, tmpDateStr, monStr;
                    var isHoliday = false;

                    for (var i = 0; i < daysInTheFuture; i++) {

                        this.setTime(this.getTime() + 86400000);

                        for (var k1 in holidays) {
                            if (holidays.hasOwnProperty(k1)) {
                                dayStr = this.getDate();
                                monStr = (this.getMonth() + 1);

                                tmpDateStr = dayStr + "," + monStr + "," + this.getFullYear();

                                if (tmpDateStr === holidays[k1]) {
                                    isHoliday = true;
                                    break;
                                }
                            }
                        }
                        if (adjustForWeekend && (this.getDay() === 0 || this.getDay() === 6) || isHoliday) {
                            i--;
                            isHoliday = false;
                        }
                    }
                } else {
                    this.setTime(this.getTime() + daysInTheFuture * 86400000);
                }
                return this;
            }
        },

        /**
         * Moves a date forward `monthsInTheFuture` months
         * @param {number} monthsInTheFuture The number of months in the future to advance the date
         * @param {boolean} adjustForWeekend Whether or not the date should fall on a weekend day
         * @type {Function}
         * @returns {string}
         */
        advanceMonths: {
            configurable: false,
            enumerable: false,
            writable: false,
            value: function(monthsInTheFuture, adjustForWeekend, holidays) {
                "use strict";

                var expectations = arguments.sodaexpect("number", "boolean|undefined", "object|undefined|null");
                if (expectations.error) { throw expectations.error; }

                holidays = holidays ? holidays : [];

                this.setTime(this.getTime() + (monthsInTheFuture * 2629746000));

                if (adjustForWeekend) {

                    var dayStr, monStr, dateStr = "";
                    var isHoliday = false;

                    do{
                        for (var k1 in holidays) {
                            if (holidays.hasOwnProperty(k1)) {
                                dayStr = (this.getDate() < 10) ? "0" + this.getDate() : this.getDate();
                                monStr = (this.getMonth() < 10) ? "0" + (this.getMonth() + 1) : (this.getMonth() + 1);
                                dateStr = dayStr + "," + monStr + "," + this.getFullYear();

                                if (dateStr === holidays[k1]) {
                                    isHoliday = true;
                                    break;
                                }
                            }
                        }
                        if (adjustForWeekend && (this.getDay() === 0 || this.getDay() === 6) || isHoliday) {
                            this.setTime(this.getTime() + 86400000);
                            isHoliday = false;
                        }
                    } while (adjustForWeekend && (this.getDay() === 0 || this.getDay() === 6) || isHoliday);
                }
                return this;
            }
        },

        /**
         * Moves a date forward `yearsInTheFuture` days
         * @param {number} yearsInTheFuture The number of years in the future to advance the date
         * @param {boolean} adjustForWeekend Whether or not the date should fall on a weekend day
         * @type {Function}
         * @returns {Date}
         */
        advanceYears: {
            configurable: false,
            enumerable: false,
            writable: false,
            value: function(yearsInTheFuture, adjustForWeekend, holidays) {
                "use strict";

                var expectations = arguments.sodaexpect("number", "boolean|undefined", "object|undefined|null");
                if (expectations.error) { throw expectations.error; }

                holidays = holidays ? holidays : [];

                this.setTime(this.getTime() + (yearsInTheFuture * 31536000000));

                if (adjustForWeekend) {

                    var dayStr, monStr, dateStr = "";
                    var isHoliday = false;

                    do {
                        for (var k1 in holidays) {
                            if (holidays.hasOwnProperty(k1)) {
                                dayStr = (this.getDate() < 10) ? "0" + this.getDate() : this.getDate();
                                monStr = (this.getMonth() < 10) ? "0" + (this.getMonth() + 1) : (this.getMonth() + 1);
                                dateStr = dayStr + "," + monStr + "," + this.getFullYear();

                                if (dateStr === holidays[k1]) {
                                    isHoliday = true;
                                    break;
                                }
                            }
                        }
                        if (adjustForWeekend && (this.getDay() === 0 || this.getDay() === 6) || isHoliday) {
                            this.setTime(this.getTime() + 86400000);
                            isHoliday = false;
                        }
                    } while (adjustForWeekend && (this.getDay() === 0 || this.getDay() === 6) || isHoliday);
                }
                return this;
            }
        },

        /**
         * Returns the date in the yyyymmdd format
         * @param {string} delim The delimiter to use the separate the date components (e.g. "-" or ".")
         * @type {Function}
         * @returns {string}
         */
        yyyymmdd: {
            configurable: false,
            enumerable: false,
            writable: false,
            value: function(delim) {
                "use strict";

                delim = !delim ? "-" : typeof delim === "string" ? delim : "-";

                var dd = this.getDate(),
                    mm = this.getMonth() + 1,
                    yyyy = this.getFullYear();

                if (dd < 10) {
                    dd = '0' + dd;
                }
                if (mm < 10) {
                    mm = '0' + mm;
                }

                return yyyy + delim + mm + delim + dd;
            }
        },

        /**
         * Returns the date in the mmddyyyy format
         * @param {string} delim The delimiter to use the separate the date components (e.g. "-" or ".")
         * @type {Function}
         * @returns {string}
         */
        mmddyyyy: {
            configurable: false,
            enumerable: false,
            writable: false,
            value: function(delim) {
                "use strict";

                delim = !delim ? "-" : typeof delim === "string" ? delim : "-";

                var dd = this.getDate(),
                    mm = this.getMonth() + 1,
                    yyyy = this.getFullYear();

                if (dd < 10) {
                    dd = '0' + dd;
                }
                if (mm < 10) {
                    mm = '0' + mm;
                }

                return mm + delim + dd + delim + yyyy;
            }
        },

        /**
         * Returns the date in the ddmmyyyy format
         * @param {string} delim The delimiter to use the separate the date components (e.g. "-" or ".")
         * @type {Function}
         * @returns {string}
         */
        ddmmyyyy: {
            configurable: false,
            enumerable: false,
            writable: false,
            value: function(delim) {
                "use strict";

                delim = !delim ? "-" : typeof delim === "string" ? delim : "-";

                var dd = this.getDate(),
                    mm = this.getMonth() + 1,
                    yyyy = this.getFullYear();

                if (dd < 10) {
                    dd = '0' + dd;
                }
                if (mm < 10) {
                    mm = '0' + mm;
                }

                return mm + delim + dd + delim + yyyy;
            }
        },

        /**
         * Returns the date in the longdate format
         * @param {string} delim The delimiter to use the separate the date components (e.g. "-" or ".")
         * @type {Function}
         * @returns {string}
         */
        longdate: {
            configurable: false,
            enumerable: false,
            writable: false,
            value: function() {
                "use strict";

                var dd = this.getDate(),
                    yyyy = this.getFullYear(),
                    dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday",
                      "Saturday"
                    ],
                    monthNames = ["January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"
                    ];

                if (dd < 10) {
                    dd = '0' + dd;
                }

                return dayNames[this.getDay()] + ' ' + monthNames[this.getMonth()] + ' ' + dd + ', ' + yyyy;
            }
        },

        /**
         * Returns the date in the mediumdate format
         * @param {string} delim The delimiter to use the separate the date components (e.g. "-" or ".")
         * @type {Function}
         * @returns {string}
         */
        mediumdate: {
            configurable: false,
            enumerable: false,
            writable: false,
            value: function() {
                "use strict";

                var dd = this.getDate(),
                    yyyy = this.getFullYear(),
                    monthNames = ["January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"
                    ];

                if (dd < 10) {
                    dd = '0' + dd;
                }

                return monthNames[this.getMonth()] + ' ' + dd + ', ' + yyyy;
            }
        },

        /**
         * Returns the date in the mediumdatenozero format
         * @param {string} delim The delimiter to use the separate the date components (e.g. "-" or ".")
         * @type {Function}
         * @returns {string}
         */
        mediumdatenozero: {
            configurable: false,
            enumerable: false,
            writable: false,
            value: function() {
                "use strict";

                var dd = this.getDate(),
                    yyyy = this.getFullYear(),
                    monthNames = ["January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"
                    ];

                dd = '' + dd;

                return monthNames[this.getMonth()] + ' ' + dd + ', ' + yyyy;
            }
        }
    });


    Object.defineProperties(Number.prototype, {

        /**
         * Converts a number to USD Format
         * @function
         * @return String
         */
        formatUSD: {
            configurable: false,
            enumerable: false,
            writable: false,
            value: function() {
                "use strict";
                return '$' + this.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
            }
        },

        /**
         * Pads a number with preceeding zeros.
         * @param {number} length The final length of the string
         * @type {Function}
         * @returns {string} The padded number, now string.
         */
        pad: {
            configurable: false,
            enumerable: false,
            writable: false,
            value: function(length) {
                "use strict";
                return this.toString().pad(length, "0");
            }
        },

        /**
         * Return the value of the number, plus one
         * @type {Function}
         * @returns {string} The incremented number
         */
        plusone: {
            configurable: false,
            enumerable: false,
            get: function() {
                "use strict";
                return this + 1;
            }
        },

        /**
         * Return the value of the number, plus one
         * @type {Function}
         * @returns {string} The incremented number
         */
        minusone: {
            configurable: false,
            enumerable: false,
            get: function() {
                "use strict";
                return this - 1;
            }
        },

        /**
         * Generate a hash from a number
         * @param {string} algorithm The algorithm to hash the number with
         * @type {Function}
         * @returns {string} The hashed number, now a string
         */
        hash: {
            configurable: false,
            enumerable: false,
            writable: false,
            value: function(algorithm) {
                "use strict";
                return this.toString().hash(algorithm);
            }
        },

        /**
         * Generate a md5 hash from a string
         * @returns {string} The md5 string
         */
        md5: {
            configurable: false,
            enumerable: false,
            get: function() {
                "use strict";
                return this.hash("md5");
            }
        },

        /**
         * Converts a number to the HH:MM:SS.MSEC time format
         * @param {boolean=} omitMS Whether or not to include the MS portion of the returned string
         * @type {Function}
         * @returns {string} The formatted number, now string.
         */
        clockTime: {
            configurable: false,
            enumerable: false,
            writable: false,
            value: function(omitMS) {
                "use strict";

                var t = this,
                    ms, secs, mins, hrs;

                ms = t % 1000;
                t = (t - ms) / 1000;

                secs = t % 60;
                t = (t - secs) / 60;

                mins = t % 60;
                hrs = (t - mins) / 60;

                return hrs.toString().pad(2) + ':' + mins.pad(2) + ':' + secs.pad(2) + ((omitMS === true) ? '' : '.' + ms.pad(3));
            }
        },

        /**
         * Converts a number to the Seconds
         * @type {Function}
         * @returns {string} The formatted number, now string.
         */
        clockTimeInSeconds: {
            configurable: false,
            enumerable: false,
            writable: false,
            value: function() {
                "use strict";

                var t = this;

                return parseInt(t/1000);
            }
        }

    }); // End Object.defineProperties(Number.prototype...

    Object.defineProperties(Array.prototype, {

        /**
         * Removes duplicates from the current array
         * @returns {object} The object it is performing the action on
         */
        noDuplicates: {
            configurable: false,
            enumerable: false,
            get: function() {
                "use strict";

                var visited = [];

                this.sodaeach(function(item, i) {
                    if (visited.indexOf(item) === -1) {
                        visited.push(item);
                    } else {
                        this.splice(i, 1);
                    }
                });

                return this;
            }
        },

        /**
         * Gets an array of unique items from the current array
         * @returns {Array} An array with no duplicates
         * @type {Function}
         */
        uniqueItems: {
            configurable: false,
            enumerable: false,
            value: function() {
                "use strict";

                var visited = [],
                    unique = [];

                this.sodaeach(function(item) {
                    if (visited.indexOf(item) === -1) {
                        unique.push(item);
                        visited.push(item);
                    }
                });

                return unique;
            }
        },

        /**
         * Determines if the array has the exact same keys as the provided array
         * @param {Array} a The array to check if the current array has the same keys as
         * @type {Function}
         * @returns {boolean}
         */
        hasSameKeysAs: {
            configurable: false,
            enumerable: false,
            writable: false,
            value: function(a) {
                "use strict";

                var err = arguments.sodaexpect("object").error;
                if (err) throw err;

                if (a.length !== this.length) return false;
                for (var i in a)
                    if (a.hasOwnProperty(i) && this[i] === undefined) return false;
                return true;
            }
        },

        /**
         * Determines if the array has the keys the provided array contains
         * @param {Array} a The array to check if the current array shares the same keys as
         * @type {Function}
         * @returns {boolean}
         */
        sharesKeysWith: {
            configurable: false,
            enumerable: false,
            writable: false,
            value: function(a) {
                "use strict";

                var err = arguments.sodaexpect("object").error;
                if (err) throw err;

                var self = this;

                return a.sodaeach(function(val, k) {
                    if (self[k] === undefined) return false;
                });
            }
        },

        /**
         * Determines if the array has the exact same values as the provided array
         * @param {Array} a The array to check if the current array has the same key values as
         * @type {Function}
         * @returns {boolean}
         */
        sharesKeyValuesWith: {
            configurable: false,
            enumerable: false,
            writable: false,
            value: function(a) {
                "use strict";
                var self = this;

                return a.sodaeach(function(val, k) {
                    if (self[k] !== val) return false;
                });
            }
        },

        /**
         * Determines if the array has the values the provided array contains
         * @param {Array} a The array to check if the current array has the same values as
         * @type {Function}
         * @returns {boolean}
         */
        sharesValuesWith: {
            configurable: false,
            enumerable: false,
            writable: false,
            value: function(a) {
                "use strict";
                var self = this;
                return a.sodaeach(function(val) {
                    if (self.indexOf(val) === -1) return false;
                });
            }
        },

        /**
         * Sorts an array's keys in ascending order
         * @returns {Array} The sorted keys
         */
        sodaascending: {
            configurable: false,
            enumerable: false,
            get: function() {
                "use strict";
                return this.sort(function(a, b) {
                    return a < b ? -1 : a > b ? 1 : 0;
                });
            }
        }

    });

    defined = true;

} // End if(defined === false)...
