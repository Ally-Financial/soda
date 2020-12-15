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

    it ('Should be able to create a suite, module, and an asset (action) and then delete them all', function (done) {
      var assetCollection = new AssetCollection(soda, path.join(__dirname, '..', 'sample_project'));

      assetCollection.load(function(err, result) {
        expect(assetCollection.getAllSuites()).toBeInstanceOf(Object);
        expect(assetCollection.getAllSuites().sodamembers).toEqual(2);

        assetCollection.makeSuite('new_suite', function(err) {
          setTimeout(function() {
            assetCollection.reload(function(err, result) {
              expect(assetCollection.getAllSuites()).toBeInstanceOf(Object);
              expect(assetCollection.getAllSuites().sodamembers).toEqual(3);

              assetCollection.makeModule('new_suite', 'new_module', function(err) {
                setTimeout(function() {
                  assetCollection.reload(function(err, result) {
                    expect(assetCollection.getAllModules().sodamembers).toEqual(3);

                    var asset = new Asset(soda, 'new_suite', 'new_module', 'web', 'new-action', path.join(__dirname, '..', 'sample_project', 'new_suite', 'modules', 'new_module', 'actions', 'new-action.json'));

                    asset.setName('new-action');
                    asset.setHumanName('New Action');
                    asset.setDescription('This is a description of a new action');
                    asset.setId('new-action');
                    asset.setSyntax({ name: 'web', version: '1.0' });
                    asset.type = 'action';
                    asset.setContents({
                        "meta": {
                            "name": asset.name,
                            "id": asset.id,
                            "description": asset.description,
                            "syntax": asset.syntax
                        },
                        "actions": [
                            {
                                "click": ".rc[nth=0] *[type='a'][nth='first']"
                            }
                        ]
                    });

                    assetCollection.makeAsset(asset, function(err) {
                      expect(err).toEqual(null);

                      setTimeout(function() {
                        assetCollection.deleteAsset(asset, function(err) {
                            assetCollection.deleteModule('new_suite', 'new_module', function(err) {
                              setTimeout(function() {                                
                                assetCollection.reload(function(err, result) {                                  
                                    expect(assetCollection.getAllModules().sodamembers).toEqual(3);
    
                                    assetCollection.deleteSuite('new_suite', function(err) {
                                      setTimeout(function() { 
                                        assetCollection.reload(function(err, result) {
                                          expect(assetCollection.getAllSuites()).toBeInstanceOf(Object);
                                          expect(assetCollection.getAllSuites().sodamembers).toEqual(2);

                                          assetCollection.unload();
                                          expect(assetCollection.getAllSuites()).toEqual(null);
    
                                          done();
                                        });
                                      }, 5000);
                                    });
                                });
                              }, 5000);
                            });
                          });
                        });
                    });
                  });
                }, 5000);
              });
            });
          }, 5000);
        });
      });
    });
});
