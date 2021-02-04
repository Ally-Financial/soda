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
 * @module Windows/Configuration
 */

/**
 * Configuration file for the Windows Soda framework
 * @namespace WindowsConfiguration
 */
module.exports = function WindowsConfiguration (soda) {
    return {
        /**
         * The default file location for
         * @memberof WindowsConfiguration
         * @type {String}
         */
        DEFAULT_FILE_LOCATION: soda.config.get("temp").withoutTrailingSlash,

		    /**
	         * The default ip for the windows server for
	         * @memberof WindowsConfiguration
	         * @type {String}
         */
        WINDOWS_SERVER_IP: soda.config.get("windowsServerIP"),

        /**
	         * The default port for the windows server for
	         * @memberof WindowsConfiguration
	         * @type {String}
         */
        WINDOWS_SERVER_PORT: soda.config.get("windowsServerPort"),

        /**
	         * The default command for getting available applications from the windows server for
	         * @memberof WindowsConfiguration
	         * @type {String}
         */
        GET_AVAILABLE_APPLICATIONS: '[{\"command\": \"getAvailableApplications\"}]',

        /**
             * The default command for getting available applications from the windows server for
             * @memberof WindowsConfiguration
             * @type {String}
         */
        GET_RUNNING_APPLICATIONS: '[{\"command\": \"getRunningApplications\"}]',

        /**
             * The default number of times to return sending a command windows server for
             * @memberof WindowsConfiguration
             * @type {number}
         */
        RETRY_COMMAND_COUNT: 3,

        /**
             * The default number of times to perform a find element command
             * @memberof WindowsConfiguration
             * @type {number}
         */
        FIND_ELEMENT_COMMAND_COUNT: 100,

        /**
         * Time to allow before script execution times out
         * @memberof WindowsConfiguration
         * @type {number}
         */
        SCRIPT_TIMEOUT: 10000
    };
};
