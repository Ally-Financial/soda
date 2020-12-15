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
 * @module Soda/AssetDrivers/FileSystem
 */

var fs    = require("fs"),
    nodePath        = require('path'),
    nodeWatch       = require('node-watch'),
    assetTypes      = require(nodePath.join(__dirname, "..", "..", "lib", "Classes", "AssetTypes")),
    BaseDriver      = require(nodePath.join(__dirname, "..", "BaseDriver")),
    fsPromises = fs.promises,
    EventEmitter    = require('events').EventEmitter,
    util            = require("util"),
    os              = require("os"),

    walkQueue      = [],
    ignoredModules = [],

    Test    = assetTypes.Test,
    Menu    = assetTypes.Menu,
    Screen  = assetTypes.Screen,
    Action  = assetTypes.Action,
    Popup   = assetTypes.Popup;

/**
 * Recurses the project directory and writes the Asset files (Assets.json, AssetContents.json, & Tests.json)
 * This is one big, bad, nasty, async, recursive mama-jama!
 * Be careful, and make sure you know what you're doing if you plan to edit!
 *
 * It scans the CWD and generates the assets files (Assets.json, AssetContents.json, & Tests.json)
 * @function
 * @memberof module.Soda/AssetDrivers/FileSystem
 * @param {string} collection The asset collection to walk recursively
 * @param {function} done Callback to call when directory contents is loaded.
 * @param {object=} assets An object to store assets by context (suite, module, path, etc.)
 * @param {object=} context The current context for each file. An object that contains the file's suite, module, etc.
 * @param {object=} assetsContents The assets contents object, if config.general.preload_assets === true
 * @param {object=} testsBySuiteAndModule The suites/modules test resolution object
 * @param {number=} depth The depth of the walk (how many folders deep we are)
 * @private
 */
