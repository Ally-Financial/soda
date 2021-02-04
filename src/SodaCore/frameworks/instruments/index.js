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
 * @module Instruments
 * @description The iOS Instruments framework for the Soda Test Engine
 */

module.exports = function (soda) {
    var fs        = require("fs"),
        path      = require("path"),

        /**
         * @associates InstrumentsConfiguration
         */
        iconfig   = new require(path.join(__dirname, 'imports', 'Config'))(soda),

        nodePath  = require('path'),
        /**
         * @composes InstrumentsDriver
         * @type Instruments
         */
        driver = new (require("./imports/Driver.js"))(soda),
        /**
         * @composes Tree
         */
        Tree = new (require("./imports/Tree.js"))(),

        /**
         * @composes Perfecto/ElementInteractions
         */
        elementInteractions = new (require("./imports/ElementInteractions.js"))(soda, driver),

        Instruments;

    /**
     * The instruments framework driver for Soda
     * @constructor
     */
    Instruments = function (soda) {
        var self     = this,
            appName = null,
            bundleIdentifier = null,
            isSimulator = null,
            instance = {
                process: null,
                running: false
            };

        // Yes, these are required...
        this.name     = "Instruments";
        this.platform = "iOS";
        this.version  = "1.0";

        this.defaultSyntaxVersion = "2.0";
        this.defaultSyntaxName = "mobile";

        /**
         * Launch an Instruments process
         * @param {object} device The simulator object as passed from Instruments.findDevice
         * @param {string} template The path to the Instruments template path
         * @param {string} app The app to launch
         * @param {function} complete A callback for completion
         */
        function launch (device, complete) {
            var err = arguments.sodaexpect("object", "function|undefined").error;
            if(err) throw err;

            var destination = "platform=iOS Simulator,id=" + device.udid;

            if (!device.isSimulator) {
                destination = "id=" + device.udid;

                require('child_process').exec(
                    "pkill mobiledevice",

                    function () {
                      var margs = [
                        "tunnel",
                        "8100",
                        "8100"
                      ];
                      var mobiledevice = require('child_process').spawn(path.resolve(path.join(__dirname, "..", "..", "..", "mobiledevice")) + '/mobiledevice', margs);

                      mobiledevice.stderr.on('data', function (data) {
                          soda.console.error(data.toString('utf-8'));
                      });

                      mobiledevice.stdout.on('data', function (data) {
                          soda.console.verbose(data.toString('utf-8'));
                      });
                    }
                );
            }
            else {
              require('child_process').exec(
                  "pkill mobiledevice",

                  function () {
                    console.log("Attempted to kill tunnel");
                  });
            }

            var args = [ // The arguments send to the instruments command
                    "-project",
                    path.resolve(path.join(__dirname, "..", "..", "..", "WebDriverAgent", "WebDriverAgent.xcodeproj")),
                    "-scheme",
                    "WebDriverAgentRunner",
                    "-destination",
                    destination,
                    "test"
                ];

            console.log("Booting device (this may take a moment)...", args);
            require('child_process').exec(
                "pkill xcodebuild\n"                                                                         +
                ((device['isSimulator'] && soda.config.get("resetDevice")) ?
                    "xcrun simctl erase " + device + "\n" : ""
                ),

                function () {
                    setTimeout(function () {
                        var xbuild = require('child_process').spawn("xcodebuild", args);

                        xbuild.stderr.on('data', function (data) {
                            soda.console.error(data.toString('utf-8'));
                        });

                        xbuild.stdout.on('data', function (data) {
                            soda.console.verbose(data.toString('utf-8'));
                        });

                        complete.call(self, null, xbuild);
                    }, 3000);
                }
            );
        }

        /**
         * Installs an application on a device
         * @param {object} bundleId The bundle identifier
         * @param {string} appPath The path to the application
         * @param {function} complete A callback for completion
         */
        function installApp(bundleId, appPath, complete) {
            driver.installApp(bundleId, appPath, complete);
        }

        /**
         * Gets the tree for the current screen displayed on the device
         * @param {function} complete A callback for completion
         */
        function getTree(complete) {
            driver.getSourceTree(complete);
        }

        /**
         * Gets the orientation of the device
         * @param {function} complete A callback for completion
         */
        function getOrientation(complete) {
            driver.getOrientation(complete);
        }

        /**
         * Gets the bounds for the current screen displayed on the device
         * @param {function} complete A callback for completion
         */
        function getScreenBounds(complete) {
            driver.getScreenBounds(complete);
        }

        /**
         * Uploads an application to the device and installs it
         * @param {string} simulatorOrDevice The name of the simulator or device
         * @param {object} bundleId The bundle identifier
         * @param {string} appPath The path to the application
         * @param {function} complete A callback for completion
         */
        function uploadToDevice(simulatorOrDevice, bundleId, appPath, complete) {
          self.findDevice(simulatorOrDevice, function (err, device, available) {
              if(available && typeof available === "object") {
                soda.console.debug("Found device: " + simulatorOrDevice, device);
                soda.config.set("deviceid", device['udid']);
                soda.config.set("findElementRetries", 15);

                driver.os = device.name;

                launch(device, function (err, instruments) {
                  if (err) {
                    complete.call(self, err, false);
                  }

                  var gotStatus      = false,
                      initInterval, initTimeout;

                  // Set an interval to emit when ready...
                  initInterval = setInterval(function () {
                      if(gotStatus) {
                          console.log("Framework Ready");
                      }
                      else {
                        console.log("Framework Not Ready");

                        driver.status(function (err, result) {
                            if (result) {
                              gotStatus = true;
                              clearTimeout(initTimeout);
                              clearInterval(initInterval);

                              installApp(bundleId, appPath, function(err, sessionId) {
                                if(err) {
                                    soda.console.error(err.message);
                                    if(complete instanceof Function) complete.call(self, err, false);
                                    return;
                                }

                                console.log("Framework Started with sessionId:", sessionId);

                                complete.call(self, err, true);
                              });
                            }
                        });
                      }
                  }, 10000);

                  // Set a timeout, jic the interval fails
                  initTimeout = setTimeout(function () {
                      clearInterval(initInterval);

                      complete.call(self, new Error("Framework timed out."), false);
                  }, iconfig.INIT_TIMEOUT);
                });
              }
              else {
                  complete.call(self, new Error("Could not find device you are looking for."), false);
              }
          });
        }

        /**
         * Builds an XCode Project or WorkSpace and installs it onto target simulator.
         * @param {string} simulatorOrDevice The name of the simulator or device
         * @param {string} target The XCode target to be built
         * @param {string} projectOrWorkSpace The full path to the xcodeproj or xcworkspace file
         * @param {string} buildPath The path where the app will be built to
         * @param {string} appName The name of the application
         * @param {object} bundleId The bundle identifier
         * @param {object} deviceToDeploy The device to deploy the application to
         * @param {function=} complete A callback for completion
         */
        this.build = function (simulatorOrDevice, target, projectOrWorkSpace, buildPath, appName, bundleId, deviceToDeploy, complete) {
            var a = arguments.sodaexpect("string", "string", "string", "string", "string", "string", "string", "function|undefined"), err;

            if (soda.config.get("platform").toLowerCase() === "iphone" || soda.config.get("platform").toLowerCase() === "ipad") {
              var projectOrWorkSpaceFlag = (projectOrWorkSpace.indexOf('.xcworkspace') > 0) ? "-workspace" : "-project";

              if(a.error) {
                  switch(a.number) {
                      case 0:
                          err = new soda.exception.InvalidArgumentsError("Instruments.build is missing argument #" + a.number + ": `simulatorOrDevice`");
                          break;

                      case 1:
                          err = new soda.exception.InvalidArgumentsError("Instruments.build is missing argument #" + a.number + ": `target`");
                          break;

                      case 2:
                          err = new soda.exception.InvalidArgumentsError("Instruments.build is missing argument #" + a.number + ": `project or workspace`");
                          break;

                      case 3:
                          err = new soda.exception.InvalidArgumentsError("Instruments.build is missing argument #" + a.number + ": `buildPath`");
                          break;

                      case 4:
                          err = new soda.exception.InvalidArgumentsError("Instruments.build is missing argument #" + a.number + ": `appName`");
                          break;

                      case 5:
                          err = new soda.exception.InvalidArgumentsError("Instruments.build is missing argument #" + a.number + ": `bundleId`");
                          break;
                      case 6:
                          err = new soda.exception.InvalidArgumentsError("Instruments.build is missing argument #" + a.number + ": `deviceToDeploy`");
                          break;
                      case 7:
                          err = new soda.exception.InvalidArgumentsError("Instruments.build is missing argument #" + a.number + ": `complete`");
                          break;
                    default:
                          err = new soda.exception.InvalidArgumentsError("Instruments.build has unknown argument #" + a.number + ": `complete`");
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

              require('child_process').exec("rm -rf " + buildPath + '/' + target + '.*', function (err, stdout, stderr) {
                  if(err)    throw err;
                  if(stderr) throw new Error(stderr);

                  self.findDevice(simulatorOrDevice, function (err, device) {

                    if(err) {
                        soda.console.error(err.message);
                        if(complete instanceof Function) complete.call(self, 1);
                        return;
                    }

                    if(device) {
                        var type = 'iOS Simulator';
                        var buildSetting = "iphonesimulator" + device.runtime;
                        switch(true) {
                            case /Apple TV/g.test(device.name):
                                type = "tvOS";
                                break;

                            case device.isSimulator === false:
                                type = "iOS";
                                buildSetting = "iOS";
                                break;
                            
                            default:
                                break;
                        }

                        var idb_companion;

                        idb_companion = require('child_process').spawn("pkill", [
                            "idb_companion"
                        ]);

                        if(idb_companion && idb_companion.stderr && idb_companion.stdout) {
                            idb_companion.stderr.on('data', function (data) {
                                soda.console.error(data.toString('utf-8'));
                            });

                            idb_companion.stdout.on('data', function (data) {
                                soda.console.verbose(data.toString('utf-8'));
                            });

                            idb_companion.on('close', function (code) {
                                console.log('Killed idb_companion');

                                idb_companion = require('child_process').spawn("idb_companion", [
                                    "--notify",
                                    "/tmp/idb_local_targets",
                                    "--udid",
                                    device.udid
                                ], {
                                    detached: true
                                  });

                                if(idb_companion && idb_companion.stderr && idb_companion.stdout) {
                                    console.log("Started idb_companion on " + device.udid);

                                    idb_companion.on('close', function (code) {
                                        console.log(idb_companion.stdout)
                                    });
                                }
                            });
                        }

                        var xbuild;

                        soda.console.verbose(device);

                        if (buildSetting === 'iOS') {
                          xbuild = require('child_process').spawn("xcodebuild", [
                              "-scheme",
                              target,
                              projectOrWorkSpaceFlag,
                              projectOrWorkSpace,
                              "-configuration",
                              "Debug",
                              "clean",
                              "build",
                              "CONFIGURATION_BUILD_DIR=" + buildPath,
                              "-destination",
                              "generic/platform=" + type + ",id=" + device.udid
                          ]);
                        }
                        else {
                          xbuild = require('child_process').spawn("xcodebuild", [
                              "-scheme",
                              target,
                              projectOrWorkSpaceFlag,
                              projectOrWorkSpace,
                              "-sdk",
                              buildSetting,
                              "-configuration",
                              "Debug",
                              "-destination",
                              "platform=" + type + ",name=" + device.name + ",OS=" + device.runtime,
                              "clean",
                              "build",
                          ]);
                        }

                        if(xbuild && xbuild.stderr && xbuild.stdout) {
                            xbuild.stderr.on('data', function (data) {
                                soda.console.error(data.toString('utf-8'));
                            });

                            xbuild.stdout.on('data', function (data) {
                                soda.console.verbose(data.toString('utf-8'));
                            });

                            xbuild.on('close', function (code) {
                              if (code !== 0) complete(new Error("Unsuccessful build."), false);

                              var appPath = appName;

                              if (appPath.indexOf('.app') < 0) {
                                appPath = buildPath + '/' + appName + '.app';
                              }

                              if (device.isSimulator) {
                                console.log(device, type);
                                console.log(appPath, device.name.replace(' ', '-'), device.runtime);

                                var start_sim;

                                start_sim = require('child_process').spawn("xcrun", [
                                    "simctl",
                                    "shutdown",
                                    device.udid
                                ]);

                                soda.console.error(start_sim);

                                if(start_sim && start_sim.stderr && start_sim.stdout) {
                                    start_sim.stderr.on('data', function (data) {
                                        soda.console.error(data.toString('utf-8'));
                                    });

                                    start_sim.stdout.on('data', function (data) {
                                        soda.console.verbose(data.toString('utf-8'));
                                    });

                                    start_sim.on('close', function (code) {
                                        start_sim = require('child_process').spawn("xcrun", [
                                            "simctl",
                                            "boot",
                                            device.udid
                                        ]);

                                        if(start_sim && start_sim.stderr && start_sim.stdout) {
                                            start_sim.stderr.on('data', function (data) {
                                                soda.console.error(data.toString('utf-8'));
                                            });

                                            start_sim.stdout.on('data', function (data) {
                                                soda.console.verbose(data.toString('utf-8'));
                                            });

                                            start_sim.on('close', function (code) {
                                                start_sim = require('child_process').spawn("open", [
                                                    "/Applications/Xcode.app/Contents/Developer/Applications/Simulator.app/"
                                                ]);

                                                if(start_sim && start_sim.stderr && start_sim.stdout) {
                                                    start_sim.stderr.on('data', function (data) {
                                                        soda.console.error(data.toString('utf-8'));
                                                    });

                                                    start_sim.stdout.on('data', function (data) {
                                                        soda.console.verbose(data.toString('utf-8'));
                                                    });

                                                    start_sim.on('close', function (code) {
                                                        console.log(start_sim.stdout);
                                                        start_sim.on('close', function (code) {
                                                            start_sim = require('child_process').spawn("idb", [
                                                                "connect",
                                                                "localhost",
                                                                "10882"
                                                            ]);

                                                            if(start_sim && start_sim.stderr && start_sim.stdout) {
                                                                start_sim.stderr.on('data', function (data) {
                                                                    soda.console.error(data.toString('utf-8'));
                                                                });

                                                                start_sim.stdout.on('data', function (data) {
                                                                    soda.console.verbose(data.toString('utf-8'));
                                                                });

                                                                start_sim.on('close', function (code) {
                                                                    start_sim = require('child_process').spawn("idb", [
                                                                        "install",
                                                                        appPath
                                                                    ]);

                                                                    if(start_sim && start_sim.stderr && start_sim.stdout) {
                                                                        start_sim.stderr.on('data', function (data) {
                                                                            soda.console.error(data.toString('utf-8'));
                                                                        });

                                                                        start_sim.stdout.on('data', function (data) {
                                                                            soda.console.verbose(data.toString('utf-8'));
                                                                        });

                                                                        start_sim.on('close', function (code) {
                                                                            complete.call(self, true);
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                              }
                              else {
                                complete.call(self, true);
                              }
                            });
                        }
                        else {
                            soda.console.error("Error spawning `xcodebuild`");
                            if(complete instanceof Function) complete.call(self, 1);
                        }
                      }
                      else {
                        if(complete) complete.call(self, true);
                      }
                  });
                });

                return self;
              }
              else {
                  if(complete) complete.call(self, true);
              }
        };

        /**
         * Upload a binary and install it onto target.
         * @param {string} simulatorOrDevice The device to be upload
         * @param {object} bundleId The bundle identifier
         * @param {string} appPath The path to the application
         * @param {function=} complete A callback for completion
         */
        this.upload = function (simulatorOrDevice, bundleId, appPath, complete) {
            var a = arguments.sodaexpect("string", "string", "string", "function|undefined"), err;

            if(a.error) {
                switch(a.number) {
                    case 0:
                        err = new soda.exception.InvalidArgumentsError("Instruments.upload is missing argument #" + a.number + ": `simulatorOrDevice`");
                        break;

                    case 1:
                        err = new soda.exception.InvalidArgumentsError("Instruments.upload is missing argument #" + a.number + ": `bundleId`");
                        break;

                    case 2:
                        err = new soda.exception.InvalidArgumentsError("Instruments.upload is missing argument #" + a.number + ": `appPath`");
                        break;

                    case 3:
                        err = new soda.exception.InvalidArgumentsError("Instruments.build is missing argument #" + a.number + ": `complete`");
                        break;

                    default:
                        err = new soda.exception.InvalidArgumentsError("Instruments.build has unknown argument #" + a.number + ": `complete`");
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

            uploadToDevice(simulatorOrDevice, bundleId, appPath, complete);

            return self;
        };

        /**
         * Resets the target simulator.
         * @param {function=} complete A callback for completion
         */
        this.reset = function (complete) {
            var a = arguments.sodaexpect("function|undefined"), err;

            if(a.error) {
                err = new soda.exception.InvalidArgumentsError("Callback required");
            }

            if(err) {
                if(complete instanceof Function) {
                    complete.call(self, false);
                }
                else {
                    throw err;
                }
            }
            require('child_process').exec(
                "pkill iOS\\ Simulator\n" +
                "pkill Simulator\n", function() {
                    var completedCount = 0;
                    self.findDevice(null, function(err, device, available) { // jshint ignore:line
                        if (err && complete) {
                            complete.call(self, false);
                        }

                        available.sodaeach(function (d, i) {
                            require('child_process').exec(
                            ("xcrun simctl shutdown " + i + "\n"), function(err, stdout, stderr) { // jshint ignore:line
                                completedCount++;

                                if (completedCount === available.sodamembers-1) {
                                    var xbuild = require('child_process').spawn("xcrun", [
                                        "simctl",
                                        "erase",
                                        "all"
                                    ]);

                                    xbuild.stderr.on('data', function (data) {
                                        soda.console.error(data.toString('utf-8'));
                                    });

                                    xbuild.stdout.on('data', function (data) {
                                        soda.console.verbose(data.toString('utf-8'));
                                    });

                                    if(complete) complete.call(self, true);
                                }
                            });
                        });
                    });
                });
        };

        /**
         * Starts the instruments framework driver
         * @param {string} simulator The device UDID or name to launch on the iOS simulator
         * @param {string} app The app to launch
         * @param {object} bundleId The bundle identifier
         * @param {string|function} testPath The path to the testing directory (defaults to process.cwd())
         * @param {object|function} options Command line flags
         * @param {function} complete A callback for completion
         */
        this.start = function (simulator, app, bundleId, testPath, testResultsPath, options, complete) {
            if(!complete && !options && testResultsPath instanceof Function) {
                complete = testPath;
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

            var a = arguments.sodaexpect("string", "string", "string", "string|undefined|null|object|function", "string|undefined|null|object|function", "object|undefined|null|function", "function|undefined|null");
            if(a.error) {
                switch(a.number) {
                    case 0:
                        throw new soda.exception.InvalidArgumentsError("Instruments.start is missing argument #" + a.number + ": `simulator`");

                    case 1:
                        throw new soda.exception.InvalidArgumentsError("Instruments.start is missing argument #" + a.number + ": `app`");

                    case 2:
                        throw new soda.exception.InvalidArgumentsError("Instruments.start is missing argument #" + a.number + ": `bundleId`");

                    case 3:
                        throw new soda.exception.InvalidArgumentsError("Instruments.start is missing argument #" + a.number + ": `testPath`");

                    case 4:
                        throw new soda.exception.InvalidArgumentsError("Instruments.start is missing argument #" + a.number + ": `testResultsPath`");

                    case 5:
                        throw new soda.exception.InvalidArgumentsError("Instruments.start is missing argument #" + a.number + ": `options`");

                    case 6:
                        throw new soda.exception.InvalidArgumentsError("Instruments.start is missing argument #" + a.number + ": `complete`");

                    default:
                        throw new soda.exception.InvalidArgumentsError("Instruments.start has unknown argument #" + a.number + ": `complete`");
                }
            }

            var args = arguments.sodaToArray;

            uploadToDevice(simulator, bundleId, app, function(err, instruments) {
              args.pop(); // Pop off the callback

              instance = {
                  process : instruments,
                  running : true,
                  args    : args
              };

              bundleIdentifier = bundleId;

              complete.call(self, null, true);
            });
        };

        /**
         * Stop the instruments framework
         * @param {function} complete A callback for completion
         */
        this.stop = function (complete) {
            if(!instance || (instance && instance.running === false)) {
                if(complete) complete.call(self, true);
                soda.console.debug("Instruments: Framework stopped");
                return;
            }

            var err = arguments.sodaexpect("function|undefined").error;

            if(err) throw err;

            require('child_process').exec(
                "pkill xcodebuild\n",
                function () {
                    setTimeout(function () {
                        instance = {
                            process: null,
                            running: false,
                            args   : null
                        };
                        soda.console.debug("Instruments: Framework stopped");
                        complete.call(self, null, true);
                    }, 3000);
                }
            );
        };

        /**
         * Restarts the app
         * If stopped, an error will be returned in the callback
         * @param {function} complete A callback for completion
         */
        this.restartApplication = function (complete) {
            driver.stopApplication(function (err, result) {
              return driver.startApplication(bundleIdentifier, complete);
            });
        };

        /**
         * Restarts the instruments framework
         * If stopped, an error will be returned in the callback
         * @param {function} complete A callback for completion
         */
        this.restart = function (complete) {
            var err = arguments.sodaexpect("function|undefined").error,
                args;

            if(err) {
                if(complete instanceof Function) complete.call(self, err, null);
            }
            else if(instance.process && instance.running === true) {
                args = instance.args;
                args.push(complete);
                self.stop(function () { self.start.apply(self, args); });
            }
            else {
                if(complete) complete.call(null, new Error("Cannot restart, since Instruments isn't running."), null);
            }
            return self;
        };

        /**
         * Searches the Device PList Directory in parallel and looks for a device match
         * @param {string} device The device name in the format `[name] [runtime]` or the device UDID
         * @param {function} complete A callback for completion, with provided arguments [error, device, device list]
         */
        function checkIsSimulator (device, complete) {
            var err = arguments.sodaexpect("object", "function|undefined").error;
            if(err) throw err;

            var file = nodePath.join(soda.config.get("userHome"), iconfig['DEVICE_PLIST_DIR'], device.udid, "device.plist");

            fs.stat(file, function (err, stat) {
                if(err) {
                    complete.call(self, false);
                    return;
                }
                else if(stat && stat.isFile() === true) {
                    complete.call(self, true);
                }
            });
        }

        /**
         * Lists all available devices
         * @param  {Function} done A callback for completion
         * @return {Instruments} The current Instruments instance
         */
        this.listAvailableDevices = function (done) {
            var devices = [];
            self.findDevice(null, function (err, device, available) {
                if(available && typeof available === "object") {
                    available.sodaeach(function (d) { devices.push(d.name + (d.runtime ? (" " + d.runtime) : "")); });
                }
                if(done instanceof Function) done.call(self, devices);
            });
            return self;
        };

        /**
         * Uses the `instruments -s device` command to locate either simulator or physical devices
         * @param {string} requestedDevice The device name in the format `[name] [runtime]` or the device UDID
         * @param {function} complete A callback for completion, with provided arguments [error, device, device list]
         */
        this.findDevice = function (requestedDevice, complete) {
            require('child_process').exec("instruments -s devices", function (err, stdout) {
                var available = {};

                if(err) {
                    complete.call(self, err, null, null);
                }
                else {
                    var devices = stdout
                        .replace(/Known Templates:\n[\s\S]*/, '')
                        .replace(/Known Devices:\n/, '').split('\n')
                        .toTruthy;

                    devices.sodaeach(function (device) {
                        var m = device.match(/([a-zA-Z0-9 ]+?) (?:(?:\((.*?)(?: Simulator)?\) )?)\[(.*)]/);

                        if(m) {
                            var deviceName = m[1],
                                deviceUDID = m[3],
                                deviceOS   = m[2] || null;

                            available[deviceUDID] = {
                                name        : deviceName,
                                udid        : deviceUDID,
                                runtime     : deviceOS
                            };
                        }
                    });

                    var foundDevice = null, count = available.sodamembers;
                    available.sodaeach(function (device) {
                        checkIsSimulator(device, function (isSim) {
                            count--;
                            device.isSimulator = !!isSim;
                            if((requestedDevice === device.name + ' ' + device.runtime || requestedDevice === device.udid || requestedDevice === device.name) && device.runtime.indexOf('Apple Watch') < 0) foundDevice = device;
                            if(count === 0) complete.call(self, null, foundDevice, available);
                        });
                    });
                }
            });
        };

        /**
         * Perform a user interaction on an element in the current DOM-Tree
         * @param {string} interaction The interaction name
         * @param {Array} elems An array of elements
         * @param {object} options Options
         * @param {function=} complete A callback for completion
         */
        this.performElementInteraction = function (interaction, elems, options, complete) {
            var err = arguments.sodaexpect("string", "array|string", "object|string|undefined", "function|undefined").error;
            if(err) throw err;

            if(!options) options = {};
            if(!(elems instanceof Array)) elems = [elems];

            var elemIds = [];
            elems.sodaeach(function (e) {
                elemIds.push(e.id);
            });

            switch(interaction) {
              case "setValue":
                  return elementInteractions.setValue(elems, options, complete);

              case "tap":
                  elementInteractions.tap(elems, options, function(err, result) {
                    setTimeout(function() {
                      if(complete) complete.call(self, err, result);
                    }, 2000);
                  });
                  break;

              case "scroll":
                  elementInteractions.scroll(elems, options, function(err, result) {
                    setTimeout(function() {
                      if(complete) complete.call(self, err, result);
                    }, 2000);
                  });
                  break;

                case "scrollToVisible":
                    options.count = 1;
                    elementInteractions.scrollToVisible(elems, options, function(err, result) {
                      setTimeout(function() {
                        if(driver) {
                          driver.getSourceTree(function(err, result) {
                              var iTree = null;

                              if (result.XCUIElementTypeApplication) {
                                iTree = Tree.buildTree(result, {});

                                var theElements = Tree.getElements();

                                if (elems[0] && theElements[elems[0].id]) {
                                  if (theElements[elems[0].id].visible) {
                                    if(complete) complete.call(self, err, result);
                                  }
                                  else {
                                    if (options.count < 5) {
                                      options.count = options.count + 1;
                                      self.performElementInteraction(interaction, elems, options, complete);
                                    }
                                    else {
                                      if(complete) complete.call(self, err, result);
                                    }
                                  }
                                }
                                else {
                                    if(complete) complete.call(self, err, result);
                                }
                              }
                              else {
                                if (complete) complete(null, false);
                              }
                              return iTree;
                            });
                        }
                        else {
                            if(complete instanceof Function)
                                complete(new Error("Cannot get element tree, since the driver hasn't been started yet."), false);
                        }
                      }, 2000);
                    });
                    break;

              default:
                  if(complete instanceof Function) complete(new Error("Unknown element interaction `" + interaction + "`"), null);
            }
        };

        /**
         * Perform a user interaction on an element in the current DOM-Tree
         * @param {string} interaction The interaction name
         * @param {object} options Options to pass onto Instruments
         * @param {function=} complete A callback for completion
         */
        this.performDeviceInteraction = function (interaction, options, complete) {
            var err = arguments.sodaexpect("string", "object|string|undefined", "function|undefined").error;

            if(err) {
                if(complete) complete.call(self, err, false);
                return;
            }

            if(driver) {
                switch(interaction) {
                    case "startApp":
                        return driver.startApplication(options.path === appName ? bundleIdentifier : options.path, complete);

                    case "openApp":
                        return driver.startApplication(options.path === appName ? bundleIdentifier : options.path, complete);

                    case "closeApp":
                        return driver.stopApplication(complete);

                    case "stopApp":
                        return driver.stopApplication(complete);

                    case "homeScreen":
                        return driver.home(options, complete);

                    case "lockScreen":
                        return driver.lock(options, complete);

                    case "captureScreen":
                        return driver.takeScreenshot(options, complete);

                    case "tapXY":
                        return driver.tapXY(options, complete);

                    case "typeOnKeyboard":
                        return driver.typeOnKeyboard(options.string, complete);

                    case "scroll window":
                        return driver.scrollScreen(options, complete);

                    case "deviceSwipe":
                        return driver.swipe(options, complete);

                    case "resetAppData":
                        return driver.resetAppData(complete);

                    default:
                        if(complete instanceof Function) complete(new Error("Unsupported or unknown device interaction `" + interaction + "`"), null);
                }
            }
            else {
                if(complete instanceof Function)
                    complete(new Error("Cannot perform device interaction, since the driver hasn't been started yet."), false);
            }

            return self;
        };

        /**
         * Gets the DOM tree from Instruments. First it sends a request to build the tree to instruments, then when instruments
         * responds, it calls the completion callback with the results.
         * @param {{}|function} options Options to pass to instruments
         * @param {function=} complete A callback for completion
         */
        this.getTree = function (options, complete) {
          if(!complete && options instanceof Function) {
              complete     = options;
              options  = undefined;
          }

          if(driver) {
            driver.getSourceTree(function(err, result) {
                var iTree = null;

                if (result.XCUIElementTypeApplication) {
                  if (!appName) {
                    appName = result.XCUIElementTypeApplication.$.name;
                    console.log("Stored appName as:", appName);
                  }

                  iTree = Tree.buildTree(result, {});

                  if (iTree === false && complete) {
                      complete(new Error("Could not get tree from Instruments"), false);
                  }

                  if (complete) complete(null, iTree);
                }
                else {
                  if (complete) complete(null, false);
                }
                return iTree;
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
         * Results will be an integer 0 - 6, according to:
         * https://developer.apple.com/library/prerelease/ios/documentation/ToolsLanguages/Reference/UIATargetClassReference/index.html#//apple_ref/doc/uid/TP40009924-CH3-DontLinkElementID_4
         * @param {function} complete A callback for completion
         */
        this.getOrientation = function (complete) {
            getOrientation(function (err, orientation) {
                if(err) {
                    if(complete) complete.call(self, err, null);
                    return;
                }

                var orientationValue = 0;

                switch (orientation) {
                  case "PORTRAIT":
                    orientationValue = 1;
                    break;
                  case "UIA_DEVICE_ORIENTATION_PORTRAIT_UPSIDEDOWN":
                    orientationValue = 2;
                    break;
                  case "LANDSCAPE":
                    orientationValue = 3;
                    break;
                  case "UIA_DEVICE_ORIENTATION_LANDSCAPERIGHT":
                    orientationValue = 4;
                    break;
                  case "UIA_DEVICE_ORIENTATION_FACEUP":
                    orientationValue = 5;
                    break;
                  case "UIA_DEVICE_ORIENTATION_FACEDOWN":
                    orientationValue = 6;
                    break;
                  default:
                    orientationValue = 1;
                    break;
                }

                if(complete) complete.call(self, err, orientationValue);
            });
        };

        /**
         * Gets the device's screen bounds<br>
         * @param {function} complete A callback for completion
         */
        this.getScreenBounds = function (complete) {
          getScreenBounds(function (err, contents) {
              if(err) {
                  if(complete) complete.call(self, err, null);
                  return;
              }
              if(complete) complete.call(self, err, contents);
          });
        };

        /**
         * Returns whether it is a simulator <br>
         * @param {boolean} result A boolean for the result
         */
        this.isDeviceASimulator = function () {
          return this.isSimulator;
        };
    };

    return Object.freeze(new Instruments (soda));
};
