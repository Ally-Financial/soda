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
 * @module SodaCommon/Console
 * @description A more robust console solution
 */

require("./ProtoLib");
var LOG4JS = require('log4js');

var EventEmitter = require('events').EventEmitter,
    util         = require("util");
    
    /**
     * Used to replace function values in JSON.stringify to their Function.toString() equivalent
     * @param  {string} key The key of the JSON.stringify replacement item
     * @param  {*} value The value of the object in the JSON.stringify replacement item
     * @return {*} The replaced value
     */
    function jsonFunctionReplacer (key, value) {
        if(typeof value === "function") return value.name ? "[Function:" + value.name + "]" : "[Function:anonymous]";
        return value;
    }

/**
 * A more robust console solution
 * @constructor
 * @augments EventEmitter
 * @param {object} userOptions User defined options
 * @description An improvement console logger, compared to the Node default Console class
 */
var Console = function (userOptions) {

    var self  = this;
    self.logger = null;

    if (userOptions && (userOptions.log4js == null || userOptions.log4js == undefined)) {
        userOptions.log4js = false
    }

    var options = {
        supress : false,
        color   : true,
        prefix  : null,
        log: {
            warnings : true,
            errors   : true,
            debug    : true,
            log      : true,
            verbose  : true,
            pass     : true,
            fail     : true,
            start    : true,
            comment  : true
        },
        colors: {
            debug    : 242,
            log      : 45,
            message  : 45,
            error    : 160,
            warning  : 214,
            verbose  : 45,
            pass     : 82,
            fail     : 160,
            start    : 82,
            comment  : 199
        },

        JSONWhitespace: '    ',
        log4js : userOptions ? userOptions.log4js : false
    };

    if(typeof userOptions === "object") {
        userOptions.sodaeach(function (value, option) {
            options[option] = value;
        });

        if (userOptions.log4js) {
            setupLog4js();
        }
    }
    
    /**
     * Sets up the initial log4js patterns
     * @return {*}
     */
    function setupLog4js() {
        LOG4JS.configure({
            appenders: {
                out: {
                type: 'stdout', layout: {
                    type: 'pattern',
                    pattern: 'APP_LOG %d{yyyy-MM-dd hh:mm:ss} %z %p %c %m%n'
                }
                }
            },
            categories: { default: { appenders: ['out'], level: 'info' } }
        });
        self.logger = LOG4JS.getLogger();
        self.logger.level = 'info';
    }

    /**
     * Logs messages to the console formatted by type.
     * @param {string} type The type of log, e.g. "log", "warn", "error"
     * @param {Arguments} args The arguments passed on from the calling function
     */
    function log (type, args) {

        var err = arguments.sodaexpect("string", "object").error;
        if(err) throw err;

        if(options.supress !== true) { // Supress logging if options.supress === true
            var messages = args.getArray, i, htmlMessages = [];

            /**
             * Emitted just prior to logging a console message
             * @event module.SodaCommon/Console.Console#pre log
             * @argument {Array<string>} messages The messages to be logged
             * @argument {String} type The type of log (e.g. "log", "message", "error", "warning", etc.)
             */
            self.emit("pre log", messages, type);

            for(i = 0; i < messages.sodamembers; i++) {
                if(typeof messages[i] === "object") {
                    try {
                        messages[i] = JSON.stringify(messages[i], jsonFunctionReplacer, options.JSONWhitespace);
                    }
                    catch (e) { /* No op, just means the object is most-likely circular... */ }
                }

                if(messages[i] === undefined) messages[i] = "(undefined)";
                if(messages[i] === null)      messages[i] = "(null)";

                if(typeof messages[i] === "string") {
                    htmlMessages.push(
                        '<span class="soda-stdout ' + type + '">' +
                        messages[i]
                            .replace(/\n/g, '<br>')
                            .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
                            .replace(/ /g,  "&nbsp;") +
                        '</span>'
                    );
                }
            }

            /**
             * Emitted just prior to logging a console message
             * @event module.SodaCommon/Console.Console#log
             */
            self.emit("log", messages, htmlMessages, type);

            if(typeof options.prefix === "string") {
                messages.unshift(options.prefix);
            }

            switch(type) {
                case "warning":
                    if(options.log.warnings)
                        if (options.log4js) {
                            messages.sodaeach(function (message, key, i) {
                                self.logger.info(message);
                                console.log('WARNING: ', message);
                            });
                        }
                        else {
                            messages.sodaeach(function (message, key, i) {
                                console.log('WARNING: ', message);
                            });
                        }
                    break;

                case "error":
                    if(options.log.errors)
                        if (options.log4js) {
                            messages.sodaeach(function (message, key, i) {
                                self.logger.info(message);
                                console.log('ERROR: ', message);
                            });
                        }
                        else {
                            messages.sodaeach(function (message, key, i) {
                                console.log('ERROR: ', message);
                            });
                        }
                    break;

                default:
                    if(options.log[type] === true)
                        if (options.log4js) {
                            messages.sodaeach(function (message, key, i) {
                                self.logger.info(message);
                                console.log(message);
                            });
                        }
                        else {
                            messages.sodaeach(function (message, key, i) {
                                console.log(message);
                            });
                        }
                    break;
            }

            /**
             * Emitted just after logging a console message
             * @event module.SodaCommon/Console.Console#post log
             */
            self.emit("post log", messages);
        }
    }

    /**
     * A function for JSON.stringify replacement
     * @type {Function}
     */
    this.jsonFunctionReplacer = jsonFunctionReplacer;

    /**
     * Set a console option
     * @param {string} option The name of the option or the dot-notation string path to the option
     * @param {*} value The value to set the option to, if the option doesn't exist it will be created.
     * @return {Console} The current console instance
     */
    this.setOption = function (option, value) {
        if(typeof option === "string") {
            if(option.indexOf(".") > -1) {
                var optLast  = option.substr(option.lastIndexOf(".") + 1, option.length),
                    optFirst = option.substr(0, option.lastIndexOf("."));

                var opt = options.findChildByPath(optFirst, ".");
                if(opt && opt[optLast]) opt[optLast] = value;
            }
            else {
                options[option] = value;

                if (option === 'log4js' && value) {
                    setupLog4js();
                }
            }
        }
        return self;
    };

    /**
     * Set all the console options, with the provided object
     * @param {Console} The current console instance
     */
    this.setOptions = function (opts) {
        var obj = options;
        opts.sodaeach(function walkOption (o, k) {
            var oldObj = obj;
            if(typeof o === "object" && obj[k]) {
                obj = options[k];
                o.sodaeach(walkOption);
                obj = oldObj;
            }
            else {
                obj[k] = o;

                if (k === 'log4js' && o) {
                    setupLog4js();
                }
            }
        });
        return self;
    };

    /**
     * Logs output to the stdout
     * @return {*}
     */
    this.log = function () {
        log("log", arguments);
    };

    /**
     * Logs output to the stdout
     * @return {*}
     */
    this.message = function () {
        log("message", arguments);
    };

    /**
     * Logs output to the stdout
     * @return {*}
     */
    this.warn = function () {
        log("warning", arguments);
    };

    /**
     * Logs output to the stdout
     * @return {*}
     */
    this.error = function () {
        log("error", arguments);
    };

    /**
     * Logs output to the stdout
     * @return {*}
     */
    this.pass = function () {
        log("pass", arguments);
    };

    /**
     * Logs output to the stdout
     * @return {*}
     */
    this.fail = function () {
        log("fail", arguments);
    };

    /**
     * Logs output to the stdout
     * @return {*}
     */
    this.debug = function () {
        log("debug", arguments);
    };

    /**
     * Logs output to the stdout
     * @return {*}
     */
    this.start = function () {
        log("start", arguments);
    };

    /**
     * Logs output to the stdout
     * @return {*}
     */
    this.verbose = function () {
        log("verbose", arguments);
    };

    /**
     * Logs output to the stdout
     * @return {*}
     */
    this.comment = function () {
        log("comment", arguments);
    };
};

util.inherits(Console, EventEmitter);
module.exports = Console;
