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
 * Configuration options for the Products & Rates Monitoring Tool
 * These are *back-end* settings.
 * @module ProductsAndRates/Config
 *
 * @see /ui/dashboard/js/Config.js for the Products & Rate Monitoring UI (front-end) settings
 */

/**
 * Sets the default environment; that is, if no --env or -e flag is set.
 * @type {String}
 */

var DEFAULT_ENV = 'prod',
    DEFAULT_ADMIN_GROUP = 'DOMAIN\\Domain Users',
    DEFAULT_EDIT_GROUP = 'DOMAIN\\Domain Users',
    DEFAULT_LINE_OF_BUSINESS = 1,
    DEFAULT_URL_BASE = 'www.',
    DEFAULT_BAPI_VERSION = 1,
    DEFAULT_VISUAL_EDITOR_PORT = 1337,
    DEFAULT_BROWSER = 'chrome',

    path  = require('path'),
    args  = require('minimist')(process.argv.slice(2), { boolean: ['d', 'debug', 'm', 'mock', 'smtp-force-no-results', 'smtp-force-discrepancy', 'debugall', 'usechromeserver'] }),
    env   = args.env || args.e || DEFAULT_ENV,
    debug = (!!args.d || !!args.debug),
    admin = args.g || args.group || DEFAULT_ADMIN_GROUP,
    edit = args.eg || args.egroup || DEFAULT_EDIT_GROUP,
    visualEditorPort = args.vep || args.veditorport || DEFAULT_VISUAL_EDITOR_PORT,
    mock  = (!!args.m || !!args.mock),
    lobId = args.l || args.lobId || DEFAULT_LINE_OF_BUSINESS,
    urlbase = args.u || args.urlbase || DEFAULT_URL_BASE,
    bapiversion = args.bv || args.bapiversion || DEFAULT_BAPI_VERSION,
    browser = args.browser || DEFAULT_BROWSER,
    usechromeserver = args.usechromeserver,
    plib  = require(path.join(__dirname, "SodaCommon")).ProtoLib,
    date  = new Date(),
    HOST_ENV         = typeof args.hostenv === 'string' ? args.hostenv : null,
    appdata          = args.appdata,
    APP_DATA         = typeof args.appdata === 'string' ? appdata.withoutTrailingSlash : process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'],
    LAMBDA_ASSET_PATH = typeof args.assetpath === 'string' ? assetpath : process.env['LAMBDA_ASSET_PATH'];

// Sanitze environment variables...
if(typeof env === 'string') env = env.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
if(typeof HOST_ENV === 'string') HOST_ENV = HOST_ENV.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();



