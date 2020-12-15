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
 * @module SodaCommon/Config
 * @description A configuration class with basic CRUD operations for setting/getting global configuration
 */

var path         = require("path"),
    util         = require("util"),
    EventEmitter = require("events").EventEmitter,
    root         = path.resolve(path.join(__dirname, "..")),
    os           = require("os"),
    userHome     = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'],

/**
 * Manages configuration and global variable for each seperate Soda intance
 * @constructor
 * @augments EventEmitter
 */
SodaConfig = function () {
    var self = this,

        /**
         * The configuration settings dictionary
         * @type {Object}
         */
        configuration = {

            /**
             * The root dir of Soda
             * @type {String}
             */
            root: root,

            /**
             * Android SDK Path
             * This value must be either a hard coded string pointing to the absolute path of your Android SDK,
             * Use path.join() to resolve paths in a platform agnostic way...
             */
            androidSDKPath: path.join(userHome, 'Library', 'Android', 'sdk'),

            /**
             * Android Build Tools Path
             * This value must be either a hard coded string pointing to the absolute path of your Android Build Tools,
             * Use path.join() to resolve paths in a platform agnostic way...
             */
            androidBuildToolsPath: path.join(userHome, 'Library', 'Android', 'sdk', "build-tools", process.env.ANDROID_SDK_VERSION ? process.env.ANDROID_SDK_VERSION : "28.0.3"),

            /**
             * The path to the Soda core directory
             * @type {String}
             */
            core: path.join(root, "SodaCore"),

            /**
             * The default environment variable
             * @type {String}
             */
            env: "env",

            /**
             * Take a screenshot every tree update
             * @type {String}
             */
            SSOnDOM: false,

            /**
             * An object that contains tree hashes
             * @type {Object}
             */
            treeHashes: {},

            /**
             * Take a screenshot every tree update
             * @type {String}
             */
            SSOnDOMDir: path.join(userHome, "AppScreenShots"),

            /**
             * The default proxy URL
             * @type {String}
             */
            proxy: process.env.HTTP_PROXY ? process.env.HTTP_PROXY : process.env.http_proxy,


            /**
             * The default headless mode for selenium
             * @type {String}
             */
            headless: false,

            /**
             * The default performance log enablement for selenium
             * @type {String}
             */
            perflog: false,

            /**
             * The default root for Soda Tree
             * @type {String}
             */
            sodaRootId: "soda-uid-root",

            /**
             * The user home directory
             * @type {String}
             */
            userHome: userHome,

            /**
             * The current user's username
             * @type {String}
             */
            userName: (os.platform() === "win32" || os.platform() === "win64" ? userHome.slice(9) : userHome.slice(7)),

            /**
             * The Soda temp directory
             * @type {String}
             */
            temp: path.join(os.tmpdir(), ".sodatemp"),

            /**
             * The time to wait for screenshot
             * @type {number}
             */
            timeToWaitForScreenShot: 100,

			      /**
             * The selenium chrome server ip and path
             * @type {String}
             */
            seleniumChromeServer: 'http://localhost:9515/',

            /**
      			 * The selenium server ip and path
      			 * @type {String}
      			 */
            seleniumIEServer: 'http://localhost:9515/',

            /**
             * The command used when Soda was started
             * @type {String}
             */
            command: "run",

            /**
             * The port to start the VisualEditor on
             * @type {Number}
             * @deprecated
             */
            port: 1337,

            /**
             * The Soda process id
             * @type {Number}
             */
            pid: process.pid,

            /**
             * The name of the currently running framework
             * @type {String}
             */
            framework: "",

            /**
             * For OSX if this is true, Soda will announce test results/states
             * @type {String}
             */
            say: false,

            /**
             * If true, doesn't log results to results.json (see below)
             * @type {String}
             */
            devMode: false,

            /**
             * The maximum folder scan depth for walking the project folder
             * @type {String}
             */
            maxFileScanDepth: 4,

            /**
             * The default syntax name
             * @type {String}
             */
            defaultSyntaxName: "web",

            /**
             * The default syntax version
             * @type {String}
             */
            defaultSyntaxVersion: "1.0",

            /**
             * Ignores scanning the following directories for assets. Relative to the testPath root
             * @type {Array}
             */
            ignoreTestDirectories: [
                ".git",
                "test-results",
                "test-results-editor",
            ],

            /**
             * If true, traces interactions during test runs and reports them along with results
             * @type {Boolean}
             */
            traceInteractions: true,

            /**
             * Path to where to save the test results
             * The following tokens (e.g. wrapped in brackets) will be replaced: type, host, platform, yyyymmdd.
             * @type {String}
             */
            resultsJSON: path.join("[test_path]", "[test_results_dir]", "[type]_results_[host]_[platform]_[yyyymmdd].json"),

            /**
             * Path to where to save the failure screenshot
             * The following tokens (e.g. wrapped in brackets) will be replaced: fid (the failure id), reason (the failure reason).
             * @type {String}
             */
            resultsScreenshot: path.join("[test_path]", "[test_results_dir]", "failures", "failure_[fid]_[reason].png"),

            /**
             * Path to where to save the tree
             * The following tokens (e.g. wrapped in brackets) will be replaced: fid (the failure id), reason (the failure reason).
             * @type {String}
             */
            treeScreenshot: path.join("[test_path]", "[test_results_dir]", "traces", "tree_[host]_[yyyymmdd]_[now].json"),

            /**
             * Path to where to save the junit results
             * The following tokens (e.g. wrapped in brackets) will be replaced: fid (the failure id), reason (the failure reason).
             * @type {String}
             */
            resultsJunit: path.join("[test_path]", "[test_results_dir]", "results", "output_junit.xml"),

            /**
             * Path to where to save the html result
             * The following tokens (e.g. wrapped in brackets) will be replaced: fid (the failure id), reason (the failure reason).
             * @type {String}
             */
            resultsHTML: path.join("[test_path]", "[test_results_dir]", "results", "output_[type].html"),

            /**
             * Path to where to save trace files
             * The following tokens (e.g. wrapped in brackets) will be replaced: fid (the failure id), reason (the failure reason).
             * @type {String}
             */
            resultsTrace: path.join("[test_path]", "[test_results_dir]", "traces", "trace_[host]_[yyyymmdd]_[now].json"),

            /**
             * The path to the test scripts (project path)
             * @type {String}
             */
            testPath: process.cwd(),


            /**
             * The path to the test results (home by default)
             * @type {String}
             */
            testResultsPath: process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'],

            /**
             * The name of the test results dir
             * @type {String}
             */
            testResultsDir: "test-results",

            /**
             * The name of the soda user
             * @type {String}
             */
            sodauser: "devsoda",

            /**
             * Where to save visualeditor favorites
             * @type {String}
             */
            veUserFavorites: path.join(userHome, "sodaFavorites.json"),

            /**
             * Where to save visualeditor settings
             * @type {String}
             */
            veUserSettings: path.join(userHome, "sodaSettings.json"),

            /**
             * If true, allows you to pause, stop, skip through, and continue running tests. If false a test will run to completion or failure
             * without interruption
             * @type {Boolean}
             */
            interactiveMode: true,

            /**
             * If true, will stop testing if an unrecognized (undefined) action is encountered.
             * @type {Boolean}
             */
            stopOnOrphanedAction: true,

            /**
             * If true stops modules and suites on failure, if false continues to the next test on failure
             * @type {Boolean}
             */
            stopOnFailure: false,

            /**
             * If true an email is sent after a single test run is complete
             * @type {Boolean}
             */
            sendTestResults: false,

            /**
             * If true an email is sent after a module run is complete
             * @type {Boolean}
             */
            sendModuleResults: true,

            /**
             * If true an email is sent after a suite run is complete
             * @type {Boolean}
             */
            sendSuiteResults: true,

            /**
             * If true, a screenshot will be taken on failure
             * @type {Boolean}
             */
            takeScreenshotOnFailure: true,

            /**
             * If true, results will be written to file on failure
             * @type {Boolean}
             */
            reportJSON: true,

            /**
             * The number of times to grab the tree and look for an element, when an element isn't found in the DOM
             * @type {Boolean}
             */
            findElementRetries: 3,

            /**
             * Whether or not testing is in progress
             * @type {Boolean}
             */
            testingInProgress: false,

            /**
             * The maxiumum buffer size for child_process.exec
             * @type {Boolean}
             */
            maxBuffer: 2048 * 512,

            /**
             * The default variable format (how to determine variables in actions), can be overwritten by the framework
             * @type {RegExp}
             */
            defaultVariableFormat: /(\$\{\s*([_a-zA-Z0-9\-](?:\.?[_a-zA-Z0-9\-])*)\s*})/g,

            /**
             * The default callback for when a variable is found, can be overwritten by the framework
             * @type {RegExp}
             */
            defaultVariableMatch: function (vars, m, item) {
                if(m[1] && m[2] !== undefined) {
                    var val = vars.get(m[2]);
                    return item.replace(m[1], (val !== undefined && val !== null) ? val : "(null)");
                }
                return "(null)";
            },

            /**
             * Whether or not selenium should start maximized
             * @type {Boolean}
             */
            startMaximized: false,

            /**
             * Whether or not selenium chrome should start incognito
             * @type {Boolean}
             */
            incognito: false,

            /**
             * Console options for the SodaCommon/Console module
             * @type {Object}
             */
            console: {
                supress : false,
                color   : true,

                log: {
                    warnings : true,
                    errors   : true,
                    debug    : true,
                    log      : true,
                    verbose  : true,
                    pass     : true,
                    fail     : true,
                    start    : true,
                    comment  : true
                },
                colors: {
                    debug    : 242,
                    log      : 45,
                    message  : 45,
                    error    : 160,
                    warning  : 214,
                    verbose  : 45,
                    pass     : 82,
                    fail     : 160,
                    start    : 82,
                    comment  : 199
                }
            },

            /**
             * The default suite name
             * @type {String}
             */
            suite: "my_suite",

            /**
             * The default module name
             * @type {String}
             */
            module: "my_module",

            /**
             * The default test name
             * @type {String}
             */
            test: "001",

            /**
             * The default action name
             * @type {String}
             */
            action: "001-vars",

            /**
             * The default platform name
             * @type {String}
             */
            platform: "puppeteer",

            /**
             * The default syntax name and version
             * @type {Object}
             */
            syntax: { name: "web", version: "1.0" },

            /**
             * If true, the device will be reset on the next framework.start() call
             * @type {Boolean}
             */
            resetDevice: false,

            /**
             * If true, iOS will use a default template
             * @type {Boolean}
             */
            useTemplate: true,

            /**
             * If false, will not create instruments logs
             * @type {Boolean}
             */
            createLogs: false,

            /**
             * The default IP for the windows server
             * @type {string}
             */
            windowsServerIP: '127.0.0.1',

            /**
             * The default port for the windows server
             * @type {number}
             */
            windowsServerPort: 11000,

            /**
             * The https url for the Perfecto Server
             * @type {string}
             */
            perfectoHost: 'https://'+process.env.PERFECTO_HOST,

            /**
             * The host for the Perfecto Server
             * @type {string}
             */
            perfectoHostOnly: process.env.PERFECTO_HOST,

            /**
             * The username for the Perfecto Server
             * @type {string}
             */
            perfectoUser: process.env.PERFECTO_USER,

            /**
             * The password for the Perfecto Server
             * @type {string}
             */
            perfectoPassword: process.env.PERFECTO_PASSWORD,

            /**
             * The repository for the Perfecto images
             * @type {string}
             */
            perfectoImageRepository: 'PUBLIC:soda',

            /**
             * The repository for the Perfecto scripts
             * @type {string}
             */
            perfectoScriptRepository: 'PUBLIC:sodascripts',

            /**
             * The repository for the Perfecto images
             * @type {string}
             */
            perfectoImageArea: 'media',

            /**
             * The code signing identity for iOS
             * @type {string}
             */
            codeSignIdentity: 'iPhone Distribution',

            /**
             * The provisioning profile for iOS
             * @type {string}
             */
            provisioningProfile: 'Soda Profile',

            /**
             * The default test URL
             * @type {string}
             */
            testURL: 'about:blank',

            /**
             * The default variable file
             * @type {string}
             */
            variableExcelFile: '',

            /**
             * The default variable JSON file
             * @type {string}
             */
            variableJSONFile: '',

            /**
             * Where to store instruments trace file
             * @type {String}
             */
            storeiOSTrace: path.resolve(path.join(userHome, "Desktop", Date.now() + ".tracetemplate")),

            /**
             * The maintainer name and password
             */
            maintainer: {
                name  : process.env.MAINTAINER_NAME,
                email : process.env.MAINTAINER_EMAIL
            },

            /**
             * An email distribution group, in which all recipeients will receive email alerts when exitWithError is called.
             * @type {String}
             */
            devDistro: [process.env.MAINTAINER_EMAIL],

            /**
             * An email distribution group, in which all recipeients will receive email alerts on test failures.
             * @type {String}
             */
            failureDistro: [process.env.MAINTAINER_EMAIL],

            /**
             * The full uri to send mails to
             * @type {String}
             */
            smtpConnectionString : 'smtp://'+process.env.SMTP_HOST,

            /**
             * The host to send mails to
             * @type {String}
             */
            bareSmtpConnectionString : process.env.SMTP_HOST,

            /**
             * The address to send emails from
             * @type {String}
             */
            smtpFromAddress: process.env.SMTP_FROM_ADDRESS,

            /**
             * The subject lines for each type of report email
             * @type {Object}
             */
            testMailSubjects: {
                testPass         : 'Test: Pass', // Unused
                testFail         : 'Test: Failed',
                modulePass       : 'Module: Pass',
                moduleFail       : 'Module: Failed',
                suitePass        : 'Suite: Pass',
                suiteFail        : 'Suite: Failed'
            },

            /**
             * The host to connect to our lambdas
             * @type {String}
             */
            auth_host: process.env.AUTH_HOST,

            /**
             * The authorization host to get our authentication token
             * @type {String}
             */
            auth_path: process.env.AUTH_PATH,

            /**
             * The key for our authorization
             * @type {String}
             */
            key: "",

            /**
             * The secret for our authorization
             * @type {String}
             */
            secret: "",

            /**
             * The api host 
             * @type {String}
             */
            apihost: process.env.API_HOST,

            /**
             * The apit path
             * @type {String}
             */
            apipath: ""
        };

    /**
     * Set a configuration value
     * @param {string} name The name or string dot-notation path of the configuration value to set
     * @param {*} value The value to set the configuration item to
     * @return {object<SodaConfig>} The current SodaConfig object
     */
    this.set = function (name, value) {
        var obj;

        if(typeof name === "string" && name.indexOf(".") > -1) {
            obj = configuration.findChildByPath(name, ".");

            if(typeof object !== "object") {
                var parent = name.substr(0, name.lastIndexOf(".")),
                    key    = name.substr(name.lastIndexOf(".") + 1, name.length);

                obj = configuration.findChildByPath(parent, ".");
                if(obj) obj[key] = value;
            }
            else {
                if(obj) obj = value;
            }

            /**
             * Emitted when a configuration value is set
             * @event module.SodaCommon/Config.SodaConfig#config set
             */
            self.emit("config set", name, value, configuration.sodaclone(), !(obj === value)); // jshint ignore:line
        }
        else if (typeof name === "string") {
            obj = configuration[name] = value;

            /**
             * Emitted when a configuration value is set
             * @event module.SodaCommon/Config.SodaConfig#config set
             */
            self.emit("config set", name, value, configuration.sodaclone(), !(obj === value)); // jshint ignore:line
        }

        return self;
    };

    /**
     * Get a configuration value
     * @param {string} name The name or string dot-notation of the configuration value to get
     * @return {*} The configuration value, null, or if no name was specified a clone of the configuration settings
     */
    this.get = function (name) {
        var obj = null, clone = configuration.sodaclone();

        if(typeof name === "string" && name.indexOf(".") > -1) {
            obj = configuration.findChildByPath(name, ".");
        }
        else {
            obj = configuration[name];
        }

        /**
         * Emitted when a configuration value is retrieved
         * @event module.SodaCommon/Config.SodaConfig#config get
         */
        self.emit("config get", name, obj || null, clone);
        return name ? obj : clone;
    };

    /**
     * Delete a configuration value
     * @param {string} name The name of the configuration value to delete
     * @return {object<SodaConfig>} The current SodaConfig object
     */
    this.delete = function (name) {
        if(typeof name === "string") {
            var obj;

            if(name.indexOf(".") > -1) {
                obj = configuration.findChildByPath(name, ".");
            }
            else {
                obj = configuration[name];
            }

            if(obj) {
                /**
                 * Emitted when a configuration value is deleted
                 * @event module.SodaCommon/Config.SodaConfig#config set
                 */
                self.emit("config delete", name, configuration[name], configuration.sodaclone());
                configuration[name] = null;
                delete configuration[name];
            }
        }
        return self;
    };
};

module.exports = SodaConfig;
util.inherits(SodaConfig, EventEmitter);
