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
    Assert   = require(path.join(__dirname, "..", "SodaCommon", "Assert")),
    Exception   = require(path.join(__dirname, "..", "SodaCommon", "Exception")),
    fs     = require("fs");

describe('SodaCommon Assert true should work properly', function () {
    it('Assert true on false should throw an exception', function () {
      expect(function() { Assert.true(false, 'Should throw')} ).toThrowMatching(function(thrown) { return thrown.message === 'Should throw'; });
    });

    it('Assert true on true should not throw an exception', function () {
        expect(function() {Assert.true(true, "Should not throw")}).not.toThrowMatching(function(thrown) { return thrown.message === 'Should not throw'; });
    });
});

describe('SodaCommon Assert false should work properly', function () {
    it('Assert false on true should throw an exception', function () {
      expect(function() {Assert.false(true, 'Should throw')} ).toThrowMatching(function(thrown) { return thrown.message === 'Should throw'; });
    });

    it('Assert false on false should not throw an exception', function () {
        expect(function() {Assert.false(false, "Should not throw")}).not.toThrowMatching(function(thrown) { return thrown.message === 'Should not throw'; });
    });
});

describe('SodaCommon Assert empty should work properly', function () {
    it('Assert empty on true should throw an exception', function () {
        expect(function() {Assert.empty(true, "Should throw")}).toThrowMatching(function(thrown) { return thrown.message === 'Should throw'; });
    });

    it('Assert empty on a string should throw an exception', function () {
        expect(function() {Assert.empty('true', "Should throw")}).toThrowMatching(function(thrown) { return thrown.message === 'Should throw'; });
    });

    it('Assert empty on an integer should throw an exception', function () {
        expect(function() {Assert.empty(34, "Should throw")}).toThrowMatching(function(thrown) { return thrown.message === 'Should throw'; });
    });

    it('Assert empty on an empty array should throw an exception', function () {
        expect(function() {Assert.empty([], "Should throw")}).toThrowMatching(function(thrown) { return thrown.message === 'Should throw'; });
    });

    it('Assert empty on an empty json object should throw an exception', function () {
        expect(function() {Assert.empty({}, "Should throw")}).toThrowMatching(function(thrown) { return thrown.message === 'Should throw'; });
    });

    it('Assert empty on false should not throw an exception', function () {
        expect(function() {Assert.empty(false, "Should not throw")}).not.toThrowMatching(function(thrown) { return thrown.message === 'Should not throw'; });
    });

    it('Assert empty on undefined should not throw an exception', function () {
        var nothing;
        expect(function() {Assert.empty(nothing, "Should not throw")}).not.toThrowMatching(function(thrown) { return thrown.message === 'Should not throw'; });
    });

    it('Assert empty on null should not throw an exception', function () {
        expect(function() {Assert.empty(null, "Should not throw")}).not.toThrowMatching(function(thrown) { return thrown.message === 'Should not throw'; });
    });
});

describe('SodaCommon Assert defined should work properly', function () {

    it('Assert defined on true should not throw an exception', function () {
        expect(function() {Assert.defined(true, "Should not throw")}).not.toThrowMatching(function(thrown) { return thrown.message === 'Should not throw'; });
    });

    it('Assert defined on a string should not throw an exception', function () {
        expect(function() {Assert.defined('true', "Should not throw")}).not.toThrowMatching(function(thrown) { return thrown.message === 'Should not throw'; });
    });

    it('Assert defined on an integer should not throw an exception', function () {
        expect(function() {Assert.defined(34, "Should not throw")}).not.toThrowMatching(function(thrown) { return thrown.message === 'Should not throw'; });
    });

    it('Assert defined on an empty array should not throw an exception', function () {
        expect(function() {Assert.defined([], "Should not throw")}).not.toThrowMatching(function(thrown) { return thrown.message === 'Should not throw'; });
    });

    it('Assert defined on an empty json object should not throw an exception', function () {
        expect(function() {Assert.defined({}, "Should not throw")}).not.toThrowMatching(function(thrown) { return thrown.message === 'Should not throw'; });
    });

    it('Assert defined on false should throw an exception', function () {
        expect(function() {Assert.defined(false, "Should throw")}).toThrowMatching(function(thrown) { return thrown.message === 'Should throw'; });
    });

    it('Assert defined on undefined should throw an exception', function () {
        var nothing;
        expect(function() {Assert.defined(nothing, "Should throw")}).toThrowMatching(function(thrown) { return thrown.message === 'Should throw'; });
    });

    it('Assert defined on null should throw an exception', function () {
        expect(function() {Assert.defined(null, "Should throw")}).toThrowMatching(function(thrown) { return thrown.message === 'Should throw'; });
    });

});

