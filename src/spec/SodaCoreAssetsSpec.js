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
    Assets = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "Assets"));

require(path.join(__dirname, "..", "SodaCommon", "ProtoLib"));

describe('Assets should pass all validation tests', function () {
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

    it('Should load all assets', function (done) {
      soda.loadAssets(path.join(__dirname, '..', 'sample_project'), function(err, assetCollection) {

        var assets = new Assets(soda);

        assets.load(path.join(__dirname, '..', 'sample_project'), function(err, assetCollection) {
          setTimeout(function() {
            expect(assetCollection.getAllSuites()).toBeInstanceOf(Object);
            expect(assets.collections().sodamembers).toEqual(1);
            expect(assetCollection.getAllSuites().sodamembers).toEqual(2);
          }, 2000);

          done();
        });
      });
    });

    it('Should reload all assets', function (done) {
      soda.loadAssets(path.join(__dirname, '..', 'sample_project'), function(err, assetCollection) {

        var assets = new Assets(soda);

        assets.load(path.join(__dirname, '..', 'sample_project'), function(err, assetCollection) {
          setTimeout(function() {
            expect(assetCollection.getAllSuites()).toBeInstanceOf(Object);
            expect(assets.collections().sodamembers).toEqual(1);
            expect(assetCollection.getAllSuites().sodamembers).toEqual(2);

            assets.reload();
            expect(assets.collections()).toBeInstanceOf(Object);
            expect(assets.collections().sodamembers).toEqual(1);

            done();
          }, 2000);
        });
      });
    });

    it('Should destroy all assets', function (done) {
      soda.loadAssets(path.join(__dirname, '..', 'sample_project'), function(err, assetCollection) {

        var assets = new Assets(soda);

        assets.destroy();
        expect(assets.collections().sodamembers).toEqual(0);

        done();
      });
    });

    it('Should delete all assets', function (done) {
      soda.loadAssets(path.join(__dirname, '..', 'sample_project'), function(err, assetCollection) {

        var assets = new Assets(soda);

        assets.delete;
        expect(assets.collections().sodamembers).toEqual(0);

        done();
      });
    });
});
