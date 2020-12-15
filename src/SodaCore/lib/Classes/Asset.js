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
 * @module SodaCore/Asset
 */

var EventEmitter = require('events').EventEmitter,
    util         = require("util");

/**
 * A Soda Asset
 * @param  {Module} module The module that this asset will belong to
 * @param  {string} name The name of the asset
 * @param  {string} filepath The path to the asset
 * @constructor
 */
function Asset (soda, suite, module, platform, basename, filepath) {

    filepath = filepath || null;

    var self     = this,
        contents = {};

    /**
     * The module the asset belongs to
     * @type {Module}
     * @composes Module
     */
    this.module = module;

    /**
     * The platform the asset belongs to
     * @type {Platform}
     * @composes Platform
     */
    this.platform = platform || "generic";

    /**
     * The suite the asset belongs to
     * @type {Suite}
     * @composes Suite
     */
    this.suite = suite;

    /**
     * The asset name
     * @type {string}
     */
    this.name = basename;

    /**
     * The asset name
     * @type {string}
     */
    this.humanName = basename;

    /**
     * The asset description
     * @type {string}
     */
    this.description = null;

    /**
     * The asset id
     * @type {string}
     */
    this.id = null;

    /**
     * Is the asset a widget?
     * @type {Boolean}
     */
    this.widget = false;

    /**
     * The asset's filepath
     * @type {string}
     */
    this.path = filepath;

    /**
     * The asset's syntax
     * @type {Object}
     */
    this.syntax = {
        name    : null,
        version : null,
    };

    /**
     * The asset's parent collection
     * @associates AssetCollection
     */
    this.collection = null;

    /**
     * Set the asset's name
     * @param {string} v The name to set the asset to
     */
    this.setName = function (v) { self.name = v; };

    /**
     * Set the asset's name
     * @param {string} v The name to set the asset to
     */
    this.setHumanName = function (v) { self.humanName = v; };

    /**
     * Set the asset's description
     * @param {string} v The new description for the asset
     */
    this.setDescription = function (v) { self.description = v; };

    /**
     * Set the asset's id
     * @param {string} v The id to set the asset to
     */
    this.setId = function (v) { self.id = v; };

    /**
     * Set the asset's contents
     * @param {string} v The new asset contents
     */
    this.setContents = function (v) { contents = v; };

    /**
     * Set the asset's syntax
     * @param {string} v The new asset contents
     */
    this.setSyntax = function (v) { self.syntax = v; };

    /**
     * Get the asset's path
     * @return {string}
     */
    this.getPath = function () { return self.path; };

    /**
     * Get the asset's name
     * @return {string}
     */
    this.getName = function () { return self.name; };

    /**
     * Get the asset's name
     * @return {string}
     */
    this.getHumanName = function () { return self.name; };

    /**
     * Get the asset's description
     * @return {string}
     */
    this.getDescription = function () { return self.description; };

    /**
     * Get the asset's id
     * @return {string}
     */
    this.getId = function () { return self.id; };

    /**
     * Get the asset's contents
     * @return {string}
     */
    this.getContents = function (done) {
        if(soda.isDBPath(soda.config.get("testPath"))) {
            soda.useDb(soda.config.get("testPath")).emit("get contents for", { suite: self.suite.name, module: self.module.name, platform: self.platform.name, name: self.name}, function (err, contents) {
                if(contents && typeof contents === "string") {
                    try {
                        contents = JSON.parse(contents);
                    }
                    catch (e) { /* No Op */ }
                }
                if(done instanceof Function) done.call(self, err, contents);
            });
        }
        else {
            if(done instanceof Function) done.call(self, null, contents);
        }
        return self;
    };

    /**
     * Get the asset's stynax
     * @return {object}
     */
    this.getSyntax = function () {
        return self.syntax;
    };
}

util.inherits(Asset, EventEmitter);
module.exports = Asset;
