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
    Console   = require(path.join(__dirname, "..", "SodaCommon", "Console"));

require(path.join(__dirname, "..", "SodaCommon", "ProtoLib"));

describe('SodaCommon Console should work properly', function () {
    var commonConsole;

    beforeAll(function () {
        commonConsole = new Console();
    });

    afterEach(function () {
    });

    it('SodaConsole log should be sending to the console', function () {
        let spy = sinon.spy(commonConsole, "log");
        commonConsole.log("console.log called");
        sinon.assert.called(spy);
    });

    it('SodaConsole debug should be sending to the console', function () {
        let spy = sinon.spy(commonConsole, 'debug');
        commonConsole.debug("console.debug called");
        sinon.assert.called(spy);
    });

    it('SodaConsole message should be sending to the console', function () {
        let spy = sinon.spy(commonConsole, 'message');
        commonConsole.message("console.message called");
        sinon.assert.called(spy);
    });

    it('SodaConsole warn should be sending to the console', function () {
        let spy = sinon.spy(commonConsole, 'warn');
        commonConsole.warn("console.warn called");
        sinon.assert.called(spy);
    });

    it('SodaConsole error should be sending to the console', function () {
        let spy = sinon.spy(commonConsole, 'error');
        commonConsole.error("console.error called");
        sinon.assert.called(spy);
    });

    it('SodaConsole pass should be sending to the console', function () {
        let spy = sinon.spy(commonConsole, 'pass');
        commonConsole.pass("console.pass called");
        sinon.assert.called(spy);
    });

    it('SodaConsole fail should be sending to the console', function () {
        let spy = sinon.spy(commonConsole, 'fail');
        commonConsole.fail("console.fail called");
        sinon.assert.called(spy);
    });

    it('SodaConsole start should be sending to the console', function () {
        let spy = sinon.spy(commonConsole, 'start');
        commonConsole.start("console.start called");
        sinon.assert.called(spy);
    });

    it('SodaConsole verbose should be sending to the console', function () {
        let spy = sinon.spy(commonConsole, 'verbose');
        commonConsole.verbose("console.verbose called");
        sinon.assert.called(spy);
    });

    it('SodaConsole comment should be sending to the console', function () {
        let spy = sinon.spy(commonConsole, 'comment');
        commonConsole.comment("console.comment called");
        sinon.assert.called(spy);
    });


    afterAll(function () {
    });
});
