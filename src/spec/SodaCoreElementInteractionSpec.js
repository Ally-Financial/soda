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
    ElementInteractions   = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "ElementInteractions"));

require(path.join(__dirname, "..", "SodaCommon", "ProtoLib"));

describe('ElementInteractions should pass all validation tests', function () {
  var soda, action, spy;

    beforeAll(function (done) {
      soda = new Soda({ testPath: path.join(__dirname, '..', 'sample_project'), logSupressed: true });

      soda.init(function() {
        soda.config.set("headless", true, true, true);
        
        spy = sinon.spy(soda.framework, "performElementInteraction");

        done();
      });
    });

    afterAll(function (done) {
      soda.kill();
      
      soda = null;
      
      done();
    });

    it('Should validate an empty framework', function (done) {
      var elementInteractions = new ElementInteractions(soda);

      elementInteractions.tap([{ id: "login-username" }], {}, function(done) { });

      sinon.assert.calledWith(spy, "tap", [{ id: "login-username" }], {});

      done();
    });

    it('Should validate tap interactions', function (done) {
      var elementInteractions = new ElementInteractions(soda);

      spy.resetHistory();

      elementInteractions.tap([{ id: "login-username" }], {}, function(done) { });

      sinon.assert.calledWith(spy, "tap", [{ id: "login-username" }], {});

      done();
    });

    it('Should validate click interactions', function (done) {
      var elementInteractions = new ElementInteractions(soda);

      spy.resetHistory();

      elementInteractions.click([{ id: "login-username" }], {}, function(done) { });

      sinon.assert.calledWith(spy, "click", [{ id: "login-username" }], {});

      done();
    });

    it('Should validate doubleTap interactions', function (done) {
      var elementInteractions = new ElementInteractions(soda);

      spy.resetHistory();

      elementInteractions.doubleTap([{ id: "login-username" }], {}, function(done) { });

      sinon.assert.calledWith(spy, "tapWithOptions", [{ id: "login-username" }], {});

      done();
    });

    it('Should validate dragInside interactions', function (done) {
      var elementInteractions = new ElementInteractions(soda);

      spy.resetHistory();

      elementInteractions.dragInside([{ id: "login-username" }], {}, function(done) { });

      sinon.assert.calledWith(spy, "dragInside", [{ id: "login-username" }], {});

      done();
    });

    it('Should validate flickInside interactions', function (done) {
      var elementInteractions = new ElementInteractions(soda);

      spy.resetHistory();

      elementInteractions.flickInside([{ id: "login-username" }], {}, function(done) { });

      sinon.assert.calledWith(spy, "flickInside", [{ id: "login-username" }], {});

      done();
    });

    it('Should validate rotate interactions', function (done) {
      var elementInteractions = new ElementInteractions(soda);

      spy.resetHistory();

      elementInteractions.rotate([{ id: "login-username" }], {}, function(done) { });

      sinon.assert.calledWith(spy, "rotate", [{ id: "login-username" }], {});

      done();
    });

    it('Should validate scrollToVisible interactions', function (done) {
      var elementInteractions = new ElementInteractions(soda);

      spy.resetHistory();

      elementInteractions.scrollToVisible([{ id: "login-username" }], {}, function(done) { });

      sinon.assert.calledWith(spy, "scrollToVisible", [{ id: "login-username" }], {});

      done();
    });

    it('Should validate touchAndHold interactions', function (done) {
      var elementInteractions = new ElementInteractions(soda);

      spy.resetHistory();

      elementInteractions.touchAndHold([{ id: "login-username" }], {}, function(done) { });

      sinon.assert.calledWith(spy, "touchAndHold", [{ id: "login-username" }], {});

      done();
    });

    it('Should validate twoFingerTap interactions', function (done) {
      var elementInteractions = new ElementInteractions(soda);

      spy.resetHistory();

      elementInteractions.twoFingerTap([{ id: "login-username" }], {}, function(done) { });

      sinon.assert.calledWith(spy, "twoFingerTap", [{ id: "login-username" }], {});

      done();
    });

    it('Should validate setValue interactions with mask', function (done) {
      var elementInteractions = new ElementInteractions(soda);

      spy.resetHistory();

      elementInteractions.setValue([{ id: "login-username" }], "value", function(done) { }, true, 10);

      sinon.assert.calledWith(spy, "setValue", [{ id: "login-username" }], { value: "value", delay: 10, mask: true });

      done();
    });

    it('Should validate setValue interactions', function (done) {
      var elementInteractions = new ElementInteractions(soda);

      spy.resetHistory();

      elementInteractions.setValue([{ id: "login-username" }], "value", function(done) { }, false, 10);

      sinon.assert.calledWith(spy, "setValue", [{ id: "login-username" }], { value: "value", delay: 10, mask: false });

      done();
    });

    it('Should validate typeIn interactions with mask', function (done) {
      var elementInteractions = new ElementInteractions(soda);

      spy.resetHistory();

      elementInteractions.typeIn([{ id: "login-username" }], {}, function(done) { });

      sinon.assert.calledWith(spy, "typeIn", [{ id: "login-username" }], { });

      done();
    });

    it('Should validate sendKeys interactions with mask', function (done) {
      var elementInteractions = new ElementInteractions(soda);

      spy.resetHistory();

      elementInteractions.sendKeys([{ id: "login-username" }], { value: "KEY"}, function(done) { });

      sinon.assert.calledWith(spy, "sendKeys", [{ id: "login-username" }], { value: "KEY"});

      done();
    });

    it('Should validate scroll interactions with mask', function (done) {
      var elementInteractions = new ElementInteractions(soda);

      spy.resetHistory();

      elementInteractions.scroll([{ id: "login-username" }], { direction: "Down" }, function(done) { });

      sinon.assert.calledWith(spy, "scroll", [{ id: "login-username" }], { direction: "Down" });

      done();
    });
});
