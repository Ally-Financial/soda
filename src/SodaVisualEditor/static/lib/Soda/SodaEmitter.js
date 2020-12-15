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
 * A lightweight node like event emitter
 * @constructor
 */
window.SodaEmitter = function () {

    var events     = {},
        eventsOnce = {},
        self       = this,

        maxListeners = 12;

    /**
     * Attach a listener to an event
     * @param  {string} event The name of the event to register
     * @param  {Function} callback The callback to attach to the event
     * @return {object<SodaEmitter>} The current SodaEmitter instance
     */
    this.on = function (event, callback) {
        if(typeof event === "string" && callback instanceof Function) {
            if(!events[event]) events[event] = [];
            events[event].push(callback);
        }
        return self;
    };

    /**
     * Set the number of maximum listeners, before a warning is thrown
     * @param {number} n The integer to set the number of maxListeners to
     * @return {object<SodaEmitter>} The current SodaEmitter instance
     */
    this.setMaxListeners = function (n) {
        var num = parseInt(n, 10);
        if(!isNaN(num)) maxListeners = num;
        return self;
    };

    /**
     * Attach a listener to an event only once...
     * @param  {string} event The name of the event to register
     * @param  {Function} callback The callback to attach to the event
     * @return {object<SodaEmitter>} The current SodaEmitter instance
     */
    this.once = function (event, callback) {
        if(typeof event === "string" && callback instanceof Function) {
            if(!eventsOnce[event]) eventsOnce[event] = [];
            eventsOnce[event].push(callback);
        }
        return self;
    };

    /**
     * Remove a listener from an event
     * @param  {string} event The name of the event to remove a listener from
     * @param  {Function} callback The callback to remove
     * @return {object<SodaEmitter>} The current SodaEmitter instance
     */
    this.off = function (event, callback) {
        if(typeof event === "string" && events[event] instanceof Array && callback instanceof Function) {
            var idx = events[event].indexOf(callback);
            if(idx > -1) events[event].splice(idx, 1);

            idx = eventsOnce[event].indexOf(callback);
            if(idx > -1) eventsOnce[event].splice(idx, 1);
        }
        else if(!event) {
            console.warn("All event listeners purged!");
            events     = {};
            eventsOnce = {};
        }
        return self;
    };

    /**
     * Trigger an event
     * @param  {string} event The name of the event to register
     * @return {object<SodaEmitter>} The current SodaEmitter instance
     */
    this.emit = function (event) {
        var args      = ([].slice.call(arguments)),
            listeners = 0;

        if(events[event] instanceof Array) {
            events[event].forEach(function (c) {
                listeners++;
                c.apply(self, args.slice(1));
            });
        }

        if(listeners > maxListeners)
            console.warn("Event '" + event + "' has " + listeners + ", which is more than the set maxium (" + maxListeners + ").\nPossible memory leak detected.");

        if(eventsOnce[event] instanceof Array) {
            eventsOnce[event].forEach(function (c) {
                c.apply(self, args.slice(1));
            });
            eventsOnce = [];
        }
        return self;
    };

    /**
     * Get the number of listeners for event "event"
     * @param  {string} event The name of the event to get the listener count for, if the event doesn't exist zero will be returned.
     * @return {number} The current number of listeners for the event
     */
    this.listenerCount = function (event) {
        if(typeof event === "string") return events[event] ? events[event].length : 0;
        return 0;
    };

    /**
     * Remove all listeners
     * @return {object<SodaEmitter>} The current SodaEmitter instance
     */
    this.removeAllListeners = function (event) {
        console.warn("All event listeners purged!");
        events     = {};
        eventsOnce = {};

        return self;
    };
};
