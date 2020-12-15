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
 * @module Instruments/Configuration
 */

/**
 * Configuration file for the Instruments Soda framework
 * @namespace InstrumentsConfiguration
 */
module.exports = function InstrumentsConfiguration (soda) {
    return {

        /**
         * Increase this if you're having issues retrieving the DOM Tree
         * @type {Number}
         */
        WRITE_CHUNK_DELAY: 0,

        /**
         * Time before events are considered "timed out" and an erros is returned
         * @type {Number}
         * @memberof module.Instruments/Configuration.InstrumentsConfiguration
         */
        EVENT_TIMEOUT: 360000, // 06 Minutes

        /**
         * Time to wait before forcefully shutting down instruments
         * @type {Number}
         * @memberof module.Instruments/Configuration.InstrumentsConfiguration
         */
        TIMEOUT_BEFORE_FORCE_CLOSE: 10000,  // 10 Seconds

        /**
         * Interval refreh rate
         * @type {Number}
         * @memberof module.Instruments/Configuration.InstrumentsConfiguration
         */
        INTERVAL_REPEAT: 60,

        /**
         * Sanitize element names, labels, etc. using this regular expression
         * @type {RegExp}
         * @memberof module.Instruments/Configuration.InstrumentsConfiguration
         */
        SANITIZE_IDENTIFIER: /\s/g,

        /**
         * Replace unsanitary characters with this character
         * @type {String}
         * @memberof module.Instruments/Configuration.InstrumentsConfiguration
         */
        SANITIZE_REPLACEMENT_CHARACTER: " ",

        /**
         * Omits the following elements (and their children) from the DOM tree
         * @type {Array<String>}
         * @memberof module.Instruments/Configuration.InstrumentsConfiguration
         */
        OMIT_KEYS: [
            "monthlyCalendarView:UIACollectionView:1"
        ],

        /**
         * Auto closes popups based on the following regular expression
         * @type {RegExp}
         * @memberof module.Instruments/Configuration.InstrumentsConfiguration
         */
        AUTO_CLOSE_POPUPS: new RegExp('(Would like to Send You Notifications|Password will be sent securely)', 'ig'),

        /**
         * How long a shell script has to execute before an exception is thrown
         * @type {Number}
         * @memberof module.Instruments/Configuration.InstrumentsConfiguration
         */
        DEFAULT_TASK_TIMEOUT: 300,

        /**
         * The stdout chunk size (character size) for UILogger to print and node to receive
         * @type {Number}
         * @memberof module.Instruments/Configuration.InstrumentsConfiguration
         */
        FILE_WRITE_CHUNK_SIZE: 7000,

        /**
         * The Instruments Template path
         * @type {String}
         * @memberof module.Instruments/Configuration.InstrumentsConfiguration
         */
        TEMPLATE_PATH: '/Applications/Xcode.app/Contents/Applications/Instruments.app/Contents/PlugIns/AutomationInstrument.xrplugin/Contents/Resources/Automation.tracetemplate',

        /**
         * The simulator device plist directory (will be prefixed with the user home directory automatically)
         * @type {String}
         * @memberof module.Instruments/Configuration.InstrumentsConfiguration
         */
        DEVICE_PLIST_DIR: "/Library/Developer/CoreSimulator/Devices",

        /**
         * The URL where the webdriver is running
         * @type {String}
         * @memberof module.Instruments/Configuration.InstrumentsConfiguration
         */
        WEBDRIVER_HOST: "http://localhost:8100/",

        /**
         * The Timeout for initialization
         * @type {String}
         * @memberof module.Instruments/Configuration.InstrumentsConfiguration
         */
        INIT_TIMEOUT: 1000 * 60 * 5, // 5 Minute(s)

        /**
	         * The default applitools API Key
	         * @memberof PerfectoConfiguration
	         * @type {String}
         */
        APPLITOOLS_API_KEY: soda.config.get("applitoolsAPIKey"),

        /**
	         * The default applitools API Cloud URL
	         * @memberof PerfectoConfiguration
	         * @type {String}
         */
        APPLITOOLS_CLOUD_URL: soda.config.get("applitoolsCloudURL"),

        /**
         * The Proxy to use for the webdriver
         * @type {String}
         * @memberof module.Instruments/Configuration.InstrumentsConfiguration
         */
        PROXY: null
    };
};

// For Node.js usage...
if(typeof global !== "undefined" && typeof module !== "undefined" && typeof module.exports !== "undefined") {
    var path = require('path');
    module.exports.TEMPLATE_PATH = path.resolve(path.join(__dirname, "..", "Template.tracetemplate"));
}
