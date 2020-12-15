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
    DeviceInteractions   = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "DeviceInteractions"));

require(path.join(__dirname, "..", "SodaCommon", "ProtoLib"));

describe('DeviceInteractions should pass all validation tests', function () {
  var soda, action, spy;

    beforeAll(function (done) {
      soda = new Soda({ testPath: path.join(__dirname, '..', 'sample_project'), logSupressed: true });

      soda.init(function() {
        soda.config.set("headless", true, true, true);
        
        spy = sinon.spy(soda.framework, "performDeviceInteraction");

        done();
      });
    });

    afterAll(function (done) {
      spy.restore();

      soda.kill();

      soda = null;
      
      done();
    });

    it('Should validate an empty framework', function (done) {
      var deviceInteractions = new DeviceInteractions(soda);

      deviceInteractions.hideAppForSeconds(20, function(done) { });

      sinon.assert.calledWith(spy, "hideAppForSeconds", {seconds:20});

      done();
    });

    it('Should validate hideAppForSeconds interactions', function (done) {
      var deviceInteractions = new DeviceInteractions(soda);

      spy.resetHistory();

      deviceInteractions.hideAppForSeconds(20, function(done) { });

      sinon.assert.calledWith(spy, "hideAppForSeconds", {seconds:20});

      done();
    });

    it('Should validate rotateDevice interactions', function (done) {
      var deviceInteractions = new DeviceInteractions(soda);

      spy.resetHistory();

      deviceInteractions.rotateDevice("portrait", function(done) {});
      sinon.assert.calledWith(spy, "rotateDevice", {orientation:1});

      done();
    });

    it('Should validate captureScreen interactions', function (done) {
      var deviceInteractions = new DeviceInteractions(soda);

      spy.resetHistory();

      deviceInteractions.captureScreen({}, function(done) {});
      sinon.assert.calledWith(spy, "captureScreen", {});

      done();
    });

    it('Should validate captureHeader interactions', function (done) {
      var deviceInteractions = new DeviceInteractions(soda);

      spy.resetHistory();

      deviceInteractions.captureHeader({"name": "s_cc"}, function(done) {});
      sinon.assert.calledWith(spy, "captureHeader", {"name": "s_cc"});

      done();
    });

    it('Should validate tapXY interactions', function (done) {
      var deviceInteractions = new DeviceInteractions(soda);

      spy.resetHistory();

      deviceInteractions.tapXY(100, 100, function(done) {});
      sinon.assert.calledWith(spy, "tapXY", {x: 100,y:100});

      done();
    });

    it('Should validate typeOnKeyboard interactions', function (done) {
      var deviceInteractions = new DeviceInteractions(soda);

      spy.resetHistory();

      deviceInteractions.typeOnKeyboard("info to type", function(done) {});
      sinon.assert.calledWith(spy, "typeOnKeyboard", {string: "info to type"});


      done();
    });

    it('Should validate resetAppData interactions', function (done) {
      var deviceInteractions = new DeviceInteractions(soda);

      spy.resetHistory();

      deviceInteractions.resetAppData(function(done) {});
      sinon.assert.calledWith(spy, "resetAppData", {});


      done();
    });

    it('Should validate back interactions', function (done) {
      var deviceInteractions = new DeviceInteractions(soda);

      spy.resetHistory();

      deviceInteractions.back(function(done) {});
      sinon.assert.calledWith(spy, "back", {});

      done();
    });

    it('Should validate scrollWindow interactions', function (done) {
      var deviceInteractions = new DeviceInteractions(soda);

      spy.resetHistory();

      deviceInteractions.scrollWindow({x0: 1, y0: 1, x1: 100, y1: 100}, function(done) {});
      sinon.assert.calledWith(spy, "scroll window", {x0: 1, y0: 1, x1: 100, y1: 100});

      done();
    });

    it('Should validate scrollWindow interactions', function (done) {
      var deviceInteractions = new DeviceInteractions(soda);

      spy.resetHistory();

      deviceInteractions.deviceSwipe("1,1,100,100", function(done) {});
      sinon.assert.calledWith(spy, "deviceSwipe", {coordinates: "1,1,100,100"});

      done();
    });

    it('Should validate forward interactions', function (done) {
      var deviceInteractions = new DeviceInteractions(soda);

      spy.resetHistory();

      deviceInteractions.forward(function(done) {});
      sinon.assert.calledWith(spy, "forward", {});

      done();
    });

    it('Should validate reload interactions', function (done) {
      var deviceInteractions = new DeviceInteractions(soda);

      spy.resetHistory();

      deviceInteractions.reload(function(done) {});
      sinon.assert.calledWith(spy, "reload", {});

      done();
    });

    it('Should validate deleteAllCookies interactions', function (done) {
      var deviceInteractions = new DeviceInteractions(soda);

      spy.resetHistory();

      deviceInteractions.deleteAllCookies(function(done) {});
      sinon.assert.calledWith(spy, "deleteAllCookies", {});

      done();
    });

    it('Should validate goto interactions', function (done) {
      var deviceInteractions = new DeviceInteractions(soda);

      spy.resetHistory();

      deviceInteractions.goto("http://www.google.com", function(done) {});
      sinon.assert.calledWith(spy, "goto", {url: "http://www.google.com"});

      done();
    });

    it('Should validate goto interactions', function (done) {
      var deviceInteractions = new DeviceInteractions(soda);

      spy.resetHistory();

      deviceInteractions.resizeWindow("100, 100", function(done) {});
      sinon.assert.calledWith(spy, "resizeWindow", {frame: "100, 100"});

      done();
    });

    it('Should validate maximizeWindow interactions', function (done) {
      var deviceInteractions = new DeviceInteractions(soda);

      spy.resetHistory();

      deviceInteractions.maximizeWindow(true, function(done) {});
      sinon.assert.calledWith(spy, "maximizeWindow", {shouldDo: true});

      done();
    });

    it('Should validate getVariable interactions', function (done) {
      var deviceInteractions = new DeviceInteractions(soda);

      spy.resetHistory();

      deviceInteractions.getVariable("name", "store", function(done) {});
      sinon.assert.calledWith(spy, "getVariable", {variableName: "name", storeIn: "store"});

      done();
    });

    it('Should validate close interactions', function (done) {
      var deviceInteractions = new DeviceInteractions(soda);

      spy.resetHistory();

      deviceInteractions.close(function(done) {});
      sinon.assert.calledWith(spy, "close", {});

      done();
    });

    it('Should validate reset interactions', function (done) {
      var deviceInteractions = new DeviceInteractions(soda);

      spy.resetHistory();

      deviceInteractions.reset(function(done) {});
      sinon.assert.calledWith(spy, "reset", {});

      done();
    });

    it('Should validate switchToFrame interactions', function (done) {
      var deviceInteractions = new DeviceInteractions(soda);

      spy.resetHistory();

      deviceInteractions.switchToFrame({ element: "iframeResult"}, function(done) {});
      sinon.assert.calledWith(spy, "switchToFrame", { element: "iframeResult"});

      done();
    });

    it('Should validate startApp interactions', function (done) {
      var deviceInteractions = new DeviceInteractions(soda);

      spy.resetHistory();

      deviceInteractions.startApp("/path/to/something", "arg0,arg1,arg2", function(done) {});
      sinon.assert.calledWith(spy, "startApp", { path: "/path/to/something", args: "arg0,arg1,arg2"});

      done();
    });

    it('Should validate startAppAndWait interactions', function (done) {
      var deviceInteractions = new DeviceInteractions(soda);

      spy.resetHistory();

      deviceInteractions.startAppAndWait("/path/to/something", "arg0,arg1,arg2", function(done) {});
      sinon.assert.calledWith(spy, "startAppAndWait", { path: "/path/to/something", args: "arg0,arg1,arg2"});

      done();
    });

    it('Should validate stopApp interactions', function (done) {
      var deviceInteractions = new DeviceInteractions(soda);

      spy.resetHistory();

      deviceInteractions.stopApp("/path/to/something", "arg0,arg1,arg2", function(done) {});
      sinon.assert.calledWith(spy, "stopApp", { path: "/path/to/something", args: "arg0,arg1,arg2"});

      done();
    });

    it('Should validate homeScreen interactions', function (done) {
      var deviceInteractions = new DeviceInteractions(soda);

      spy.resetHistory();

      deviceInteractions.homeScreen(function(done) {});
      sinon.assert.calledWith(spy, "homeScreen", { });

      done();
    });

    it('Should validate openApp interactions', function (done) {
      var deviceInteractions = new DeviceInteractions(soda);

      spy.resetHistory();

      deviceInteractions.openApp("/path/to/something", function(done) {});
      sinon.assert.calledWith(spy, "openApp", { path: "/path/to/something"});

      done();
    });

    it('Should validate closeApp interactions', function (done) {
      var deviceInteractions = new DeviceInteractions(soda);

      spy.resetHistory();

      deviceInteractions.closeApp("/path/to/something", function(done) {});
      sinon.assert.calledWith(spy, "closeApp", { path: "/path/to/something"});

      done();
    });

    it('Should validate sendKeyCommand interactions', function (done) {
      var deviceInteractions = new DeviceInteractions(soda);

      spy.resetHistory();

      deviceInteractions.sendKeyCommand("KEY", function(done) {});
      sinon.assert.calledWith(spy, "sendKeyCommand", { keyCommand: "KEY"});

      done();
    });

    it('Should validate persona interactions', function (done) {
      var deviceInteractions = new DeviceInteractions(soda);

      spy.resetHistory();

      deviceInteractions.persona("PERSONA", function(done) {});
      sinon.assert.calledWith(spy, "persona", { persona: "PERSONA"});

      done();
    });

    it('Should validate lockScreen interactions', function (done) {
      var deviceInteractions = new DeviceInteractions(soda);

      spy.resetHistory();

      deviceInteractions.lockScreen(10, function(done) {});
      sinon.assert.calledWith(spy, "lockScreen", { seconds: 10});

      done();
    });

    it('Should validate post interactions', function (done) {
      var deviceInteractions = new DeviceInteractions(soda);

      spy.resetHistory();

      deviceInteractions.post({ url: "http://www.google.com", headers: { "Accept": "application/json" }, body: "body text" }, function(done) {});
      sinon.assert.calledWith(spy, "post", { url: "http://www.google.com", headers: { "Accept": "application/json" }, body: "body text" });

      done();
    });

    it('Should validate get interactions', function (done) {
      var deviceInteractions = new DeviceInteractions(soda);

      spy.resetHistory();

      deviceInteractions.get({ url: "http://www.google.com", headers: { "Accept": "application/json" }, body: "body text" }, function(done) {});
      sinon.assert.calledWith(spy, "get", { url: "http://www.google.com", headers: { "Accept": "application/json" }, body: "body text" });

      done();
    });

    it('Should validate del interactions', function (done) {
      var deviceInteractions = new DeviceInteractions(soda);

      spy.resetHistory();

      deviceInteractions.del("http://www.google.com", { "Accept": "application/json" }, "body text", function(done) {});
      sinon.assert.calledWith(spy, "delete", "http://www.google.com");

      done();
    });

    it('Should validate executeScript interactions', function (done) {
      var deviceInteractions = new DeviceInteractions(soda);

      spy.resetHistory();

      deviceInteractions.executeScript({executeScript: "return document.title;"}, function(done) {});
      sinon.assert.calledWith(spy, "executeScript", {executeScript: "return document.title;"});

      done();
    });

    it('Should validate executeScriptWithString interactions', function (done) {
      var deviceInteractions = new DeviceInteractions(soda);

      spy.resetHistory();

      deviceInteractions.executeScriptWithString({ withString: "return window.location.href;", storeIn: "docTitle" }, function(done) {});
      sinon.assert.calledWith(spy, "executeScriptWithString", { withString: "return window.location.href;", storeIn: "docTitle" });

      done();
    });

    it('Should validate findElement interactions', function (done) {
      var deviceInteractions = new DeviceInteractions(soda);

      spy.resetHistory();

      deviceInteractions.findElement("value", function(done) {});
      sinon.assert.calledWith(spy, "findElement", { valueToFind: "value"});

      done();
    });

    it('Should validate findElementWithScroll interactions', function (done) {
      var deviceInteractions = new DeviceInteractions(soda);

      spy.resetHistory();

      deviceInteractions.findElementWithScroll("value", function(done) {});
      sinon.assert.calledWith(spy, "findElementWithScroll", { valueToFind: "value"});

      done();
    });

    it('Should validate getResolution interactions', function (done) {
      var deviceInteractions = new DeviceInteractions(soda);

      spy.resetHistory();

      deviceInteractions.getResolution(function(done) {});
      sinon.assert.calledWith(spy, "getResolution", { });

      done();
    });

    it('Should validate scrollCalculated interactions', function (done) {
      var deviceInteractions = new DeviceInteractions(soda);

      spy.resetHistory();

      deviceInteractions.scrollCalculated("command", function(done) {});
      sinon.assert.calledWith(spy, "scrollCalculated", { command: "command" });

      done();
    });
});