describe('SodaCommon Assert equal should work properly', function () {
    it('Assert equal on coerced but equal int/string values should not throw an exception', function () {
        expect(function() {Assert.equal(3, "3", "Should not throw")}).not.toThrowMatching(function(thrown) { return thrown.message === 'Should not throw'; });
    });

    it('Assert equal on coerced but unequal int/string values should throw an exception', function () {
        expect(function() {Assert.equal(3, "4", "Should throw")}).toThrowMatching(function(thrown) { return thrown.message === 'Should throw'; });
    });

    it('Assert equal on coerced but equal bool/string values should not throw an exception', function () {
        expect(function() {Assert.equal(true, "1", "Should not throw")}).not.toThrowMatching(function(thrown) { return thrown.message === 'Should not throw'; });
    });

    it('Assert equal on coerced but unequal bool/string values should throw an exception', function () {
        expect(function() {Assert.equal(true, "0", "Should throw")}).toThrowMatching(function(thrown) { return thrown.message === 'Should throw'; });
    });

    it('Assert equal on coerced but equal undefined/null values should not throw an exception', function () {
        expect(function() {Assert.equal(undefined, null, "Should not throw")}).not.toThrowMatching(function(thrown) { return thrown.message === 'Should not throw'; });
    });

    it('Assert equal on coerced but unequal undefined/non-null values should throw an exception', function () {
      var nonNull = {};
        expect(function() {Assert.equal(undefined, nonNull, "Should throw")}).toThrowMatching(function(thrown) { return thrown.message === 'Should throw'; });
    });

    it('Assert equal on coerced but equal bool/string values should throw an exception', function () {
        expect(function() {Assert.equal(true, 'true', "Should throw")}).toThrowMatching(function(thrown) { return thrown.message === 'Should throw'; });
    });

    it('Assert equal on coerced but unequal bool/string values should throw an exception', function () {
      var nonNull = {};
        expect(function() {Assert.equal(true, 'false', "Should throw")}).toThrowMatching(function(thrown) { return thrown.message === 'Should throw'; });
    });

    it('Assert equal on coerced but equal objects values should not throw an exception', function () {
        expect(function() {Assert.equal("This is a string", new String("This is a string"), "Should not throw")}).not.toThrowMatching(function(thrown) { return thrown.message === 'Should not throw'; });
    });

    it('Assert equal on coerced but unequal objects values should throw an exception', function () {
      var nonNull = {};
        expect(function() {Assert.equal("This is a string", new String("This is a changed string"), "Should throw")}).toThrowMatching(function(thrown) { return thrown.message === 'Should throw'; });
    });

});

