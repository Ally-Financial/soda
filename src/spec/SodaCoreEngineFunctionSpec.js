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

"use strict";

var sinon = require('sinon'),
    path   = require("path"),
    Soda   = require(path.join(__dirname, "..", "SodaCore", "lib", "Soda")),
    CoreSyntax   = require(path.join(__dirname, "..", "SodaCore", "lib", "CoreSyntax")),
    Run = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "Run")),
    fs     = require("fs");

require(path.join(__dirname, "..", "SodaCommon", "ProtoLib"));

describe('Engine Function should pass all validation tests', function () {
  var soda, Tree, tree;

    beforeAll(function (done) {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;

      soda = new Soda({ testPath: path.join(__dirname, '..', 'sample_project'), logSupressed: true });

      soda.init(function() {
        soda.config.set("headless", true, true, true);
        
          Tree = require(path.join(__dirname, "..", "SodaCore", "lib", "Tree"))(soda);
          tree     = new Tree(JSON.parse(fs.readFileSync(path.resolve(__dirname + "/trees/LoginScreen.json")).toString('utf-8')));
          done();
      });
    });

    afterAll(function (done) {
      soda.kill();
      
      soda = null;

      done();
    });

    var validateResetData = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      var sandbox = sinon.createSandbox();

      var fakeScope = { device: {
        resetAppData: function(cb) {
          cb(null);
        }
      }};

      var reply = function(res, value) {
       expect(res).toEqual(true);
       expect(value).toEqual("Should reset application data");

       done();
      };

       sandbox.restore();

       func.resetAppData({}, reply, fakeScope);
    };

    var hideAppFor = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      var sandbox = sinon.createSandbox();

      var fakeScope = { device: {
        hideAppForSeconds: function(err, cb) {
          cb(null, true);
        }
      },
      console: {
        log: function(str) {
          console.log(str);
        }
      }};

      var reply = function(res, value) {
       expect(res).toEqual(true);
       expect(value).toEqual("Should hide app for `5` seconds");

       done();
      };

       sandbox.restore();

       func.hideAppFor({ hideAppFor: 5 }, reply, fakeScope);
    };

    var homeScreen = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      var sandbox = sinon.createSandbox();

      var fakeScope = { device: {
        homeScreen: function(cb) {
          cb(null, true);
        }
      },
      console: {
        log: function(str) {
          console.log(str);
        }
      }};

      var reply = function(res, value) {
       expect(res).toEqual(true);
       expect(value).toEqual("Should go to home screen");

       done();
      };

       sandbox.restore();

       func.homeScreen({  }, reply, fakeScope);
    };

    var sendKeyCommand = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      var sandbox = sinon.createSandbox();

      var fakeScope = { device: {
        sendKeyCommand: function(command, cb) {
          cb(null, true);
        }
      },
      console: {
        log: function(str) {
          console.log(str);
        }
      }};

      var reply = function(res, value) {
       expect(res).toEqual(true);
       expect(value).toEqual("Should send key command `H`");

       done();
      };

       sandbox.restore();

       func.sendKeyCommand({ sendKeyCommand: 'H' }, reply, fakeScope);
    };

    var startApp = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      var sandbox = sinon.createSandbox();

      var fakeScope = { device: {
        startApp: function(command, options, cb) {
          cb(null, true);
        }
      },
      console: {
        log: function(str) {
          console.log(str);
        }
      }};

      var reply = function(res, value) {
       expect(res).toEqual(true);
       expect(value).toEqual("Should start `App`");

       done();
      };

       sandbox.restore();

       func.startApp({ startApp: 'App', args: [] }, reply, fakeScope);
    };

    var startAppAndWait = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      var sandbox = sinon.createSandbox();

      var fakeScope = { device: {
        startAppAndWait: function(command, options, cb) {
          cb(null, true);
        }
      },
      console: {
        log: function(str) {
          console.log(str);
        }
      }};

      var reply = function(res, value) {
       expect(res).toEqual(true);
       expect(value).toEqual("Should start `App` on args");

       done();
      };

       sandbox.restore();

       func.startAppAndWait({ startAppAndWait: 'App', args: [] }, reply, fakeScope);
    };

    var stopApp = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      var sandbox = sinon.createSandbox();

      var fakeScope = { device: {
        stopApp: function(command, options, cb) {
          cb(null, true);
        }
      },
      console: {
        log: function(str) {
          console.log(str);
        }
      }};

      var reply = function(res, value) {
       expect(res).toEqual(true);
       expect(value).toEqual("Should stop `App`");

       done();
      };

       sandbox.restore();

       func.stopApp({ stopApp: 'App', args: [] }, reply, fakeScope);
    };

    var openApp = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      var sandbox = sinon.createSandbox();

      var fakeScope = { device: {
        startApp: function(command, options, cb) {
          cb(null, true);
        }
      },
      console: {
        log: function(str) {
          console.log(str);
        }
      }};

      var reply = function(res, value) {
       expect(res).toEqual(true);
       expect(value).toEqual("Should open `App`");

       done();
      };

       sandbox.restore();

       func.openApp({ openApp: 'App' }, reply, fakeScope);
    };

    var closeApp = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      var sandbox = sinon.createSandbox();

      var fakeScope = { device: {
        stopApp: function(command, options, cb) {
          cb(null, true);
        }
      },
      console: {
        log: function(str) {
          console.log(str);
        }
      }};

      var reply = function(res, value) {
       expect(res).toEqual(true);
       expect(value).toEqual("Should close `App`");

       done();
      };

       sandbox.restore();

       func.closeApp({ closeApp: 'App' }, reply, fakeScope);
    };

    var rotateDevice = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      tree.update = function(cb) { cb(null, tree); };

      var sandbox = sinon.createSandbox();

      var fakeScope = { device: {
        rotateDevice: function(command, cb) {
          cb(null, true);
        }
      },
      console: {
        log: function(str) {
          console.log(str);
        }
      },
    tree: tree};

      var reply = function(res, value) {
       expect(res).toEqual(true);
       expect(value).toEqual("Should rotate device");

       done();
      };

       sandbox.restore();

       func.rotateDevice({ rotateDevice: 'App' }, reply, fakeScope);
    };

    var typeOnKeyboard = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      var sandbox = sinon.createSandbox();

      var fakeScope = { device: {
        typeOnKeyboard: function(err, cb) {
          cb(null, true);
        }
      },
      console: {
        log: function(str) {
          console.log(str);
        }
      }};

      var reply = function(res, value) {
       expect(res).toEqual(true);
       expect(value).toEqual("Should type `hello` on keyboard");

       done();
      };

       sandbox.restore();

       func.typeOnKeyboard({ typeOnKeyboard: 'hello' }, reply, fakeScope);
    };

    var back = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      var sandbox = sinon.createSandbox();

      var fakeScope = { device: {
        back: function(cb) {
          cb(null, true);
        }
      },
      console: {
        log: function(str) {
          console.log(str);
        }
      }};

      var reply = function(res, value) {
       expect(res).toEqual(true);
       expect(value).toEqual("Should press back button");

       done();
      };

       sandbox.restore();

       func.back({  }, reply, fakeScope);
    };

    var lockScreen = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      var sandbox = sinon.createSandbox();

      var fakeScope = { device: {
        lockScreen: function(coords, cb) {
          cb(null, true);
        }
      },
      console: {
        log: function(str) {
          console.log(str);
        }
      }};

      var reply = function(res, value) {
       expect(res).toEqual(true);
       expect(value).toEqual("Should lock screen");

       done();
      };

       sandbox.restore();

       func.lockScreen({  }, reply, fakeScope);
    };

    var deviceSwipe = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      var sandbox = sinon.createSandbox();

      var fakeScope = { device: {
        deviceSwipe: function(coords, cb) {
          cb(null, true);
        }
      },
      console: {
        log: function(str) {
          console.log(str);
        }
      }};

      var reply = function(res, value) {
       expect(res).toEqual(true);
       expect(value).toEqual("Should swipe");

       done();
      };

       sandbox.restore();

       func.deviceSwipe({  }, reply, fakeScope);
    };

    var deviceSwipeLeft = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      var sandbox = sinon.createSandbox();

      var fakeScope = { device: {
        deviceSwipe: function(coords, cb) {
          cb(null, true);
        }
      },
      console: {
        log: function(str) {
          console.log(str);
        }
      }};

      var reply = function(res, value) {
       expect(res).toEqual(true);
       expect(value).toEqual("Should swipe left");

       done();
      };

       sandbox.restore();

       func.deviceSwipeLeft({ deviceSwipe: "direction" }, reply, fakeScope);
    };

    var deviceSwipeRight = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      var sandbox = sinon.createSandbox();

      var fakeScope = { device: {
        deviceSwipe: function(coords, cb) {
          cb(null, true);
        }
      },
      console: {
        log: function(str) {
          console.log(str);
        }
      }};

      var reply = function(res, value) {
       expect(res).toEqual(true);
       expect(value).toEqual("Should swipe right");

       done();
      };

       sandbox.restore();

       func.deviceSwipeRight({  }, reply, fakeScope);
    };

    var deviceSwipeUp = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      var sandbox = sinon.createSandbox();

      var fakeScope = { device: {
        deviceSwipe: function(coords, cb) {
          cb(null, true);
        }
      },
      console: {
        log: function(str) {
          console.log(str);
        }
      }};

      var reply = function(res, value) {
       expect(res).toEqual(true);
       expect(value).toEqual("Should swipe up");

       done();
      };

       sandbox.restore();

       func.deviceSwipeUp({  }, reply, fakeScope);
    };

    var deviceSwipeDown = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      var sandbox = sinon.createSandbox();

      var fakeScope = { device: {
        deviceSwipe: function(coords, cb) {
          cb(null, true);
        }
      },
      console: {
        log: function(str) {
          console.log(str);
        }
      }};

      var reply = function(res, value) {
       expect(res).toEqual(true);
       expect(value).toEqual("Should swipe down");

       done();
      };

       sandbox.restore();

       func.deviceSwipeDown({  }, reply, fakeScope);
    };

    var scrollToVisibleText = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      var sandbox = sinon.createSandbox();

      var fakeScope = { device: {
        findElementWithScroll: function(text, cb) {
          cb(null, true);
        },
        getScreenBounds: function(cb) {
          cb(null, [1000, 1000]);
        },
        scrollWindow: function(text, cb) {
          cb(null, true);
        }
      },
      console: {
        log: function(str) {
          console.log(str);
        },
        debug: function(str) {
          console.log(str);
        }
      },
      soda: {
        framework: {
          name: "perfecto"
        }
      }};

      var reply = function(res, value) {
       expect(res).toEqual(true);
       expect(value).toEqual("Should scroll `Username` into view (Elements with text `Username`)");

       done();
      };

       sandbox.restore();

       func.scrollToVisibleText({ parent: '*[id="textfield:0"]', scrollToVisibleText: "Username" }, reply, fakeScope);
    };

    var scrollToVisibleTextNoParent = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      var sandbox = sinon.createSandbox();

      var fakeScope = { device: {
        findElementWithScroll: function(text, cb) {
          cb(null, true);
        },
        getScreenBounds: function(cb) {
          cb(null, [1000, 1000]);
        },
        scrollWindow: function(text, cb) {
          cb(null, true);
        }
      },
      console: {
        log: function(str) {
          console.log(str);
        },
        debug: function(str) {
          console.log(str);
        }
      },
      soda: {
        framework: {
          name: "perfecto"
        }
      }};

      var reply = function(res, value) {
       expect(res).toEqual(true);
       expect(value).toEqual("Should scroll `Username` into view (Elements with text `Username`)");

       done();
      };

       sandbox.restore();

       func.scrollToVisibleText({ scrollToVisibleText: "Username" }, reply, fakeScope);
    };

    var scrollToVisibleTextPerfecto = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      var sandbox = sinon.createSandbox();

      var fakeScope = { device: {
        findElementWithScroll: function(text, cb) {
          cb(null, true);
        }
      },
      console: {
        log: function(str) {
          console.log(str);
        },
        debug: function(str) {
          console.log(str);
        }
      },
      soda: {
        framework: {
          name: "perfecto"
        }
      }};

      var reply = function(res, value) {
       expect(res).toEqual(true);
       expect(value).toEqual("Should scroll `hello` into view (Elements with text `hello`)");

       done();
      };

       sandbox.restore();

       func.scrollToVisibleText({ scrollToVisibleText: "hello" }, reply, fakeScope);
    };

    var scrollToVisible = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      var sandbox = sinon.createSandbox();

      var fakeScope = { device: {
        findElementWithScroll: function(text, cb) {
          cb(null, true);
        },
        getScreenBounds: function(cb) {
          cb(null, [1000, 1000]);
        },
        scrollWindow: function(text, cb) {
          cb(null, true);
        }
      },
      console: {
        log: function(str) {
          console.log(str);
        },
        debug: function(str) {
          console.log(str);
        }
      },
      soda: {
        framework: {
          name: "perfecto"
        }
      },
      tree: tree
    };

      var reply = function(res, value) {
       expect(res).toEqual(true);
       expect(value).toEqual("Should scroll `*[id='textfield:1']` into view (Elements with selector `*[id='textfield:1']`)");

       done();
      };

       sandbox.restore();

       func.scrollToVisible({ parent: '*[id="textfield:0"]', scrollToVisible: "*[id='textfield:1']" }, reply, fakeScope);
    };

    var scrollToVisibleNoParent = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      var sandbox = sinon.createSandbox();

      var fakeScope = { device: {
        findElementWithScroll: function(text, cb) {
          cb(null, true);
        },
        getScreenBounds: function(cb) {
          cb(null, [1000, 1000]);
        },
        scrollWindow: function(text, cb) {
          cb(null, true);
        }
      },
      console: {
        log: function(str) {
          console.log(str);
        },
        debug: function(str) {
          console.log(str);
        }
      },
      soda: {
        framework: {
          name: "perfecto"
        }
      },
      tree: tree
    };

      var reply = function(res, value) {
       expect(res).toEqual(true);
       expect(value).toEqual("Should scroll `*[id='textfield:1']` into view (Elements with selector `*[id='textfield:1']`)");

       done();
      };

       sandbox.restore();

       func.scrollToVisible({ scrollToVisible: "*[id='textfield:1']" }, reply, fakeScope);
    };

    var scrollToVisiblePerfecto = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      var sandbox = sinon.createSandbox();

      var fakeScope = { device: {
        findElementWithScroll: function(text, cb) {
          cb(null, true);
        }
      },
      console: {
        log: function(str) {
          console.log(str);
        },
        debug: function(str) {
          console.log(str);
        }
      },
      soda: {
        framework: {
          name: "perfecto"
        }
      },
      tree: tree
    };

      var reply = function(res, value) {
       expect(res).toEqual(true);
       expect(value).toEqual("Should scroll `*[id='textfield:1']` into view (Elements with selector `*[id='textfield:1']`)");

       done();
      };

       sandbox.restore();

       func.scrollToVisible({ scrollToVisible: "*[id='textfield:1']" }, reply, fakeScope);
    };

    var scrollToTop = function(fname, pname, name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      tree.update = function(cb) { cb(null, tree); };

      var sandbox = sinon.createSandbox();

      CoreSyntax.checkUsing = function(elements, using, reply) {
        return true;
      };

      var fakeScope = { device: {
        findElementWithScroll: function(text, cb) {
          cb(null, true);
        },
        scrollWindow: function(text, cb) {
          cb(null, true);
        }
      },
      console: {
        log: function(str) {
          console.log(str);
        },
        debug: function(str) {
          console.log(str);
        }
      },
      soda: {
        framework: {
          name: fname
        },
        config: {
          get: function(key) {
            return pname;
          }
        }
      },
      tree: tree,
      elements: tree.elements
    };

      var reply = function(res, value) {
       expect(res).toEqual(true);
       expect(value).toEqual("Should scrollToTop `*[id='textfield:1']`");

       done();
      };

       sandbox.restore();

       func.scrollToTop({ scrollToTop: "*[id='textfield:1']" }, reply, fakeScope);
    };

    var scrollToBottom = function(fname, pname, name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      tree.update = function(cb) { cb(null, tree); };

      var sandbox = sinon.createSandbox();

      CoreSyntax.checkUsing = function(elements, using, reply) {
        return true;
      };

      var fakeScope = { device: {
        findElementWithScroll: function(text, cb) {
          cb(null, true);
        },
        scrollWindow: function(text, cb) {
          cb(null, true);
        }
      },
      console: {
        log: function(str) {
          console.log(str);
        },
        debug: function(str) {
          console.log(str);
        }
      },
      soda: {
        framework: {
          name: fname
        },
        config: {
          get: function(key) {
            return pname;
          }
        }
      },
      tree: tree,
      elements: tree.elements
    };

      var reply = function(res, value) {
       expect(res).toEqual(true);
       expect(value).toEqual("Should scrollToBottom `*[id='textfield:1']`");

       done();
      };

       sandbox.restore();

       func.scrollToBottom({ scrollToBottom: "*[id='textfield:1']" }, reply, fakeScope);
    };

    var swipeOptions = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      tree.update = function() { return tree; };

      var action = {
        swipe: "*[id='userName']",
        options: {}
      };

      var run = new Run(soda);
      run.state = "running";

      var newTree = {
       tree: tree,
       run: run,
       elements: function() { return tree.elements(); },
       update: function() { return tree; },
       console: { debug: function(str) {
                   console.log(str);
                 },
                 log: function(str) {
                   console.log(str);
                 }
               }
      };

      CoreSyntax.checkExistsAndIsSingleElement = function(actionName, e, selectorType, selector, scope, reply, complete) {
        complete(null, true);
      };

      CoreSyntax.performElementInteraction = function(name, e, reply, options, selector, refresh, scope, n, refreshTemp) {
        reply(true, "Should " + name + " `" + selector + "`");
      };

      var reply = function(res, value) {
       expect(res).toEqual(true);
       expect(value).toEqual("Should swipe `*[id='userName']`");

       done();
      };

       func.swipeOptions(action, reply, newTree);
    };

    var swipe = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      tree.update = function() { return tree; };

      var action = {
        swipe: "*[id='userName']"
      };

      var run = new Run(soda);
      run.state = "running";

      var newTree = {
       tree: tree,
       run: run,
       elements: function() { return tree.elements(); },
       update: function() { return tree; },
       console: { debug: function(str) {
                   console.log(str);
                 },
                 log: function(str) {
                   console.log(str);
                 }
               }
      };

      CoreSyntax.checkExistsAndIsSingleElement = function(actionName, e, selectorType, selector, scope, reply, complete) {
        complete(null, true);
      };

      CoreSyntax.performElementInteraction = function(name, e, reply, options, selector, refresh, scope, n, refreshTemp) {
        reply(true, "Should " + name + " `" + selector + "`");
      };

      var reply = function(res, value) {
       expect(res).toEqual(true);
       expect(value).toEqual("Should swipe `*[id='userName']`");

       done();
      };

       func.swipe(action, reply, newTree);
    };

    var swipeUsingOptions = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      tree.update = function() { return tree; };

      var action = {
        swipe: "userName",
        using: "id",
        options: {}
      };

      var run = new Run(soda);
      run.state = "running";

      var newTree = {
       tree: tree,
       run: run,
       elements: function() { return tree.elements(); },
       update: function() { return tree; },
       console: { debug: function(str) {
                   console.log(str);
                 },
                 log: function(str) {
                   console.log(str);
                 }
               }
      };

      CoreSyntax.checkExistsAndIsSingleElement = function(actionName, e, selectorType, selector, scope, reply, complete) {
        complete(null, true);
      };

      CoreSyntax.performElementInteraction = function(name, e, reply, options, selector, refresh, scope, n, refreshTemp) {
        reply(true, "Should " + name + " `" + selector + "`");
      };

      var reply = function(res, value) {
       expect(res).toEqual(true);
       expect(value).toEqual("Should swipe `userName`");

       done();
      };

       func.swipeUsingOptions(action, reply, newTree);
    };

    var swipeUsing = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      tree.update = function() { return tree; };

      var action = {
        swipe: "userName",
        using: "id"
      };

      var run = new Run(soda);
      run.state = "running";

      var newTree = {
       tree: tree,
       run: run,
       elements: function() { return tree.elements(); },
       update: function() { return tree; },
       console: { debug: function(str) {
                   console.log(str);
                 },
                 log: function(str) {
                   console.log(str);
                 }
               }
      };

      CoreSyntax.checkExistsAndIsSingleElement = function(actionName, e, selectorType, selector, scope, reply, complete) {
        complete(null, true);
      };

      CoreSyntax.performElementInteraction = function(name, e, reply, options, selector, refresh, scope, n, refreshTemp) {
        reply(true, "Should " + name + " `" + selector + "`");
      };

      var reply = function(res, value) {
       expect(res).toEqual(true);
       expect(value).toEqual("Should swipe `userName`");

       done();
      };

       func.swipeUsing(action, reply, newTree);
    };

    var tapOptions = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      tree.update = function() { return tree; };

      var action = {
        tap: "*[id='userName']",
        tapXY: [100, 100],
        options: {}
      };

      var run = new Run(soda);
      run.state = "running";

      var newTree = {
       tree: tree,
       run: run,
       elements: function() { return tree.elements(); },
       update: function() { return tree; },
       console: { debug: function(str) {
                   console.log(str);
                 },
                 log: function(str) {
                   console.log(str);
                 }
               }
      };

      CoreSyntax.checkExistsAndIsSingleElement = function(actionName, e, selectorType, selector, scope, reply, complete) {
        complete([{rect: { origin: { x: 100, y: 100 } } }] );
      };

      CoreSyntax.performElementInteraction = function(name, e, reply, options, selector, refresh, scope, n, refreshTemp) {
        reply(true, "Should " + name + " `" + selector + "`");
      };

      var reply = function(res, value) {
       expect(res).toEqual(true);
       expect(value).toEqual("Should tap `*[id='userName']`");

       done();
      };

       func.tapOptions(action, reply, newTree);
    };

    var tap = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      tree.update = function() { return tree; };

      var action = {
        tap: "userName",
        using: "id",
        tapXY: [100, 100]
      };

      var run = new Run(soda);
      run.state = "running";

      var newTree = {
       tree: tree,
       run: run,
       elements: function() { return tree.elements(); },
       update: function() { return tree; },
       console: { debug: function(str) {
                   console.log(str);
                 },
                 log: function(str) {
                   console.log(str);
                 }
               }
      };

      CoreSyntax.checkExistsAndIsSingleElement = function(actionName, e, selectorType, selector, scope, reply, complete) {
        complete([{rect: { origin: { x: 100, y: 100 } } }] );
      };

      CoreSyntax.performElementInteraction = function(name, e, reply, options, selector, refresh, scope, n, refreshTemp) {
        reply(true, "Should " + name + " `" + selector + "`");
      };

      var reply = function(res, value) {
       expect(res).toEqual(true);
       expect(value).toEqual("Should tap `*[id='userName']`");

       done();
      };

       func.tap(action, reply, newTree);
    };

    var tapIfExists = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      tree.update = function() { return tree; };

      var action = {
        tapIfExists: "*[id='textfield:1']",
        tapXY: [100, 100],
        options: {},
        refresh: true
      };

      var run = new Run(soda);
      run.state = "running";

      var newTree = {
       tree: tree,
       run: run,
       elements: function() { return tree.elements(); },
       update: function() { return tree; },
       console: { debug: function(str) {
                   console.log(str);
                 },
                 log: function(str) {
                   console.log(str);
                 }
               }
      };

      CoreSyntax.checkUsing = function(elements, using, reply) {
        return true;
      };

      CoreSyntax.performElementInteraction = function(name, e, reply, options, selector, refresh, scope, n, refreshTemp) {
        reply(true, "Should " + name + " `" + selector + "`");
      };

      var reply = function(res, value) {
       expect(res).toEqual(true);
       expect(value).toEqual("Should tap `*[id='textfield:1']`");

       done();
      };

       func.tapIfExists(action, reply, newTree);
    };

    var tapAllOptions = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      tree.update = function() { return tree; };

      var action = {
        tapAll: "*[id='textfield:1']",
        tapXY: [100, 100],
        options: {},
        refresh: true
      };

      var run = new Run(soda);
      run.state = "running";

      var newTree = {
       tree: tree,
       run: run,
       elements: function() { return tree.elements(); },
       update: function() { return tree; },
       console: { debug: function(str) {
                   console.log(str);
                 },
                 log: function(str) {
                   console.log(str);
                 }
               }
      };

      CoreSyntax.checkUsing = function(elements, using, reply) {
        return true;
      };

      CoreSyntax.checkElementExists = function(actionName, e, selectorType, selector, scope, reply, complete) {
        complete([{rect: { origin: { x: 100, y: 100 } } }] );
      };

      CoreSyntax.performElementInteraction = function(name, e, reply, options, selector, refresh, scope, n, refreshTemp) {
        reply(true, "Should " + name + " `" + selector + "`");
      };

      var reply = function(res, value) {
       expect(res).toEqual(true);
       expect(value).toEqual("Should tap `*[id='textfield:1']`");

       done();
      };

       func.tapAllOptions(action, reply, newTree);
    };

    var tapXY = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      tree.update = function() { return tree; };

      var action = {
        tapAll: "*[id='textfield:1']",
        tapXY: [100, 100],
        options: {},
        refresh: false
      };

      var run = new Run(soda);
      run.state = "running";

      var newTree = {
       tree: tree,
       run: run,
       elements: function() { return tree.elements(); },
       update: function() { return tree; },
       device: { tapXY: function(x, y, cb) {
         cb(null, true);
       } },
       console: { debug: function(str) {
                   console.log(str);
                 },
                 log: function(str) {
                   console.log(str);
                 }
               }
      };

      var reply = function(res, value) {
       expect(res).toEqual(true);
       expect(value).toEqual("Should tap screen coordinates [100, 100]");

       done();
      };

       func.tapXY(action, reply, newTree);
    };

    var tapXYRelativeTo = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      tree.update = function() { return tree; };

      var action = {
        tapAll: "*[id='textfield:1']",
        tapXY: [100, 100],
        options: {},
        refresh: false
      };

      var run = new Run(soda);
      run.state = "running";

      var newTree = {
       tree: tree,
       run: run,
       elements: function() { return tree.elements(); },
       update: function() { return tree; },
       device: { tapXY: function(x, y, cb) {
         cb(null, true);
       } },
       console: { debug: function(str) {
                   console.log(str);
                 },
                 log: function(str) {
                   console.log(str);
                 }
               }
      };

      var reply = function(res, value) {
       expect(res).toEqual(true);
       expect(value).toEqual("Should tap screen coordinates [200, 200]");

       done();
      };

       func.tapXYRelativeTo(action, reply, newTree);
    };

    var tapUsingOptions = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      tree.update = function() { return tree; };

      var action = {
        tap: "textfield:1",
        using: "id",
        tapXY: [100, 100],
        refresh: false
      };

      var run = new Run(soda);
      run.state = "running";

      var newTree = {
       tree: tree,
       run: run,
       elements: function() { return tree.elements(); },
       update: function() { return tree; },
       device: { tapXY: function(x, y, cb) {
         cb(null, true);
       } },
       console: { debug: function(str) {
                   console.log(str);
                 },
                 log: function(str) {
                   console.log(str);
                 }
               }
      };

      var reply = function(res, value) {
       expect(res).toEqual(true);
       expect(value).toEqual("Should tap `textfield:1`");

       done();
      };

       func.tapUsingOptions(action, reply, newTree);
    };

    var tapUsing = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      tree.update = function() { return tree; };

      var action = {
        tap: "textfield:1",
        using: "id",
        tapXY: [100, 100],
        refresh: false
      };

      var run = new Run(soda);
      run.state = "running";

      var newTree = {
       tree: tree,
       run: run,
       elements: function() { return tree.elements(); },
       update: function() { return tree; },
       device: { tapXY: function(x, y, cb) {
         cb(null, true);
       } },
       console: { debug: function(str) {
                   console.log(str);
                 },
                 log: function(str) {
                   console.log(str);
                 }
               }
      };

      var reply = function(res, value) {
       expect(res).toEqual(true);
       expect(value).toEqual("Should tap `textfield:1`");

       done();
      };

       func.tapUsing(action, reply, newTree);
    };

    var parseJSON = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      soda.vars.save("parseTest", { json: "value" });

      var sandbox = sinon.createSandbox();

      var fakeScope = { soda: soda};

      var reply = function(res, value) {
       expect(soda.vars.get('parsedTest')).toEqual("value");

       done();
      };

      sandbox.restore();

       func.parseJSON({ parseJSON: "parseTest", storeAs: "parsedTest", field: "json" }, reply, fakeScope);
    };

    var stringifyJSON = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      var sandbox = sinon.createSandbox();

      var fakeScope = { soda: soda};

      var reply = function(res, value) {
       expect(soda.vars.get('stringifyJSON')).toEqual('{"json":"value"}');

       done();
      };

      sandbox.restore();

       func.stringifyJSON({ stringifyJSON: { json: "value" }, storeAs: "stringifyJSON" }, reply, fakeScope);
    };

    var getip = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      var localIps = [];
      var os = require('os');
      var ifaces = os.networkInterfaces();

      Object.keys(ifaces).forEach(function (ifname) {
        var alias = 0;

        ifaces[ifname].forEach(function (iface) {
          if ('IPv4' !== iface.family || iface.internal !== false) {
            // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
            return;
          }

          if (alias >= 1) {
            // this single interface has multiple ipv4 addresses
            localIps.push(iface.address);
          } else {
            // this interface has only one ipv4 adress
            localIps.push(iface.address);
          }
          ++alias;
        });
      });

        var localIp = localIps[localIps.length-1];

        var sandbox = sinon.createSandbox();

        var fakeScope = { soda: soda};

        var reply = function(res, value) {
         expect(soda.vars.get('ip')).toEqual(localIp);

         done();
        };

        sandbox.restore();

        func.getip({  }, reply, fakeScope);
    };

    var getipStoreIn = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      var localIps = [];
      var os = require('os');
      var ifaces = os.networkInterfaces();

      Object.keys(ifaces).forEach(function (ifname) {
        var alias = 0;

        ifaces[ifname].forEach(function (iface) {
          if ('IPv4' !== iface.family || iface.internal !== false) {
            // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
            return;
          }

          if (alias >= 1) {
            // this single interface has multiple ipv4 addresses
            localIps.push(iface.address);
          } else {
            // this interface has only one ipv4 adress
            localIps.push(iface.address);
          }
          ++alias;
        });
      });

        var localIp = localIps[localIps.length-1];

        var sandbox = sinon.createSandbox();

        var fakeScope = { soda: soda};

        var reply = function(res, value) {
         expect(soda.vars.get('ipaddr')).toEqual(localIp);

         done();
        };

        sandbox.restore();

        func.getipStoreIn({ storeIn: "ipaddr" }, reply, fakeScope);
    };

    var post = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      soda.vars.save('body', "This is a body");
      soda.vars.save('headers', { "Accept": "application/json" });

        var sandbox = sinon.createSandbox();

        var fakeScope = { device: {
            post: function(args, cb) {
              cb(null, 'hi', 'who');
            }
          },
          soda: soda};

        var reply = function(res, value) {
         expect(soda.vars.get('last')).toEqual('hi');
         expect(soda.vars.get('passfail')).toEqual(0);
         expect(soda.vars.get('response')).toEqual('who');

         done();
        };

        sandbox.restore();

        func.post({ post: "http://google.com", body: "body", headers: "headers", storeResponse: true }, reply, fakeScope);
    };

    var get = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      soda.vars.save('body', "This is a body");
      soda.vars.save('headers', { "Accept": "application/json" });

        var sandbox = sinon.createSandbox();

        var fakeScope = { device: {
            get: function(args, cb) {
              cb(null, 'hi', 'who');
            }
          },
          soda: soda};

        var reply = function(res, value) {
         expect(soda.vars.get('last')).toEqual('hi');
         expect(soda.vars.get('passfail')).toEqual(0);
         expect(soda.vars.get('response')).toEqual('who');

         done();
        };

        sandbox.restore();

        func.get({ post: "http://google.com", body: "body", headers: "headers", storeResponse: true }, reply, fakeScope);
    };

    var del = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      soda.vars.save('body', "This is a body");
      soda.vars.save('headers', { "Accept": "application/json" });

        var sandbox = sinon.createSandbox();

        var fakeScope = { device: {
            del: function(args, cb) {
              cb(null, 'hi', 'who');
            }
          },
          soda: soda};

        var reply = function(res, value) {
         expect(soda.vars.get('last')).toEqual('hi');
         expect(soda.vars.get('passfail')).toEqual(0);
         expect(soda.vars.get('response')).toEqual('who');

         done();
        };

        sandbox.restore();

        func.del({ post: "http://google.com", body: "body", headers: "headers", storeResponse: true }, reply, fakeScope);
    };

    var deleteAllCookies = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

        var sandbox = sinon.createSandbox();

        var fakeScope = { device: {
            deleteAllCookies: function(cb) {
              cb(null, true);
            }
          },
          soda: soda};

        var reply = function(res, value) {
         expect(res).toEqual(true);
         expect(value).toEqual('Should delete All Cookies in browser');

         done();
        };

        sandbox.restore();

        func.deleteAllCookies({ }, reply, fakeScope);
    };

    var assertError = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

        var reply = function(res, value) {
         expect(res).toEqual(true);
         expect(value).toEqual('This is an error');

         done();
        };

        func.assertError({ assert: { error: "err" }, is: { error: "err" }, error: "This is an error" }, reply, soda);
    };

    var assertErrorFail = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

        var reply = function(res, value) {
         expect(res).toEqual(false);
         expect(value).toEqual('This is an error');

         done();
        };

        func.assertError({ assert: { error: "err" }, is: { error: "error" }, error: "This is an error" }, reply, soda);
    };

    var clickOptions = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

        tree.update = function() { return tree; };

        var action = {
          click: "*[id='userName']",
          options: {},
          refresh: false
        };

        var run = new Run(soda);
        run.state = "running";

        var newTree = {
         tree: tree,
         run: run,
         elements: function() { return tree.elements(); },
         update: function() { return tree; },
         console: { debug: function(str) {
                     console.log(str);
                   },
                   log: function(str) {
                     console.log(str);
                   }
                 }
        };

        CoreSyntax.checkExistsAndIsSingleElement = function(actionName, e, selectorType, selector, scope, reply, complete) {
          complete([{rect: { origin: { x: 100, y: 100 } } }] );
        };

        CoreSyntax.performElementInteraction = function(name, e, reply, options, selector, refresh, scope, n, refreshTemp) {
          reply(true, "Should " + name + " `" + selector + "`");
        };

        var reply = function(res, value) {
         expect(res).toEqual(true);
         expect(value).toEqual("Should click `*[id='userName']`");

         done();
        };

        func.clickOptions(action, reply, newTree);
    };

    var click = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

        tree.update = function() { return tree; };

        var action = {
          click: "*[id='userName']",
          using: "selector",
          refresh: false
        };

        var run = new Run(soda);
        run.state = "running";

        var newTree = {
         tree: tree,
         run: run,
         elements: function() { return tree.elements(); },
         update: function() { return tree; },
         console: { debug: function(str) {
                     console.log(str);
                   },
                   log: function(str) {
                     console.log(str);
                   }
                 }
        };

        CoreSyntax.checkExistsAndIsSingleElement = function(actionName, e, selectorType, selector, scope, reply, complete) {
          complete([{rect: { origin: { x: 100, y: 100 } } }] );
        };

        CoreSyntax.performElementInteraction = function(name, e, reply, options, selector, refresh, scope, n, refreshTemp) {
          reply(true, "Should " + name + " `" + selector + "`");
        };

        var reply = function(res, value) {
         expect(res).toEqual(true);
         expect(value).toEqual("Should click `*[id='userName']`");

         done();
        };

        func.click(action, reply, newTree);
    };

    var clickUsingOptions = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

        tree.update = function() { return tree; };

        var action = {
          click: "*[id='userName']",
          using: "selector",
          options: {},
          refresh: false
        };

        var run = new Run(soda);
        run.state = "running";

        var newTree = {
         tree: tree,
         run: run,
         elements: function() { return tree.elements(); },
         update: function() { return tree; },
         console: { debug: function(str) {
                     console.log(str);
                   },
                   log: function(str) {
                     console.log(str);
                   }
                 }
        };

        CoreSyntax.checkExistsAndIsSingleElement = function(actionName, e, selectorType, selector, scope, reply, complete) {
          complete([{rect: { origin: { x: 100, y: 100 } } }] );
        };

        CoreSyntax.performElementInteraction = function(name, e, reply, options, selector, refresh, scope, n, refreshTemp) {
          reply(true, "Should " + name + " `" + selector + "`");
        };

        var reply = function(res, value) {
         expect(res).toEqual(true);
         expect(value).toEqual("Should click `*[id='userName']`");

         done();
        };

        func.clickUsingOptions(action, reply, newTree);
    };

    var clickUsing = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

        tree.update = function() { return tree; };

        var action = {
          click: "*[id='userName']",
          using: "selector",
          refresh: false
        };

        var run = new Run(soda);
        run.state = "running";

        var newTree = {
         tree: tree,
         run: run,
         elements: function() { return tree.elements(); },
         update: function() { return tree; },
         console: { debug: function(str) {
                     console.log(str);
                   },
                   log: function(str) {
                     console.log(str);
                   }
                 }
        };

        CoreSyntax.checkExistsAndIsSingleElement = function(actionName, e, selectorType, selector, scope, reply, complete) {
          complete([{rect: { origin: { x: 100, y: 100 } } }] );
        };

        CoreSyntax.performElementInteraction = function(name, e, reply, options, selector, refresh, scope, n, refreshTemp) {
          reply(true, "Should " + name + " `" + selector + "`");
        };

        var reply = function(res, value) {
         expect(res).toEqual(true);
         expect(value).toEqual("Should click `*[id='userName']`");

         done();
        };

        func.clickUsing(action, reply, newTree);
    };

    var clickAllOptions = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

        tree.update = function() { return tree; };

        var action = {
          clickAll: "*[type='button']",
          options: {},
          refresh: false
        };

        var run = new Run(soda);
        run.state = "running";

        var newTree = {
         tree: tree,
         run: run,
         elements: function() { return tree.elements(); },
         update: function() { return tree; },
         console: { debug: function(str) {
                     console.log(str);
                   },
                   log: function(str) {
                     console.log(str);
                   }
                 }
        };

        CoreSyntax.checkExistsAndIsSingleElement = function(actionName, e, selectorType, selector, scope, reply, complete) {
          complete([{rect: { origin: { x: 100, y: 100 } } }] );
        };

        CoreSyntax.performElementInteraction = function(name, e, reply, options, selector, refresh, scope, n, refreshTemp) {
          reply(true, "Should " + name + " `" + selector + "`");
        };

        var reply = function(res, value) {
         expect(res).toEqual(true);
         expect(value).toEqual("Should click `*[type='button']`");

         done();
        };

        func.clickAllOptions(action, reply, newTree);
    };

    var clickAll = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

        tree.update = function() { return tree; };

        var action = {
          clickAll: "*[type='button']",
          using: "selector",
          refresh: false
        };

        var run = new Run(soda);
        run.state = "running";

        var newTree = {
         tree: tree,
         run: run,
         elements: function() { return tree.elements(); },
         update: function() { return tree; },
         console: { debug: function(str) {
                     console.log(str);
                   },
                   log: function(str) {
                     console.log(str);
                   }
                 }
        };

        CoreSyntax.checkExistsAndIsSingleElement = function(actionName, e, selectorType, selector, scope, reply, complete) {
          complete([{rect: { origin: { x: 100, y: 100 } } }] );
        };

        CoreSyntax.performElementInteraction = function(name, e, reply, options, selector, refresh, scope, n, refreshTemp) {
          reply(true, "Should " + name + " `" + selector + "`");
        };

        var reply = function(res, value) {
         expect(res).toEqual(true);
         expect(value).toEqual("Should click `*[type='button']`");

         done();
        };

        func.clickAll(action, reply, newTree);
    };

    var clickAllUsing = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

        tree.update = function() { return tree; };

        var action = {
          clickAll: "*[type='button']",
          using: "selector",
          refresh: false
        };

        var run = new Run(soda);
        run.state = "running";

        var newTree = {
         tree: tree,
         run: run,
         elements: function() { return tree.elements(); },
         update: function() { return tree; },
         console: { debug: function(str) {
                     console.log(str);
                   },
                   log: function(str) {
                     console.log(str);
                   }
                 }
        };

        CoreSyntax.checkExistsAndIsSingleElement = function(actionName, e, selectorType, selector, scope, reply, complete) {
          complete([{rect: { origin: { x: 100, y: 100 } } }] );
        };

        CoreSyntax.performElementInteraction = function(name, e, reply, options, selector, refresh, scope, n, refreshTemp) {
          reply(true, "Should " + name + " `" + selector + "`");
        };

        var reply = function(res, value) {
         expect(res).toEqual(true);
         expect(value).toEqual("Should click `*[type='button']`");

         done();
        };

        func.clickAllUsingOptions(action, reply, newTree);
    };

    var clickAllUsingOptions = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

        tree.update = function() { return tree; };

        var action = {
          clickAll: "*[type='button']",
          using: "selector",
          refresh: false
        };

        var run = new Run(soda);
        run.state = "running";

        var newTree = {
         tree: tree,
         run: run,
         elements: function() { return tree.elements(); },
         update: function() { return tree; },
         console: { debug: function(str) {
                     console.log(str);
                   },
                   log: function(str) {
                     console.log(str);
                   }
                 }
        };

        CoreSyntax.checkExistsAndIsSingleElement = function(actionName, e, selectorType, selector, scope, reply, complete) {
          complete([{rect: { origin: { x: 100, y: 100 } } }] );
        };

        CoreSyntax.performElementInteraction = function(name, e, reply, options, selector, refresh, scope, n, refreshTemp) {
          reply(true, "Should " + name + " `" + selector + "`");
        };

        var reply = function(res, value) {
         expect(res).toEqual(true);
         expect(value).toEqual("Should click `*[type='button']`");

         done();
        };

        func.clickAllUsing(action, reply, newTree);
    };

    var clickIfExists = function(name, version, done) {
      var func = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'function.js'));

      tree.update = function() { return tree; };

      var action = {
        clickIfExists: "*[id='textfield:1']",
        tapXY: [100, 100],
        options: {},
        refresh: true
      };

      var run = new Run(soda);
      run.state = "running";

      var newTree = {
       tree: tree,
       run: run,
       elements: function() { return tree.elements(); },
       update: function() { return tree; },
       console: { debug: function(str) {
                   console.log(str);
                 },
                 log: function(str) {
                   console.log(str);
                 }
               }
      };

      CoreSyntax.checkUsing = function(elements, using, reply) {
        return true;
      };

      CoreSyntax.performElementInteraction = function(name, e, reply, options, selector, refresh, scope, n, refreshTemp) {
        reply(true, "Should " + name + " `" + selector + "`");
      };

      var reply = function(res, value) {
       expect(res).toEqual(true);
       expect(value).toEqual("Should click `*[id='textfield:1']`");

       done();
      };

       func.clickIfExists(action, reply, newTree);
    };

    it('Should validate function resetAppData for mobile 2.0 syntax', function (done) {
      var name = 'mobile';
      var version = '2.0';

      validateResetData(name, version, done);
    });

    it('Should validate function resetAppData for perfecto 2.0 syntax', function (done) {
      var name = 'perfecto';
      var version = '2.0';

      validateResetData(name, version, done);
    });

    it('Should validate function hideAppFor for mobile 2.0 syntax', function (done) {
      var name = 'mobile';
      var version = '2.0';

      hideAppFor(name, version, done);
    });

    it('Should validate function hideAppFor for perfecto 2.0 syntax', function (done) {
      var name = 'perfecto';
      var version = '2.0';

      hideAppFor(name, version, done);
    });

    it('Should validate function typeOnKeyboard for mobile 2.0 syntax', function (done) {
      var name = 'mobile';
      var version = '2.0';

      typeOnKeyboard(name, version, done);
    });

    it('Should validate function typeOnKeyboard for perfecto 2.0 syntax', function (done) {
      var name = 'perfecto';
      var version = '2.0';

      typeOnKeyboard(name, version, done);
    });

    it('Should validate function back for mobile 2.0 syntax', function (done) {
      var name = 'mobile';
      var version = '2.0';

      back(name, version, done);
    });

    it('Should validate function back for perfecto 2.0 syntax', function (done) {
      var name = 'perfecto';
      var version = '2.0';

      back(name, version, done);
    });

    it('Should validate function startApp for mobile 2.0 syntax', function (done) {
      var name = 'mobile';
      var version = '2.0';

      startApp(name, version, done);
    });

    it('Should validate function startApp for perfecto 2.0 syntax', function (done) {
      var name = 'perfecto';
      var version = '2.0';

      startApp(name, version, done);
    });

    it('Should validate function startApp for windows 1.0 syntax', function (done) {
      var name = 'windows';
      var version = '1.0';

      startApp(name, version, done);
    });

    it('Should validate function startAppAndWait for mobile 2.0 syntax', function (done) {
      var name = 'mobile';
      var version = '2.0';

      startAppAndWait(name, version, done);
    });

    it('Should validate function startAppAndWait for perfecto 2.0 syntax', function (done) {
      var name = 'perfecto';
      var version = '2.0';

      startAppAndWait(name, version, done);
    });

    it('Should validate function startAppAndWait for windows 1.0 syntax', function (done) {
      var name = 'windows';
      var version = '1.0';

      startAppAndWait(name, version, done);
    });

    it('Should validate function stopApp for mobile 2.0 syntax', function (done) {
      var name = 'mobile';
      var version = '2.0';

      stopApp(name, version, done);
    });

    it('Should validate function stopApp for perfecto 2.0 syntax', function (done) {
      var name = 'perfecto';
      var version = '2.0';

      stopApp(name, version, done);
    });

    it('Should validate function openApp for mobile 2.0 syntax', function (done) {
      var name = 'mobile';
      var version = '2.0';

      openApp(name, version, done);
    });

    it('Should validate function openApp for perfecto 2.0 syntax', function (done) {
      var name = 'perfecto';
      var version = '2.0';

      openApp(name, version, done);
    });

    it('Should validate function closeApp for mobile 2.0 syntax', function (done) {
      var name = 'mobile';
      var version = '2.0';

      closeApp(name, version, done);
    });

    it('Should validate function closeApp for perfecto 2.0 syntax', function (done) {
      var name = 'perfecto';
      var version = '2.0';

      closeApp(name, version, done);
    });

    it('Should validate function rotateDevice for mobile 2.0 syntax', function (done) {
      var name = 'mobile';
      var version = '2.0';

      rotateDevice(name, version, done);
    });

    it('Should validate function rotateDevice for perfecto 2.0 syntax', function (done) {
      var name = 'perfecto';
      var version = '2.0';

      rotateDevice(name, version, done);
    });

    it('Should validate function sendKeyCommand for mobile 2.0 syntax', function (done) {
      var name = 'mobile';
      var version = '2.0';

      sendKeyCommand(name, version, done);
    });

    it('Should validate function sendKeyCommand for perfecto 2.0 syntax', function (done) {
      var name = 'perfecto';
      var version = '2.0';

      sendKeyCommand(name, version, done);
    });

    it('Should validate function homeScreen for mobile 2.0 syntax', function (done) {
      var name = 'mobile';
      var version = '2.0';

      homeScreen(name, version, done);
    });

    it('Should validate function homeScreen for perfecto 2.0 syntax', function (done) {
      var name = 'perfecto';
      var version = '2.0';

      homeScreen(name, version, done);
    });

    it('Should validate function lockScreen for mobile 2.0 syntax', function (done) {
      var name = 'mobile';
      var version = '2.0';

      lockScreen(name, version, done);
    });

    it('Should validate function lockScreen for perfecto 2.0 syntax', function (done) {
      var name = 'perfecto';
      var version = '2.0';

      lockScreen(name, version, done);
    });

    it('Should validate function deviceSwipeUp for mobile 2.0 syntax', function (done) {
      var name = 'mobile';
      var version = '2.0';

      deviceSwipeUp(name, version, done);
    });

    it('Should validate function deviceSwipeUp for perfecto 2.0 syntax', function (done) {
      var name = 'perfecto';
      var version = '2.0';

      deviceSwipeUp(name, version, done);
    });

    it('Should validate function deviceSwipeDown for mobile 2.0 syntax', function (done) {
      var name = 'mobile';
      var version = '2.0';

      deviceSwipeDown(name, version, done);
    });

    it('Should validate function deviceSwipeDown for perfecto 2.0 syntax', function (done) {
      var name = 'perfecto';
      var version = '2.0';

      deviceSwipeDown(name, version, done);
    });

    it('Should validate function deviceSwipeLeft for mobile 2.0 syntax', function (done) {
      var name = 'mobile';
      var version = '2.0';

      deviceSwipeLeft(name, version, done);
    });

    it('Should validate function deviceSwipeLeft for perfecto 2.0 syntax', function (done) {
      var name = 'perfecto';
      var version = '2.0';

      deviceSwipeLeft(name, version, done);
    });

    it('Should validate function deviceSwipeRight for mobile 2.0 syntax', function (done) {
      var name = 'mobile';
      var version = '2.0';

      deviceSwipeRight(name, version, done);
    });

    it('Should validate function deviceSwipeRight for perfecto 2.0 syntax', function (done) {
      var name = 'perfecto';
      var version = '2.0';

      deviceSwipeRight(name, version, done);
    });

    it('Should validate function deviceSwipe for mobile 2.0 syntax', function (done) {
      var name = 'mobile';
      var version = '2.0';

      deviceSwipe(name, version, done);
    });

    it('Should validate function deviceSwipe for perfecto 2.0 syntax', function (done) {
      var name = 'perfecto';
      var version = '2.0';

      deviceSwipe(name, version, done);
    });

    it('Should validate function scrollToVisibleText for mobile 2.0 syntax', function (done) {
      var name = 'mobile';
      var version = '2.0';

      scrollToVisibleText(name, version, done);
    });

    it('Should validate function scrollToVisibleText no parent for mobile 2.0 syntax', function (done) {
      var name = 'mobile';
      var version = '2.0';

      scrollToVisibleTextNoParent(name, version, done);
    });

    it('Should validate function scrollToVisibleText for perfecto 2.0 syntax', function (done) {
      var name = 'perfecto';
      var version = '2.0';

      scrollToVisibleTextPerfecto(name, version, done);
    });

    it('Should validate function scrollToVisible for mobile 2.0 syntax', function (done) {
      var name = 'mobile';
      var version = '2.0';

      scrollToVisible(name, version, done);
    });

    it('Should validate function scrollToVisible no parent for mobile 2.0 syntax', function (done) {
      var name = 'mobile';
      var version = '2.0';

      scrollToVisibleNoParent(name, version, done);
    });

    it('Should validate function scrollToVisible for perfecto 2.0 syntax', function (done) {
      var name = 'perfecto';
      var version = '2.0';

      scrollToVisiblePerfecto(name, version, done);
    });

    it('Should validate function scrollToTop for mobile 2.0 syntax', function (done) {
      var name = 'mobile';
      var version = '2.0';

      scrollToTop("automator", "android", name, version, done);
    });

    it('Should validate function scrollToTop for perfecto 2.0 syntax', function (done) {
      var name = 'perfecto';
      var version = '2.0';

      scrollToTop("perfecto", "android", name, version, done);
    });

    it('Should validate function scrollToBottom for mobile 2.0 syntax', function (done) {
      var name = 'mobile';
      var version = '2.0';

      scrollToBottom("automator", "android", name, version, done);
    });

    it('Should validate function scrollToBottom for perfecto 2.0 syntax', function (done) {
      var name = 'perfecto';
      var version = '2.0';

      scrollToBottom("perfecto", "android", name, version, done);
    });

    it('Should validate function swipeOptions for mobile 2.0 syntax', function (done) {
      var name = 'mobile';
      var version = '2.0';

      swipeOptions(name, version, done);
    });

    it('Should validate function swipeOptions for perfecto 2.0 syntax', function (done) {
      var name = 'perfecto';
      var version = '2.0';

      swipeOptions(name, version, done);
    });

    it('Should validate function swipe for mobile 2.0 syntax', function (done) {
      var name = 'mobile';
      var version = '2.0';

      swipe(name, version, done);
    });

    it('Should validate function swipeUsingOptions for mobile 2.0 syntax', function (done) {
      var name = 'mobile';
      var version = '2.0';

      swipeUsingOptions(name, version, done);
    });

    it('Should validate function swipeUsingOptions for perfecto 2.0 syntax', function (done) {
      var name = 'perfecto';
      var version = '2.0';

      swipeUsingOptions(name, version, done);
    });

    it('Should validate function swipeUsing for mobile 2.0 syntax', function (done) {
      var name = 'mobile';
      var version = '2.0';

      swipeUsingOptions(name, version, done);
    });

    it('Should validate function swipeUsing for perfecto 2.0 syntax', function (done) {
      var name = 'perfecto';
      var version = '2.0';

      swipeUsingOptions(name, version, done);
    });

    it('Should validate function tapOptions for mobile 2.0 syntax', function (done) {
      var name = 'mobile';
      var version = '2.0';

      tapOptions(name, version, done);
    });

    it('Should validate function tapOptions for perfecto 2.0 syntax', function (done) {
      var name = 'perfecto';
      var version = '2.0';

      tapOptions(name, version, done);
    });

    it('Should validate function tapIfExists for mobile 2.0 syntax', function (done) {
      var name = 'mobile';
      var version = '2.0';

      tapIfExists(name, version, done);
    });

    it('Should validate function tapIfExists for perfecto 2.0 syntax', function (done) {
      var name = 'perfecto';
      var version = '2.0';

      tapIfExists(name, version, done);
    });

    it('Should validate function tapAllOptions for mobile 2.0 syntax', function (done) {
      var name = 'mobile';
      var version = '2.0';

      tapAllOptions(name, version, done);
    });

    it('Should validate function tapAllOptions for perfecto 2.0 syntax', function (done) {
      var name = 'perfecto';
      var version = '2.0';

      tapAllOptions(name, version, done);
    });

    it('Should validate function tapXY for mobile 2.0 syntax', function (done) {
      var name = 'mobile';
      var version = '2.0';

      tapXY(name, version, done);
    });

    it('Should validate function tapXY for perfecto 2.0 syntax', function (done) {
      var name = 'perfecto';
      var version = '2.0';

      tapXY(name, version, done);
    });

    it('Should validate function tapXYRelativeTo for mobile 2.0 syntax', function (done) {
      var name = 'mobile';
      var version = '2.0';

      tapXYRelativeTo(name, version, done);
    });

    it('Should validate function tapXYRelativeTo for perfecto 2.0 syntax', function (done) {
      var name = 'perfecto';
      var version = '2.0';

      tapXYRelativeTo(name, version, done);
    });

    it('Should validate function tapUsingOptions for mobile 2.0 syntax', function (done) {
      var name = 'mobile';
      var version = '2.0';

      tapUsingOptions(name, version, done);
    });

    it('Should validate function tapUsingOptions for perfecto 2.0 syntax', function (done) {
      var name = 'perfecto';
      var version = '2.0';

      tapUsingOptions(name, version, done);
    });

    it('Should validate function tapUsing for mobile 2.0 syntax', function (done) {
      var name = 'mobile';
      var version = '2.0';

      tapUsing(name, version, done);
    });

    it('Should validate function tapUsing for perfecto 2.0 syntax', function (done) {
      var name = 'perfecto';
      var version = '2.0';

      tapUsing(name, version, done);
    });

    it('Should validate function parseJSON for rest 1.0 syntax', function (done) {
      var name = 'rest';
      var version = '1.0';

      parseJSON(name, version, done);
    });

    it('Should validate function stringifyJSON for perfecto 1.0 syntax', function (done) {
      var name = 'rest';
      var version = '1.0';

      stringifyJSON(name, version, done);
    });

    it('Should validate function getip for perfecto 1.0 syntax', function (done) {
      var name = 'rest';
      var version = '1.0';

      getip(name, version, done);
    });

    it('Should validate function getipStoreIn for perfecto 1.0 syntax', function (done) {
      var name = 'rest';
      var version = '1.0';

      getipStoreIn(name, version, done);
    });

    it('Should validate function post for perfecto 1.0 syntax', function (done) {
      var name = 'rest';
      var version = '1.0';

      post(name, version, done);
    });

    it('Should validate function get for perfecto 1.0 syntax', function (done) {
      var name = 'rest';
      var version = '1.0';

      get(name, version, done);
    });

    it('Should validate function del for perfecto 1.0 syntax', function (done) {
      var name = 'rest';
      var version = '1.0';

      del(name, version, done);
    });

    it('Should validate function deleteAllCookies for perfecto 1.0 syntax', function (done) {
      var name = 'rest';
      var version = '1.0';

      deleteAllCookies(name, version, done);
    });

    it('Should validate function assertError with a success for perfecto 1.0 syntax', function (done) {
      var name = 'rest';
      var version = '1.0';

      assertError(name, version, done);
    });

    it('Should validate function assertError with a failure for perfecto 1.0 syntax', function (done) {
      var name = 'rest';
      var version = '1.0';

      assertErrorFail(name, version, done);
    });

    it('Should validate function clickOptions for windows 1.0 syntax', function (done) {
      var name = 'windows';
      var version = '1.0';

      clickOptions(name, version, done);
    });

    it('Should validate function click for windows 1.0 syntax', function (done) {
      var name = 'windows';
      var version = '1.0';

      click(name, version, done);
    });

    it('Should validate function clickUsingOptions for windows 1.0 syntax', function (done) {
      var name = 'windows';
      var version = '1.0';

      clickUsingOptions(name, version, done);
    });

    it('Should validate function clickUsing for windows 1.0 syntax', function (done) {
      var name = 'windows';
      var version = '1.0';

      clickUsing(name, version, done);
    });

    it('Should validate function clickAllOptions for windows 1.0 syntax', function (done) {
      var name = 'windows';
      var version = '1.0';

      clickAllOptions(name, version, done);
    });

    it('Should validate function clickAll for windows 1.0 syntax', function (done) {
      var name = 'windows';
      var version = '1.0';

      clickAll(name, version, done);
    });

    it('Should validate function clickAllUsingOptions for windows 1.0 syntax', function (done) {
      var name = 'windows';
      var version = '1.0';

      clickAllUsingOptions(name, version, done);
    });

    it('Should validate function clickAllUsing for windows 1.0 syntax', function (done) {
      var name = 'windows';
      var version = '1.0';

      clickAllUsing(name, version, done);
    });

    it('Should validate function clickIfExists for windows 1.0 syntax', function (done) {
      var name = 'windows';
      var version = '1.0';

      clickIfExists(name, version, done);
    });
});
