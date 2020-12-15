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
    Module = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "Module")),
    Platform = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "Platform"));

require(path.join(__dirname, "..", "SodaCommon", "ProtoLib"));

describe('Module should pass all validation tests', function () {
  var soda, action;

    beforeAll(function (done) {
      soda = new Soda({ testPath: path.join(__dirname, '..', 'sample_project'), logSupressed: true }).init();

      done();
    });

    afterAll(function (done) {
      soda.kill();

      soda = null;
      
      done();
    });

    it('Should validate properties of a new unnamed module', function (done) {
      var module = new Module("my_suite");
      expect(module.name).toEqual("Unnamed module");
      expect(module.ignore).toEqual(false);
      expect(module.getPlatforms()["generic"].name).toEqual("generic");
      expect(module.getPlatform("generic").name).toEqual("generic");
      expect(module.getPlatform("web")).toEqual(null);

      done();
    });

    it('Should validate properties of a new module', function (done) {
      var module = new Module("my_suite", "my_module");
      expect(module.suite).toEqual("my_suite");
      expect(module.name).toEqual("my_module");
      expect(module.ignore).toEqual(false);
      expect(module.getPlatforms()["generic"].name).toEqual("generic");
      expect(module.getPlatform("generic").name).toEqual("generic");
      expect(module.getPlatform("web")).toEqual(null);

      done();
    });

    it('Should validate adding platforms for a new module', function (done) {
      var module = new Module("my_suite", "my_module");
      expect(module.suite).toEqual("my_suite");
      expect(module.name).toEqual("my_module");
      expect(module.ignore).toEqual(false);
      expect(module.getPlatforms()["generic"].name).toEqual("generic");
      expect(module.getPlatform("generic").name).toEqual("generic");
      expect(module.getPlatform("web")).toEqual(null);
      module.addPlatform('web');
      expect(module.getPlatforms()["generic"].name).toEqual("generic");
      expect(module.getPlatforms()["web"].name).toEqual("web");
      expect(module.getPlatform("web").name).toEqual('web');

      done();
    });

    it('Should validate adding a platform to a new module', function (done) {
      var module = new Module("my_suite", "my_module");
      var platform = new Platform("my_suite", "my_module", "web");
      module.addPlatform(platform);
      expect(module.suite).toEqual("my_suite");
      expect(module.name).toEqual("my_module");
      expect(module.ignore).toEqual(false);
      expect(module.getPlatforms()["generic"].name).toEqual("generic");
      expect(module.getPlatform("generic").name).toEqual("generic");
      expect(module.getPlatforms()["web"].name).toEqual("web");
      expect(module.getPlatform("web").name).toEqual('web');

      done();
    });

    it ('Should validate adding a mapping', function (done) {
      var module = new Module("my_suite", "my_module");

      var map = {
          "name": "my_module",
          "description": "My module",
          "id": "a07ebbcf858402fbacf85b854b23c302",
          "created": 1453173524035,
          "map": {
              "GOOGLE_SEARCH_INPUT_FIELD": {
                  "web": "*[type='input'][attributes.type='text']"
              },
              "GOOGLE_SEARCH_SEARCH_BUTTON": {
                  "web": "^btnK[type='input'][attributes.type='submit'][nth='last']"
              }
          }
      };

      expect(module.mapping.sodamembers).toEqual(0);
      module.addToMapping(map);
      expect(module.mapping.sodamembers).toEqual(1);
      module.resetMapping();
      expect(module.mapping.sodamembers).toEqual(0);

      done();
    });
});
