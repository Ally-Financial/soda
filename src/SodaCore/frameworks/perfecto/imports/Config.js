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
 * @module Perfecto/Configuration
 */

/**
 * Configuration file for the Perfecto Soda framework
 * @namespace PerfectoConfiguration
 */
module.exports = function PerfectoConfiguration (soda) {
    return {
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
         * The default file location for
         * @memberof PerfectoConfiguration
         * @type {String}
         */
        DEFAULT_FILE_LOCATION: soda.config.get("temp").withoutTrailingSlash,

        /**
         * The iOS provisioning Profile
         * @memberof PerfectoConfiguration
         * @type {String}
         */
        PROVISIONING_PROFILE: soda.config.get("provisioningProfile").withoutTrailingSlash,

		    /**
	         * The default host for the perfecto server for
	         * @memberof PerfectoConfiguration
	         * @type {String}
         */
        PERFECTO_HOST: soda.config.get("perfectoHost"),

        /**
	         * The default host for the perfecto server for
	         * @memberof PerfectoConfiguration
	         * @type {String}
         */
        PERFECTO_HOST_ONLY: soda.config.get("perfectoHostOnly"),

        /**
	         * The default perfecto user for
	         * @memberof PerfectoConfiguration
	         * @type {String}
         */
        PERFECTO_USER: soda.config.get("perfectoUser"),

        /**
	         * The default perfecto password for
	         * @memberof PerfectoConfiguration
	         * @type {String}
         */
        PERFECTO_PASSWORD: soda.config.get("perfectoPassword"),

        /**
	         * The default perfecto image repository for
	         * @memberof PerfectoConfiguration
	         * @type {String}
         */
        PERFECTO_IMAGE_REPOSITORY: soda.config.get("perfectoImageRepository"),

        /**
	         * The default perfecto script repository for
	         * @memberof PerfectoConfiguration
	         * @type {String}
         */
        PERFECTO_SCRIPT_REPOSITORY: soda.config.get("perfectoScriptRepository"),

        /**
	         * The default perfecto image area for
	         * @memberof PerfectoConfiguration
	         * @type {String}
         */
        PERFECTO_IMAGE_AREA: soda.config.get("perfectoImageArea"),

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
	         * The default Variable File
	         * @memberof PerfectoConfiguration
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
             * The default number of times to return sending a command windows server for
             * @memberof PerfectoConfiguration
             * @type {number}
         */
        RETRY_COMMAND_COUNT: 3,

        /**
             * The default number of times to perform a find element command
             * @memberof PerfectoConfiguration
             * @type {number}
         */
        FIND_ELEMENT_COMMAND_COUNT: 12,

        /**
         * Time to allow before script execution times out
         * @memberof PerfectoConfiguration
         * @type {number}
         */
        SCRIPT_TIMEOUT: 10000
    };
};