describe('SodaCommon Assert strictEqual should work properly', function () {
    it('Assert strictEqual on equal int values should not throw an exception', function () {
        expect(function() {Assert.strictEqual(3, 3, "Should not throw")}).not.toThrowMatching(function(thrown) { return thrown.message === 'Should not throw'; });
    });

    it('Assert strictEqual on coerced but equal int/string values should throw an exception', function () {
        expect(function() {Assert.strictEqual(3, "3", "Should throw")}).toThrowMatching(function(thrown) { return thrown.message === 'Should throw'; });
    });

    it('Assert strictEqual on coerced but unequal int values should throw an exception', function () {
        expect(function() {Assert.strictEqual(3, 4, "Should throw")}).toThrowMatching(function(thrown) { return thrown.message === 'Should throw'; });
    });

    it('Assert strictEqual on coerced but unequal int/string values should throw an exception', function () {
        expect(function() {Assert.strictEqual(3, "4", "Should throw")}).toThrowMatching(function(thrown) { return thrown.message === 'Should throw'; });
    });

    it('Assert strictEqual on coerced but equal bool/string values should not throw an exception', function () {
        expect(function() {Assert.strictEqual(true, true, "Should not throw")}).not.toThrowMatching(function(thrown) { return thrown.message === 'Should not throw'; });
    });

    it('Assert strictEqual on coerced but equal bool/string values should throw an exception', function () {
        expect(function() {Assert.strictEqual(true, "1", "Should throw")}).toThrowMatching(function(thrown) { return thrown.message === 'Should throw'; });
    });

    it('Assert strictEqual on coerced but unequal bool values should throw an exception', function () {
        expect(function() {Assert.strictEqual(true, false, "Should throw")}).toThrowMatching(function(thrown) { return thrown.message === 'Should throw'; });
    });

    it('Assert strictEqual on coerced but unequal bool/string values should throw an exception', function () {
        expect(function() {Assert.strictEqual(true, "0", "Should throw")}).toThrowMatching(function(thrown) { return thrown.message === 'Should throw'; });
    });

    it('Assert strictEqual on coerced but equal undefined/null values should throw an exception', function () {
        expect(function() {Assert.strictEqual(undefined, null, "Should throw")}).toThrowMatching(function(thrown) { return thrown.message === 'Should throw'; });
    });

    it('Assert strictEqual on coerced but unequal undefined/non-null values should throw an exception', function () {
      var nonNull = {};
        expect(function() {Assert.strictEqual(undefined, nonNull, "Should throw")}).toThrowMatching(function(thrown) { return thrown.message === 'Should throw'; });
    });

    it('Assert strictEqual on coerced but equal bool/string values should throw an exception', function () {
        expect(function() {Assert.strictEqual(true, 'true', "Should throw")}).toThrowMatching(function(thrown) { return thrown.message === 'Should throw'; });
    });

    it('Assert strictEqual on coerced but unequal bool/string values should throw an exception', function () {
      var nonNull = {};
        expect(function() {Assert.strictEqual(true, 'false', "Should throw")}).toThrowMatching(function(thrown) { return thrown.message === 'Should throw'; });
    });

    it('Assert strictEqual on coerced but equal objects values should throw an exception', function () {
        expect(function() {Assert.strictEqual("This is a string", new String("This is a string"), "Should throw")}).toThrowMatching(function(thrown) { return thrown.message === 'Should throw'; });
    });

    it('Assert strictEqual on coerced but unequal objects values should throw an exception', function () {
      var nonNull = {};
        expect(function() {Assert.strictEqual("This is a string", new String("This is a changed string"), "Should throw")}).toThrowMatching(function(thrown) { return thrown.message === 'Should throw'; });
    });
});

describe('SodaCommon Assert notEqual should work properly', function () {
    it('Assert notEqual on coerced but equal int/string values should throw an exception', function () {
        expect(function() {Assert.notEqual(3, "3", "Should throw")}).toThrowMatching(function(thrown) { return thrown.message === 'Should throw'; });
    });

    it('Assert notEqual on coerced but unequal int/string values should not throw an exception', function () {
        expect(function() {Assert.notEqual(3, "4", "Should not throw")}).not.toThrowMatching(function(thrown) { return thrown.message === 'Should not throw'; });
    });

    it('Assert notEqual on coerced but equal bool/string values should throw an exception', function () {
        expect(function() {Assert.notEqual(true, "1", "Should throw")}).toThrowMatching(function(thrown) { return thrown.message === 'Should throw'; });
    });

    it('Assert notEqual on coerced but unequal bool/string values should not throw an exception', function () {
        expect(function() {Assert.notEqual(true, "0", "Should not throw")}).not.toThrowMatching(function(thrown) { return thrown.message === 'Should not throw'; });
    });

    it('Assert notEqual on coerced but equal undefined/null values should throw an exception', function () {
        expect(function() {Assert.notEqual(undefined, null, "Should throw")}).toThrowMatching(function(thrown) { return thrown.message === 'Should throw'; });
    });

    it('Assert notEqual on coerced but unequal undefined/non-null values should not throw an exception', function () {
      var nonNull = {};
        expect(function() {Assert.notEqual(undefined, nonNull, "Should not throw")}).not.toThrowMatching(function(thrown) { return thrown.message === 'Should not throw'; });
    });

    it('Assert notEqual on coerced but equal bool/string values should not throw an exception', function () {
        expect(function() {Assert.notEqual(true, 'true', "Should not throw")}).not.toThrowMatching(function(thrown) { return thrown.message === 'Should not throw'; });
    });

    it('Assert notEqual on coerced but unequal bool/string values should not throw an exception', function () {
      var nonNull = {};
        expect(function() {Assert.notEqual(true, 'false', "Should not throw")}).not.toThrowMatching(function(thrown) { return thrown.message === 'Should not throw'; });
    });

    it('Assert notEqual on coerced but equal objects values should throw an exception', function () {
        expect(function() {Assert.notEqual("This is a string", new String("This is a string"), "Should throw")}).toThrowMatching(function(thrown) { return thrown.message === 'Should throw'; });
    });

    it('Assert notEqual on coerced but unequal objects values should not throw an exception', function () {
      var nonNull = {};
        expect(function() {Assert.notEqual("This is a string", new String("This is a changed string"), "Should not throw")}).not.toThrowMatching(function(thrown) { return thrown.message === 'Should not throw'; });
    });

});

