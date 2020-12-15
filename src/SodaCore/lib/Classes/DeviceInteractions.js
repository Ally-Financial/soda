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
 * @module SodaCore/DeviceInteractions
 */


/**
* A wrapper to perform interactions against the framework's loaded device
* @constructor
* @param {Soda} soda The Soda library
*/
var DeviceInteractions = function (soda) {

    /**
    * A wrapper for the below functions
    * @param {string} action The action to perform (e.g. tap, doubleTap, etc.)
    * @param {object=} options Settings for the particular user interaction
    * @param {function=} complete A callback for completion
    */
    function doAction (action, options, complete) {
        soda.framework.performDeviceInteraction(action, options || {}, complete);
    }

    /////////////////////////////////////////////// DEVICE INTERACTIONS ////////////////////////////////////////////////

    /**
    * Hide the app for `duration` seconds
    * @param {number=} seconds The number of seconds to hide the app for
    * @param {function=} complete A callback for completion
    * @returns {*}
    */
    this.hideAppForSeconds = function hideAppForSeconds (seconds, complete) {
        return doAction("hideAppForSeconds", { seconds: seconds || 10 }, complete);
    };

    /**
    * Rotate the device's orientation
    * @param {string} orientation The orientation to rotate the device to.
    * Options include: "portrait", "portrait upsidedown", "landscape", "landscape left", and "landscape right"
    * @param {function=} complete A callback for completion
    * @returns {*}
    */
    this.rotateDevice = function rotateDevice (orientation, complete) {
        var o = 0;
        switch(orientation) {
            case "portrait":
                o = 1;
                break;

            case "portrait upsidedown":
                o = 2;
                break;

            case "landscape":
            case "landscape left":
                o = 3;
                break;

            case "landscape right":
                o = 4;
                break;
            default:
                o = 1;
                break;
        }
        return doAction("rotateDevice", { orientation: o }, complete);
    };

    /**
    * Take a screen shot with the options provided
    * @param {object} options The options to save the screen shot with... must include filename key
    * @param {function=} complete A callback for completion
    * @returns {*}
    */
    this.captureScreen = function captureScreen (options, complete) {
        return doAction("captureScreen", options, complete);
    };

    /**
    * Capture the headers of the browser
    * @param {function=} complete A callback for completion
    * @returns {*}
    */
    this.captureHeader = function captureHeader (options, complete) {
        return doAction("captureHeader", options, complete);
    };

    /**
    * Tap the specified screen coordinates
    * @param {number} x The x coordinate to tap
    * @param {number} y The y coordinate to tap
    * @param {function=} complete A callback for completion
    * @returns {*}
    */
    this.tapXY = function tapXY (x, y, options, complete) {

        if(!complete && options instanceof Function) {
            complete = options;
            options  = {};
        }

        if(typeof options !== "object") options = {};
        options.x = x;
        options.y = y;

        return doAction("tapXY", options, complete);
    };

    /**
    * Type on the device keyboard
    * @param {string=} string The string to type on the keyboard
    * @param {function=} complete A callback for completion
    * @returns {*}
    */
    this.typeOnKeyboard = function typeOnKeyboard (string, complete) {
        return doAction("typeOnKeyboard", { string: string }, complete);
    };

    /**
    * Reset the application's data (Mobile device's only)
    * @param {function=} complete A callback for completion
    * @returns {*}
    */
    this.resetAppData = function resetAppData (complete) {
        return doAction("resetAppData", {}, complete);
    };

    /**
    * Go back
    * @param {function=} complete A callback for completion
    * @returns {*}
    */
    this.back = function back (complete) {
        return doAction("back", {}, complete);
    };

    /**
    * Scroll the screen (window)
    * @param {function=} complete A callback for completion
    * @returns {*}
    */
    this.scrollWindow = function back (options, complete) {
        return doAction("scroll window", options, complete);
    };

    /**
    * Swipe the screen (window)
    * @param {function=} complete A callback for completion
    * @returns {*}
    */
    this.deviceSwipe = function deviceSwipe (options, complete) {
        return doAction("deviceSwipe", { coordinates: options }, complete);
    };

    /**
    * Go forward
    * @param {function=} complete A callback for completion
    * @returns {*}
    */
    this.forward = function forward (complete) {
        return doAction("forward", {}, complete);
    };

    /**
    * Re-loads the browser page (Web only)
    * @param {function=} complete A callback for completion
    * @returns {*}
    */
    this.reload = function reload (complete) {
        return doAction("reload", {}, complete);
    };

    /**
    * Delete all cookies in browser (Web only)
    * @param {function=} complete A callback for completion
    * @returns {*}
    */
    this.deleteAllCookies = function deleteAllCookies (complete) {
        return doAction("deleteAllCookies", { }, complete);
    };

    /**
    * Go to a URL (Web only)
    * @param {string} url The url to navigate to
    * @param {function=} complete A callback for completion
    * @returns {*}
    */
    this.goto = function goto (url, complete) {
        return doAction("goto", { url: url }, complete);
    };

    /**
    * Resize the browser window (Web only)
    * @param {string} frame The width and height
    * @param {function=} complete A callback for completion
    * @returns {*}
    */
    this.resizeWindow = function resizeWindow (frame, complete) {
        return doAction("resizeWindow", { frame: frame }, complete);
    };

    /**
    * Maximize the browser window (Web only)
    * @param {function=} complete A callback for completion
    * @returns {*}
    */
    this.maximizeWindow = function maximizeWindow (shouldDo, complete) {
        return doAction("maximizeWindow", { shouldDo: shouldDo }, complete);
    };

    /**
    * Get variable from the browser window (Web only)
    * @param {function=} complete A callback for completion
    * @returns {*}
    */
    this.getVariable = function getVariable (variableName, storeIn, complete) {
        return doAction("getVariable", { variableName: variableName, storeIn: storeIn }, complete);
    };

    /**
    * Closes the browser window (Web only)
    * @param {function=} complete A callback for completion
    * @returns {*}
    */
    this.close = function close (complete) {
        return doAction("close", {}, complete);
    };

    /**
    * Closes and reopens the browser window (Web only)
    * @param {function=} complete A callback for completion
    * @returns {*}
    */
    this.reset = function reset (complete) {
        return doAction("reset", {}, complete);
    };

    /**
    * Switch to frame (Web only)
    * @param {string} options An object with key/value pair options for this device interaction
    * @param {function=} complete A callback for completion
    * @returns {*}
    */
    this.switchToFrame = function switchToFrame (options, complete) {
        return doAction("switchToFrame", options, complete);
    };

    /**
     * Start an application
     * @param {function=} complete A callback for completion
     * @returns {*}
     */
    this.startApp = function start (path, args, complete) {
        return doAction("startApp", { path: path, args: args }, complete);
    };

    /**
     * Start an application and wait for its completion
     * @param {function=} complete A callback for completion
     * @returns {*}
     */
    this.startAppAndWait = function startAndWait (path, args, complete) {
        return doAction("startAppAndWait", { path: path, args: args }, complete);
    };

    /**
     * Start an application
     * @param {function=} complete A callback for completion
     * @returns {*}
     */
    this.stopApp = function stop (path, args, complete) {
        return doAction("stopApp", { path: path, args: args }, complete);
    };

    /**
     * Go to home screen
     * @param {function=} complete A callback for completion
     * @returns {*}
     */
    this.homeScreen = function homeScreen (complete) {
        return doAction("homeScreen", { }, complete);
    };

    /**
     * Open an application
     * @param {function=} complete A callback for completion
     * @returns {*}
     */
    this.openApp = function open (path, complete) {
        return doAction("openApp", { path: path }, complete);
    };

    /**
     * Closes an application
     * @param {function=} complete A callback for completion
     * @returns {*}
     */
    this.closeApp = function close (path, complete) {
        return doAction("closeApp", { path: path }, complete);
    };

    /**
     * Closes an application
     * @param {function=} complete A callback for completion
     * @returns {*}
     */
    this.sendKeyCommand = function sendKeyCommand (keyCommand, complete) {
        return doAction("sendKeyCommand", { keyCommand: keyCommand }, complete);
    };

    /**
     * Sets a persona
     * @param {function=} complete A callback for completion
     * @returns {*}
     */
    this.persona = function persona (persona, complete) {
        return doAction("persona", { persona: persona }, complete);
    };

    /**
     * Locks screen for a set number of seconds
     * @param {function=} complete A callback for completion
     * @returns {*}
     */
    this.lockScreen = function lockScreen (seconds, complete) {
        return doAction("lockScreen", { seconds: seconds }, complete);
    };

    /**
     * Call the devices's post method
     * @type {function}
     */
    this.post = function post (options, complete) {
        return doAction("post", options, complete);
    };

    /**
     * Call the devices's get method
     * @type {function}
     */
    this.get = function get (options, complete) {
        return doAction("get", options, complete);
    };

    /**
     * Call the devices's delete method
     * @type {function}
     */
    this.del = function del (options, complete) {
        return doAction("delete", options, complete);
    };
    
    /**
     * Executes a Script with an action
     * @param {function=} complete A callback for completion
     * @returns {*}
     */
    this.executeScript = function executeScript (action, complete) {
        return doAction("executeScript", action, complete);
    };

    /**
     * Executes a Script with a string
     * @param {function=} complete A callback for completion
     * @returns {*}
     */
    this.executeScriptWithString = function executeScript (action, complete) {
        return doAction("executeScriptWithString", action, complete);
    };

    /**
     * Finds an element on the screen
     * @param {function=} complete A callback for completion
     * @returns {*}
     */
    this.findElement = function findElement (valueToFind, complete) {
        return doAction("findElement", { valueToFind: valueToFind }, complete);
    };

    /**
     * Finds an element on the screen and scroll
     * @param {function=} complete A callback for completion
     * @returns {*}
     */
    this.findElementWithScroll = function findElementWithScroll (valueToFind, complete) {
        return doAction("findElementWithScroll", { valueToFind: valueToFind }, complete);
    };

    /**
     * Finds an element on teh screen
     * @param {function=} complete A callback for completion
     * @returns {*}
     */
    this.getResolution = function getResolution (complete) {
        return doAction("getResolution", { }, complete);
    };

    /**
     * Scrolls to a calculate point
     * @param {function=} complete A callback for completion
     * @returns {*}
     */
    this.scrollCalculated = function scrollCalculated (command, complete) {
        return doAction("scrollCalculated", { command: command }, complete);
    };
};

module.exports = DeviceInteractions;
