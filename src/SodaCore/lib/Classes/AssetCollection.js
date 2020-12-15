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
 * Manages the retrieval and creation of test assets using the given "driver"
 * @module Soda/AssetCollection
 */

var EventEmitter = require('events').EventEmitter,
    util         = require("util"),
    nodePath     = require("path");

/**
 * A collection of assets (suites) which relate to a project path
 * @param  {Soda} soda A Soda instance
 * @param  {string} path The path to the project folder
 * @constructor
 * @augments EventEmitter
 */
var AssetCollection = function (soda, path) {
    var self   = this,
        driver = null;

    /**
     * Loads the specified asset driver, if it exists
     * @param  {String} named The name of the driver to load
     * @return {AssetCollection} The current AssetCollection instance
     */
    function loadDriver (named, done) {
        try {
            var Driver = require(nodePath.join(__dirname, "..", "..", "asset_drivers", named));
            driver = new Driver(soda, self, path);
            if(done instanceof Function) done.call(self, null, driver);
        }
        catch (e) {
            if(done instanceof Function) done.call(self, e, null);
        }
        return self;
    }

    // Load driver based on test path
    switch(true) {
        case soda.isDBPath(path) === true:
            soda.console.warn("*** Using No-FS Driver (DB) ***");
            loadDriver("database", function (err) {
                if(err) throw err;
            });
            break;

        case soda.isLambdaPath(path) === true:
            soda.console.warn("*** Using No-FS Driver (lambda) ***");
            loadDriver("lambda", function (err) {
                if(err) throw err;
            });
            break;

        case path.includes("gherkins") === true:
            soda.console.warn("*** Using FS-Gherkin Driver ***");
            loadDriver("gherkinfiles", function (err) {
                if(err) throw err;
            });
            break;

        default:
            soda.console.warn("*** Using File System Driver ***");
            loadDriver("filesystem", function (err) {
                if(err) throw err;
            });
            break;
    }

    Object.defineProperty(self, "path", {
        configurable : false,
        enumerable   : true,
        get          : function () {
            return driver ? driver.path : null;
        }
    });

    /**
     * Loads the assets for this collection
     * @param  {Function} done A callback for completion
     * @return {AssetCollection} The current AssetCollection instance
     */
    this.load = function (done) {
        if(driver) {
            driver.load(function (err, driver) {
                if(err) {
                    soda.console.error("Soda id: " + soda.yid + " with assets from `" + driver.path + "` failed to load, because:", err.message);
                }
                else {
                    console.log("Soda id: " + soda.yid + " assets from `" + driver.path + "` loaded successfully!");
                }
                self.emit("assets loaded", err, self);
                if(done instanceof Function) done.call(self, err, self);
            });
        }
        else {
            if(done instanceof Function) done.call(self, new soda.exception.AssetNoDriverLoadedError("Soda id: " + soda.yid + " with no asset collection driver loaded."), null);
        }
        return self;
    };

    /**
     * Get a suite from the driver
     * @param  {string} name The name of the suite to find
     * @return {Suite|null} A Suite object, or null
     */
    this.getSuite = function () {
        if(driver) {
            return driver.getSuite.apply(driver, arguments);
        }
        else {
            return null;
        }
    };

    /**
     * Get all the suites from the driver
     * @param  {string} name The name of the suite to find
     * @return {Suite|null} A Suite object, or null
     */
    this.getAllSuites = function () {
        if(driver) {
            return driver.getAllSuites.apply(driver, arguments);
        }
        else {
            return null;
        }
    };

    /**
     * Get the driver's modules as an object
     * @return {object} A collection of modules
     */
    this.getAllModules = function () {
        if(driver) {
            return driver.getAllModules.apply(driver, arguments);
        }
        else {
            return null;
        }
    };

    /**
     * Saves test results using the loaded driver
     * @return {AssetCollection} The current AssetCollection instance
     */
    this.saveResults = function (res, done) {
        if(driver) {
            driver.saveResults.apply(driver, arguments);
        }
        else {
            if(done instanceof Function) done.call(self, new soda.exception.AssetNoDriverLoadedError("No asset collection driver loaded."), null);
        }
        return self;
    };

    /**
     * Saves a trace file using the loaded driver
     * @return {AssetCollection} The current AssetCollection instance
     */
    this.saveTrace = function (trace, dest, done) {
        if(driver) {
            driver.saveTrace.apply(driver, arguments);
        }
        else {
            if(done instanceof Function) done.call(self, new soda.exception.AssetNoDriverLoadedError("No asset collection driver loaded."), null);
        }
        return self;
    };

    /**
     * Unloads the assets for this collection
     * @return {AssetCollection} The current AssetCollection instance
     */
    this.unload = function () {
        if(driver) return driver.unload.apply(driver, arguments);
        return self;
    };

    /**
     * Creates a new module
     * @param {String} suite The name of the suite to which this module will belong
     * @param {String} module The name of the new module
     * @param {Function} done A callback for completion
     */
    this.makeModule = function (suite, module, done) {
        if(driver) {
            driver.makeModule(suite, module, function (err) {
                if(done instanceof Function) done.call(self, err);
            });
        }
        else {
            if(done instanceof Function) done.call(self, new soda.exception.AssetNoDriverLoadedError("No asset collection driver loaded."), null);
        }
        return self;
    };

    /**
     * Delete an existing module
     * @param {String} suite The name of the suite from which this module will be deleted
     * @param {String} module The name of the module to delete
     * @param {Function} done A callback for completion
     */
    this.deleteModule = function (suite, module, done) {
        if(driver) {
            driver.deleteModule(suite, module, function (err) {
                if(done instanceof Function) done.call(self, err);
            });
        }
        else {
            if(done instanceof Function) done.call(self, new soda.exception.AssetNoDriverLoadedError("No asset collection driver loaded."), null);
        }
        return self;
    };

    /**
     * Creates a new suite
     * @param {String} suite The name of the suite to make
     * @param {Function} done A callback for completion
     */
    this.makeSuite = function (suite, done) {
        if(driver) {
            driver.makeSuite(suite, function (err) {
                if(done instanceof Function) done.call(self, err);
            });
        }
        else {
            if(done instanceof Function) done.call(self, new soda.exception.AssetNoDriverLoadedError("No asset collection driver loaded."), null);
        }
        return self;
    };

    /**
     * Deletes an existing suite
     * @param {String} suite The name of the suite to delete
     * @param {Function} done A callback for completion
     */
    this.deleteSuite = function (suite, done) {
        if(driver) {
            driver.deleteSuite(suite, function (err) {
                if(done instanceof Function) done.call(self, err);
            });
        }
        else {
            if(done instanceof Function) done.call(self, new soda.exception.AssetNoDriverLoadedError("No asset collection driver loaded."), null);
        }
        return self;
    };

    /**
     * Writes an asset to file
     * @param {Object} asset The asset with the keys, suite, module, name, platform, and contents
     * @param {Function} done A callback for completion
     */
    this.makeAsset = function (asset, done) {
        if(driver) {
            driver.makeAsset(asset, function (err) {
                if(done instanceof Function) done.call(self, err);
            });
        }
        else {
            if(done instanceof Function) done.call(self, new soda.exception.AssetNoDriverLoadedError("No asset collection driver loaded."), null);
        }
        return self;
    };

    /**
     * Delete an asset
     * @param {Object} asset The asset with the keys, suite, module, name, platform, and contents
     * @param {Function} done A callback for completion
     */
    this.deleteAsset = function (asset, done) {
        if(driver) {
            driver.deleteAsset(asset, function (err) {
                if(done instanceof Function) done.call(self, err);
            });
        }
        else {
            if(done instanceof Function) done.call(self, new soda.exception.AssetNoDriverLoadedError("No asset collection driver loaded."), null);
        }
        return self;
    };

    /**
     * Reloads the current assets
     * @param {Function} done A callback for completion
     * @type {Function}
     */
    this.reload = self.load;

    /**
     * Once an action is resolved this function will be invoked
     * @param  {Object} asset The resolved asset
     * @param  {Object} options The options used to resolve the asset
     * @param  {Function} done A callback for completion
     * @return {undefined}
     */
    function resolveComplete (asset, options, done) {
        if(asset) {
            asset.collection = self;
            var action = new soda.Action(asset, options.run);
            if(done instanceof Function) done.call(self, null, action, asset);
        }
        else {
            var e = new soda.exception.AssetNotFoundError("Couldn't resolve asset `" + options.name + "` in suite `" + options.suite + "`, module `" + options.module + "`, and platform `" + options.platform + "`");
            if(done instanceof Function) done.call(self, e, null, null);
        }
    }

    /**
    * Get the collection's hierarchy as a JSON stringifiable object
    * @return {object} A object with the asset hierarchy
     */
    this.getHierarchy = function () {
        var hierarchy = {},
            suites    = driver.getAllSuites();

        if(!suites) {
            return {};
        }

        suites.sodaeach(function(s) {
            hierarchy[s.name] = {};
            var modules = s.getModules();

            modules.sodaeach(function (m) {
                hierarchy[s.name][m.name] = {};

                var platforms = m.getPlatforms();

                platforms.sodaeach(function (p) {
                    hierarchy[s.name][m.name][p.name] = {};

                    var tests   = p.getTests(),
                        actions = p.getActions(),
                        screens = p.getScreens(),
                        menus   = p.getMenus(),
                        popups  = p.getPopups();

                    hierarchy[s.name][m.name][p.name].tests   = {};
                    hierarchy[s.name][m.name][p.name].actions = {};
                    hierarchy[s.name][m.name][p.name].screens = {};
                    hierarchy[s.name][m.name][p.name].menus   = {};
                    hierarchy[s.name][m.name][p.name].popups  = {};

                    tests.sodaeach(function (t) {
                        hierarchy[s.name][m.name][p.name].tests[t.name] = {
                            baseName    : t.getName(),
                            path        : t.getPath(),
                            id          : t.getId(),
                            description : t.getDescription(),
                            name        : t.getHumanName(),
                            widget      : t.widget,
                            syntax      : t.syntax
                        };
                    });
                    actions.sodaeach(function (t) {
                        hierarchy[s.name][m.name][p.name].actions[t.name] = {
                            baseName    : t.getName(),
                            path        : t.getPath(),
                            id          : t.getId(),
                            description : t.getDescription(),
                            name        : t.getHumanName(),
                            widget      : t.widget,
                            syntax      : t.syntax
                        };
                    });
                    screens.sodaeach(function (t) {
                        hierarchy[s.name][m.name][p.name].screens[t.name] = {
                            baseName    : t.getName(),
                            path        : t.getPath(),
                            id          : t.getId(),
                            description : t.getDescription(),
                            name        : t.getHumanName(),
                            widget      : t.widget,
                            syntax      : t.syntax
                        };
                    });
                    menus.sodaeach(function (t) {
                        hierarchy[s.name][m.name][p.name].menus[t.name] = {
                            baseName    : t.getName(),
                            path        : t.getPath(),
                            id          : t.getId(),
                            description : t.getDescription(),
                            name        : t.getHumanName(),
                            widget      : t.widget,
                            syntax      : t.syntax
                        };
                    });
                    popups.sodaeach(function (t) {
                        hierarchy[s.name][m.name][p.name].popups[t.name] = {
                            baseName    : t.getName(),
                            path        : t.getPath(),
                            id          : t.getId(),
                            description : t.getDescription(),
                            name        : t.getHumanName(),
                            widget      : t.widget,
                            syntax      : t.syntax
                        };
                    });
                });
            });
        });
        return hierarchy;
    };

    /**
     * Resolve an asset from the collection
     * @composes ActionManager
     * @param  {object} opts An object with the appropriate keys to find the asset (e.g. suite, module, etc.)
     * @param  {Function} done A callback for completion
     * @return {FileSystem} The current FileSystem object
     */
    this.resolve = function (opts, done) {        
        var err = arguments.sodaexpect("object", "function|null|undefined").error;

        if(err) {
            if(done instanceof Function) done.call(self, err, null, null);
            return;
        }

        var options = {
                type     : null,
                name     : null,
                suite    : "global",
                module   : "global",
                platform : "generic",
                accept   : { global: true, common: true, generic: true },
                run      : null
            };

        opts.sodaeach(function (opt, k) {
            if(options[k] !== undefined) { options[k] = opt; }
        });

        if(options.accept.global  === undefined || options.accept.global  === null) { options.accept.global  = true; }
        if(options.accept.common  === undefined || options.accept.common  === null) { options.accept.common  = true; }
        if(options.accept.generic === undefined || options.accept.generic === null) { options.accept.generic = true; }

        err = null;
        if(!options.type)       { err = new Error("FileSystem.resolve expected parameter `opts` to contain the key `type`");     }
        if(!options.name)       { err = new Error("FileSystem.resolve expected parameter `opts` to contain the key `name`");       }
        if(!options.suite)      { err = new Error("FileSystem.resolve expected parameter `opts` to contain the key `suite`");    }
        if(!options.module)     { err = new Error("FileSystem.resolve expected parameter `opts` to contain the key `module`");   }
        if(!options.platform)   { err = new Error("FileSystem.resolve expected parameter `opts` to contain the key `platform`"); }

        if(err) {
            if(done instanceof Function) done.call(self, err);
            return;
        }

        options.type = options.type.toLowerCase().replace(/s$/, '');

        var a  = null,
            ga = null,
            ca = null,
            gs, gm, cm, s, m, p;

        gs = driver.getSuite("global");
        s  = driver.getSuite(options.suite);

        // Get the local asset
        if(s) {
            m = s.getModule(options.module);
            if(m) {
                p = m.getPlatform(options.platform);
                if(p) {
                    a = p["get" + options.type.ucFirst](options.name);
                }
                if(!a && options.accept.generic === true) {
                    p = m.getPlatform("generic");
                    a = p["get" + options.type.ucFirst](options.name);
                }
            }
        }

        if(a) {
            resolveComplete(a, options, done);
            return self;
        }

        // Get the common asset
        if(s && options.accept.common === true) {
            cm = s.getModule("common");
            if(cm) {
                p = cm.getPlatform(options.platform);
                if(p) {
                    ca = p["get" + options.type.ucFirst](options.name);
                }
                if(!ca && options.accept.generic === true) {
                    p  = cm.getPlatform("generic");
                    ca = p["get" + options.type.ucFirst](options.name);
                }
            }
        }

        if(ca) {
            resolveComplete(ca, options, done);
            return self;
        }

        // Get the global asset
        if(gs && options.accept.global === true) {
            gm = gs.getModule("global");
            if(gm) {
                p = gm.getPlatform(options.platform);
                if(p) {
                    ga = p["get" + options.type.ucFirst](options.name);
                }
                if(!ga && options.accept.generic === true) {
                    p  = gm.getPlatform("generic");
                    ga = p["get" + options.type.ucFirst](options.name);
                }
            }
        }

        resolveComplete(ga, options, done);
        return self;
    };

};

util.inherits(AssetCollection, EventEmitter);
module.exports = AssetCollection;