describe('SodaCommon Assert strictNotEqual should work properly', function () {
    it('Assert strictNotEqual on equal int values should throw an exception', function () {
        expect(function() {Assert.strictNotEqual(3, 3, "Should throw")}).toThrowMatching(function(thrown) { return thrown.message === 'Should throw'; });
    });

    it('Assert strictNotEqual on coerced but equal int/string values should not throw an exception', function () {
        expect(function() {Assert.strictNotEqual(3, "3", "Should not throw")}).not.toThrowMatching(function(thrown) { return thrown.message === 'Should not throw'; });
    });

    it('Assert strictNotEqual on coerced but unequal int values should not throw an exception', function () {
        expect(function() {Assert.strictNotEqual(3, 4, "Should not throw")}).not.toThrowMatching(function(thrown) { return thrown.message === 'Should not throw'; });
    });

    it('Assert strictNotEqual on coerced but unequal int/string values should not throw an exception', function () {
        expect(function() {Assert.strictNotEqual(3, "4", "Should not throw")}).not.toThrowMatching(function(thrown) { return thrown.message === 'Should not throw'; });
    });

    it('Assert strictNotEqual on coerced but equal bool/string values should throw an exception', function () {
        expect(function() {Assert.strictNotEqual(true, true, "Should throw")}).toThrowMatching(function(thrown) { return thrown.message === 'Should throw'; });
    });

    it('Assert strictNotEqual on coerced but equal bool/string values should not throw an exception', function () {
        expect(function() {Assert.strictNotEqual(true, "1", "Should not throw")}).not.toThrowMatching(function(thrown) { return thrown.message === 'Should not throw'; });
    });

    it('Assert strictNotEqual on coerced but unequal bool values should not throw an exception', function () {
        expect(function() {Assert.strictNotEqual(true, false, "Should not throw")}).not.toThrowMatching(function(thrown) { return thrown.message === 'Should not throw'; });
    });

    it('Assert strictNotEqual on coerced but unequal bool/string values should not throw an exception', function () {
        expect(function() {Assert.strictNotEqual(true, "0", "Should not throw")}).not.toThrowMatching(function(thrown) { return thrown.message === 'Should not throw'; });
    });

    it('Assert strictNotEqual on coerced but equal undefined/null values should not throw an exception', function () {
        expect(function() {Assert.strictNotEqual(undefined, null, "Should not throw")}).not.toThrowMatching(function(thrown) { return thrown.message === 'Should not throw'; });
    });

    it('Assert strictNotEqual on coerced but unequal undefined/non-null values should not throw an exception', function () {
      var nonNull = {};
        expect(function() {Assert.strictNotEqual(undefined, nonNull, "Should not throw")}).not.toThrowMatching(function(thrown) { return thrown.message === 'Should not throw'; });
    });

    it('Assert strictNotEqual on coerced but equal bool/string values should not throw an exception', function () {
        expect(function() {Assert.strictNotEqual(true, 'true', "Should not throw")}).not.toThrowMatching(function(thrown) { return thrown.message === 'Should not throw'; });
    });

    it('Assert strictNotEqual on coerced but unequal bool/string values should not throw an exception', function () {
      var nonNull = {};
        expect(function() {Assert.strictNotEqual(true, 'false', "Should not throw")}).not.toThrowMatching(function(thrown) { return thrown.message === 'Should not throw'; });
    });

    it('Assert strictNotEqual on coerced but equal objects values should not throw an exception', function () {
        expect(function() {Assert.strictNotEqual("This is a string", new String("This is a string"), "Should not throw")}).not.toThrowMatching(function(thrown) { return thrown.message === 'Should not throw'; });
    });

    it('Assert strictNotEqual on coerced but unequal objects values should not throw an exception', function () {
      var nonNull = {};
        expect(function() {Assert.strictNotEqual("This is a string", new String("This is a changed string"), "Should not throw")}).not.toThrowMatching(function(thrown) { return thrown.message === 'Should not throw'; });
    });
});
