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
 * @module SodaCore/AssetDrivers/Lambda
 */

const { type } = require("os");

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
    lambdaConnector = require(nodePath.join(__dirname, "..", "..", "lib", "Classes", "AWS"));

    /**
     * The file system driver for AssetCollection
     * @param  {Soda} soda A Soda instance
     * @param  {string} path The path to the project folder
     * @constructor
     * @extends BaseDriver
     */
var Lambda = function (soda, collection, path) {
    var self = this;

    // Inherit from the BaseDriver
    BaseDriver.call(self, soda, collection, path);

    var pathParts = soda.config.get("testPath").split(":");
    var auth_host = soda.config.get("auth_host");
    var auth_path = soda.config.get("auth_path");
    var apihost = soda.config.get("apihost");

    var apipath = pathParts[1];
    var key = pathParts[2];
    var secret = pathParts[3];
    var driver = null;
    soda.config.set('apipath', apipath);
    soda.config.set('key', key);
    soda.config.set('secret', secret);

    var connector = new lambdaConnector(soda);

    /**
     * Establishes connection to AWS using SodaCore/lib/Classes/AWS
     * @param  {AWS} aws An AWS instance
     * @return {Lambda} The current Lambda instance
     */
    function awsConnect(aws) {
        return new Promise((resolve, reject) => {
            var options = {
                auth_host: auth_host,
                auth_path: auth_path,
                apihost: apihost,
                apipath: apipath,
                key: key,
                secret: secret
            }
        
            aws.connect(options, function (err) {
                // There was an error starting the driver, send the error on and reset driver to null.

                if(err) {
                    soda.console.error(err);

                    self.driver = null;
                    reject(err);
                }
                
                resolve(err);
            });
        });
    }

    /**
     * Loads the assets for this driver. Queries the DB for available suites, modules, and assets
     * @param  {Function} done A callback for completion
     * @return {Lambda} The current Lambda instance
     */
    this.load = function (done) {
        self.suites = {};
        var processSuites = function(suites) {
            return new Promise((suiteResolve, suiteReject) => {
                if (suites.length > 0) {
                    suites.forEach((suiteValue, suiteIndex, suiteArray) => {
                        var suiteItem = suiteValue;
        
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
        
                        if (suiteIndex === suiteArray.length-1) {
                            suiteResolve();
                        }
                    });
                }
                else {
                    if(done instanceof Function) {
                        done.call(self, null, self);
                    }
                }
            });
        }

        /**
         * Processes all the modules using a promise to handle blocking until completion
         * @param  {Array} modules The modules to iterate through
         * @return {Lambda} The current Lambda instance
         */
        var processModules = function(modules) {
            return new Promise((moduleResolve, moduleReject) => {
                if (modules.length > 0) {
                    modules.forEach((moduleValue, moduleIndex, moduleArray) => {
                        var moduleItem = moduleValue;
    
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
    
                        if (moduleIndex === moduleArray.length-1) {
                            moduleResolve();
                        }
                    });
                }
                else {
                    if(done instanceof Function) {
                        done.call(self, null, self);
                    }
                }
            });
        }

         /**
         * Processes all the assets using a promise to handle blocking until completion
         * @param  {Array} assets The assets to iterate through
         * @return {Lambda} The current Lambda instance
         */
        var processAssets = function(assets) { 
            return new Promise((assetResolve, assetReject) => {
                if (assets.length > 0) {
                    assets.forEach((assetValue, assetIndex, assetArray) => {
                        var assetItem = assetValue;
    
                        if(!assetItem.meta.platform) assetItem.meta.platform = "generic";
                        var asset;
    
                        if(!assetItem.meta.name || !assetItem.meta.type) {
                            if(done instanceof Function) done.call(self, new soda.exception.AssetsParseError("Asset name and type fields are required!"), self);
                            return false;
                        }
    
                        var suite = self.suites[assetItem.meta.suite];
    
                        if(!suite) {
                            soda.console.warn("Trying to load asset `" + assetItem.name + "` from a non-existent or different suite `" +  assetItem.suite + "`! Asset ignored.");
                            if (assetIndex === assetArray.length-1) {
                                assetResolve();
                            }
                            return;
                        }
    
                        var module = suite.getModule(assetItem.meta.module);
                        if(!module) {
                            if(aassetItem.meta.module === "global") {
                                module = suite.addModule("global");
                            }
                            else {
                                if (assetIndex === assetArray.length-1) {
                                    assetResolve();
                                }
                                soda.console.warn("Trying to load asset `" + assetItem.meta.name + "` from a non-existent or different module `" +  assetItem.module + "`! Asset ignored.");
                                return;
                            }
                        }
    
                        var platform = module.getPlatform(assetItem.meta.platform.toLowerCase());
                        if(!platform) platform = module.addPlatform(assetItem.meta.platform.toLowerCase());
    
                        var contents = assetItem;
    
                        switch(assetItem.meta.type.toLowerCase()) {
                            case "test":
                                asset = new Test(soda, suite, module, platform, assetItem.meta.name, path + "/" + assetItem.meta.suite + "/" + assetItem.meta.module + "/tests/" + assetItem.meta.platform + "/" + assetItem.meta.name);                                            
                                platform.addTest(asset);
                                break;
                            case "action":
                                asset = new Action(soda, suite, module, platform, assetItem.meta.name, path + "/" + assetItem.meta.suite + "/" + assetItem.meta.module + "/actions/" + assetItem.meta.platform + "/" + assetItem.meta.name);
                                platform.addAction(asset);
                                break;
                            case "screen":
                                asset = new Screen(soda, suite, module, platform, assetItem.meta.name, path + "/" + assetItem.meta.suite + "/" + assetItem.meta.module + "/screens/" + assetItem.meta.platform + "/" + assetItem.meta.name);
                                platform.addScreen(asset);
                                break;
                            case "menu":
                                asset = new Menu(soda, suite, module, platform, assetItem.meta.name, path + "/" + assetItem.meta.suite + "/" + assetItem.meta.module + "/menus/" + assetItem.meta.platform + "/" + assetItem.meta.name);
                                platform.addMenu(asset);
                                break;
                            case "popup":
                                asset = new Popup(soda, suite, module, platform, assetItem.meta.name, path + "/" + assetItem.meta.suite + "/" + assetItem.meta.module + "/popups/" + assetItem.meta.platform + "/" + assetItem.meta.name);
                                platform.addPopup(asset);
                                break;
    
                            default:
                                if(done instanceof Function) done.call(self, new soda.exception.AssetsParseError("Unrecognized asset type `" + assetItem.meta.type + "`"), self);
                                return false;
                        }

                        if (assetItem.meta.oid) {
                            assetItem.meta.id = assetItem.meta.oid;
                            delete assetItem.meta.oid;
                            delete assetItem.meta.suite;
                            delete assetItem.meta.module;
                            delete assetItem.meta.platform;
                            delete assetItem.meta.type;
                        }
                        if (assetItem.meta.widget && Object.keys(assetItem.meta.widget).length === 0) {
                            delete assetItem.meta.widget;
                        }
    
                        // Set the asset's description
                        if(typeof assetItem.meta.description === "string") asset.description = assetItem.meta.description;
    
                        // Set the asset's id
                        if(typeof assetItem.meta.id === "string") asset.setId(assetItem.meta.id);
    
                        // Set the widget properties
                        if(typeof assetItem.meta.widget === "object") asset.widget = assetItem.meta.widget;
    
                        // Set the asset's syntax
                        if(typeof assetItem.meta.syntax === "object") {
                            var syntax = {};
                            if(typeof assetItem.meta.syntax.name    === "string") syntax.name    = assetItem.meta.syntax.name;
                            if(typeof assetItem.meta.syntax.version === "string") syntax.version = assetItem.meta.syntax.version;
                            asset.syntax = syntax;
                        }
    
                        try {
                            asset.setContents(contents);
                            asset.getContents(function (err, assetContents) {
                                if(err) {
                                    soda.console.error("Unable to load asset `" + asset.name + "`:", err.message);
                                    return done.call(collection, null, collection);
                                }
    
                                if(assetItem.meta.suite && assetItem.meta.module && assetItem.meta.type && assetItem.meta.oid &&
                                    typeof assetContents      === "object" &&
                                    typeof assetContents.meta === "object"
                                ) {
                                    if(typeof assetContents.meta.name === "string")
                                        asset.setHumanName(assetContents.meta.name);
    
                                    if(typeof assetContents.meta.description === "string")
                                        asset.setDescription(assetContents.meta.description);
    
                                    if(typeof assetContents.meta.oid === "string")
                                        asset.setId(assetContents.meta.oid);
    
                                    if(assetContents.meta.widget === true || typeof assetContents.meta.widget === "object") {
                                        asset.widget = assetContents.meta.widget;
                                    }
                                    else {
                                        asset.widget = false;
                                    }
    
                                    if(typeof assetContents.meta.syntax === "object" && (typeof assetContents.meta.syntax.name === "string" && typeof assetContents.meta.syntax.version === "string")) {
                                        asset.setSyntax(assetContents.meta.syntax);
                                    }
                                }
                            });
                        }
                        catch(e) {
                            soda.console.error("Unable to parse `" + contents + "`, because: " + e.message);
                        }
    
                        if (assetIndex === assetArray.length-1) {
                            assetResolve();
                        }
                    });
                }
                else {
                    if(done instanceof Function) {
                        done.call(self, null, self);
                    }
                }
            });
        }

        awsConnect(connector).then(async (results) => {
            // Get suites
            connector.get({ table: "suite", userid: soda.config.get('sodauser') }, {}, function(err, suites) {
                processSuites(suites).then( () =>{
                    // Now all suites loaded, load modules...
                    connector.get({ table: "module", userid: soda.config.get('sodauser') }, {}, function(err, modules) {
                        processModules(modules).then( () => {
                            // Now all modules and suite loaded, load assets
                            // For each module, get its assets
                            connector.get({ userid: soda.config.get('sodauser') }, {}, function(err, assets) {
                                processAssets(assets).then( () => {

                                    if(done instanceof Function) {
                                        done.call(self, null, self);
                                    }
                                });
                            });
                        });
                    });
                });
            });
        }).catch(async (err) =>{
            soda.console.error(err);

            if(done instanceof Function) done.call(self, err, self);
        });
    };

    /**
     * Saves the trace of a test to the Lambda.
     * @param  {Trace} trace A Trace instance
     * @param  {string} dest A path to the location
     * @return {Lambda} The current Lambda instance
     */
    this.saveTrace = function (trace, dest, done) {
        soda.console.debug("Saving Trace to Lambda...");
        soda.useLambda(soda.config.get("testPath")).emit("save trace", trace, dest);
        if(done instanceof Function) done.call(self, null);
    };

    /**
     * Saves the result of a test to the Lambda.
     * @param  {Trace} res A result object
     * @return {Lambda} The current Lambda instance
     */
    this.saveResults = function (res, done) {
        soda.console.debug("Saving Results to Lambda...");
        soda.useLambda(soda.config.get("testPath")).emit("save results", res);
        if(done instanceof Function) done.call(self, null);
    };

    /**
     * Unloads the assets for this collection
     * @return {Lambda} The current Lambda instance
     */
    this.unload = function (done) {
        soda.useLambda(soda.config.get("testPath")).emit("unload", done);
        self.suites = null;
        return self;
    };

    /**
     * Creates a new suite
     * @param {String} suite The name of the suite to make
     * @param {Function} done A callback for completion
     */
    this.makeSuite = function (suite, done) {
        if(typeof suite === "string") {
            var suitejson = {
                sid          : suite,
                name        : suite,
                created     : Date.now(),
                desc : "@todo:desc",
                map: "{}"
            };

            awsConnect(connector).then(async (results) => {
                // Put suite
                connector.put({ meta: { table: "suite", userid: soda.config.get('sodauser') } }, { data: suitejson }, function(err, suites) {
                    self.load(done);
                });
            });
        }
        else {
            if(done instanceof Function) done.call(self, new Error("Invalid arguments passed to Lambda.makeSuite"));
        }
    };

    /**
     * Deletes an existing suite
     * @param {String} suite The name of the suite to delete
     * @param {Function} done A callback for completion
     */
    this.deleteSuite = function (suite, done) {
        if(typeof suite === "string") {
            var suitejson = {
                sid          : suite,
                name        : suite
            };

            awsConnect(connector).then(async (results) => {
                // delete suite
                connector.get({ table: "suite", userid: soda.config.get('sodauser') }, suitejson, function(err, suites) {
                    var s = suites[0]
    
                    connector.del({ meta: { table: "suite", userid: soda.config.get('sodauser') } }, { data: { id: s.id.toString() } }, function(err, suites) {
                        self.load(done);
                    });
                });
            });
        }
        else {
            if(done instanceof Function) done.call(self, new Error("Invalid arguments passed to Lambda.deleteSuite"));
        }
    };

    /**
     * Creates a new module
     * @param {String} suite The name of the suite to which this module will belong
     * @param {String} module The name of the new module
     * @param {Function} done A callback for completion
     */
    this.makeModule = function (suite, module, done) {
        if(typeof suite === "string" && typeof module === "string") {
            var modulejson = {
                mid          : module,
                name        : module,
                suite       : suite,
                created     : Date.now(),
                desc : "@todo:desc",
                map: "{}"
            };

            awsConnect(connector).then(async (results) => {
                // Put suite
                connector.put({ meta: { table: "module", userid: soda.config.get('sodauser') } }, { data: modulejson }, function(err, modules) {
                    self.load(done);
                });
            });
        }
        else {
            if(done instanceof Function) done.call(self, new Error("Invalid arguments passed to Lambda.makeModule"));
        }
    };

    /**
     * Delete an existing module
     * @param {String} suite The name of the suite from which this module will be deleted
     * @param {String} module The name of the module to delete
     * @param {Function} done A callback for completion
     */
    this.deleteModule = function (suite, module, done) {
      if(typeof suite === "string" && typeof module === "string") {
        var modulejson = {
            suite        : suite,
            moduleid     : module
        };

        awsConnect(connector).then(async (results) => {
            // delete suite
            connector.get({ table: "module", userid: soda.config.get('sodauser') }, modulejson, function(err, modules) {
                var m = modules[0]

                connector.del({ meta: { table: "module", userid: soda.config.get('sodauser') } }, { data: { id: m.id.toString() } }, function(err, modules) {
                    self.load(done);
                });
            });
        });
      }
      else {
          if(done instanceof Function) done.call(self, new Error("Invalid arguments passed to Lambda.deleteModule"));
      }
    };

    /**
     * Writes an asset to the database
     * @param {Object} asset The asset with the keys, suite, module, name, platform, and contents
     * @param {Function} done A callback for completion
     */
    this.makeAsset = function (asset, done) {
        if(typeof asset          === "object" &&
           typeof asset.suite    === "string" &&
           typeof asset.module   === "string" &&
           typeof asset.name     === "string" &&
           typeof asset.platform === "string" &&
           typeof asset.type     === "string" &&
           (typeof asset.contents === "object" || typeof asset.contents === "string" || 
           typeof asset.getContents() === "object" || typeof asset.getContents() === "string")
        ) {
            var assetContents = {};
            var description = "@todo:description";
            var metaid = "";
            var syntaxname = soda.config.get('syntax').name;
            var syntaxversion = soda.config.get('syntax').version;
            var tempContents = JSON.parse(asset.contents);

            if (asset.type.toLowerCase() === "test" || asset.type.toLowerCase() === "action") {
                assetContents = JSON.stringify(tempContents.actions);
                syntaxname = tempContents.meta.syntax.name;
                syntaxversion = tempContents.meta.syntax.version;
                description = tempContents.meta.description;
                metaid = tempContents.meta.id;
            }
            else if (asset.type.toLowerCase() === "screen") {
                assetContents = JSON.stringify(tempContents.screen);
            }
            else if (asset.type.toLowerCase() === "menu") {
                assetContents = JSON.stringify(tempContents.menu);
            }
            else if (asset.type.toLowerCase() === "popup") {
                assetContents = JSON.stringify(tempContents.popup);
            }

            if (assetContents) {
                assetContents = assetContents.replace(/"execute/g, "\"perform");
                assetContents = assetContents.replace(/true/g, "\"TRUE\"");
                assetContents = assetContents.replace(/false/g, "\"FALSE\"");
                assetContents = assetContents.replace(/"getConfig"/g, "\"getConf\"");
                assetContents = assetContents.replace(/"store"/g, "\"saveOff\"");
                assetContents = assetContents.replace(/"deleteAllCookies"/g, '"delAllCookies"');
                assetContents = assetContents.replace(/"delete"/g, '"del"');
                assetContents = assetContents.replace(/\.description/g, ".desc");
                assetContents = assetContents.replace(/DESCRIPTION/g, "DESC");
            }

            if (metaid === "@todo:id" || metaid === "") {
                metaid = asset.name
            }
            if (description === "@todo:description") {
                description = "@todo:desc"
            }
            if (description) {
                description = description.replace(/execute/g, "perform");
                description = description.replace(/true/g, "TRUE");
                description = description.replace(/false/g, "FALSE");
                description = description.replace(/getConfig/g, "getConf");
                description = description.replace(/store/g, "saveOff")
                description = description.replace(/deleteAllCookies/g, 'delAllCookies');
                description = description.replace(/ delete /g, ' del ');
                description = description.replace(/description/g, "desc");
            }

            var newAsset = {
                    suite: asset.suite,
                    module: asset.module,
                    platform: asset.platform.toLowerCase(),
                    type: asset.type,
                    name: asset.name,
                    oid: metaid,
                    desc: description,
                    widget: asset.widget ? asset.widget : "{}",
                    syntaxname: syntaxname,
                    syntaxversion: syntaxversion,
                    parts: assetContents
            };

            awsConnect(connector).then(async (results) => {
                // Put suite
                connector.put({ meta: { table: asset.type.toLowerCase(), userid: soda.config.get('sodauser') } }, { data: newAsset }, function(err, suites) {
                    self.load(done);
                });
            });
        }
        else {
            if(done instanceof Function) done.call(self, new Error("Invalid arguments passed to Lambda.makeAsset"));
        }
        return self;
    };

    /**
     * Delete an asset
     * @param {Object} asset The asset with the keys, suite, module, name, platform, and contents
     * @param {Function} done A callback for completion
     */
    this.deleteAsset = function (asset, done) {
        if(typeof asset          === "object" &&
            typeof asset.suite    === "string" &&
            typeof asset.module   === "string" &&
            typeof asset.name     === "string" &&
            typeof asset.platform === "string" &&
            typeof asset.type     === "string"
        ) {
            connector.get({ table: asset.type, userid: soda.config.get('sodauser') }, { suite: asset.suite, module: asset.module, oid: asset.id, name: asset.name, type: asset.type }, function(err, tests) {
                var test = tests[0]

                connector.del({ meta: { table: asset.type.toLowerCase(), userid: soda.config.get('sodauser') } }, { data: { id: test.meta.id.toString() } }, function(err, suites) {
                    self.load(done);
                });
            });
          }
          else {
              if(done instanceof Function) done.call(self, new Error("Invalid arguments passed to Lambda.deleteAsset"));
          }
    };

    /**
     * Makes a new user
     * @param {String} suite The name of the suite to which this module will belong
     * @param {String} module The name of the new module
     * @param {Function} done A callback for completion
     */
    this.makeUser = function (user, done) {
        if(typeof user === "object") {
            awsConnect(connector).then(async (results) => {
                // Put user
                connector.put({ meta: { table: "user" } }, { data: user }, function(err, user) {
                    done.call(self, user);
                });
            });
        }
        else {
            if(done instanceof Function) done.call(self, new Error("Invalid arguments passed to Lambda.makeUser"));
        }
    };

    /**
     * Gets a user
     * @param {username} asset The username
     * @param {password} asset The password
     * @param {Function} done A callback for completion
     */
    this.getUser = function (user, done) {
        if(typeof user === "object") {
            awsConnect(connector).then(async (results) => {
                // Get user
                connector.get({ table: "user" }, user, function(err, users) {
                    var user = users[0]
    
                    done.call(self, err, user);
                });
            });
          }
          else {
              if(done instanceof Function) done.call(self, new Error("Invalid arguments passed to Lambda.getUser"));
          }
    };

    /**
     * Delete a user
     * @param {String} username The username to delete
     * @param {Function} done A callback for completion
     */
    this.deleteUser = function (username, done) {
        if(typeof username    === "string"
        ) {
            awsConnect(connector).then(async (results) => {
                connector.get({ table: "user" }, { email: username }, function(err, users) {
                    var user = users[0]

                    connector.del({ meta: { table: "user" } }, { data: { id: user.meta.id.toString() } }, function(err, suites) {
                        done.call(self, true);
                    });
                });
            });
          }
          else {
              if(done instanceof Function) done.call(self, new Error("Invalid arguments passed to Lambda.deleteAsset"));
          }
    };

    this.reload = this.load;
};

module.exports = Lambda;
