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
 * @module SodaCore/ElementInteractions
 */

/**
 * @constructor
 * @description Actions that could be performed by a user on an element.<br/>
 * This class is an abstraction around framework.performElementInteraction, and each method will be
 * appended to each tree element, so you can call treeElement.tap(), for example.
 * @param {Soda} soda The Soda library
 */
var ElementInteractions = function (soda) {

    /**
     * A wrapper for the below functions
     * @param {string} action The action to perform (e.g. tap, doubleTap, etc.)
     * @param {Array} elementArray An array of elements to perform the action on
     * @param {object=} options Settings for the particular user interaction
     * @param {function=} complete A callback for completion
     */
    function doAction (action, elementArray, options, complete) {

        var eArray = [];

        if (!(elementArray instanceof Array)) elementArray = [elementArray];
        elementArray.sodaeach(function (e) {
            eArray.push(e);
        });

        soda.framework.performElementInteraction(action, eArray, options || {}, complete);
    }

    /////////////////////////////////////////////// ELEMENT ACTIONS ///////////////////////////////////////////////

    /**
     * Tap an element (for Mobile only)
     * @param {Array} elementArray An array of elements to perform the action on
     * @param {object|function=} options Settings for the particular user interaction
     * @param {function=} complete A callback for completion
     * @returns {*}
     */
    this.tap = function tap (elementArray, options, complete) {
        if (options instanceof Function && !complete) {
            complete = options;
            options = {};
        }

        return doAction("tap", elementArray, options, complete);
    };

    /**
     * Click an element (for Web only)
     * @param {Array} elementArray An array of elements to perform the action on
     * @param {object|function=} options Settings for the particular user interaction
     * @param {function=} complete A callback for completion
     * @returns {*}
     */
    this.click = function click (elementArray, options, complete) {
        if (options instanceof Function && !complete) {
            complete = options;
            options = {};
        }

        return doAction("click", elementArray, options, complete);
    };

    /**
     * Double tap an element
     * @param {Array} elementArray An array of elements to perform the action on
     * @param {object|function=} options Settings for the particular user interaction
     * @param {function=} complete A callback for completion
     * @returns {*}
     */
    this.doubleTap = function doubleTap (elementArray, options, complete) {
        if (options instanceof Function && !complete) {
            complete = options;
            options = {};
        }

        return doAction("tapWithOptions", elementArray, options, complete);
    };

    /**
     * Drag inside an element
     * @param {Array} elementArray An array of elements to perform the action on
     * @param {object|function=} options Settings for the particular user interaction
     * @param {function=} complete A callback for completion
     * @returns {*}
     */
    this.dragInside = function dragInside (elementArray, options, complete) {
        if (options instanceof Function && !complete) {
            complete = options;
            options = {};
        }

        return doAction("dragInside", elementArray, options, complete);
    };

    /**
     * Flick inside an element
     * @param {Array} elementArray An array of elements to perform the action on
     * @param {object|function=} options Settings for the particular user interaction
     * @param {function=} complete A callback for completion
     * @returns {*}
     */
    this.flickInside = function flickInside (elementArray, options, complete) {
        if (options instanceof Function && !complete) {
            complete = options;
            options = {};
        }

        return doAction("flickInside", elementArray, options, complete);
    };

    /**
     * Rotate an element
     * @param {Array} elementArray An array of elements to perform the action on
     * @param {object|function=} options Settings for the particular user interaction
     * @param {function=} complete A callback for completion
     * @returns {*}
     */
    this.rotate = function rotate (elementArray, options, complete) {
        if (options instanceof Function && !complete) {
            complete = options;
            options = {};
        }

        return doAction("rotate", elementArray, options, complete);
    };

    /**
     * Scroll an element into view
     * @param {Array} elementArray An array of elements to perform the action on
     * @param {object|function=} options Settings for the particular user interaction
     * @param {function=} complete A callback for completion
     * @returns {*}
     */
    this.scrollToVisible = function scrollToVisible (elementArray, options, complete) {
        if (options instanceof Function && !complete) {
            complete = options;
            options = {};
        }

        return doAction("scrollToVisible", elementArray, options, complete);
    };

    /**
     * Touch and hold an element
     * @param {Array} elementArray An array of elements to perform the action on
     * @param {object|function=} options Settings for the particular user interaction
     * @param {function=} complete A callback for completion
     * @returns {*}
     */
    this.touchAndHold = function touchAndHold (elementArray, options, complete) {
        if (options instanceof Function && !complete) {
            complete = options;
            options = {};
        }

        return doAction("touchAndHold", elementArray, options, complete);
    };

    /**
     * Tap an element with two fingers
     * @param {Array} elementArray An array of elements to perform the action on
     * @param {object|function=} options Settings for the particular user interaction
     * @param {function=} complete A callback for completion
     * @returns {*}
     */
    this.twoFingerTap = function twoFingerTap (elementArray, options, complete) {
        if (options instanceof Function && !complete) {
            complete = options;
            options = {};
        }

        return doAction("twoFingerTap", elementArray, options, complete);
    };

    /**
     * Set an element's value
     * @param {Array} elementArray An array of elements to perform the action on
     * @param {object|function=} value The value to set the element with
     * @param {function=} complete A callback for completion
     * @returns {*}
     */
    this.setValue = function setValue (elementArray, value, complete, mask, delay) {
        return doAction("setValue", elementArray, { value: value, delay: delay, mask: mask ? mask : false }, complete);
    };

    /**
     * Type a value into an element
     * @param {Array} elementArray An array of elements to perform the action on
     * @param {object|function=} value The value to set the element with
     * @param {function=} complete A callback for completion
     * @returns {*}
     */
    this.typeIn = function typeIn (elementArray, options, complete) {
        return doAction("typeIn", elementArray, options, complete);
    };

    /**
     * Send keys into an element
     * @param {Array} elementArray An array of elements to perform the action on
     * @param {object|function=} value The value to set the element with
     * @param {function=} complete A callback for completion
     * @returns {*}
     */
    this.sendKeys = function sendKeys (elementArray, options, complete) {
        return doAction("sendKeys", elementArray, options, complete);
    };

    /**
     * Scroll an element
     * @param {Array} elementArray An array of elements to perform the action on
     * @param {object|function=} options Settings for the particular user interaction
     * @param {function=} complete A callback for completion
     * @returns {*}
     */
    this.scroll = function scroll (elementArray, options, complete) {
        if(!options || typeof options !== "object") {
            options = {};
        }
        else if(!options.direction) {
            options.direction = "Down";
        }
        else {
            options.direction = (options.direction.toLowerCase()).ucFirst;
        }

        return doAction("scroll", elementArray, options, complete);
    };
};

module.exports = ElementInteractions;