function walk (soda, collection, done, directory, context, depth) {
    directory  = directory || collection.path;
    context    = context   || { type: null, suite: null, module: null };
    depth      = typeof depth === "number" ? ++depth : 0;

    if(soda.config.get("ignoreTestDirectories").indexOf(nodePath.basename(directory)) === -1) {
        fs.readdir(directory, function (err, list) {
            if(err) { throw err; }

            var pending  = list.length,                  // How many files left to inspect?
                basename = nodePath.basename(directory); // The "name" of the directory...

            if(pending === 0) { return done.call(collection, null, collection); }
            var suite, module;

            switch (true) { // Set some context based on the directory name

                case basename === "tests":
                    context.type = "test";
                    break;

                case basename === "actions":
                    context.type = "action";
                    break;

                case basename === "screens":
                    context.type = "screen";
                    break;

                case basename === "menus":
                    context.type = "menu";
                    break;

                case basename === "popups":
                    context.type = "popup";
                    break;

                case basename === "global":
                    context.type   = "suite";
                    context.suite  = "global";
                    context.module = "global";

                    suite = collection.getSuite("global");
                    if(suite) {
                        if(!suite.getModule("global")) suite.addModule("global");
                    }
                    else {
                        collection.addSuite("global").addModule("global");
                    } // jshint ignore:line

                // Intentional Fallthrough
                case list.indexOf("suite.json") > -1:
                    context.type  = "suite";
                    context.suite = basename;

                    fs.readFile(nodePath.join(directory, "suite.json"), function (err, contents) {
                        if(!err) {
                            var suiteInfo = {};

                            try {
                                suiteInfo = JSON.parse(contents.toString('utf-8'));
                            }
                            catch (e) { /* No Op */ }

                            if(typeof suiteInfo.map === "object") {
                                soda.console.debug("Setting mapping for suite `" + context.suite + "`");
                                var s = collection.getSuite(context.suite);
                                if(s) s.mapping = suiteInfo.map;
                            }

                            var changed = false;
                            if(!suiteInfo.name) {
                                suiteInfo.name = nodePath.basename(directory).ucFirst;
                                changed = true;
                            }

                            if(!suiteInfo.id) {
                                suiteInfo.id = directory.hash('md5');
                                changed = true;
                            }

                            if(!suiteInfo.description || suiteInfo.description === "@todo:description") {
                                soda.console.warn("Suite `" + suiteInfo.name + "` is missing a description.");
                            }

                            if(!suiteInfo.description) {
                                suiteInfo.description = "@todo:description";
                                changed = true;
                            }

                            if(!suiteInfo.created || typeof suiteInfo.created !== "number") {
                                suiteInfo.created  = Date.now();
                                changed = true;
                            }

                            if(changed) {
                                try {
                                    fs.writeFile(nodePath.join(directory, "suite.json"), JSON.stringify(suiteInfo, null, '    '), function () {
                                        /* No Op */
                                    });
                                }
                                catch (e) { /* No Op */ }
                            }
                        }
                    });

                    suite = collection.getSuite(context.suite);
                    if(suite) {
                        if(!suite.getModule(basename)) suite.addModule(basename);
                    }
                    else {
                        collection.addSuite(context.suite).addModule(context.module);
                    }
                    break;

                case basename === "common":
                    context.type   = "module";
                    context.module = "common";

                    suite = collection.getSuite(context.suite);
                    if(suite) {
                        module = suite.getModule("common");
                        if(!module) suite.addModule("common");
                    }
                    else {
                        collection.addSuite(context.suite).addModule("common");
                    }

                    collection
                        .getSuite(context.suite)
                        .addModule("common"); // jshint ignore:line

                // Intentional Fallthrough
                case list.indexOf("module.json") > -1:
                    context.type   = "module";
                    context.module = basename;

                    fs.readFile(nodePath.join(directory, "module.json"), function (err, contents) {
                        if(!err) {
                            var moduleInfo = {};

                            try {
                                moduleInfo = JSON.parse(contents.toString('utf-8'));
                            }
                            catch (e) { /* No Op */ }

                            if(typeof moduleInfo.map === "object") {
                                soda.console.debug("Setting mapping for module `" + context.module + "`");
                                var s = collection.getSuite(context.suite);
                                if(s) {
                                    var m = s.getModule(context.module);
                                    if(m) m.mapping = moduleInfo.map;
                                }
                            }

                            var changed = false;
                            if(!moduleInfo.name || moduleInfo.name !== nodePath.basename(directory)) {
                                moduleInfo.name = nodePath.basename(directory);
                                changed = true;
                            }

                            if(moduleInfo.ignore instanceof Array && moduleInfo.ignore.indexOf(soda.config.get("platform")) > -1) {
                                soda.console.warn("Ignoring module `" + context.module + "` in suite `" + context.suite + "`");
                                ignoredModules.push({ collection: collection, suite: context.suite, module: moduleInfo.name });
                            }

                            if(!moduleInfo.id) {
                                moduleInfo.id = directory.hash('md5');
                                changed = true;
                            }

                            if(!moduleInfo.created || typeof moduleInfo.created !== "number") {
                                moduleInfo.created  = Date.now();
                                changed = true;
                            }

                            if(!moduleInfo.description || moduleInfo.description === "@todo:description") {
                                soda.console.warn("Module `" + context.module + "` is missing a description.");
                            }

                            if(!moduleInfo.description) {
                                moduleInfo.description = "@todo:description";
                                changed = true;
                            }

                            if(changed) {
                                try {
                                    fs.writeFile(nodePath.join(directory, "module.json"), JSON.stringify(moduleInfo, null, '    '), function () { /* No Op */ });
                                }
                                catch (e) { /* No Op */ }
                            }
                        }
                    });

                    suite = collection.getSuite(context.suite);
                    if(suite) {
                        module = suite.getModule(basename);
                        if(!module) suite.addModule(basename);
                    }
                    else {
                        collection.addSuite(context.suite).addModule(context.module);
                    }
                    break;
                default:
                    break;
            }

            // Warn user about exceedin max file scan depth... their project structure is likely wrong
            if(depth > soda.config.get("maxFileScanDepth")) {
                soda.console.warn("*** Warning: Max scan depth exceeded, directory `" + nodePath.resolve(directory) + "` ignored!");
                return done.call(collection, null, collection);
            }

            // Warn about suites missing suite.json files
            if(context.type === null && list.indexOf("suite.json") === -1 && depth === 1) {
                soda.console.warn("*** Warning: Suite `" + nodePath.resolve(directory) + "` is missing its `suite.json` file and will be ignored!");
                return done.call(collection, null, collection);
            }

            // Warn about modules missing module.json files
            if(context.type === "suite" && list.indexOf("module.json") === -1 && context.suite !== "global" && depth === 3) {
                soda.console.warn("*** Warning: Module `" + nodePath.resolve(directory) + "` is missing its `module.json` file and will be ignored!");
            }

            list.forEach(function (file) {
                file = nodePath.resolve(directory, file);

                fs.stat(file, function (err, stat) {
                    if(err) { throw err; }
                    basename = nodePath.basename(file, ".json");

                    var extname = nodePath.extname(file),
                        isFile  = stat.isFile();

                    if(isFile === false && /^\./.test(basename) === false) { // Got a directory, but ignore system directories
                        walk(                                                // Recursively keep walking down the directory tree
                            soda,
                            collection,
                            function () { 
                                    if(--pending === 0 && done instanceof Function) {
                                        done.call(collection, null, collection); 
                                    }
                                },
                            file,
                            context.sodaclone(),
                            depth
                        );
                    }
                    else if(extname === ".json" && /^\./.test(basename) === false) { // Got a JSON file that's not hidden
                        context      = context.sodaclone();
                        context.id   = basename;
                        context.path = file;

                        if(context.suite && context.module && context.type && context.id && context.path) { // Check for required fields

                            // If we got a test asset, add it to its respective suite/module/asset directory
                            if(context.type === "test" || context.type === "action" || context.type === "screen" || context.type === "menu" || context.type === "popup") {
                                var asset,
                                    s        = collection.getSuite(context.suite),
                                    m        = s ? s.getModule(context.module) : null,
                                    platform = "generic",
                                    idx      = basename.lastIndexOf(".");

                                if(idx > -1) {
                                    platform = basename.substring(idx + 1, basename.length);
                                    basename = basename.substring(0, idx);
                                }

                                if(m) {
                                    var p    = m.getPlatform(platform);
                                    if(!p) p = m.addPlatform(platform);

                                    switch(context.type) {
                                        case "screen":
                                            asset = p.getScreen(basename);
                                            if(!asset) {
                                                asset = collection.assets[file] = new Screen(soda, s, m, p, basename, file);
                                                p.addScreen(asset);
                                            }
                                            break;

                                        case "popup":
                                            asset = p.getPopup(basename);
                                            if(!asset) {
                                                asset = collection.assets[file] = new Popup(soda, s, m, p, basename, file);
                                                p.addPopup(asset);
                                            }
                                            break;

                                        case "menu":
                                            asset = p.getMenu(basename);
                                            if(!asset) {
                                                asset = collection.assets[file] = new Menu(soda, s, m, p, basename, file);
                                                p.addMenu(asset);
                                            }
                                            break;

                                        case "test":
                                            asset = p.getTest(basename);
                                            if(!asset) {
                                                asset = collection.assets[file] = new Test(soda, s, m, p, basename, file);
                                                p.addTest(asset);
                                            }
                                            break;

                                        case "action":
                                            asset = p.getAction(basename);
                                            if(!asset) {
                                                asset = collection.assets[file] = new Action(soda, s, m, p, basename, file);
                                                p.addAction(asset);
                                            }
                                            break;
                                        
                                        default:
                                            break;
                                    }

                                    // Read the asset contents, and fillout the asset's meta information within
                                    // the actual asset object's properties
                                    fs.readFile(file, function (err, contents) {
                                        if(err) { throw err; }

                                        var context = this.context,
                                            asset   = this.asset;

                                        try {
                                            asset.setContents(JSON.parse(contents.toString('utf-8')));
                                            asset.getContents(function (err, assetContents) {
                                                if(err) {
                                                    soda.console.error("Unable to load asset `" + asset.name + "`:", err.message);
                                                    return done.call(collection, null, collection);
                                                }

                                                if(context.suite && context.module && context.type && context.id && context.path &&
                                                    typeof assetContents      === "object" &&
                                                    typeof assetContents.meta === "object"
                                                ) {
                                                    if(typeof assetContents.meta.name === "string")
                                                        asset.setHumanName(assetContents.meta.name);

                                                    if(typeof assetContents.meta.description === "string")
                                                        asset.setDescription(assetContents.meta.description);

                                                    if(typeof assetContents.meta.id === "string")
                                                        asset.setId(assetContents.meta.id);

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
                                            soda.console.error("Unable to parse `" + file + "`, because: " + e.message);
                                        }
                                        if(--pending === 0) { return done.call(collection, null, collection); }

                                    }.bind({ context: context, asset: asset }));
                                }
                                else {
                                    if(--pending === 0) { return done.call(collection, null, collection); }
                                }
                            }
                            else {
                                if(--pending === 0) { return done.call(collection, null, collection); }
                            }
                        }
                        else {
                            if(--pending === 0) { return done.call(collection, null, collection); }
                        }
                    }
                    else {
                        if(--pending === 0) { return done.call(collection, null, collection); }
                    }
                });
            });
        });
    }
    else {
        return done.call(collection, null, collection);
    }
}

/**
 * Used by executeWalkQueue and walkWrapper as a semaphore to prevent concurrent directory walks
 * @type {Boolean}
 */
var walking = {};

/**
 * Pops an item off the walk queue and executes a project scan (walk)
 * @return {undefined}
 */
function executeWalkQueue () {
    if(walkQueue.length > 0) {
        var queueItem = walkQueue.shift();
        queueItem.soda.console.warn("Walking project directory at path `" + queueItem.collection.path + "`");

        walk(queueItem.soda, queueItem.collection, function () {
            var args = arguments;
            walking[queueItem.collection.path + queueItem.soda.yid] = null;
            delete walking[queueItem.collection.path + queueItem.soda.yid];

            ignoredModules.sodaeach(function (o) {
                var s = o.collection.getSuite(o.suite), m;
                if(s) {
                    m = s.getModule(o.module);
                    if(m) m.ignore = true;
                }
            });

            ignoredModules = [];
            if(queueItem.done instanceof Array) {
                queueItem.done.sodaeach(function (d) {
                    if(d instanceof Function) d.apply(queueItem.collection, args);
                });
            }
            else {
                if(queueItem.done instanceof Function) queueItem.done.apply(queueItem.collection, args);
            }
            if(walkQueue.length > 0) executeWalkQueue();
        });
    }
}

/**
 * A wrapper for walk, so that multiple, simultaneous file changes won't result in EMFILE (file table overload)
 * @param  {Soda} soda The Soda instance associated with the asset collection
 * @param  {Collection} self The asset collection to walk
 * @param  {Function} done A callback for completion
 * @return {undefined}
 */
function walkWrapper (soda, self, done) {
    // Check to see if currently walking this path...
    if(!walking[self.path + soda.yid]) {
        var walkObj = { soda: soda, collection: self, done: [done] };

        walking[self.path + soda.yid] = walkObj;
        walkQueue.push(walkObj);
        executeWalkQueue();
    }
    // Not currently walking, attach completion to done queue
    else {
        walking[self.path + soda.yid].done.push(done);
    }
}

/**
 * Add new values to the asset on change
 * @param {*} n The new asset contents
 * @param {*} o The in memory (old) asset contents
 */
function addNewValues (n, o) {
    for(var i in n) {
        if(n.hasOwnProperty(i)) {
            if(typeof n[i] === "object" && typeof o[i] === "object") {
                if(o[i]) {
                    addNewValues(n[i], o[i]);
                }
                else {
                    o[i] = n[i];
                    if(!o[i] && (o[i] !== 0 && o[i] !== "")) delete o[i];
                }
            }
            else {
                o[i] = n[i];
                if(!o[i] && (o[i] !== 0 && o[i] !== "")) delete o[i];
            }
        }
    }
}

/**
 * Remove deleted values from an asset on change
 * @param {*} n The new asset contents
 * @param {*} o The in memory (old) asset contents
 */
function removeOldValues (n, o) {
    for(var i in o) {
        if(o.hasOwnProperty(i)) {
            if(typeof o[i] === "object" && typeof n[i] === "object") {
                if(n[i]) { // Don't have to check for zero, since we've already establish that n[i] is an an object
                    removeOldValues(n[i], o[i]);
                }
                else {
                    o[i] = undefined;
                    delete o[i];
                }
            }
            else {
                o[i] = n[i];
                if(!o[i] && (o[i] !== 0 && o[i] !== "")) {
                    o[i] = undefined;
                    delete o[i];
                }
            }
        }
    }
}

/**
 * Replace action scalar (non-object) values with modified action values, null is okay!
 * @param  {object} n The new (edited) asset contents
 * @param  {object} o The old asset contents
 * @return {undefined}
 */
function replaceScalarValues (n, o) {
    removeOldValues(n, o);
    addNewValues(n, o);
}

/**
 * The file system driver for AssetCollection
 * @param  {Soda} soda A Soda instance
 * @param  {string} path The path to the project folder
 * @constructor
 * @extends BaseDriver
 */
var FileSystem = function (soda, collection, path) {
    var err = arguments.sodaexpect("object", "object", "string").error;
    if(err) throw err;

    var self = this;

    // Inherit from the BaseDriver
    BaseDriver.call(self, soda, collection, path);

    /**
     * The file watcher, which watches for changes in asset files and updates contents directly in memory.
     * If a file is added or deleted, the whole project will be rescanned. If a file is just edited, it's contents will
     * be updated. Allows users to dynamically update tests without having to call ":load" explicitly.
     * @type {fs.Watcher|Null}
     */
    this.watcher = soda.config.get('ignoreFileChanges') ? null : nodeWatch(
        self.path,
        {
            persistent : true,
            recursive  : true
        },
        function (type, file) {
            if (self.path && file) {
              var absolutePath = nodePath.join(self.path, file),
                  ignored      = soda.config.get("ignoreTestDirectories"),
                  ignore       = !ignored.sodaeach(function (dir) { if(file.indexOf(dir) === 0) return false; });

              if(
                  !ignore                                                && // Don't want to watch for ignored directories
                  /^\./.test(nodePath.basename(file, ".json")) === false    // Don't want system files
              ) {
                  fs.stat(absolutePath, function (err, stat) {
                      if(err && err.code !== "ENOENT") {
                          soda.console.error(err.message);
                          return;
                      }

                      var exists   = !(err && err.code === "ENOENT"),
                          oldAsset = /(module|suite)/.test(nodePath.basename(file, ".json")) ? true : !!self.assets[absolutePath];

                      if(!exists || ((stat && stat.isDirectory()) || nodePath.extname(file, ".json"))) {
                          var changeType = !exists ? "deleted" : (!oldAsset ? "created" : "modified");
                          console.log("Soda id: " + soda.yid + " with file changes (" + changeType + ") detected in `" + file + "`, updating assets...");

                          // The file was deleted, just reload assets
                          if(changeType !== "modified" || stat.isDirectory()) {
                              console.log("Soda id: " + soda.yid + " with file changes (" + changeType + ") detected in `" + file + "`, reloading asset collection...");
                              collection.reload();
                          }
                          // The file was updated, replace it's contents in memory
                          else {
                              fs.readFile(absolutePath, function (err, contents) {
                                  if(err) return;

                                  try {
                                      contents = JSON.parse(contents.toString('utf-8'));
                                  }
                                  catch(e) {
                                      return soda.console.error("Invalid JSON. Unable to update `" + file + "`.");
                                  }

                                  var s;

                                  // Got a suite.json file, update the mapping
                                  if(/suite/.test(nodePath.basename(file, ".json"))) {
                                      if(typeof contents === "object") {
                                          s = self.getSuite(nodePath.dirname(file));
                                          if(s) s.mapping = typeof contents.map === "object" ? contents.map : {};
                                      }
                                  }
                                  // Got a module.json file, update the mapping
                                  else if(/module/.test(nodePath.basename(file, ".json"))) {
                                      if(typeof contents === "object") {
                                          var pathArray = nodePath.dirname(absolutePath).split(nodePath.sep),
                                              suiteName = pathArray[pathArray.length - 1] === "common" ? pathArray[pathArray.length - 2] : pathArray[pathArray.length - 3];

                                          s = self.getSuite(suiteName);
                                          if(s) {
                                              var m = s.getModule(pathArray[pathArray.length - 1]);
                                              if(m) {
                                                  m.mapping = typeof contents.map === "object" ? contents.map : {};
                                                  if(contents.ignore instanceof Array && contents.ignore.indexOf(soda.config.get("platform")) > -1) {
                                                      m.ignore = true;
                                                  }
                                                  else {
                                                      m.ignore = false;
                                                  }
                                              }
                                          }
                                      }
                                  }
                                  // Got an asset, update the asset
                                  else {
                                      var asset = self.assets[absolutePath];
                                      asset.getContents(function (err, old) {
                                          if(err) {
                                              soda.console.error("Unable to update asset `" + asset.name + "`:", err.message);
                                          }
                                          // File already existed, just update the object in memory
                                          else if(old) {
                                              replaceScalarValues(contents, old);
                                          }
                                          // In a bad place, reload everything...
                                          else {
                                              console.log("Soda id: " + soda.yid + " with reloading asset collection because of a bad place...");
                                              collection.reload();
                                          }
                                      });
                                  }
                              });
                          }
                      }
                  });
              }
            }
            else {
              console.log("Soda id: " + soda.yid + " with unknown file changes, doing nothing...");
            }
        }
    );

    /**
     * Loads the assets for this driver. Walks the given directory, and collects the available assets
     * @param  {Function} done A callback for completion
     * @return {FileSystem} The current FileSystem instance
     */
    this.load = function (done) {
        self.assets = {};
        self.suites = {};
        walkWrapper(soda, self, function () {
            if(done instanceof Function) done.apply(self, arguments);
        });
        return self;
    };

    /**
     * Unloads the assets for this collection
     * @return {FileSystem} The current FileSystem instance
     */
    this.unload = function () {
        self.assets  = {};

        if(self.watcher) self.watcher.close();

        self.watcher = null;
        self.suites  = null;
        return self;
    };

    /**
     * Saves a trace file
     * @param  {Object} trace The trace object from Run.trace.get
     * @param  {String} dest The path to save the trace to
     * @param  {Function} done A callback for completion
     * @return {FileSystem} The current FileSystem instance
     */
    this.saveTrace = function (trace, res, done) {
      var ress = '';
      if (res && res.length > 0) res.reason.replace(/[^a-zA-Z0-9_]+/g, "_").substr(0, 120);

        var dest = (soda.config.get("resultsTrace") || "")
            .replace(/\[reason]/g, ress)
            .replace(/\[now]/g, Date.now())
            .replace(/\[platform]/g, soda.config.get("platform"))
            .replace(/\[test_path]/g, soda.config.get("testResultsPath").withoutTrailingSlash)
            .replace(/\[test_results_dir]/g, soda.config.get("testResultsDir"))
            .replace(/\[fid]/g, res.reason)
            .replace(/\[host]/g, os.hostname())
            .replace(/\[yyyymmdd]/g, (new Date()).yyyymmdd("-"));

        soda.console.debug("Saving trace to: `" + dest + "`");

        try {
            trace = JSON.stringify(trace, null, '    ');
        }
        catch (e) {
            if(done instanceof Function) done.call(self, e, null);
            return;
        }

        fsPromises.mkdir(nodePath.dirname(dest), { recursive: true}).then(made => {
          fs.writeFile(dest, trace, function (err) {
              if(err) soda.console.error("Unable to write trace file:", err.message);
              if(done instanceof Function) done.call(self, err, err ? null : dest);
          });
        });

        return self;
    };

    /**
     * Save test results
     * @param  {Object} res The test results object from TestRunner.endTest
     * @param  {Function} done A callback for completion
     * @return {FileSystem} The current FileSystem instance
     */
    this.saveResults = function (res, done) {
        var path = soda.config.get("resultsJSON")
            .replace(/\[type]/g, res.type.toLowerCase())
            .replace(/\[now]/g, Date.now())
            .replace(/\[platform]/g, soda.config.get("platform"))
            .replace(/\[test_path]/g, soda.config.get("testResultsPath").withoutTrailingSlash)
            .replace(/\[test_results_dir]/g, soda.config.get("testResultsDir"))
            .replace(/\[yyyymmdd]/g, (new Date()).yyyymmdd("-"))
            .replace(/\[host]/g, os.hostname());

        var resultsJSON;
        fs.readFile(path, function (err, fc) {
            try {
                resultsJSON = err ? [] : JSON.parse(fc.toString('utf-8'));
            }
            catch(e) {
                resultsJSON = [];
            }

            resultsJSON.push(res);
            fs.writeFile(path, resultsJSON.stringified(null, '    '), function (err) {
                if(err) {
                    soda.console.error("Unable to write " + res.type.toLowerCase() + " results, because: " + err.message);
                    if(done instanceof Function) done.call(self, err);
                    return self;
                }

                if(done instanceof Function) done.call(self, null);
                soda.console.debug("Test results appended to: " + path);
            });
        });
    };

    /**
     * An alias for FileSystem.load
     * @type {Function}
     */
    this.reload = self.load;

    /**
     * Converts an asset resolution object to its repsective file system path
     * @param {Object} a The asset to get the path for
     */
    function assetToPath (a) {
        var isGlobal = a.suite === "global",
            isCommon = a.module === "common",
            type = a.type.replace(/s$/, '') + "s",
            join;

        switch(true) {
            case isGlobal:
                join = [soda.config.get("testPath"), "global", type, a.name + (a.platform === "generic" ? "" : "." + a.platform) + ".json"];
                break;

            case isCommon:
                join = [soda.config.get("testPath"), a.suite, "common", type, a.name + (a.platform === "generic" ? "" : "." + a.platform) + ".json"];
                break;

            default:
                join = [soda.config.get("testPath"), a.suite, "modules", a.module, type, a.name + (a.platform === "generic" ? "" : "." + a.platform) + ".json"];
        }
        return nodePath.resolve(nodePath.join.apply(nodePath, join));
    }

    /**
     * Writes an asset to file
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
            var path = assetToPath(asset),
                dir  = nodePath.dirname(path),
                data = typeof asset.getContents === "function" ? asset.getContents() : asset.contents;

            if(typeof asset.contents !== "string") {
                try {
                    data = JSON.stringify(data, null, '    ');
                }
                catch (e) {
                    if(done instanceof Function) done.call(self, e);
                    return self;
                }
            }

            fsPromises.mkdir(dir, { recursive: true}).then( made => {
                if(err) {
                    if(done instanceof Function) done.call(self, err);
                    return self;
                }

                fs.writeFile(path, data, function (err) {
                    if(done instanceof Function) done.call(self, err || null);
                });
            });
        }
        else {
            if(done instanceof Function) done.call(self, new Error("Invalid arguments passed to FileSystem.makeAsset on " + JSON.stringify(asset)));
        }
        return self;
    };

    /**
     * Creates a new suite
     * @param {String} suite The name of the suite to make
     * @param {Function} done A callback for completion
     */
    this.makeSuite = function (suite, done) {
        if(typeof suite === "string") {
            fsPromises.mkdir(nodePath.join(soda.config.get("testPath"), suite.withoutTrailingSlash), { recursive: true}).then( made => {
                if(err) {
                    if(done instanceof Function) done.call(self, err);
                    return self;
                }

                var suitejson = {
                    id          : suite,
                    name        : suite.ucFirst,
                    created     : Date.now(),
                    description : "@todo:description"
                };

                fs.writeFile(nodePath.join(soda.config.get("testPath"), suite.withoutTrailingSlash, "suite.json"), JSON.stringify(suitejson, null, '    '), function (err) {
                    if(err) {
                        if(done instanceof Function) done.call(self, err);
                        return self;
                    }

                    var made = 0;
                    var onMake = function () {
                        if(++made === 6 && done instanceof Function) done.call(self, null);
                    };

                    // Add Common folders
                    fs.mkdir(nodePath.join(soda.config.get("testPath"), suite, "modules"          ), { recursive: true }, onMake);
                    fs.mkdir(nodePath.join(soda.config.get("testPath"), suite, "common", "tests"  ), { recursive: true }, onMake);
                    fs.mkdir(nodePath.join(soda.config.get("testPath"), suite, "common", "actions"), { recursive: true }, onMake);
                    fs.mkdir(nodePath.join(soda.config.get("testPath"), suite, "common", "screens"), { recursive: true }, onMake);
                    fs.mkdir(nodePath.join(soda.config.get("testPath"), suite, "common", "menus"  ), { recursive: true }, onMake);
                    fs.mkdir(nodePath.join(soda.config.get("testPath"), suite, "common", "popups" ), { recursive: true }, onMake);
                });
            });
        }
        else {
            if(done instanceof Function) done.call(self, new Error("Invalid arguments passed to FileSystem.makeSuite"));
        }
    };

    /**
     * Deletes an existing suite
     * @param {String} suite The name of the suite to delete
     * @param {Function} done A callback for completion
     */
    this.deleteSuite = function (suite, done) {
        if(typeof suite === "string") {
          fs.rmdir(nodePath.join(soda.config.get("testPath"), suite.withoutTrailingSlash), { recursive: true }, function() {
            if(done instanceof Function) done.call(self, err);

            return self;
          });
        }
        else {
            if(done instanceof Function) done.call(self, new Error("Invalid arguments passed to FileSystem.deleteSuite"));
        }
    };

    /**
     * Creates a new module
     * @param {String} suite The name of the suite to which this module will belong
     * @param {String} module The name of the new module
     * @param {Function} done A callback for completion
     */
    this.makeModule = function (suite, module, done) {
        fsPromises.mkdir(nodePath.join(soda.config.get("testPath"), suite, "modules", module), { recursive: true }).then( made => {
            if(err) {
                if(done instanceof Function) done.call(self, err);
                return self;
            }

            var modulejson = {
                id          : module,
                name        : module.ucFirst,
                created     : Date.now(),
                description : "@todo:description"
            };

            fs.writeFile(nodePath.join(soda.config.get("testPath"), suite, "modules", module, "module.json"), JSON.stringify(modulejson, null, '    '), function (err) {
                if(err) {
                    if(done instanceof Function) done.call(self, err);
                    return self;
                }

                var made = 0;
                var onMake = function () {
                    if(++made === 5 && done instanceof Function) done.call(self, null);
                };

                // Add test folders
                fs.mkdir(nodePath.join(soda.config.get("testPath"), suite, "modules", module, "tests"  ), { recursive: true }, onMake);
                fs.mkdir(nodePath.join(soda.config.get("testPath"), suite, "modules", module, "actions"), { recursive: true }, onMake);
                fs.mkdir(nodePath.join(soda.config.get("testPath"), suite, "modules", module, "screens"), { recursive: true }, onMake);
                fs.mkdir(nodePath.join(soda.config.get("testPath"), suite, "modules", module, "menus"  ), { recursive: true }, onMake);
                fs.mkdir(nodePath.join(soda.config.get("testPath"), suite, "modules", module, "popups" ), { recursive: true }, onMake);
            });
        });
        return self;
    };

    /**
     * Delete an existing module
     * @param {String} suite The name of the suite from which this module will be deleted
     * @param {String} module The name of the module to delete
     * @param {Function} done A callback for completion
     */
    this.deleteModule = function (suite, module, done) {
      if(typeof suite === "string" && typeof module === "string") {
        fs.rmdir(nodePath.join(soda.config.get("testPath"), suite, "modules", module), { recursive: true }, (err) => {
            console.log(nodePath.join(soda.config.get("testPath"), suite, "modules", module));
            if(done instanceof Function) done.call(self, err);

            return self;
        });
      }
      else {
          if(done instanceof Function) done.call(self, new Error("Invalid arguments passed to FileSystem.deleteSuite"));
      }
    };

    /**
     * Delete an asset
     * @param {Object} asset The asset with the keys, suite, module, name, platform, and contents
     * @param {Function} done A callback for completion
     */
    this.deleteAsset = function (asset, done) {
        fs.unlink(assetToPath(asset), function (err) {
            if(done instanceof Function) done.call(self, err || null);
        });
        return self;
    };
};

util.inherits(FileSystem, EventEmitter);
module.exports = FileSystem;
