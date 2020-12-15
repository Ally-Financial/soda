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

 /* jshint ignore:start */

"use strict";

var sinon = require('sinon'),
    path   = require("path"),
    Soda   = require(path.join(__dirname, "..", "SodaCore", "lib", "Soda")),
    Framework   = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "Framework")),
    fs     = require("fs");

require(path.join(__dirname, "..", "SodaCommon", "ProtoLib"));

describe('Core Framework should pass all validation tests', function () {
  var soda, action, savedMethod1, savedMethod2, savedMethod3, spy, spy1, spy2;

    beforeAll(function (done) {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 300000;

      savedMethod1 = fs.access;
      savedMethod2 = fs.writeFile;
      savedMethod3 = console.log;

      soda = new Soda({ testPath: path.join(__dirname, '..', 'sample_project'), logSupressed: true });

      soda.init(function() {
        soda.config.set("headless", true, true, true);
        
        done();
      });
    });

    beforeEach(function() {
      spy = sinon.spy(fs, "access");
      spy1 = sinon.spy(fs, "writeFile");
      spy2 = sinon.spy(console, 'log');
    });
  
    afterEach(function() {
      spy.restore();
      spy1.restore();
      spy2.restore();
    });

    afterAll(function (done) {
      fs.access = savedMethod1;
      fs.writeFile = savedMethod2;
      console.log = savedMethod3;

      soda.kill();

      soda = null;

      done();
    });

    it('Should validate an empty framework', function (done) {
      var framework = new Framework(soda);

      expect(framework.name).toEqual(null);
      expect(framework.version).toEqual(null);
      expect(framework.platform).toEqual(null);
      expect(framework.args).toEqual(null);
      expect(framework.started).toEqual(false);
      expect(framework.device).toEqual(null);
      expect(framework.process).toEqual(null);
      expect(framework.defaultSyntaxName).toEqual(null);

      framework.getOrientation(function(err, res) {
        expect(err.name).toEqual('InvalidFrameworkError');
        expect(err.message).toEqual('No framework loaded.');

        framework.getScreenBounds(function(err, res) {
          expect(err.name).toEqual('InvalidFrameworkError');
          expect(err.message).toEqual('No framework loaded.');

          framework.getTree(function(err, res) {
            expect(err.name).toEqual('InvalidFrameworkError');
            expect(err.message).toEqual('No framework loaded.');

            framework.performElementInteraction(function(err, res) {
              expect(err.name).toEqual('InvalidFrameworkError');
              expect(err.message).toEqual('No framework loaded.');

              framework.performDeviceInteraction(function(err, res) {
                expect(err.name).toEqual('InvalidFrameworkError');
                expect(err.message).toEqual('No framework loaded.');

                  framework.start(function(err, res) {
                    expect(err.name).toEqual('InvalidFrameworkError');
                    expect(err.message).toEqual('No framework loaded.');

                      framework.stop(function(err, res) {
                        expect(err.name).toEqual('InvalidFrameworkError');
                        expect(err.message).toEqual('No framework loaded.');

                          framework.restart(function(err, res) {
                            expect(err.name).toEqual('InvalidFrameworkError');
                            expect(err.message).toEqual('No framework loaded.');

                            framework.build(function(err, res) {
                              expect(err.name).toEqual('InvalidFrameworkError');
                              expect(err.message).toEqual('No framework loaded.');

                              framework.upload(function(err, res) {
                                expect(err.name).toEqual('InvalidFrameworkError');
                                expect(err.message).toEqual('No framework loaded.');

                                framework.reset(function(err, res) {
                                  expect(err.name).toEqual('InvalidFrameworkError');
                                  expect(err.message).toEqual('No framework loaded.');

                                  framework.stop(function () {
                                    done();
                                  });
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
    });

    it('Should validate a valid selenium framework', function (done) {
      var framework = new Framework(soda);
      framework.load('selenium');

      expect(framework.name).toEqual('Selenium');
      expect(framework.version).toEqual('1.0');
      expect(framework.platform).toEqual('Web');
      expect(framework.args).toEqual(undefined);
      expect(framework.started).toEqual(false);
      expect(framework.device).toEqual(undefined);
      expect(framework.process).toEqual(undefined);
      expect(framework.defaultSyntaxName).toEqual('web');

      framework.start(function(err, res) {
        expect(err).toEqual(null);
        expect(res).toEqual(true);

        framework.getOrientation(function(err, orientation) {
          expect(err).toEqual(null);
          expect(orientation).toEqual(1);

          framework.getScreenBounds(function(err, bounds) {
            expect(err).toEqual(null);
            expect(bounds.sodamembers).toEqual(2);

            framework.getTree(function(err, tree) {
              expect(err).toEqual(null);
              expect(tree.hash).toBeInstanceOf(String);

              framework.performElementInteraction("click", [{ id: "gb" }], {}, function(err, res) {
                expect(err).toEqual(null);
                expect(res).toEqual(true);

                framework.performDeviceInteraction("reload", {}, function (err, res) {
                  expect(err).toEqual(null);
                  expect(res).toEqual(true);

                  framework.reset(function(err, res) {
                    expect(err).toEqual(null);
                    expect(res).toEqual(true);

                    framework.stop(function (err, res) {
                      expect(err).toEqual(null);
                      expect(res).toEqual(true);

                      done();
                    });
                  });
                });
              });
            });
          });
        });
      });
    });

    it('Should validate all Element interactions on the selenium framework', function (done) {
      var framework = new Framework(soda);
      framework.load('selenium');

      expect(framework.name).toEqual('Selenium');
      expect(framework.version).toEqual('1.0');
      expect(framework.platform).toEqual('Web');
      expect(framework.args).toEqual(undefined);
      expect(framework.started).toEqual(false);
      expect(framework.device).toEqual(undefined);
      expect(framework.process).toEqual(undefined);
      expect(framework.defaultSyntaxName).toEqual('web');

      framework.start(function(err, res) {
        expect(err).toEqual(null);
        expect(res).toEqual(true);

        framework.getOrientation(function(err, orientation) {
          expect(err).toEqual(null);
          expect(orientation).toEqual(1);

          framework.getScreenBounds(function(err, bounds) {
            expect(err).toEqual(null);
            expect(bounds.sodamembers).toEqual(2);

            framework.getTree(function(err, tree) {
              expect(err).toEqual(null);
              expect(tree.hash).toBeInstanceOf(String);

              framework.performDeviceInteraction("goto", { url: "http://secure.ally.com"}, function (err, res) {
                expect(err).toEqual(null);
                expect(res).toEqual(true);

                setTimeout(function () {
                  framework.performElementInteraction("click", [{ id: "login-username" }], {}, function(err, res) {
                    expect(err).toEqual(null);
                    expect(res).toEqual(true);

                    framework.performElementInteraction("setValue", [{ id: "login-username" }], { value: 'hi'}, function(err, res) {
                      expect(err).toEqual(null);
                      expect(res).toEqual(true);

                      framework.performElementInteraction("scrollToVisible", [{ id: "login-username" }], {}, function(err, res) {
                        expect(err).toEqual(null);
                        expect(res).toEqual(true);

                        framework.performElementInteraction("tap", [{ id: "login-username" }], {}, function(err, res) {
                          expect(err).toEqual(null);
                          expect(res).toEqual(true);

                          framework.stop(function (err, res) {
                            expect(err).toEqual(null);
                            expect(res).toEqual(true);

                            done();
                          });
                        });
                      });
                    });
                  });
                }, 10000);
              });
            });
          });
        });
      });
    });

    it('Should validate all Device interactions on the selenium framework for core', function (done) {
      soda.config.set("perflog", true);

      var framework = new Framework(soda);
      framework.load('selenium');

      expect(framework.name).toEqual('Selenium');
      expect(framework.version).toEqual('1.0');
      expect(framework.platform).toEqual('Web');
      expect(framework.args).toEqual(undefined);
      expect(framework.started).toEqual(false);
      expect(framework.device).toEqual(undefined);
      expect(framework.process).toEqual(undefined);
      expect(framework.defaultSyntaxName).toEqual('web');

      framework.start(function(err, res) {
        expect(err).toEqual(null);
        expect(res).toEqual(true);

        framework.getOrientation(function(err, orientation) {
          expect(err).toEqual(null);
          expect(orientation).toEqual(1);

          framework.getScreenBounds(function(err, bounds) {
            expect(err).toEqual(null);
            expect(bounds.sodamembers).toEqual(2);

            framework.getTree(function(err, tree) {
              expect(err).toEqual(null);
              expect(tree.hash).toBeInstanceOf(String);

              framework.performDeviceInteraction("goto", { url: "https://www.google.com/"}, function (err, res) {
                expect(err).toEqual(null);
                expect(res).toEqual(true);

                framework.performDeviceInteraction("getVariable", { variableName: "location.href", storeIn: "href"}, function (err, res) {
                  expect(err).toEqual(null);
                  expect(res).toEqual("https://www.google.com/");
                  expect(soda.vars.get('href')).toEqual('https://www.google.com/');

                  framework.performDeviceInteraction("captureScreen", {}, function (err, res) {
                    expect(err).toEqual(null);
                    expect(res).toEqual(true);

                    sinon.assert.called(spy);
                    sinon.assert.called(spy1);

                    framework.performDeviceInteraction("goto", { url: "https://www.apple.com/"}, function (err, res) {
                      expect(err).toEqual(null);
                      expect(res).toEqual(true);

                      framework.performDeviceInteraction("getVariable", { variableName: "location.href", storeIn: "href"}, function (err, res) {
                        expect(err).toEqual(null);
                        expect(res).toEqual("https://www.apple.com/");
                        expect(soda.vars.get('href')).toEqual('https://www.apple.com/');

                        framework.performDeviceInteraction("back", {}, function (err, res) {
                          expect(err).toEqual(null);
                          expect(res).toEqual(true);

                          framework.performDeviceInteraction("getVariable", { variableName: "location.href", storeIn: "href"}, function (err, res) {
                            expect(err).toEqual(null);
                            expect(res).toEqual("https://www.google.com/");
                            expect(soda.vars.get('href')).toEqual('https://www.google.com/');

                            framework.performDeviceInteraction("forward", {}, function (err, res) {
                              expect(err).toEqual(null);
                              expect(res).toEqual(true);

                              framework.performDeviceInteraction("getVariable", { variableName: "location.href", storeIn: "href"}, function (err, res) {
                                expect(err).toEqual(null);
                                expect(res).toEqual("https://www.apple.com/");
                                expect(soda.vars.get('href')).toEqual('https://www.apple.com/');

                                framework.performDeviceInteraction("captureHeader", {"name": "s_cc"}, function (err, res) {
                                  expect(err).toEqual(null);
                                  expect(res).toEqual('true');

                                  framework.performDeviceInteraction("deleteAllCookies", {}, function (err, res) {
                                    expect(err).toEqual(null);
                                    expect(res).toEqual(null);

                                    framework.performDeviceInteraction("captureHeader", {"name": "s_cc"}, function (err, res) {
                                      expect(err).toEqual(null);
                                      expect(res).toEqual('true');

                                      framework.performDeviceInteraction("goto", { url: "https://www.w3schools.com/tags/tryit.asp?filename=tryhtml_iframe_name"}, function (err, res) {
                                        expect(err).toEqual(null);
                                        expect(res).toEqual(true);

                                        framework.performDeviceInteraction("switchToFrame", { element: "iframeResult"}, function (err, res) {
                                          expect(err).toEqual(null);
                                          expect(res).toEqual(true);

                                          framework.performDeviceInteraction("maximizeWindow", {}, function (err, res) {
                                            expect(err).toEqual(null);
                                            expect(res).toEqual(true);

                                            framework.performDeviceInteraction("resizeWindow", {frame: '100, 100'}, function (err, res) {
                                              expect(err).toEqual(null);
                                              expect(res).toEqual(true);
                                                framework.performDeviceInteraction("executeScript", {executeScript: "return document.title;"}, function (err, res) {
                                                  expect(err).toEqual(null);
                                                  expect(res).toEqual(true);

                                                  framework.performDeviceInteraction("executeScriptWithString", { withString: "return window.location.href;", storeIn: "docTitle" }, function(err, res) {
                                                    expect(err).toEqual(null);
                                                    expect(res).toEqual(true);
                                                    expect(soda.vars.get("docTitle")).toEqual('https://www.w3schools.com/tags/tryit.asp?filename=tryhtml_iframe_name');

                                                    framework.performDeviceInteraction("close", {}, function (err, res) {
                                                      expect(err).toEqual(null);
                                                      expect(res).toEqual(true);

                                                      framework.stop(function () {
                                                        done();
                                                      });
                                                    });
                                                  });
                                                });
                                            });
                                          });
                                        });
                                      });
                                    });
                                  });
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
});
