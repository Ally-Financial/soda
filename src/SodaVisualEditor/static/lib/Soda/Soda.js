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
 * Wrapper for the SodaVisualEditor
 * @return {SodaVisualEditor} The SodaVisualEditor Class
 */
window.SodaNamespace = (function SodaNamespace () {

    var SodaSettings        = window.SodaSettings,
        SodaEmitter         = window.SodaEmitter,
        SodaFramework       = window.SodaFramework,
        SodaEditor          = window.SodaEditor,
        SodaScreen          = window.SodaScreen,
        SodaTree            = window.SodaTree,
        SodaRunner          = window.SodaRunner,
        SodaDelegates       = window.SodaDelegates,
        SodaConsole         = window.SodaConsole,
        SodaProjectManager  = window.SodaProjectManager,
        SodaActionManager   = window.SodaActionManager,
        SodaTestEditor      = window.SodaTestEditor;

    /**
     * A settings object that represents a "startup setting"
     * @param {string} frameworkName The name of the framework
     * @param {string} os The framework's OS
     * @param {string} env The environment to start the framework on
     * @param {object} options Startup options
     * @memberof window.SodaNamespace
     * @constructor
     */
    function SodaStartupSetting (frameworkName, testPath, testResultsPath, device, deviceid, app, platform, workspace, target, bundleid, buildpath, apppath, env, options) {

        /**
         * The name of the framework to start
         * @type {String}
         */
        this.framework = frameworkName;

        /**
         * The device to start the framework with, e.g. "iPhone 6s Plus", etc.
         * @type {String}
         */
        this.device = device;

        /**
         * The device id to start the framework with, e.g. "BF6EEAC3C3500D796666C915A522B99D3A61ED4F", etc.
         * @type {String}
         */
        this.deviceid = deviceid;

        /**
         * The path to the automation test scripts
         * @type {String}
         */
        this.testPath = testPath;

        /**
         * The path to the test results dir
         * @type {String}
         */
        this.testResultsPath = testResultsPath;

        /**
         * The platform to start (e.g. "iphone", "ipad", "android", "androidtab", or "Web")
         * @type {String}
         */
        this.platform = platform;

        /**
         * The workspace variable to start the framework with
         * @type {String}
         */
        this.workspace = workspace;

        /**
         * The target variable to start the framework with
         * @type {String}
         */
        this.target = target;

        /**
         * The bundle identifier variable to start the framework with
         * @type {String}
         */
        this.bundleid = bundleid;

        /**
         * The environment variable to start the framework with
         * @type {String}
         */
        this.env = env;

        /**
         * Other framework options
         * @type {Object}
         */
        this.options = options || {};

        /**
         * The path to the app/binary
         * @type {String}
         */
        this.app = app;

        /**
         * The build path
         * @type {String}
         */
        this.buildpath = buildpath;

        /**
         * The app path
         * @type {String}
         */
        this.apppath = apppath;

        /**
         * The font-awesome class name of the icon to show for the setting on the Favorite's page
         * @type {String}
         */
        this.icon = "fa-globe";

        switch (frameworkName) {
            case "automator":
                this.icon = "fa-android";
                break;

            case "instruments":
                this.icon = "fa-apple";
                break;

            case "perfecto":
                this.icon = "fa-group";
                break;

            case "windows":
                this.icon = "fa-windows";
                break;

            default:
                this.icon = "fa-globe";
                break;
        }
    }

    /**
     * A an HTML dependency object for the Soda framework
     * @constructor
     * @memberof window.SodaNamespace
     * @param {string} name The name of the dependency
     * @param {string} url The location of the dependency
     * @param {string} message The message to display on the loading screen once the dependency has loaded
     * @param {Function} done A function that will be executed once the dependency has been loaded
     */
    function SodaDependency (name, url, message, done) {

        if(typeof name !== "string")
            throw new Error("SodaDependency expected constructor argument `name` to be a string.");

        if(typeof url !== "string")
            throw new Error("SodaDependency expected constructor argument `string` to be a string.");

        if(!done && typeof message === "function") {
            done    = message;
            message = undefined;
        }

        /**
         * The name of the dependency
         * @type {String}
         */
        this.name = name;

        /**
         * The URL to the dependency
         * @type {String}
         */
        this.url = url;

        /**
         * The message to be displayed on the loading screen on successful load
         * @type {String}
         */
        this.message = message || this.name + " loaded...";

        /**
         * A callback for when the dependency has been loaded
         * @type {String}
         */
        this.done = done;
        this.mouseIsDown = false;
    }

    /**
     * The Simple Object Driven Automation Visual Editor
     * @constructor
     * @memberof window.SodaNamespace
     * @extends SodaEmitter
     */
    var SodaVisualEditor = function () {

        // Inherit from SodaEmitter
        SodaEmitter.call(this);

        var self              = this,
            socket            = window.io.connect({upgrade: false, transports: ['websocket'], secure: true, timeout: 5000, connect_timeout: 5000}),
            connectionTimeout = null,
            favoritesLoaded   = false,
            exitStatus        = -1,

        $wrapper                   = $("#soda-wrapper"),
        $loading                   = $("#soda-loading"),
        $loadingMessage            = $("#soda-loading-message"),

        rids      = Date.now(),
        favorites = [],
        settings  = {},
        versionInfo;

        /**
         * The socket.io instance
         * @type {Object}
         */
        this.socket = socket;

        /**
         * A SodaScreen object
         * @type {SodaScreen|null}
         * @composes SodaScreen
         */
        this.screen = null;

        /**
         * A SodaEditor object
         * @type {SodaEditor|null}
         * @composes SodaEditor
         */
        this.editor = null;

        /**
         * A SodaDelegates object
         * @type {SodaDelegates|null}
         * @composes SodaDelegates
         */
        this.delegates = new SodaDelegates(self);

        /**
         * A SodaFramework object
         * @type {SodaFramework|null}
         * @composes SodaFramework
         */
        this.framework = new SodaFramework(self);

        /**
         * A SodaTree object
         * @type {SodaTree|null}
         * @composes SodaTree
         */
        this.tree = null;

        /**
         * A SodaConsole object
         * @type {SodaConsole|null}
         * @composes SodaConsole
         */
        this.console = new SodaConsole(self);

        /**
         * A SodaRunner object
         * @type {SodaRunner|null}
         * @composes SodaRunner
         */
        this.runner = new SodaRunner(self);

        /**
         * A SodaActionManager object
         * @type {SodaActionManager|null}
         * @composes SodaActionManager
         */
        this.actionManager = null;

        /**
         * A SodaTestEditor object
         * @type {SodaTestEditor|null}
         * @composes SodaTestEditor
         */
        this.testEditor = null;

        /**
         * Whether or not the user is in raw JSON edit mode
         * @type Boolean
         */
        this.RAW_MODE = false;

        /**
         * A SodaProjectManager object
         * @type {SodaProjectManager|null}
         * @composes SodaProjectManager
         */
        this.projectManager = null;

        /**
         * An object with elements from the index.html page
         * @type {Object<jQuery>}
         */
        this.$landing = {};

        /**
         * An object with elements from the screen.html page
         * @type {Object<jQuery>}
         */
        this.$screen = {};

        /**
         * An object with elements from the editor.html page
         * @type {Object<jQuery>}
         */
        this.$editor = {};

        /**
         * An object with elements from the tree.html page
         * @type {Object<jQuery>}
         */
        this.$tree = {};

        /**
         * An object with elements from the inspector.html page
         * @type {Object<jQuery>}
         */
        this.$inspector      = {};

        /**
         * An object with elements from the settings.html page
         * @type {Object<jQuery>}
         */
        this.$settings       = {};

        /**
         * An object with elements from the test-editor.html page
         * @type {Object<jQuery>}
         */
        this.$testEditor     = {};

        /**
         * An object with elements from the project.html page
         * @type {Object<jQuery>}
         */
        this.$projectManager = {};

        /**
         * An object with elements from the actions.html page
         * @type {Object<jQuery>}
         */
        this.$actionManager  = {};

        /**
         * An object with elements from the console.html page
         * @type {Object<jQuery>}
         */
        this.$console = {};

        /**
         * An object with elements from the build.html page
         * @type {Object<jQuery>}
         */
        this.$build = {};

        /**
         * An object with elements from the results.html page
         * @type {Object<jQuery>}
         */
        this.$results = {};

        /**
         * An object with elements from the run.html page
         * @type {Object<jQuery>}
         */
        this.$runner = {};

        /**
         * An object with elements from the test-monitor.html page
         * @type {Object<jQuery>}
         */
        this.$monitor = {};

        /**
         * An object with elements from the test-editor.html page
         * @type {Object<jQuery>}
         */
        this.$testEditor = {};

        /**
         * An object with elements from the index.html page (loading screen)
         * @type {Object<jQuery>}
         */
        this.$loading = null;

        // List of Soda dependencies...

        /**
         * @composes SodaDependency
         */
        var dependencies = [
            new SodaDependency(
                "Version Info",
                "version.json",
                "Version information loaded...",
                function (d, content) {
                    versionInfo = content;
                    self.setVersionInfo();
                }
            ),
            new SodaDependency(
                "Framework Launcher",
                "lib/Static/landing.html",
                function (d, content) {
                    self.$landing.self                   = $(content);
                    self.$landing.favorite               = self.$landing.self.children(".soda-favorite");
                    self.$landing.content                = self.$landing.self.children("#soda-landing-content");
                    self.$landing.start                  = self.$landing.content.children("#soda-start");
                    self.$landing.startupStatus          = self.$landing.content.children("#soda-startup-status");
                    self.$landing.startupStatusMessage   = self.$landing.startupStatus.children("#soda-startup-status-content-message");
                    self.$landing.startupErrorButton     = self.$landing.self.children("#soda-startup-error-button");

                    self.$landing.frameworkSelectWrapper    = self.$landing.start.children("#soda-select-framework");
                    self.$landing.frameworkStartIcons       = self.$landing.frameworkSelectWrapper.children("i");
                    self.$landing.frameworkOptionsWrapper   = self.$landing.start.children("#soda-framework-options");
                    self.$landing.frameworkStartOptionForms = self.$landing.frameworkOptionsWrapper.children(".soda-framework-options-form");
                    self.$landing.saveButtons               = self.$landing.frameworkStartOptionForms.find("button.save");
                    self.$landing.perfectoSelected          = self.$landing.frameworkOptionsWrapper.find("#perfecto-options select[name='platform']");
                    self.$landing.perfectoDeviceSelected   = self.$landing.frameworkOptionsWrapper.find("#perfecto-options select[name='device']");
                    self.$landing.perfectoDeviceId         = self.$landing.frameworkOptionsWrapper.find("#perfecto-options input[name='deviceid']");

                    self.$landing.favorites = self.$landing.frameworkOptionsWrapper.find("#favorite-settings");
                    self.$landing.favorite.detach();
                    self.$landing.startupErrorButton.detach();
                }
            ),
            new SodaDependency(
                "Visual Editor",
                "lib/Static/editor.html",
                function (d, content) {
                    self.$editor.self = $(content);
                }
            ),
            new SodaDependency(
                "Element Attributes Inspector",
                "lib/Static/inspector.html",
                function (d, content) {
                    self.on("editor init", function () {
                        self.$inspector.self = self.editor.addToolbox({
                            name    : "element-inspector",
                            title   : "Element Inspector",
                            content : $(content),
                            icon    : "fa-compass",
                            show    : true,
                            side    : "right"
                        });
                        self.$inspector.attributes        = self.$inspector.self.find("#soda-tree-attributes");
                        self.$inspector.attributesWrapper = self.$inspector.self.find("#soda-tree-attributes-wrapper");
                        self.$inspector.attributesHeader  = self.$inspector.self.find("#soda-tree-attributes-header");
                    });
                }
            ),
            new SodaDependency(
                "Element DOM Tree",
                "lib/Static/tree.html",
                function (d, content) {
                    self.$tree.self = $(content);
                }
            ),
            new SodaDependency(
                "Element Navigator",
                "lib/Static/screen.html",
                function (d, content) {
                    self.$screen.self = $(content);
                }
            ),
            new SodaDependency(
                "Action Manager",
                "lib/Static/actions.html",
                function (d, content) {
                    self.on("editor init", function () {
                        self.$actionManager.self = self.editor.addToolbox({
                            name    : "actions-manager",
                            title   : "Element Actions",
                            content : $(content),
                            icon    : "fa-bolt",
                            show    : false,
                            side    : "right"
                        });
                    });
                }
            ),
            new SodaDependency(
                "Test Runner",
                "lib/Static/run.html",
                function (d, content) {
                    self.on("editor init", function () {
                        self.$runner.self = self.editor.addToolbox({
                            name    : "test-runner",
                            title   : "Run",
                            content : $(content),
                            icon    : "fa-repeat",
                            show    : false,
                            side    : "left"
                        });
                    });
                }
            ),
            new SodaDependency(
                "Test Monitor",
                "lib/Static/test-monitor.html",
                function (d, content) {
                    self.on("editor init", function () {
                        self.$monitor.self = self.editor.addToolbox({
                            name    : "test-monitor",
                            title   : "Test Monitor",
                            content : $(content),
                            icon    : "fa-eye",
                            show    : false,
                            side    : "left"
                        });
                    });
                }
            ),
            new SodaDependency(
                "Console",
                "lib/Static/console.html",
                function (d, content) {
                    self.on("editor init", function () {
                        self.$console.self = self.editor.addToolbox({
                            name    : "console",
                            title   : "Console",
                            content : $(content),
                            icon    : "fa-terminal",
                            show    : false,
                            side    : "right"
                        });
                    });
                }
            ),
            new SodaDependency(
                "Results Viewer",
                "lib/Static/results.html",
                function (d, content) {
                    self.on("editor init", function () {
                        self.$results.self = self.editor.addToolbox({
                            name    : "results-viewer",
                            title   : "Result History",
                            content : $(content),
                            icon    : "fa-pie-chart",
                            show    : false,
                            side    : "left"
                        });
                    });
                }
            ),
            new SodaDependency(
                "Project Manager",
                "lib/Static/project.html",
                function (d, content) {
                    self.on("editor init", function () {
                        self.$projectManager.self = self.editor.addToolbox({
                            name    : "project-manager",
                            title   : "Project Manager",
                            content : $(content),
                            icon    : "fa-sitemap",
                            show    : false,
                            side    : "right"
                        });
                    });
                }
            ),
            new SodaDependency(
                "Test Editor",
                "lib/Static/test-editor.html",
                function (d, content) {
                    self.on("editor init", function () {
                        self.$testEditor.self = self.editor.addToolbox({
                            name    : "test-editor",
                            title   : "Test Editor",
                            content : $(content),
                            icon    : "fa-pencil",
                            show    : false,
                            side    : "left"
                        });
                    });
                }
            ),
            new SodaDependency(
                "Project Builder",
                "lib/Static/build.html",
                function (d, content) {
                    self.on("editor init", function () {
                        self.$build.self = self.editor.addToolbox({
                            name    : "project-builder",
                            title   : "App Builder",
                            content : $(content),
                            icon    : "fa-cube",
                            show    : false,
                            side    : "right"
                        });

                        self.editor.disableToolbox("project-builder");
                        self.$build.forms   = self.$build.self.find(".build-form").detach();
                        self.$build.status  = self.$build.self.find("#builder-status");
                        self.$build.history = self.$build.self.find("#soda-build-history");

                        self.on("editor shown", function () {
                            if(self.framework.name.toLowerCase() === "instruments" || self.framework.name.toLowerCase() === "automator" || self.framework.name.toLowerCase() === "perfecto") {

                                self.editor.enableToolbox("project-builder");
                                self.$build.self.find("#builder-form").empty();

                                self.$buildForm = self.$build.forms.filter("#" + self.framework.name.toLowerCase() + "-build-form").appendTo(self.$build.self.find("#builder-form"));
                                self.$buildForm.find(".builder-device").val(self.framework.launchArgs[0]);

                                var settingToStore = {};

                                if(self.framework.name.toLowerCase() === "instruments") {
                                    self.$buildForm.find(".builder-path").val(
                                        self.framework.launchArgs[1].substring(0, self.framework.launchArgs[1].lastIndexOf("/"))
                                    );

                                    if (settings[self.framework.name.toLowerCase()+"_build_appname_" + self.framework.platform] !== null) {
                                        self.$buildForm.find("#instruments-build-appname").val(
                                            window.Soda.framework.app
                                        );
                                    }
                                    else {
                                        self.$buildForm.find("#instruments-build-appname").val(
                                            window.Soda.framework.app
                                        );
                                    }

                                    if (settings[self.framework.name.toLowerCase()+"_workspace_" + self.framework.platform] !== null) {
                                        self.$buildForm.find("#instruments-build-workspace").val(
                                            window.Soda.framework.workspace
                                        );
                                    }
                                    else {
                                        self.$buildForm.find("#instruments-build-workspace").val(
                                            window.Soda.framework.workspace
                                        );
                                    }

                                    if (settings[self.framework.name.toLowerCase()+"_buildpath_" + self.framework.platform] !== null) {
                                        self.$buildForm.find("#instruments-build-path").val(
                                            window.Soda.framework.buildpath
                                        );
                                    }
                                    else {
                                        self.$buildForm.find("#instruments-build-buildpath").val(
                                            window.Soda.framework.buildpath
                                        );
                                    }

                                    if (settings[self.framework.name.toLowerCase()+"_bundleid_" + self.framework.platform] !== null) {
                                        self.$buildForm.find("#instruments-build-bundleid").val(
                                            window.Soda.framework.bundleid
                                        );
                                    }
                                    else {
                                        self.$buildForm.find("#instruments-build-buildeid").val(
                                            window.Soda.framework.bundleid
                                        );
                                    }

                                    if (settings[self.framework.name.toLowerCase()+"_target_" + self.framework.platform] !== null) {
                                        self.$buildForm.find("#instruments-build-target").val(
                                            window.Soda.framework.target
                                        );
                                    }
                                    else {
                                        self.$buildForm.find("#instruments-build-target").val(
                                            window.Soda.framework.target
                                        );
                                    }

                                    if (settings[self.framework.name.toLowerCase()+"_device_" + self.framework.platform] !== null) {
                                        self.$buildForm.find("#instruments-build-device").val(
                                            window.Soda.framework.device
                                        );
                                    }
                                    else {
                                        self.$buildForm.find("#instruments-build-device").val(
                                            window.Soda.framework.device
                                        );
                                    }

                                    settingToStore[self.framework.name.toLowerCase()+"_workspace_"+self.framework.platform] = self.$buildForm.find("#instruments-build-workspace").val();
                                    settingToStore[self.framework.name.toLowerCase()+"_build_appname_"+self.framework.platform] = self.$buildForm.find("#instruments-build-appname").val();
                                    settingToStore[self.framework.name.toLowerCase()+"_build_buildpath_"+self.framework.platform] = self.$buildForm.find("#instruments-build-buildpath").val();
                                    settingToStore[self.framework.name.toLowerCase()+"_build_bundleid_"+self.framework.platform] = self.$buildForm.find("#instruments-build-bundleid").val();
                                    settingToStore[self.framework.name.toLowerCase()+"_build_target_"+self.framework.platform] = self.$buildForm.find("#instruments-build-target").val();
                                    settingToStore[self.framework.name.toLowerCase()+"_build_device_"+self.framework.platform] = self.$buildForm.find("#instruments-build-device").val();
                                    settingToStore[self.framework.name.toLowerCase()+"_build_apppath_"+self.framework.platform] = window.Soda.framework.apppath;

                                    self.setSetting(settingToStore);
                                }
                                if(self.framework.name.toLowerCase() === "perfecto") {
                                    self.$buildForm.find(".builder-path").val(
                                        self.framework.launchArgs[1].substring(0, self.framework.launchArgs[1].lastIndexOf("/"))
                                    );

                                    if (settings[self.framework.name.toLowerCase()+"_build_appname_" + self.framework.platform] !== null) {
                                        self.$buildForm.find("#perfecto-build-appname").val(
                                            window.Soda.framework.app
                                        );
                                    }
                                    else {
                                        self.$buildForm.find("#perfecto-build-appname").val(
                                            window.Soda.framework.app
                                        );
                                    }

                                    if (settings[self.framework.name.toLowerCase()+"_workspace_" + self.framework.platform] !== null) {
                                        self.$buildForm.find("#perfecto-build-workspace").val(
                                            window.Soda.framework.workspace
                                        );
                                    }
                                    else {
                                        self.$buildForm.find("#perfecto-build-workspace").val(
                                            window.Soda.framework.workspace
                                        );
                                    }

                                    if (settings[self.framework.name.toLowerCase()+"_buildpath_" + self.framework.platform] !== null) {
                                        self.$buildForm.find("#perfecto-build-path").val(
                                            window.Soda.framework.buildpath
                                        );
                                    }
                                    else {
                                        self.$buildForm.find("#perfecto-build-buildpath").val(
                                            window.Soda.framework.buildpath
                                        );
                                    }

                                    if (settings[self.framework.name.toLowerCase()+"_bundleid_" + self.framework.platform] !== null) {
                                        self.$buildForm.find("#perfecto-build-bundleid").val(
                                            window.Soda.framework.bundleid
                                        );
                                    }
                                    else {
                                        self.$buildForm.find("#perfecto-build-buildeid").val(
                                            window.Soda.framework.bundleid
                                        );
                                    }

                                    if (settings[self.framework.name.toLowerCase()+"_target_" + self.framework.platform] !== null) {
                                        self.$buildForm.find("#perfecto-build-target").val(
                                            window.Soda.framework.target
                                        );
                                    }
                                    else {
                                        self.$buildForm.find("#perfecto-build-target").val(
                                            window.Soda.framework.target
                                        );
                                    }

                                    if (settings[self.framework.name.toLowerCase()+"_bundleid_" + self.framework.platform] !== null) {
                                        self.$buildForm.find("#perfecto-build-bundleid").val(
                                            window.Soda.framework.bundleid
                                        );
                                    }
                                    else {
                                        self.$buildForm.find("#perfecto-build-buildeid").val(
                                            window.Soda.framework.bundleid
                                        );
                                    }

                                    if (settings[self.framework.name.toLowerCase()+"_device_" + self.framework.platform] !== null) {
                                        self.$buildForm.find("#perfecto-build-device").val(
                                            window.Soda.framework.device
                                        );
                                    }
                                    else {
                                        self.$buildForm.find("#perfecto-build-device").val(
                                            window.Soda.framework.device
                                        );
                                    }

                                    if (settings[self.framework.name.toLowerCase()+"_deviceid_" + self.framework.platform] !== null) {
                                        self.$buildForm.find("#perfecto-build-deviceid").val(
                                            window.Soda.framework.deviceid
                                        );
                                    }
                                    else {
                                        self.$buildForm.find("#perfecto-build-deviceid").val(
                                            window.Soda.framework.deviceid
                                        );
                                    }

                                    settingToStore[self.framework.name.toLowerCase()+"_workspace_"+self.framework.platform] = self.$buildForm.find("#perfecto-build-workspace").val();
                                    settingToStore[self.framework.name.toLowerCase()+"_build_appname_"+self.framework.platform] = self.$buildForm.find("#perfecto-build-appname").val();
                                    settingToStore[self.framework.name.toLowerCase()+"_build_buildpath_"+self.framework.platform] = self.$buildForm.find("#perfecto-build-buildpath").val();
                                    settingToStore[self.framework.name.toLowerCase()+"_build_bundleid_"+self.framework.platform] = self.$buildForm.find("#perfecto-build-bundleid").val();
                                    settingToStore[self.framework.name.toLowerCase()+"_build_target_"+self.framework.platform] = self.$buildForm.find("#perfecto-build-target").val();
                                    settingToStore[self.framework.name.toLowerCase()+"_build_device_"+self.framework.platform] = self.$buildForm.find("#perfecto-build-device").val();
                                    settingToStore[self.framework.name.toLowerCase()+"_build_deviceid_"+self.framework.platform] = self.$buildForm.find("#perfecto-build-deviceid").val();
                                    settingToStore[self.framework.name.toLowerCase()+"_build_apppath_"+self.framework.platform] = window.Soda.framework.apppath;

                                    self.setSetting(settingToStore);
                                }
                                else {
                                    self.$buildForm.find(".builder-path").val(self.framework.launchArgs[1]);
                                }

                                self.$build.submit = self.$build.self.find(".builder-submit");
                                self.$build.submit.click(function () {

                                    var $fields = self.$buildForm.find(":input"), args = [];
                                    self.$build.status.html("Building project<span class=\"dot-dot-dot\">...</span>");
                                    self.editor.setStatus({
                                        which   : "left",
                                        message : "Building project<span class=\"dot-dot-dot\">...</span>"
                                    });

                                    $fields.sort(function (a, b) {
                                        var aZ = parseInt($(a).attr("data-arg-z"), 10),
                                            bZ = parseInt($(b).attr("data-arg-z"), 10);
                                        return aZ < bZ ? -1 : aZ > bZ ? 1 : 0;
                                    });

                                    var dataToSend = [];
                                    dataToSend.push(window.Soda.framework.device);
                                    dataToSend.push(window.Soda.framework.target);
                                    dataToSend.push(window.Soda.framework.workspace);
                                    dataToSend.push(window.Soda.framework.buildpath);
                                    if(self.framework.name.toLowerCase() === "instruments") {
                                      var slash = "/";
                                      if (window.navigator.platform.toLowerCase() === "win32" || window.navigator.platform.toLowerCase() === "win64") {
                                        slash = "\\";
                                      }

                                      dataToSend.push(window.Soda.framework.buildpath + slash + window.Soda.framework.app + '.app');

                                      dataToSend.push(window.Soda.framework.bundleid);
                                      dataToSend.push(window.Soda.framework.device);
                                    }
                                    else if (self.framework.name.toLowerCase() === "perfecto") {
                                      dataToSend.push(window.Soda.framework.app);
                                    }

                                    $fields.sodaeach(function () { args.push($(this).val()); });

                                    self.addOutputPipe(buildPipe);
                                    self.$build.submit.prop("disabled", true);

                                    if(self.framework.name.toLowerCase() === "instruments" || self.framework.name.toLowerCase() === "perfecto") {
                                      args = dataToSend;
                                    }
                                    else {
                                      args.slice(0, args.length - 1);
                                    }

                                    self.send("build", args, function (err, built) {
                                        if(err) self.$build.status.html(err.message);
                                        var str = "<p>Build complete!<p>";

                                        if(built) {
                                            self.editor.setStatus({
                                                which   : "left",
                                                message : "Build succeeded!"
                                            });
                                            str += '<p><span class="bold">Build Succeeded</span></p>';
                                            if(self.framework.name.toLowerCase() === "instruments") {
                                                str += "<p>The Instruments framework must be restarted to reflect the new build. <a href=\"#\" class=\"build-restart-framework\">Click here to restart.</a></p><a href=\"#\" class=\"builder-reset\">Click here to reset the simulator and restart the framework.</a>";
                                            }
                                        }
                                        else {
                                            self.editor.setStatus({
                                                which   : "left",
                                                message : "Build failed!"
                                            });
                                            str += '<p><span class="bold">Build Failed!</span></p>';
                                        }

                                        self.$build.status.html(str);
                                        self.$build.submit.prop("disabled", false);
                                        $(".build-restart-framework").unbind().click(function () {
                                            self.restartFramework();
                                        });

                                        self.$build.reset = self.$build.self.find(".builder-reset");
                                        self.$build.reset.click(function () {

                                            self.$build.status.html("Resetting simulator<span class=\"dot-dot-dot\">...</span>");
                                            self.editor.setStatus({
                                                which   : "left",
                                                message : "Resetting simulator<span class=\"dot-dot-dot\">...</span>"
                                            });

                                            self.restartFramework(true,
                                                null,
                                                function () {
                                                    self.editor.setStatus({
                                                        which   : "left",
                                                        message : "Reset complete!"
                                                    });
                                                    self.$build.status.html("Simulator reset successful!");
                                                }
                                            );
                                        });

                                        self.removeOutputPipe(buildPipe);
                                    });
                                });
                            }
                            else {
                                self.editor.disableToolbox("project-builder");
                            }
                        });
                    });
                }
            ),
            new SodaDependency(
                "Settings Manager",
                "lib/Static/settings.html",
                function (d, content) {
                    self.on("editor init", function () {
                        self.$settings.self = self.editor.addToolbox({
                            name    : "settings-manager",
                            title   : "Settings",
                            content : $(content),
                            icon    : "fa-cog",
                            show    : false,
                            side    : "right"
                        });

                        self.$settings.settings = self.$settings.self.find("#soda-settings-wrapper");

                        var updateConfig = function (configObject, parents) {
                            parents = parents || [];

                            for(var i in configObject) {
                                if(configObject.hasOwnProperty(i)) {
                                    var c  = configObject[i];

                                    if(typeof c === "object") {
                                        var newParents = [];
                                        for(var n = 0; n < parents.length; n++) newParents[n] = parents[n];
                                        newParents.push(i);
                                        updateConfig(c, newParents);
                                    }
                                    else {
                                        var $c = $(
                                            '<div class="settings-item">'                                                                                           +
                                                '<div class="settings-item-key toolbox-key">' + (parents.length > 0 ? parents.join(".") + "." : "") + i + '</div>'  +
                                                '<div class="settings-item-value toolbox-value" contenteditable="true">' + c + '</div>'                             +
                                            '</div>'
                                        ).appendTo(self.$settings.settings);

                                        var $key   = $c.find(".settings-item-key"),
                                            $value = $c.find(".settings-item-value"),
                                            lastValue = $value.text();

                                        (function (i, $key, $value, lastValue) {
                                            $value.blur(function () {
                                                if($(this).text() !== lastValue) {
                                                    lastValue = $(this).text();
                                                    self.send("update config", { name: $key.text(), value: $value.text() });
                                                }
                                            });
                                        }(i, $key, $value, lastValue));
                                    }
                                }
                            }
                        };
                        self.framework.on("config update", function (err, config) {
                            self.$settings.settings.empty();
                            updateConfig(config);
                        });
                        self.socket.on("config update", function (config) {
                            self.$settings.settings.empty();
                            updateConfig(config);
                        });
                    });
                }
            ),
            new SodaDependency(
                "Soda VisualEditor Help",
                "lib/Static/help.html",
                function (d, content) {
                    self.on("editor init", function () {
                        self.$settings.self = self.editor.addToolbox({
                            name    : "help",
                            title   : "Soda VisualEditor Help",
                            content : $(content),
                            icon    : "fa-question-circle",
                            show    : false,
                            side    : "left"
                        });
                    });
                }
            ),
        ];

        /////////////////////////////////////////////// HELPER FUNCTIONS ///////////////////////////////////////////////

        /**
         * Pipe output to the startup status element
         * @param  {Array<string>} messages The messages to pipe
         * @return {undefined}
         */
        function startupPipe (messages) {
            messages.forEach(function (message) {
                self.$landing.startupStatusMessage
                    .html(message);
            });
        }

        /**
         * Pipe output to the build panel
         * @param  {Array<string>} messages The messages to pipe
         * @return {undefined}
         */
        function buildPipe (messages) {
            for(var i in messages) {
                if(messages.hasOwnProperty(i)) {
                    var $msg = $(messages[i]);
                    if($msg.hasClass("pass") || $msg.hasClass("error") || $msg.hasClass("log") || $msg.hasClass("fail") || $msg.hasClass("verbose")) {
                        $("#soda-build-history").children('li:gt(49)').remove();
                        $("#soda-build-history").prepend('<li class="soda-builder-message list-group-item">' + messages[i] + '</li>');
                    }
                }
            }
        }

        /**
         * Pipe output to the startup status element
         * @param  {string} message The message to pipe
         * @return {undefined}
         */
        function startupPipeAttached (messages) {
            if(typeof messages === "string") {
                $loadingMessage.html(messages);
            }
            else {
                messages.forEach(function (message) {
                    $loadingMessage.html(message);
                });
            }
        }


        /**
         * Switches the startup dialog to the framework specified by the bound element.
         * @return {undefined}
         */
        function showStartupFormFor () {
            self.showStartupFormFor($(this).attr("data-framework") || "automator"); // jshint ignore:line
            self.$landing.frameworkStartOptionForms.mCustomScrollbar("update");
        }

        /**
         * Get's framework startup settings using the provided form
         * @param  {jQuery} $form The jQuery form object
         * @composes SodaStartupSetting
         * @return {SodaStartupSetting} The startup settings generated from the provided form
         */
        function getSettingsFromStartupForm ($form) {
            var options = {}, platform, device, deviceid, workspace, target, bundleid, buildpath, env, app, testPath, testResultsPath;

            $form.find(':input').sodaeach(function (i, el) {
                var attr = $(el).attr("name");
                switch(attr) {
                    case "platform":
                        platform = $(el).val();
                        break;

                    case "device":
                        device = $(el).val();
                        break;

                    case "deviceid":
                        deviceid = $(el).val();
                        break;

                    case "env":
                        env = $(el).val();
                        break;

                    case "app":
                        app = $(el).val();

                        break;

                    case "workspace":
                        workspace = $(el).val();
                        break;

                    case "target":
                        target = $(el).val();
                        break;

                    case "bundleid":
                        bundleid = $(el).val();
                        break;

                    case "buildpath":
                        buildpath = $(el).val();
                        break;

                    case "testPath":
                        testPath = $(el).val();
                        break;

                    case "testResultsPath":
                        testResultsPath = $(el).val();
                        break;

                    default:
                        if(attr) options[attr] = $(el).val();
                }
            });

            if (self.$landing.self.find("#instruments-options").is(':visible') && (platform === 'iphone' || platform === 'ipad')) {
              return new SodaStartupSetting($form.attr("data-framework"), testPath, testResultsPath, device, deviceid, app, platform, workspace, target, bundleid, buildpath, buildpath+'/'+app+'.app', env, options);
            }
            else if (self.$landing.self.find("#perfecto-options").is(':visible') && (platform === 'iphone' || platform === 'ipad')) {
              return new SodaStartupSetting($form.attr("data-framework"), testPath, testResultsPath, device, deviceid, app, platform, workspace, target, bundleid, buildpath, buildpath+'/'+target+'.ipa', env, options);
            }
            else {
              return new SodaStartupSetting($form.attr("data-framework"), testPath, testResultsPath, device, deviceid, app, platform, workspace, target, bundleid, buildpath, null, env, options);
            }
        }

        // When the startup error button is clicked
        function startupFailureClick () {
            var $errorButton = $(this);
            self.showStartupOptions(function () {
                self.$landing.startupStatusMessage.html("Sending startup request to server");
                self.$landing.startupStatus.children("h2").html('Starting Framework<div class="dot-dot-dot">...</div>');
                $errorButton.detach();
            });
        }

        ///////////////////////////////////////////////// LIVE EVENTS //////////////////////////////////////////////////

        // Push events to post-dependency load...
        self.on("dependencies loaded", function () {
            console.log('DEPENDENCIES LOADED', new Error().stack);
            self.editor = new SodaEditor(self, self.$editor);

            /**
             * Emitted once all dependencies have loaded, and the editor is instantiating
             * @event window.SodaNamespace#SodaVisualEditor#editor init
             */
            self.emit("editor init");

            self.tree           = new SodaTree(self, self.$tree);
            self.screen         = new SodaScreen(self, self.$screen);
            self.projectManager = new SodaProjectManager(self, self.$projectManager);
            self.actionManager  = new SodaActionManager(self);
            self.testEditor     = new SodaTestEditor(self);

            self.console.init(self.$console);
            self.runner.init(self.$runner, self.$monitor);
            self.actionManager.init(self.$actionManager);
            self.testEditor.init(self.$testEditor);

            // When a landing startup form is submitted
            self.$landing.frameworkStartOptionForms.submit(function (e) {
                e.preventDefault();
                return self.startFrameworkWithSettings(getSettingsFromStartupForm($(this)));
            });

            function formChange () {
                var form     = $(this).closest(".soda-framework-options-form"),
                    buttons  = form.find("button"),
                    required = form.find("input.required");

                    var disable = false;
                    required.sodaeach(function () {
                        if($(this).val() === "" || !$(this).val()) {
                            disable = true;
                        }
                    });

                    if(disable) {
                        buttons.prop("disabled", true);
                    }
                    else {
                        buttons.prop("disabled", false);
                    }
            }

            self.$landing.frameworkStartOptionForms.find("input").on("keyup", formChange);

            self.$landing.perfectoSelected.change(function() {
                getAvailableDevices();
                var dev = self.$landing.self.find("#perfecto-options select[name='device'] option:selected").val();
                var res = dev.split(" - ");
                self.$landing.perfectoDeviceId.val(res[3]);
            });

            self.$landing.perfectoDeviceSelected.change(function() {
              var dev = self.$landing.self.find("#perfecto-options select[name='device'] option:selected").val();
              var res = dev.split(" - ");
              self.$landing.perfectoDeviceId.val(res[3]);
            });

            // When the "save" button is clicked
            self.$landing.saveButtons.click(function () {
                var startupOption = getSettingsFromStartupForm($(this).closest("form"));
                self.setFavorite(startupOption.framework + " " + (new Date()).toLocaleDateString("en-US"), startupOption);
                self.showStartupFormFor("favorites");
            });

            self.$landing.startupErrorButton.click(startupFailureClick);

            $("#soda-wrapper").on("click", "i.close", function () {
                $($(this).attr("data-close") || $(this).parent())
                    .fadeOut(SodaSettings.FADEOUT_SLOW_SPEED, function () {
                        $(this).remove();
                    });
            });

            $(document).mousedown(function() {
                self.mouseIsDown = true;
            }).mouseup(function() {
                self.mouseIsDown = false;
            });
        });

        //////////////////////////////////////////////// CLASS METHODS /////////////////////////////////////////////////

        /**
         * Add a dependency to the list of dependencies to load
         * @param {object<SodaDependency>} dependency A SodaDependency object to add
         * @return {object<Soda>} The current Soda instance
         */
        this.addDependency = function (dependency) {
            if(dependency instanceof SodaDependency) dependencies.push(dependency);
            return self;
        };

        /**
         * Remove a dependency from the list of startup dependencies
         * @param {object<SodaDependency>} dependency The SodaDependency object to be removed
         * @return {object<Soda>} The current Soda instance
         */
        this.removeDependency = function (dependency) {
            if(dependency instanceof SodaDependency) {
                var idx = dependencies.indexOf(dependency);
                if(idx > -1) dependencies.splice(idx, 1);
            }
            return self;
        };

        /**
         * Sets the version information for all elements with the class `.version-info`
         * @return {object<Soda>} The current Soda instance
         */
        this.setVersionInfo = function () {
            if (versionInfo && versionInfo.authors) {
                $(".version-info").html("Simple Object Driven Automation &#8226; " + versionInfo.authors.join(", ") + " &#8226; v" + versionInfo.version + " \"" + versionInfo.name + "\"");
            }

            return self;
        };

        /**
         * Loads a dependency via AJAX
         * @param  {string} dependencyUrl The url to the dependency
         * @param  {Function=} done A callback for when the dependency is loaded
         * @return {object<Soda>} The current Soda instance
         */
        this.loadDependency = function (d, done) {
            $.ajax({
                url: d.url,
                success: function (data)  {
                    $loadingMessage.text(d.message);
                    if(done instanceof Function) done.call(self, null, data);
                },
                error: function (jqXHR) {
                    $loadingMessage.text("Error: failed to load dependency \"" + (d.name || d.url) + "\"");
                    if(done instanceof Function) done.call(self, jqXHR, null);
                }
            });
            return self;
        };

        /**
         * Load all Soda dependencies
         * @param  {function=} done A callback that will be executed when *all* dependencies are loaded
         * @return {object<Soda>} The current Soda instance
         */
        this.loadDependencies = function (done) {

            var dependenciesLoaded = 0,
                dependenciesTotal  = dependencies.length;

            dependencies.every(function (d) {
                if(d instanceof SodaDependency) {
                    self.loadDependency(d, function (err, res) {
                        if(!err) {
                            if(d.done instanceof Function)
                                d.done.call(self, d, res);

                            if(++dependenciesLoaded === dependenciesTotal) {

                                /**
                                 * Emitted once all dependencies have loaded
                                 * @event window.SodaNamespace#SodaVisualEditor#dependencies loaded
                                 * @argument {Array<Object>} The list of dependencies loaded
                                 */
                                self.emit("dependencies loaded", dependencies);
                                done.call(self, null);
                            }

                            return true;
                        }
                        else {
                            if(done instanceof Function) {
                                done.call(self, err);
                                done = null;
                            }
                        }
                    });
                }
                return true;
            });
            return self;
        };

        /**
         * Sets up the framework buttons, so that options are shown when clicked
         * @return {object<Soda>} The current Soda instance
         */
        this.enableFrameworkSelectButtons = function () {
            self.$landing.frameworkStartIcons.not(".active").addClass("inactive");
            self.$landing.frameworkSelectWrapper.on("click", "i.inactive", showStartupFormFor);
            return self;
        };

        /**
         * Disables the framework buttons, so that nothing happens when they are clicked
         * @return {object<Soda>} The current Soda instance
         */
        this.disableFrameworkSelectButtons = function () {
            self.$landing.frameworkStartIcons.removeClass("inactive");
            self.$landing.frameworkSelectWrapper.off("click", showStartupFormFor);
            return self;
        };

        /**
         * Sets a favorite
         * @param alias An alias to save the startup settings as
         * @param {object<SodaStartupSetting>} startupSettings A startup settings object to save
         */
        this.setFavorite = function (alias, startupSettings) {

            var favorite = { name: alias.titleCase, settings: startupSettings };

            if(favorite.settings.options && typeof favorite.settings.options === "object" && favorite.settings.options.proxyPass && favorite.settings.options.proxyPass !== "") {
                self.send("encrypt", favorite.settings.options.proxyPass, function (err, encrypted) {
                    if(err) return console.error(err);

                    favorite.settings.options.proxyPass = encrypted;
                    favorites.push(favorite);

                    self.send("save favorites", favorites, function (err) {
                        if(err) return console.error(err);
                    });

                    if(favoritesLoaded === true) self.loadFavorite(favorite);
                });
            }
            else {
                favorites.push(favorite);
                self.send("save favorites", favorites, function (err) {
                    if(err) return console.error(err);
                });

                if(favoritesLoaded === true) self.loadFavorite(favorite);
            }
            return self;
        };

        /**
         * Returns the list of favorites as an array
         * @return {object} The favorites array
         */
        this.getFavorites = function () {
            return favorites;
        };

        /**
         * Loads a user favorites and appends it to the favorites startup menu
         * @return {object<Soda>} The current Soda instance
         */
        this.loadFavorite = function (f) {
            var newFavorite = self.$landing.favorite.clone();

            newFavorite
                .find(".f-alias")
                .text(f.name);

            newFavorite
                .find(".f-framework")
                .html(f.settings.framework.titleCase);

            newFavorite
                .find(".f-device")
                .html(f.settings.device ? " &#8226; " + f.settings.device : "");

            newFavorite
                .find(".f-deviceid")
                .html(f.settings.deviceid ? " &#8226; " + f.settings.deviceid : "");

            newFavorite
                .find(".f-testPath")
                .html('<span class="bold" style="margin-right: 5px">Project Path </span>' + (f.settings.testPath ? f.settings.testPath : '<span class="emphasis">Undefined</span>'));

            newFavorite
                .find(".f-testResultsPath")
                .html('<span class="bold" style="margin-right: 5px">Test Result Path </span>' + (f.settings.testResultsPath ? f.settings.testResultsPath : '<span class="emphasis">Undefined</span>'));

            newFavorite
                .find(".f-platform")
                .html(f.settings.platform ? " &#8226; " + f.settings.platform.titleCase : "");

            var slash = "/";

            if (f.settings.framework.toLowerCase() === "instruments") {

              if (window.navigator.platform.toLowerCase() === "win32" || window.navigator.platform.toLowerCase() === "win64") {
                slash = "\\";
              }

              newFavorite
                  .find(".f-app")
                  .html('<span class="bold" style="margin-right: 5px">App Name </span>' + (f.settings.app ? f.settings.buildpath + slash + f.settings.app + '.app' : '<span class="emphasis">Undefined</span>'));
            }
            if (f.settings.framework.toLowerCase() === "perfecto") {
              if (window.navigator.platform.toLowerCase() === "win32" || window.navigator.platform.toLowerCase() === "win64") {
                slash = "\\";
              }

              newFavorite
                  .find(".f-app")
                  .html('<span class="bold" style="margin-right: 5px">App Name </span>' + (f.settings.target ? f.settings.buildpath + slash + f.settings.target + '.ipa' : '<span class="emphasis">Undefined</span>'));
            }
            else {
              newFavorite
                  .find(".f-app")
                  .html('<span class="bold" style="margin-right: 5px">App Name </span>' + (f.settings.app ? f.settings.app : '<span class="emphasis">Undefined</span>'));
            }

            newFavorite
                .find(".f-env")
                .html(f.settings.env ? " &#8226; " + f.settings.env.toUpperCase() : "");

            newFavorite
                .find(".f-icon")
                .removeClass()
                .addClass("fa")
                .addClass("fa-2x")
                .addClass(f.settings.icon);

            newFavorite.find(".f-delete").click(function (e) {
                e.stopPropagation();
                newFavorite.fadeOut(SodaSettings.FADEOUT_SLOW_SPEED);
                favorites.splice(f.index, 1);

                favorites.forEach(function (f, i) { if(typeof f === "object") f.index = i; });
                self.send("save favorites", favorites, function (err) {
                    if(err) console.error(err);
                });
            });

            newFavorite.click(function () {
                return self.startFrameworkWithSettings(f.settings);
            });

            newFavorite.prependTo(self.$landing.favorites);
            return self;
        };

        /**
         * Loads the user's favorites and appends them to the favorites startup menu
         * @return {object<Soda>} The current Soda instance
         */
        this.loadFavorites = function () {
            favorites.forEach(function (f, i) { 
                f.index = i; 
                self.loadFavorite(f); 
            });
            favoritesLoaded = true;
            return self;
        };


        /**
         * Sets a setting
         * @param {object<SodaUserSetting>} userSetting A user settings object to save
         */
        this.setSetting = function (userSetting) {
            self.send("save settings", userSetting, function (err) {
                if(err) return console.error(err);

                self.send("get settings", function (err, data) {
                    if(err) console.error(err);
                    settings = data;
                });
            });

            return self;
        };

        /**
         * Loads the user's settings
         * @return {object<Soda>} The current Soda instance
         */
        this.loadFavorites = function () {
            favorites.forEach(function (f, i) { 
                f.index = i; 
                self.loadFavorite(f); 
            });
            favoritesLoaded = true;
            return self;
        };

        /**
         * Returns the settings as an object
         * @return {object} The settings object
         */
        this.getSettings = function () {
            return settings;
        };

        /**
         * Show the startup form for the specified framework and hide all others
         * @param  {string} frameworkName [description]
         * @return {object<Soda>} The current Soda instance
         */
        this.showStartupFormFor = function (frameworkName, done) {
            self.$landing.frameworkStartOptionForms
                .fadeOut(SodaSettings.FADEOUT_SPEED)
                .promise()
                .done(function () {
                    switch(frameworkName.toLowerCase()) {
                        case "instruments":
                            $(".soda-framework-options-form.instruments")
                                .fadeIn(SodaSettings.FADEIN_SPEED, done);
                            break;

                        case "automator":
                            $(".soda-framework-options-form.automator")
                                .fadeIn(SodaSettings.FADEIN_SPEED, done);
                            break;

                        case "selenium":
                            $(".soda-framework-options-form.selenium")
                                .fadeIn(SodaSettings.FADEIN_SPEED, done);
                            break;

                        case "puppeteer":
                            $(".soda-framework-options-form.puppeteer")
                                .fadeIn(SodaSettings.FADEIN_SPEED, done);
                            break;

                        case "perfecto":
                            $(".soda-framework-options-form.perfecto")
                                .fadeIn(SodaSettings.FADEIN_SPEED, done);
                            break;

                        case "windows":
                            $(".soda-framework-options-form.windows")
                                .fadeIn(SodaSettings.FADEIN_SPEED, done);
                            break;

                        case "favorites":
                            $(".soda-framework-options-form.favorites")
                                .fadeIn(SodaSettings.FADEIN_SPEED, done);
                            break;

                        case "help":
                            $(".soda-framework-options-form.help")
                                .fadeIn(SodaSettings.FADEIN_SPEED, done);
                            break;
                        
                        default:
                            break;
                    }
                });

            self.$landing.frameworkStartIcons
                .removeClass("active")
                .addClass("inactive");

            self.$landing.frameworkStartIcons
                .filter(function () { return $(this).attr("data-framework") === frameworkName; })
                .removeClass("inactive")
                .addClass("active");

            return self;
        };

        /**
         * Show the "editor", or the content behind that landing page, then detach the landing page
         * @param  {function} done A callback for completion
         * @return {object<Soda>} The current Soda instance
         */
        this.showEditor = function (done) {
            self.$editor.self
                .show()
                .detach()
                .appendTo($wrapper)
                .promise()
                .done(function () {
                    $(window).trigger("resize");
                    self.screen.hideLoading();

                    /**
                     * Emitted when the visual editor is shown (the landing and loading pages have been hidden)
                     * @event window.SodaNamespace#SodaVisualEditor#editor shown
                     * @argument {Error} err An error, if one is present
                     * @argument {SodaVisualEditor} The current SodaVisualEditor instance
                     */
                    self.emit("editor shown", null, self);
                    if(done instanceof Function) done.call(self);

                    self.$landing.self.slideUp({
                        duration : SodaSettings.SLIDEUP_SPEED,
                        easing   : "easeOutBounce",
                        always   : function () {
                            self.$landing.self.detach();
                            $loading.detach();
                        }
                    });
                });

            /**
             * Emitted when the visual editor has been triggered to be shown (but before the animation is complete)
             * @event window.SodaNamespace#SodaVisualEditor#editor showing
             * @argument {SodaVisualEditor} The current SodaVisualEditor instance
             */
            self.emit("editor showing", self);
            return self;
        };

        /**
         * Hide the "editor", or the content behind that landing page, then detach the landing page
         * @param  {function} done A callback for completion
         * @return {object<Soda>} The current Soda instance
         */
        this.hideEditor = function (done) {
            self.$editor.self
                .fadeOut({
                    duration : SodaSettings.FADEOUT_SPEED,
                    always   : function () {
                        self.$editor.self.detach();
                        if(done instanceof Function) done.call(self);
                    }
                });

            return self;
        };

        /**
         * Show the landing page, then detach the editor elements
         * @param  {function} done A callback for completion
         * @return {object<Soda>} The current Soda instance
         */
        this.showLanding = function (done) {
            self.$landing.self
                .detach()
                .prependTo($wrapper)
                .hide()
                .slideDown({
                    duration : SodaSettings.SLIDEUP_SPEED,
                    easing   : "easeOutBounce",
                    always   : function () {
                        self.$editor.self.detach();
                        if($("#soda-landing").hasClass("mCustomScrollbar")) {
                            $("#soda-landing").mCustomScrollbar("update");
                        }
                        else {
                            $("#soda-landing").mCustomScrollbar(SodaSettings.SCROLL_OPTIONS);
                        }

                        if(done instanceof Function) done.call(self);
                    }
                });
            return self;
        };

        /**
         * Hide the landing page
         * @param  {function} done A callback for completion
         * @return {object<Soda>} The current Soda instance
         */
        this.hideLanding = function (done) {
            self.$landing.self
                .detach()
                .fadeOut({
                    duration : SodaSettings.FADEOUT_SPEED,
                    done     : function () {
                        self.$landing.self.detach();
                        if(done instanceof Function) done.call(self);
                    }
                });
            return self;
        };

        /**
         * Send a request to the socket server
         * @param  {string} command The name of a command for the server to execute
         * @param  {object=} data Data for the command
         * @param  {Function} onResponse A callback for when the response is received
         * @return {object<Soda>} The current Soda instance
         */
        this.send = function (command, data, onResponse) {
            var rid = rids++, timeout;

            if(!onResponse && data instanceof Function) {
                onResponse = data;
                data       = undefined;
            }

            socket.once("response " + rid, function (response) {
                clearTimeout(timeout);
                if(response.error) {
                    console.error("Server Error:", response.error);
                    if(onResponse instanceof Function) onResponse.call(response, new Error("Server responded with error: " + (response.data.message || response.error), null));
                }
                else {
                    if(onResponse instanceof Function) onResponse.call(response, null, response.data);
                }
            });

            if(onResponse instanceof Function) { // Only set a timeout if a response is expected
                timeout = setTimeout(function () {
                    socket.removeListener("response " + rid);
                    onResponse(new Error("Request timed out"), null);
                }, SodaSettings.RESPONSE_TIMEOUT);
            }

            socket.emit("request", {
                rid     : rid,
                command : command,
                data    : data
            });

            return self;
        };

        /**
         * Add a "pipe" or function that will execute on server stdout messages
         * @param {function} onOutput The function to execute when the server emits stdout
         * @return {object<Soda>} The current Soda instance
         */
        this.addOutputPipe = function (onOutput) {
            socket.on("stdout", onOutput);
            return self;
        };

        /**
         * Remove a previously added stdout pipe
         * @param  {function} onOutput The listener that was added by Soda.addOutputPipe previously
         * @return {object<Soda>} The current Soda instance
         */
        this.removeOutputPipe = function (onOutput) {
            if(onOutput && onOutput instanceof Function)
                socket.removeListener("stdout", onOutput);

            return self;
        };

        /**
         * Hide and remove the startup options from the landing page
         * @param  {Function} done A callback for completion
         * @return {object<Soda>} The current Soda instance
         */
        this.removeStartupOptions = function (done) {
            self.disableFrameworkSelectButtons();
            self.$landing.frameworkOptionsWrapper
                .fadeOut({
                    duration : SodaSettings.FADEOUT_SPEED,
                    always   : function () {
                        self.$landing.frameworkOptionsWrapper = self.$landing.frameworkOptionsWrapper.detach();
                        if(done instanceof Function) done.call(self);
                    }
                });
            return self;
        };

        /**
         * Re-attach and fade in the startup options on the landing page
         * @param  {Function} done A callback for completion
         * @return {object<Soda>} The current Soda instance
         */
        this.showStartupOptions = function (done) {
            self.removeStartupStatus(function () {
                self.$landing.frameworkOptionsWrapper = self.$landing.frameworkOptionsWrapper.detach();
                self.$landing.frameworkOptionsWrapper = self.$landing.frameworkOptionsWrapper.appendTo(self.$landing.start);

                self.$landing.frameworkOptionsWrapper
                    .fadeIn({
                        duration : SodaSettings.FADEIN_SPEED,
                        always : function () {
                            self.$landing.frameworkStartOptionForms.mCustomScrollbar("scrollTo", "top", { scrollInertia: 500 });
                            self.enableFrameworkSelectButtons();
                            if(done instanceof Function) done.call(self);
                        }
                    });
            });
            return self;
        };

        /**
         * Hide and remove the startup status from the landing page
         * @param  {Function} done A callback for completion
         * @return {object<Soda>} The current Soda instance
         */
        this.removeStartupStatus = function (done) {
            self.$landing.startupStatus
                .fadeOut({
                    duration : SodaSettings.FADEOUT_SPEED,
                    always   : function () {
                        self.$landing.startupStatus = self.$landing.startupStatus.detach();
                        if(done instanceof Function) done.call(self);
                    }
                });
            return self;
        };

        /**
         * Re-attach and fade in the startup status to the landing page
         * @param  {Function} done A callback for completion
         * @return {object<Soda>} The current Soda instance
         */
        this.showStartupStatus = function (done) {
            self.removeStartupOptions(function () {
                self.$landing.startupStatus = self.$landing.startupStatus.appendTo(self.$landing.content);
                self.$landing.startupStatus
                    .fadeIn({
                        duration : SodaSettings.FADEIN_SPEED,
                        always   : function () {
                            if(done instanceof Function) done.call(self);
                        }
                    });
            });
            return self;
        };

        /**
         * Initalize the currently started framework
         * @param  {object} data Data from the server
         * @param  {function=} onResponse A callback for completion
         * @return {object<Soda>} The current Soda instance
         */
        function initFramework (data, onResponse) {
            self.framework.init(data);
            console.log("Soda: Framework `" + self.framework.name + "` started");

            /**
             * Emitted one the framework has been initialized, and the back-end has signaled that the framework is up and running
             * @event window.SodaNamespace#SodaVisualEditor#framework initialized
             * @argument {SodaFramework} The framework (SodaFramework) instance
             */
            self.emit("framework initialized", self.framework);

            self.framework.on("ready", function (err) {
                if(err) {
                    self.removeOutputPipe(startupPipe);

                    /**
                     * Emitted when there was an error starting up the framework
                     * @event window.SodaNamespace#SodaVisualEditor#framework startup error
                     * @argument {Error=} err An Error object
                     */

                    self.emit("framework startup error", err);
                    $("#soda-loading-message").html(err.message);
                    return startupPipe(['<span class="soda-stdout error">' + err.message + '</span>']);
                }

                /**
                 * Emitted one the framework has been initialized, the back-end has signaled that the framework is up and running, and the
                 * front-end SodaFramework instance has initialized all it's objects.
                 * @event window.SodaNamespace#SodaVisualEditor#framework started
                 * @argument {Error=} An error, if one is present
                 * @argument {SodaFramework} The framework (SodaFramework) instance
                 */
                self.emit("framework started", null, self.framework);

                // Set the framework information on the right status
                self.editor.setStatus({
                    which   : "right",
                    icon    : "fa-bolt",
                    message : self.framework.name + " v" + self.framework.version + " | " + self.framework.platform + " | " + self.framework.device
                });

                // Pipe output to the center status, if the editor is visible
                self.addOutputPipe(function centerStatusPipe (messages) {
                    if(self.$editor.self.is(":visible")) {
                            self.editor.setStatus({
                            which   : "center",
                            icon    : "none",
                            message : messages.join(", ")
                        });
                    }
                });

                setTimeout(function () {
                    self.removeOutputPipe(startupPipeAttached);
                    self.removeOutputPipe(startupPipe);

                    self.screen.set(self.framework.latestScreen, function () {
                        self.tree.build(self.framework.latestTree);
                        $('.fa-tree').click();
                        $('.fa-compass').click();
                    });

                    self.showEditor();
                }, 800);
                if(onResponse instanceof Function) onResponse.call(self, self.framework);
            });
            return self;
        }

        this.lastStartupSettings = null;

        /**
         * Start a framework
         * @param  {SodaStartupSetting} startupSettings A SodaStartupSetting object
         * @param  {function=} done A callback for completion
         * @return {object<Soda>} The current Soda instance
         */
        this.startFrameworkWithSettings = function (startupSettings, onResponse) {
            self.addOutputPipe(startupPipe);
            $("#soda-startup-stauts-framework-name").html(startupSettings.framework.titleCase);

            var restOfMethod = function() {
                self.send("start framework", startupSettings, function (err, data) {
                    if(err) {
                        self.removeOutputPipe(startupPipe);
                        self.emit("framework startup error", err);
                        return startupPipe(['<span class="soda-stdout error">' + err.message + '</span>']);
                    }
                    else {
                        self.lastStartupSettings = startupSettings;
                        initFramework(data, onResponse);
                    }
                });
            };

            self.showStartupStatus(function () {
                var pathToApp = null;
                
                if (startupSettings.framework.toLowerCase() === "instruments") {
                    pathToApp = startupSettings.apppath;

                    self.send("any directory exists", pathToApp, function (err, exists) {
                        if(err) return startupPipe(err.message);

                        if(!exists) {
                            console.log("The " + startupSettings.platform + " app for " + startupSettings.device + " on path " + pathToApp + " needs to be built for workspace " + startupSettings.workspace + ".");

                            self.send("base path", pathToApp, function (err, path) {
                                if(err) return startupPipe(err.message);

                                self.send("prebuild", [startupSettings.env, startupSettings.framework.toLowerCase(), startupSettings.device, startupSettings.target, startupSettings.workspace, startupSettings.buildpath, pathToApp, startupSettings.bundleid, startupSettings.device], function (err, built) {
                                    if(err) return startupPipe(err.message);

                                    if(!built) {
                                        self.removeOutputPipe(startupPipe);
                                        self.emit("framework startup error", err);
                                        return startupPipe(['<span class="soda-stdout error">' + err.message + '</span>']);
                                    }
                                    else {
                                        return restOfMethod();
                                    }
                                });
                            });
                        }
                        else {
                            return restOfMethod();
                        }
                    });
                }
                else if (startupSettings.framework.toLowerCase() === "perfecto") {
                  pathToApp = startupSettings.apppath ? startupSettings.apppath : startupSettings.target;

                  self.send("any directory exists", pathToApp, function (err, exists) {
                      if(err) return startupPipe(err.message);

                      if(!exists) {
                          console.log("The " + startupSettings.platform + " app for " + startupSettings.device + " on path " + pathToApp + " needs to be built for workspace " + startupSettings.workspace + ".");

                          self.send("base path", pathToApp, function (err, path) {
                              if(err) return startupPipe(err.message);

                              self.send("prebuild", [startupSettings.env, startupSettings.framework.toLowerCase(), startupSettings.deviceid, startupSettings.target, startupSettings.workspace, startupSettings.buildpath, startupSettings.app], function (err, built) {
                                  if(err) return startupPipe(err.message);

                                  if(!built) {
                                      self.removeOutputPipe(startupPipe);
                                      self.emit("framework startup error", err);
                                      return startupPipe(['<span class="soda-stdout error">' + err.message + '</span>']);
                                  }
                                  else {
                                      return restOfMethod();
                                  }
                              });
                          });
                      }
                      else {
                          return restOfMethod();
                      }
                  });
                }
                else {
                    return restOfMethod();
                }
            });
            return self;
        };

        /**
         * Restart the current framework
         * @return {object<Soda>} The current Soda instance
         */
        this.restartFramework = function (resetDevice, afterStop, afterStart) {
            self.stopFramework(function () {
                if(afterStop instanceof Function) afterStop.call(self);
                if(resetDevice) {
                    if(typeof self.lastStartupSettings.options === "object") {
                        self.lastStartupSettings.options.resetDevice = true;
                    }
                    else {
                        self.lastStartupSettings.options = { resetDevice: true };
                    }
                }
                self.startFrameworkWithSettings(self.lastStartupSettings, function () {
                    self.lastStartupSettings.options.resetDevice = false;
                    if(afterStart instanceof Function) afterStart.call(self);
                });
            });
            return self;
        };

        /**
         * Refresh the Tree and Screen image
         * @return {Soda} The current Soda instance
         */
        this.refreshDOM = function (done) {
            self.editor.setStatus({
                which   : "left",
                message : "Refreshing DOM tree and screen<span class=\"dot-dot-dot\">...</span>",
                icon    : "fa-tree"
            });

            // Kill anything currently in the stash
            self.delegates.stashed = [];

            self.screen.showLoading();

            self.framework.getTree(function (err, treeObject) {
                if(err) return console.error(err);

                self.framework.getScreenShot(function (err, screenObject) {
                    if(err) return console.error(err);

                    self.screen.set(screenObject);
                    self.tree.build(treeObject, function () {
                        self.screen.hideLoading();
                        self.editor.setStatus({
                            which   : "left",
                            message : "DOM tree and screen refreshed successfully!",
                            icon    : "fa-tree"
                        });
                    });
                    $(window).trigger('resize');  // adjusts screen element dimensions and positions to account for scrolling and window size changes
                    if(done instanceof Function) done.call(self);
                });
            });
        };

        /**
         * Stop the running framework
         * @param  {function=} onResponse A callback for completion
         * @return {object<Soda>} The current Soda instance
         */
        this.stopFramework = function (onResponse) {
            self.screen.showLoading();
            self.send("stop framework", function () {
                self
                    .showLanding()
                    .showStartupOptions(function () {
                        if(onResponse instanceof Function) onResponse.apply(self, arguments);

                        /**
                         * Emitted once the framework has stopped, and the server has completed it's stop request
                         * @event window.SodaNamespace#SodaVisualEditor#framework stopped
                         */
                        self.emit("framework stopped");
                    });
            });
        };

        socket.on("framework died", function () {
            self.emit("framework stopped");
            console.log("The current framework (" + self.framework.name + ") has shutdown unexpectedly.");
            self.showStartupOptions().showLanding();
        });

        /**
         * Show the "loading" screen
         * @param  {string} message The message to show on the loading screen
         * @param  {string} icon The icon to display on the loading screen
         * @param  {Function} done A callback for completion
         * @return {object<Soda>} The current Soda instance
         */
        this.showLoading = function (message, icon, done) {
            if(!done && icon instanceof Function) {
                done    = message;
                icon    = undefined;
            }

            $loading.prependTo($wrapper);
            if(icon) message = '<em class="fa ' + icon + ' inline"></em>' + message;
            $loadingMessage.html(message);

            if(self.$landing.self) {
                self.hideEditor(function () {
                    self.hideLanding(function () {
                        self.removeStartupStatus(function () {
                            if(done instanceof Function) done.call(self);
                        });
                    });
                });
            }
            return self;
        };

        /**
         * Shutdown the server
         * @return {object<Soda>} The current Soda instance
         */
        this.shutdown = function () {
            self.showLoading("Application closed successfully", "fa-check-circle", function () {
                exitStatus = 0;
                self.send("shutdown");
            });
        };

        /**
         * Kill the current Soda instance immediately
         * @return {object<Soda>} The current Soda instance
         */
        this.kill = function () {
            self.showLoading("Application closed successfully", "fa-check-circle", function () {
                exitStatus = 0;
                self.send("kill");
            });
        };

        function getAvailableDevices () {
            var frameworks = [];

            self.send("get config", function(err, config) {
              if (config && config.perfectoUser) {
                frameworks = ["instruments", "automator", "perfecto", "selenium", "puppeteer", "windows"];
              }
              else {
                frameworks = ["instruments", "automator", "selenium", "puppeteer", "windows"];
              }

              for(var i = 0; i < frameworks.length; i++) {
                  self.send("get available devices", frameworks[i], function (err, devices) {
                      if(!err) {
                          var platformDropdown = self.$landing.self.find("#" + this + "-options select[name='platform'] option:selected").val();
                          var deviceDropdown = self.$landing.self.find("#" + this + "-options select[name='device']");
                          deviceDropdown.empty();
                          if(devices instanceof Array && devices.length > 0) {
                              for(var n = 0; n < devices.length; n++) {
                                  if (devices[n] instanceof Object) {
                                      if (platformDropdown.toLowerCase() === 'iphone' || platformDropdown.toLowerCase() === 'ipad') {
                                          if (devices[n].runtime.toLowerCase().indexOf(platformDropdown.toLowerCase()) >= 0) {
                                              $('<option value="' + devices[n].name + ' - ' + devices[n].os + ' - ' + devices[n].osVersion + ' - ' + devices[n].udid + '">' + devices[n].name + ' - ' + devices[n].os + ' - ' + devices[n].osVersion + ' - ' + devices[n].udid + '</option>').appendTo(deviceDropdown);
                                          }
                                      }
                                      else {
                                        if (devices[n].runtime.toLowerCase().indexOf("iphone") < 0 && devices[n].runtime.toLowerCase().indexOf("ipad") < 0) {
                                            $('<option value="' + devices[n].name + ' - ' + devices[n].os + ' - ' + devices[n].osVersion + ' - ' + devices[n].udid + '">' + devices[n].name + ' - ' + devices[n].os + ' - ' + devices[n].osVersion + ' - ' + devices[n].udid + '</option>').appendTo(deviceDropdown);
                                        }
                                      }
                                  }
                                  else
                                  {
                                      $('<option value="' + devices[n] + '">' + devices[n].ucFirst + '</option>').appendTo(deviceDropdown);
                                  }
                              }

                              if (devices[0] instanceof Object) {
                                self.$landing.self.find("#" + this + "-options select[name='platform'] input[name='deviceid']").val(devices[0].udid);
                                self.$landing.self.find("#" + this + "-options select[name='platform'] input[name='device']").val(devices[0].name + ' - ' + devices[0].os + ' - ' + devices[0].osVersion + ' - ' + devices[0].udid);
                                self.$landing.self.find("#" + this + "-options select[name='platform'] input[name='device']").change();
                              }
                          }
                      }
                  }.bind(frameworks[i]));
              }
            });
        }

        ////////////////////////////////////////////////// CONSTRUCTOR /////////////////////////////////////////////////

        // Setup the dot-dot-dot elements
        var dotDotDot = ".";

        setInterval(function () {
            $(".dot-dot-dot").text(dotDotDot);
            dotDotDot += ".";
            if(dotDotDot.length > 3) dotDotDot = "";
        }, 500);


        // Set timeout on socket connection
        connectionTimeout = setTimeout(function () {
            $loadingMessage.text("Error: Unable to connect to server.");
            socket.destroy();
        }, SodaSettings.CONNECTION_TIMEOUT);

        var hasLoaded = false;
        socket.on("connect", function () {
            console.log('CONNECT', new Error().stack);
            exitStatus = -1;

            // A hacky way to re-set everything, as the following wasn't thought out well :(
            // if(hasLoaded === true) location.reload();

            console.log("Soda: Socket server connected...");
            clearTimeout(connectionTimeout);

            // Load all Soda dependencies via AJAX
            self.loadDependencies(function (err) {
                if(err) {
                    console.error("Soda: Dependency loading failed", err);
                    $loadingMessage.html(err.message);
                }
                else {
                    console.log("Soda: Dependencies successfully loaded");

                    setTimeout(function () {
                        getAvailableDevices();
                        self.send("get status", function (err, status) {
                            if (err) return $loadingMessage.html(err.message);

                            // Framework has already been started by attached soda process, setup and show editor
                            if (status.started === true) {
                                console.log("Soda instance was attached. Starting with framework: ", status);
                                self.addOutputPipe(startupPipeAttached);
                                self.lastStartupSettings = new SodaStartupSetting(status.name, status.testPath, status.testResultsPath, status.device, status.deviceid, status.args[1], status.platform, null, null, null, status.env, {});

                                initFramework(status);

                                // Load settings, in case the framework is shutdown
                                self.send("get settings", function (err, data) {
                                    if (err) console.error(err);
                                    settings = data;
                                });

                                // Load favorites, in case the framework is shutdown
                                self.send("get favorites", function (err, data) {
                                    if (err) console.error(err);
                                    favorites = data;
                                    self.enableFrameworkSelectButtons()
                                        .loadFavorites()
                                        .showStartupFormFor(favorites.length > 0 ? "favorites" : "automator");
                                });
                            }
                                // Framework hasn't been started, get the user's favorites and show the startup landing page
                            else {
                                self.send("get settings", function (err, data) {
                                    if (err) return $loadingMessage.html(err.message);
                                    settings = data;
                                });

                                self.send("get favorites", function (err, data) {
                                    if (err) return $loadingMessage.html(err.message);
                                    favorites = data;
                                    self.enableFrameworkSelectButtons();
                                    setTimeout(function () {
                                        self
                                            .showLanding(function () { $loading.detach(); })                        // Show the landing page
                                            .loadFavorites()                                                        // Load the favorites
                                            .showStartupFormFor(favorites.length > 0 ? "favorites" : "automator");  // Show the startup form for the favorites, if any exist or automator, by default

                                        // Setup custom scroll bars for the following elements...
                                        self.$landing.frameworkStartOptionForms.mCustomScrollbar(SodaSettings.SCROLL_OPTIONS);
                                    }, 800);
                                });
                            }
                        });
                    }, 2000);
                }
            });
        });

        // If the server disconnects without a proper exit status, show an error message
        socket.on("disconnect", function () {
            console.log('DISCONNECTED Socket');
            if(exitStatus === -1) {
                exitStatus = 1;
                self.showLoading("Server has disconnected unexpectedly...", "fa-warning");
            }

            socket.removeAllListeners();
            window.location.reload();
        });

        socket.on("asset load", function () {
            var suite = self.$editor.self.find(".editor-suite").val();
            var module = self.$editor.self.find(".editor-module").val();
            console.log("Asset reload with current suite " + suite + " and module " + module + "!");
            self.framework.getHierarchy();

            setTimeout(function() {
              self.$editor.self.find(".editor-suite").val(suite);
              self.$editor.self.find(".editor-module").val(module);
            }, 100);
        });

        // If the framework encounters an error starting up, show the "back" button
        self.on("framework startup error", function () {
            self.$landing.startupStatus.children("h2").html("Framework Startup Failure");
            self.$landing.startupErrorButton = self.$landing.startupErrorButton
                .detach()
                .prependTo(self.$landing.startupStatus.children("h2"))
                .click(startupFailureClick);

            self.$landing.startupErrorButton.fadeIn(SodaSettings.FADEIN_SPEED);
        });

        // If we don't do this we get bad memory-leaks when the page is refreshed,
        // since the socket will assume a new connection and create a new server-side
        // Soda instance!
        $(window).on("unload", function () {
            socket.emit("disconnect");
        });

        self.once("editor shown", function () {
            $('[data-toggle="tooltip"]').tooltip();
        });

        self.once("editor shown", function () {
            var editors  = ["ace-editor-for-test", "ace-editor-for-action", "ace-editor-for-screen", "ace-editor-for-menu", "ace-editor-for-popup"],
                JSONMode = ace.require("ace/mode/json").Mode;

            editors.forEach(function (e) {
                var editor = self.testEditor.aceEditors[e.split("-")[3]] = ace.edit(e);
                editor.setTheme("ace/theme/onedark");
                editor.session.setMode(new JSONMode());
                editor.setShowPrintMargin(false);
                editor.getSession().setUseSoftTabs(true);
                editor.getSession().setUseWrapMode(true);
                editor.$blockScrolling = Infinity;
                editor.setOptions({
                    maxLines: Infinity
                });
                editor.getSession().on('change', function(e) {
                    var end = editor.session.getLength();
                    if(e.end.row === end - 1) {
                        $("#soda-toolbox-wrapper-left").mCustomScrollbar("scrollTo", "bottom", {
                            scrollInertia: 0,
                            scrollEasing: "linear"
                        });
                    }
                });

                var typeMatch = function (line) {
                    var type = null;

                    if(line) {
                        var m = line.match(/^ *"(type)" *: *"(.*)" *(?:, *)?$/);
                        if(m instanceof Array && typeof m[1] === "string" && typeof m[2] === "string") {
                            var colonpos = line.lastIndexOf(":"),
                                mpos     = line.indexOf(m[2]);

                            if(mpos > colonpos) type = m[2];
                        }
                    }
                    return type;
                };

                editor.commands.addCommand({
                    name: "actionlookup",
                    exec: function () {
                        setTimeout(function () {
                            var token      = editor.session.getTextRange(editor.getSelectionRange()),
                                line       = editor.session.getLine(editor.getSelectionRange().start.row),
                                lineBefore = editor.session.getLine(editor.getSelectionRange().start.row + 1),
                                lineAfter  = editor.session.getLine(editor.getSelectionRange().start.row - 1),
                                asset, realAsset = null, type = null;

                            var m = line.match(/^ *"(execute|validate|executeWidget)" *: *"(.*)" *(?:, *)?$/);
                            if(m instanceof Array && typeof m[1] === "string" && typeof m[2] === "string") {
                                var colonpos = line.lastIndexOf(":"),
                                    mpos     = line.indexOf(token);

                                if(mpos > colonpos && m[2] === token) {
                                    asset = token;

                                    type = typeMatch(lineBefore) || typeMatch(lineAfter) || ((m[1] === "execute") ? "action" : "screen");

                                    if(m[1] === "execute" || m[1] === "executeWidget") {
                                        switch(type) {
                                            case "action":
                                            case "test":
                                                realAsset = {
                                                    name     : asset,
                                                    type     : type,
                                                    suite    : $("#test-editor-" + self.testEditor.$currentList.attr("data-type") + "-wrapper .editor-suite").val(),
                                                    module   : $("#test-editor-" + self.testEditor.$currentList.attr("data-type") + "-wrapper .editor-module").val(),
                                                    platform : self.framework.platform,
                                                    accept   : { global: true, common: true, generic: true }
                                                };
                                                break;
                                            default:
                                                break;
                                        }
                                    }
                                    else {
                                        switch(type) {
                                            case "screen":
                                            case "menu":
                                            case "popup":
                                                realAsset = {
                                                    name     : asset,
                                                    type     : type,
                                                    suite    : $("#test-editor-" + self.testEditor.$currentList.attr("data-type") + "-wrapper .editor-suite").val(),
                                                    module   : $("#test-editor-" + self.testEditor.$currentList.attr("data-type") + "-wrapper .editor-module").val(),
                                                    platform : self.framework.platform,
                                                    accept   : { global: true, common: true, generic: true }
                                                };
                                                break;
                                            default:
                                                break;
                                        }
                                    }
                                }
                            }

                            if(realAsset) {
                                self.send("asset exists", realAsset, function (err, exists) {
                                    if(!err && exists) {
                                        self.editor.setContext({
                                            header    : "Load " + realAsset.type + " " + realAsset.name + "?",
                                            okayText  : "Okay",
                                            cancelText: "No, please don't",
                                            body      : "<p>Would you like to load the " + realAsset.type + " named <span class=\"bold\">" + realAsset.name + "</span> from the suite <span class=\"bold\">" + realAsset.suite + "</span> and the module <span class=\"bold\">" + realAsset.module + "</span>?</p><p class=\"bold\" style=\"color: #BF2828;\">Make sure you've saved all changes to the current file!</p>",
                                            onOkay: function () {
                                                self.testEditor.loadAssetIntoEditor(realAsset);
                                            }
                                        });
                                    }
                                    else if(!exists) {
                                        self.editor.setStatus({
                                            which   : "left",
                                            icon    : "fa-warning",
                                            message : type.ucFirst + " <span class=\"bold\">" + realAsset.name + "</span> not found!",
                                            duration: 2
                                        });
                                    }
                                    else {
                                        self.editor.setStatus({
                                            which   : "left",
                                            icon    : "fa-warning",
                                            message : "Unable to retrieve assets at this time, try again later...",
                                            duration: 2
                                        });
                                    }
                                });
                            }
                        }, 100);
                    },
                    bindKey: {mac: "cmd-f", win: "ctrl-f"}
                });
            });
        });
    };

    // Attach helper classes to Soda as static methods for outside reference

    /**
     * @type {SodaDependency}
     */
    SodaVisualEditor.Dependency = SodaDependency;

    /**
     * @type {SodaStartupSetting}
     */
    SodaVisualEditor.StartupSetting = SodaStartupSetting;

    /**
     * @type {SodaFramework}
     */
    SodaVisualEditor.Framework = SodaFramework;

    /**
     * @type {SodaEmitter}
     */
    SodaVisualEditor.Emitter = SodaEmitter;

    return SodaVisualEditor;

}());

///////////////////////////////////////////////////////// MAIN /////////////////////////////////////////////////////////

$(function VisualEditorUIMain () {
    window.Soda = new window.SodaNamespace();
});
