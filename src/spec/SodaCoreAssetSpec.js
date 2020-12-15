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
    Asset = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "Asset"));

require(path.join(__dirname, "..", "SodaCommon", "ProtoLib"));

describe('Asset should pass all validation tests', function () {
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

    it('CoreAsset Should validate properties of a new asset', function (done) {
      soda.loadAssets(path.join(__dirname, '..', 'sample_project'), function(err, assetCollection) {

        var asset = new Asset(soda, 'my_suite', 'my_module', 'web', 'new_action', path.join(__dirname, '..', 'sample_project', 'my_suite', 'modules', 'my_module', 'actions', 'new_action.json'));

        expect(asset.module).toEqual('my_module');
        expect(asset.platform).toEqual('web');
        expect(asset.suite).toEqual('my_suite');
        expect(asset.name).toEqual('new_action');
        expect(asset.humanName).toEqual('new_action');
        expect(asset.description).toEqual(null);
        expect(asset.id).toEqual(null);
        expect(asset.widget).toEqual(false);
        expect(JSON.stringify(asset.syntax)).toEqual(JSON.stringify({ name: null, version: null }));
        expect(asset.path).toEqual(path.join(__dirname, '..', 'sample_project', 'my_suite', 'modules', 'my_module', 'actions', 'new_action.json'));
        expect(asset.getContents()).toEqual(asset);

        done();
      });
    });

    it('Should validate setters and getters', function (done) {
      soda.loadAssets(path.join(__dirname, '..', 'sample_project'), function(err, assetCollection) {

        var asset = new Asset(soda, 'my_suite', 'my_module', 'web', 'new_action', path.join(__dirname, '..', 'sample_project', 'my_suite', 'modules', 'my_module', 'actions', 'new_action.json'));

        asset.setName('new-action');
        expect(asset.name).toEqual('new-action');
        expect(asset.humanName).toEqual('new_action');
        asset.setHumanName('New Action');
        expect(asset.name).toEqual('new-action');
        expect(asset.humanName).toEqual('New Action');
        expect(asset.description).toEqual(null);
        asset.setDescription('This is a description of a new action');
        expect(asset.description).toEqual('This is a description of a new action');
        expect(asset.id).toEqual(null);
        asset.setId('new-action');
        expect(asset.id).toEqual('new-action');
        expect(JSON.stringify(asset.syntax)).toEqual(JSON.stringify({ name: null, version: null }));
        asset.setSyntax({ name: 'web', version: '1.0' });
        expect(JSON.stringify(asset.syntax)).toEqual(JSON.stringify({ name: 'web', version: '1.0' }));
        expect(asset.getContents()).toEqual(asset);
        asset.setContents({assert:".name", exists: true});
        asset.setName('new-action-test');
        expect(asset.name).toEqual('new-action-test');
        asset.setHumanName('New Action Test');
        expect(asset.humanName).toEqual('New Action Test');
        asset.setDescription('This is a description of a new action test');
        expect(asset.description).toEqual('This is a description of a new action test');
        asset.setId('new-action-test');
        expect(asset.id).toEqual('new-action-test');
        asset.setSyntax({ name: 'web', version: '2.0' });
        expect(JSON.stringify(asset.syntax)).toEqual(JSON.stringify({ name: 'web', version: '2.0' }));
        expect(asset.getContents()).toBeInstanceOf(Object);
        expect(asset.module).toEqual('my_module');
        expect(asset.platform).toEqual('web');
        expect(asset.suite).toEqual('my_suite');
        expect(asset.name).toEqual('new-action-test');
        expect(asset.humanName).toEqual('New Action Test');
        expect(asset.description).toEqual('This is a description of a new action test');
        expect(asset.id).toEqual('new-action-test');
        expect(asset.widget).toEqual(false);
        expect(JSON.stringify(asset.syntax)).toEqual(JSON.stringify({ name: 'web', version: '2.0' }));
        expect(asset.path).toEqual(path.join(__dirname, '..', 'sample_project', 'my_suite', 'modules', 'my_module', 'actions', 'new_action.json'));
        expect(asset.getContents()).toEqual(asset);

        done();
      });
    });
});
