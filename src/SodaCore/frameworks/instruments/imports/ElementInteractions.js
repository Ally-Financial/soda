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
 * Actions that could be performed by a user. A (more friendly) alternative to using the method on the UIAElement class
 * @module Instruments/ElementInteractions
 */
var ElementInteractions = function (soda, driverControl) {
      /////////////////////////////////////////////// ELEMENT ACTIONS ///////////////////////////////////////////////

      /**
       * Tap an element
       * @param {string} e An element id
       * @param {object=} options The options to tap with
       * @memberof module.Instruments/ElementInteractions
       */
      this.tap = function (elements, options, complete) {
        var err = arguments.sodaexpect("array", "object", "function").error;
        if(err) throw err;

        var i = 0;
        driverControl.tap(elements[i], options.value, function tapAll (err) {

            if(err) {
                complete(err, false);
                i = elements.length;
                return;
            }

            i = i + 1;

            if(i < elements.length) {
                driverControl.tap(elements[i], tapAll);
            }
            else {
                complete(null, true);
            }
        });
      };

      /**
       * Tap an element with options
       * @param {string} e An element id
       * @param {object=} options The options to tap with
       * @memberof module.Instruments/ElementInteractions
       */
      this.tapWithOptions = function (e, options, complete) {
          return driverControl.tap(e, options, complete);
      };

      /**
       * Double tap an element
       * @param {string} e An element id
       * @param {object=} options The options to double tap with
       * @memberof module.Instruments/ElementInteractions
       */
      this.doubleTap = function (e, options, complete) {
          return driverControl.tap(e, options, complete);
      };

      /**
       * Drag inside an element
       * @param {string} e An element id
       * @param {object=} options Optional options
       * @memberof module.Instruments/ElementInteractions
       */
      this.dragInside = function (e, options, complete) {
          return driverControl.drag(e, options, complete);
      };

      /**
       * "Flick" inside an element
       * @param {string} e An element id
       * @param {object=} options Optional options
       * @memberof module.Instruments/ElementInteractions
       */
      this.flickInside = function (e, options, complete) {
          return driverControl.flick(e, options, complete);
      };

      /**
       * Rotate an element
       * @param {string} e An element id
       * @param {object=} options Optional options
       * @memberof module.Instruments/ElementInteractions
       */
      this.rotate = function (e, options, complete) {
          return driverControl.rotate(e, options, complete);
      };

      /**
       * Scroll to an element until it is visible with diretion
       * @param {string} e An element id
       * @param {object=} options Optional options
       * @memberof module.Instruments/ElementInteractions
       */
      this.scrollToVisibleWithDirection = function (elements, options, complete) {
          var err = arguments.sodaexpect("array", "object", "function").error;
          if(err) throw err;

          var i = 0;
          driverControl.scrollToVisibleWithDirection(elements[i], options.direction, function scrollAll (err) {

              if(err) {
                  complete(err, false);
                  i = elements.length;
                  return;
              }

              i = i + 1;

              if(i < elements.length) {
                  driverControl.scrollToVisibleWithDirection(elements[i], options.direction, scrollAll);
              }
              else {
                  complete(null, true);
              }
          });
      };

      /**
       * Scroll to an element until it is visible
       * @param {string} e An element id
       * @param {object=} options Optional options
       * @memberof module.Instruments/ElementInteractions
       */
      this.scrollToVisible = function (elements, options, complete) {
          var err = arguments.sodaexpect("array", "object", "function").error;
          if(err) throw err;

          var i = 0;
          driverControl.scrollToVisible(elements[i], function scrollAll (err) {

              if(err) {
                  complete(err, false);
                  i = elements.length;
                  return;
              }

              i = i + 1;

              if(i < elements.length) {
                  driverControl.scrollToVisible(elements[i], options.value, scrollAll);
              }
              else {
                  complete(null, true);
              }
          });
      };

      /**
       * Touch and hold the screen using specified options
       * @param {string} e An element id
       * @param {object=} options Optional options
       * @memberof module.Instruments/ElementInteractions
       */
      this.touchAndHold = function (e, options, complete) {
          return driverControl.tap(e, options.duration, options, complete);
      };

      /**
       * Perform a two finger tap
       * @param {string} e An element id
       * @param {object=} options Optional options
       * @memberof module.Instruments/ElementInteractions
       */
      this.twoFingerTap = function (e, options, complete) {
          return driverControl.tap(e, options, complete);
      };

      /**
       * Perform a two finger tap
       * @param {string} e An element id
       * @param {object=} options Optional options
       * @memberof module.Instruments/ElementInteractions
       */
      this.scroll = function (e, options, complete) {
          options.direction = options.direction.toLowerCase();
          return driverControl.scroll(options.direction, e[0], complete);
      };

      /**
       * Type into either a UIATextField or UIASecureTextField
       * @param {string} e An element id
       * @param {object=} options Optional options
       * @memberof module.Instruments/ElementInteractions
       */
      this.setValue = function (elements, options, complete) {
        var err = arguments.sodaexpect("array", "object", "function").error;
        if(err) throw err;

        var i = 0;
        driverControl.setValue(elements[i], options.value, function typeAll (err) {

            if(err) {
                complete(err, false);
                i = elements.length;
                return;
            }

            i = i + 1;

            if(i < elements.length) {
                driverControl.setValue(elements[i], options.value, typeAll);
            }
            else {
                complete(null, true);
            }
        });
      };
  };

  module.exports = ElementInteractions;