module.exports = {
    APP_DATA: APP_DATA,

    /**
     * A reference to the program arguments, as sanitzed by the minimist module
     * @type {Object<*>}
     */
    ARGS: args,

    /**
     * The environment variable
     */
    ENV: env,

    /**
     * The Line of Business
     */
    LINE_OF_BUSINESS: lobId,

    /**
     * The *24* hour based hour to send the standard daily report. This will be relative to the server's timezone
     * (currently CST). So 8, would be 9 AM EST.
     * @type {Number}
     */
    HOUR_TO_SEND_STANDARD_REPORT: 8,

    /**
     * The number of times to attempt to get the BAPI rates before failing. These attempts will be tried 3 seconds apart.
     * So if this is set to 6 then, in the worst case, this will take ~18 seconds.
     * @type {Number}
     */
    TIMES_TO_RETRY_BAPI: 6,

    /**
     * The decision of whether or not to go to the backup URL
     * So if this is set to true then, it will retry with the backup URL.
     * @type {Number}
     */
    USE_BACKUP_BAPI_URL: false,

    /**
     * The port for the Visual Editor to listen on.
     * @type {Number}
     */
    VISUAL_EDITOR_PORT: visualEditorPort,

    /**
     * The base prefix for mortgage.
     * @type {String}
     */
    MORTGAGE_URL_BASE_PREFIX: urlbase,

    /**
     * The version of BAPI.
     * @type {Number}
     */
    BAPI_VERSION: bapiversion,

    /**
     * If true, rates that aren't found in the database will be inserted into the database, provided that a proper product id
     * and rate hash is provided in the test results. This should be false in non-dev environments.
     * @type {Boolean}
     */
    ALLOW_RATE_INSERTION: true,

    /**
     * Rounds BAPI Rates to the neartest half a percentage point.
     * @function
     * @param {Number} rate The rate to round
     * @return {Number} The rounded rate
     */
    RATE_ROUND_FUNCTION: function (rate) {
        return (Math.round(rate * 200) / 200);
    },

    /**
     * If the -d or --debug flag was passed in, this will be true. False otherwise
     * @type {Boolean}
     */
    DEBUG_MODE: debug,

    /**
     * If the -g or --group flag was passed in, this will be set.
     * @type {String}
     */
    ADMIN_GROUP: admin,

    /**
     * If the -eg or --egroup flag was passed in, this will be set.
     * @type {String}
     */
    EDIT_GROUP: edit,

    /**
     * If the -m or --mock flag was passed in, this will be true if and only if DEBUG_MODE is true as well. False otherwise
     * @type {Boolean}
     * @deprecated
     */
    USE_MOCK_DATA: debug && mock,

    /**
     * The maximum number of days prior to today that the rate start date is allowed to be
     * @type {Number}
     */
    RATE_DAYS_AGO_MAXIMUM: 180,

    /**
     * The line of business for bank
     * @type {Number}
     */
    BANK_LINE_OF_BUSINESS: 1,

    /**
     * The line of business for mortgage
     * @type {Number}
     */
    MORTGAGE_LINE_OF_BUSINESS: 2,

    /**
     * The line of business for global
     * @type {Number}
     */
    GLOBAL_LINE_OF_BUSINESS: 3,

    /**
     * The type of ratesfor global
     * @type {Number}
     */
    GLOBAL_TYPE: "Storefront",

    /**
     * Options for Soda processes (e.g. SodaManager)
     * @type {Object}
     */
    SODA: {

        /**
         * If true, test results, test traces, and failure screenshots will be written to disk.
         * @type {Boolean}
         */
        DEV_MODE: !debug,

        /**
         * The name of the browser to use (e.g. 'chrome', 'firefox', 'safari', etc.)
         * @type {String}
         */
        BROWSER: browser,

        /**
         * The number of Soda objects to run at a time
         * @type {Number}
         */
        PROCESS_COUNT: !isNaN(parseInt(args.sodas, 10)) && parseInt(args.sodas, 10) > 0 ? parseInt(args.sodas, 10) : 1,

        /**
         * The minimum number of Soda instances that must have started successfully to continue with testing.
         * @type {Number}
         */
        MIN_SODA_COUNT: !isNaN(parseInt(args.sodas, 10)) && parseInt(args.sodas, 10) > 0 ? Math.ceil(parseInt(args.sodas, 10) * 0.6) : 1,

        /**
         * The suite to pull tests from
         * @type {String}
         */
        SUITE: 'login',

        /**
         * The module to pull tests from
         * @type {String}
         */
        MODULE: 'aos',

        /**
         * The default number of findElementRetries
         * @see Soda/SodaConfig
         * @type {Number}
         */
        FIND_ELEMENT_RETRIES: debug ? 100 : 200,

        /**
         * The initial (1st) chromedriver's starting port.
         * Subsequent chromedrivers will start on subsequent ports.
         * @type {Number}
         */
        CHROMEDRIVER_PORT_START: 9515,

        /**
         * The Visual Editor's chromedriver's starting port.
         * @type {Number}
         */
        CHROMEDRIVER_VISUAL_EDITOR_PORT_START: 5444,

        /**
         * Timeout before testing is stopped, and Soda tests are aborted.
         * @type {Number}
         */
         TESTING_TIMEOUT: 1000 * 60 * 25, // 25 Minutes...

        /**
         * Soda instance options
         * @type {Object}
         */
        OPTIONS: {

            /**
             * Should be true, unless debugging...
             * @type {Boolean}
             */
            logSupressed: args.debugall ? false : true,

            /**
             * Log debug messages
             * @type {Boolean}
             */
            logDebug: debug,

            /**
             * Log verbose messages
             * @type {Boolean}
             */
            logVerbose: debug,

            /**
             * The Soda platform to use
             * @type {String}
             */
            platform: 'web',

            /**
             * The Soda suite to use
             * @type {String}
             */
            suite: '16-2',

            /**
             * The framework each Soda instance should startup with (don't change this)
             * @type {String}
             */
            framework: 'puppeteer',

            /**
             * The environment to start each Soda instance on
             * @type {String}
             */
            env: env,

            /**
             * Should start maximized
             * @type {Boolean}
             */
            startMaximized: false,

            /**
             * Should use chrome server
             * @type {Boolean}
             */
            useChromeServer: usechromeserver,

            /**
             * Should start incognito
             * @type {Boolean}
             */
            incognito: false,

            /**
             * Path to the testing scripts (should be 'database' if using a database)
             * @type {String}
             */
            testPath: LAMBDA_ASSET_PATH ? LAMBDA_ASSET_PATH : '@lambda:/soda/assets',

            /**
             * Path to the test results
             * @type {String}
             */
            testResultsPath: path.join(path.resolve('/tmp'), 'logs'),

            /**
             * Path to the testing scripts (should be 'database' if using a database)
             * @type {String}
             */
            testResultsDir: 'test-results',

            /**
             * The name of the soda user
             * @type {String}
             */
            sodauser: "devsoda",

            /**
             * The command to start each Soda with (don't change this)
             * @type {String}
             */
            command: 'run',

            /**
             * The Soda process alias (will set the Soda process title)
             * @type {String}
             */
            alias: 'VisualEditor-Soda',

            headless: true,

            chromiumargs: true,

            awslambda: true,
            
            chromeawslambda: false
        },
        /**
         * Soda instance options
         * @type {Object}
         */
        EDITOR_OPTIONS: {

            /**
             * Should be true, unless debugging...
             * @type {Boolean}
             */
            logSupressed: args.debugall ? false : true,

            /**
             * Log debug messages
             * @type {Boolean}
             */
            logDebug: debug,

            /**
             * Log verbose messages
             * @type {Boolean}
             */
            logVerbose: debug,

            /**
             * The Soda platform to use
             * @type {String}
             */
            platform: 'web',

            /**
             * The Soda suite to use
             * @type {String}
             */
            suite: '16-2',

            /**
             * The framework each Soda instance should startup with (don't change this)
             * @type {String}
             */
            framework: 'puppeteer',

            /**
             * The environment to start each Soda instance on
             * @type {String}
             */
            env: env,

            /**
             * Should start maximized
             * @type {Boolean}
             */
            startMaximized: false,

            /**
             * Should start incognito
             * @type {Boolean}
             */
            incognito: false,

            /**
             * Path to the testing scripts (should be 'database' if using a database)
             * @type {String}
             */
            testPath: '@lambda:/soda/assets',

            /**
             * Path to the test results
             * @type {String}
             */
            testResultsPath: path.join(path.resolve('/tmp'), 'logs'),

            /**
             * Path to the testing scripts (should be 'database' if using a database)
             * @type {String}
             */
            testResultsDir: 'test-results-editor',

            /**
             * The command to start each Soda with (don't change this)
             * @type {String}
             */
            command: 'run',

            /**
             * The Soda process alias (will set the Soda process title)
             * @type {String}
             */
            alias: 'Soda'
        }
    },

    /**
     * Console logging options
     * @type {Object}
     */
    CONSOLE_OPTIONS: {

        /**
         * Most sub-processes (e.g. dbproxyserver.js and uiserver.js) set this depending on their nature automagically
         * @type {Boolean}
         */
        supress: false,

        /**
         * Logs colors
         * @type {Boolean}
         */
        color : debug,

        /**
         * Log debug messages
         * @type {Boolean}
         */
        log: {
            debug    : debug,
            verbose  : args.v || args.verbose,
            log      : true,
            pass     : true,
            warnings : true,
            errors   : true
        },

        JSONWhitespace: debug ? '    ' : null,

        /**
         * A prefix for each stdout log
         * @return {String}
         */
        get prefix () {
            var prefix = process.title + ' (' + process.pid + ')';
            return prefix + ' >';
        }
    },

    /**
     * File logging options
     * @type {Object}
     */
    SYSLOGGING: {

        /**
         * Truncates the log file to this length, each time a process is started.
         * @type {Number}
         */
        truncateAfterLines: 1500,

        /**
         * Set enabled to true to enable file logging
         * @type {Boolean}
         */
        enabled: true,

        /**
         * The path to write the syslog.log file to (directory must already exist)
         * @type {String}
         */
        path: path.resolve(path.join(APP_DATA, 'logs', 'syslog.log')),

        /**
         * Only write logs of the types included in this array
         * @type {Array<String>}
         */
        types: [
            'log',
            'error',
            'warn',
            'pass'
        ]
    },

    /**
     * Options for the UI Server
     * @type {Object}
     */
    UI_SERVER: {

        /**
         * The path to expose to HTTP clients
         * @type {String}
         */
        STATIC_DIRECTORY: path.resolve(path.join(path.resolve('..'), 'ui')),

        /**
         * Directory to store cache
         */
        CACHE_DIRECTORY: path.resolve(path.join(path.resolve('..'), 'cache')),

        /**
         * If debug mode is disabled and this is set to true, then files will be served up minified
         * using cached versions...
         * @type {Boolean}
         */
        USE_CACHE: true,

        /**
         * The port to start the HTTP server on
         * @type {Number}
         */
        PORT: typeof args.port === 'number' ? args.port : 1337,

        /**
         * The hostname that the UI will use, will be printed in emails, etc.
         * @type {String}
         */
        HOSTNAME: 'localhost:' + (typeof args.port === 'number' ? args.port : '1337')
    },

    /**
     * Options for the Database Proxy (e.g. DBManager)
     * @type {Object}
     */
    DB_PROXY: {

        /**
         * The name of the DBProxy driver to use
         * @type {String}
         */
        DRIVER: 'AWS',

        /**
         * The port to start the DBProxy driver on
         * @type {Number}
         */
        DEFAULT_PORT: 1885,

        /**
         * An alternative port setting, used by prdbconfig
         * @type {Number}
         */
        ALT_PORT: 1456,

        /**
         * Time before requests to the DBProxyServer 'timeout'
         * @function
         */
        REQUEST_TIMEOUT: function () {
            return Math.floor(Math.random() * (10000 - 9000 + 1) + 9000); // Sometime between 9 and 10 seconds
        },

        /**
         * The number of retries to send a request, should it timeout...
         * If the number of retries is exhausted, an error is returned to the client request callback
         * @type {Number}
         */
        REQUEST_RETRIES: 10,

        /**
         * Options for the DBProxy Client
         * @type {Object} 
         */
        CLIENT_CONNECT_OPTIONS: {
            /**
             * Tries to re-connect should the connection fail...
             * @type {Boolean}
             */
            reconnection: true,

            /**
             * The number of attempts to try to connect to the DBProxy before failing
             * @type {Number}
             */
            reconnectionAttempts: 3,

            /**
             * Timeout between connection attempts
             * @type {Number}
             */
            reconnectionDelay: 3000,

            /**
             * Timeout between connection attempt fails
             * @type {Number}
             */
            reconnectionDelayMax: 5000,

            /**
             * Timeout before initial connection fails
             * @type {Number}
             */
            timeout: 3000,

            /**
             * The port the DBProxy clients will connect to (should be the same as DEFAULT_PORT above, or it won't work)
             * @type {Number}
             */
            port: 1885,

            upgrade: false,

            transports: ['websocket']
        },

        /**
         * The maximum attempts to try to connect to the database before invoking the callback with an error.
         * @type {Number}
         */
        MAX_DB_CONNECTION_ATTEPTS: 2,

        /**
         * Database connection options for use with the driver,
         * these are specific to each driver...
         * @type {Object}
         */
        CONNECT_OPTIONS : {
            auth_host: process.env.AUTH_HOST,
            auth_path: process.env.AUTH_PATH,
            key: typeof args.apikey   === 'string' ? args.apikey : "",
            secret: typeof args.apisecret   === 'string' ? args.apisecret :"",
            apihost: process.env.API_HOST,
            apipath: typeof args.apipath   === 'string' ? "/" + args.apipath + "/api" : "",
            user     : typeof args.dbuser   === 'string' ? args.dbuser   : '',
            password : typeof args.dbpass   === 'string' ? args.dbpass   : '',
            server   : typeof args.dbserver === 'string' ? args.dbserver : '',
            domain   : typeof args.dbdomain === 'string' ? args.dbdomain : '',
            port     : typeof args.dbport   === 'number' ? args.dbport   : -1,
            pool: {
                max : 20,
                min : 0,

                // The timeout before the db connection closes, if closed,
                // a new connection will be attempted before making a query.
                // 30 Minutes is default...
                idleTimeoutMillis: 1000 * 60 * 30
            },

            // Added this, since the DB connection is notoriously slow.
            // Twice the default...
            requestTimeout: 1000 * 120 // 120 Seconds
        },

        /**
         * Database connection options for use with the driver,
         * these are specific to each driver...
         * @type {Object}
         */
        ADMIN_CONNECT_OPTIONS : {
            user     : typeof args.dbadminuser   === 'string' ? args.dbadminuser   : '',
            password : typeof args.dbadminpass   === 'string' ? args.dbadminpass   : '',
            server   : typeof args.dbserver      === 'string' ? args.dbserver      : '',
            domain   : typeof args.dbdomain      === 'string' ? args.dbdomain      : '',
            port     : typeof args.dbport        === 'number' ? args.dbport        : -1,
            database : 'BnkRateMon',

            pool: {
                max : 20,
                min : 0,

                // The timeout before the db connection closes, if closed,
                // a new connection will be attempted before making a query.
                // 30 Minutes by default
                idleTimeoutMillis: 1000 * 60 * 30
            },

            // Added this, since the DB connection is notoriously slow.
            // Twice the default...
            requestTimeout: 1000 * 120 // 120 Seconds
        }
    },

    /**
     * SMTP Options
     * @type {Object}
     */
    SMTP: {

        /**
         * The maximum number of failed results to display in the email table.
         * @type {Number}
         */
        MAX_FAILED_RESULTS_TO_DISPLAY: 500,

        /**
         * Waits to delay the sending of emails for prscan until on the hours (00 minute).
         * @type {Number}
         */
        DELAY_EMAILS_TO_MINUTE: false,

        /**
         * If true, the no results email will be send after every scrape run, ***for testing purposes only***
         * @type {Boolean}
         */
        FORCE_NO_RES: debug && args['smtp-force-no-results'],

        /**
         * If true, the discrepancy email will be send after every scrape run, ***for testing purposes only***
         * @type {Boolean}
         */
        FORCE_DISCREPANCY: debug && args['smtp-force-discrepancy'],
    }
};