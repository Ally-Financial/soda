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
 * @module Selenium/Driver
 */

var path = require("path"),
    webdriver   = require("selenium-webdriver"),
    chrome      = require('selenium-webdriver/chrome'),
    By          = require("selenium-webdriver").By,
    Capabilities = require('selenium-webdriver/lib/capabilities').Capabilities,
    fs          = require('fs'),
    os          = require('os').platform(),
    nodePath    = require("path"),
    treeScript  = null,
    actionScript = null,
    dids        = 0;

/**
 * Reads the script based upon the browser type
 * @param {string} type The type of browser being used
 */
function loadScript(type) {
    if (type === "ie") {
        // Get the script that will be injected into each page, that builds the element tree...
        fs.readFile(path.resolve(path.join(__dirname, "ScriptIE.js")), (err, src) => {
            treeScript = src ? src.toString('utf-8') : '';
        });
    }
    else if (type === "chrome") {
        // Get the script that will be injected into each page, that builds the element tree...
        fs.readFile(path.resolve(path.join(__dirname, "Script.js")), (err, src) => {
            treeScript = src ? src.toString('utf-8') : '';
        });
    }
    else {
        // Get the script that will be injected into each page, that builds the element tree...
        fs.readFile(path.resolve(path.join(__dirname, "ScriptFirefox.js")), (err, src) => {
            treeScript = src ? src.toString('utf-8') : '';
        });
    }
}

/**
 * Reads the script by name based upon the browser type
 * @param {string} type The type of browser being used
 */
function loadScriptByName(name, done) {
    // Get the script that will be injected into each page, that builds the element tree...
    fs.readFile(path.resolve(path.join(__dirname, name + ".js")), (err, src) => {
        actionScript = src ? src.toString('utf-8') : '';

        done(null, true);
    });
}

/**
 * Driver connector for Soda to Selenium
 * @param {Soda} soda A Soda instance
 * @constructor
 */
