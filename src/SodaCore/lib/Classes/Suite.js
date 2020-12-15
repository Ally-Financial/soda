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
 * @module SodaCore/Suite
 */

var path   = require("path"),
    Module = require(path.join(__dirname, "Module"));

/**
 * A Soda Suite
 * @param  {string} name The name of the suite
 * @constructor
 */
function Suite (collection, name) {
    var modules = {},
        self    = this;

    /**
     * The suite's collection driver
     * @type {AssetCollection}
     */
    this.collection = collection;

    /**
     * The string name of the suite
     * @type {String}
     */
    this.name = name || "Unnamed suite";

    /**
     * A list of constants which map to selectors based on the current platform
     * @type {Object}
     */
    this.mapping = {};

    this.getMapping = function () {
        return self.mapping;
    };

    /**
     * Add a module to the suite
     * @param {Module|string} moduleOrModuleName The module, or name of the module to add
     * @returns {Module|null}
     * @composes Module
     */
    this.addModule = function (moduleOrModuleName) {
        if(typeof moduleOrModuleName === "string") {
            modules[moduleOrModuleName] = new Module(self, moduleOrModuleName);
            return modules[moduleOrModuleName];
        }
        else if(moduleOrModuleName instanceof Module){
            modules[moduleOrModuleName.name] = moduleOrModuleName;
            return modules[moduleOrModuleName.name];
        }
        return null;
    };

    /**
     * Return the modules in this suite
     * @return {Array<Modules>} This suite's modules
     */
    this.getModules = function () {
        return modules;
    };

    /**
     * Get a specific module from this suite
     * @param  {string} named The name of the module to retrieve
     * @return {Module} A Module object
     */
    this.getModule = function (named) {
        return modules[named] || null;
    };

    /**
     * Adds to the selector mapping file
     * @param {Object} json The mapping json content
     * @returns {Suite} The current Suite instance
     */
    this.addToMapping = function (json) {
        if(typeof json === "object") {
            json.sodaeach(function (o, k) {
                if(typeof o === "object") self.mapping[k] = o;
            });
        }
        return self;
    };

    /**
     * Clears the mapping
     * @returns {Suite} The current Suite instance
     */
    this.resetMapping = function () {
        self.mapping = {};
        return self;
    };
}

module.exports = Suite;
