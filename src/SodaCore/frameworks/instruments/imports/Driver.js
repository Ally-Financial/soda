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
 * @module Perfecto/Driver
 */

var request = require('request'),
    fs     = require('fs'),
    fsPromises = fs.promises,
    nodePath    = require("path"),
    xml2js = require('xml2js');

/**
 *
 * Driver connector for Soda to Perfecto
 * @param {Soda} soda A Soda instance
 * @constructor
 */
var WebDriver = function (soda) {
    var self = this,
        /**
         * @associates InstrumentsConfiguration
         * @type {Object}
         */
        settings = new require(nodePath.join(__dirname, 'Config'))(soda),
        sessionId = null,
        os = null,
        applicationName = null;

        process.setMaxListeners(0);

        var Queue = (function(){

          function Queue() {}

          Queue.prototype.running = false;

          Queue.prototype.queue = [];

          Queue.prototype.add_function = function(callback) {
              var _this = this;
              //add callback to the queue
              this.queue.push(function(){
                  var finished = callback();
                  if(typeof finished === "undefined" || finished) {
                     //  if callback returns `false`, then you have to
                     //  call `next` somewhere in the callback
                     _this.next();
                  }
              });

              if(!this.running) {
                  // if nothing is running, then start the engines!
                  this.next();
              }

              return this; // for chaining fun!
          };

          Queue.prototype.next = function(){
              //get the first element off the queue
              var shift = this.queue.shift();
              if(shift) {
                  this.running = true;
                  shift();
              }
          };

          return Queue;

      })();

      var queue = new Queue();

    /**
     * A request to send command to Perfecto using get
     * @param {string} path The URL path for the request to be sent to
     * @param {function=} done A callback for completion
     */
    function sendWebDriverRequest(path, done) {
      soda.console.debug("URL Request--------"+settings.WEBDRIVER_HOST+path);

      queue.add_function(function(){
        request.get(settings.WEBDRIVER_HOST+path, { 'proxy':settings.PROXY, timeout: 250000, headers: { 'Content-Type': 'application/json' } }, function (err, response, body) {
            queue.running = false;
            queue.next();
            done(err, body);
        });
      });
    }

    /**
     * A request to send command to Perfecto using post
     * @param {string} path The URL path for the request to be sent to
     * @param {function=} done A callback for completion
     */
    function sendWebDriverPostRequest(path, body, done) {
      soda.console.debug("URL Request--------"+settings.WEBDRIVER_HOST+path, body);

      queue.add_function(function(){
        request.post(settings.WEBDRIVER_HOST+path, { 'proxy':settings.PROXY, timeout: 250000, headers: { 'Content-Type': 'application/json' }, body: body }, function (err, response, body) {
            queue.running = false;
            queue.next();
            done(err, body);
        });
      });
    }

    /**
     * A request to send command to Perfecto using delete
     * @param {string} path The URL path for the request to be sent to
     * @param {function=} done A callback for completion
     */
    function sendWebDriverDeleteRequest(path, done) {
      soda.console.debug("URL Request--------"+settings.WEBDRIVER_HOST+path);

      queue.add_function(function(){
        request.del(settings.WEBDRIVER_HOST+path, { 'proxy':settings.PROXY, timeout: 15000, headers: { 'Content-Type': 'application/json' } }, function (err, response, body) {
            queue.running = false;
            queue.next();
            done(err, body);
        });
      });
    }

    /**
     * A request to send command to Perfecto using get with a timeout
     * @param {string} path The URL path for the request to be sent to
     * @param {function=} done A callback for completion
     */
    function sendWebDriverRequestWithTimeout(path, timeout, done) {
      soda.console.debug("URL Request--------"+settings.WEBDRIVER_HOST+path);

      queue.add_function(function(){
        request.get(settings.WEBDRIVER_HOST+path, { 'proxy':settings.PROXY, timeout: timeout+15000, headers: { 'Content-Type': 'application/json' } }, function (err, response, body) {
            queue.running = false;
            queue.next();
            done(err, body);
        });
      });
    }

    /**
     * A request to send command to Perfecto using post with a timeout
     * @param {string} path The URL path for the request to be sent to
     * @param {function=} done A callback for completion
     */
    function sendWebDriverPostRequestWithTimeout(path, body, timeout, done) {
      soda.console.debug("URL Request--------"+settings.WEBDRIVER_HOST+path);

      queue.add_function(function(){
        request.post(settings.WEBDRIVER_HOST+path, { 'proxy':settings.PROXY, timeout: timeout+15000, headers: { 'Content-Type': 'application/json' }, body: body }, function (err, response, body) {
            queue.running = false;
            queue.next();
            done(err, body);
        });
      });
    }

    /**
     * Returns a body for the install command as JSON
     * @param {string} bundleId The bundle Id of the application
     * @param {string} appPath The path to the application
     * @returns {string} A JSON representation
     */
    function installBody(bundleId, appPath) {
      return '{"desiredCapabilities":{"bundleId":"' + bundleId + '", "app":"' + appPath + '"}}';
    }

    /**
     * Returns a body for the open command as JSON
     * @param {string} bundleId The bundle Id of the application
     * @returns {string} A JSON representation
     */
    function openBody(bundleId) {
      return '{"desiredCapabilities":{"bundleId":"' + bundleId + '"}}';
    }

    /**
     * Returns a body for the find command by Id as JSON
     * @param {string} name The name of the element to find
     * @returns {string} A JSON representation
     */
    function findElementBodyById(name) {
      return '{"using":"id", "value": "'+ name +'"}';
    }

    /**
     * Returns a body for the find command by element as JSON
     * @param {string} element The element to attempt to find
     * @returns {string} A JSON representation
     */
    function findElementBodyByElement(element) {
      return '{"using":"predicate string", "value": "'+ "wdRect CONTAINS "+ element.rect.origin.y + " AND wdRect CONTAINS " + element.rect.origin.x + " AND wdRect CONTAINS " + element.rect.size.width + " AND wdRect CONTAINS " + element.rect.size.height +'"}';
    }

    /**
     * Returns a body for a string as an array as JSON
     * @param {string} text The text that needs to be sent as an array
     * @returns {string} A JSON representation
     */
    function setElementBodyAsArray(text) {
      return '{\"value\":' + JSON.stringify(text.split('')) + '}';
    }

    /**
     * Returns a body for a string as JSON
     * @param {string} text The text that needs to be sent as JSON
     * @returns {string} A JSON representation
     */
    function setElementBody(text) {
      return '{\"value\":"' + text + '"}';
    }

    /**
     * Returns a body for a string as JSON
     * @param {string} text The text that needs to be sent as JSON
     * @returns {string} A JSON representation
     */
    function setScrollToVisibleBody() {
      return '{\"toVisible\":true}';
    }

    /**
     * Returns a body for the scrolling command as JSON
     * @returns {string} A JSON representation
     */
    function setScrollBody() {
      return '{\"direction\":\"down\"}';
    }

    /**
     * Returns a body for the scrolling command with direction as JSON
     * @param {string} direction The direction to scroll in
     * @returns {string} A JSON representation
     */
    function setScrollBodyWithDirection(direction) {
      return '{\"direction\":\"' + direction + '\"}';
    }

    /**
     * Returns a body for the click x y as JSON
     * @param {string} x The x coordinate
     * @param {string} y The y coordinate
     * @returns {string} A JSON representation
     */
    function setclickXYBody(x, y) {
      return '{\"x\":\"' + x + '\",' + '\"y\":\"' + y + '\"}';
    }

    /**
     * Returns a body for the click x y as JSON
     * @param {string} name The name of the element to find
     * @param {string} element The sODA element to attempt to find
     * @param {function} findElement The function to use to prepare the findElement command
     * @param {function=} done A callback for completion
     */
    function getElement(name, element, findElement, done) {
      if (element && element.uuid) {
        return done(null, element.uuid);
      }

      var elementBody = element ? findElement(element) : findElement(name);
      sendWebDriverPostRequest('session/' + self.sessionId + '/elements', elementBody, function (err, result) {
          if (err)  {
            soda.console.error(err.message);

            done(err, false);
          }
          else {
            soda.console.debug('FOUND RESULT', result);
          }

          var jsonResult;

          try{
              jsonResult = JSON.parse(result);
          } catch(e){
              done(new Error("Could not parse JSON."), false);
          }

          if (jsonResult && jsonResult.value && jsonResult.value[0]) {
              if (element) {
                if (jsonResult.value.length === 1) {
                  return done(null, jsonResult.value[0].ELEMENT);
                }
                else if (jsonResult.value.length > 1) {
                  return done(null, jsonResult.value[0].ELEMENT);
                }
                else {
                  for (var i = 0; i < jsonResult.value.length; i++) {
                      if (jsonResult.value[i].label && (element.label === jsonResult.value[i].label)) {
                          return done(null, jsonResult.value[i].ELEMENT);
                      }
                  }
                }
              }
              else {
                  return done(null, jsonResult.value[0].ELEMENT);
              }
          }
          else {
            done(new Error("Could not find Element."), false);
          }
      });
    }

    /**
     * Sends the type command to the device
     * @param {string} text The text to type
     * @param {function=} done A callback for completion
     */
    function type(text, done) {
      getElement(text, null, findElementBodyById, function(err, getElementResult) {
        if (getElementResult) {
          setTimeout(function () {
            tapElement(getElementResult, done);
          }, 500);
        }
        else {
          done(null, false);
        }
      });
    }

    /**
     * Sends the type command to the device
     * @param {string} elementName The name of the element to scroll to
     * @param {function=} done A callback for completion
     */
    function scrollToVisible(elementName, done) {
      sendWebDriverPostRequest('session/' + self.sessionId + "/wda/element/" + elementName + "/scroll", setScrollBody(), function (err, result) {
          if (err)  {
            soda.console.error(err.message);

            done(err, false);
          }
          else {
            soda.console.debug(result);
          }

          var jsonResult;

          try{
              jsonResult = JSON.parse(result);
          } catch(e){
              done(new Error("Could not parse JSON."), false);
          }

          return err ? done(err, false) : done(null, jsonResult.status === 0);
      });
    }

    /**
     * Sends the scroll to visible command to the device
     * @param {string} elementName The name of the element to scroll to
     * @param {string} direction The direction to scroll into
     * @param {function=} done A callback for completion
     */
    function scrollToVisibleWithDirection(elementName, direction, done) {
      sendWebDriverPostRequest('session/' + self.sessionId + "/wda/element/" + elementName + "/scroll", setScrollBodyWithDirection(direction), function (err, result) {
          if (err)  {
            soda.console.error(err.message);

            done(err, false);
          }
          else {
            soda.console.debug(result);
          }

          var jsonResult;

          try{
              jsonResult = JSON.parse(result);
          } catch(e){
              done(new Error("Could not parse JSON."), false);
          }

          return err ? done(err, false) : done(null, jsonResult.status === 0);
      });
    }

    /**
     * Sends the scroll command to the device
     * @param {string} elementName The name of the element to scroll to
     * @param {function=} done A callback for completion
     */
    function scroll(elementName, done) {
      sendWebDriverPostRequest('session/' + self.sessionId + "/wda/element/" + elementName + "/scroll", setScrollBody(), function (err, result) {
          if (err)  {
            soda.console.error(err.message);

            done(err, false);
          }
          else {
            soda.console.debug(result);
          }

          var jsonResult;

          try{
              jsonResult = JSON.parse(result);
          } catch(e){
              done(new Error("Could not parse JSON."), false);
          }

          return done(null, jsonResult.status === 0);
      });
    }

    /**
     * Sets the value on the device in a particular element
     * @param {string} elementName The name of the element to set the text on
     * @param {string} text The text to set
     * @param {function=} done A callback for completion
     */
    function setValue(elementName, text, done) {
      if (text.length > 0) {
        sendWebDriverPostRequest('session/' + self.sessionId + "/element/" + elementName + "/value", setElementBodyAsArray(text), function (err, result) {
            if (err)  {
              soda.console.error(err.message);

              done(err, false);
            }
            else {
              soda.console.debug(result);
            }

            var jsonResult;

            try{
                jsonResult = JSON.parse(result);
            } catch(e){
                done(new Error("Could not parse JSON."), false);
            }

            return err ? done(err, false) : done(null, jsonResult.status === 0);
        });
      }
      else {
        sendWebDriverPostRequest('session/' + self.sessionId + "/element/" + elementName + "/clear", setElementBodyAsArray(text), function (err, result) {
            if (err)  {
              soda.console.error(err.message);

              done(err, false);
            }
            else {
              soda.console.debug(result);
            }

            var jsonResult;

            try{
                jsonResult = JSON.parse(result);
            } catch(e){
                done(new Error("Could not parse JSON."), false);
            }

            return err ? done(err, false) : done(null, jsonResult.status === 0);
        });
      }
    }

    /**
     * Sends the tap command to the device at a particular coordinate
     * @param {string} x The x coordinate
     * @param {string} y The y coordinate
     * @param {function=} done A callback for completion
     */
    function clickXY(x, y, done) {
        // sytle can be: set or append
        sendWebDriverPostRequest('session/' + self.sessionId + "/tap/0", setclickXYBody(x, y), function (err, result) {
            if (err) done(err, false);

            soda.console.debug(result);
            var jsonResult = JSON.parse(result);
            return err ? done(err, false) : done(null, jsonResult.status === 0);
        });
    }

    /**
     * Taps on a particular element with a name
     * @param {string} elementName The name of the element to set the text on
     * @param {function=} done A callback for completion
     */
    function tapElement(elementName, done) {
      sendWebDriverPostRequest('session/' + self.sessionId + "/element/" + elementName + "/click", "", function (err, result) {
          if (err)  {
            soda.console.error(err.message);

            done(err, false);
          }
          else {
            soda.console.debug(result);
          }

          var jsonResult;

          try{
              jsonResult = JSON.parse(result);
          } catch(e){
              done(new Error("Could not parse JSON."), false);
          }

          return err ? done(err, false) : done(null, jsonResult.status === 0);
      });
    }

    /**
     * Sends a command to determine the status of the device
     * @param {function=} done A callback for completion
     */
    this.status = function(done) {
      sendWebDriverRequest('status', function (err, result) {
          if (err)  {
            soda.console.error(err.message);

            done(err, false);
          }
          else {
            soda.console.debug(result);
          }

          soda.console.debug(result);

          var jsonResult;

          try{
              jsonResult = JSON.parse(result);
          } catch(e){
              done(new Error("Could not parse JSON."), false);
          }

          if (jsonResult && jsonResult.sessionId) {
            self.sessionId = jsonResult.sessionId;
          }

          return done(null, self.sessionId);
      });
    };

    /**
     * Sends the command to install an application
     * @param {string} bundleId The bundle Id of the application
     * @param {string} appPath The path to the application
     * @param {function=} done A callback for completion
     */
    this.installApp = function(bundleId, appPath, done) {
      console.log('Installing app:', appPath);
        this.status(function(err, foundSessionId) {
          console.log('Installing app:', appPath, foundSessionId);
          sendWebDriverPostRequest('session', installBody(bundleId, appPath), function (err, result) {
              if (err)  {
                soda.console.error(err.message);

                done(err, false);
              }
              else {
                soda.console.debug(result);
              }

              var jsonResult;

              try{
                  jsonResult = JSON.parse(result);
              } catch(e){
                  done(new Error("Could not parse JSON."), false);
              }

              if (jsonResult && jsonResult.sessionId) {
                self.sessionId = jsonResult.sessionId;
              }

              return err ? done(err, false) : done(null, jsonResult.sessionId);
          });
        });
    };

    /**
     * Sends the command to get the source of the current screen dispalyed on the device
     * @param {function=} done A callback for completion
     */
    this.getSourceTree = function(done) {
      var sourceRequest = 'source';
      if (self.sessionId) {
        sourceRequest = 'session/' + self.sessionId + '/source';
      }

      sendWebDriverRequest(sourceRequest, function (err, result) {
          if (err)  {
            soda.console.error(err.message);

            done(err, false);
          }

          var jsonResult;

          try{
              jsonResult = JSON.parse(result);
          } catch(e){
              done(new Error("Could not parse JSON."), false);
          }

          if (jsonResult && jsonResult.value) {
              self.sessionId = jsonResult.sessionId;

              xml2js.parseString(jsonResult.value, { explicitArray: false }, (err, res) => {
                  return err ? done(err, false) : done(null, res);
              });
          }
          else {
              return done(new Error("Could not get source tree."), false);
          }
      });
    };

    /**
     * Sends the command to determine whether or not an element is visible
     * @param {string} elementName The name of the element to check on visibility
     * @param {function=} done A callback for completion
     */
    this.elementIsVisible = function(elementName, done) {
      sendWebDriverRequest('session/' + self.sessionId + "/element/" + elementName + "/displayed", function (err, result) {
          if (err)  {
            soda.console.error(err.message);

            done(err, false);
          }
          else {
            soda.console.debug(result);
          }

          var jsonResult;

          try{
              jsonResult = JSON.parse(result);
          } catch(e){
              done(new Error("Could not parse JSON."), false);
          }

          done(null, jsonResult.value);
      });
    };


    /**
     * Sends the command to find the current orientation of the device
     * @param {function=} done A callback for completion
     */
    this.getOrientation = function(done) {
      sendWebDriverRequest('session/' + self.sessionId + '/orientation', function (err, result) {
          if (err)  {
            soda.console.error(err.message);

            done(err, false);
          }
          else {
            soda.console.debug(result);
          }

          var jsonResult;

          try{
              jsonResult = JSON.parse(result);
          } catch(e){
              done(new Error("Could not parse JSON."), false);
          }

          return err ? done(err, false) : done(null, jsonResult.value);
      });
    };

    /**
     * Sends the command to get the current screen bounds
     * @param {function=} done A callback for completion
     */
    this.getScreenBounds = function(done) {
      sendWebDriverRequest('source', function (err, result) {
          if (err)  {
            soda.console.error(err.message);

            done(err, false);
          }
          else {
            soda.console.debug(result);
          }

          var jsonResult;

          try{
              jsonResult = JSON.parse(result);

              if (jsonResult && jsonResult.value) {
                  xml2js.parseString(jsonResult.value, { explicitArray: false }, (err, res) => {
                      return done(null, [res.XCUIElementTypeApplication.$.width, res.XCUIElementTypeApplication.$.height]);
                  });
              }
              else {
                  return done(new Error("Could not get source tree."), false);
              }
          } catch(e){
              done(new Error("Could not parse JSON."), false);
          }
      });
    };

    /**
     * Sends the command to get the current screen shot, then saves it to a file
     * @param {{}=} options Options to capture the screenshot with. Should include destination
     * @param {function=} done A callback for completion
     */
    this.takeScreenshot = function(options, done) {
      if(typeof options !== "object") options = {};
      if(!options.filename) options.filename = "Screenshot " + (new Date()).toLocaleDateString().replace(/\//g, ".") + ".png";
      if(!options.destination) options.destination = nodePath.join(settings.DEFAULT_FILE_LOCATION, options.filename);

      sendWebDriverRequest('screenshot', function (err, result) {
          soda.console.debug('Saved file to: ' + options.destination);

          if (err)  {
            soda.console.error(err.message);

            done(err, false);
          }

          var jsonResult;

          try{
              jsonResult = JSON.parse(result);
          } catch(e){
              done(new Error("Could not parse JSON."), false);
          }

          fs.writeFile(options.destination, jsonResult.value, 'base64', function (err) { if (err) soda.console.error(err.message); });

          return err ? done(err, false) : done(null, jsonResult.value);
      });
    };

    /**
     * Navigates to the home screen
     * @param {object} device The device in which to hide the foreground app
     * @param {{}=} options Options to support the framework
     * @param {function} done A callback for completion
     */
    this.home = function (options, done) {
      sendWebDriverPostRequest('homescreen', "", function (err, result) {
          if (err)  {
            soda.console.error(err.message);

            done(err, false);
          }
          else {
            soda.console.debug(result);
          }

          var jsonResult;

          try{
              jsonResult = JSON.parse(result);
          } catch(e){
              done(new Error("Could not parse JSON."), false);
          }

          if (jsonResult) {
              return done(null, jsonResult.status === 0);
          }
          else {
              return done(new Error("Could not go home."), false);
          }
      });
    };

    /**
     * Starts an application
     * @param {string} bundleId The bundle Id of the application
     * @param {function} done A callback for completion
     */
    this.startApplication = function(bundleId, done) {
      sendWebDriverPostRequest('session', openBody(bundleId), function (err, result) {
          if (err)  {
            soda.console.error(err.message);

            done(err, false);
          }

          self.applicationName = bundleId;

          var jsonResult;

          try{
              jsonResult = JSON.parse(result);
          } catch(e){
              done(new Error("Could not parse JSON."), false);
          }

          if (jsonResult) {
              if (jsonResult && jsonResult.sessionId) {
                self.sessionId = jsonResult.sessionId;
              }

              return done(null, jsonResult.status === 0);
          }
          else {
              return done(new Error("Could not start application."), false);
          }
      });
    };

    /**
     * Closes an application
     * @param {function} done A callback for completion
     */
     this.stopApplication = function(done) {
       sendWebDriverDeleteRequest('session/' + self.sessionId, function (err, result) {
           if (err)  {
             soda.console.error(err.message);

             done(err, false);
           }

           var jsonResult;

           try{
               jsonResult = JSON.parse(result);
           } catch(e){
               done(new Error("Could not parse JSON."), false);
           }

           if (jsonResult) {
                return done(null, jsonResult.status === 0);
           }
           else {
               return done(new Error("Could not stop application."), false);
           }
       });
     };

     /**
      * Type on the keyboard in the device
      * @param {string|number} text The text to type on keyboard
      * @param {function} done A callback for completion
      */
     this.typeOnKeyboard = function (text, done) {
       var splitText = text.split('');

       var attemptType = function(keys, alternates, callback) {
         var key = keys[0];

         setTimeout(function () {
           type(key, function (err, result) {
             if (!result) {
               if (alternates.length > 0) {
                 var alternate = alternates.shift();

                 setTimeout(function () {
                   type(alternate, function(err, result) {
                     if (result) {
                       setTimeout(function () {
                         type(key, function (err, result) {
                           if (result) {
                             keys.shift();

                             if (keys.length > 0) {
                               attemptType(keys, ["shift", "more", "shift", "more"], callback);
                             }
                             else {
                               callback(null, true);
                             }
                           }
                           else {
                             attemptType(keys, alternates, callback);
                           }
                         });
                       }, 500);
                     }
                     else {
                       done(new Error("Could not type element"), false);
                     }
                   });
                 }, 500);
               }
               else {
                 done(new Error("Could not type element"), false);
               }
             }
             else {
               keys.shift();

               if (keys.length > 0) {
                 setTimeout(function() {
                   attemptType(keys, ["shift", "more", "shift", "more"], callback);
                 }, 500);
               }
               else {
                 callback(null, true);
               }
             }
           });
         }, 500);
       };

       attemptType(splitText, ["shift", "more", "shift", "more"], done);
     };

     /**
      * Sets the text value on an element
      * @param {string} element The element to type
      * @param {string|number} text The text to type
      * @param {function=} done A callback for completion
      */
     this.setValue = function (element, text, done) {
       getElement(element.name, element, findElementBodyByElement, function(err, elementName) {
         if (err) done(err, false);

         setTimeout(function () {
           setValue(elementName, text, done);
         }, 500);
       });
     };

     /**
      * Tap on an element on the specified device
      * @param {string} element The element to tap
      * @param {{}=} options Options to support the framework
      * @param {function=} done A callback for completion
      */
     this.tap = function (element, options, done) {
       getElement(element.name, element, findElementBodyByElement, function(err, elementName) {
         if (err) done(err, false);

         if (!element.visible) {
           done(err, false);
         }
         else {
           setTimeout(function () {
             tapElement(elementName, done);
           }, 1000);
         }
       });
     };

     /**
      * Tap screen coordinates
      * @param {object} device The device in which to hide the foreground app
      * @param {{}=} options Options to support the framework
      * @param {function} done A callback for completion
      */
     this.tapXY = function (options, done) {
         var err = arguments.sodaexpect("object", "function|undefined|null").error;

         if(err) {
             if(done instanceof Function) done.call(self, err, false);
             return;
         }

         clickXY(options.x, options.y, done);
     };

     /**
      * Scroll to an element in a direction until it is visible
      * @param {string} element The name of the element to scroll to
      * @param {string} direction The direction to scroll into
      * @param {function=} done A callback for completion
      */
     this.scrollToVisibleWithDirection = function (element, direction, done) {
       if (element.visible) {
         done(null, true);
       }
       else if (element.parent) {
         getElement(element.parent.name, null, findElementBodyById, function(err, elementName) {
           if (err) done(err, false);

           setTimeout(function () {
             scroll(elementName, done);
           }, 500);
         });
       }
       else {
         getElement(element.name, element, findElementBodyByElement, function(err, elementName) {
           if (err) done(err, false);

           setTimeout(function () {
             scrollToVisibleWithDirection(elementName, direction, done);
           }, 500);
         });
       }
     };

     /**
      * Scroll to an element until it is visible
      * @param {string} element The name of the element to scroll to
      * @param {function=} done A callback for completion
      */
     this.scrollToVisible = function (element, done) {
       if (element.visible) {
         done(null, true);
       }
       else if (element.parent) {
         getElement(element.parent.name, null, findElementBodyById, function(err, elementName) {
           if (err) done(err, false);

           setTimeout(function () {
             scroll(elementName, done);
           }, 500);
         });
       }
       else {
         getElement(element.name, element, findElementBodyByElement, function(err, elementName) {
           if (err) done(err, false);

           setTimeout(function () {
             scrollToVisible(elementName, done);
           }, 500);
         });
       }
     };

     /**
      * Scroll to an element in a direction
      * @param {string} direction The direction to scroll into
      * @param {string} element The name of the element to scroll to
      * @param {function=} done A callback for completion
      */
     this.scroll = function (direction, element, done) {
       if (element.parent) {
         getElement(element.parent.name, null, findElementBodyById, function(err, elementName) {
           if (err) done(err, false);

           setTimeout(function () {
             scrollToVisibleWithDirection(elementName, direction, done);
           }, 500);
         });
       }
       else {
         getElement(element.name, element, findElementBodyByElement, function(err, elementName) {
           if (err) done(err, false);

           setTimeout(function () {
             scrollToVisibleWithDirection(elementName, direction, done);
           }, 500);
         });
       }
     };
};

module.exports = WebDriver;
