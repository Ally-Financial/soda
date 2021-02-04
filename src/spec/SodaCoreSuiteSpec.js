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
    Soda   = require(path.join(__dirname, "..", "SodaCore", "lib", "Soda")),
    Suite = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "Suite")),
    Module = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "Module")),
    AssetCollection = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "AssetCollection"));

require(path.join(__dirname, "..", "SodaCommon", "ProtoLib"));

describe('Suite should pass all validation tests', function () {
  var soda, action;

    beforeAll(function (done) {
      soda = new Soda({ testPath: path.join(__dirname, '..', 'sample_project'), logSupressed: true });

      soda.init(function() {
        soda.config.set("headless", true, true, true);
        
        done();
      });
    });

    afterAll(function (done) {
      soda.kill();
      
      soda = null;
      
      done();
    });

    it('Should validate properties of a new unnamed suite', function (done) {
      var suite = new Suite();
      expect(suite.name).toEqual("Unnamed suite");
      expect(suite.getModules().sodamembers).toEqual(0);

      done();
    });

    it('Should validate properties of a new suite with no asset collection', function (done) {
      var suite = new Suite(null, "my_suite");
      expect(suite.name).toEqual("my_suite");
      expect(suite.getModules().sodamembers).toEqual(0);

      done();
    });

    it('Should validate properties of a new suite with an asset collection', function (done) {
      var assetCollection = new AssetCollection(soda, path.join(__dirname, '..', 'sample_project'));
      var suite = new Suite(assetCollection, "my_suite");
      expect(suite.name).toEqual("my_suite");
      expect(suite.getModules().sodamembers).toEqual(0);

      done();
    });

    it('Should validate properties of a new suite with an asset collection', function (done) {
      var assetCollection = new AssetCollection(soda, path.join(__dirname, '..', 'sample_project'));
      var suite = new Suite(assetCollection, "my_suite");
      expect(suite.name).toEqual("my_suite");
      expect(suite.getModules().sodamembers).toEqual(0);

      done();
    });

    it('Should add and get a module (named) with a collection', function (done) {
      var assetCollection = new AssetCollection(soda, path.join(__dirname, '..', 'sample_project'));
      var suite = new Suite(assetCollection, "my_suite");
      expect(suite.name).toEqual("my_suite");
      expect(suite.getModules().sodamembers).toEqual(0);

      suite.addModule('my_module');

      expect(suite.getModules().sodamembers).toEqual(1);
      expect(suite.getModule('my_module').name).toEqual('my_module');
      expect(suite.getModule('my_module').sodamembers).toEqual(10);

      done();
    });

    it('Should add and get a module (named) with no collection', function (done) {
      var suite = new Suite(null, "my_suite");
      expect(suite.name).toEqual("my_suite");
      expect(suite.getModules().sodamembers).toEqual(0);

      suite.addModule('my_module');

      expect(suite.getModules().sodamembers).toEqual(1);
      expect(suite.getModule('my_module').name).toEqual('my_module');
      expect(suite.getModule('my_module').sodamembers).toEqual(10);

      done();
    });

    it('Should add and get a module (named) with no collection', function (done) {
      var suite = new Suite(null, "my_suite");
      expect(suite.name).toEqual("my_suite");
      expect(suite.getModules().sodamembers).toEqual(0);

      var module = new Module("my_suite", "my_module");
      suite.addModule(module);

      expect(suite.getModules().sodamembers).toEqual(1);
      expect(suite.getModule('my_module').name).toEqual('my_module');
      expect(suite.getModule('my_module').sodamembers).toEqual(10);

      done();
    });

    it ('Should validate adding a mapping', function (done) {
      var assetCollection = new AssetCollection(soda, path.join(__dirname, '..', 'sample_project'));
      var suite = new Suite(assetCollection, "my_suite");

      var map = {
          "name": "my_suite",
          "description": "My suite",
          "id": "32d6f9858438777f813185cc7ca84b5b",
          "created": 1453173524032,
          "map": {
              "GOOGLE_SEARCH_INPUT_FIELD": {
                  "web": "*[type='input'][attributes.type='text']"
              }
          }
      };

      expect(suite.mapping.sodamembers).toEqual(0);
      suite.addToMapping(map);
      expect(suite.mapping.sodamembers).toEqual(1);
      suite.resetMapping();
      expect(suite.mapping.sodamembers).toEqual(0);

      done();
    });
});
