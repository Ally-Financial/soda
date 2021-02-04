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
 * @module Perfecto
 * @description The Perfecto framework for the Soda Test Engine
 */

module.exports = function (soda) {
    /**
     * The Perfecto framework driver for Soda
     * @constructor
     */
    var Perfecto = function (soda) {
        var self   = this,
            nodePath     = require("path"),

             /**
              * @composes Tree
              */
             Tree = new (require(nodePath.join(__dirname, "imports", "Tree.js")))(soda),

            /**
             * @composes PerfectoDriver
             * @type Perfecto
             */
            driver = new (require(nodePath.join(__dirname, "imports", "Driver.js")))(soda),

            /**
             * @composes Perfecto
             * @type Windows
             */
            config = new (require(nodePath.join(__dirname, "imports", "Config.js")))(soda);

            /**
             * @associates PerfectoConfiguration
             * @type {Object}
             */
            var settings = (require(nodePath.join(__dirname, "imports", "Config.js")))(soda),

            /**
             * @composes Perfecto/ElementInteractions
             */
            elementInteractions = new (require(nodePath.join(__dirname, "imports", "ElementInteractions.js")))(soda, settings, driver);

        this.name     = "Perfecto";
        this.platform = "Perfecto";
        this.version  = "2.0";

        this.defaultSyntaxVersion = "2.0";
        this.defaultSyntaxName    = "perfecto";
        this.applicationPath      = "";
        this.args                 = [];

        var keepAliveTimeout, keepAliveInterval;

        keepAliveTimeout = setTimeout(() => {
            clearInterval(keepAliveInterval);
        }, 1000 * 600);

        /**
         * Calls reclaim devide in Perfecto
         * @param {string} deviceId The id of the device to reclaim
         * @param {function=} complete A callback for completion
         */
        function reclaimDevice(deviceId, complete) {
            driver.reclaimDevice(deviceId, complete);
        }

        /**
         * Calls upload applciation with overwrite and install the app
         * @param {string} target The name of the target application
         * @param {string} buildPath The path to the application
         * @param {function=} complete A callback for completion
         */
        function uploadAppOverwrite(target, buildPath, complete) {

          var tar, pathname;
          if (soda.config.get("platform").toLowerCase() === "android" || soda.config.get("platform").toLowerCase() === "androidtab") {
            tar = target + '.apk';
            pathname = buildPath;
          }
          else {
            tar = target + '.ipa';
            pathname = buildPath;
          }

          driver.uploadFileToRepository('media', 'PUBLIC:binaries', tar, pathname, function (err, result) {
              if (err) complete.call(self, new Error("Could not upload binary " + target), result);

              driver.installApp('PUBLIC:binaries/' + tar, function (err, result) {
                if (err) {
                    soda.console.error("Could not install application " + tar);
                }
                else {
                    soda.console.debug("Installed Successfully from repository");
                }

                if(complete) complete.call(self, result);
              });
          });
        }

        /**
         * Calls upload with overwrite but no install
         * @param {string} target The name of the target application
         * @param {string} buildPath The path to the application
         * @param {function=} complete A callback for completion
         */
        function uploadAppOnly(target, buildPath, complete) {

          var tar, pathname;
          if (soda.config.get("platform").toLowerCase() === "android" || soda.config.get("platform").toLowerCase() === "androidtab") {
            tar = target + '.apk';
            pathname = buildPath;
          }
          else {
            tar = target + '.ipa';
            pathname = buildPath;
          }

          driver.deleteRepositoryItem('media', 'PUBLIC:binaries', tar, function (err, result) {
            if (err) soda.console.error(err, result);

            setTimeout(function() {
              driver.uploadFileToRepository('media', 'PUBLIC:binaries', tar, pathname, function (err, result) {
                  if (err) complete.call(self, new Error("Could not upload binary " + target), result);

                  driver.installApp('PUBLIC:binaries/' + tar, function (err, result) {
                    if (err) {
                        soda.console.error("Could not install application " + tar);
                    }
                    else {
                        soda.console.debug("Installed Successfully from repository");
                    }

                    if(complete) complete.call(self, result);
                  });
              });
            }, 10000);
          });
        }

        /**
         * Calls install application
         * @param {string} target The name of the target application
         * @param {string} buildPath The path to the application
         * @param {function=} complete A callback for completion
         */
        function installAppOnly(target, buildPath, complete) {

          var tar;
          if (soda.config.get("platform").toLowerCase() === "android" || soda.config.get("platform").toLowerCase() === "androidtab") {
            tar = target + '.apk';
          }
          else {
            tar = target + '.ipa';
          }

          driver.beginExecutionBlock(function(err, result) {
              if (err) complete.call(self, new Error("Could not start execution block."), result);

              driver.openHandSet(function(err, result) {
                if (err) complete.call(self, new Error("Could not open device."), result);

                driver.installApp('PUBLIC:binaries/' + tar, function (err, result) {
                  if (err) {
                      soda.console.error("Could not install application " + tar);
                  }
                  else {
                      soda.console.debug("Installed Successfully from repository");
                  }

                  if(complete) complete.call(self, result);
                });
              });
          });
        }

        /**
         * Launches an applciation on a device
         * @param {string} application The name of the applciation to launch
         * @param {array} devices The list of devices
         * @param {string} app The name of the app on screen
         * @param {string} target The name of the target application
         * @param {string} buildPath The path to the application
         * @param {function=} complete A callback for completion
         */
        function launchDevice(application, devices, app, target, buildPath, complete) {
          driver.listItems(settings.PERFECTO_IMAGE_AREA, settings.PERFECTO_IMAGE_REPOSITORY, function (err, items) {
            if (err) complete.call(self, new Error("Could not list items."), false);

            soda.console.debug("List Repository Successfull");

            var startDevice = function(complete) {
              driver.beginExecutionBlock(function(err, result) {
                  if (err) complete.call(self, new Error("Could not start execution block."), result);

                  driver.openHandSet(function(err, result) {
                    if (err) complete.call(self, new Error("Could not open device."), result);

                    driver.home({}, function(err, result) {
                      setTimeout(function() {
                        if (soda.config.get("platform").toLowerCase() === "android" || soda.config.get("platform").toLowerCase() === "androidtab") {
                            driver.hideKeyboard(function(err, result) {

                                if (err) complete.call(self, new Error("Could not hide keyboard."), result);
                                self.launch(devices[application], app, function (err, result, instance) {
                                  if (!result) {
                                    uploadAppOnly(target, buildPath, function (err, result) {
                                      self.launch(devices[application], app, complete);
                                    });
                                  }
                                  else {
                                    if(complete) complete.call(self, err, result);
                                  }
                                });
                            });
                        }
                        else {
                            self.launch(devices[application], app, function (err, result, instance) {
                              if (!result) {
                                uploadAppOnly(target, buildPath, function (err, result) {
                                  self.launch(devices[application], app, complete);
                                });
                              }
                              else {
                                if(complete) complete.call(self, err, result);
                              }
                            });
                        }
                      });
                    });
                  });
              });
            };

            if (items.length > 0) {
              for (var i = 1; i < items.length; i++) {
                var item = items[i];
                driver.deleteScreenShot(item, function(err, result) {
                });
              }

              startDevice(complete);
            }
            else {
              startDevice(complete);
            }
          });
        }

        /**
         * Launches an applciation by uninstalling then installing on a device
         * @param {string} application The name of the applciation to launch
         * @param {array} devices The list of devices
         * @param {string} app The name of the app on screen
         * @param {string} target The name of the target application
         * @param {string} buildPath The path to the application
         * @param {string} modifiedTarget This is here to support other implementations, not used
         * @param {function=} complete A callback for completion
         */
        function launchDeviceWithCleanApp(application, devices, app, target, buildPath, modifiedTarget, complete) {
          driver.listItems(settings.PERFECTO_IMAGE_AREA, settings.PERFECTO_IMAGE_REPOSITORY, function (err, items) {
            if (err) complete.call(self, new Error("Could not list items."), false);

            soda.console.debug("List Repository Successfull");

            var startDeviceWithClean = function(complete) {
              driver.beginExecutionBlock(function(err, result) {
                  if (err) complete.call(self, new Error("Could not start execution block."), result);

                  driver.openHandSet(function(err, result) {
                    if (err) complete.call(self, new Error("Could not open device."), result);

                    driver.home({}, function(err, result) {
                      setTimeout(function() {
                        if (soda.config.get("platform").toLowerCase() === "android" || soda.config.get("platform").toLowerCase() === "androidtab") {
                            driver.hideKeyboard(function(err, result) {
                                if (err) complete.call(self, new Error("Could not hide keyboard."), result);

                                driver.uninstallApp(app, function(err, result) {
                                    uploadAppOnly(target, buildPath, function (err, result) {
                                      self.launch(devices[application], app, complete);
                                    });
                                });
                            });
                        }
                        else {
                            driver.uninstallApp(app, function(err, result) {
                                uploadAppOnly(target, buildPath, function (err, result) {
                                  self.launch(devices[application], app, complete);
                                });
                            });
                        }
                      }, 4000);
                    });
                  });
              });
            };

            if (items.length > 0) {
              for (var i = 1; i < items.length; i++) {
                var item = items[i];
                driver.deleteScreenShot(item, function(err, result) {
                });
              }

              startDeviceWithClean(complete);
            }
            else {
              startDeviceWithClean(complete);
            }
          });
        }

        /**
         * Launches an applciation by overwriting app on a device
         * @param {string} application The name of the applciation to launch
         * @param {array} devices The list of devices
         * @param {string} app The name of the app on screen
         * @param {string} target The name of the target application
         * @param {string} buildPath The path to the application
         * @param {string} modifiedTarget This is here to support other implementations, not used
         * @param {function=} complete A callback for completion
         */
        function launchDeviceWithUpdateApp(application, devices, app, target, buildPath, modifiedTarget, complete) {
          driver.listItems(settings.PERFECTO_IMAGE_AREA, settings.PERFECTO_IMAGE_REPOSITORY, function (err, items) {
            if (err) complete.call(self, new Error("Could not list items."), false);

            soda.console.debug("List Repository Successfull");

            var startDeviceWithUpdate = function(complete) {
              driver.beginExecutionBlock(function(err, result) {
                  if (err) complete.call(self, new Error("Could not start execution block."), result);

                  driver.openHandSet(function(err, result) {
                    if (err) complete.call(self, new Error("Could not open device."), result);

                    driver.home({}, function(err, result) {
                      setTimeout(function() {
                        if (soda.config.get("platform").toLowerCase() === "android" || soda.config.get("platform").toLowerCase() === "androidtab") {
                            driver.hideKeyboard(function(err, result) {
                                if (err) complete.call(self, new Error("Could not hide keyboard."), result);

                                uploadAppOverwrite(target, buildPath, function (err, result) {
                                  self.launch(devices[application], app, function (err, result) {

                                    soda.Tree.findElementsByLabel('Allow', function(err, result) {
                                      soda.console.debug(result);

                                      complete.call(self, null, true);
                                    });
                                  });
                                });
                            });
                        }
                        else {
                            uploadAppOverwrite(target, buildPath, function (err, result) {
                              self.launch(devices[application], app, function (err, result) {

                                soda.Tree.findElementsByLabel('Allow', function(err, result) {
                                  soda.console.debug(result);

                                  complete.call(self, null, true);
                                });
                              });
                            });
                        }
                      }, 4000);
                    });
                  });
              });
            };

            if (items.length > 0) {
              for (var i = 1; i < items.length; i++) {
                var item = items[i];
                driver.deleteScreenShot(item, function(err, result) {
                });
              }

              startDeviceWithUpdate(complete);
            }
            else {
              startDeviceWithUpdate(complete);
            }
          });
        }

        /**
         * Installs an application on a device by uploading it then installing it then closing the device
         * @param {object} target The name of the application to install
         * @param {string} buildPath The path to the application to install
         * @param {function} complete A callback for completion
         */
        function installApp(target, buildPath, complete) {
          var binaryExtension = '.ipa';
          if (soda.config.get("platform").toLowerCase() === "android" || soda.config.get("platform").toLowerCase() === "androidtab") {
            binaryExtension = '.apk';
          }

          driver.beginExecutionBlock(function(err, result) {
            if (err) complete.call(self, new Error("Could not start execution block."), result);

              driver.uploadFileToRepository('media', 'PUBLIC:binaries', target + binaryExtension, buildPath + '/' + target + binaryExtension, function (err, result) {
                  if (err) complete.call(self, new Error("Could not upload binary " + target + binaryExtension), result);

                  soda.console.debug('binary uploaded and overwritten successfully');

                  driver.openHandSet(function(err, result) {
                    if (err) complete.call(self, new Error("Could not open device."), result);

                    soda.console.debug('device started successfully');

                    driver.installApp('PUBLIC:binaries/' + target + binaryExtension, function (err, result) {
                        if (err) {
                            soda.console.error("Could not install application " + target + binaryExtension);
                        }
                        else {
                            soda.console.debug("Installed Successfully from repository");
                        }

                        driver.closeHandSet(function(err, result) {
                            if (err) soda.console.error("Could not close device.");

                            driver.endExecutionBlock(function(err, result) {
                                if (err) complete.call(self, new Error("Could not end execution block."), result);

                                if(complete) complete.call(self, result);
                            });
                        });
                    });
                  });
              });
          });
        }

        /**
         * Installs an application on a device by uploading it then installing it then leaving the execution context open
         * @param {object} target The name of the application to install
         * @param {string} buildPath The path to the application to install
         * @param {function} complete A callback for completion
         */
        function installAppAndLeaveOpen(target, buildPath, complete) {
          var binaryExtension = '.ipa';
          if (soda.config.get("platform").toLowerCase() === "android" || soda.config.get("platform").toLowerCase() === "androidtab") {
            binaryExtension = '.apk';
          }

          driver.beginExecutionBlock(function(err, result) {
            if (err) complete.call(self, new Error("Could not start execution block."), result);

              driver.uploadFileToRepository('media', 'PUBLIC:binaries', target + binaryExtension, buildPath + '/' + target + binaryExtension, function (err, result) {
                  if (err) complete.call(self, new Error("Could not upload binary " + target + binaryExtension), result);

                  soda.console.debug('binary uploaded and overwritten successfully');

                  driver.openHandSet(function(err, result) {
                    if (err) complete.call(self, new Error("Could not open device."), result);

                    soda.console.debug('device started successfully');

                    driver.installApp('PUBLIC:binaries/' + target + binaryExtension, function (err, result) {
                        if (err) {
                            soda.console.error("Could not install application " + target + binaryExtension);
                        }
                        else {
                            soda.console.debug("Installed Successfully from repository");
                        }

                        if(complete) complete.call(self, result);
                    });
                  });
              });
          });
        }

        /**
         * Builds an XCode Project or WorkSpace and installs it onto target simulator.
         * @param {string} simulatorOrDevice The device to be upload
         * @param {string} target The XCode target to be built
         * @param {string} projectOrWorkSpace The full path to the xcodeproj or xcworkspace file
         * @param {string} buildPath The path where the app will be built to
         * @param {function=} complete A callback for completion
         */
        this.build = function (simulatorOrDevice, target, projectOrWorkSpace, buildPath, app, complete) {
            var a = arguments.sodaexpect("string", "string", "string", "string", "string", "function|undefined"), err,
                buildDir = projectOrWorkSpace.substring(0, projectOrWorkSpace.lastIndexOf(nodePath.sep));

            if (soda.config.get("platform").toLowerCase() === "iphone" || soda.config.get("platform").toLowerCase() === "ipad" || soda.config.get("platform").toLowerCase() === "iphoneweb" || soda.config.get("platform").toLowerCase() === "ipadweb") {
              var projectOrWorkSpaceFlag = (projectOrWorkSpace.indexOf('.xcworkspace') > 0) ? "-workspace" : "-project";

              if(a.error) {
                  switch(a.number) {
                      case 0:
                          err = new soda.exception.InvalidArgumentsError("Perfecto.build is missing argument #" + a.number + ": `simulatorOrDevice`");
                          break;

                      case 1:
                          err = new soda.exception.InvalidArgumentsError("Perfecto.build is missing argument #" + a.number + ": `target`");
                          break;

                      case 2:
                          err = new soda.exception.InvalidArgumentsError("Perfecto.build is missing argument #" + a.number + ": `project or workspace`");
                          break;

                      case 3:
                          err = new soda.exception.InvalidArgumentsError("Perfecto.build is missing argument #" + a.number + ": `buildPath`");
                          break;

                      case 4:
                          err = new soda.exception.InvalidArgumentsError("Perfecto.build is missing argument #" + a.number + ": `app`");
                          break;

                      case 5:
                          err = new soda.exception.InvalidArgumentsError("Perfecto.build is missing argument #" + a.number + ": `complete`");
                          break;

                      default:
                          err = new soda.exception.InvalidArgumentsError("Perfecto.build has unknown argument #" + a.number + ": `complete`");
                          break;                          
                  }
              }

              if(err) {
                  if(complete instanceof Function) {
                      complete.call(self, false);
                  }
                  else {
                      throw err;
                  }
              }

              require("child_process").exec("rm -rf " + buildPath + '/' + target + '.*', function (err, stdout, stderr) {
                  if(err)    throw err;
                  if(stderr) throw new Error(stderr);

                  var xbuild = require("child_process").spawn("xcodebuild", [
                          "-scheme",
                          target,
                          projectOrWorkSpaceFlag,
                          projectOrWorkSpace,
                          "-sdk",
                          "iphoneos",
                          "CODE_SIGN_IDENTITY="+soda.config.get("codeSignIdentity"),
                          "PROVISIONING_PROFILE="+soda.config.get("provisioningProfile"),
                          "-configuration",
                          "Debug",
                          "clean",
                          "archive",
                          "-archivePath",
                          buildPath + '/' + target + '.xcarchive'
                      ]);

                  if(xbuild && xbuild.stderr && xbuild.stdout) {
                      xbuild.stderr.on('data', function (data) {
                          soda.console.error(data.toString('utf-8'));
                      });

                      xbuild.stdout.on('data', function (data) {
                          soda.console.verbose(data.toString('utf-8'));
                      });

                      xbuild.on('close', function (code) {
                        if (code !== 0) complete(new Error("Unsuccessful archive creation."), false);

                        soda.console.debug('Archive complete to: ' + buildPath + '/' + target + '.xcarchive', [
                                "-exportArchive",
                                "-archivePath",
                                buildPath + '/' + target + '.xcarchive',
                                "-exportPath",
                                buildPath + '/' + target,
                                "-exportOptionsPlist",
                                buildDir + '/exportPlist.plist'
                            ]);

                        xbuild = require("child_process").spawn("xcodebuild", [
                                "-exportArchive",
                                "-archivePath",
                                buildPath + '/' + target + '.xcarchive',
                                "-exportPath",
                                buildPath + '/',
                                "-exportOptionsPlist",
                                buildDir + '/exportPlist.plist'
                            ]);

                            if(xbuild && xbuild.stderr && xbuild.stdout) {
                                xbuild.stderr.on('data', function (data) {
                                    soda.console.error(data.toString('utf-8'));
                                });

                                xbuild.stdout.on('data', function (data) {
                                    soda.console.verbose(data.toString('utf-8'));
                                });

                                xbuild.on('close', function (code) {
                                    if (code !== 0) complete(new Error("Unsuccessful binary creation."), false);

                                    soda.console.debug('binary complete to: ' + buildPath + '/' + target + '.ipa');

                                    if (driver.getExecutionId()) {
                                      uploadAppOnly(target, buildPath, function(err, result) {
                                        if (err) complete.call(self, new Error("Could not upload app with executionId:" + driver.getExecutionId() + "."), false);

                                        console.log("Binary uploaded successfullly");

                                        self.listAvailableDevices(function(devicesArray, devices, nonavailabledevices) {
                                            self.launch(nonavailabledevices[simulatorOrDevice], app, complete);
                                        });
                                      });
                                    }
                                    else {
                                      self.listAvailableDevices(function(devicesArray, devices, nonavailabledevices) {
                                          if (nonavailabledevices[simulatorOrDevice]) {
                                            console.log("Device " + simulatorOrDevice + " is non-available, beginning to reclaim");

                                            driver.getLastExecutionId(function(err, executionId) {
                                              if (err) complete.call(self, new Error("Could not get an execution id."), false);

                                              console.log("Device is not available, reclaiming.");

                                              driver.reclaimDevice(simulatorOrDevice, function(err, result) {
                                                if (err) complete.call(self, new Error("Device you are looking for is unavailable with current executionId of :" + executionId + "."), false);

                                                driver.deviceId = nonavailabledevices[simulatorOrDevice].udid;
                                                driver.runtime = nonavailabledevices[simulatorOrDevice].runtime;
                                                driver.os = nonavailabledevices[simulatorOrDevice].os;
                                                soda.console.debug("Found device: " + driver.deviceId + " with values " + JSON.stringify(devices[simulatorOrDevice]));

                                                installApp(target, buildPath, complete);
                                              });
                                            });
                                          }
                                          else if (devices[simulatorOrDevice]) {
                                            console.log("Device " + simulatorOrDevice + " is available, attempting to install");

                                            driver.deviceId = devices[simulatorOrDevice].udid;
                                            driver.runtime = devices[simulatorOrDevice].runtime;
                                            driver.os = devices[simulatorOrDevice].os;
                                            soda.console.debug("Found device: " + driver.deviceId + " with values " + JSON.stringify(devices[simulatorOrDevice]));

                                            installAppAndLeaveOpen(target, buildPath, complete);
                                          }
                                          else {
                                            console.log("Device " + simulatorOrDevice + " could not be found");

                                              complete.call(self, new Error("Could not find device you are looking for."), false);
                                          }
                                      });
                                    }
                                });
                            }
                      });
                  }
                  else {
                      soda.console.error("Error spawning `xcodebuild`");
                      if(complete instanceof Function) complete.call(self, 1);
                  }
                });
            }
            else {
              if(complete) complete.call(self, true);
            }


            return self;
        };

        /**
         * Upload a binary and install it onto target.
         * @param {string} simulatorOrDevice The device to be upload
         * @param {string} target The target name to be uploaded
         * @param {string} projectOrWorkSpace The full path to the xcodeproj or xcworkspace file
         * @param {string} buildPath The path where the app will be built to
         * @param {function=} complete A callback for completion
         */
        this.upload = function (simulatorOrDevice, target, projectOrWorkSpace, buildPath, complete) {
            var a = arguments.sodaexpect("string", "string", "string", "string", "function|undefined"), err;

            if(a.error) {
                switch(a.number) {
                    case 0:
                        err = new soda.exception.InvalidArgumentsError("Perfecto.upload is missing argument #" + a.number + ": `simulatorOrDevice`");
                        break;

                    case 1:
                        err = new soda.exception.InvalidArgumentsError("Perfecto.upload is missing argument #" + a.number + ": `target`");
                        break;

                    case 2:
                        err = new soda.exception.InvalidArgumentsError("Perfecto.upload is missing argument #" + a.number + ": `project or workspace`");
                        break;

                    case 3:
                        err = new soda.exception.InvalidArgumentsError("Perfecto.upload is missing argument #" + a.number + ": `buildPath`");
                        break;

                    case 4:
                        err = new soda.exception.InvalidArgumentsError("Perfecto.upload is missing argument #" + a.number + ": `complete`");
                        break;
                    
                    default:
                        err = new soda.exception.InvalidArgumentsError("Perfecto.upload has unknown argument #" + a.number + ": `complete`");
                        break;
                }
            }

            if(err) {
                if(complete instanceof Function) {
                    complete.call(self, false);
                }
                else {
                    throw err;
                }
            }

            self.listAvailableDevices(function(devicesArray, devices, nonavailabledevices) {
                if (nonavailabledevices[simulatorOrDevice]) {
                  driver.getLastExecutionId(function(err, executionId) {
                    if (err) console.log("Device is not available, reclaiming.");

                    driver.reclaimDevice(simulatorOrDevice, function(err, result) {
                      if (err) complete.call(self, new Error("Device you are looking for is unavailable with current executionId of :" + executionId + "."), false);

                      driver.deviceId = nonavailabledevices[simulatorOrDevice].udid;
                      driver.runtime = nonavailabledevices[simulatorOrDevice].runtime;
                      driver.os = nonavailabledevices[simulatorOrDevice].os;
                      soda.console.debug("Found device: " + driver.deviceId + " with values " + JSON.stringify(devices[simulatorOrDevice]));

                      installApp(target, buildPath, complete);
                    });
                  });
                }
                else if (devices[simulatorOrDevice]) {
                  driver.deviceId = devices[simulatorOrDevice].udid;
                  driver.runtime = devices[simulatorOrDevice].runtime;
                  driver.os = devices[simulatorOrDevice].os;
                  soda.console.debug("Found device: " + driver.deviceId + " with values " + JSON.stringify(devices[simulatorOrDevice]));

                  installApp(target, buildPath, complete);
                }
                else {
                    complete.call(self, new Error("Could not find device you are looking for."), false);
                }
            });

            return self;
        };

        /**
         * Lists all available applications
         * @param {Function} done A callback for completion
         * @return {Array} A list of available browsers
         */
        this.listAvailableDevices = function (done) {
            var devices = [];
            driver.listAvailableHandsets(function (err, foundDevices) {
              if (err) { done.call(self, devices, {}, {}); }

              var available = {},
                  notavailable = {};
              foundDevices.sodaeach(function (device) {
                  var deviceName = device.description,
                      deviceUDID = device.deviceId,
                      deviceOS   = device.model,
                      deviceManufacturer = device.manufacturer,
                      deviceDistributer = device.distributer,
                      deviceFirmware = device.firmware,
                      deviceImsi = device.imsi,
                      deviceImei = device.nativeImei,
                      deviceWifiMacAddress = device.wifiMacAddress,
                      deviceType = device.lab,
                      deviceOperatorName = device.operator.name,
                      deviceOperatorCode = device.operator.code,
                      devicePhoneNumber = device.phoneNumber,
                      deviceAvailable = device.available === "true",
                      deviceStatus = device.status,
                      deviceReserved = device.reserved,
                      deviceOperatingSystem = device.os,
                      deviceOsVersion = device.osVersion,
                      deviceResolution = device.resolution;

                  if (deviceAvailable) {
                    available[deviceUDID] = {
                        name        : deviceName,
                        udid        : deviceUDID,
                        runtime     : deviceOS,
                        manufacturer :deviceManufacturer,
                        distributer : deviceDistributer,
                        firmware : deviceFirmware,
                        imsi : deviceImsi,
                        imei : deviceImei,
                        wifiMacAddress : deviceWifiMacAddress,
                        type : deviceType,
                        operatorName : deviceOperatorName,
                        operatorCode : deviceOperatorCode,
                        phoneNumber : devicePhoneNumber,
                        status : deviceStatus,
                        reserved : deviceReserved,
                        os : deviceOperatingSystem,
                        osVersion : deviceOsVersion,
                        resolution : deviceResolution
                    };
                    devices.push(available[deviceUDID]);
                  }
                  else {
                    notavailable[deviceUDID] = {
                        name        : deviceName,
                        udid        : deviceUDID,
                        runtime     : deviceOS,
                        manufacturer :deviceManufacturer,
                        distributer : deviceDistributer,
                        firmware : deviceFirmware,
                        imsi : deviceImsi,
                        imei : deviceImei,
                        wifiMacAddress : deviceWifiMacAddress,
                        type : deviceType,
                        operatorName : deviceOperatorName,
                        operatorCode : deviceOperatorCode,
                        phoneNumber : devicePhoneNumber,
                        status : deviceStatus,
                        reserved : deviceReserved,
                        os : deviceOperatingSystem,
                        osVersion : deviceOsVersion,
                        resolution : deviceResolution
                    };
                  }
              });
              if(done instanceof Function) done.call(self, devices, available, notavailable);
            });
        };

        /**
         * Starts the Perfecto framework driver
         * @param {string} application The name of the applciation to launch
         * @param {string} app The name of the app on screen
         * @param {string} testPath The path to the test scripts
         * @param {string} target The name of the target application
         * @param {string} buildPath The path to the application
         * @param {object} options Options
         * @param {function} complete A callback for completion
         * @return {Perfecto} The current Perfecto framework instance
         */
        this.start = function (application, app, testPath, testResultsPath, target, buildpath, options, complete) {
            if(!complete && !options && testResultsPath instanceof Function) {
                complete = testResultsPath;
                testResultsPath = undefined;
                options  = undefined;
            }

            if(!complete && options instanceof Function) {
                complete = options;
                options = undefined;
            }

            if(!options && typeof testResultsPath === "object") {
                options = testResultsPath;
                testResultsPath = undefined;
            }

            if (complete && typeof options === "string") {
                options = JSON.parse(options);
            }

            var a = arguments.sodaexpect("string", "string", "string", "string", "string", "string", "string|object|undefined|null|function", "function|undefined|null");

            if(a.error) {
                switch(a.number) {
                    case 0:
                        throw new soda.exception.InvalidArgumentsError("Perfecto.start is missing argument #" + a.number + ": `device`");

                    case 1:
                        throw new soda.exception.InvalidArgumentsError("Perfecto.start is missing argument #" + a.number + ": `app`");

                    case 2:
                        throw new soda.exception.InvalidArgumentsError("Perfecto.start is missing argument #" + a.number + ": `testPath`");

                    case 3:
                        throw new soda.exception.InvalidArgumentsError("Perfecto.start is missing argument #" + a.number + ": `testResultsPath`");

                    case 4:
                        throw new soda.exception.InvalidArgumentsError("Perfecto.start is missing argument #" + a.number + ": `target`");

                    case 5:
                        throw new soda.exception.InvalidArgumentsError("Perfecto.start is missing argument #" + a.number + ": `buildpath`");

                    case 6:
                        throw new soda.exception.InvalidArgumentsError("Perfecto.start is missing argument #" + a.number + ": `options`");

                    case 7:
                        throw new soda.exception.InvalidArgumentsError("Perfecto.start is missing argument #" + a.number + ": `complete`");

                    default:
                      throw new soda.exception.InvalidArgumentsError("Perfecto.start has unknown argument #" + a.number + ": `complete`");
                }
            }

            soda.config.set("findElementRetries", config.FIND_ELEMENT_COMMAND_COUNT);

            self.listAvailableDevices(function(devicesArray, devices, nonavailabledevices) {
              if (nonavailabledevices[application]) {
                driver.reclaimDevice(application, function(err, result) {
                    if (err) complete.call(self, new Error("Device you are looking for is unavailable."), false);

                    driver.deviceId = nonavailabledevices[application].udid;
                    driver.runtime = nonavailabledevices[application].runtime;
                    driver.os = nonavailabledevices[application].os;
                    soda.console.debug("Found device: " + driver.deviceId + " with values " + JSON.stringify(nonavailabledevices[application]));

                    if (options && options.clean && options.prefix) {
                        soda.console.debug("Cleaning app on device: " + driver.deviceId + " with values " + JSON.stringify(nonavailabledevices[application]));
                        launchDeviceWithCleanApp(application, nonavailabledevices, app, target, buildpath, options.prefix+target, complete);
                    }
                    else if (options && options.installonly) {
                      installAppOnly(target, buildpath, function(err, result) {
                        self.stop(function(err, result) {
                          console.log("DEVICE STOPPED");
                          process.exit(0);
                        });
                      });
                    }
                    else if (options && options.update && options.prefix) {
                          soda.console.debug("Updating app on device: " + driver.deviceId + " with values " + JSON.stringify(devices[application]));
                          launchDeviceWithUpdateApp(application, devices, app, target, buildpath, options.prefix+target, complete);
                    }
                    else {
                        launchDevice(application, nonavailabledevices, app, target, buildpath, complete);
                    }
                  });
              }
              else if (devices[application]) {
                driver.deviceId = devices[application].udid;
                driver.runtime = devices[application].runtime;
                driver.os = devices[application].os;
                soda.console.debug("Found device: " + driver.deviceId + " with values " + JSON.stringify(devices[application]));

                if (options && options.clean && options.prefix) {
                    soda.console.debug("Cleaning app on device: " + driver.deviceId + " with values " + JSON.stringify(devices[application]));
                    launchDeviceWithCleanApp(application, devices, app, target, buildpath, options.prefix+target, complete);
                }
                else if (options && options.installonly) {
                  installAppOnly(target, buildpath, function(err, result) {
                    self.stop(function(err, result) {
                      console.log("DEVICE STOPPED");
                      process.exit(0);
                    });
                  });
                }
                else if (options && options.update && options.prefix) {
                      soda.console.debug("Updating app on device: " + driver.deviceId + " with values " + JSON.stringify(devices[application]));
                      launchDeviceWithUpdateApp(application, devices, app, target, buildpath, options.prefix+target, complete);
                }
                else {
                    launchDevice(application, devices, app, target, buildpath, complete);
                }
              }
              else {
                  complete.call(self, new Error("Could not find device you are looking for."), false);
              }
            });

            return self;
        };

        /**
         * Stops the Perfecto framework
         * @param {function=} done A callback for completion
         * @return {Perfecto} The current Perfecto framework instance
         */
        this.stop = function (done) {
            if (soda.config.get("platform").toLowerCase() === "android" || soda.config.get("platform").toLowerCase() === "androidtab") {
              driver.restoreKeyboard(function(err, result) {
                  if (err) done.call(self, new Error("Could not restore keyboard."), result);

                  self.closeOutDevice(done);
              });
            }
            else {
                self.closeOutDevice(done);
            }

            return self;
        };

        /**
         * Closes the current device
         * @param {function=} done A callback for completion
         */
        this.closeOutDevice = function closeOutDevice(done) {
            driver.setIsStillRunning(false);

            clearInterval(keepAliveInterval);
            clearTimeout(keepAliveTimeout);

            driver.closeHandSet(function(err, result) {
                if (err) done.call(self, new Error("Could not close device."), result);

                driver.endExecutionBlock(function(err, result) {
                    if (err) done.call(self, new Error("Could not end exeuction block."), result);

                    if(done) done.call(self, result);
                });
            });
        };

        /**
         * Restarts the Perfecto framework using the initial starting arguments
         * @param {function=} done A callback for completion
         * @return {Selenium} The current Selenium framework instance
         */
        this.restart = function (done) {
            driver.stop(function() {
                this.start(this.applicationPath, this.args, done);
            });
            return self;
        };

        /**
         * Restarts the application
         * @param {function=} done A callback for completion
         * @return {Selenium} The current Selenium framework instance
         */
        this.restartApplication = function (applicationName, done) {
          driver.stopApplication(applicationName, function(err, res) {
            driver.startApplication(applicationName, function(err, res) {
              if (done) done.call(self, err, res);
            });
          });

          return self;
      };

        /**
         * Launch a Perfecto process
         * @param {object} device The object as passed from Perfecto.findDevice
         * @param {string} app The app to launch
         * @param {function} complete A callback for completion
         */
        this.launch = function(device, app, complete) {
            var err = arguments.sodaexpect("object", "string", "function|undefined").error;
            if(err) throw err;

            driver.stopApplication(app, function(err, result) {
                if (err) complete(new Error("Could not stop application."), result);

                setTimeout(function() {
                  driver.startApplication(app, function(err, result) {
                      if (err || !result) complete(new Error("Could not start application."), result);
                      soda.config.set("deviceid", device['udid']);

                      driver.setIsStillRunning(true);

                      keepAliveInterval = setInterval(() => {
                          if(driver.isStillRunning()) {
                              driver.getSourceTree(function(err, result) {
                                if (err) soda.console.error(err);

                                console.log("Got source tree for keep alive");
                              });
                          }
                          else {
                              clearInterval(keepAliveInterval);
                              clearTimeout(keepAliveTimeout);
                          }
                      }, 1000 * 1 * 60);

                      if (complete) complete.call(self, err, result, driver.instance);
                  });
                }, 5000);
            });
        };

        /**
         * Uninstall a Perfecto application from the current device
         * @param {string} app The app to launch
         * @param {function} complete A callback for completion
         */
        this.uninstallApp = function(app, complete) {
            var err = arguments.sodaexpect("string", "function|undefined").error;
            if(err) throw err;

            console.log('this.uninstallApp about to start');

            driver.uninstallApp(app, function(err, result) {
                if (err) complete(new Error("Could not stop application."), result);

                console.log('this.uninstallApp finished');

                if (complete) complete.call(self, err, result, driver.instance);
            });
        };

        /**
         * Perform a user interaction on an element in the current DOM-Tree
         * @param {string} interaction The interaction name
         * @param {Array} elems An array of elements
         * @param {object} options Options
         * @param {function=} done A callback for completion
         * @return {Perfecto} The current Perfecto framework instance
         */
        this.performElementInteraction = function (interaction, elems, options, complete) {
            if(driver) {
                switch(interaction) {
                  case "setValue":
                      return elementInteractions.setValue(elems, options, complete);

                  case "tap":
                      return elementInteractions.tap(elems, options, complete);

                  case "scroll":
                      return elementInteractions.scroll(elems, options, complete);

                  case "scrollToVisible":
                      return elementInteractions.scrollToVisible(elems, options, complete);

                  default:
                      if(complete instanceof Function) complete(new Error("Unknown element interaction `" + interaction + "`"), null);
                }
            }
            else {
                if(complete instanceof Function)
                    complete(new Error("Cannot perform element interaction, since the driver hasn't been started yet."), false);
            }

            return self;
        };

        /**
         * Perform a user interaction on an element in the current DOM-Tree
         * @param {string} interaction The interaction name
         * @param {object} options Options to pass onto Instruments
         * @param {function=} done A callback for completion
         * @return {Selenium} The current Selenium framework instance
         */
        this.performDeviceInteraction = function (interaction, options, done) {
            if(driver) {
                switch(interaction) {
                    case "startApp":
                        return driver.startApplication(options.path, done);

                    case "openApp":
                        return driver.startApplication(options.path, done);

                    case "closeApp":
                        return driver.stopApplication(options.path, done);

                    case "stopApp":
                        return driver.stopApplication(options.path, done);

                    case "homeScreen":
                        return driver.home(options, done);

                    case "lockScreen":
                        return driver.lock(options, done);

                    case "persona":
                        return driver.setPersona(options.persona, done);

                    case "startAppAndWait":
                        return driver.startApplicationAndWait(options.path, done);

                    case "captureScreen":
                        return driver.takeScreenshot(options, done);

                    case "tapXY":
                        return driver.tapXY(options, done);

                    case "typeOnKeyboard":
                        return driver.typeOnKeyboard(options.string, done);

                    case "deviceSwipe":
                        return driver.swipe(options, done);

                    case "back":
                        return driver.back(options, done);

                    case "resetAppData":
                        return driver.resetAppData(done);

                    case "close":
                        return driver.close(options, done);

                    case "findElement":
                        return driver.findElement(options.valueToFind, done);

                    case "findElementWithScroll":
                        return driver.findElementWithScroll(options.valueToFind, done);

                    case "getResolution":
                        return driver.getResolution(done);

                    case "scrollCalculated":
                        return driver.scrollCalculated(options.command, done);

                    case "sendKeyCommand":
                        return driver.sendKeyCommand(options.keyCommand, done);

                    default:
                        if(done instanceof Function) done(new Error("Unsupported or unknown device interaction `" + interaction + "`"), null);
                }
            }
            else {
                if(done instanceof Function)
                    done(new Error("Cannot perform device interaction, since the driver hasn't been started yet."), false);
            }
            return self;
        };

        /**
         * Gets the DOM tree from Perfecto. First it sends a request to build the tree to perfecto, then when perfecto
         * responds, it calls the completion callback with the results.
         * @param {{}|function} options Options to pass to Selenium
         * @param {function=} done A callback for completion
         * @return {Selenium} The current Selenium framework instance
         */
        this.getTree = function (options, complete) {
            if(!complete && options instanceof Function) {
                complete     = options;
                options  = undefined;
            }

            if(driver) {
              driver.getSourceTree(function(err, result) {
                  if (err) complete(err, result);

                  if (soda.config.get("platform").toLowerCase() === "android" || soda.config.get("platform").toLowerCase() === "androidtab") {
                      var aTree = null;

                      if (result) {
                        aTree = Tree.buildTree(result, {}, "android");

                        if (complete) complete(null, aTree);
                      }
                      else {
                        if (complete) complete(new Error('No result for tree'), false);
                      }

                      return aTree;
                  }
                  else if (soda.config.get("platform").toLowerCase() === "iphoneweb" || soda.config.get("platform").toLowerCase() === "ipadweb" || soda.config.get("platform").toLowerCase() === "androidweb" || soda.config.get("platform").toLowerCase() === "androidtabweb") {
                      if (result) {
                        if (complete) complete(null, result);
                      }
                      else {
                        if (complete) complete(new Error('No result for tree'), false);
                      }

                      return result;
                  }
                  else {
                      if (result) {
                        var iTree = null;

                        if (result.AppiumAUT) {
                          var win = {};
                          win.UIAWindow = result.AppiumAUT.UIAApplication.UIAWindow;
                          iTree = Tree.buildTree(win, {}, "ios");

                          if (iTree === false && complete) {
                            complete(new Error("Could not get tree from Perfecto"), false);
                          }

                          if (complete) {
                              complete(null, iTree);
                          }
                        }
                        else {
                          iTree = Tree.buildTree(result, {}, "ios");

                          if (iTree === false && complete) {
                            complete(new Error("Could not get tree from Perfecto"), false);
                          }

                          if (complete) {
                              complete(null, iTree);
                          }
                        }
                        return iTree;
                      }
                      else {
                        if (complete) complete(new Error('No result for tree'), false);
                      }
                }
              });
            }
            else {
                if(complete instanceof Function)
                    complete(new Error("Cannot get element tree, since the driver hasn't been started yet."), false);
            }

            return self;
        };

        /**
         * Gets the device orientation<br>
         * Results will always be 1, since *most* monitors cannot rotate
         * @param {function=} done A callback for completion
         * @return {Perfecto} The current Perfecto framework instance
         */
        this.getOrientation = function (done) {
            if(done instanceof Function) done(null, 1);
            return self;
        };

        /**
         * Gets the screen bounds
         * @param {function=} done A callback for completion
         * @return {Perfecto} The current Perfecto framework instance
         */
        this.getScreenBounds = function (done) {
            if(driver) {
                return driver.getScreenBounds(done);
            }
            else {
                if(done instanceof Function)
                    done(new Error("Cannot get window size, since the driver hasn't been started yet."), null);
            }

            return self;
        };
    };

    return new Perfecto (soda);
};
