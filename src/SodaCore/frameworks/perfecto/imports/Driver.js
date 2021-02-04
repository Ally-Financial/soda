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

var xml2js = require('xml2js'),
    fs     = require('fs'),
    fsPromises = fs.promises,
    util = require('util'),
    nodePath    = require("path");

/**
 * Driver connector for Soda to Perfecto
 * @param {Soda} soda A Soda instance
 * @constructor
 */
var PerfectoDriver = function (soda) {
    var self = this,
        executionId = null,
        deviceId = null,
        runtime = null,
        os = null,
        applicationName = null,
        stillRunning = true,
        OPERATION_COMMAND = 'operation=command',
        EXECUTION_STRING = '/services/executions/',
        REPOSITORY_STRING = '/services/repositories/',
        APPLICATION_ELEMENT = '&command=application.element',
        WEBPAGE_ELEMENT = '&command=webpage.element',
        APPLICATION_COMMAND = '&command=application',
        APPLICATION_WEBPAGE = '&command=webpage',
        HANDSET_COMMAND = '&command=handset',
        FIND_SUB_COMMAND = '&subcommand=find',
        INSTALL_SUBCOMMAND = '&subcommand=install',
        UNINSTALL_SUBCOMMAND = '&subcommand=uninstall',
        EXECUTE_SUBCOMMAND = '&subcommand=execute',
        OPEN_SUBCOMMAND = '&subcommand=open',
        SETUP_SUBCOMMAND = '&subcommand=setup',
        RECOVER_SUBCOMMAND = '&subcommand=recover',
        CLOSE_SUBCOMMAND = '&subcommand=close',
        READY_SUBCOMMAND = '&subcommand=ready',
        LOCK_SUBCOMMAND = '&subcommand=lock',
        DEVICE_COMMAND = '&command=device',
        KEY_COMMAND = '&command=key',
        TOUCH_COMMAND = '&command=touch',
        INFO_SUBCOMMAND = '&subcommand=info',
        CLEAN_SUBCOMMAND = '&subcommand=clean',
        IMAGE_SUBCOMMAND = '&subcommand=image',
        SCREEN_COMMAND = '&command=screen',
        KEYBOARD_COMMAND = '&command=keyboard',
        DISPLAY_SUBCOMMAND = '&subcommand=display',
        SET_COMMAND = '&subcommand=set',
        TAP_COMMAND = '&subcommand=tap',
        CLICK_COMMAND = '&subcommand=click',
        SWIPE_SUBCOMMAND = '&subcommand=swipe',
        TYPE_COMMAND = '&command=typetext',
        EVENT_SUBCOMMAND = '&subcommand=event',
        FRAMEWORK_PARAM = '&param.framework=appium-1.3.4',
        //FRAMEWORK_ANDROID_PARAM = '&param.framework=perfectoMobile',
        FRAMEWORK_ANDROID_PARAM  = '&param.framework=appium-1.3.4',
        CLICKXY_COMMAND = '&subcommand=tap',
        SCROLL_COMMAND = '&subcommand=swipe',
        MONITOR_COMMAND = '&command=monitor',
        START_SUBCOMMAND = '&subcommand=start',
        STOP_SUBCOMMAND = '&subcommand=stop',
        TEXT_COMMAND = '&command=text',
        running = false,
        /**
         * @associates PerfectoConfiguration
         * @type {Object}
         */
        settings = (require(nodePath.join(__dirname, 'Config.js')))(soda),

        /**
         * @associates Tree
         * @type {Object}
         */
        Tree = new (require(nodePath.join(__dirname, 'Tree.js')))(soda),
        request = new (require(nodePath.join(__dirname, "..", '..', '..', 'lib', 'Classes', 'Request')))(soda);

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
     * Upload a file to Perfecto
     * @param {string} path The path for the command to send
     * @param {string} file The path to the file
     * @param {function=} done A callback for completion
     */
    function sendFile(path, file, done) {
      soda.console.debug("Upload Request--------"+settings.PERFECTO_HOST+path+" file: " + file);

      queue.add_function(function(){
        fs.exists(file, function (exists) {
            if(exists) {
              soda.console.debug("File " + file + " exists...creating stream");

              request.put(settings.PERFECTO_HOST, path, fs.readFileSync(file), function (err, body) {
                  queue.running = false;
                  queue.next();

                  if (err) { done(err, false); }

                  soda.console.debug("File " + file + " upload complete");

                  done(err, body);
              });
            }
            else {
              queue.running = false;
              queue.next();

              soda.console.debug("File " + file + " not found");

              done(new Error("Could not find application file:" + file), null);
            }
        });
      });
    }

    /**
     * Send a command to Perfecto as binary using a get request
     * @param {string} path The path for the command to send
     * @param {function=} done A callback for completion
     */
    function sendBinaryPerfectoRequest(path, done) {
        soda.console.debug("Binary URL Request--------"+settings.PERFECTO_HOST+path);

        queue.add_function(function(){
          request.get(settings.PERFECTO_HOST, path, { encoding: 'binary', timeout: 15000 }, function (err, body) {
              queue.running = false;
              queue.next();

              if (err) { done(err, false); }

              done(err, body.returnValue);
          });
        });
    }

    /**
     * Send a command to Perfecto using a get request
     * @param {string} path The path for the command to send
     * @param {function=} done A callback for completion
     */
    function sendPerfectoRequest(path, done) {
      soda.console.debug("URL Request--------"+settings.PERFECTO_HOST+path);
      queue.add_function(function(){
        request.get(settings.PERFECTO_HOST, path, { timeout: 200000 }, function (err, body) {
            queue.running = false;
            queue.next();

            if (err) { done(err, false); }

            done(err, body ? body.returnValue : null);
        });
      });
    }

    /**
     * Send a command to Perfecto using a get request
     * @param {string} path The path for the command to send
     * @param {number} timeout The number of milliseconds in which to timeout
     * @param {function=} done A callback for completion
     */
    function sendPerfectoRequestWithTimeout(path, timeout, done) {
      soda.console.debug("URL Request--------"+settings.PERFECTO_HOST+path);

      queue.add_function(function(){
        request.get(settings.PERFECTO_HOST, path, { timeout: timeout+15000 }, function (err, response, body) {
            queue.running = false;
            queue.next();

            if (err) { done(err, false); }

            done(err, body.returnValue);
        });
      });
    }

    /**
     * The user parameter default string to add to the URL
     * @returns {string} A string to append to the URL
     */
    function userParams() {
        return '&securityToken=eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJZMlVCeVdpUXVacGctQl9QdWhiQ3VMVHBrMGF2TVE1U1BIX25URWp0bEZNIn0.eyJqdGkiOiIyZGY3N2YxYS1jMTdiLTQ1ZWQtOWU3MC05M2U0NDUwMjYwNDUiLCJleHAiOjAsIm5iZiI6MCwiaWF0IjoxNTUyMDcyNDU5LCJpc3MiOiJodHRwczovL2F1dGgucGVyZmVjdG9tb2JpbGUuY29tL2F1dGgvcmVhbG1zL2FsbHktcGVyZmVjdG9tb2JpbGUtY29tIiwiYXVkIjoib2ZmbGluZS10b2tlbi1nZW5lcmF0b3IiLCJzdWIiOiIyODYwMmFhZS0wODRjLTQzYTQtOWE4ZC1kMzAwOTZhNTQwZTMiLCJ0eXAiOiJPZmZsaW5lIiwiYXpwIjoib2ZmbGluZS10b2tlbi1nZW5lcmF0b3IiLCJub25jZSI6ImU1MmU1ZmJkLTZjZWEtNDU1Ny04MTJjLTFhMDYyOGNiNTRmOCIsImF1dGhfdGltZSI6MCwic2Vzc2lvbl9zdGF0ZSI6IjA1ZGUwMjgwLTk4OWQtNDhlMy1iNDg0LWI4ZjgwYmEzYzhmYiIsInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fX0.ikDw5ivNs86UH8wMRCCyNnsIAuUhD9-JJ_ECJh5Hx4vJ-NvbFtvvRc6eDjbLp8DMZmVawTeN2kSD7pps7kjJlSaSN639lnI3qyc7UnMmnHaAIiT407IZVmsw3pKrhoVVFCd-hFgsRpQFttlfiu_AHK6xSRqnmWfuuEfJa1BafoWc7h26-z0Dj_De3iw8A1mdXLUocK0BJtaKNykE9TUC4cb9xgfUpQspuTwPbeRkHheUCc-0-QvT7bxnio76UfnIMO5HWAAfqB_o6EWR1qgcUQ3aNGPyBjdcT7vLT_an2JCUBriBwKe_m3jy8QqUfaAuOfqcjU-wgyYFSv6LwCEEAw';
    }

    /**
     * The handset id parameter default string to add to the URL
     * @returns {string} A string to append to the URL
     */
    function paramHandSetId() {
        return '&param.handsetId='+self.deviceId;
    }

    /**
     * The instrument parameter to add to the URL
     * @returns {string} A string to append to the URL
     */
    function instrumentParam() {
      if (soda.config.get("platform").toLowerCase() === "android" || soda.config.get("platform").toLowerCase() === "androidtab") {
          return '&param.instrument=instrument';
      }
      else {
          return '&param.instrument=instrument';
      }
    }

    /**
     * The instrument parameter to add to the URL
     * @returns {string} A string to append to the URL
     */
    function sensorParam() {
      if (soda.config.get("platform").toLowerCase() === "android" || soda.config.get("platform").toLowerCase() === "androidtab") {
          return '&param.sensorInstrument=sensor';
      }
      else {
          return '&param.sensorInstrument=sensor';
      }
    }

    /**
     * The execution string parameter with the execution id as default string to add to the URL
     * @returns {string} A string to append to the URL
     */
    function executionStringWithId() {
        return EXECUTION_STRING+self.executionId+'?';
    }

    /**
     * The execution string parameter without the execution id as default string to add to the URL
     * @returns {string} A string to append to the URL
     */
    function executionStringWithoutId() {
        return EXECUTION_STRING;
    }

    /**
     * Gets the current execution id
     * @returns {string} The execution id
     */
    this.getExecutionId = function() {
        return self.executionId;
    };

    /**
     * Tells whether a service call is still running
     * @returns {boolean} Whether the service call is still running
     */
    this.isStillRunning = function() {
        return self.stillRunning;
    };

    /**
     * Sets whether a service call is still running
     * @param {boolean} val Sets whether the service call is still running
     */
    this.setIsStillRunning = function(val) {
        self.stillRunning = val;
    };

    /**
     * Returns the list of available handsets in Perfecto
     * @param {function=} done A callback for completion
     */
    self.listAvailableHandsets = function(done) {
        sendPerfectoRequest('/services/handsets?operation=list'+userParams(), function (err, result) {
            if (err) { done(err, false); }

            try {
                xml2js.parseString(result, { explicitArray: false }, (err, res) => {
                    if (err) { done(err, false); }

                    var devices = [];

                    if (res && res.handsets) {
                      res.handsets.handset.sodaeach(function (device) {
                        devices.push(device);
                      });
                    }

                    return err ? done(err, false) : done(null, devices);
                });
            }
            catch (e) {
                done(new Error(e.message), false);
            }

        });
    };

    /**
     * Starts an execution block in Perfecto
     * @param {function=} done A callback for completion
     */
    self.beginExecutionBlock = function(done) {
        sendPerfectoRequest(EXECUTION_STRING+'?operation=start'+userParams(), function (err, result) {
            if (err) { done(err, false); }

            try {
                var jsonResult = {};

                try {
                  jsonResult = JSON.parse(result);
                }
                catch (e) {
                  jsonResult = result;
                }

                if (jsonResult.executionId) {
                    self.executionId = jsonResult.executionId;
                    return err ? done(err, false) : done(null, jsonResult.reason === "Success");
                }
                else {
                    done(err, false);
                }
            }
            catch (e) {
                soda.console.error(e.message);
                done(new Error(e.message), false);
            }

        });
    };

    /**
     * Ends an execution block in Perfecto
     * @param {function=} done A callback for completion
     */
    this.endExecutionBlock = function(done) {
        sendPerfectoRequest(EXECUTION_STRING+self.executionId+'?operation=end'+userParams(), function (err, result) {
            if (err) { done(err, false); }

            try {
                var jsonResult = {};

                try {
                  jsonResult = JSON.parse(result);
                }
                catch (e) {
                  jsonResult = result;
                }

                return err ? done(err, false) : done(null, jsonResult.reason === "Success");
            }
            catch (e) {
                soda.console.error(e.message);
                done(new Error(e.message), false);
            }

        });
    };

    /**
     * Sets a persona in Perfecto
     * @param {string} name Sets a Persona for the current device
     * @param {function=} done A callback for completion
     */
    this.setPersona = function(name, done) {
      // Georgia or Peter or Ross or Sam or Sara
      sendPerfectoRequest(executionStringWithId()+OPERATION_COMMAND+DEVICE_COMMAND+SETUP_SUBCOMMAND+'&param.persona='+name+paramHandSetId()+userParams(), function (err, result) {
          if (err) { done(err, false); }

          soda.console.debug(result);

          try {
              var jsonResult = {};

                try {
                  jsonResult = JSON.parse(result);
                }
                catch (e) {
                  jsonResult = result;
                }

              return err ? done(err, false) : done(null, jsonResult.reason === "Success");
          }
          catch (e) {
              soda.console.error(e.message);
              done(new Error(e.message), false);
          }
      });
    };

    /**
     * Starts monitoring on the current run in Perfecto
     * @param {function=} done A callback for completion
     */
    this.startMonitor = function(done) {
        sendPerfectoRequest(executionStringWithId()+OPERATION_COMMAND+MONITOR_COMMAND+START_SUBCOMMAND+'&param.interval=10'+paramHandSetId()+userParams(), function (err, result) {
            if (err) { done(err, false); }

            soda.console.debug(result);

            try {
                var jsonResult = {};

                try {
                  jsonResult = JSON.parse(result);
                }
                catch (e) {
                  jsonResult = result;
                }

                return err ? done(err, false) : done(null, jsonResult.reason === "Success");
            }
            catch (e) {
                soda.console.error(e.message);
                done(new Error(e.message), false);
            }
        });
    };

    /**
     * Stops monitoring on the current run in Perfecto
     * @param {function=} done A callback for completion
     */
    this.stopMonitor = function(done) {
        sendPerfectoRequest(executionStringWithId()+OPERATION_COMMAND+MONITOR_COMMAND+STOP_SUBCOMMAND+paramHandSetId()+userParams(), function (err, result) {
            if (err) { done(err, false); }

            soda.console.debug(result);

            try {
                var jsonResult = {};

                try {
                  jsonResult = JSON.parse(result);
                }
                catch (e) {
                  jsonResult = result;
                }

                return err ? done(err, false) : done(null, jsonResult.reason === "Success");
            }
            catch (e) {
                soda.console.error(e.message);
                done(new Error(e.message), false);
            }
        });
    };

    /**
     * Opens the current handset to run tests on in Perfecto
     * @param {function=} done A callback for completion
     */
    this.openHandSet = function(done) {
        sendPerfectoRequest(executionStringWithId()+OPERATION_COMMAND+DEVICE_COMMAND+OPEN_SUBCOMMAND+'&param.script=noscript&param.video=record'+paramHandSetId()+userParams(), function (err, result) {
            if (err) { done(err, false); }

            soda.console.debug(result);

            try {
                var jsonResult = {};

                try {
                  jsonResult = JSON.parse(result);
                }
                catch (e) {
                  jsonResult = result;
                }

                return err ? done(err, false) : done(null, jsonResult.reason === "Success");
            }
            catch (e) {
                soda.console.error(e.message);
                done(new Error(e.message), false);
            }
        });
    };

    /**
     * Closes the current handset that tests are running on in Perfecto
     * @param {function=} done A callback for completion
     */
    this.closeHandSet = function(done) {
        sendPerfectoRequest(executionStringWithId()+OPERATION_COMMAND+DEVICE_COMMAND+CLOSE_SUBCOMMAND+'&param.script=noscript'+paramHandSetId()+userParams(), function (err, result) {
            if (err) { done(err, false); }

            soda.console.debug(result);
            var jsonResult = {};

                try {
                  jsonResult = JSON.parse(result);
                }
                catch (e) {
                  jsonResult = result;
                }

            return err ? done(err, false) : done(null, jsonResult.reason === "Success");
        });
    };

    /**
     * Recovers the current handset in Perfecto
     * @param {function=} done A callback for completion
     */
    this.recoverHandSet = function(done) {
        sendPerfectoRequest(executionStringWithId()+OPERATION_COMMAND+DEVICE_COMMAND+RECOVER_SUBCOMMAND+paramHandSetId()+userParams(), function (err, result) {
            if (err) { done(err, false); }

            soda.console.debug(result);

            try {
                var jsonResult = {};

                try {
                  jsonResult = JSON.parse(result);
                }
                catch (e) {
                  jsonResult = result;
                }

                return err ? done(err, false) : done(null, jsonResult.reason === "Success");
            }
            catch (e) {
                soda.console.error(e.message);
                done(new Error(e.message), false);
            }
        });
    };

    /**
     * Reclaims a particular device in Perfecto
     * @param {string} deviceId The device id to reclaim
     * @param {function=} done A callback for completion
     */
    this.reclaimDevice = function(deviceId, done) {
      self.deviceId = deviceId;

      self.getLastExecutionId(function(err, executionId) {
        if (err) { done(err, false); }

        self.executionId = executionId;

        self.closeHandSet(function(err, result) {
          if (err) { done(err, false); }

          soda.console.debug(result);

          self.endExecutionBlock(done);
        });
      });
    };

    /**
     * Gets the last execution id that ran in Perfecto for this user
     * @param {function=} done A callback for completion
     */
    this.getLastExecutionId = function(done) {
      sendPerfectoRequest(executionStringWithoutId()+'?operation=list&time.anchor=-1'+userParams(), function (err, result) {
          if (err) { done(err, false); }

          try {
            var jsonResult = JSON.parse(result),
                executionId = null;
            if (jsonResult.executions) {
                var lastExecutionId = '';

                for (var i = 0; i < jsonResult.executions.length; i++) {
                  if (lastExecutionId < jsonResult.executions[i].executionId) {
                      lastExecutionId = jsonResult.executions[i].executionId;
                  }
                }

                executionId = lastExecutionId;
            }

            return err ? done(err, false) : done(null, executionId);
          }
          catch (e) {
              soda.console.error(e.message);
              done(new Error(e.message), false);
          }
      });
    };

    /**
     * Takes a handset to the home screen in Perfecto
     * @param {function=} done A callback for completion
     */
    function homeHandSet(done) {
        sendPerfectoRequest(executionStringWithId()+OPERATION_COMMAND+HANDSET_COMMAND+READY_SUBCOMMAND+paramHandSetId()+userParams(), function (err, result) {
            if (err) { done(err, false); }

            soda.console.debug(result);

            try {
                var jsonResult = {};

                try {
                  jsonResult = JSON.parse(result);
                }
                catch (e) {
                  jsonResult = result;
                }

                return err ? done(err, false) : done(null, jsonResult.reason === "Success");
            }
            catch (e) {
                soda.console.error(e.message);
                done(new Error(e.message), false);
            }
        });
    }

    /**
     * Locks a handset for the specified number of seconds in Perfecto
     * @param {number} seconds The number of seconds to lock the handset
     * @param {function=} done A callback for completion
     */
    function lockHandSet(seconds, done) {
        sendPerfectoRequestWithTimeout(executionStringWithId()+OPERATION_COMMAND+SCREEN_COMMAND+LOCK_SUBCOMMAND+'&param.timeout='+seconds+paramHandSetId()+userParams(), parseInt(seconds)*1000, function (err, result) {
            if (err) { done(err, false); }

            soda.console.debug(result);

            try {
                var jsonResult = {};

                try {
                  jsonResult = JSON.parse(result);
                }
                catch (e) {
                  jsonResult = result;
                }

                return err ? done(err, false) : done(null, jsonResult.reason === "Success");
            }
            catch (e) {
                soda.console.error(e.message);
                done(new Error(e.message), false);
            }
        });
    }

    /**
     * Hides the keyboard on the current handset in Perfecto
     * @param {function=} done A callback for completion
     */
    this.hideKeyboard = function(done) {
        sendPerfectoRequest(executionStringWithId()+OPERATION_COMMAND+KEYBOARD_COMMAND+DISPLAY_SUBCOMMAND+paramHandSetId()+'&param.mode=off'+userParams(), function (err, result) {
            if (err) { done(err, false); }

            soda.console.debug(result);

            try {
                var jsonResult = {};

                try {
                  jsonResult = JSON.parse(result);
                }
                catch (e) {
                  jsonResult = result;
                }

                return err ? done(err, false) : done(null, jsonResult.reason === "Success");
            }
            catch (e) {
                soda.console.error(e.message);
                done(new Error(e.message), false);
            }
        });
    };

    /**
     * Restores the keyboard on the current handset in Perfecto
     * @param {function=} done A callback for completion
     */
    this.restoreKeyboard = function(done) {
        sendPerfectoRequest(executionStringWithId()+OPERATION_COMMAND+KEYBOARD_COMMAND+DISPLAY_SUBCOMMAND+paramHandSetId()+'&param.mode=auto'+userParams(), function (err, result) {
            if (err) { done(err, false); }

            soda.console.debug(result);

            try {
                var jsonResult = {};

                try {
                  jsonResult = JSON.parse(result);
                }
                catch (e) {
                  jsonResult = result;
                }

                return err ? done(err, false) : done(null, jsonResult.reason === "Success");
            }
            catch (e) {
                soda.console.error(e.message);
                done(new Error(e.message), false);
            }
        });
    };

    /**
     * Lists the items in a particular area and respositry in Perfecto
     * @param {string} area The area to list the items
     * @param {string} repositoryId The id of the repository to list items in
     * @param {function=} done A callback for completion
     */
    this.listItems = function(area, repositoryId, done) {
        listRepositoryItems(area, repositoryId, done);
    };

    /**
     * Sends the list repository item command to Perfecto
     * @param {string} area The area to list the items
     * @param {string} repositoryId The id of the repository to list items in
     * @param {function=} done A callback for completion
     */
    function listRepositoryItems(area, repositoryId, done) {
        sendPerfectoRequest(REPOSITORY_STRING+area+'/'+repositoryId+'?operation=list'+userParams(), function (err, result) {
            if (err) { done(err, false); }

            try {
                var jsonResult = {};

                try {
                  jsonResult = JSON.parse(result);
                }
                catch (e) {
                  jsonResult = result;
                }

                return err ? done(err, false) : done(null, jsonResult.items);
            }
            catch (e) {
                soda.console.error(e.message);
                done(new Error(e.message), false);
            }

        });
    }

    /**
     * Sends the take screen shot command to Perfecto
     * @param {string} fileName The filename where the screenshot should be stored
     * @param {function=} done A callback for completion
     */
    function takePerfectoScreenShot(fileName, done) {
        sendPerfectoRequest(executionStringWithId()+OPERATION_COMMAND+SCREEN_COMMAND+IMAGE_SUBCOMMAND+paramHandSetId()+'&param.format=png&param.report.resolution=low&param.source=primary&param.key='+settings.PERFECTO_IMAGE_REPOSITORY+'/'+fileName+userParams(), function (err, result) {
            if (err) { done(err, false); }

            try {
                var jsonResult = {};

                try {
                  jsonResult = JSON.parse(result);
                }
                catch (e) {
                  jsonResult = result;
                }
                return err ? done(err, false) : done(null, jsonResult.reason === "Success");
            }
            catch (e) {
                soda.console.error(e.message);
                done(new Error(e.message), false);
            }
        });
    }

    /**
     * Sends the collect resolution command to Perfecto
     * @param {function=} done A callback for completion
     */
    function getResolution(done) {
      sendPerfectoRequest(executionStringWithId()+OPERATION_COMMAND+DEVICE_COMMAND+INFO_SUBCOMMAND+paramHandSetId()+'&param.property=resolution'+userParams(), function (err, result) {
          if (err) { done(err, false); }

          try {
              var jsonResult = {};

                try {
                  jsonResult = JSON.parse(result);
                }
                catch (e) {
                  jsonResult = result;
                }

              var resolution = jsonResult.returnValue.split('*');

              return err ? done(err, false) : done(null, resolution);
          }
          catch (e) {
              soda.console.error(e.message);
              done(new Error(e.message), false);
          }
      });
  }

/**
 * Sends the get screen command to Perfecto and parses it from XML to JSON
 * @param {function=} done A callback for completion
 */
  function getScreen(done) {
        if (soda.config.get("platform").toLowerCase() === "android" || soda.config.get("platform").toLowerCase() === "androidtab") {
          sendPerfectoRequest(executionStringWithId()+OPERATION_COMMAND+APPLICATION_COMMAND+INFO_SUBCOMMAND+paramHandSetId()+'&param.property=source'+FRAMEWORK_ANDROID_PARAM+userParams(), function (err, result) {
            if (err) { done(err, false); }
              try {
                  var jsonResult = {};

                try {
                  jsonResult = JSON.parse(result);
                }
                catch (e) {
                  jsonResult = result;
                }

                  if (jsonResult) {
                    xml2js.parseString(jsonResult.replace('<u>', '').replace('</u>', ''), { explicitArray: false, strict: true }, (err, res) => {

                        if (err) { done(err, false); }

                        if (!res || !res.hierarchy) {
                            res.hierarchy = {};
                        }

                        return err ? done(err, false) : done(null, res.hierarchy);
                    });
                  }
                  else {
                    done(new Error("Could not get screen"), false);
                  }
              }
              catch (e) {
                  soda.console.error(e.message);
                  done(new Error(e.message), false);
              }
          });
        }
        else if (soda.config.get("platform").toLowerCase() === "iphoneweb" || soda.config.get("platform").toLowerCase() === "ipadweb" || soda.config.get("platform").toLowerCase() === "androidweb" || soda.config.get("platform").toLowerCase() === "androidtabweb") {
          if (soda.config.get("platform").toLowerCase() === "androidtabweb" || soda.config.get("platform").toLowerCase() === "androidweb") {
            sendPerfectoRequest(executionStringWithId()+OPERATION_COMMAND+APPLICATION_COMMAND+INFO_SUBCOMMAND+paramHandSetId()+'&param.property=source'+FRAMEWORK_ANDROID_PARAM+userParams(), function (err, result) {
              if (err) { done(err, false); }

                try {
                    var jsonResult = {};

                try {
                  jsonResult = JSON.parse(result);
                }
                catch (e) {
                  jsonResult = result;
                }

                    if (jsonResult.returnValue) {
                      var strVal = jsonResult.replace(/(\r\n|\n|\r)/gm,"");

                      xml2js.parseString(strVal, { explicitArray: false, strict: true }, (err, res) => {
                          if (err) { done(err, false); }

                          if (!res.device) {
                              res.device = {};
                          }

                          var aTree = null;

                          if (!result.device) {
                            if (done) done(null, false);
                          }

                          sendPerfectoRequest(executionStringWithId()+OPERATION_COMMAND+APPLICATION_WEBPAGE+EXECUTE_SUBCOMMAND+paramHandSetId()+'&param.repositoryFile='+settings.PERFECTO_SCRIPT_REPOSITORY+'/Script.js'+userParams(), function (err, result) {
                            if (err) { done(err, false); }

                            sendPerfectoRequest(executionStringWithId()+OPERATION_COMMAND+APPLICATION_WEBPAGE+INFO_SUBCOMMAND+paramHandSetId()+'&param.property=outerHTML'+userParams(), function (err, result) {
                                if (err) { done(err, false); }

                                var jsonResult = {};

                                try {
                                  jsonResult = JSON.parse(result);
                                }
                                catch (e) {
                                  jsonResult = result;
                                }

                                if (jsonResult.returnValue) {
                                    var strVal = jsonResult.returnValue.toString().replace(/(\r\n|\n|\r)/gm,"");

                                    return err ? done(err, false) : done(null, strVal);
                                }
                                else {
                                  done(new Error("Could not get screen"), false);
                                }
                            });
                          });
                      });
                    }
                    else {
                      done(new Error("Could not get screen"), false);
                    }
                }
                catch (e) {
                    soda.console.error(e.message);
                    done(new Error(e.message), false);
                }
            });
          }
          else {
            sendPerfectoRequest(executionStringWithId()+OPERATION_COMMAND+APPLICATION_COMMAND+INFO_SUBCOMMAND+paramHandSetId()+'&param.property=source'+FRAMEWORK_PARAM+userParams(), function (err, result) {
              if (err) { done(err, false); }

                    try {
                        var jsonResult = {};

                    try {
                      jsonResult = JSON.parse(result);
                    }
                    catch (e) {
                      jsonResult = result;
                    }

                    if (jsonResult.returnValue) {
                      xml2js.parseString(jsonResult, { explicitArray: false }, (err, res) => {
                          if (!res || !res.hierarchy) {
                              res.hierarchy = {};
                          }

                          var iTree = null;

                          var win = {};
                          win.UIAWindow = res.AppiumAUT.UIAApplication.UIAWindow;
                          iTree = Tree.buildTree(win, {}, "ios");

                          if (iTree === false && done) {
                            done(new Error("Could not get tree from Perfecto"), false);
                          }

                          sendPerfectoRequest(executionStringWithId()+OPERATION_COMMAND+APPLICATION_WEBPAGE+EXECUTE_SUBCOMMAND+paramHandSetId()+'&param.repositoryFile='+settings.PERFECTO_SCRIPT_REPOSITORY+'/Script.js'+userParams(), function (err, result) {
                            if (err) { done(err, false); }

                            sendPerfectoRequest(executionStringWithId()+OPERATION_COMMAND+APPLICATION_WEBPAGE+INFO_SUBCOMMAND+paramHandSetId()+'&param.property=outerHTML'+userParams(), function (err, result) {
                                if (err) { done(err, false); }

                                var jsonResult = {};

                                try {
                                  jsonResult = JSON.parse(result);
                                }
                                catch (e) {
                                  jsonResult = result;
                                }

                                if (jsonResult.returnValue) {
                                    var strVal = jsonResult.returnValue.toString().replace(/(\r\n|\n|\r)/gm,"");

                                    var res = strVal.match(/<sodadom.*>(.*?)<\/sodadom>/g).map(function(val){
                                       val = val.replace(/<\/?sodadom>/g,'');
                                       return val.replace(/<sodadom style="visibility: hidden;">/g,'');
                                    });

                                    res = res[0];

                                    res = JSON.parse(res);

                                    var first = res[Object.keys(res).shift()];

                                    res = first.children;

                                    delete iTree['window:1'].children['scrollview:0'].children['scrollview:1'].children['webview:0'].children;

                                    first = res[Object.keys(res).shift()];

                                    first.parent = {
                                      id: 'webview:0',
                                      name: iTree['window:1'].children['scrollview:0'].children['scrollview:1'].children['webview:0'].name ? iTree['window:1'].children['scrollview:0'].children['scrollview:1'].children['webview:0'].name : null,
                                      label: iTree['window:1'].children['scrollview:0'].children['scrollview:1'].children['webview:0'].label ? iTree['window:1'].children['scrollview:0'].children['scrollview:1'].children['webview:0'].label : null,
                                      value: iTree['window:1'].children['scrollview:0'].children['scrollview:1'].children['webview:0'].value ? iTree['window:1'].children['scrollview:0'].children['scrollview:1'].children['webview:0'].value : null
                                    };

                                    iTree['window:1'].children['scrollview:0'].children['scrollview:1'].children['webview:0'].children = res;

                                    return err ? done(err, false) : done(null, iTree);
                                }
                                else {
                                  done(new Error("Could not get screen"), false);
                                }
                            });
                          });
                      });
                    }
                    else {
                      done(new Error("Could not get screen"), false);
                    }
                }
                catch (e) {
                    soda.console.error(e.message);
                    done(new Error(e.message), false);
                }

            });
          }
        }
        else {
          sendPerfectoRequest(executionStringWithId()+OPERATION_COMMAND+APPLICATION_COMMAND+INFO_SUBCOMMAND+paramHandSetId()+'&param.property=source'+FRAMEWORK_PARAM+userParams(), function (err, result) {
              if (err) { done(err, false); }

              try {
                  var jsonResult = {};

                  try {
                    jsonResult = JSON.parse(result);
                  }
                  catch (e) {
                    jsonResult = result
                  }

                  xml2js.parseString(jsonResult, { explicitArray: false }, (err, res) => {
                      if (!res || !res.hierarchy) {
                          res.hierarchy = {};
                      }

                      return err ? done(err, false) : done(null, res);
                 });
              }
              catch (e) {
                  soda.console.error(e.message);
                  done(new Error(e.message), false);
              }
          });
        }
    }

    /**
     * Sends the reset device command to Perfecto
     * @param {function=} done A callback for completion
     */
    function reset(done) {
        sendPerfectoRequest(executionStringWithId()+OPERATION_COMMAND+APPLICATION_COMMAND+CLEAN_SUBCOMMAND+paramHandSetId()+'&param.name='+ self.applicationName +FRAMEWORK_PARAM+userParams(), function (err, result) {
            if (err) { done(err, false); }

            try {
                var jsonResult = {};

                try {
                  jsonResult = JSON.parse(result);
                }
                catch (e) {
                  jsonResult = result;
                }

                return err ? done(err, false) : done(null, jsonResult.reason === "Success");
            }
            catch (e) {
                soda.console.error(e.message);
                done(new Error(e.message), false);
            }

        });
    }

    /**
     * Sends the back command to Perfecto
     * @param {function=} done A callback for completion
     */
    function back(done) {
        sendPerfectoRequest(executionStringWithId()+OPERATION_COMMAND+KEY_COMMAND+EVENT_SUBCOMMAND+'&param.key=4&param.metastate=0' +paramHandSetId()+userParams(), function (err, result) {
            if (err) { done(err, false); }

            try {
                var jsonResult = {};

                try {
                  jsonResult = JSON.parse(result);
                }
                catch (e) {
                  jsonResult = result;
                }

                return err ? done(err, false) : done(null, jsonResult.reason === "Success");
            }
            catch (e) {
                soda.console.error(e.message);
                done(new Error(e.message), false);
            }
        });
    }

    /**
     * Sends the get screen shot command to Perfecto
     * @param {string} imageName The name of the image to store in the Perfecto repository area
     * @param {string} pathToWrite The path where the screenshot should be written to on the local machine
     * @param {function=} done A callback for completion
     */
    function getScreenShot(imageName, pathToWrite, done) {
        sendBinaryPerfectoRequest(REPOSITORY_STRING+settings.PERFECTO_IMAGE_AREA+'/'+settings.PERFECTO_IMAGE_REPOSITORY+'/'+imageName+'.png?operation=download'+userParams(), function (err, png) {
            if (err) { done(err, false); }

            try {
                fs.writeFile(pathToWrite, png, 'binary', function (err) { if (err) soda.console.error(err.message); });
            }
            catch (e) {
                soda.console.error(e.message);
            }

            done(err, png);
        });
    }

    /**
     * Sends the delete screen shot command to Perfecto
     * @param {string} imageName The name of the image to store in the Perfecto repository area
     * @param {function=} done A callback for completion
     */
    this.deleteScreenShot = function(imageName, done) {
        sendPerfectoRequest(REPOSITORY_STRING+settings.PERFECTO_IMAGE_AREA+'/'+imageName+'?operation=delete'+userParams(), function (err, result) {
          soda.console.debug(result);

          try {
              var jsonResult = {};

                try {
                  jsonResult = JSON.parse(result);
                }
                catch (e) {
                  jsonResult = result;
                }

              return err ? done(err, false) : done(null, jsonResult.reason === "Success");
          }
          catch (e) {
              soda.console.error(e.message);
              done(new Error(e.message), false);
          }
        });
    };

    /**
     * Sends the delete repository item command to Perfecto
     * @param {string} area The area to delete the item from
     * @param {string} repositoryId The id of the repository to delete from
     * @param {string} fileName The file name to delete from the repository
     * @param {function=} done A callback for completion
     */
    this.deleteRepositoryItem = function(area, repositoryId, fileName, done) {
        sendPerfectoRequest(REPOSITORY_STRING+area+'/'+ repositoryId + '/' + fileName+'?operation=delete'+userParams(), function (err, result) {
          if (err) { done(err, false); }

          soda.console.debug(result);
          var jsonResult = {};

                try {
                  jsonResult = JSON.parse(result);
                }
                catch (e) {
                  jsonResult = result;
                }

          return err ? done(err, false) : done(null, jsonResult.reason === "Success");
        });
    };

    /**
     * Sends the open application command to Perfecto
     * @param {string} applicationName The name of the applciation to open
     * @param {function=} done A callback for completion
     */
    function openApp(applicationName, done) {
        sendPerfectoRequest(executionStringWithId()+OPERATION_COMMAND+APPLICATION_COMMAND+OPEN_SUBCOMMAND+paramHandSetId()+'&param.name='+applicationName+userParams(), function (err, result) {
            if (err) { done(err, false); }

            try {
                var jsonResult = {};

                try {
                  jsonResult = JSON.parse(JSON.stringify(result));
                }
                catch (e) {
                  jsonResult = result;
                }

                return err ? done(err, false) : done(null, jsonResult.reason === "Success");
            }
            catch (e) {
                soda.console.error(e.message);
                done(new Error(e.message), false);
            }
        });
    }
    /**
     * Sends the close application command to Perfecto
     * @param {string} applicationName The name of the applciation to close
     * @param {function=} done A callback for completion
     */
    function closeApp(applicationName, done) {
        sendPerfectoRequest(executionStringWithId()+OPERATION_COMMAND+APPLICATION_COMMAND+CLOSE_SUBCOMMAND+paramHandSetId()+'&param.name='+applicationName+userParams(), function (err, result) {
            if (err) { done(err, false); }

            soda.console.debug(result);

            try {
                var jsonResult = {};

                try {
                  jsonResult = JSON.parse(result);
                }
                catch (e) {
                  jsonResult = result;
                }

                return err ? done(err, false) : done(null, jsonResult.reason === "Success");
            }
            catch (e) {
                soda.console.error(e.message);
                done(new Error(e.message), false);
            }
        });
    }

    /**
     * Sends the upload command to Perfecto to upload an item to a repository
     * @param {string} area The area to delete the item from
     * @param {string} repositoryId The id of the repository to delete from
     * @param {string} fileName The file name to delete from the repository
     * @param {string} filePath The path to the local file to upload
     * @param {function=} done A callback for completion
     */
    this.uploadFileToRepository = function(area, repositoryId, fileName, filePath, done) {
        sendFile(REPOSITORY_STRING+area+'/'+ repositoryId + '/' + fileName +'?operation=upload'+userParams()+'&overwrite=true'+userParams(), filePath, function (err, result) {
            if (err) { done(err, false); }

            soda.console.debug(result);

            try {
                var jsonResult = {};

                try {
                  jsonResult = JSON.parse(result);
                }
                catch (e) {
                  jsonResult = result;
                }

                return err ? done(err, false) : done(null, jsonResult.reason === "Success");
            }
            catch (e) {
                soda.console.error(e.message);
                done(new Error(e.message), false);
            }
        });
    };

    /**
     * Sends the install app command to Perfecto to install from a repository id item
     * @param {string} repositoryId The id of the repository to delete from
     * @param {function=} done A callback for completion
     */
    this.installApp = function(repositoryId, done) {
        sendPerfectoRequest(executionStringWithId()+OPERATION_COMMAND+APPLICATION_COMMAND+INSTALL_SUBCOMMAND+paramHandSetId()+'&param.file='+repositoryId+instrumentParam()+sensorParam()+userParams(), function (err, result) {
            if (err) { done(err, false); }

            soda.console.debug(err, result);

            try {
                var jsonResult = {};

                try {
                  jsonResult = JSON.parse(result);
                }
                catch (e) {
                  jsonResult = result;
                }

                return err ? done(err, false) : done(null, jsonResult.reason === "Success");
            }
            catch (e) {
                soda.console.error(e.message);
                done(new Error(e.message), false);
            }
        });
    };

    /**
     * Sends the uninstall app command to Perfecto to uninstall from a device
     * @param {string} applicationName The name of the application id to uninstall
     * @param {function=} done A callback for completion
     */
    this.uninstallApp = function(applicationName, done) {
        sendPerfectoRequest(executionStringWithId()+OPERATION_COMMAND+APPLICATION_COMMAND+UNINSTALL_SUBCOMMAND+'&param.name='+ applicationName+paramHandSetId()+userParams(), function (err, result) {
            if (err) { done(err, false); }

            soda.console.debug(err, result);

            try {
                var jsonResult = {};

                try {
                  jsonResult = JSON.parse(result);
                }
                catch (e) {
                  jsonResult = result;
                }

                if (jsonResult.reason === "Success") {
                    xml2js.parseString(jsonResult.returnValue, { explicitArray: false }, (err, res) => {
                        if (err) {
                          soda.console.error("Error: " + err);

                          return done(err, false);
                        }

                        return done(null, res);
                    });
                }
                else {
                  return done(new Error("Application wasn't uninstalled"), false);
                }
            }
            catch (e) {
                soda.console.error(e.message);
                done(new Error(e.message), false);
            }

        });
    };

    /**
     * Sends the send key command to Perfecto
     * @param {string} keyCommand The key to send
     * @param {function=} done A callback for completion
     */
    this.sendKeyCommand = function(keyCommand, done) {
      sendPerfectoRequest(executionStringWithId()+OPERATION_COMMAND+KEY_COMMAND+EVENT_SUBCOMMAND+"&param.key="+keyCommand+paramHandSetId()+userParams(), function (err, result) {
          if (err) { done(err, false); }

          soda.console.debug(result);

          try {
              var jsonResult = {};

                try {
                  jsonResult = JSON.parse(result);
                }
                catch (e) {
                  jsonResult = result;
                }

              return err ? done(err, false) : done(null, jsonResult.reason === "Success");
          }
          catch (e) {
              soda.console.error(e.message);
              done(new Error(e.message), false);
          }
      });
    };

    function setElement(elementType, elementName, style, value, web, done) {
        if (web) {
          // sytle can be: set or append
          sendPerfectoRequest(executionStringWithId()+OPERATION_COMMAND+WEBPAGE_ELEMENT+SET_COMMAND+paramHandSetId()+'&param.text='+ value +'&param.by='+ elementType + '&param.value=' + elementName + '&param.edit=' + style + FRAMEWORK_PARAM +userParams(), function (err, result) {
              if (err) { done(err, false); }

              soda.console.debug(result);

              try {
                  var jsonResult = {};

                try {
                  jsonResult = JSON.parse(result);
                }
                catch (e) {
                  jsonResult = result;
                }

                  return err ? done(err, false) : done(null, jsonResult.reason === "Success");
              }
              catch (e) {
                  soda.console.error(e.message);
                  done(new Error(e.message), false);
              }
          });
        }
        else {
          // sytle can be: set or append
          sendPerfectoRequest(executionStringWithId()+OPERATION_COMMAND+APPLICATION_ELEMENT+SET_COMMAND+paramHandSetId()+'&param.text='+ value +'&param.by='+ elementType + '&param.value=' + elementName + '&param.edit=' + style + FRAMEWORK_PARAM +userParams(), function (err, result) {
              if (err) { done(err, false); }

              soda.console.debug(result);

              try {
                  var jsonResult = {};

                try {
                  jsonResult = JSON.parse(result);
                }
                catch (e) {
                  jsonResult = result;
                }

                  return err ? done(err, false) : done(null, jsonResult.reason === "Success");
              }
              catch (e) {
                  soda.console.error(e.message);
                  done(new Error(e.message), false);
              }
          });
        }
    }

    /**
     * Sends the click element command to Perfecto
     * @param {string} elementType The element type to click, like id, label, etc.
     * @param {string} elementName The name of the element to click
     * @param {number} duration How long to hold the click down
     * @param {boolean} web Whether this is a webview or a native app
     * @param {function=} done A callback for completion
     */
    function clickElement(elementType, elementName, duration, web, done) {
        var durationString = '';
        if (parseInt(duration) > 0) {
          durationString = '&param.duration='+duration;
        }
        if (web) {
          // sytle can be: set or append
          sendPerfectoRequest(executionStringWithId()+OPERATION_COMMAND+WEBPAGE_ELEMENT+CLICK_COMMAND+paramHandSetId()+durationString+'&param.by='+ elementType + '&param.value=' + elementName + FRAMEWORK_PARAM +userParams(), function (err, result) {
              if (err) { done(err, false); }

              soda.console.debug(result);

              try {
                  var jsonResult = {};

                try {
                  jsonResult = JSON.parse(result);
                }
                catch (e) {
                  jsonResult = result;
                }

                  return err ? done(err, false) : done(null, jsonResult.reason === "Success");
              }
              catch (e) {
                  soda.console.error(e.message);
                  done(new Error(e.message), false);
              }
          });
        }
        else {
          // sytle can be: set or append
          sendPerfectoRequest(executionStringWithId()+OPERATION_COMMAND+APPLICATION_ELEMENT+TAP_COMMAND+paramHandSetId()+durationString+'&param.by='+ elementType + '&param.value=' + elementName + FRAMEWORK_PARAM +userParams(), function (err, result) {
              if (err) { done(err, false); }

              soda.console.debug(result);

              try {
                  var jsonResult = {};

                try {
                  jsonResult = JSON.parse(result);
                }
                catch (e) {
                  jsonResult = result;
                }

                  return err ? done(err, false) : done(null, jsonResult.reason === "Success");
              }
              catch (e) {
                  soda.console.error(e.message);
                  done(new Error(e.message), false);
              }
          });
        }
    }

    /**
     * Sends the click element command to Perfecto to a particular x, y coordinate
     * @param {string} x The x coordinate to click
     * @param {string} y The y coordinate to click
     * @param {number} duration How long to hold the click down
     * @param {function=} done A callback for completion
     */
    function clickXY(x, y, duration, done) {
        var durationString = '';
        if (parseInt(duration) > 0) {
          durationString = '&param.duration='+duration;
        }

        // sytle can be: set or append
        sendPerfectoRequest(executionStringWithId()+OPERATION_COMMAND+TOUCH_COMMAND+CLICKXY_COMMAND+durationString+'&param.location='+ x + ',' + y + paramHandSetId()+ userParams(), function (err, result) {
            if (err) { done(err, false); }

            soda.console.debug(result);

            try {
                var jsonResult = {};

                try {
                  jsonResult = JSON.parse(result);
                }
                catch (e) {
                  jsonResult = result;
                }

                return err ? done(err, false) : done(null, jsonResult.reason === "Success");
            }
            catch (e) {
                soda.console.error(e.message);
                done(new Error(e.message), false);
            }
        });
    }

    /**
     * Sends the find element command to Perfecto based upon a name
     * @param {string} name The name of the element to find
     * @param {function=} done A callback for completion
     */
    function findElement(name, done) {
      // sytle can be: set or append
      sendPerfectoRequest(executionStringWithId()+OPERATION_COMMAND+APPLICATION_ELEMENT+FIND_SUB_COMMAND+paramHandSetId()+'&param.by=linkText&param.value=' + name + userParams(), function (err, result) {
          if (err) { done(err, false); }

          soda.console.debug(result);

          try {
              var jsonResult = {};

                try {
                  jsonResult = JSON.parse(result);
                }
                catch (e) {
                  jsonResult = result;
                }
              return err ? done(err, false) : done(null, jsonResult.reason === "Success" && jsonResult.returnValue !== null);
          }
          catch (e) {
              soda.console.error(e.message);
              done(new Error(e.message), false);
          }

      });
    }

    /**
     * Sends the find element command to Perfecto based upon a name, and scrolls to it if it is not visible
     * @param {string} name The name of the element to find
     * @param {function=} done A callback for completion
     */
    function findElementWithScroll(name, done) {
      // sytle can be: set or append

      var urlEncodedName = encodeURIComponent(name);

      var wordPhrase = "&param.words=words";

      if (name.includes("℠") || name.includes("®")) {
          wordPhrase = "";
      }

      sendPerfectoRequest(executionStringWithId()+OPERATION_COMMAND+FIND_SUB_COMMAND+TEXT_COMMAND+paramHandSetId()+'&param.content=' + urlEncodedName + userParams() + "&param.scrolling=scroll&param.next=SWIPE_UP&param.context=all" + wordPhrase, function (err, result) {
          if (err) { done(err, false); }

          soda.console.debug(result);

          try {
              var jsonResult = {};

                try {
                  jsonResult = JSON.parse(result);
                }
                catch (e) {
                  jsonResult = result;
                }

              if (jsonResult.reason === "ValidationFailure") {
                sendPerfectoRequest(executionStringWithId()+OPERATION_COMMAND+FIND_SUB_COMMAND+TEXT_COMMAND+paramHandSetId()+'&param.content=' + urlEncodedName + userParams() + "&param.scrolling=scroll&param.next=SWIPE_DOWN&param.context=all" + wordPhrase, function (err, result) {
                    if (err) { done(err, false); }

                    soda.console.debug(result);
                    jsonResult = JSON.parse(result);

                    return err ? done(err, false) : done(null, jsonResult.reason === "Success" && jsonResult.returnValue !== null);
                });
              }
              else {
                return err ? done(err, false) : done(null, jsonResult.reason === "Success" && jsonResult.returnValue !== null);
              }
          }
          catch (e) {
              soda.console.error(e.message);
              done(new Error(e.message), false);
          }
      });
    }

    /**
     * Sends the scroll command to Perfecto to a particular starting and ending coordinate
     * @param {string} x0 The x starting coordinate to click from
     * @param {string} y0 The y starting coordinate to click from
     * @param {string} x1 The x ending coordinate to click to
     * @param {string} y1 The y ending coordinate to click to
     * @param {function=} done A callback for completion
     */
    function scroll(x0, y0, x1, y1, done) {
        // sytle can be: set or append
        sendPerfectoRequest(executionStringWithId()+OPERATION_COMMAND+TOUCH_COMMAND+SCROLL_COMMAND+paramHandSetId()+'&param.start='+ x0 + ',' + y0 + '&param.end=' + x1 + ',' + y1 + userParams(), function (err, result) {
            if (err) { done(err, false); }

            soda.console.debug(result);

            try {
                var jsonResult = {};

                try {
                  jsonResult = JSON.parse(result);
                }
                catch (e) {
                  jsonResult = result;
                }
                return err ? done(err, false) : done(null, jsonResult.reason === "Success");
            }
            catch (e) {
                soda.console.error(e.message);
                done(new Error(e.message), false);
            }
        });
    }

    /**
     * Sends the swipe command to Perfecto using starting and ending coordinate
     * @param {string} x0 The x starting coordinate to click from
     * @param {string} y0 The y starting coordinate to click from
     * @param {string} x1 The x ending coordinate to click to
     * @param {string} y1 The y ending coordinate to click to
     * @param {function=} done A callback for completion
     */
    function swipe(x0, y0, x1, y1, done) {
        // sytle can be: set or append
        sendPerfectoRequest(executionStringWithId()+OPERATION_COMMAND+TOUCH_COMMAND+SWIPE_SUBCOMMAND+paramHandSetId()+'&param.start='+ encodeURIComponent(x0) + ',' + encodeURIComponent(y0) + '&param.end=' + encodeURIComponent(x1) + ',' + encodeURIComponent(y1) + userParams(), function (err, result) {
            if (err) { done(err, false); }

            soda.console.debug(result);

            try {
                var jsonResult = {};

                try {
                  jsonResult = JSON.parse(result);
                }
                catch (e) {
                  jsonResult = result;
                }
                return err ? done(err, false) : done(null, jsonResult.reason === "Success");
            }
            catch (e) {
                soda.console.error(e.message);
                done(new Error(e.message), false);
            }
        });
    }

    /**
     * Sends the scroll command to Perfecto using a string with start and end already defined
     * @param {string} startAndEnd The start and end parameters
     * @param {function=} done A callback for completion
     */
    function scrollCalculated(startAndEnd, done) {
        sendPerfectoRequest(executionStringWithId()+OPERATION_COMMAND+TOUCH_COMMAND+SCROLL_COMMAND+paramHandSetId()+startAndEnd+ userParams(), function (err, result) {
            if (err) { done(err, false); }

            soda.console.debug(result);

            try {
                var jsonResult = {};

                try {
                  jsonResult = JSON.parse(result);
                }
                catch (e) {
                  jsonResult = result;
                }
                return err ? done(err, false) : done(null, jsonResult.reason === "Success");
            }
            catch (e) {
                soda.console.error(e.message);
                done(new Error(e.message), false);
            }
        });
    }

    /**
     * Sends the type command to Perfecto to whatever is waiting for it
     * @param {string} text The text to type
     * @param {function=} done A callback for completion
     */
    function typeText(text, done) {
      sendPerfectoRequest(executionStringWithId()+OPERATION_COMMAND+TYPE_COMMAND+paramHandSetId()+'&param.text=' + text + userParams(), function (err, result) {
          if (err) { done(err, false); }

          soda.console.debug(result);

          try {
              var jsonResult = {};

                try {
                  jsonResult = JSON.parse(result);
                }
                catch (e) {
                  jsonResult = result;
                }
              return err ? done(err, false) : done(null, jsonResult.reason === "Success");
          }
          catch (e) {
              soda.console.error(e.message);
              done(new Error(e.message), false);
          }
      });
    }

    /**
     * Gets the resolution of the device
     * @param {function=} done A callback for completion
     */
    this.getResolution = function(done) {
      getResolution(function (err, result) {
          return err ? done(err, false) : done(null, result);
      });
    };

    /**
     * Gets the application tree of the application's screen
     * @param {function=} done A callback for completion
     */
    this.getSourceTree = function(done) {
      getScreen(function (err, result) {
          return err ? done(err, false) : done(null, result);
      });
    };

    /**
     * Gets the screen shot of the device
     * @param {{}=} options Options to capture the screenshot with. Should include destination and filename
     * @param {function=} done A callback for completion
     */
    this.takeScreenshot = function takeScreenshot (options, done) {
      if(typeof options !== "object") options = {};
      if(!options.filename) options.filename = "Screenshot " + (new Date()).toLocaleDateString().replace(/\//g, ".") + ".png";
      if(!options.destination) options.destination = nodePath.join(settings.DEFAULT_FILE_LOCATION, options.filename);

      takePerfectoScreenShot(options.filename, function (err, result) {
        soda.console.debug('Took screen shot: ' + options.filename);

        listRepositoryItems(settings.PERFECTO_IMAGE_AREA, settings.PERFECTO_IMAGE_REPOSITORY, function (err, items) {
            soda.console.debug("List Repository Successfull");
            if (items) {
                soda.console.debug(items);

                getScreenShot(options.filename, options.destination, function (err, result) {
                    soda.console.debug('Saved file to: ' + options.destination);

                    fs.readFile(options.destination, function (err, fc) {
                      return err ? done(err, false) : done(null, result, fc.toString('base64'));
                    });
                });
            }
            else {
              return err ? done(err, false) : done(null, result);
            }
        });
      });
    };

    /**
     * Starts an application
     * @param {string} applicationName The application name to start
     * @param {function} done A callback for completion
     */
    this.startApplication = function(applicationName, done) {
      var err = arguments.sodaexpect("string", "function|undefined|null").error;

      if(err) {
          if(done instanceof Function) done.call(self, err, false);
          return;
      }

      self.applicationName = applicationName;
      openApp(applicationName, function (err, result) {
        soda.console.debug("Open App Complete with result of " + result);

        return err ? done(err, false) : done(null, result);
      });
    };

    /**
     * Closes an application
     * @param {string} applicationName The application name to stop
     * @param {function} done A callback for completion
     */
     this.stopApplication = function(applicationName, complete) {
       var err = arguments.sodaexpect("string", "function|undefined|null").error;

       if(err) {
           if(complete instanceof Function) complete.call(self, err, false);
           return;
       }

       self.applicationName = applicationName;
       closeApp(applicationName, function (err, result) {
         soda.console.debug("Close App Complete with result of " + result);

         return err ? complete(err, false) : complete(null, result);
       });
     };

     /**
      * Sets the text value on an element
      * @param {string} element The element to type
      * @param {string|number} text The text to type
      * @param {boolean} web Whether this is a webview or a native app
      * @param {function=} done A callback for completion
      */
    this.setValue = function (element, text, web, complete) {
        var err = arguments.sodaexpect("object", "string|number", "function|undefined|null|boolean", "function|undefined|null").error;
        if(err) {
            if(complete instanceof Function) complete.call(self, err, null);
            return;
        }

        soda.console.debug("Automator: Performing set value on device `" + self.deviceId + "` with element `" + element['name'] + "`");

        if (web) {
          setElement('id', element['id'], 'set', text, element.web ? element.web : false, function(err, result) {
            if (!result) {
              setElement('className', element['name'], 'set', text, element.web ? element.web : false, function(err, result) {
                if (!result) {
                  setElement('name', element['id'], 'set', text, element.web ? element.web : false, function(err, result) {
                    if (!result) {
                      setElement('linkText', element['value'], 'set', text, element.web ? element.web : false, complete);
                    }
                    else {
                      complete(null, result);
                    }
                  });
                }
                else {
                  complete(null, result);
                }
              });
            }
            else {
              complete(null, result);
            }
          });
        }
        else if (element.resourceid) {
            setElement('id', element.resourceid, 'set', text, element.web ? element.web : false, function(err, result) {
                if (!result) {
                      setElement('name', element['value'], 'set', text, element.web ? element.web : false, function(err, result) {
                        if (!result) {
                          setElement('id', element['value'], 'set', text, element.web ? element.web : false, complete);
                        }
                        else {
                          complete(null, result);
                        }
                      });
                  }
                  else {
                      complete(null, result);
                  }
            });
        }
        else {
            setElement('id', element['name'], 'set', text, element.web ? element.web : false, function(err, result) {
              if (!result) {
                setElement('name', element['name'], 'set', text, element.web ? element.web : false, function(err, result) {
                  if (!result) {
                    setElement('name', element['value'], 'set', text, element.web ? element.web : false, function(err, result) {
                      if (!result) {
                        setElement('id', element['value'], 'set', text, element.web ? element.web : false, complete);
                      }
                      else {
                        complete(null, result);
                      }
                    });
                  }
                  else {
                    complete(null, result);
                  }
                });
              }
              else {
                complete(null, result);
              }
            });
          }
    };

    /**
     * Tap on an element on the specified device
     * @param {string} element The element to tap
     * @param {{}=} options Options tap with, can include duration
     * @param {function=} complete A callback for completion
     */
    this.tap = function (element, options, complete) {
        var err = arguments.sodaexpect("object", "object|undefined|null", "function|undefined|null").error,
            duration = 0;
        if(err) throw err;

        soda.console.debug("Perfecto: Performing tap on device `" + self.deviceId + "` with element `" + element['name'] + "`");

        if (options.duration) {
          duration = options.duration;
        }
        else if (options.adjustX) {
            element.hitpoint.x = element.hitpoint.x + options.adjustX;
        }

        if (element.web) {
          clickElement('id', element['id'], duration, element.web ? element.web : false, function(err, result) {
            if (!result) {
              clickElement('id', element['name'], duration, element.web ? element.web : false, function(err, result) {
                if (!result) {
                  clickElement('className', element['name'], duration, element.web ? element.web : false, function(err, result) {
                    if (!result) {
                      clickElement('linkText', element['value'], duration, element.web ? element.web : false, function(err, result) {
                        if (!result) {
                          clickXY(element.hitpoint.x, element.hitpoint.y, duration, complete);
                        }
                        else {
                          complete(null, result);
                        }
                      });
                    }
                    else {
                      complete(null, result);
                    }
                  });
                }
                else {
                  complete(null, result);
                }
              });
            }
            else {
              complete(null, result);
            }
          });
        }
        else if (element.resourceid) {
            clickElement('id', element.resourceid, duration, element.web ? element.web : false, function(err, result) {
                if (!result) {
                  clickXY(element.hitpoint.x, element.hitpoint.y, duration, function(err, result) {
                    if (!result) {
                      clickElement('name', element['value'], duration, element.web ? element.web : false, function(err, result) {
                        if (!result) {
                          clickElement('id', element['value'], duration, element.web ? element.web : false, complete);
                        }
                        else {
                          complete(null, result);
                        }
                      });
                    }
                    else {
                      complete(null, result);
                    }
                  });
                }
                else {
                    complete(null, result);
                }
            });
        }
        else {
          console.log('clickXY', element);
          clickXY(element.hitpoint.x, element.hitpoint.y, duration, function(err, result) {
            if (!result) {
              clickElement('id', element['name'], duration, element.web ? element.web : false, function(err, result) {
                if (!result) {
                  clickElement('name', element['name'], duration, element.web ? element.web : false, function(err, result) {
                    if (!result) {
                      clickElement('name', element['value'], duration, element.web ? element.web : false, function(err, result) {
                        if (!result) {
                          clickXY(element.hitpoint.x, element.hitpoint.y, duration, complete);
                        }
                        else {
                          complete(null, result);
                        }
                      });
                    }
                    else {
                      complete(null, result);
                    }
                  });
                }
                else {
                  complete(null, result);
                }
              });
            }
            else {
              complete(null, result);
            }
          });
        }
    };

    /**
     * Tap screen coordinates
     * @param {{}=} options Options to capture the screenshot with. May include duration
     * @param {function} complete A callback for completion
     */
    this.tapXY = function (options, complete) {
      var duration = 0;

      if (options.duration) {
        duration = options.duration;
      }

        var err = arguments.sodaexpect("object", "function|undefined|null").error;

        if(err) {
            if(complete instanceof Function) complete.call(self, err, false);
            return;
        }

        clickXY(options.x, options.y, duration, complete);
    };

    /**
    * Type on the device keyboard
    * @param {string=} string The string to type on the keyboard
    * @param {function=} complete A callback for completion
    * @returns {*}
    */
    this.typeOnKeyboard = function (string, complete) {
        var err = arguments.sodaexpect("string", "function|undefined|null").error;

        if(err) {
            if(complete instanceof Function) complete.call(self, err, false);
            return;
        }

        typeText(string, complete);
    };

    /**
    * Finds an element by name
    * @param {string=} name The name of the element to find
    * @param {function=} complete A callback for completion
    * @returns {*}
    */
    this.findElement = function (name, complete) {
        var err = arguments.sodaexpect("string", "function|undefined|null").error;

        if(err) {
            soda.console.error(err);
            if(complete instanceof Function) complete.call(self, err, false);
            return;
        }

        findElement(name, complete);
    };

    /**
    * Finds an element by name and scrolls to it if not found
    * @param {string=} name The name of the element to find
    * @param {function=} complete A callback for completion
    * @returns {*}
    */
    this.findElementWithScroll = function (name, complete) {
        var err = arguments.sodaexpect("string", "function|undefined|null").error;

        if(err) {
            soda.console.error(err);
            if(complete instanceof Function) complete.call(self, err, false);
            return;
        }

        findElementWithScroll(name, complete);
    };

    /**
    * Scrolls based upon a calculated start and end value
    * @param {string=} startAndEnd The start and end parameters
    * @param {function=} complete A callback for completion
    * @returns {*}
    */
    this.scrollCalculated = function (startAndEnd, complete) {
        var err = arguments.sodaexpect("string", "function|undefined|null").error;

        if(err) {
            if(complete instanceof Function) complete.call(self, err, false);
            return;
        }

        scrollCalculated(startAndEnd, complete);
    };

    /**
     * Swipes from point to point using the coordinates provided
     * @param {{}=} options Options to capture the screenshot with. Must include coordinates
     * @param {function} complete A callback for completion
     */
    this.swipe = function (options, complete) {
        var err = arguments.sodaexpect("object", "function|undefined|null").error,
          values = options.coordinates.split(","),
              x0, y0, x1, y1;

        if(err) {
            if(complete instanceof Function) complete.call(self, err, false);
            return;
        }
        else if (values.length < 4) {
          if(complete instanceof Function) complete.call(self, new Error("Not enough parameters"), false);
          return;
        }

        x0 = values[0];
        x1 = values[2];
        y0 = values[1];
        y1 = values[3];

        swipe(x0, y0, x1, y1, complete);
    };

    /**
     * Press the back button on the current device
     * @param {{}=} options Options to capture the screenshot with. Should include destination
     * @param {function} complete A callback for completion
     */
    this.back = function (options, complete) {
        var err = arguments.sodaexpect("object", "function|undefined|null").error;

        if(err) {
            if(complete instanceof Function) complete.call(self, err, false);
            return;
        }

        back(complete);
    };

    /**
     * Navigates to the home screen
     * @param {{}=} options Options to capture the screenshot with.
     * @param {function} complete A callback for completion
     */
    this.home = function (options, complete) {
        var err = arguments.sodaexpect("object", "function|undefined|null").error;

        if(err) {
            if(complete instanceof Function) complete.call(self, err, false);
            return;
        }

        homeHandSet(complete);
    };

    /**
     * Locks the screen for set number of seconds
     * @param {{}=} options Options to capture the screenshot with.
     * @param {function} complete A callback for completion
     */
    this.lock = function (options, complete) {
        var err = arguments.sodaexpect("object", "function|undefined|null").error;

        if(err) {
            if(complete instanceof Function) complete.call(self, err, false);
            return;
        }

        lockHandSet(options.seconds, complete);
    };

    /**
     * Resets the device to remove all data (be careful with this one)
     * @param {function} done A callback for completion
     */
    this.resetAppData = function (complete) {
        var err = arguments.sodaexpect("function|undefined|null").error;
        if(err) {
            if(complete instanceof Function) complete.call(self, err, false);
            return;
        }

        reset(complete);
    };

    /**
     * Gets the device screen bounds
     * @param {function} complete A callback for completion
     */
    this.getScreenBounds = function (done) {
        this.getSourceTree(function(err, screen) {
              if (soda.config.get("platform").toLowerCase() === "android" || soda.config.get("platform").toLowerCase() === "androidtab") {
                  var aTree = Tree.buildTree(screen.device, {}, "android");

                  if(done instanceof Function) done.call(self, err, [aTree['view:0'].rect.size.width, aTree['view:0'].rect.size.height]);
              }
              else if (soda.config.get("platform").toLowerCase() === "iphoneweb" || soda.config.get("platform").toLowerCase() === "ipadweb" || soda.config.get("platform").toLowerCase() === "androidweb" || soda.config.get("platform").toLowerCase() === "androidtabweb") {
                  var res = screen.match(/<sodadom>(.*?)<\/sodadom>/g).map(function(val){
                     return val.replace(/<\/?sodadom>/g,'');
                  });

                  res = res[0];

                  if (res && res[soda.config.get("sodaRootId")]) {
                    res[soda.config.get("sodaRootId")].rect = {
                        origin: {
                            x: res[soda.config.get("sodaRootId")].xoffset,
                            y: res[soda.config.get("sodaRootId")].yoffset
                        },
                        size: {
                            height: res[soda.config.get("sodaRootId")].innerheight,
                            width: res[soda.config.get("sodaRootId")].innerwidth
                        }
                    };
                  }

                  if(done instanceof Function) done.call(self, err, [res.rect.size.width, res.rect.size.height]);
              }
              else {
                  var win = {};
                  if (screen.XCUIElementTypeApplication) {
                    win.UIAWindow = screen.XCUIElementTypeApplication;
                  }
                  else {
                    win.UIAWindow = screen.AppiumAUT.UIAApplication.UIAWindow;
                  }
                  
                  var iTree = Tree.buildTree(win, {}, "ios");

                  if(done instanceof Function) done.call(self, err, [iTree['window:0'].rect.size.width, iTree['window:0'].rect.size.height]);
            }
        });
    };
};

module.exports = PerfectoDriver;
