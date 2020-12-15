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

describe('Framework puppeteer should pass all validation tests', function () {
  var soda, puppeteerFramework, settings, buildTree, puppeteerControl, savedMethod1, savedMethod2, savedMethod3, spy, spy1, spy2;

    beforeAll(function (done) {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 300000;

      savedMethod1 = fs.access;
      savedMethod2 = fs.writeFile;
      savedMethod3 = console.log;

      soda = new Soda({ testPath: path.join(__dirname, '..', 'sample_project'), logSupressed: false });

      soda.init(function() {
        soda.config.set("headless", true, true, true);
        
          puppeteerFramework = require(path.join(__dirname, "..", "SodaCore", "frameworks", "puppeteer"))(soda);
          soda.framework = puppeteerFramework;
          settings  = require(path.join(__dirname, "..", "SodaCore", "frameworks", "puppeteer", "imports", "Config.js"))(soda);
          puppeteerControl  = new (require(path.join(__dirname, "..", "SodaCore", "frameworks", "puppeteer", "imports", "Driver.js")))(soda);

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

    it('Should validate puppeteer', function (done) {
      expect(puppeteerFramework.name).toEqual('Puppeteer');
      expect(puppeteerFramework.platform).toEqual('Web');
      expect(puppeteerFramework.version).toEqual('1.0');
      expect(puppeteerFramework.defaultSyntaxVersion).toEqual('1.0');
      expect(puppeteerFramework.defaultSyntaxName).toEqual('web');

      done();
    });

    it('Should start for puppeteer', function (done) {
      puppeteerFramework.start("chrome", "about:blank", {}, function(err) {
        expect(err).toEqual(null);

        done();
      });
    });
    
    it('Should not build for puppeteer', function (done) {
      puppeteerFramework.build(function(err, result) {
        expect(err).toBeInstanceOf(Error);
        expect(result).toEqual(null);

        done();
      });
    });

    it('Should listAvailableDevices for puppeteer', function (done) {
      puppeteerFramework.listAvailableDevices(function(result) {
        expect(result).toBeInstanceOf(Array);

        done();
      });
    });

    it('Should captureScreen for puppeteer', function (done) {
      puppeteerFramework.performDeviceInteraction("captureScreen", {}, function (err, res) {
        expect(err).toEqual(null);
        expect(res).toEqual(true);

        done();
      });
    });

    it('Should getScreenBounds for puppeteer', function (done) {
      puppeteerFramework.getScreenBounds(function(err, bounds) {
        expect(err).toEqual(null);
        expect(bounds.sodamembers).toEqual(2);

        done();
      });
    });

    it('Should getOrientation for puppeteer', function (done) {
      puppeteerFramework.getOrientation(function(err, result) {
        expect(err).toEqual(null);
        expect(result).toEqual(1);

        done();
      });
    });

    it('Should perform all element interactions', function (done) {
      puppeteerFramework.performDeviceInteraction("goto", { url: "https://secure.ally.com"}, function (err, res) {
        expect(err).toEqual(null);
        expect(res).toEqual(true);

        setTimeout(function () {
          puppeteerFramework.performElementInteraction("scrollToVisible", [{ id: "login-username" }], {}, function(err, res) {
            expect(err).toEqual(null);
            expect(res).toEqual(true);
  
            puppeteerFramework.performElementInteraction("setValue", [{ id: "login-username" }], { value: 'hi'}, function(err, res) {            
              expect(err).toEqual(null);
              expect(res).toEqual(true);
  
              puppeteerFramework.performElementInteraction("click", [{ id: "login-username" }], {}, function(err, res) {
                expect(err).toEqual(null);
                expect(res).toEqual(true);
  
                done();
              });
            });
          });
        }, 10000);
      });
    });

    it('Should validate all Device interactions on Puppeteer', function (done) {
      puppeteerFramework.performDeviceInteraction("goto", { url: "http://secure.ally.com/"}, function (err, res) {
        expect(err).toEqual(null);
        expect(res).toEqual(true);

        puppeteerFramework.getOrientation(function(err, orientation) {
          expect(err).toEqual(null);
          expect(orientation).toEqual(1);

          puppeteerFramework.getScreenBounds(function(err, bounds) {
            expect(err).toEqual(null);
            expect(bounds.sodamembers).toEqual(2);

            puppeteerFramework.getTree({}, function(tree) {
              expect(tree).toEqual(null);

              puppeteerFramework.performDeviceInteraction("goto", { url: "https://www.google.com/"}, function (err, res) {
                expect(err).toEqual(null);
                expect(res).toEqual(true);

                puppeteerFramework.performDeviceInteraction("getVariable", { variableName: "location.href", storeIn: "href"}, function (err, res) {
                  expect(err).toEqual(null);
                  expect(res).toEqual("https://www.google.com/");
                  expect(soda.vars.get('href')).toEqual('https://www.google.com/');

                  puppeteerFramework.performDeviceInteraction("captureScreen", {}, function (err, res) {
                    expect(err).toEqual(null);
                    expect(res).toEqual(true);

                    sinon.assert.called(spy);
                    sinon.assert.called(spy1);

                    puppeteerFramework.performDeviceInteraction("goto", { url: "https://www.apple.com/"}, function (err, res) {
                      expect(err).toEqual(null);
                      expect(res).toEqual(true);

                      puppeteerFramework.performDeviceInteraction("getVariable", { variableName: "location.href", storeIn: "href"}, function (err, res) {
                        expect(err).toEqual(null);
                        expect(res).toEqual("https://www.apple.com/");
                        expect(soda.vars.get('href')).toEqual('https://www.apple.com/');

                        puppeteerFramework.performDeviceInteraction("back", {}, function (err, res) {
                          expect(err).toEqual(null);
                          expect(res).toEqual(true);

                          puppeteerFramework.performDeviceInteraction("getVariable", { variableName: "location.href", storeIn: "href"}, function (err, res) {
                            expect(err).toEqual(null);
                            expect(res).toEqual("https://www.google.com/");
                            expect(soda.vars.get('href')).toEqual('https://www.google.com/');

                            puppeteerFramework.performDeviceInteraction("forward", {}, function (err, res) {
                              expect(err).toEqual(null);
                              expect(res).toEqual(true);

                              puppeteerFramework.performDeviceInteraction("getVariable", { variableName: "location.href", storeIn: "href"}, function (err, res) {
                                expect(err).toEqual(null);
                                expect(res).toEqual("https://www.apple.com/");
                                expect(soda.vars.get('href')).toEqual('https://www.apple.com/');

                                puppeteerFramework.performDeviceInteraction("captureHeader", {"name": "s_cc"}, function (err, res) {
                                  expect(err).toEqual(null);
                                  expect(res).toEqual('true');

                                  puppeteerFramework.performDeviceInteraction("goto", { url: "https://www.w3schools.com/tags/tryit.asp?filename=tryhtml_iframe_name"}, function (err, res) {
                                    expect(err).toEqual(null);
                                    expect(res).toEqual(true);

                                    puppeteerFramework.performDeviceInteraction("switchToFrame", { element: "iframeResult"}, function (err, res) {
                                      expect(err).toEqual(null);
                                      expect(res).toEqual(true);

                                      puppeteerFramework.performDeviceInteraction("maximizeWindow", {}, function (err, res) {
                                        expect(err).toEqual(new Error('Not supported in Puppeteer'));
                                        expect(res).toEqual(null);

                                        puppeteerFramework.performDeviceInteraction("resizeWindow", {frame: '100, 100'}, function (err, res) {
                                          expect(err).toEqual(new Error('Not supported in Puppeteer'));
                                          expect(res).toEqual(null);

                                          puppeteerFramework.performDeviceInteraction("executeScript", {executeScript: "Script"}, function (err, res) {
                                            expect(err).toEqual(null);
                                            expect(res).toEqual(true);

                                            puppeteerFramework.performDeviceInteraction("executeScriptWithString", { withString: "return window.location.href;", storeIn: "docTitle" }, function(err, res) {
                                              expect(err).toEqual(null);
                                              expect(res).toEqual(true);
                                              expect(soda.vars.get("docTitle")).toEqual('https://www.w3schools.com/tags/tryit.asp?filename=tryhtml_iframe_name');

                                              puppeteerFramework.performDeviceInteraction("close", {}, function (err, res) {
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

    it('Should restart for puppeteer', function (done) {
      puppeteerFramework.start("chrome", "about:blank", {}, function(err) {
        expect(err).toEqual(null);

        puppeteerFramework.restart(function(err) {
          expect(err).toEqual(null);

          puppeteerFramework.stop(function(err, result) {
            expect(err).toEqual(null);
            expect(result).toEqual(true);

            done();
          });
        });
      });
    });

    it('Should reset for puppeteer', function (done) {
      puppeteerFramework.start("chrome", "about:blank", {}, function(err) {
        expect(err).toEqual(null);

        puppeteerFramework.performDeviceInteraction('reset', {}, function(err, result) {
          expect(err).toEqual(null);
          expect(result).toEqual(true);

          puppeteerFramework.stop(function(err, result) {
            expect(err).toEqual(null);
            expect(result).toEqual(true);

            done();
          });
        });
      });
    });

    it('Should close for puppeteer', function (done) {
      puppeteerFramework.start("chrome", "about:blank", {}, function(err) {
        expect(err).toEqual(null);

        puppeteerFramework.performDeviceInteraction('close', {}, function(err, result) {
          expect(err).toEqual(null);
          expect(result).toEqual(true);

          puppeteerFramework.stop(function(err, result) {
            expect(err).toEqual(null);
            expect(result).toEqual(true);

            done();
          });
        });
      });
    });

    it('Should stop for puppeteer', function (done) {
      puppeteerFramework.start("chrome", "about:blank", {}, function(err) {
        expect(err).toEqual(null);

        puppeteerFramework.stop(function(err, result) {
          expect(err).toEqual(null);
          expect(result).toEqual(true);

          done();
        });
      });
    });

    it('Should getTree for puppeteer', function (done) {
      puppeteerFramework.start("chrome", "about:blank", {}, function(err) {
        expect(err).toEqual(null);

        puppeteerFramework.getTree({}, function(err, result) {
          expect(err).toEqual(null);
          expect(result).toBeInstanceOf(Object);

          puppeteerFramework.stop(function(err, result) {
            expect(err).toEqual(null);
            expect(result).toEqual(true);

            done();
          });
        });
      });
    });
});
