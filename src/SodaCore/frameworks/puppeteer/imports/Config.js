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
 * @module Puppeteer/Configuration
 */

/**
 * Configuration file for the Puppeteer Soda framework
 * @namespace PuppeteerConfiguration
 */
module.exports = function PuppeteerConfiguration (soda) {
    return {
        /**
         * The default file location for
         * @memberof PuppeteerConfiguration
         * @type {String}
         */
        DEFAULT_FILE_LOCATION: soda.config.get("temp").withoutTrailingSlash,

		    /**
         * The default url for the Puppeteer Chrome server for
         * @memberof PuppeteerConfiguration
         * @type {String}
         */
        Puppeteer_CHROME_SERVER_LOCATION: soda.config.get("PuppeteerChromeServer"),

        /**
         * The default url for the Puppeteer Safari server for
         * @memberof PuppeteerConfiguration
         * @type {String}
         */
        Puppeteer_SAFARI_SERVER_LOCATION: soda.config.get("PuppeteerSafariServer"),

		    /**
	         * The default url for the Puppeteer Internet Explorer server for
	         * @memberof PuppeteerConfiguration
	         * @type {String}
         */
        Puppeteer_IE_SERVER_LOCATION: soda.config.get("PuppeteerIEServer"),

        /**
	         * The default applitools API Key
	         * @memberof PuppeteerConfiguration
	         * @type {String}
         */
        APPLITOOLS_API_KEY: soda.config.get("applitoolsAPIKey"),

        /**
	         * The default applitools API Cloud URL
	         * @memberof PuppeteerConfiguration
	         * @type {String}
         */
        APPLITOOLS_CLOUD_URL: soda.config.get("applitoolsCloudURL"),

        /**
	         * The default Variable File
	         * @memberof PuppeteerConfiguration
	         * @type {String}
         */
        VARIABLE_EXCEL_FILE: soda.config.get("variableExcelFile"),

        /**
	         * The default Variable File
	         * @memberof PerfectoConfiguration
	         * @type {String}
         */
        VARIABLE_JSON_FILE: soda.config.get("variableJSONFile"),

        /**
         * Time to allow before script execution times out
         * @memberof PuppeteerConfiguration
         * @type {String}
         */
        SCRIPT_TIMEOUT: 10000
    };
};
