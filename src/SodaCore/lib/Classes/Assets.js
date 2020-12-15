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
 * @module SodaCore/Assets
 */

var fs              = require('fs'),
    util            = require("util"),
    EventEmitter    = require("events").EventEmitter,
    nodePath        = require("path"),
    AssetCollection = require(nodePath.join(__dirname, "AssetCollection")),
    Assets;

/**
 * Loads and maintains assets CRUD operations for assets.
 * @constructor
 * @augments EventEmitter
 */
Assets = function (soda)  {
    var self        = this,
        Collections = {};

    /**
     * The currently loaded set of assets
     * @type {AssetCollection}
     */
    this.current = null;

    /**
     * Load the set of assets for the given path
     * @param {string|function} path The path to load assets from
     * @param {function=} done A callback for completion
     * @returns {object<Assets>}
     * @composes AssetCollection
     */
    this.load = function (path, done) {
        var err = arguments.sodaexpect("string|function|undefined|null", "function|undefined|null").error;

        if(path instanceof Function && !done) {
            done = path;
            path = undefined;
        }

        if(err) {
            if(done instanceof Function) done.call(self, err, null);
        }
        else if(Collections[path]) {
            self.current = Collections[path];
            if(done instanceof Function) done.call(self, null, Collections[path]);
        }
        else if(!path && self.current) {
            if(done instanceof Function) done.call(self, null, self.current);
        }
        else if(path && soda.isDBPath(path)) {
            if(typeof path === "string") {
                soda.config.set("testPath", path);
                Collections[path] = self.current = new AssetCollection(soda, path);
                Collections[path].load(done);
            }
            else {
                done.call(self, new Error('Invalid path!'), null);
            }
        }
        else if(path && soda.isLambdaPath(path)) {
            if(typeof path === "string") {
                soda.config.set("testPath", path);
                Collections[path] = self.current = new AssetCollection(soda, path);
                Collections[path].load(done);
            }
            else {
                done.call(self, new Error('Invalid path!'), null);
            }
        }
        else if(path) {
            fs.exists(path, function (exists) {
                if(exists) {
                    try {
                        if(typeof path === "string") {
                            soda.config.set("testPath", path);
                            Collections[path] = self.current = new AssetCollection(soda, path);
                            Collections[path].load(done);
                        }
                        else {
                            done.call(self, new Error('Invalid path!'), null);
                        }
                    }
                    catch (e) {
                        done.call(self, e, null);
                    }
                }
                else if(done instanceof Function) {
                    done.call(self, soda.exception.IOError("Unable to load assets for path `" + path + "`. The path does not exist."), null);
                }
            });
        }
        else {
            if(done instanceof Function) {
                done.call(self, soda.exception.IOError("Unable to load assets for path `" + path + "`. The path does not exist."), null);
            }
        }
        return self;
    };

    /**
     * Alias for Assets.load
     * @type {function}
     */
    this.get = this.load;

    /**
     * Reloads the current assets
     * @returns {object<Assets>}
     */
    this.reload = function () {
        if(self.current) self.current.reload();
        return self;
    };

    /**
     * Gets the current collection
     * @returns {object<AssetCollection>}
     */
    this.collections = function () {
        return Collections;
    };

    /**
     * Delete the set of assets for the given path, if they exist
     * @param {string} path The path key respective to the assets object
     * @param {function=} done A callback for completion
     * @memberof module.SodaCore/Assets.Assets
     * @returns {object<Assets>}
     */
    this["delete"] = function (path, done) {
        var err = arguments.sodaexpect("string").error;

        if(err) {
            if(done instanceof Function) done.call(self, err);
            return;
        }
        if(Collections[path]) {
            Collections[path].unload();
            Collections[path] = null;
            delete Collections[path];
        }
        return self;
    };

    /**
     * Destroys all assets
     * @returns {object<Assets>}
     */
    this.destroy = function () {
        Collections.sodaeach(function (a, k) {
            Collections[k].unload();
            Collections[k] = null;
            delete Collections[k];
        });

        soda.console.debug("*** Assets destroyed ***");
        return self;
    };
};

util.inherits(Assets, EventEmitter);
module.exports = Assets;
