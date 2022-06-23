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
 * @module Puppeteer/Driver
 */

var path = require("path"),
    chromium = null,
    locateChrome = require('locate-chrome'),
    webdriver   = require("puppeteer-core"),
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
function loadScript() {
    // Get the script that will be injected into each page, that builds the element tree...
    fs.readFile(path.resolve(path.join(__dirname, "Script.js")), (err, src) => {
        treeScript = src ? src.toString('utf-8') : '';
    });
}

/**
 * Reads the script by name based upon the browser type
 * @param {string} type The type of browser being used
 */
function loadScriptByName(name, done) {
    // Get the script that will be injected into each page, that builds the element tree...
    fs.readFile(path.resolve(path.join(__dirname, name + ".js")), (err, src) => {
        if (err) done(err, false);

        actionScript = src ? src.toString('utf-8') : '';

        done(null, true);
    });
}

/**
 * Driver connector for Soda to Puppeteer
 * @param {Soda} soda A Soda instance
 * @constructor
 */
var PuppeteerDriver = function (soda) {
    var Driver,
        self = this,

        /**
         * @associates PuppeteerConfiguration
         * @type {Object}
         */
        settings = (require(path.join(__dirname, 'Config.js')))(soda),

        /**
         * The inital options used to start the browser
         * @type {Object<*>}
         */
        lastInitOptions = null,

        /**
         * The path to the chrome browser
         * @type {String}
         */
        chromePath = null,

        /**
         * The last browser used when the framework was started
         * @type {String}
         */
        lastInitBrowser = null;

        if (soda.config.get("chromeawslambda")) chromium = require('chrome-aws-lambda');
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
     * @returns {PuppeteerDriver} The current PuppeteerDriver instance
     */
    function resetDriver () {
        /**
         * A driver object, which abstracts operations from Puppeteer
         * @memberof module.Puppeteer/Driver.PuppeteerDriver
         * @type {Object}
         */
        Driver = {
            id       : dids++,
            type     : null,
            instance : null,
            session  : { name: null },

            check: async function check (done, onValid) {
                if(Driver.instance) {
                    onValid.call(self, Driver.instance);
                }
                else {
                    done.call(self, new Error('Puppeteer driver has been stopped.'), null);
                    return self;
                }
            },

            currentPage: async function check (done, onValid) {
                if(Driver.instance) {
                    var pages = await Driver.instance.pages();

                    if (!Driver.instance) {
                        done.call(self, new Error('Puppeteer driver has been stopped.'), null);
                        return self;
                    }

                    if (pages) { 
                        var page = pages[0];
                        onValid(page[0]);
                    }
                    else {
                        done.call(self, new Error('Puppeteer driver has been stopped.'), null);
                        return self;
                    }
                }
                else {
                    done.call(self, new Error('Puppeteer driver has been stopped.'), null);
                    return self;
                }
            },

            /**
             * Delete all cookies in the browser
             * @param {Function=} done A callback for completion
             */
            deleteAllCookies: async function (done) {
                Driver.check(done, async function () {
                    if (!Driver.instance) {
                        done.call(self, null, null);
                        return self;
                    }

                    var pages = await Driver.instance.pages();

                    if (pages) { 
                        var page = pages[0];
                        var cookies = await page.cookies();

                        if (cookies.length) {
                            for (var i = 0; i < cookies.length; i++) {
                                var cookie = cookies[i];

                                console.log(cookies.length, i, cookie);

                                await page.deleteCookie(cookie);
            
                                if (i === cookies.length-1) {
                                    done.call(self, null, null);
                                    return self;
                                }
                            }
                        }
                        else {
                            done.call(self, null, null);
                            return self;
                        }
                    }
                    else {
                        done.call(self, null, null);
                        return self;
                    }
                });
            },

            /**
             * Navigate to a url
             * @param {string} url The *full* url to navigate to
             * @param {Function=} done A callback for completion
             */
            goto: async function goto (url, done, times) {
                function myGoto() {
                    Driver.check(done, function (Puppeteer) {
                        var finished = stddone.bind(done);
                        var urlPattern = new RegExp(/^((http[s]?|ftp):\/)?\/?([^:\/\s]+)?(\/#)?((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/i);
    
                        if(typeof url !== 'string') {
                            return finished(new Error('URL must be a string value, got: ' + typeof url), null);
                        }
    
                        if (url !== 'about:blank' && !urlPattern.test(url)) {
                            return finished(new Error('Malformed URL: <' + url + '> is not a valid absolute URL.'), null);
                        }
    
                        times = times || 0;
    
                        setTimeout(async function() {
                          var userAgent = Puppeteer.userAgent();
                          
                          var pages = await Driver.instance.pages();
    
                          if (pages) { 
                            var page = pages[0];
    
                            try {
                                await page.goto(url);
                                return finished(null);
                            }
                            catch (e) {
                                return finished(e);
                            }
                          }
                          else {
                            page = await Puppeteer.newPage();
    
                            try {
                                await page.goto(url);
                                return finished(null);
                            }
                            catch (e) {
                                return finished(e);
                            }
                          }
                        }, 250);
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
             * Resets the Puppeteer framework
             * @param {Function=} done A callback for completion
             */
            reset: function reset (done) {
                self.restart(done);
            },

            /**
             * Quits the Puppeteer framework
             * @param {Function=} done A callback for completion
             */
            quit: function quit (done) {
                done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};
                Driver.check(done, (Puppeteer) => {
                    var finished = stddone.bind(done);
                    Driver.instance.close().then(() => {
                        Driver.instance = null;
                        finished();
                    });
                });
            },

            /**
             * Closes the browser window
             * @param {Function=} done A callback for completion
             */
            close: function close (options, done) {
                done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};
                Driver.check(done, (Puppeteer) => {
                    var finished = stddone.bind(done);
                    Driver.instance.close().then(() => {
                        Driver.instance = null;
                        finished();
                    });
                });
            },

            /**
             * Collects header of options.name
             * @param {Object} options Options to take the screen shot with including file destination and/or filename
             * @param {Function=} done A callback for completion
             */
            captureHeader: async function captureHeader (options, done) {
                done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};

                if (!Driver.instance) {
                    done(null, "");
                }
                var pages = await Driver.instance.pages();

                if (pages) { 
                    var page = pages[0];
                    var cookies = await page.cookies();

                    for (var i = 0; i < cookies.length; i++) {
                        var cookie = cookies[i];
                        
                        if (cookie.name === options.name) {
                            done(null, cookie.value);
                            return self;
                        }
                    }
                }
                else {
                    done(null, "");
                    return self;
                }

                done(null, "");
                return self;
            },

            performScript: function performScript (script, done) {
              loadScriptByName(script, function(err, result) {
                Driver.check(done, Puppeteer => {
                    if (!Driver.instance) {
                        callback("");
                        return self;
                    }

                    var perfScript = async function(aScript) {
                        var pages = await Driver.instance.pages();

                        if (pages) { 
                            var page = pages[0];
                            
                            await page.evaluate((aScript) => aScript);
                            
                            done(null, true);

                            return self;
                        }
                        else {
                            done(new Error("Do not have a page"), null);
                            return self;
                        }
                    }

                    perfScript(actionScript);
                });
              });
            },

            performScriptWithString: async function performScriptWithString (options, done) {
                Driver.check(done, Puppeteer => {
                    if (!Driver.instance) {
                        callback("");
                        return self;
                    }

                    var perfScript = async function(stringToEvaluate, storeIn) {
                        var pages = await Driver.instance.pages();

                        if (pages) { 
                            var page = pages[0];

                            var stringValue = '() => {' + stringToEvaluate + '}';

                            const value = await page.evaluate(eval(stringValue));
 
                            soda.vars.save(storeIn, value);
                            
                            done(null, true);

                            return self;
                        }
                        else {
                            done(new Error("Do not have a page"), null);
                            return self;
                        }
                    }

                    perfScript(options.withString, options.storeIn);
                });
            },

            /**
             * Takes a screen shot of the browser viewport
             * @param {Object} options Options to take the screen shot with including file destination and/or filename
             * @param {Function=} done A callback for completion
             */
            takeScreenshot: async function takeScreenshot (options, done) {
                done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};

                if(typeof options !== "object") options = {};
                if(!options.filename)    options.filename = "Screenshot " + (new Date()).toLocaleDateString().replace(/\//g, ".") + ".png";
                if(!options.destination) options.destination = nodePath.join(settings.DEFAULT_FILE_LOCATION, options.filename);
                
                Driver.check(done, async function(Puppeteer) {
                    var callback = async function (res) {
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

                    if (!Driver.instance) {
                        callback("");
                        return self;
                    }

                    var pages = await Driver.instance.pages();

                    if (pages) { 
                        var page = pages[0];
                        var data = await page.screenshot({ encoding: "base64" });
                        callback(data);
                        return self;
                    }
                    else {
                        callback("");
                        return self;
                    }
                });
            },

            /**
             * Gets the window's size
             * @param  {Function} done A callback for completion
             * @return {undefined}
             */
            getSize: async function getSize (done) {
                done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};

                Driver.check(done, async function () {
                    if (!Driver.instance) {
                        done.call(self, null, []);
                        return self;
                    }

                    var pages = await Driver.instance.pages();

                    if (pages) { 
                        var page = pages[0];

                        var innerHeight = await page.evaluate(() => { return window.innerHeight });
                        var innerWidth = await page.evaluate(() => { return window.innerWidth });

                        done.call(self, null, [innerWidth, innerHeight]);
                        return self;
                    }
                    else {
                        done.call(self, null, []);
                        return self;
                    }
                });
            },

            /**
             * Gets a javascript variable on the page
             * @param  {Function} done A callback for completion
             * @return {undefined}
             */
            getVariable: async function getVariable (options, done) {
                done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};
                Driver.check(done, async function() {
                    if (!Driver.instance) {
                        done(null, null);
                        return self;
                    }

                    var pages = await Driver.instance.pages();

                    if (pages) { 
                        var page = pages[0];

                        var result = await page.evaluate((options) => { return window.eval(options.variableName) }, options);
                        soda.vars.save(options.storeIn, result);
                        done(null, result);
                        return self;
                    }
                    else {
                        done(null, null);
                        return self;
                    }
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
                Driver.check(done, async function() {
                    var callback = e => { return e instanceof Error ? done(e, null) : done(null, e); };

                    var innerHTML = await page.$eval('#'+e.id, (element) => {
                        return element.innerHTML
                    });
                    callback(innerHTML);
                });
            },

            /**
             * Get the DOM tree for the current page
             * @param {string} elSelector The root element selector to get the DOM for
             * @param {Function} done A callback for completion
             */
            getSourceTree: async function getSourceTree(elSelector, done) {
                    done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function() {};

                    if (!Driver.instance) {
                        done(new Error('Browser is dead'), null);
                        return self;
                    }

                    var pages = await Driver.instance.pages();


                    if (pages) { 
                        var page = pages[0];

                        setTimeout(async function() {
                            await page.waitForSelector('*').then(() => {
                              }).catch(e => {
                                return {};
                              });
    
                            const yOffset = await page.evaluate(() => { return window.pageYOffset }).then(() => {
                            }).catch(e => {
                              return {};
                            });
                            const xOffset = await page.evaluate(() => { return window.pageXOffset }).then(() => {
                            }).catch(e => {
                              return {};
                            });
                            const height = await page.evaluate(() =>  { return window.innerHeight }).then(() => {
                            }).catch(e => {
                              return {};
                            });
                            const width = await page.evaluate(() => { return window.innerWidth }).then(() => {
                            }).catch(e => {
                              return {};
                            });
                            const res = await page.evaluate(() => { return (function () {
                                window.alert          = function () { return true;      };
                                window.confirm        = function () { return true;      };
                                window.onbeforeunload = function () { return undefined; };
                                window.open           = function () { return undefined; };
                            
                                window.$soda_uids       = window.$soda_uids            || 0;
                                window.$soda_iterations = window.$soda_iterations      || 0;
                            
                                var dupedIds = 0;
                            
                                function isElementInViewport (el) {
                                    var rect = el.getBoundingClientRect();
                            
                                    return (
                                        rect.top    >= 0 &&
                                        rect.left   >= 0 &&
                                        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                                        rect.right  <= (window.innerWidth  || document.documentElement.clientWidth)
                                    );
                                }
                            
                                function getUniqueId () { return "soda-uid-" + (window.$soda_uids++); }
                            
                                function buildDOMTree (e, p, tree) {
                                    tree = tree || {};
                            
                                    for(var i = 0; i < e.length; i++) {
                                        window.$soda_iterations++;
                            
                                        var el  = e[i],
                                            tag = el.tagName.toLowerCase(), id, sodaid = null;
                            
                                        if(window.$soda_iterations === 1) {  // root id must always be soda-uid-0
                                            sodaid = "soda-uid-root";
                            
                                            if (!el.id) {
                                              el.id = "soda-uid-root";
                                            }
                                        }
                            
                                        if(tag !== "script" && tag !== "style" && tag !== "noscript") {
                                            if(el && !el.id) el.setAttribute('id', getUniqueId());
                            
                                            if(el && tree[el.id]) {
                                                id = el.id + "-" + (dupedIds++);
                                                el.setAttribute('id', id);
                                            }
                                            else if(el && el.id === 'each') {
                                                id = '_each';
                                                el.setAttribute('id', id);
                                            }
                                            else {
                                                id = el.id;
                                            }
                            
                                            var textNodes = el.childNodes,
                                                rect     = el.getBoundingClientRect(),
                                                textNode = '';
                            
                                            for(var t in textNodes) {
                                                if(textNodes.hasOwnProperty(t) && typeof textNodes[t].nodeType === 'number' && textNodes[t].nodeType === 3) {
                                                    textNode += textNodes[t].data.trim();
                                                }
                                            }
                            
                                            tree[sodaid ? sodaid: id] = {
                                                id      : id,
                                                type    : tag,
                                                name    : typeof el.attributes.class === 'object' && typeof el.attributes.class.value === 'string' ? el.attributes.class.value.split(/ +/g) : null,
                                                label   : typeof el.attributes.name  === 'object' && typeof el.attributes.name.value  === 'string' ? el.attributes.name.value.replace(/[^a-zA-Z0-9_\- ]/g, '') : null,
                                                value   : textNode || el.value || null,
                            
                                                rect : {
                                                    origin: {
                                                        x: rect.left,
                                                        y: rect.top
                                                    },
                                                    size: {
                                                        width  : rect.width,
                                                        height : rect.height
                                                    }
                                                },
                            
                                                enabled          : !el.attributes.disabled ? true  : false,
                                                visible          : rect.height > 0 && rect.width > 0 && isElementInViewport(el),
                                                hasKeyboardFocus : document.activeElement === el,
                                                attributes       : {},
                            
                                                valid    : true,
                                                children : {},
                                                index    : i,
                                                parent   : {}
                                            };
                            
                                            tree[sodaid ? sodaid: id].hitpoint = {
                                                x: (tree[sodaid ? sodaid: id].rect.origin.x + (tree[sodaid ? sodaid: id].rect.size.width  / 2)),
                                                y: (tree[sodaid ? sodaid: id].rect.origin.y + (tree[sodaid ? sodaid: id].rect.size.height / 2))
                                            };
                            
                                            if(typeof tree[sodaid ? sodaid: id].value === "string") tree[sodaid ? sodaid: id].value = tree[sodaid ? sodaid: id].value.replace(/\s+/g, ' ').trim();
                            
                                            if(typeof p === "object") {
                                                tree[sodaid ? sodaid: id].parent = {
                                                    id    : p.id,
                                                    name  : p.name,
                                                    label : p.label,
                                                    value : p.value
                                                };
                                            }
                            
                                            for(var a in el.attributes) {
                                                if(el.attributes.hasOwnProperty(a)) {
                                                    tree[sodaid ? sodaid: id].attributes[el.attributes[a].name] = el.attributes[a].value;
                                                }
                                            }
                            
                                            var children;
                                            if(tree[sodaid ? sodaid: id].type === "iframe" || tree[sodaid ? sodaid: id].type === "frame") { // Handle iFrames
                                                try {
                                                    children = el.contentDocument || el.contentWindow.document;
                                                    children = children.getElementsByTagName('body')[0];
                            
                                                    buildDOMTree(children, tree[sodaid ? sodaid: id], tree[sodaid ? sodaid: id].children);
                                                }
                                                catch (e) {
                                                    // No operation. Cross origin policy most likely is enabled...no iFrame child elements
                                                }
                                            }
                                            else {
                                                buildDOMTree(el.children, tree[sodaid ? sodaid: id], tree[sodaid ? sodaid: id].children);
                                            }
                                        }
                                    }
                                    return tree;
                                }

                                return JSON.stringify(buildDOMTree(document.getElementsByTagName('body')));
                            }());
                             });
                                                                
                            try {
                                const newRes = JSON.parse(res);
    
                                if (newRes && newRes[soda.config.get("sodaRootId")]) {
                                    newRes[soda.config.get("sodaRootId")].rect = {
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
        
                                done(null, newRes);
                                return self;
                            } catch (e) {
                                done(e, null);
                                return self;
                            }
                        }, 500);
                    }
                    else {
                        done(e, null);
                        return self;
                    }
                    
                },

                /**
                 * Click a set of elements
                 * @param {Array} els The set of elements to click
                 * @param {Object=} options Currently unused
                 * @param {Function=} done A callback for completion
                 */
                click: async function click(els, options, done) {
                    done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function() {};

                    Driver.check(done, async function() {
                        var next = 0,
                            clickNext, postClick;

                        postClick = res => {
                            if (res instanceof Error) {
                                done(null, true);
                                return self;
                            } else if (++next < els.length) {
                                return clickNext(els[next]);
                            } else {
                                done(null, true);
                                return self;
                            }
                        };

                        clickNext = async function(e) {
                            var pages = null, page = null;

                            if (options.physical) {
                              soda.console.debug('Physical click:', options);

                              pages = await Driver.instance.pages();

                              if (!Driver.instance) {
                                    return postClick();
                                }

                              if (pages) { 
                                page = pages[0];

                                if (e.type === 'option') {
                                    soda.console.debug('Clicking element that is an option: ', e.id);
                                    await page.select('*[id="'+e.parent.id+'"]', e.value);
                                    await page.evaluate((selector) => document.querySelector(selector).selected = true, '#'+e.id);
                                    await page.evaluate((selector) => { $(selector).change(); }, '*[id="'+e.parent.id+'"]');
                                }
                                else {
                                    soda.console.debug('Clicking element: ', e.id);
                                    await page.click('*[id="'+e.id+'"]').then(() => {
                                    }).catch(e => {
                                        done(null, null);
                                        return self;
                                    });
                                }
                                
                                return postClick();
                              }
                              else {
                                  return postClick();
                              }
                            }
                            else {
                              soda.console.debug('JavaScript click:', options);

                              pages = await Driver.instance.pages();

                              if (!Driver.instance) {
                                done(null, null);
                                return self;
                            }

                              if (pages) { 
                                page = pages[0];

                                if (e.type === 'option') {
                                    soda.console.debug('Clicking element that is an option: ', e.id);
                                    await page.select('*[id="'+e.parent.id+'"]', e.value);
                                    await page.evaluate((selector) => document.querySelector(selector).selected = true, '*[id="'+e.id+'"]');
                                    await page.evaluate((selector) => { $(selector).change(); }, '*[id="'+e.parent.id+'"]'); 
                                }
                                else {
                                    soda.console.debug('Clicking element: ', e.id);
                                    await page.click('*[id="'+e.id+'"]');
                                }

                                return postClick();
                              }
                              else {
                                  return postClick();
                              }
                            }
                        };
                        return clickNext(els[0]);
                    });
                },

            /**
             * Scroll an element into the browser's viewport
             * @param {Array} els The set of elements to scroll into view
             * @param {Object=} options Currently unused
             * @param {Function=} done A callback for completion
             */
            scrollToVisible: async function scrollToVisible (els, options, done) {
                done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};

                Driver.check(done, Puppeteer => {
                    var next = 0, scrollNext, postScroll;

                    postScroll = res => {
                        if(res instanceof Error) {
                            done(res, false);
                            return self;
                        }
                        else if(++next < els.length) {
                            return scrollNext(els[next]);
                        }
                        else {
                            done(null, true);
                            return self;
                        }
                    };

                    scrollNext = async function(e) {
                        var pages = await Driver.instance.pages();

                        if (!Driver.instance) {
                            postScroll();
                            return self;
                        }

                        if (pages) { 
                          var page = pages[0];

                          await page.$eval('#'+e.id, (el) => el.scrollIntoView())
                          await page.evaluate(() => { window.scrollBy(0, -200); });

                          return postScroll();
                        }
                        else {
                            return postScroll();
                        }
                    };

                    return scrollNext(els[0]);
                });
            },

            /**
             * Sets the value of a set of elements
             * @param {Array} els The set of elements to set the value for
             * @param {Object} options An object containing the key `value` to set the elements value to
             * @param {Function=} done A callback for completion
             */
            setValue: async function setValue (els, options, done) {
                done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};

                Driver.check(done, Puppeteer => {
                    var next = 0, setNext, postSet;

                    postSet = async function(res) {
                        if(res instanceof Error) {
                            done(res, false);
                            return self;
                        }
                        else if(++next < els.length) {
                            return setNext(els[next]);
                        }
                        else {
                            done(null, true);
                            return self;
                        }
                    };

                    setNext = async function(e) {
                        if (!Driver.instance) {
                            postSet();
                            return;
                        }

                        var pages = await Driver.instance.pages();

                        if (pages) { 
                            var page = pages[0];

                            if(options.delay) {
                                var k = 0, keySet = options.value.split(), nextKey;

                                nextKey = async function() {
                                    if(++k < keySet.length) {
                                        setTimeout(async function() { 
                                            await page.type('*[id="'+e.id+'"]', keySet[k]); 
                                            return postSet();
                                        }, options.delay * 1000);
                                    }
                                    else {
                                        await page.keyboard.press('Tab');

                                        return postSet();
                                    }
                                };

                                const input = await page.$('*[id="'+e.id+'"]');
                                await input.click({ clickCount: 3 })
                                await page.keyboard.press('Backspace');
                                await page.click('*[id="'+e.id+'"]');
                                return nextKey();
                            }
                            else {
                                console.log('#'+e.id, options.value.toString());
                                const input = await page.$('*[id="'+e.id+'"]');
                                await input.click({ clickCount: 3 })
                                await page.type('*[id="'+e.id+'"]', options.value.toString());
                                await page.keyboard.press('Tab');
                                return postSet();
                            }
                        }
                        else {
                            return postSet();
                        }
                    };

                    return setNext(els[0]);
                });
            },

            /**
             * Navigate the browser back one page
             * @param {Object} options Currently unused
             * @param {Function=} done A callback for completion
             */
            back: async function back (options, done) {
                done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};

                if (!Driver.instance) {
                    done(null, null);
                    return self;
                }

                var pages = await Driver.instance.pages();

                if (pages) { 
                    var page = pages[0];
                    await page.goBack();
                }

                done(null, true);
                return self
            },

            /**
             * Resize the browser window
             * @param {Number} height
             * @param {Number} width
             * @param {Function=} done A callback for completion
             */
            resizeWindow: function resizeWindow (resizeProperties, done) {
                done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};

                done.call(self, new Error('Not supported in Puppeteer'), null);
            },

            /**
             * Maximize the browser window
             * @param {Function=} done A callback for completion
             */
            maximizeWindow: function maximizeWindow (options, done) {
                done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};
                
                done.call(self, new Error('Not supported in Puppeteer'), null);
            },

            /**
             * Switch to frame
             * @param {Object} options Currently unused
             * @param {Function=} done A callback for completion
             */
            switchToFrame: async function switchToFrame (options, done) {
                done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};

                Driver.check(done, async function() {
                    var finished = stddone.bind(done);

                    finished();
                });
            },

            /**
             * Navigate the browser forward one page
             * @param {Object} options Currently unused
             * @param {Function=} done A callback for completion
             */
            forward: async function forward (options, done) {
                done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};

                if (!Driver.instance) {
                    done(null, true);
                    return self;
                }

                var pages = await Driver.instance.pages();

                if (pages) { 
                    var page = pages[0];
                    await page.goForward();
                }

                done(null, true);
                return self;
            },

            /**
             * Navigate the browser forward one page
             * @param {Object} options Currently unused
             * @param {Function=} done A callback for completion
             */
            reload: async function reload (options, done) {
                done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};

                if (!Driver.instance) {
                    done();
                    return self;
                }

                var pages = await Driver.instance.pages();

                if (pages) { 
                    var page = pages[0];
                    await page.reload();
                }

                done();

                return self;
            }
        };
        return self;
    }

    /**
     * Launches the Chrome browser for Puppeteer
     * @param {Object} options Options to start the browser with
     * @param {Function} done A callback for completion
     */
    function launchChrome (options, done) {
        done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};
        
        var headless = false;
        var argList = [];

        if(soda.config.get("headless")) {
            headless = true;
        }

        var time = process.hrtime();
        var opts = options.sessionName !== undefined && options.sessionName !== null && options.sessionName !== '' ? options.sessionName.toString() : null;
        Driver.session.name = opts || ((time[0] * 1e9 + time[1]) + Driver.id++);
        lastInitOptions.sessionName = Driver.session.name.toString();

        argList.push("--user-data-dir=" + nodePath.join(soda.config.get("temp"), Driver.session.name.toString()));
        argList.push("--reduce-security-for-testing");
        argList.push("--disable-web-security");
        argList.push("--disable-geolocation");
        argList.push("--js-flags=--expose-gc");
        argList.push("--enable-precise-memory-info");
        argList.push("-disable-extensions");

        if (soda.config.get("startMaximized")) {
          if(os === "win32" || os === "win64") {
            argList.push("--start-maximized");
          }
          else {
            argList.push("--kiosk");
          }
        }

        if (soda.config.get("incognito")) {
            argList.push("--incognito");
        }

        if(os === "win32" || os === "win64") {
            argList.push("--no-sandbox");
        }

        if(soda.config.get("headless")) {
            if (os === "linux") {
                argList.push('--no-sandbox')
                argList.push('--disable-setuid-sandbox')
                argList.push('--disable-dev-shm-usage')
                argList.push('--start-maximized')
                argList.push('--window-size=1920,1200')
            }
            else {
                argList.push("--start-maximized");
                argList.push('--window-size=1920,1200')
            }
            argList.push("--headless");
        }

        if(soda.config.get("proxy")) argList.push("--http-proxy=" + soda.config.get("proxy"));

        if (soda.config.get("chromeawslambda")) {
            chromium.executablePath.then(function(path) {
                chromePath = path;
                var newArgs = argList;
                if(soda.config.get("chromiumargs")) {
                    newArgs = chromium.args;
                    if(soda.config.get("proxy")) newArgs.push("--http-proxy=" + soda.config.get("proxy"));
                }

                var launchOptions = { 
                    args: newArgs,
                    defaultViewport: null,
                    executablePath: chromePath, // because we are using puppeteer-core so we must define this option
                    headless: chromium.headless,
                    ignoreHTTPSErrors: true
                };
        
                loadScript();
    
                chromium.puppeteer.launch(launchOptions).then( function(browser) {
                    Driver.instance = browser;
                    done(null, true, Driver);
                    return self;
                });
            });
        }
        else if (soda.config.get("browserless")) {
            locateChrome().then( function(path) {
                chromePath = path;
    
                var launchOptions = { 
                    defaultViewport: null,
                    headless: headless, 
                    executablePath: chromePath, // because we are using puppeteer-core so we must define this option
                    args: argList };
        
                loadScript();
        
                webdriver.connect({ browserWSEndpoint: 'ws://localhost:3000' }).then( function(browser) {
                    Driver.instance = browser;
                    done(null, true, Driver);
                    return self;
                });
            });
        }
        else {
            locateChrome().then( function(path) {
                chromePath = path;
    
                var launchOptions = { 
                    defaultViewport: null,
                    headless: headless, 
                    executablePath: chromePath, // because we are using puppeteer-core so we must define this option
                    args: argList };
        
                loadScript();
        
                webdriver.launch(launchOptions).then( function(browser) {
                    Driver.instance = browser;
                    done(null, true, Driver);
                    return self;
                });
            });
        }

        return self;
    }

    /**
     * Starts the current Puppeteer driver
     * @param {String} browser The browser to start the driver with
     * @param {Object} options An object with options associates with startup
     * @param {Function=} A callback for completion
     * @returns {PuppeteerDriver} The current PuppeteerDriver instance
     */
    this.start = function start (browser, options, done) {
        done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};
        lastInitOptions = options;
        lastInitBrowser = browser;
        resetDriver();

        var postLaunch = function postLaunch (err, success, driver) {
            if (err) done.appy(self, err);
            Driver.check(done, Puppeteer => {
                if (soda.config.get("incognito") && (browser.toLowerCase() === "chrome" || browser.toLowerCase() === "google")) {
                  Puppeteer.get("chrome://extensions-frame");

                  var element = Puppeteer.findElement(By.xpath("//input[@type='checkbox']/ancestor::label[@class='incognito-control']"));
                  element.click().then(res => {
                    done.apply(self, arguments);
                  });
                }
                else {
                  done.apply(self, arguments);
                }
            });
        };

        switch(browser.toLowerCase()) {
            case "chrome":
            case "google":
                launchChrome(options, postLaunch);
                break;

            default:
                done(new Error("Unknown browser `" + browser + "`"), false, null);
                break;
        }
        return self;
    };

    /**
     * Stops and shuts-down the current Puppeteer driver
     * @param {Function} done A callback for completion
     * @returns {PuppeteerDriver} The current PuppeteerDriver instance
     */
    this.stop = function stop (done) {
        done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};

        var resetWrapper = function (res) {
            resetDriver();
            done.call(self, res, !(res instanceof Error));
        };

        Driver.check(
            ()       => { done.call(self, null, true); },
            Puppeteer => { Puppeteer.close().then(resetWrapper, resetWrapper); }
        );
        return self;
    };

    /**
     * Restarts the current Puppeteer driver
     * @param {Function} done A callback for completion
     * @returns {PuppeteerDriver} The current PuppeteerDriver instance
     */
    this.restart = function (done) {
        done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};

        if(!lastInitOptions) {
            done.call(self, new Error("Cannot restart Puppeteer framework, since it hasn't been started yet"), false, null);
        }
        else {
            self.stop(() => { self.start(lastInitBrowser, lastInitOptions, done); });
        }
        return self;
    };
};

module.exports = PuppeteerDriver;
