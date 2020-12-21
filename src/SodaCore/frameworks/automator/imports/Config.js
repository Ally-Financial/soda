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
 * @module Automator/Configuration
 */

var path = require("path"),
    exec = require(path.join(__dirname, "..", "..", "..", "..", "SodaCommon", "Exec")),
    fs   = require("fs"),
    os   = require("os");

/**
 * @namespace AutomatorConfiguration
 */
module.exports = function automatorConfiguration (soda) {

    var sdkPath = soda.config.get("androidSDKPath");
    try {
        sdkPath = exec.printSync(os.platform() === "win32" || os.platform() === "win64" ? "%ANDROID_SDK_HOME%" : "$ANDROID_SDK_HOME", { timeout: 2000 }).toString('utf-8').trim();
        try {
            // Make sure this variable is a directory...
            var stat1 = fs.statSync(sdkPath);
            if(stat1.isDirectory()) soda.config.set("androidSDKPath", sdkPath);
        }
        catch (e) {
            // Default to user config set value...
            sdkPath = soda.config.get("androidSDKPath");
        }
    }
    catch (e) {
        // Default to user config set value...
        sdkPath = soda.config.get("androidBuildToolsPath");
    }

    var toolsPath = soda.config.get("androidSDKPath");
    try {
        toolsPath = exec.printSync(os.platform() === "win32" || os.platform() === "win64" ? "%ANDROID_BUILD_TOOLS_HOME%" : "$ANDROID_BUILD_TOOLS_HOME", { timeout: 2000 }).toString('utf-8').trim();
        try {
            // Make sure this variable is a directory...
            var stat2 = fs.statSync(toolsPath);
            if(stat2.isDirectory()) soda.config.set("androidBuildToolsPath", toolsPath);
        }
        catch (e) {
            // Default to user config set value...
            toolsPath = soda.config.get("androidBuildToolsPath");
        }
    }
    catch (e) {
        // Default to user config set value...
        toolsPath = soda.config.get("androidBuildToolsPath");
    }

    /**
     * Automator constant values
     * @memberof module.Automator/Configuration.AutomatorConfiguration
     */
    return {

        /////////////////////////////////////////////// ANDROID SDK PATHS ///////////////////////////////////////////////

        /**
         * The path to the .android directory (usually ~/)
         * @memberof module.Automator/Configuration.AutomatorConfiguration
         * @type {String}
         */
        DOT_ANDROID_PATH: path.join(soda.config.get("userHome"),".android"),

        /**
         * The path to the adb executable
         * @memberof module.Automator/Configuration.AutomatorConfiguration
         * @type {String}
         */
        ADB_PATH: path.join(sdkPath, 'platform-tools', 'adb'),

        /**
         * The path to the Android SDK android directory
         * @memberof module.Automator/Configuration.AutomatorConfiguration
         * @type {String}
         */
        ANDROID_PATH: path.join(sdkPath, 'tools', 'android'),

        /**
         * The path to the Android SDK emulator directory
         * @memberof module.Automator/Configuration.AutomatorConfiguration
         * @type {String}
         */
        EMULATOR_PATH: path.join(sdkPath, 'emulator', 'emulator'),

        /**
         * The path to the Android SDK AAPT directory
         * @memberof module.Automator/Configuration.AutomatorConfiguration
         * @type {String}
         */
        AAPT_TOOLS_PATH: path.join(toolsPath, 'aapt'),


        ////////////////////////////////////////// DO NOT EDIT BELOW THIS LINE //////////////////////////////////////////

        /**
         * The number of times to retry a screen dump, if it fails. (Could be because another Soda process is starting)...
         * @type {Number}
         */
        TIMES_TO_REPEAT_DUMP: 10,

        /**
         * The "null" port, or a sentinal value to represent that the port should not be used
         * @type {Number}
         * @memberof module.Automator/Configuration.AutomatorConfiguration
         */
        NULL_PORT: 999999,

        /**
         * The amount of time (in ms) between device discovery intervals
         * @memberof module.Automator/Configuration.AutomatorConfiguration
         * @type {Number}
         */
        DEVICE_DISCOVERY_INTERVAL: 3000, // 3 Seconds

        /**
         * The amount of time (in ms) before device discovery times out
         * @memberof module.Automator/Configuration.AutomatorConfiguration
         * @type {Number}
         */
        DEVICE_DISCOVERY_TIMEOUT: 120000, // 120 Seconds

        /**
         * The interval between "device has booted" checks
         * @memberof module.Automator/Configuration.AutomatorConfiguration
         * @type {Number}
         */
        DEVICE_BOOT_INTERVAL: 5000, // 5 Seconds

        /**
         * The amount of time (in ms) before device booting should timeout and an error is returned
         * @memberof module.Automator/Configuration.AutomatorConfiguration
         * @type {Number}
         */
        DEVICE_BOOT_TIMEOUT: 120000, // 120 Seconds

        /**
         * The amount of time to wait before installing an APK file on the device, once the device has booted
         * @memberof module.Automator/Configuration.AutomatorConfiguration
         * @type {Number}
         */
        WAIT_TO_INSTALL: 5000, // 5 Seconds

        /**
         * Delay (in ms) before returning to caller one the app has been started
         * @memberof module.Automator/Configuration.AutomatorConfiguration
         * @type {Number}
         */
        TIME_TO_WAIT_FOR_APP_TO_START: 10000, // 10 Seconds

        /**
         * Default starting port to start emulators on
         * @memberof module.Automator/Configuration.AutomatorConfiguration
         * @type {Number}
         */
        DEFAULT_EMULATOR_PORT: 5554,

        /**
         * If a port is busy and this is set to true, it will increment the given port until a free one is found
         * @memberof module.Automator/Configuration.AutomatorConfiguration
         * @type {Boolean}
         */
        AUTO_FIX_BUSY_PORT: true,

        /**
         * If "tty" the window hierarchy xml file will be dumped to the stdout, if "file" it will be saved to file, then read.
         * Options: "file" and "tty"
         * @memberof module.Automator/Configuration.AutomatorConfiguration
         * @type {String}
         */
        DUMP_METHOD : "pull",

        /**
         * Key even mapping
         * @memberof module.Automator/Configuration.AutomatorConfiguration
         * @type {Object}
         */
        KEY_EVENTS: {
            UNLOCK      : 82,
            HOME        : 3,
            BACK        : 4,
            ESCAPE      : 111,
            APP_SWITCH  : 187,

            SCROLL_UP    : 19,
            SCROLL_DOWN  : 20,
            SCROLL_LEFT  : 21,
            SCROLL_RIGHT : 22
        }
    };
};
