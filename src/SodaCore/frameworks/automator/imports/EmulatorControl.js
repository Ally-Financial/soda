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
 * @module Automator/EmulatorControl
 */

/**
 *  Automator/EmulatorControl
 * @param {object} soda The Soda library
 * @param {object} settings Automator settings object
 * @constructor
 */
var EmulatorControl = function (soda, settings) {

    var self     = this,
        adb      = settings.ADB_PATH,
        aapt     = settings.AAPT_TOOLS_PATH,
        fs       = require("fs"),
        xml2js   = require("xml2js").Parser();

    /**
     * Find all the ports in that ADB devices are currently running on
     * @param {function} done A callback for completion
     */
    this.findBoundPorts = function (done) {
        var err = arguments.sodaexpect("function").error;

        if(err) {
            if(done instanceof Function) done.call(self, err, null);
            return;
        }

        require("child_process").exec(adb + " devices", function (err, stdout, stderr) {
            if(err || stderr) {
                if(done instanceof Function) done.call(self, err || new Error(stderr), null);
            }
            else {
                var reg = /emulator-(\d+)/g,
                    res = [], m;

                while((m = reg.exec(stdout)) !== null) res.push(m[1]);
                if(done instanceof Function) done.call(self, null, res);
            }
        });
    };

    /**
     * Runs the `adb devices` and looks for the specified device
     * @param {object} device The device to check availability for
     * @param {function} done A callback for completion
     */
    this.isDeviceAvailable = function (device, done) {
        var err = arguments.sodaexpect("object", "function").error;

        if(err) {
            if(done instanceof Function) done.call(self, err, false);
            return;
        }

        require("child_process").exec(adb + " kill-server && " + adb + " devices", function (err, stdout, stderr) {
            if(err || stderr) {
                if(done instanceof Function) done.call(self, err || new Error(stderr), false);
            }
            else {
                var res = stdout.match(device.serial);
                if(done instanceof Function) done.call(self, null, !!res);
            }
        });
    };

    /**
     * Runs the `adb shell setprop`
     * @param {object} device The device to check availability for
     * @param {string} identifier to write
     * @param {function} done A callback for completion
     */
    this.writeUsbIdentifier = function(deviceName, deviceIdentifier, done) {
        soda.console.debug("Automator: Writing identifier: `" + deviceIdentifier + "` to device `" + deviceName + "`");
        require("child_process").exec(adb + " -s " + deviceName + " shell setprop persist.usb.serialno " + deviceIdentifier, function (err, stdout, stderr) {
            if(done instanceof Function) {
                done(err ? err : stderr ? new Error(stderr) : null);
            }
        });
    };

    /**
     * Runs the `adb devices` and looks for the specified device
     * @param {object} device The device to check availability for
     * @param {function} done A callback for completion
     */
    this.attachToDeviceIfPossible = function (device, done) {
        require("child_process").exec(adb + " kill-server", function (err, stdout, stderr) {
            if(err || stderr) {
                if(done instanceof Function) done.call(self, err || new Error(stderr), null);
            }
            else {
                soda.console.warn("Automator: ADB server killed, finding running devices...");
                require("child_process").exec(adb + " devices", function (err, stdout, stderr) {
                    if(err || stderr) {
                        if(done instanceof Function) done.call(self, err || new Error(stderr), null);
                    }
                    else {
                        var found       = false,
                            deviceRegex = /(.*)\tdevice/g,
                            devices     = [],
                            match       = deviceRegex.exec(stdout);

                        while (match !== null) {
                            devices.push(match[1]);
                            match = deviceRegex.exec(stdout);
                        }

                        soda.console.debug("Automator: Found device(s) with serial(s):", (devices.length > 0 ? devices.join(", ") : "(none)"));
                        if(devices.length === 0) {
                            if(done instanceof Function) done.call(self, null, null);
                        }
                        else {
                            (function loopDevices (i) {
                                if (i < devices.length) {
                                    var serial = devices[i];
                                    require("child_process").exec(adb + " -s " + serial + " shell getprop ro.serialno", function (err, stdout, stderr) {
                                        if(err || stderr) {
                                            if(done instanceof Function) done.call(self, err || new Error(stderr), null);
                                        }
                                        else {
                                            if(stdout.trim() === device.trim() || serial === device.trim()) {
                                                console.log("Automator: Attaching to device: `" + device + "` with serial `" + serial + "` that matches `" + device + "`");

                                                if(done instanceof Function) done.call(self, null, serial);
                                            }
                                            else {
                                                loopDevices(++i);
                                            }
                                        }
                                    });
                                }
                                else {
                                    if(done instanceof Function) done(new Error(stdout), null);
                                }
                            }(0));
                        }
                    }
                });
            }
        });
    };

    /**
     * Runs the `adb shell pm list packages` and looks for the specified package
     * @param {{}} device The device to check availability for
     * @param {string} apkPackage The .apk package name
     * @param {function} done A callback for completion
     */
    this.isPackageAvailable = function (device, apkPackage, done) {
        var err = arguments.sodaexpect("object", "string", "function|undefined|null").error;

        if(err) {
            if(done instanceof Function) done.call(self, err, false);
            return;
        }
        self.getPackageName(apkPackage, function (err, packageNameResult) {
            if(err) {
                if(done instanceof Function) done.call(self, err, false);
            }
            else if(packageNameResult) {
                soda.console.debug("Is package available: " + adb + " -s " + device.serial + " shell pm list packages " + packageNameResult);

                require("child_process").exec(adb + " -s " + device.serial + " shell pm list packages " + packageNameResult, function (err, stdout, stderr) {
                    if(err || stderr) {
                        if(done instanceof Function) done.call(self, err || new Error(stderr), false);
                    }
                    else {
                        var res = (stdout.trim() === "package:" + packageNameResult);
                        if(res) {
                          device.apk = apkPackage;
                          device.packagename = packageNameResult;
                        }

                        if(done instanceof Function) done.call(self, null, !!res);
                    }
                });
            }
            else {
                if(done instanceof Function) done.call(self, new Error("apkPackage does not contain a packageName"), false);
            }
        });
    };

    /**
     * Runs the `aapt dump badging` command and finds the package name
     * @param {string} apkPackage .apk to find the package name for
     * @param {function} done A callback for completion
     */
    this.getPackageName = function (apkPackage, done) {
        var err = arguments.sodaexpect("string", "function|undefined|null").error;
        if(err) {
            if(done instanceof Function) done.call(self, err, false);
            return;
        }

        soda.console.debug("Get package name: " + aapt + " dump badging " + apkPackage + " | grep package:\\ name");

        require("child_process").exec(aapt + " dump badging " + apkPackage + " | grep package:\\ name", function (err, stdout, stderr) {
            if(err || stderr) {
                if(done instanceof Function) done.call(self, err || new Error(stderr), false);
            }
            else {
                var match  = stdout.match(/^.*name='(\w+(?:\.\w+)+)'/),
                    result = null;

                if (match && match[1]) result = match[1];
                if(done instanceof Function) done.call(self, null, result);
            }
        });
    };

    /**
     * Runs the `adb shell pm clear` command to clear an application's data
     * @param {object} device The device to reset
     * @param {function} done A callback for completion
     */
    this.resetAppData = function (device, done) {
        var err = arguments.sodaexpect("object", "function|undefined|null").error;
        if(err) {
            if(done instanceof Function) done.call(self, err, false);
            return;
        }

        require("child_process").exec(adb + " -s " + device.serial + " shell pm clear " + device.packagename, function (err, stdout, stderr) {
            if(err || stderr) {
                if(done instanceof Function) done.call(self, err || new Error(stderr), false);
            }
            else {
                self.startApp(device, done);
            }
        });
    };

    /**
     * Stops a device
     * @param {object} device The device to stop
     * @param {function} done A callback for completion
     */
    this.stopDevice = function (device, done) {
        var err = arguments.sodaexpect("object", "function|undefined").error;
        if(err) {
            if(done instanceof Function) done.call(self, err, false);
            return;
        }

        if (device.instance && device.instance !== settings.NULL_PORT) {
            soda.console.debug("Automator: Killing app `" + device.packagename + "`");
            require("child_process").exec(adb + " -s " + device.serial + " shell am force-stop " + device.packagename, function (err) {
                device = null;
                if(done instanceof Function) return done.call(self, err, !err);
            });
        }
        else {
            soda.console.debug("Automator: Killing app `" + device.packagename + "`");
            require("child_process").exec(adb + " -s " + device.serial + " shell am force-stop " + device.packagename, function (err) {
                device = null;
                if(done instanceof Function) return done.call(self, err, !err);
            });
        }
    };

    /**
     * Starts a device on the specified port
     * @param {string} deviceName The name of the device to start
     * @param {number|undefined=} port The port to start the device on
     * @param {function|undefined=} done A callback for completion
     */
    this.startDevice = function (deviceName, port, done) {
        var err = arguments.sodaexpect("string", "number|function|undefined|null", "function|undefined|null").error,
            device, spawned, args;

        if(err) {
            if(done instanceof Function) done.call(self, err, false);
            return;
        }

        if(!done && port instanceof Function) {
            done = port;
            port = undefined;
        }

        port = parseInt(port, 10) || settings.DEFAULT_EMULATOR_PORT;
        if(port > 5680 || port < 5554) {
            if(done instanceof Function) done.call(self, new Error("Arugment `port` must be an integer between 5554 and 5680", null));
            return;
        }

        self.findBoundPorts(function (err, bound) {
            soda.console.debug("Automator: ADB ports in use: " + (bound.length > 0 ? bound.join(", ") : "(none)"));
            soda.console.debug("Automator: Attempting to start device on port `" + port + "`");

            if(bound.indexOf(port.toString()) > -1) {
                if(settings.AUTO_FIX_BUSY_PORT === false) {
                    soda.console.warn("Automator: Port `" + port + "` already in use. Unable to start ADB Device!");
                    if(done instanceof Function) done(new Error("Argument `port` must be an integer between 5554 and 5680", null));
                    return;
                }
                else {
                    port = 5554;
                    while(bound.indexOf(port.toString()) > -1) {
                        port += 2;
                        if(port > 5680) {
                            if(done instanceof Function) done.call(self, new Error("Too many emulators in use — no available ports! Unable to continue..."), null);
                            return;
                        }
                    }
                    soda.console.debug("Automator: Port changed to `" + port + "`, as requested port was in use.");
                }
            }

            args = ["-avd", deviceName, "-port", port, "-netdelay", "none", "-netspeed", "full"];
            if (soda.config.get("proxy")) {
                soda.console.debug("Automator: Starting AVD Device `" + deviceName + "` with arguments: `" + args.join(", ") + ", -http-proxy, ******`");

                args.push("-http-proxy");
                args.push(soda.config.get("proxy"));
            }
            else {
              soda.console.debug("Automator: Starting AVD Device `" + deviceName + "` with arguments: `" + args.join(", ") + "`");
            }

            spawned = require("child_process").spawn(settings.EMULATOR_PATH, args);

            spawned.stderr.on('data', function (err) {
                soda.console.error("Automator:", err.toString("utf-8").replace(/\n+$/, ''));
            });

            spawned.stdout.on('data', function (data) {
                soda.console.debug("Automator:", data.toString("utf-8").replace(/\n+$/, ''));
            });

            device = {
                serial   : "emulator-" + port,
                name     : deviceName,
                port     : port,
                instance : spawned
            };

            self.waitForDevice(device, function (err) {
                if(done instanceof Function) done.call(self, err, device);
            });
        });
    };

    /**
     * Waits for the device to boot
     * @param {object} device The device to wait to boot for
     * @param {number=} timeout The time to wait for the device to boot, or aconfig.DEVICE_DISCOVERY_TIMEOUT if unspecified
     * @param {function=} complete A callback for completion
     */
    this.waitForBoot = function (device, timeout, complete) {
        var err      = arguments.sodaexpect("object", "number|undefined|null", "function|undefined|null").error,
            timedout = false,
            deviceBootTimeout;

        if(err) {
            if(complete instanceof Function) complete.call(self, err, false);
            return;
        }

        if(!complete && timeout instanceof Function) {
            complete = timeout;
            timeout  = undefined;
        }

        deviceBootTimeout = setTimeout(function () {
            soda.console.debug("Automator: Timed out after " + timeout.toString() + " seconds while waiting for device to boot");
            if(complete instanceof Function) complete.call(self, null, false);
        }, timeout || settings.DEVICE_BOOT_TIMEOUT);

        (function getBootedProperty () {
            require("child_process").exec(adb + " -s " + device.serial + " shell getprop sys.boot_completed", function (err, stdout) {
                if(!timedout) {
                    if(typeof stdout === "string" && stdout.toString('utf-8').trim() === "1") {
                        clearTimeout(deviceBootTimeout);
                        if(complete instanceof Function) complete.call(self, null, true);
                    }
                    else {
                        soda.console.debug("Automator: Still waiting for boot...");
                        setTimeout(getBootedProperty, settings.DEVICE_BOOT_INTERVAL);
                    }
                }
            });
        }());
    };

    /**
     * Waits for the device to become available in the `adb devices` list
     * @param {object} device The device to wait for
     * @param {number=} timeout The time to wait, or if unspecified: aconfig.DEVICE_DISCOVERY_TIMEOUT
     * @param {function=} complete A callback for completion
     */
    this.waitForDevice = function (device, timeout, done) {
        var err      = arguments.sodaexpect("object", "number|undefined|null|function", "function|undefined|null").error,
            timedout = false,
            deviceDiscoveryTimeout;

        if(!done && timeout instanceof Function) {
            done    = timeout;
            timeout = undefined;
        }

        if(err) {
            if(done instanceof Function) done.call(self, err);
            return;
        }

        deviceDiscoveryTimeout = setTimeout(function () {
            timedout = true;
            soda.console.debug("Automator: Timed out after " + timeout.toString() + " seconds while waiting for device to become available!");
            if(done instanceof Function) done(null, false);
        }, timeout || settings.DEVICE_DISCOVERY_TIMEOUT);

        soda.console.debug("Automator: Waiting on ADB Server...");
        self.isDeviceAvailable(device, function isDeviceAvailable (err, available) {
            if(!timedout) {
                if(available || err) {
                    clearTimeout(deviceDiscoveryTimeout);

                    if(err) {
                        if (done instanceof Function) done.call(self, err);
                        return;
                    }

                    console.log("Automator: Waiting for device `" + device.name + "` to boot...");

                    self.waitForBoot(device, timeout, function (err) {
                        if (done instanceof Function) done.call(self, err);
                    });
                }
                else {
                    setTimeout(function () {
                        soda.console.debug("Automator: Still waiting on ADB Server...");
                        self.isDeviceAvailable(device, isDeviceAvailable);
                    }, settings.DEVICE_DISCOVERY_INTERVAL);
                }
            }
        });
    };

    /**
     * Install an .apk on the specified device
     * @param {object} device The device to install the .apk to
     * @param {string} apk The path to the apk
     * @param {object} options Options
     * @param {function=} complete A callback for completion
     */
    this.installApk = function (device, apk, options, done) {
        var err = arguments.sodaexpect("object", "string", "object|undefined|null", "function|undefined|null").error;
        if(err) throw err;

        soda.console.debug("Automator: Installing APK on device `" + device.name + "`");

        require("child_process").exec(adb + " -s " + device.serial + " install -r " + apk, function (err, stdout) {
            if(done instanceof Function) {
                device.apk = apk;
                done(stdout.includes("Success") ? true : new Error("Unknown Error"));
            }
        });
    };

    /**
     * Remove an .apk on the specified device
     * @param {object} device The device to remove the .apk from
     * @param {function=} done A callback for completion
     */
    this.removeApk = function (device, apk, done) {
        var err = arguments.sodaexpect("object", "string", "function|undefined|null").error;
        if(err) throw err;

        soda.console.debug("Automator: Removing APK from device `" + device.name + "`");

        require("child_process").exec(adb + " -s " + device.serial + " uninstall " + apk, function (err, stdout, stderr) {
            if(done instanceof Function) {
                done(err ? err : stderr ? new Error(stderr) : stdout.match("Success") ? null : new Error("Unknown Error"));
            }
        });
    };

    /**
     * Unlock the screen on the specified device
     * @param {object} device The device to unlock
     * @param {function=} complete A callback for completion
     */
    this.unlockScreen = function (device, complete) {
        var err = arguments.sodaexpect("object", "function|undefined|null").error;
        if(err) throw err;

        soda.console.debug("Automator: Performing screen unlock on device `" + device.name + "`");
        self.doKeyEvent(device, settings['KEY_EVENTS'].UNLOCK, complete);
    };

    /**
     * Tap on an element on the specified device
     * @param {object} device The device to tap on
     * @param {string} element The element to tap
     * @param {function=} complete A callback for completion
     */
    this.tap = function (device, element, complete) {
        var err = arguments.sodaexpect("object", "object", "function|undefined|null").error;
        if(err) throw err;

        soda.console.debug("Automator: Performing tap on device `" + device.name + "` with element `" + element['id'] + "`");
        require("child_process").exec(adb + " -s " + device.serial + " shell input tap " + element['hitpoint'].x + " " + element['hitpoint'].y, function (err) {
            if(complete) return err ? complete(err, false) : complete(null, true);
        });
    };

    /**
     * Type into an element on the specified device
     * @param {object} device The device to type on
     * @param {string} element The element to type
     * @param {string|number} text The text to type
     * @param {function=} complete A callback for completion
     */
    this.type = function (device, element, text, complete) {
        var err = arguments.sodaexpect("object", "object", "string|number", "function|undefined|null").error;
        if(err) {
            if(complete instanceof Function) complete.call(self, err, null);
            return;
        }

        self.tap(device, element, function(err) {
            if(err) {
                if(complete instanceof Function) complete.call(self, err, null);
                return;
            }

            soda.console.debug("Automator: Performing type on device `" + device.name + "` with element `" + element['id'] + "`");

            var modifiedText = text.replace(/([\S])/g, "\\$1");
            modifiedText = modifiedText.replace(/([\s])/g, "%s");

            var shellcmd = adb + " -s " + device.serial + " shell input text \"" + modifiedText + "\"";

            require("child_process").exec(shellcmd, function (err) {
                if(complete instanceof Function) {
                    if (err) return complete(err, false);
                    self.doKeyEvent(device, settings['KEY_EVENTS'].ESCAPE, complete);
                }
            });
        });
    };

    /**
     * Delete text and type into an element on the specified device
     * @param {object} device The device to type on
     * @param {string} element The element to type
     * @param {string|number} text The text to type
     * @param {function=} done A callback for completion
     */
    this.setValue = function (device, element, text, done) {
        var err = arguments.sodaexpect("object", "object", "string|number", "function|undefined|null").error;
        if(err) {
            if(done instanceof Function) done.call(self, err, null);
            return;
        }

        self.tap(device, element, function(err) {
            soda.console.debug("Automator: Performing set value on device `" + device.name + "` with element `" + element['id'] + "`");

            if(err) {
                if(done instanceof Function) done.call(self, err, null);
                return;
            }

            var forwardDeletes = " KEYCODE_FORWARD_DEL";
            var backDeletes = " KEYCODE_DEL";

            if(element.value) {
                for (var i = 0; i < element.value.length; i++) {
                    forwardDeletes += " KEYCODE_FORWARD_DEL";
                    backDeletes += " KEYCODE_DEL";
                }
            }
            require("child_process").exec(adb + " -s " + device.serial + " shell input keyevent" + forwardDeletes, function (err) {
                if(done instanceof Function) {
                    require("child_process").exec(adb + " -s " + device.serial + " shell input keyevent" + backDeletes, function (err) {
                        if(done instanceof Function) {
                            if (err) return done(err, false);

                            var modifiedText = text.replace(/([\S])/g, "\\$1");
                            modifiedText = modifiedText.replace(/([\s])/g, "%s");

                            var shellcmd = adb + " -s " + device.serial + " shell input text \"" + modifiedText + "\"";

                            require("child_process").exec(shellcmd, function (err) {
                                if(done instanceof Function) {
                                    if (err) return done(err, false);
                                    self.doKeyEvent(device, settings.KEY_EVENTS.ESCAPE, done);
                                }
                            });
                        }
                    });
                  }
                });
              });
    };

    /**
     * Starts an app on the specified device
     * @param {object} device The device to to start the app on
     * @param {function=} done A callback for completion
     */
    this.startApp = function (device, done) {
        var err = arguments.sodaexpect("object", "function|undefined|null").error;

        if(err) {
            if(done instanceof Function) done.call(self, err, false);
            return;
        }

        soda.console.debug("Automator: Launching App `" + device.packagename + "`");
        require("child_process").exec(adb + " -s " + device.serial + " shell monkey -p " + device.packagename + " -c android.intent.category.LAUNCHER\ 1", function (err) {
            if(done) return err ? done(err, false) : done(null, true);
        });
    };

    /**
     * Send keyevent to the specified device
     * @param {object} device The device to perform the key event on
     * @param {number} keyevent The key to send to the device
     * @param {function=} done A callback for completion
     */
    this.doKeyEvent = function (device, keyevent, done) {
        var err = arguments.sodaexpect("object", "number|string", "function|undefined|null").error;

        if(err) {
            if(done instanceof Function) done.call(self, err, false);
            return;
        }

        soda.console.debug("Automator: Performing keyevent on device `" + device.name + "`");
        require("child_process").exec(adb + " -s " + device.serial + " shell input keyevent " + keyevent, function (err) {
            if(done) return err ? done(err, false) : done(null, true);
        });
    };

    /**
     * Pull a file from the device
     * @param {object} device The device to pull a file from
     * @param {string} what The path to the file to pull
     * @param {string} to The path to copy the file to on the local system
     * @param {function=} done A callback for completion
     */
    this.pull = function (device, what, to, done) {
        var err = arguments.sodaexpect("object", "string", "string", "function|undefined|null").error;

        if(err) {
            if(done instanceof Function) done.call(self, err, false);
            return;
        }

        require("child_process").exec(adb + " -s " + device['serial'] + " pull " + what + " " + to, function (err) {
            if(done) return err ? done(err, false) : done(null, true);
        });
    };

    /**
     * Get the XML Screen dump from UIAutomator
     * @param {object} device The device in which to dump the screen
     * @param {string} destination The local destination for the screen dump
     * @param {function=} done A callback for completion
     * @deprecated
     */
    this.getScreenDumpPullMethod = function (device, destination, done) {
        var err = arguments.sodaexpect("object", "string", "function").error;

        if(err) {
            if(done instanceof Function) done.call(self, err, false);
            return;
        }

        var times = settings.TIMES_TO_REPEAT_DUMP;
        require("child_process").exec(adb + " -s " + device['serial'] + " shell uiautomator dump", function onPull (err) {
          console.log(err);
            if(err) {
                if(--times === 0) {
                    if(done instanceof Function) done(err, false);
                }
                else {
                    setTimeout(function () {
                        require("child_process").exec(adb + " -s " + device.serial + " shell uiautomator dump", onPull);
                    }, 1000);
                }
            }
            else {
                self.pull(device, "/sdcard/window_dump.xml", destination, function (err) {
                    if(done instanceof Function) done.call(self, err, !!err);
                });
            }
        });
    };

    /**
     * Get the XML Screen dump from UIAutomator
     * @param {object} device The device in which to dump the screen
     * @param {function=} done A callback for completion
     */
    this.getScreenDump = function (device, done, tries) {
        tries = tries || 1;
        var err = arguments.sodaexpect("object", "function").error;

        if(err) {
            if(done instanceof Function) done.call(self, err, false);
            return;
        }

        var times = settings.TIMES_TO_REPEAT_DUMP;
        require("child_process").exec(adb + " -s " + device.serial + " shell uiautomator dump /dev/tty", function onStdout (err, stdout, stderr) {
            if(err) {
                if(--times === 0) {
                    if(done instanceof Function) done(err || new Error(stderr.trim()), false);
                }
                else {
                    setTimeout(function () {
                        require("child_process").exec(adb + " -s " + device.serial + " shell uiautomator dump /dev/tty", onStdout);
                    }, 1000);
                }
            }
            else {
                if(/^ERROR/.test(stdout.trim())) {
                    if(tries <= 3) return self.getScreenDump(device, done, ++tries);
                    if(done instanceof Function) done(new Error(stdout.trim()), false);
                }
                else {
                    xml2js.parseString(stdout.replace(/UI hierchary dumped to: \/dev\/tty\s*$/, ''), function (err) {
                        if(err) {
                            if(--times > 0) require("child_process").exec(adb + " -s " + device.serial + " shell uiautomator dump /dev/tty", onStdout);
                        }
                        else {
                            if(done instanceof Function) done.apply(self, arguments);
                        }
                    });
                }
            }
        });
    };

    /**
     * Retrieves the dumped XML file and coverts it to JSON
     * @param {string} dumpPath The path to the dumped XML file
     * @param {function} done A callback for completion
     */
    this.getJSONDump = function (dumpPath, done) {
        fs.readFile(dumpPath, function (err, fc) {
            if(err) return done instanceof Function ? done.call(self, err, null) : undefined;
            return xml2js.parseString(fc.toString('utf-8'), done);
        });
    };

    /**
     * Gets the device orientation
     * @param {function} done A callback for completion
     */
    this.getOrientation = function (device, done) {
        require("child_process").exec(adb + " -s " + device.serial + " shell dumpsys input | grep 'SurfaceOrientation' | awk '{ print $2 }'", function (err, stdout) {
            if(err) {
                if(done instanceof Function) done.call(self, err, null);
            }
            else {
                if(done instanceof Function) done.call(self, err, parseInt(stdout.trim(), 10));
            }
        });
    };

    /**
     * Gets the device screen bounds
     * @param {function} complete A callback for completion
     */
    this.getScreenBounds = function (device, done) {
        require("child_process").exec(adb + " -s " + device.serial + " shell wm size", function (err, stdout) {
            if(err) {
                if(done instanceof Function) done.call(self, err, null);
            }
            else {
                var ss = stdout.match(/^Physical size: (\d+x\d+)/);
                if(ss instanceof Array && ss[1]) ss = ss[1].split('x');

                ss.sodaeach(function (s, i, k, p) { p[k] = parseInt(s, 10); });
                if(done instanceof Function) done.call(self, err, ss);
            }
        });
    };
};

module.exports = EmulatorControl;
