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
 * Soda Visual Editor configuration settings
 * @type {Object}
 */
window.SodaSettings = {

    /**
     * The speed at which elements should fade out
     * @type {Number}
     */
    FADEOUT_SPEED: 200,

    /**
     * The speed at which elements should fade out "slowly"
     * @type {Number}
     */
    FADEOUT_SLOW_SPEED: 500,

    /**
     * The speed at which elements should fade in
     * @type {Number}
     */
    FADEIN_SPEED: 400,

    /**
     * The speed at which elements should slide up
     * @type {Number}
     */
    SLIDEUP_SPEED: 1000,

    /**
     * The speed at which elements should slide up "quickly"
     * @type {Number}
     */
    SLIDEUP_FAST_SPEED: 400,

    /**
     * The speed at which elements should slide down
     * @type {Number}
     */
    SLIDEDOWN_SPEED: 1000,

    /**
     * The speed at which elements should slide open
     * @type {Number}
     */
    SLIDEOPEN_SPEED: 500,

    /**
     * The speed at which elements should slide close
     * @type {Number}
     */
    SLIDECLOSE_SPEED: 800,

    /**
     * The amount of time (in ms) that should pass before a request times out
     * @type {Number}
     */
    RESPONSE_TIMEOUT: 1000 * 60 * 5, // 5 Minute(s)

    /**
     * The amount of time (in ms) that should pass before the socket connection times out
     * @type {Number}
     */
    CONNECTION_TIMEOUT: 1000 * 60 * 1, // 1 Minute(s)

    /**
     * The amount of time (in ms) that should pass before framework initialization times out
     * @type {Number}
     */
    FRAMEWORK_INIT_TIMEOUT: 1000 * 60 * 5, // 5 Minute(s)

    /**
     * mCustomScrollbar scrolling options
     * @type {Number}
     */
    SCROLL_OPTIONS: {
        scrollInertia       : 100,
        alwaysShowScrollbar : 0,
        theme               : "minimal"
    },

    /**
     * The maximum number of selectors to be auto-generated for tree-selector options
     * @type {Number}
     */
    MAX_SELECTORS : 30
};
