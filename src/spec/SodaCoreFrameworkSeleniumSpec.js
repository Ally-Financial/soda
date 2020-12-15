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
    fs     = require("fs"),
    Soda   = require(path.join(__dirname, "..", "SodaCore", "lib", "Soda"));

require(path.join(__dirname, "..", "SodaCommon", "ProtoLib"));

Object.freeze = function(obj) { return obj; };

describe('Framework selenium should pass all validation tests', function () {
  var soda, seleniumFramework, settings, buildTree, seleniumControl, savedMethod1, savedMethod2, savedMethod3, spy, spy1, spy2;

    beforeAll(function (done) {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 200000;

      savedMethod1 = fs.access;
      savedMethod2 = fs.writeFile;
      savedMethod3 = console.log;

      soda = new Soda({ testPath: path.join(__dirname, '..', 'sample_project'), logSupressed: false });

      soda.init(function() {
        soda.config.set("headless", true, true, true);
        
          seleniumFramework = require(path.join(__dirname, "..", "SodaCore", "frameworks", "selenium"))(soda);
          soda.framework = seleniumFramework;
          settings  = require(path.join(__dirname, "..", "SodaCore", "frameworks", "selenium", "imports", "Config.js"))(soda);
          seleniumControl  = new (require(path.join(__dirname, "..", "SodaCore", "frameworks", "selenium", "imports", "Driver.js")))(soda);

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

    it('Should validate selenium', function (done) {
      expect(seleniumFramework.name).toEqual('Selenium');
      expect(seleniumFramework.platform).toEqual('Web');
      expect(seleniumFramework.version).toEqual('1.0');
      expect(seleniumFramework.defaultSyntaxVersion).toEqual('1.0');
      expect(seleniumFramework.defaultSyntaxName).toEqual('web');

      done();
    });

    it('Should start for selenium', function (done) {
      seleniumFramework.start("chrome", "about:blank", {}, function(err) {
        expect(err).toEqual(null);

        done();
      });
    });
    
    it('Should not build for selenium', function (done) {
      seleniumFramework.build(function(err, result) {
        expect(err).toBeInstanceOf(Error);
        expect(result).toEqual(null);

        done();
      });
    });

    it('Should listAvailableDevices for selenium', function (done) {
      seleniumFramework.listAvailableDevices(function(result) {
        expect(result).toBeInstanceOf(Array);

        done();
      });
    });

    it('Should captureScreen for selenium', function (done) {
      seleniumFramework.performDeviceInteraction("captureScreen", {}, function (err, res) {
        expect(err).toEqual(null);
        expect(res).toEqual(true);

        done();
      });
    });

    it('Should getScreenBounds for selenium', function (done) {
      seleniumFramework.getScreenBounds(function(err, bounds) {
        expect(err).toEqual(null);
        expect(bounds.sodamembers).toEqual(2);

        done();
      });
    });

    it('Should getOrientation for selenium', function (done) {
      seleniumFramework.getOrientation(function(err, result) {
        expect(err).toEqual(null);
        expect(result).toEqual(1);

        done();
      });
    });

    it('Should perform all element interactions', function (done) {
      seleniumFramework.performDeviceInteraction("goto", { url: "https://secure.ally.com"}, function (err, res) {
        expect(err).toEqual(null);
        expect(res).toEqual(true);

        setTimeout(function () {
          seleniumFramework.performElementInteraction("setValue", [{ id: "login-username" }], { value: 'hi'}, function(err, res) {
            expect(err).toEqual(null);
            expect(res).toEqual(true);
  
            seleniumFramework.performElementInteraction("click", [{ id: "login-username" }], {}, function(err, res) {
              expect(err).toEqual(null);
              expect(res).toEqual(true);
  
              seleniumFramework.performElementInteraction("scrollToVisible", [{ id: "login-username" }], {}, function(err, res) {
                expect(err).toEqual(null);
                expect(res).toEqual(true);
  
                done();
              });
            });
          });
        }, 10000);
      });
    });

    it('Should validate all Device interactions on Selenium', function (done) {
      seleniumFramework.performDeviceInteraction("goto", { url: "http://secure.ally.com/"}, function (err, res) {
        expect(err).toEqual(null);
        expect(res).toEqual(true);

        seleniumFramework.getOrientation(function(err, orientation) {
          expect(err).toEqual(null);
          expect(orientation).toEqual(1);

          seleniumFramework.getScreenBounds(function(err, bounds) {
            expect(err).toEqual(null);
            expect(bounds.sodamembers).toEqual(2);

            seleniumFramework.getTree({}, function(tree) {
              expect(tree).toEqual(null);

              seleniumFramework.performDeviceInteraction("goto", { url: "https://www.google.com/"}, function (err, res) {
                expect(err).toEqual(null);
                expect(res).toEqual(true);

                seleniumFramework.performDeviceInteraction("getVariable", { variableName: "location.href", storeIn: "href"}, function (err, res) {
                  expect(err).toEqual(null);
                  expect(res).toEqual("https://www.google.com/");
                  expect(soda.vars.get('href')).toEqual('https://www.google.com/');

                  seleniumFramework.performDeviceInteraction("captureScreen", {}, function (err, res) {
                    expect(err).toEqual(null);
                    expect(res).toEqual(true);

                    sinon.assert.called(spy);
                    sinon.assert.called(spy1);

                    seleniumFramework.performDeviceInteraction("goto", { url: "https://www.apple.com/"}, function (err, res) {
                      expect(err).toEqual(null);
                      expect(res).toEqual(true);

                      seleniumFramework.performDeviceInteraction("getVariable", { variableName: "location.href", storeIn: "href"}, function (err, res) {
                        expect(err).toEqual(null);
                        expect(res).toEqual("https://www.apple.com/");
                        expect(soda.vars.get('href')).toEqual('https://www.apple.com/');

                        seleniumFramework.performDeviceInteraction("back", {}, function (err, res) {
                          expect(err).toEqual(null);
                          expect(res).toEqual(true);

                          seleniumFramework.performDeviceInteraction("getVariable", { variableName: "location.href", storeIn: "href"}, function (err, res) {
                            expect(err).toEqual(null);
                            expect(res).toEqual("https://www.google.com/");
                            expect(soda.vars.get('href')).toEqual('https://www.google.com/');

                            seleniumFramework.performDeviceInteraction("forward", {}, function (err, res) {
                              expect(err).toEqual(null);
                              expect(res).toEqual(true);

                              seleniumFramework.performDeviceInteraction("getVariable", { variableName: "location.href", storeIn: "href"}, function (err, res) {
                                expect(err).toEqual(null);
                                expect(res).toEqual("https://www.apple.com/");
                                expect(soda.vars.get('href')).toEqual('https://www.apple.com/');

                                seleniumFramework.performDeviceInteraction("captureHeader", {"name": "s_cc"}, function (err, res) {
                                  expect(err).toEqual(null);
                                  expect(res).toEqual('true');

                                  seleniumFramework.performDeviceInteraction("goto", { url: "https://www.w3schools.com/tags/tryit.asp?filename=tryhtml_iframe_name"}, function (err, res) {
                                    expect(err).toEqual(null);
                                    expect(res).toEqual(true);

                                    seleniumFramework.performDeviceInteraction("switchToFrame", { element: "iframeResult"}, function (err, res) {
                                      expect(err).toEqual(null);
                                      expect(res).toEqual(true);

                                      seleniumFramework.performDeviceInteraction("maximizeWindow", {}, function (err, res) {
                                        expect(err).toEqual(null);
                                        expect(res).toEqual(true);

                                        seleniumFramework.performDeviceInteraction("resizeWindow", {frame: '100, 100'}, function (err, res) {
                                          expect(err).toEqual(null);
                                          expect(res).toEqual(true);

                                          seleniumFramework.performDeviceInteraction("executeScript", {executeScript: "return document.title;"}, function (err, res) {
                                            expect(err).toEqual(null);
                                            expect(res).toEqual(true);

                                            seleniumFramework.performDeviceInteraction("executeScriptWithString", { withString: "return window.location.href;", storeIn: "docTitle" }, function(err, res) {
                                              expect(err).toEqual(null);
                                              expect(res).toEqual(true);
                                              expect(soda.vars.get("docTitle")).toEqual('https://www.w3schools.com/tags/tryit.asp?filename=tryhtml_iframe_name');

                                              seleniumFramework.performDeviceInteraction("close", {}, function (err, res) {
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

    it('Should getTree for selenium', function (done) {
      seleniumFramework.start("chrome", "about:blank", {}, function(err) {
        expect(err).toEqual(null);

        seleniumFramework.getTree({}, function(err, result) {
          expect(err).toEqual(null);
          expect(result).toBeInstanceOf(Object);

          seleniumFramework.stop(function(err, result) {
            expect(err).toEqual(null);
            expect(result).toEqual(true);

            done();
          });
        });
      });
    });

    it('Should restart for selenium', function (done) {
      seleniumFramework.start("chrome", "about:blank", {}, function(err) {
        expect(err).toEqual(null);

        seleniumFramework.restart(function(err) {
          expect(err).toEqual(null);

          seleniumFramework.stop(function(err, result) {
            expect(err).toEqual(null);
            expect(result).toEqual(true);

            done();
          });
        });
      });
    });
});