var SeleniumDriver = function (soda) {
    var Driver,
        self = this,

        /**
         * @associates SeleniumConfiguration
         * @type {Object}
         */
        settings = (require(path.join(__dirname, 'Config.js')))(soda),

        /**
         * The inital options used to start the browser
         * @type {Object<*>}
         */
        lastInitOptions = null,

        /**
         * The last browser used when the framework was started
         * @type {String}
         */
        lastInitBrowser = null;

    /**
     * A standard callback for device interactions which conforms to then(callback, errorback)...
     * @param {*} res The results from the completed (calling) function
     * @return {*}
     */
    function stddone (res) {
        var f = this instanceof Function ? this : function () {}; // jshint ignore:line
        return res instanceof Error ? f(res, false) : f(null, true);
    }

    /**
     * Reset the Driver to its initial state
     * @returns {SeleniumDriver} The current SeleniumDriver instance
     */
    function resetDriver () {
        /**
         * A driver object, which abstracts operations from selenium
         * @memberof module.Selenium/Driver.SeleniumDriver
         * @type {Object}
         */
        Driver = {
            id       : dids++,
            type     : null,
            instance : null,
            session  : { name: null },
            /**
             * @associates Eyes
             * @type {Object}
             */
            eyes: null,

            check: function check (done, onValid) {
                if(Driver.instance) {
                    onValid.call(self, Driver.instance);
                }
                else {
                    done.call(self, new Error('Selenium driver has been stopped.'), null);
                    
                    return self;
                }
            },

            /**
             * Delete all cookies in the browser
             * @param {Function=} done A callback for completion
             */
            deleteAllCookies: function deleteAllCookies (done) {
                Driver.check(done, function (selenium) {
                    try {
                        selenium.deleteAllCookies();
                    }
                    catch (e) {

                    }
                  done.call(self, null, null);
                });
            },

            /**
             * Navigate to a url
             * @param {string} url The *full* url to navigate to
             * @param {Function=} done A callback for completion
             */
            goto: function goto (url, done, times) {
                var myGoto = function() {
                    Driver.check(done, function (selenium) {
                        var finished = stddone.bind(done);
                        var urlPattern = new RegExp(/^((http[s]?|ftp):\/)?\/?([^:\/\s]+)?(\/#)?((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/i);
    
                        if(typeof url !== 'string') {
                            return finished(new Error('URL must be a string value, got: ' + typeof url), null);
                        }
    
                        if (url !== 'about:blank' && !urlPattern.test(url)) {
                            return finished(new Error('Malformed URL: <' + url + '> is not a valid absolute URL.'), null);
                        }
    
                        times = times || 0;
    
                        var onQuit = function (err) {
                            if(++times < 3) {
                                self.start(lastInitBrowser, lastInitOptions, function (err) {
                                    if(err) return finished(err);
                                    Driver.goto(url, done, times);
                                });
                            }
                            else {
                                finished(err);
                            }
                        };
    
                        setTimeout(function() {
                          selenium.executeScript("return navigator.userAgent;").then(function(userAgent) {
    
                            selenium.get(url).then(finished, () => {
                                Driver.check(done, () => { selenium.quit().then(onQuit, onQuit); });
                            });
                          });
                        }, 5000);
    
                    });
                }

                if (!Driver.instance) {
                    self.start(lastInitBrowser, lastInitOptions, function() {
                        myGoto();
                    });
                }
                else {
                    myGoto();
                }
            },

            /**
             * Resets the Selenium framework
             * @param {Function=} done A callback for completion
             */
            reset: function reset (done) {
                self.restart(done);
            },

            /**
             * Quits the Selenium framework
             * @param {Function=} done A callback for completion
             */
            quit: function quit (done) {
                done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};
                Driver.check(done, (selenium) => {
                    var finished = stddone.bind(done);
                    selenium.quit().then(finished, finished);
                });
            },

            /**
             * Closes the browser window
             * @param {Function=} done A callback for completion
             */
            close: function close (options, done) {
                done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};
                Driver.check(done, (selenium) => {
                    var finished = stddone.bind(done);
                    Driver.instance = null;
                    selenium.close().then(finished, finished);
                });
            },

            /**
             * Collects header of options.name
             * @param {Object} options Options to take the screen shot with including file destination and/or filename
             * @param {Function=} done A callback for completion
             */
            captureHeader: function captureHeader (options, done) {
                done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};

                Driver.check(done, selenium => {
                    selenium.manage().getCookie(options.name).then(function (cookie) {
                        if (cookie) {
                            done(null, cookie.value);
                        }
                        else {
                            done(null, "");
                        }
                    });
                });
            },

            performScript: function performScript (script, done) {
              loadScriptByName(script, function(err, result) {
                Driver.check(done, selenium => {
                    selenium.executeScript(actionScript).then(result => {
                            done(null, true);
                        },
                        err => {
                            done(err, null);
                        });
                });
              });
            },

            performScriptWithString: function performScriptWithString (options, done) {
                Driver.check(done, selenium => {
                    selenium.executeScript(options.withString).then(result => {
                            soda.vars.save(options.storeIn, result);
                            done(null, true);
                        },
                        err => {
                            done(err, null);
                        });
                });
            },

            /**
             * Takes a screen shot of the browser viewport
             * @param {Object} options Options to take the screen shot with including file destination and/or filename
             * @param {Function=} done A callback for completion
             */
            takeScreenshot: function takeScreenshot (options, done) {
                done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};

                if(typeof options !== "object") options = {};
                if(!options.filename)    options.filename = "Screenshot " + (new Date()).toLocaleDateString().replace(/\//g, ".") + ".png";
                if(!options.destination) options.destination = nodePath.join(settings.DEFAULT_FILE_LOCATION, options.filename);

                Driver.check(done, selenium => {
                    var callback = function (res) {
                        if(res instanceof Error) return done(res, false);

                        var base64Data = res.replace(/^data:image\/png;base64,/,"");

                        fs.access(settings.DEFAULT_FILE_LOCATION, fs.W_OK, err => {
                            if(err) {
                                fs.mkdir(settings.DEFAULT_FILE_LOCATION, () => {
                                    fs.writeFile(options.destination, base64Data, 'base64', err => {
                                        return err ? done(err, false) : done(null, true);
                                    });
                                });
                            }
                            else {
                                fs.writeFile(options.destination, base64Data, 'base64', err => {
                                    return err ? done(err, false) : done(null, true);
                                });
                            }
                        });
                    };

                    selenium.takeScreenshot().then(callback, callback);
                });
            },

            /**
             * Gets the window's size
             * @param  {Function} done A callback for completion
             * @return {undefined}
             */
            getSize: function getSize (done) {
                done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};
                Driver.check(done, selenium => {
                    selenium.manage().window().getRect().then(rect => {
                        done.call(self, null, [rect.width, rect.height]);
                    });
                });
            },

            /**
             * Gets a javascript variable on the page
             * @param  {Function} done A callback for completion
             * @return {undefined}
             */
            getVariable: function getVariable (options, done) {
                done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};
                Driver.check(done, selenium => {
                    selenium.executeScript("return window." + options.variableName + "").then(result => {
                      soda.vars.save(options.storeIn, result);
                      done(null, result);
                    });
                });
            },

            /**
             * Get an element's inner HTML as raw HTML
             * @param {string} eid The element id to get inner HTML for
             * @param {Function} done A callback for completion
             * @returns {undefined}
             */
            getSource: function getSource (eid, done) {
                done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};
                Driver.check(done, selenium => {
                    var callback = e => { return e instanceof Error ? done(e, null) : done(null, e); };
                    selenium.findElement(By.id(eid)).getInnerHtml().then(callback, callback);
                });
            },

            /**
             * Get the DOM tree for the current page
             * @param {string} elSelector The root element selector to get the DOM for
             * @param {Function} done A callback for completion
             */
            getSourceTree: function getSourceTree(elSelector, done) {
                    done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function() {};

                    if (!Driver.instance) {
                        done(new Error('Browser is dead'), null);
                        return self;
                    }

                    var onWindow = function(err) {
                        if (err) return done(err, null);

                        Driver.check(done, selenium => {
                            selenium.executeScript("return window.pageYOffset").then(yOffset => {
                                    selenium.executeScript("return window.pageXOffset").then(xOffset => {
                                            selenium.executeScript("return window.innerHeight").then(height => {
                                                    selenium.executeScript("return window.innerWidth").then(width => {
                                                            selenium.executeScript(treeScript).then(
                                                                res => {
                                                                    try {
                                                                        res = JSON.parse(res);

                                                                        if (res && res[soda.config.get("sodaRootId")]) {
                                                                          res[soda.config.get("sodaRootId")].rect = {
                                                                              origin: {
                                                                                  x: xOffset,
                                                                                  y: yOffset
                                                                              },
                                                                              size: {
                                                                                  height: height,
                                                                                  width: width
                                                                              }
                                                                          };
                                                                        }

                                                                        done(null, res);
                                                                    } catch (e) {
                                                                        done(e, null);
                                                                    }
                                                                },
                                                                err => {
                                                                    done(err, null);
                                                                }
                                                            );
                                                        },
                                                        err => {
                                                            done(err, null);
                                                        });
                                                },
                                                err => {
                                                    done(err, null);
                                                });
                                        },
                                        err => {
                                            done(err, null);
                                        });
                                },
                                err => {
                                    done(err, null);
                                });
                        });
                    };

                    Driver.check(done, selenium => {
                        selenium.manage().window().getRect().then(
                            () => {
                                onWindow();
                            },
                            () => {
                                //Driver.goto("about:blank", onWindow);
                                onWindow();
                            }
                        );
                    });
                },

                /**
                 * Click a set of elements
                 * @param {Array} els The set of elements to click
                 * @param {Object=} options Currently unused
                 * @param {Function=} done A callback for completion
                 */
                click: function click(els, options, done) {
                    done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function() {};

                    Driver.check(done, selenium => {
                        var next = 0,
                            clickNext, postClick;

                        postClick = res => {
                            if (res instanceof Error) {
                                done(null, true);
                            } else if (++next < els.length) {
                                clickNext(els[next]);
                            } else {
                                done(null, true);
                            }
                        };

                        clickNext = e => {
                            var element = null;

                            if (options.physical) {
                              soda.console.debug('Physical click:', options);

                              element = selenium.findElement(By.id(e.id));

                              element.click().then(postClick, postClick);
                            }
                            else {
                              soda.console.debug('JavaScript click:', options);

                              element = selenium.findElement(By.id(e.id));

                              selenium.executeScript("arguments[0].click();", element).then(postClick, postClick);
                            }
                        };
                        clickNext(els[0]);
                    });
                },

            /**
             * Scroll an element into the browser's viewport
             * @param {Array} els The set of elements to scroll into view
             * @param {Object=} options Currently unused
             * @param {Function=} done A callback for completion
             */
            scrollToVisible: function scrollToVisible (els, options, done) {
                done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};

                Driver.check(done, selenium => {
                    var next = 0, scrollNext, postScroll;

                    postScroll = res => {
                        if(res instanceof Error) {
                            done(res, false);
                        }
                        else if(++next < els.length) {
                            scrollNext(els[next]);
                        }
                        else {
                            done(null, true);
                        }
                    };

                    scrollNext = e => {
                      var element = selenium.findElement(By.id(e.id));
                      selenium.executeScript("arguments[0].scrollIntoView(true);", element).then(
                          () => { selenium.executeScript("window.scrollBy(0, -200);").then(postScroll, postScroll); },
                          () => { selenium.executeScript("window.scrollTo(0, -200);").then(postScroll, postScroll); }
                      );
                    };
                    scrollNext(els[0]);
                });
            },

            /**
             * Sets the value of a set of elements
             * @param {Array} els The set of elements to set the value for
             * @param {Object} options An object containing the key `value` to set the elements value to
             * @param {Function=} done A callback for completion
             */
            setValue: function setValue (els, options, done) {
                done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};

                Driver.check(done, selenium => {
                    var next = 0, setNext, postSet;

                    postSet = res => {
                        if(res instanceof Error) {
                            done(res, false);
                        }
                        else if(++next < els.length) {
                            setNext(els[next]);
                        }
                        else {
                            done(null, true);
                        }
                    };

                    setNext = e => {
                        var element = selenium.findElement(By.id(e.id));

                        if(options.delay) {
                            var k = 0, keySet = options.value.split(), nextKey;

                            nextKey = () => {
                                if(++k < keySet.length)
                                    setTimeout(() => { element.sendKeys(keySet[k]).then(nextKey, postSet); }, options.delay * 1000);
                            };

                            element.clear().then(
                                () => { element.sendKeys(keySet[k]).then(nextKey, postSet); },
                                () => { element.sendKeys(keySet[k]).then(nextKey, postSet); }
                            );
                        }
                        else {
                            element.clear().then(
                                () => { element.sendKeys(options.value.toString()).then(postSet, postSet); },
                                () => { element.sendKeys(options.value.toString()).then(postSet, postSet); }
                            );
                        }
                    };

                    setNext(els[0]);
                });
            },

            /**
             * Navigate the browser back one page
             * @param {Object} options Currently unused
             * @param {Function=} done A callback for completion
             */
            back: function back (options, done) {
                done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};

                Driver.check(done, selenium => {
                    var finished = stddone.bind(done);
                    selenium.navigate().back().then(finished, finished);
                });
            },

            /**
             * Resize the browser window
             * @param {Number} height
             * @param {Number} width
             * @param {Function=} done A callback for completion
             */
            resizeWindow: function resizeWindow (resizeProperties, done) {
                done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};

                var properties = resizeProperties.split(',');

                if (properties.length > 1) {
                    Driver.check(done, selenium => {
                        var finished = stddone.bind(done);
                        selenium.manage().window().setRect({height: parseInt(properties[0]), width: parseInt(properties[1])}).then(finished, finished);
                    });
                }
                else {
                    done.call(self, new Error('Properties must be in format: width,height'), null);
                }
            },

            /**
             * Maximize the browser window
             * @param {Function=} done A callback for completion
             */
            maximizeWindow: function maximizeWindow (options, done) {
                done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};
                Driver.check(done, selenium => {
                    var localDone = done;

                    selenium.executeScript("return screen.width").then(width => {
                      selenium.executeScript("return screen.height").then(height => {
                        try {
                          selenium.manage().window().maximize();
                          localDone.call(self, null, true);
                        } catch (e) {
                            localDone.call(self, null, null);
                        }

                      });
                    });
                });
            },

            /**
             * Switch to frame
             * @param {Object} options Currently unused
             * @param {Function=} done A callback for completion
             */
            switchToFrame: function switchToFrame (options, done) {
                done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};

                Driver.check(done, selenium => {
                    var finished = stddone.bind(done);
                    if(options.element !== "default") {
                        selenium.switchTo().frame(selenium.findElement(By.id(options.element))).then(finished, finished);
                    }
                    else {
                        selenium.switchTo().defaultContent().then(finished, finished);
                    }
                });
            },

            /**
             * Navigate the browser forward one page
             * @param {Object} options Currently unused
             * @param {Function=} done A callback for completion
             */
            forward: function forward (options, done) {
                done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};

                Driver.check(done, selenium => {
                    var finished = stddone.bind(done);
                    selenium.navigate().forward().then(finished, finished);
                });
            },

            /**
             * Navigate the browser forward one page
             * @param {Object} options Currently unused
             * @param {Function=} done A callback for completion
             */
            reload: function reload (options, done) {
                done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};

                Driver.check(done, selenium => {
                    var finished = stddone.bind(done);
                    selenium.navigate().refresh().then(finished, finished);
                });
            }
        };
        return self;
    }

    /**
     * Launches the Chrome browser for Selenium
     * @param {Object} options Options to start the browser with
     * @param {Function} done A callback for completion
     */
    function launchChrome (options, done) {
        done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};
        var chromeInstance = new chrome.Options();

        var time = process.hrtime();
        var opts = options.sessionName !== undefined && options.sessionName !== null && options.sessionName !== '' ? options.sessionName.toString() : null;
        Driver.session.name = opts || ((time[0] * 1e9 + time[1]) + Driver.id++);
        lastInitOptions.sessionName = Driver.session.name.toString();

        chromeInstance.addArguments("--user-data-dir=" + nodePath.join(soda.config.get("temp"), Driver.session.name.toString()));
        chromeInstance.addArguments("--reduce-security-for-testing");
        chromeInstance.addArguments("--disable-web-security");
        chromeInstance.addArguments("--disable-geolocation");
        chromeInstance.addArguments("--js-flags=--expose-gc");
        chromeInstance.addArguments("--enable-precise-memory-info");
        chromeInstance.addArguments("-disable-extensions");
        //chromeInstance.options_["useAutomationExtension"] = false;

        if (soda.config.get("startMaximized")) {
          if(os === "win32" || os === "win64") {
              chromeInstance.addArguments("--start-maximized");
          }
          else {
              chromeInstance.addArguments("--kiosk");
          }
        }

        if (soda.config.get("incognito")) {
            chromeInstance.addArguments("--incognito");
        }

        if(os === "win32" || os === "win64") {
            chromeInstance.addArguments("--no-sandbox");
        }

        if(soda.config.get("headless")) {
            chromeInstance.addArguments('--no-sandbox')
            chromeInstance.addArguments('--disable-dev-shm-usage')
            chromeInstance.addArguments("--headless");
        }

        if (soda.config.get("perflog")) {
          var logging_prefs = {
              'performance': 'ALL'
            };

          chromeInstance.setLoggingPrefs(logging_prefs);

          chromeInstance["perfLoggingPrefs"] = {
            "enableNetwork":true,
            "enablePage":true
          };

          chromeInstance.addArguments("--enable-gpu-benchmarking");
          chromeInstance.addArguments("--enable-thread-composting");
          chromeInstance.addArguments('--enable-logging');
          chromeInstance.addArguments('--enable-net-benchmarking');

          console.log(chromeInstance);
        }

        chromeInstance.detachDriver(false);

        if(soda.config.get("proxy")) chromeInstance.addArguments("--http-proxy=" + soda.config.get("proxy"));
        
        loadScript("chrome");
        
        var capabilities = Capabilities.chrome();
        
        if(soda.config.get('useChromeServer')) {
            soda.console.warn('Using ChromeDriver at server:', settings.SELENIUM_CHROME_SERVER_LOCATION);
            Driver.instance = new webdriver.Builder()
                .usingServer(settings.SELENIUM_CHROME_SERVER_LOCATION)
                .withCapabilities(capabilities)
                .setChromeOptions(chromeInstance)
                .forBrowser('chrome')
                .setAlertBehavior('accept')
                .build();

            done(null, true, Driver);
        }
        else {
            if(os === "win32" || os === "win64") {
                Driver.instance = new webdriver.Builder()
                    .withCapabilities(capabilities)
                    .setChromeOptions(chromeInstance)
                    .setAlertBehavior('accept')
                    .forBrowser('chrome')
                    .build();
            }
            else if (soda.config.get("proxy")) {
                Driver.instance = new webdriver.Builder()
                    .withCapabilities(capabilities)
                    .setChromeOptions(chromeInstance)
                    .setAlertBehavior('accept')
                    .forBrowser('chrome')
                    .build();
            }
            else {
                Driver.instance = new webdriver.Builder()
                    .withCapabilities(capabilities)
                    .setChromeOptions(chromeInstance)
                    .setAlertBehavior('accept')
                    .forBrowser('chrome')
                    .build();
            }

            done(null, true, Driver);
        }
        return self;
    }

    /**
     * Launches the Firefox browser for Selenium
     * @param {Object} options Options to start the browser with
     * @param {Function} done A callback for completion
     */
    function launchFirefox (options, done) {
      done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};
      Driver.session.name = options.sessionName || Date.now();

      loadScript("firefox");

	    var firefox = require('selenium-webdriver/firefox');

      var Capabilities = require('selenium-webdriver/lib/capabilities').Capabilities;
      var capabilities = Capabilities.firefox();
      capabilities.set('marionette', true);
      capabilities.set('acceptInsecureCerts', true);
      capabilities.set('browserName', 'firefox');

      var pref = new webdriver.logging.Preferences();

      var profile;
      var firefoxOptions = new firefox.Options();

      if (soda.config.get("perflog")) {

          profile = new firefox.Profile();
          /*
          profile.addExtension(nodePath.resolve(nodePath.join(__dirname, "..", "..", "..", "..", "firebug-2.0.xpi")));
          profile.addExtension(nodePath.resolve(nodePath.join(__dirname, "..", "..", "..", "..", "fireStarter-0.1a6.xpi")));
          profile.addExtension(nodePath.resolve(nodePath.join(__dirname, "..", "..", "..", "..", "netExport-0.9b7.xpi")));

          profile['extensions.firebug.currentVersion']    = "2.0";
          profile["extensions.firebug.previousPlacement"] = 1;
          profile["extensions.firebug.onByDefault"]       = true;
          profile["extensions.firebug.defaultPanelName"]  = "net";
          profile["extensions.firebug.net.enableSites"]   = true;

          profile["extensions.firebug.netexport.defaultLogDir"]          = nodePath.join(soda.config.get('testPath'), soda.config.get('testResultsDir'), "results", "perflog_firefox.log");
          profile["extensions.firebug.netexport.alwaysEnableAutoExport"] = true;
*/
          pref.setLevel('browser', webdriver.logging.Level.ALL);
          pref.setLevel('driver', webdriver.logging.Level.ALL);
          pref.setLevel('performance', webdriver.logging.Level.ALL);

          firefoxOptions.addArguments('--devtools');
          //firefoxOptions['log'] = {"level": "trace"};

          profile.setPreference("extensions.netmonitor.har.enableAutomation", true);
          profile.setPreference("extensions.netmonitor.har.contentAPIToken", "test");
          profile.setPreference("extensions.netmonitor.har.autoConnect", true);
          profile.setPreference('devtools.chrome.enabled', true);
          profile.setPreference('devtools.toolbox.selectedTool', 'netmonitor');
          profile.setPreference('devtools.toolbox.footer.height', 0);

          profile.setPreference('devtools.netmonitor.har.enableAutoExportToFile', true);
          profile.setPreference('devtools.netmonitor.har.defaultLogDir', path.join(soda.config.get('testPath'), soda.config.get('testResultsDir')));
          profile.setPreference('devtools.netmonitor.har.defaultFileName', "network-log-file");

          firefoxOptions.setProfile(profile);
      }

        if (soda.config.get("proxy")) {
            Driver.instance = new webdriver.Builder()
                .forBrowser('firefox')
                .setFirefoxOptions(firefoxOptions)
                .withCapabilities(capabilities)
                .setLoggingPrefs(pref)
                //.setProxy(soda.config.get("proxy"))
                .setAlertBehavior('accept')
                .build();
        }
        else if (soda.config.get("headless")) {
			       Driver.instance = new webdriver.Builder()
			                .forBrowser('firefox')
			                .setFirefoxOptions(firefoxOptions)
			                .setLoggingPrefs(pref)
			                .withCapabilities(capabilities)
			                .setFirefoxOptions(new firefox.Options().headless())
			                .setAlertBehavior('accept')
                .build();
		    }
        else {
            Driver.instance = new webdriver.Builder()
                //.forBrowser('firefox')
                //.setFirefoxOptions(firefoxOptions)
                .setLoggingPrefs(pref)
                .withCapabilities(capabilities)
                .setAlertBehavior('accept')
                .build();
        }

        done(null, true, Driver);

        return self;
    }

    /**
     * Launches the Internet Explorer browser for Selenium
     * @param {Object} options Options to start the browser with
     * @param {Function} done A callback for completion
     * @returns {SeleniumDriver} The current SeleniumDriver instance
     */
    function launchExplorer (options, done) {
        done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};
        Driver.session.name = options.sessionName || Date.now();
        var capabilities = webdriver.Capabilities.ie();
        capabilities.set('ignoreProtectedModeSettings', true);

        loadScript("ie");

        Driver.instance = new webdriver.Builder()
  			.withCapabilities(capabilities)
  			.forBrowser('ie')
  			.build();

        done(null, true, Driver);
        return self;
    }

    /**
     * Launches the Safari browser for Selenium
     * @param {Object} options Options to start the browser with
     * @param {Function} done A callback for completion
     * @returns {SeleniumDriver} The current SeleniumDriver instance
     */
    function launchSafari (options, done) {
        done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};

        soda.config.set('timeToWaitForScreenShot', 5000);

        Driver.session.name = options.sessionName || Date.now();

        loadScript("safari");

        Driver.instance = new webdriver.Builder()
			.forBrowser('safari')
			.build();

        done(null, true, Driver);
        return self;
    }

    /**
     * Launches the Phantom browser for Selenium
     * @param {Object} options Options to start the browser with
     * @param {Function} done A callback for completion
     * @returns {SeleniumDriver} The current SeleniumDriver instance
     */
    function launchPhantom (options, done) {
        done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};
        Driver.session.name = options.sessionName || Date.now();

        var capabilities = {
            browserName: 'phantomjs', 'phantomjs.cli.args': ['--ignore-ssl-errors=true',  '--web-security=false']
        };

        if (soda.config.get("proxy")) {
            Driver.instance = new webdriver.Builder()
                .forBrowser('phantomjs')
                .setProxy(soda.config.get("proxy"))
                .withCapabilities(capabilities)
                .build();
        }
        else {
            Driver.instance = new webdriver.Builder()
                .forBrowser('phantomjs')
                .withCapabilities(capabilities)
                .build();
        }

        done(null, true, Driver);
        return self;
    }

    /**
     * Starts the current Selenium driver
     * @param {String} browser The browser to start the driver with
     * @param {Object} options An object with options associates with startup
     * @param {Function=} A callback for completion
     * @returns {SeleniumDriver} The current SeleniumDriver instance
     */
    this.start = function start (browser, options, done) {
        done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};
        lastInitOptions = options;
        lastInitBrowser = browser;
        resetDriver();

        var postLaunch = function postLaunch () {
            Driver.check(done, selenium => {
                if (soda.config.get("incognito") && (browser.toLowerCase() === "chrome" || browser.toLowerCase() === "google")) {
                  selenium.get("chrome://extensions-frame");

                  var element = selenium.findElement(By.xpath("//input[@type='checkbox']/ancestor::label[@class='incognito-control']"));
                  element.click().then(res => {
                    selenium.manage().setTimeouts( { script: settings.SCRIPT_TIMEOUT } );
                    done.apply(self, arguments);
                  });
                }
                else {
                    selenium.manage().setTimeouts( { script: settings.SCRIPT_TIMEOUT } );
                    done.apply(self, arguments);
                }
            });
        };

        switch(browser.toLowerCase()) {
            case "chrome":
            case "google":
                launchChrome(options, postLaunch);
                break;

            case "firefox":
            case "mozilla firefox":
                launchFirefox(options, postLaunch);
                break;

            case "ie":
            case "explorer":
            case "internet explorer":
                launchExplorer(options, postLaunch);
                break;

            case "safari":
                launchSafari(options, postLaunch);
                break;

            case "phantom":
                launchPhantom(options, postLaunch);
                break;

            default:
                done(new Error("Unknown browser `" + browser + "`"), false, null);
                break;
        }
        return self;
    };

    /**
     * Stops and shuts-down the current Selenium driver
     * @param {Function} done A callback for completion
     * @returns {SeleniumDriver} The current SeleniumDriver instance
     */
    this.stop = function stop (done) {
        done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};

        var resetWrapper = function (res) {
            resetDriver();
            done.call(self, res, !(res instanceof Error));
        };

        Driver.check(
            ()       => { done.call(self, null, true); },
            selenium => { selenium.quit().then(resetWrapper, resetWrapper); }
        );
        return self;
    };

    /**
     * Restarts the current Selenium driver
     * @param {Function} done A callback for completion
     * @returns {SeleniumDriver} The current SeleniumDriver instance
     */
    this.restart = function (done) {
        done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};

        if(!lastInitOptions) {
            done.call(self, new Error("Cannot restart Selenium framework, since it hasn't been started yet"), false, null);
        }
        else {
            self.stop(() => { self.start(lastInitBrowser, lastInitOptions, done); });
        }
        return self;
    };
};

module.exports = SeleniumDriver;
