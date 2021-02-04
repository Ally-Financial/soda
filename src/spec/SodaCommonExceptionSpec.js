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
    Exception   = require(path.join(__dirname, "..", "SodaCommon", "Exception"));

describe('SodaCommon Exception should provide proper error classes', function () {
    it('Assert SodaGenericError should throw with correct text', function () {
      expect(function() { throw new Exception.SodaGenericError("soda GenericError")} ).toThrowMatching(function(thrown) { return thrown.message === 'soda GenericError' } );
    });

    it('Assert SodaGenericError should throw with correct text', function () {
      expect(function() { throw new Exception.ConfigurationError("soda ConfigurationError")} ).toThrowMatching(function(thrown) { return thrown.message === 'soda ConfigurationError' } );
    });

    it('Assert ExecutionError should throw with correct text', function () {
      expect(function() { throw new Exception.ExecutionError("soda ExecutionError")} ).toThrowMatching(function(thrown) { return thrown.message === 'soda ExecutionError' } );
    });

    it('Assert IOError should throw with correct text', function () {
      expect(function() { throw new Exception.IOError("soda IOError")} ).toThrowMatching(function(thrown) { return thrown.message === 'soda IOError' } );
    });

    it('Assert InvalidFrameworkError should throw with correct text', function () {
      expect(function() { throw new Exception.InvalidFrameworkError("soda InvalidFrameworkError")} ).toThrowMatching(function(thrown) { return thrown.message === 'soda InvalidFrameworkError' } );
    });

    it('Assert InvalidFrameworkArguments should throw with correct text', function () {
      expect(function() { throw new Exception.InvalidFrameworkArguments("soda InvalidFrameworkArguments")} ).toThrowMatching(function(thrown) { return thrown.message === 'soda InvalidFrameworkArguments' } );
    });

    it('Assert NoFrameworkStartedError should throw with correct text', function () {
      expect(function() { throw new Exception.NoFrameworkStartedError("soda NoFrameworkStartedError")} ).toThrowMatching(function(thrown) { return thrown.message === 'soda NoFrameworkStartedError' } );
    });

    it('Assert REPLError should throw with correct text', function () {
      expect(function() { throw new Exception.REPLError("soda REPLError")} ).toThrowMatching(function(thrown) { return thrown.message === 'soda REPLError' } );
    });

    it('Assert ElementNotFoundError should throw with correct text', function () {
      expect(function() { throw new Exception.ElementNotFoundError("soda ElementNotFoundError")} ).toThrowMatching(function(thrown) { return thrown.message === 'soda ElementNotFoundError' } );
    });

    it('Assert InvalidElementError should throw with correct text', function () {
      expect(function() { throw new Exception.InvalidElementError("soda InvalidElementError")} ).toThrowMatching(function(thrown) { return thrown.message === 'soda InvalidElementError' } );
    });

    it('Assert InvalidActionError should throw with correct text', function () {
      expect(function() { throw new Exception.InvalidActionError("soda InvalidActionError")} ).toThrowMatching(function(thrown) { return thrown.message === 'soda InvalidActionError' } );
    });

    it('Assert InvalidDefinitionError should throw with correct text', function () {
      expect(function() { throw new Exception.InvalidDefinitionError("soda InvalidDefinitionError")} ).toThrowMatching(function(thrown) { return thrown.message === 'soda InvalidDefinitionError' } );
    });


    it('Assert OrphanedActionError should throw with correct text', function () {
      expect(function() { throw new Exception.OrphanedActionError("soda OrphanedActionError")} ).toThrowMatching(function(thrown) { return thrown.message === 'soda OrphanedActionError' } );
    });

    it('Assert InvalidArgumentsError should throw with correct text', function () {
      expect(function() { throw new Exception.InvalidArgumentsError("soda InvalidArgumentsError")} ).toThrowMatching(function(thrown) { return thrown.message === 'soda InvalidArgumentsError' } );
    });

    it('Assert InvalidSyntaxError should throw with correct text', function () {
      expect(function() { throw new Exception.InvalidSyntaxError("soda InvalidSyntaxError")} ).toThrowMatching(function(thrown) { return thrown.message === 'soda InvalidSyntaxError' } );
    });

    it('Assert AssetsParseError should throw with correct text', function () {
      expect(function() { throw new Exception.AssetsParseError("soda AssetsParseError")} ).toThrowMatching(function(thrown) { return thrown.message === 'soda AssetsParseError' } );
    });

    it('Assert AssetGenericError should throw with correct text', function () {
      expect(function() { throw new Exception.AssetGenericError("soda AssetGenericError")} ).toThrowMatching(function(thrown) { return thrown.message === 'soda AssetGenericError' } );
    });

    it('Assert AssetNotFoundError should throw with correct text', function () {
      expect(function() { throw new Exception.AssetNotFoundError("soda AssetNotFoundError")} ).toThrowMatching(function(thrown) { return thrown.message === 'soda AssetNotFoundError' } );
    });

    it('Assert AssetNoDriverLoadedError should throw with correct text', function () {
      expect(function() { throw new Exception.AssetNoDriverLoadedError("soda AssetNoDriverLoadedError")} ).toThrowMatching(function(thrown) { return thrown.message === 'soda AssetNoDriverLoadedError' } );
    });

    it('Assert AssertionError should throw with correct text', function () {
      expect(function() { throw new Exception.AssertionError({ message: 'soda AssertionError', actual: true, excepted: false, operator: null})} ).toThrowMatching(function(thrown) { return thrown.message === 'soda AssertionError' } );
    });

    it('Assert ElementAssertionError should throw with correct text', function () {
      expect(function() { throw new Exception.ElementAssertionError({ message: 'soda ElementAssertionError', id: 'id', idtype: "string" }) } ).toThrowMatching(function(thrown) { return thrown.message === 'soda ElementAssertionError' } );
    });
});
