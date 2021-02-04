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
 * @module Automator
 * @description The Android Automator framework for the Soda Test Engine
 */

var fs       = require("fs"),
    nodePath = require("path");

/**
 * The Automator framework driver for Soda
 * @constructor
 */
var Automator = function (soda) {

    var path = require("path"),
        self    = this,
        Device  = null,
        initArgs,

        /**
         * @composes AutomatorConfiguration
         */
        settings  = require(path.join(__dirname, "imports", "Config.js"))(soda),

        /**
         * @composes BuildTree
         */
        buildTree = require(path.join(__dirname, "imports", "BuildTree.js")),

        /**
         * @composes EmulatorControl
         */
        emulatorControl = new (require(path.join(__dirname, "imports", "EmulatorControl.js")))(soda, settings),

        /**
         * @composes Automator/DeviceInteractions
         */
        deviceInteractions  = new (require(path.join(__dirname, "imports", "DeviceInteractions.js")))(soda, settings, emulatorControl),

        /**
         * @composes Automator/ElementInteractions
         */
        elementInteractions = new (require(path.join(__dirname, "imports", "ElementInteractions.js")))(soda, settings, emulatorControl),

        adb      = settings.ADB_PATH;

    /**
     * The framework name
     * @type {String}
     */
    this.name = "Automator";

    /**
     * The framework platform
     * @type {String}
     */
    this.platform = "Android";

    /**
     * The framework version
     * @type {String}
     */
    this.version  = "1.0";

    /**
     * The default Soda syntax this framework users
     * @type {String}
     */
    this.defaultSyntaxVersion = "2.0";

    /**
     * The defaulat syntax name the framework uses
     * @type {String}
     */
    this.defaultSyntaxName = "mobile";

    // Kill the app on exit
    function killAppOnExit () {
        if(Device && typeof Device === "object" && Device.packagename && soda.config.get("dontKillAutomatorApp") !== true) {
            soda.console.debug("Automator: Killing app `" + Device.packagename + "`");
            try {
                require("child_process").execSync(settings.ADB_PATH + " -s " + Device.serial + " shell am force-stop " + Device.packagename);
            }
            catch (e) { /* No Op */ }
        }
    }

    /**
     * Starts the specified device and writes the USB identifier to it
     * @param  {String} deviceName The name of the device
     * @param  {Function} done A callback for completion
     * @return {undefined}
     */
    function startDeviceAndWriteIdentifier (deviceName, done) {
        var startTime = Date.now();

        emulatorControl.startDevice(deviceName, settings.DEFAULT_EMULATOR_PORT, function (err, device) {
            soda.console.debug("Automator: Device `" + device.name + "` started in " + ((Date.now() - startTime) / 1000) + " seconds");
            Device = device;

            if(done instanceof Function) done(err, true, device);
        });
    }

    /**
     * Removes and installs the specified APK
     * @param {Object} device The automator device object
     * @param {String} apk Path the the apk to install
     * @param {Function} done A callback for completion
     * @return {undefined}
     */
    function removeAndInstallApp (device, apk, done) {
        emulatorControl.isPackageAvailable(device, apk, function (err, installed) {

            if (!installed) {
                console.log("Automator: APK not installed, installing APK `" + apk + "` on device `" + device.name + "`");
                emulatorControl.installApk(device, apk, null, function (err) {
                    if(done instanceof Function) done.call(self, err);
                });
            }
            else {
                emulatorControl.getPackageName(apk, function (err, packageNameResult) {
                    if(err) {
                        if(done instanceof Function) done.call(self, err, false);
                    }
                    else {
                        if (packageNameResult) {
                            emulatorControl.removeApk(device, packageNameResult, function (err) {
                                if(err) {
                                    if(done instanceof Function) done.call(self, err, false);
                                }
                                else {
                                    soda.console.debug("Automator: APK `" + packageNameResult + "` un-installed from device `" + device.name + "`");
                                    soda.console.debug("Automator: Installing APK `" + apk + "` on device `" + device.name + "`");
                                    emulatorControl.installApk(device, apk, null, function (err) {
                                        if(done instanceof Function) done.call(self, err);
                                    });
                                }
                            });
                        }
                    }
                });
            }
        });
    }

    /**
     * Builds an XCode Workspace and installs it onto target simulator.
     * @param {string} target The XCode target to be built
     * @param {string} workspace The full path to the xcworkspace file
     * @param {string} currentSDK The name of the simulator sdk to install to
     * @param {string} buildPath The path where the app will be built to
     * @param {function=} done A callback for completion
     */
    this.build = function (deviceName, apk, done) {
        var a = arguments.sodaexpect("string", "string", "function|undefined");

        if(a.error) {
            switch(a.number) {
                case 0:
                    throw new soda.exception.InvalidArgumentsError("Instruments.build is missing argument #" + a.number + ": `target`");

                case 1:
                    throw new soda.exception.InvalidArgumentsError("Instruments.build is missing argument #" + a.number + ": `apk`");

                case 4:
                    throw new soda.exception.InvalidArgumentsError("Instruments.build is missing argument #" + a.number + ": `complete`");
                
                default:
                    throw new soda.exception.InvalidArgumentsError("Instruments.build has argument #" + a.number + ": `complete`");
            }
        }

        emulatorControl.attachToDeviceIfPossible(deviceName, function (err, serial) {
            if(!err && serial) {
                Device = {
                    serial   : serial,
                    name     : deviceName,
                    port     : serial.slice(-4),
                    instance : settings.NULL_PORT
                };
                removeAndInstallApp(Device, apk, done);
            }
            else {
                console.log("Automator: Starting device `" + deviceName + "` and determining whether to install the APK `" + apk + "` (This may take a while...)");
                startDeviceAndWriteIdentifier(deviceName, function (err, started, device) {
                    if(err) {
                        if(done instanceof Function) done.call(self, err, started, device);
                    }
                    else {
                        removeAndInstallApp(Device, apk, done);
                    }
                });
            }
        });
    };

    /**
     * Lists all available devices
     * @param  {Function} done A callback for completion
     */
    this.listAvailableDevices = function (done) {
        var devices = [];
        fs.readdir(nodePath.resolve(settings.DOT_ANDROID_PATH + "/avd"), function (err, list) {
            if(!err) {
                list = list.filter(item => item !== '.DS_Store');
                
                list.sodaeach(function (file) {
                    if(nodePath.extname(file) === ".ini") {
                        devices.push(nodePath.basename(file, ".ini"));
                    }
                });
            }

            fs.exists(adb, function(exists) {
              if (exists) {
                require("child_process").exec(adb + " devices", function (err, stdout, stderr) {
                    if(err || stderr) {
                        soda.console.error(err, stderr);
                    }
                    else {
                      var match  = stdout.match(/(\d+)/g);

                      if (match) {
                          match.sodaeach(function (device) {
                              devices.push(device);
                          });
                      }
                    }

                    if(done instanceof Function) done.call(self, devices);
                });
              }
              else {
                if(done instanceof Function) done.call(self, devices);
              }
            });
        });
    };

    /**
     * Restarts the app
     * If stopped, an error will be returned in the callback
     * @param {function} complete A callback for completion
     */
    this.restartApplication = function (complete) {
        require("child_process").execSync(settings.ADB_PATH + " -s " + Device.serial + " shell am force-stop " + Device.packagename);

        return emulatorControl.startApp(Device, complete);
    };

    /**
     * Starts the Automator framework
     * @param {string} deviceName The name of the simulator or device to start the framework with
     * @param {string} apk Path to the apk to install (or launch)
     * @param {{}|function} options Options
     * @param {function} done A callback for completion
     */
    this.start = function (deviceName, apk, options, done) {
        process.on('exit', killAppOnExit);

        var a = arguments.sodaexpect("string", "string", "object|undefined|null|function", "function|undefined|null");
        if(a.error) {
            switch(a.number) {
                case 0:
                    throw new soda.exception.InvalidArgumentsError("Automator.start is missing argument #" + a.number + ": `device`");

                case 1:
                    throw new soda.exception.InvalidArgumentsError("Automator.start is missing argument #" + a.number + ": `apk`");

                case 2:
                    throw new soda.exception.InvalidArgumentsError("Automator.start is missing argument #" + a.number + ": `options`");

                case 3:
                    throw new soda.exception.InvalidArgumentsError("Automator.start is missing argument #" + a.number + ": `complete`");

                default:
                    throw new soda.exception.InvalidArgumentsError("Automator.start has argument #" + a.number + ": `complete`");
            }
        }

        if(!done && options instanceof Function) {
            done = options;
            options  = undefined;
        }

        var initArgs = arguments.getArray;

        if(initArgs.sodalast() instanceof Function) initArgs.slice(0, -1);

        // Sanitize emulator name input
        deviceName = deviceName.replace(/([^a-zA-Z0-9_]| )+/g, '_');

        // Check that SDK Path exists
        fs.stat(soda.config.get("androidSDKPath"), function (err, stat) {
            if(err || (stat && !stat.isDirectory())) {
                if(done instanceof Function) done.call(self, new Error("Your Android SDK path (" + soda.config.get("androidSDKPath") + ") is invalid!\nSet the environment variable ANDROID_SDK_HOME or the setting \"androidSDKPath\" in SodaCommon/Config to your Android SDK directry"), false);
                return;
            }
            else {
                // Overwrite the user value with at least 10...
                soda.config.set("findElementRetries", 10);

                if(!options) options = {
                    i: false,
                    r: false
                };

                if(Device) {
                    Device.apk = apk;
                    if(done) done(null, true, Device);
                    return;
                }

                var startApp = function(dev, done) {

                    emulatorControl.isPackageAvailable(dev, apk, function (err, installed) {
                        if (!installed) {
                            console.log("Automator: APK not installed, installing apk `" + apk + "` on device `" + deviceName + "`");
                            emulatorControl.installApk(dev, apk, null, function (err) {
                                if(err) {
                                    if(done instanceof Function) done.call(self, err, false);
                                    return;
                                }
                                startApp(dev, done);
                            });
                        }
                        else {
                            emulatorControl.getPackageName(apk, function (err, packageNameResult) {
                                if(err) {
                                    if(done instanceof Function) done.call(self, err, false);
                                    return;
                                }

                                if(packageNameResult) {
                                    emulatorControl.unlockScreen(dev, function(err) {
                                        if(err) {
                                            if(done instanceof Function) done.call(self, err, false, dev.instance);
                                            return;
                                        }

                                        emulatorControl.startApp(dev, function(err) {
                                            if(err) {
                                                if(done instanceof Function) done.call(self, err, false, dev.instance);
                                                return;
                                            }

                                            setTimeout(function () {
                                                if(done instanceof Function) done.call(self, null, true, dev.instance);
                                            }, settings.TIME_TO_WAIT_FOR_APP_TO_START);
                                        });
                                    });
                                }
                                else {
                                    console.log("Automator: Installing apk `" + apk + "` on device `" + deviceName + "`");
                                    emulatorControl.installApk(dev, apk, null, function (err) {
                                        if(err) {
                                            if(done instanceof Function) done.call(self, err, false);
                                            return;
                                        }

                                        emulatorControl.unlockScreen(dev, function(err) {
                                            if(err) {
                                                if(done instanceof Function) done.call(self, err, false, dev.instance);
                                                return;
                                            }

                                            emulatorControl.startApp(dev, function(err) {
                                                if(err) {
                                                    if(done instanceof Function) done.call(self, err, false, dev.instance);
                                                    return;
                                                }

                                                setTimeout(function () {
                                                    if(done instanceof Function) done.call(self, null, true, dev.instance);
                                                }, settings.TIME_TO_WAIT_FOR_APP_TO_START);
                                            });
                                        });
                                    });
                                }
                            });
                        }
                    });
                };

                // Try to attach to the device if it's already been started, or boot it otherwise
                soda.console.debug("Attempting to attach to device `" + deviceName + "`");

                emulatorControl.attachToDeviceIfPossible(deviceName, function (err, device) {
                    if(!err && device) {
                        device = {
                            serial   : device,
                            name     : deviceName,
                            port     : device.slice(-4),
                            instance : settings.NULL_PORT
                        };
                        Device = device;
                        startApp(Device, done);
                    }
                    else {
                        console.log("Automator: Starting device `" + deviceName + "` and determining whether to install the apk `" + apk + "` (This may take a while...)");
                        startDeviceAndWriteIdentifier(deviceName, function (err, started, device) {
                            if(err) {
                                if(done instanceof Function) done.call(self, err, started, device);
                            }
                            else {
                                startApp(Device, done);
                            }
                        });
                    }
                });
            }
        });
    };

    /**
     * Stops the Automator framework
     * @param {function=} complete A callback for completion
     */
    this.stop = function (complete) {
        process.removeListener('exit', killAppOnExit);

        if(Device) {
            emulatorControl.stopDevice(Device, complete);
        }
        else {
            if(complete instanceof Function) complete(null, true);
        }
    };

    /**
     * Restart the Automator framework
     * @param {function=} complete A callback for completion
     */
    this.restart = function (complete) {
        emulatorControl.stopDevice(Device, function (err, stopped) {
            if(err) {
                if(complete instanceof Function) complete.call(self, err, null);
            }
            else if(stopped) {
                self.start(Device.name, Device.apk, {}, complete);
            }
            else {
                if(complete instanceof Function) complete.call(self, new Error("Unable to stop the Automator framework..."), false, null);
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
        switch(interaction) {
            case "setValue":
                return elementInteractions.setValue(Device, elems, options, complete);

            case "tap":
                return elementInteractions.tap(Device, elems, options, complete);

            case "scroll":
                return elementInteractions.scroll(Device, elems, options, complete);

            default:
                if(complete instanceof Function) complete(new Error("Unknown element interaction `" + interaction + "`"), null);
        }

    };

    /**
     * Perform a user interaction on an element in the current DOM-Tree
     * @param {string} interaction The interaction name
     * @param {object} options Options to pass onto Automator
     * @param {function=} complete A callback for completion
     */
    this.performDeviceInteraction = function (interaction, options, complete) {
        switch(interaction) {
            case "captureScreen":
                return deviceInteractions.captureScreen(Device, options, complete);

            case "captureHeader":
                return deviceInteractions.captureScreen(Device, options, complete);

            case "hideAppForSeconds":
                return deviceInteractions.hideAppForSeconds(Device, options, complete);

            case "resetAppData":
                return emulatorControl.resetAppData(Device, complete);

            case "closeApp":
                return emulatorControl.stopApp(Device, complete);

            case "openApp":
                return emulatorControl.startApp(Device, complete);

            case "back":
                return deviceInteractions.back(Device, options, complete);

            case "openApp":
                return emulatorControl.startApp(Device, complete);

            case "startApp":
                return emulatorControl.startApp(Device, complete);

            case "rotateDevice":
                return deviceInteractions.rotateDevice(Device, options, complete);

            case "tapXY":
                return deviceInteractions.tapXY(Device, options, complete);

            case "scroll window":
                return deviceInteractions.scrollScreen(Device, options, complete);

            default:
                if(complete instanceof Function) complete(new Error("Unsupported or unknown device interaction `" + interaction + "`"), null);
        }
    };

    /**
     * Gets the DOM tree from Automation.
     * @param {{}|function} options Options to pass to instruments
     * @param {function=} complete A callback for completion
     */
    this.getTree = function (options, complete) {
        if (!complete && options instanceof Function) {
            complete = options;
            options = {};
        }

        if(settings.DUMP_METHOD === "pull") {
            var dumpPath = nodePath.join(soda.config.get("temp"), Device.serial + "-screendump.xml");

            emulatorControl.getScreenDumpPullMethod(Device, dumpPath, function (err) {
                if(err) return complete instanceof Function ? complete(err, null)  : err;

                emulatorControl.getJSONDump(dumpPath, function dumpCallback (err, res) {
                    if(err) return complete instanceof Function ? complete(err, null) : err;

                    if(res) {
                        var tree = buildTree(res);
                        if (complete) complete(null, tree);
                        return tree;
                    }
                    else {
                        emulatorControl.getScreenDumpPullMethod(Device, dumpPath, dumpCallback);
                    }
                });
            });
        }
        else {
            emulatorControl.getScreenDump(Device, function dumpCallback (err, dump) {
                if(err) return complete instanceof Function ? complete(err, null)  : err;

                if(dump) {
                    var tree = buildTree(dump);
                    if (complete instanceof Function) complete(null, tree);
                    return tree;
                }
                else {
                    emulatorControl.getScreenDump(Device, dumpCallback);
                }
            });
        }
    };

    /**
     * Gets the device orientation<br>
     * Results will be an integer, either 0 or 1.
     * 0 is landscape, 1 is portrait
     * @param {function} complete A callback for completion
     */
    this.getOrientation = function (complete) {
        return emulatorControl.getOrientation(Device, complete);
    };

    /**
     * Gets the device screen bounds as an [width, height] array
     * @param {function} complete A callback for completion
     */
    this.getScreenBounds = function (complete) {
        return emulatorControl.getScreenBounds(Device, complete);
    };
};

module.exports = function ($) {
    return Object.freeze(new Automator($));
};
