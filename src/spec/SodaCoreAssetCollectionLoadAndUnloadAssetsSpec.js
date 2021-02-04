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
    AssetCollection = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "AssetCollection")),
    Asset = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "Asset")),
    fs    = require("fs");

require(path.join(__dirname, "..", "SodaCommon", "ProtoLib"));

describe('AssetCollection should pass all validation tests', function () {
  var soda, spy, savedMethod;

    beforeAll(function (done) {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 300000;

      savedMethod = fs.writeFile;

      fs.rmdirSync(path.join(__dirname, '..', 'sample_project', 'new_suite'), { recursive: true });
      soda = new Soda({ testPath: path.join(__dirname, '..', 'sample_project'), logSupressed: true });
      soda.init(function() {
        soda.config.set("headless", true, true, true);
        
        soda.cleanTestResults(soda.config.get('testResultsPath'), function(err, assetCollection) {
          fs.mkdir(path.join(soda.config.get('testResultsPath'), soda.config.get("testResultsDir")), function() {
            done();
          });
        });
      });
    });

    beforeEach(function() {
      spy = sinon.spy(fs, 'writeFile');
    });
  
    afterEach(function() {
      spy.restore();
    });

    afterAll(function (done) {
      fs.writeFile = savedMethod;

      soda.kill();
      
      soda = null;

      done();
    });

    it('CoreAsset Collection Should validate properties of a new asset collection on a valid filesystem path', function (done) {
      var assetCollection = new AssetCollection(soda, path.join(__dirname, '..', 'sample_project'));

      assetCollection.load(function(err, result) {
        expect(assetCollection.getAllSuites()).toBeInstanceOf(Object);
        expect(assetCollection.getAllSuites().sodamembers).toEqual(2);
        expect(assetCollection.getSuite('my_suite').name).toEqual('my_suite');
        expect(assetCollection.getAllModules()).toBeInstanceOf(Object);
        expect(assetCollection.getAllModules().sodamembers).toEqual(2);
        expect(assetCollection.getAllModules().global).toBeInstanceOf(Object);

        assetCollection.unload();
        expect(assetCollection.getAllSuites()).toEqual(null);

        done();
      });
    });

    it('Should load and unload assets for a valid filesystem path', function (done) {
      var assetCollection = new AssetCollection(soda, path.join(__dirname, '..', 'sample_project'));

      assetCollection.load(function(err, result) {
        expect(assetCollection.getAllSuites()).toBeInstanceOf(Object);
        expect(assetCollection.getAllSuites().sodamembers).toEqual(2);

        assetCollection.unload();
        expect(assetCollection.getAllSuites()).toEqual(null);

        done();
      });
    });

    it('Should load, unload, and reload assets for a valid filesystem path', function (done) {
      var assetCollection = new AssetCollection(soda, path.join(__dirname, '..', 'sample_project'));

      assetCollection.load(function(err, result) {
        expect(assetCollection.getAllSuites()).toBeInstanceOf(Object);
        expect(assetCollection.getAllSuites().sodamembers).toEqual(2);

        assetCollection.unload();
        expect(assetCollection.getAllSuites()).toEqual(null);

        assetCollection.reload(function(err, result) {
          expect(assetCollection.getAllSuites()).toBeInstanceOf(Object);
          expect(assetCollection.getAllSuites().sodamembers).toEqual(2);

          assetCollection.unload();
          expect(assetCollection.getAllSuites()).toEqual(null);

          done();
        });
      });
    });
});
