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

var path   = require("path"),
    Exception = require(path.join(__dirname, "..", "SodaCommon", "Exception")),
    sinon  = require("sinon");

require(path.join(__dirname, "..", "SodaCommon", "ProtoLib"));

describe('SodaCommon ProtoLib should work properly', function () {
    beforeAll(function () {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
    })

    it('ProtoLib members should return proper length for an Object', function () {
        expect("Hello James".sodamembers).toEqual(11);
        expect(parseInt("12").sodamembers).toEqual(2);
        expect(Boolean("true").sodamembers).toEqual(true);
        expect([1, 2, 3, 4].sodamembers).toEqual(4);
        expect({ joe: '1', tim: '2'}.sodamembers).toEqual(2);
        expect(function() { var i = 1; }.sodamembers).toEqual(1);
    });

    it('ProtoLib isNumeric should return true/false appropriately', function () {
        expect("Hello James".isNumeric).toEqual(false);
        expect(Number(12).isNumeric).toEqual(true);
        expect(parseInt("12").isNumeric).toEqual(true);
        expect(Boolean("true").isNumeric).toEqual(false);
        expect([1, 2, 3, 4].isNumeric).toEqual(false);
        expect({ joe: '1', tim: '2'}.isNumeric).toEqual(false);
        expect(function() { var i = 1; }.isNumeric).toEqual(false);
    });

    it('ProtoLib sodaIsEmpty should return true/false appropriately', function () {
        expect("Hello James".sodaIsEmpty()).toEqual(false);
        expect(parseInt("12").sodaIsEmpty()).toEqual(false);
        expect(Boolean("true").sodaIsEmpty()).toEqual(false);
        expect([1, 2, 3, 4].sodaIsEmpty()).toEqual(false);
        expect({ joe: '1', tim: '2'}.sodaIsEmpty()).toEqual(false);
        expect("".sodaIsEmpty()).toEqual(true);
        expect([].sodaIsEmpty()).toEqual(true);
        expect({}.sodaIsEmpty()).toEqual(true);
    });

    it('ProtoLib toInteger should return proper number of bytes for an Object', function () {
        expect("Hello James".toInteger).toEqual("Hello James");
        expect(parseInt("12").toInteger).toEqual(12);
        expect(parseFloat("12.3").toInteger).toEqual(12);
        expect(Boolean("true").toInteger).toEqual(true);
        expect([].toInteger).toEqual([]);
        expect({}.toInteger).toEqual({});
    });

    it('ProtoLib sodaTruthy should return proper number of bytes for an Object', function () {
        expect("Hello James".sodaTruthy).toEqual("Hello James");
        expect([].sodaTruthy).toEqual([]);
        expect({}.sodaTruthy).toEqual({});
        expect([1, 2, 3, 4].sodaTruthy).toEqual([1, 2, 3, 4]);
        expect({a: 'hi', 'b': 'hello'}.sodaTruthy).toEqual({a: 'hi', 'b': 'hello'});
    });

    it('ProtoLib toTruthy should return proper result', function () {
        expect("Hello James".toTruthy).toEqual("Hello James");
        expect([].toTruthy).toEqual([]);
        expect({}.toTruthy).toEqual({});
        expect([1, 2, 3, 4].toTruthy).toEqual([1, 2, 3, 4]);
        expect({a: 'hi', 'b': 'hello'}.toTruthy).toEqual({a: 'hi', 'b': 'hello'});
    });

    it('ProtoLib getArray should return proper result', function () {
        expect("Hello James".getArray).toEqual([ 'H', 'e', 'l', 'l', 'o', ' ', 'J', 'a', 'm', 'e', 's' ]);
        expect(Number(12).getArray).toEqual([]);
        expect([1, 2, 3, 4].getArray).toEqual([1, 2, 3, 4]);
        expect([].toTruthy).toEqual([]);
        expect({}.toTruthy).toEqual({});
    });

    it('ProtoLib sodaToArray should return proper result', function () {
        expect({a: 'hi', 'b': 'hello'}.sodaToArray).toEqual(['hi', 'hello']);
        expect([1, 2, 3, 4].sodaToArray).toEqual([1, 2, 3, 4]);
    });

    it('ProtoLib sodaexpect should return proper result', function () {
        expect("1".sodaexpect("string")).toEqual("1");
        expect([1].sodaexpect("number")).toEqual({
            result: true,
            value: null,
            expected: null,
            got: null,
            number: 1,
            error: null
        });
        expect(["1"].sodaexpect("string")).toEqual({
            result: true,
            value: null,
            expected: null,
            got: null,
            number: 1,
            error: null
        });
        expect([true].sodaexpect("boolean")).toEqual({
            result: true,
            value: null,
            expected: null,
            got: null,
            number: 1,
            error: null
        });
        expect([function() {}].sodaexpect("function")).toEqual({
            result: true,
            value: null,
            expected: null,
            got: null,
            number: 1,
            error: null
        });
        expect([undefined].sodaexpect("undefined")).toEqual({
            result: true,
            value: null,
            expected: null,
            got: null,
            number: 1,
            error: null
        });
        expect([null].sodaexpect("null")).toEqual({
            result: true,
            value: null,
            expected: null,
            got: null,
            number: 1,
            error: null
        });
        expect([{num: 1}].sodaexpect("object")).toEqual({
            result: true,
            value: null,
            expected: null,
            got: null,
            number: 1,
            error: null
        });
        expect([[1, 2, 3, 4]].sodaexpect("array")).toEqual({
            result: true,
            value: null,
            expected: null,
            got: null,
            number: 1,
            error: null
        });
        expect([1, 2, 3, 4].sodaexpect("number", "number", "number", "number")).toEqual({
            result: true,
            value: null,
            expected: null,
            got: null,
            number: 4,
            error: null
        });
        expect([1, "2", [1, 2], {num: 1}].sodaexpect("number", "string", "array", "object")).toEqual({
            result: true,
            value: null,
            expected: null,
            got: null,
            number: 4,
            error: null
        });
        expect([1, "2", [1, 2], {num: 1}, function() {}, undefined, null, true].sodaexpect("number", "string", "array", "object", "function", "undefined", "null", "boolean")).toEqual({
            result: true,
            value: null,
            expected: null,
            got: null,
            number: 8,
            error: null
        });
        var toTest = [1, "2", [1, 2], {num: 1}].sodaexpect("object", "string", "array", "object");
        var values = Object.values(toTest);
        expect(values[values.length-1].message).toEqual("Argument 0: expected `object`, but got `number`");

        toTest = [1, "2", [1, 2], {num: 1}].sodaexpect("number", "array", "array", "object");
        values = Object.values(toTest);
        expect(values[values.length-1].message).toEqual("Argument 1: expected `array`, but got `string`");

        toTest = [1, "2", [1, 2], {num: 1}].sodaexpect("number", "string", "string", "object");
        values = Object.values(toTest);
        expect(values[values.length-1].message).toEqual("Argument 2: expected `string`, but got `object`");

        toTest = [1, "2", [1, 2], {num: 1}].sodaexpect("number", "string", "array", "number");
        values = Object.values(toTest);
        expect(values[values.length-1].message).toEqual("Argument 3: expected `number`, but got `object`");

        expect("".sodaexpect("number", "string", "array", "object")).toEqual("");

        toTest = [].sodaexpect("number", "string", "array", "object");
        values = Object.values(toTest);
        expect(values[values.length-1].message).toEqual("Argument 0: expected `number`, but got `undefined`");

        toTest = {}.sodaexpect("number", "string", "array", "object");
        values = Object.values(toTest);
        expect(values[values.length-1].message).toEqual("Argument 0: expected `number`, but got `undefined`");
    });

    it('ProtoLib each should call callback for each element', function () {
        var myObject = {
          cb : function() {}
        };

        var spyon = sinon.spy(myObject, "cb");

        [1, 2, 3, 4].sodaeach(myObject.cb);

        expect(spyon.callCount).toEqual(4);
    });

    it('ProtoLib hasTrailingCallback should have function for last element', function () {
        expect([1, 2, 3].hasTrailingCallback).toEqual(false);
        expect([1, 2, function() {}].hasTrailingCallback).toEqual(true);
        expect({one: 1, two: 2, three: 3}.hasTrailingCallback).toEqual(false);
        expect({one: 1, two: 2, three: function() {}}.hasTrailingCallback).toEqual(true);
    });

    it('ProtoLib sodaClassName should be correct for objects', function () {
        expect(Number(1).sodaClassName).toEqual("Number");
        expect(Boolean(true).sodaClassName).toEqual("Boolean");
        expect("string".sodaClassName).toEqual("String");
        expect([].sodaClassName).toEqual("Array");
        expect({}.sodaClassName).toEqual("Object");
        expect(new Exception.SodaError('soda GenericError').sodaClassName).toEqual("SodaError");
    });

    it('ProtoLib findChildByPath should find a child by path in an object', function () {
        var myObject = { a: { b: { c: "will return this string" } } };

        expect(myObject.findChildByPath("a/b/c")).toEqual("will return this string");
    });

    afterAll(function () {

    });
});
