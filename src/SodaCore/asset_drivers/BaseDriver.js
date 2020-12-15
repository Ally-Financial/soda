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

var nodePath = require("path"),
    Suite    = require(nodePath.join(__dirname, "..", "lib", "Classes", "Suite"));

/**
 * Methods common to all driver. Every asset driver must inherit from this class
 * @param {Soda} soda The Soda instance tied to the driver
 * @param {String} path The path to the assets (or "@database" for database drivers)
 * @constructor
 */
var BaseDriver = function (soda, collection, path) {
    var self = this;

    /**
     * Contains the drivers Suite objects
     * @type {Object}
     */
    this.suites = {};

    /**
     * The path to the collection drivers's project folder
     * @type {string}
     */
    this.path = path;

    /**
     * An object containing the assets for this driver by filename
     * @type {object}
     */
    this.assets = {};

    /**
     * Add a suite to the collection driver
     * @param {string|Suite} suiteOrSuiteName The suite, or the name of the suite to add
     * @return {Suite|null} A Suite object, or null
     * @composes Suite
     */
    this.addSuite = function (suiteOrSuiteName) {
        if(typeof suiteOrSuiteName === "string") {
            self.suites[suiteOrSuiteName] = new Suite(collection, suiteOrSuiteName);
            return self.suites[suiteOrSuiteName];
        }
        else if(suiteOrSuiteName instanceof Suite){
            self.suites[suiteOrSuiteName.name] = suiteOrSuiteName;
            return self.suites[suiteOrSuiteName.name];
        }
        return null;
    };

    /**
     * Get a suite from the driver
     * @param  {string} name The name of the suite to find
     * @return {Suite|null} A Suite object, or null
     */
    this.getSuite = function (name) {
        return self.suites[name] || null;
    };

    /**
     * Get all the suites from the driver
     * @param  {string} name The name of the suite to find
     * @return {Suite|null} A Suite object, or null
     */
    this.getAllSuites = function () {
        return self.suites;
    };

    /**
     * Get the driver's modules as an object
     * @return {object} A collection of modules
     */
    this.getAllModules = function () {
        var modules = {};
        self.suites.sodaeach(function(s) { modules[s.name] = s.getModules(); });
        return modules;
    };

    /**
     * Get a suite using a string name
     * @param  {String} s The suite's name
     * @return {Suite|null|Error} If the suite exists, the suite, if the descriptor is bad, an error, null otherwise.
     */
    this.getSuiteUsingString = function (s) {
        if(typeof s === "string") {
            return self.suites[s] || null;
        }
        else {
            return new Error("Bad suite descriptor");
        }
    };
};

module.exports = BaseDriver;
