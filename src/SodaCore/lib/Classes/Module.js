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
 * @module SodaCore/Module
 */

var path     = require("path"),
    Platform = require(path.join(__dirname, "Platform"));

/**
 * A Soda Module
 * @param  {string} name The name of the suite
 * @constructor
 */
function Module (suite, name) {
    var platforms = {},
        self    = this;

    /**
     * The string name of the module
     * @type {String}
     */
    this.name = name || "Unnamed module";

    /**
     * A list of constants which map to selectors based on the current platform
     * @type {Object}
     */
    this.mapping = {};

    /**
     * Returns the module mapping
     * @return {Object}
     */
    this.getMapping = function () {
        return self.mapping;
    };

    /**
     * If true, the module will be ignored in suite runs
     * @type {Boolean}
     */
    this.ignore = false;

    /**
     * The suite to which this module belongs
     * @type {Suite}
     * @associates Suite
     */
    this.suite = suite;

    /**
     * Add a module to the suite
     * @param {Module|string} name The module, or name of the module to add
     * @composes Platform
     */
    this.addPlatform = function (platformOrPlatformName) {
        if(typeof platformOrPlatformName === "string") {
            platforms[platformOrPlatformName] = new Platform(self.suite, self, platformOrPlatformName);
            return platforms[platformOrPlatformName];
        }
        else if(platformOrPlatformName instanceof Platform){
            platforms[platformOrPlatformName.name] = platformOrPlatformName;
            return platforms[platformOrPlatformName.name];
        }
        return null;
    };

    /**
     * Return the modules in this suite
     * @return {Array<Modules>} This suite's modules
     */
    this.getPlatforms = function () {
        return platforms;
    };

    /**
     * Get a specific module from this suite
     * @param  {string} named The name of the module to retrieve
     * @return {Module} A Module object
     */
    this.getPlatform = function (named) {
        return platforms[named] || null;
    };

    /**
     * Adds to the selector mapping file
     * @param {Object} json The mapping json content
     * @returns {Module} The current Module instance
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
     * @returns {Module} The current Suite instance
     */
    this.resetMapping = function () {
        self.mapping = {};
        return self;
    };

    // Add the generic platform
    self.addPlatform("generic");
}

module.exports = Module;
