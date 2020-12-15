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
 * @module Rest/Configuration
 */

/**
 * Configuration file for the Selenium Soda framework
 * @namespace SeleniumConfiguration
 */
module.exports = function SeleniumConfiguration (soda) {
    return {
        /**
         * The default file location for
         * @memberof SeleniumConfiguration
         * @type {String}
         */
        DEFAULT_FILE_LOCATION: soda.config.get("temp").withoutTrailingSlash,

        /**
         * Time to allow before script execution times out
         * @memberof SeleniumConfiguration
         * @type {String}
         */
        SCRIPT_TIMEOUT: 10000
    };
};
