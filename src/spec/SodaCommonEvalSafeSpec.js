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

var sinon = require("sinon"),path   = require("path"),
    EvalSafe   = require(path.join(__dirname, "..", "SodaCommon", "EvalSafe")),
    Soda   = require(path.join(__dirname, "..", "SodaCore", "lib", "Soda"));
describe('SodaCommon EvalSafe should work properly', function () {
    var soda, spy, savedMethod;

    beforeAll(function (done) {
      soda = new Soda().init( function () { } );

      savedMethod = console.log;

      done();
    });

    beforeEach(function() {
        spy = sinon.spy(console, 'log');
      });
    
    afterEach(function() {
        spy.restore();
    });

    afterAll(function (done) {
        console.log = savedMethod;
        
        soda.kill();

        soda = null;

        done();
    });
  

    it('EvalSafe should eval properly on a cloned argument of a mathmatical operation', function (done) {
        expect(EvalSafe.evaluate('7+5'.sodaclone(), soda)).toEqual(12);

        done();
    });

    it('EvalSafe should eval properly on a cloned argument of an expression', function (done) {
        expect(EvalSafe.evaluate('var a = 5;'.sodaclone(), soda)).toEqual(undefined);

        done();
    });

    it('EvalSafe should eval properly on a cloned argument of an expression printed out', function (done) {
        expect(EvalSafe.evaluate('var a = 5; console.log(a);'.sodaclone(), soda)).toEqual(undefined);
        sinon.assert.calledWith(spy, 5);

        done();
    });

    it('EvalSafe should enable setting a global variable to any int value', function (done) {
        EvalSafe.set('test', 7)
        expect(test).toEqual(7);

        done();
    });

    it('EvalSafe should enable setting a global variable to any string value', function (done) {
        EvalSafe.set('test', 'hello')
        expect(test).toEqual('hello');

        done();
    });

    it('EvalSafe should enable setting a global variable to any function', function (done) {
        EvalSafe.set('test', (function(valueToPrint) { console.log(valueToPrint); }).sodaclone());
        expect(test).toBeInstanceOf(Function);
        test('Value to print');

        sinon.assert.calledWith(spy, 'Value to print');

        done();
    });

    it('EvalSafe should throw an exception when trying to set a name with a non-string variable', function (done) {
        var variableName = 5;
        expect( function() { EvalSafe.set(variableName, "Should throw".sodaclone()) } ).toThrowMatching(function(thrown) { return thrown.message === 'Argument 0: expected `string`, but got `number`'; });

        done();
    });
});
