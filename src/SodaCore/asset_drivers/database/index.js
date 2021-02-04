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
 * File system driver for Soda AssetCollection
 * @module SodaCore/AssetDrivers/Database
 */

var nodePath = require("path"),

    // Use the local version of this
    assetTypes   = require(nodePath.join(__dirname, "..", "..", "lib", "Classes", "AssetTypes")),
    BaseDriver   = require(nodePath.join(__dirname, "..", "BaseDriver")),

    Test    = assetTypes.Test,
    Menu    = assetTypes.Menu,
    Screen  = assetTypes.Screen,
    Action  = assetTypes.Action,
    Popup   = assetTypes.Popup,
    Suite   = require(nodePath.join(__dirname, "..", "..", "lib", "Classes", "Suite")),

    EventEmitter = require('events').EventEmitter,
    util         = require("util");

    /**
     * The file system driver for AssetCollection
     * @param  {Soda} soda A Soda instance
     * @param  {string} path The path to the project folder
     * @constructor
     * @extends BaseDriver
     */
var Database = function (soda, collection, path) {
    var self = this;

    // Inherit from the BaseDriver
    BaseDriver.call(self, soda, collection, path);

    /**
     * Loads the assets for this driver. Queries the DB for available suites, modules, and assets
     * @param  {Function} done A callback for completion
     * @return {Database} The current Database instance
     */
    this.load = function (done) {
        self.suites = {};

        // For each suite create a new Suite object
        soda.useDb(soda.config.get("testPath")).emit("list suites", function (err, s) {
            if(err) {
                if(typeof err === "string") err = new soda.exception.AssetGenericError(err);
                if(done instanceof Function) done.call(self, err, self);
                return;
            }

            var suitesLoaded = s.sodaeach(function (suiteItem) {

                if(typeof suiteItem !== "object") {
                    if(done instanceof Function) done.call(self, new soda.exception.AssetsParseError("Suite must be an object!"), self);
                    return;
                }

                if(!suiteItem.name) {
                    if(done instanceof Function) done.call(self, new soda.exception.AssetsParseError("Suite name field required!"), self);
                    return;
                }

                self.suites[suiteItem.name] = new Suite(collection, suiteItem.name);
                if(typeof suiteItem.map === "object") self.suites[suiteItem.name].addToMapping(suiteItem.map);
            });

            if(!suitesLoaded) return;

            // Now all suites loaded, load modules...
            soda.useDb(soda.config.get("testPath")).emit("list modules", function (err, m) {
                if(err) {
                    if(typeof err === "string") err = new soda.exception.AssetGenericError(err);
                    if(done instanceof Function) done.call(self, err, self);
                    return;
                }

                var modulesLoaded = m.sodaeach(function (moduleItem) {
                    if(typeof moduleItem !== "object") {
                        if(done instanceof Function) done.call(self, new soda.exception.AssetsParseError("Module must be an object!"), self);
                        return false;
                    }

                    if(!moduleItem.name) {
                        if(done instanceof Function) done.call(self, new soda.exception.AssetsParseError("Module name field required!"), self);
                        return false;
                    }

                    if(!moduleItem.suite) {
                        if(done instanceof Function) done.call(self, new soda.exception.AssetsParseError("Module suite field required!"), self);
                        return false;
                    }

                    var moduleSuite = self.suites[moduleItem.suite];
                    if(moduleSuite) {
                        var module = moduleSuite.addModule(moduleItem.name);
                        if(typeof moduleItem.map === "object") module.addToMapping(moduleItem.map);
                    }
                    else {
                        soda.console.warn("Trying to load module `" + moduleItem.name + "` from non-existent suite `" +  moduleItem.suite + "`! Module ignored.");
                    }
                });

                if(!modulesLoaded) return;

                // Now all modules and suite loaded, load assets
                // For each module, get its assets
                soda.useDb(soda.config.get("testPath")).emit("list assets", function (err, assets) {
                    if(err) {
                        if(typeof err === "string") err = new soda.exception.AssetGenericError(err);
                        if(done instanceof Function) done.call(self, err, self);
                        return;
                    }

                    var assetsLoaded = assets.sodaeach(function (a) {
                        if(!a.platform) a.platform = "generic";
                        var asset;

                        if(!a.name || !a.type) {
                            if(done instanceof Function) done.call(self, new soda.exception.AssetsParseError("Asset name and type fields are required!"), self);
                            return false;
                        }

                        var suite = self.suites[a.suite];
                        if(!suite) {
                            soda.console.warn("Trying to load asset `" + a.name + "` from non-existent suite `" +  a.suite + "`! Asset ignored.");
                            return;
                        }

                        var module = suite.getModule(a.module);
                        if(!module) {
                            if(a.module === "global") {
                                module = suite.addModule("global");
                            }
                            else {
                                soda.console.warn("Trying to load asset `" + a.name + "` from non-existent module `" +  a.module + "`! Asset ignored.");
                                return;
                            }
                        }

                        var platform = module.getPlatform(a.platform.toLowerCase());
                        if(!platform) platform = module.addPlatform(a.platform.toLowerCase());

                        var type;
                        switch(a.type.toLowerCase()) {
                            case "test":
                                asset = new Test(soda, suite, module, platform, a.name, path + "/" + a.suite + "/" + a.module + "/tests/" + a.platform + "/" + a.name);
                                type = "Test";
                                break;
                            case "action":
                                asset = new Action(soda, suite, module, platform, a.name, path + "/" + a.suite + "/" + a.module + "/actions/" + a.platform + "/" + a.name);
                                type = "Action";
                                break;
                            case "screen":
                                asset = new Screen(soda, suite, module, platform, a.name, path + "/" + a.suite + "/" + a.module + "/screens/" + a.platform + "/" + a.name);
                                type = "Screen";
                                break;
                            case "menu":
                                asset = new Menu(soda, suite, module, platform, a.name, path + "/" + a.suite + "/" + a.module + "/menus/" + a.platform + "/" + a.name);
                                type = "Menu";
                                break;
                            case "popup":
                                asset = new Popup(soda, suite, module, platform, a.name, path + "/" + a.suite + "/" + a.module + "/popups/" + a.platform + "/" + a.name);
                                type = "Popup";
                                break;

                            default:
                                if(done instanceof Function) done.call(self, new soda.exception.AssetsParseError("Unrecognized asset type `" + a.type + "`"), self);
                                return false;
                        }

                        // Set the asset's description
                        if(typeof a.description === "string") asset.description = a.description;

                        // Set the asset's id
                        if(typeof a.id === "string") asset.id = a.id;

                        // Set the widget properties
                        if(typeof a.widget === "object") asset.widget = a.widget;

                        // Set the asset's syntax
                        if(typeof a.syntax === "object") {
                            var syntax = {};
                            if(typeof a.syntax.name    === "string") syntax.name    = a.syntax.name;
                            if(typeof a.syntax.version === "string") syntax.version = a.syntax.version;
                            asset.syntax = syntax;
                        }

                        platform["add" + type](asset);
                    });

                    if(!assetsLoaded) {
                        return;
                    }
                    else {
                        if(done instanceof Function) done.call(self, null, self);
                    }
                });
            });
        });
    };

    /**
     * Saves the trace of a test to the database.
     * @param  {Trace} trace A Trace instance
     * @param  {string} dest A path to the location
     * @return {Database} The current Database instance
     */
    this.saveTrace = function (trace, dest, done) {
        soda.console.debug("Saving Trace to Database...");
        soda.useDb(soda.config.get("testPath")).emit("save trace", trace, dest);
        if(done instanceof Function) done.call(self, null);
    };

    /**
     * Saves the result of a test to the database.
     * @param  {Trace} res A result object
     * @return {Database} The current Database instance
     */
    this.saveResults = function (res, done) {
        soda.console.debug("Saving Results to Database...");
        soda.useDb(soda.config.get("testPath")).emit("save results", res);
        if(done instanceof Function) done.call(self, null);
    };

    /**
     * Unloads the assets for this collection
     * @return {Database} The current Database instance
     */
    this.unload = function (done) {
        soda.useDb(soda.config.get("testPath")).emit("unload", done);
        self.suites = null;
        return self;
    };

    this.reload = this.load;
};

util.inherits(Database, EventEmitter);
module.exports = Database;
