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
 * A framework object to be instantiated from the data from the socket server
 * @param {Soda} soda The window.Soda instance
 * @extends SodaEmitter
 * @constructor
 */
window.SodaFramework = function (soda) {

    var self = this,

        /**
         * @associates SodaSettings
         * @type {SodaSettings}
         */
        SodaSettings = window.SodaSettings;

    // Inherit from SodaEmitter
    window.SodaEmitter.call(self);

    if(!(soda instanceof window.SodaNamespace))
        throw new Error("SodaFramework expected argument `soda` to be an instance of Soda.");

    /**
     * The time the framework was started
     * @type {number}
     */
    this.started = null;

    /**
     * The name of the framework
     * @type {string}
     */
    this.name = null;

    /**
     * The name of the device the framework is running
     * @type {string}
     */
    this.device = null;

    /**
     * The framework version
     * @type {string}
     */
    this.version = null;

    /**
     * The framework specific platform the framework was started for
     * @type {string}
     */
    this.platform = null;

    /**
     * The framework specific workspace the framework was started for
     * @type {string}
     */
    this.workspace     = null;

    /**
     * The framework specific target the framework was started for
     * @type {string}
     */
    this.target        = null;

    /**
     * The framework specific bundleid the framework was started for
     * @type {string}
     */
    this.bundleid      = null;

    /**
     * The framework specific app the framework was started for
     * @type {string}
     */
    this.app           = null;

    /**
     * The framework specific buildpath the framework was started for
     * @type {string}
     */
    this.buildpath           = null;

    /**
     * The framework specific apppath the framework was started for
     * @type {string}
     */
    this.apppath           = null;

    /**
     * The original arguments that the framework was launched with
     * @type {Array}
     */
    this.launchArgs = null;

    /**
     * The current configuration settings
     * @type {object}
     */
    this.config = null;

    /**
     * The last tree that was retrieved by the framework
     * @type {object}
     */
    this.latestTree = null;

    /**
     * The file location of the last screenshot taken successfully by the framework
     * @type {string}
     */
    this.latestScreen = null;

    /**
     * The project test path
     * @type {string}
     */
    this.testPath = null;

    /**
     * The test result path
     * @type {string}
     */
    this.testResultsPath = null;

    /**
     * The project hierarchy
     * @type {object}
     */
    this.latestHierarchy = null;

    /**
     * The selected syntax
     * @type {object}
     */
    this.latestSyntax = null;

    /**
     * The framework's syntax version information
     * @type {object}
     */
    this.defaultSyntax = null;

    /**
     * Query the latest DOM tree
     * @param type The selector type, possible values are: "selector", "name", "label", and "id"
     * @param value The value to query the tree with
     * @param {Function} done A callback for completion
     * @return {object<SodaFramework>} The current SodaFramework instance
     */
    this.queryTree = function (type, value, done) {
        soda.send("query tree", { type: type, value: value }, function (err, matchedElementIds) {
            if(done instanceof Function) done.call(self, err, matchedElementIds);
            self.emit("tree queried", err, matchedElementIds);
        });
        return self;
    };

    /**
     * Get's the project hierarchy
     * @param {Function} done A callback for completion
     * @return {object<SodaFramework>} The current SodaFramework instance
     */
    this.getHierarchy = function (done) {
        soda.send("get project hierarchy", function (err, hierarchy) {
            if(err) console.error(err);
            self.latestHierarchy = hierarchy;
            if(done instanceof Function) done.call(self, err, hierarchy);
            self.emit("project hierarchy update", err, hierarchy);
        });
        return self;
    };

    /**
     * Get's the DOM tree from the backend via the socket server
     * @param {Function} done A callback for completion
     * @return {object<SodaFramework>} The current SodaFramework instance
     */
    this.getTree = function (done) {
        soda.send("get latest tree", function (err, treeObject) {
            if(err) console.error(err);
            self.latestTree = treeObject;

            if(done instanceof Function) done.call(self, err, treeObject);
            self.emit("tree update", err, treeObject);
        });
        return self;
    };

    /**
     * Get's the syntax events with "name" and "version"
     * @param {Function} done A callback for completion
     * @return {object<SodaFramework>} The current SodaFramework instance
     */
    this.getSyntax = function (name, version, done) {
        soda.send("get syntax", { name: name.toString(), version: version.toString() }, function (err, syntaxObject) {
            if(err) console.error(err);
            self.latestSyntax = syntaxObject;

            if(done instanceof Function) done.call(self, err, syntaxObject);
            self.emit("syntax update", err, syntaxObject);
        });
        return self;
    };

    /**
     * Get's a screenshot from the backend via the socket server
     * @param {Function} done A callback for completion
     * @return {object<SodaFramework>} The current SodaFramework instance
     */
    this.getScreenShot = function (done) {
        soda.send("get latest screen", function (err, imageObject) {
            if(err) console.error(err);
            self.latestScreen = imageObject;

            if(done instanceof Function) done.call(self, err, imageObject);
            self.emit("screen update", err, imageObject);
        });
        return self;
    };

    /**
     * Update a configuration variable
     * @param {Function} done A callback for completion
     * @return {object<SodaFramework>} The current SodaFramework instance
     */
    this.updateConfig = function (variable, value, done) {
        soda.send("update config", { name: variable, value: value }, function (err, update) {
            if(err) console.error(err);
            self.config = update;

            if(done instanceof Function) done.call(self, err, self.config);
        });
    };

    /**
     * Get the configuration settings
     * @param {Function} done A callback for completion
     * @return {object<SodaFramework>} The current SodaFramework instance
     */
    this.getConfig = function (done) {
        soda.send("get config", function (err, update) {
            if(err) console.error(err);
            self.config = update;

            if(done instanceof Function) done.call(self, err, self.config);
            self.emit("config update", null, self.config);
        });
    };

    /**
     * Initalizes the SodaFramework object, sets the frameworks properties and status, and gets the first screen shot, tree, and project hierarchy.
     * @param {object} data The framework status as received by the server
     * @return {object<SodaFramework>} The current SodaFramework instance
     */
    this.init = function (data) {

        if(typeof data !== "object")
            throw new Error("SodaFramework expected argument `data` to be an object.");

        self.started       = data.started;
        self.name          = data.name;
        self.device        = data.device;
        self.version       = data.version;
        self.platform      = data.platform;
        self.workspace     = data.workspace;
        self.target        = data.target;
        self.bundleid      = data.bundleid;
        self.app           = data.app;
        self.buildpath     = data.buildpath;
        self.apppath       = data.apppath;
        self.launchArgs    = data.args;
        self.config        = data.config;
        self.testPath      = data.testPath;
        self.testResultsPath  = data.testResultsPath;
        self.defaultSyntax = data.syntax;

        soda.actionManager.currentSyntax = { name: self.defaultSyntax.name || "web", version: self.defaultSyntax.version || "1.0" };

        var gotTree      = false,
            gotScreen    = false,
            gotConfig    = false,
            gotHierarchy = false,
            gotSyntax    = false,
            initInterval, initTimeout;

        var error = { e: null };

        // Set an interval to emit when ready...
        initInterval = setInterval(function () {
            if(gotTree && gotScreen && gotConfig && gotHierarchy && gotSyntax) {
                console.log("Framework Ready", self.latestTree, self.latestScreen, self.config);
                self.emit("ready", error.e, self.config, self.latestTree, self.latestScreen, self.latestHierarchy);
                clearTimeout(initTimeout);
                clearInterval(initInterval);
            }
        }, 100);

        // Set a timeout, jic the interval fails
        initTimeout = setTimeout(function () {
            clearInterval(initInterval);
            self.emit("ready", new Error("Framework initialization timed out"), null, null);
        }, SodaSettings.FRAMEWORK_INIT_TIMEOUT);

        // Get initial configuration settings...
        self.getConfig(function (err) {
            if(err) error.e = err;
            gotConfig = true;
        });

        // Get initial tree...
        self.getTree(function (err) {
            if(err) error.e = err;
            gotTree = true;
        });

        setTimeout(function() {
            // Get initial screenshot...
            self.getScreenShot(function (err) {
                if(err) error.e = err;
                gotScreen = true;
            });

            // Get initial project hierarchy...
            self.getHierarchy(function (err) {
                if(err) error.e = err;
                gotHierarchy = true;
            });

            // Get initial action syntax...
            self.getSyntax(self.defaultSyntax.name || "web", self.defaultSyntax.version || "1.0", function (err) {
                if(err) error.e = err;
                gotSyntax = true;
            });
        }, 1000);

        return self;
    };
};
