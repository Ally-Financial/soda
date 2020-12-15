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
 * @module SodaCore/Syntax
 */

var EventEmitter = require('events').EventEmitter,
    util         = require('util'),
    nodePath     = require('path'),

/**
 * Manages engine syntaxes: get, save, etc.
 * @constructor
 * @augments EventEmitter
 */
Syntax = function (soda) {

    var syntaxes = {};

    /**
     * Get an engine syntax
     * @param {object} action The action object to bind syntax events to
     * @param {string} name The name of the syntax
     * @param {string} version The syntax version
     * @returns {*|templates.action.meta.syntax|{name, version}|templates.screen.meta.syntax|templates.menu.meta.syntax|templates.popup.meta.syntax}
     */
    this.get = function (action, name, version) {
        var err = arguments.sodaexpect("object|undefined|null", "string|undefined", "string|undefined").error;
        if(err) throw err;

        if(!action && typeof syntaxes[name] === "object" && typeof syntaxes[name][version] === "object")
            return syntaxes[name][version];

        if(!version) version = soda.config.get("defaultSyntaxName");
        if(!name)    name    = soda.config.get("defaultSyntaxVersion");

        if(syntaxes[name] && syntaxes[name].isObjectNotArray && syntaxes[name][version]) {
            syntaxes[name][version].events(action, soda);
        }
        else {
            if(!syntaxes[name]) syntaxes[name] = {};
            syntaxes[name][version] = {
                syntax: require(nodePath.join(soda.config.get("root"), "SodaCore/engine/syntaxes/", name, version, 'syntax.js')),
                events: require(nodePath.join(soda.config.get("root"), "SodaCore/engine/syntaxes/", name, version, 'events.js'))
            };

            if(typeof action === "object") syntaxes[name][version].events(action, soda);
        }
        return syntaxes[name][version];
    };
};

util.inherits(Syntax, EventEmitter);
module.exports = Syntax;
