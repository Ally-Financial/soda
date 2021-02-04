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
    Framework   = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "Framework")),
    Asset   = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "Asset")),
    action   = require(path.join(__dirname, "..", "SodaCore", "lib", "Action")),
    Tree = require(path.join(__dirname, "..", "SodaCore", "lib", "Tree")),
    fs     = require("fs");

require(path.join(__dirname, "..", "SodaCommon", "ProtoLib"));

describe('Core Action should pass all validation tests', function () {
  var soda, framework, tree, savedMethod1, savedMethod2, savedMethod3, spy, spy1, spy2, stub;

    beforeAll(function (done) {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;

      savedMethod1 = fs.access;
      savedMethod2 = fs.writeFile;
      savedMethod3 = console.log;

      soda = new Soda({ testPath: path.join(__dirname, '..', 'sample_project'), logSupressed: true });

      soda.init(function() {
        soda.config.set("headless", true, true, true);
        framework = new Framework(soda);
        framework.load('selenium');
        soda.framework = framework;

        expect(framework.name).toEqual('Selenium');
        expect(framework.version).toEqual('1.0');
        expect(framework.platform).toEqual('Web');
        expect(framework.args).toEqual(undefined);
        expect(framework.started).toEqual(false);
        expect(framework.device).toEqual(undefined);
        expect(framework.process).toEqual(undefined);
        expect(framework.defaultSyntaxName).toEqual('web');

        done();
      });

    });

    beforeEach(function(done) {
      spy = sinon.spy(fs, "access");
      spy1 = sinon.spy(fs, "writeFile");
      spy2 = sinon.spy(console, 'log');

      done();
    });

    afterEach(function(done) {
      spy.restore();
      spy1.restore();
      spy2.restore();

      done();
    });

    afterAll(function (done) {
      fs.access = savedMethod1;
      fs.writeFile = savedMethod2;
      console.log = savedMethod3;

      soda.kill();

      soda = null;
      
      done();
    });
    
    it('CoreAction Should validate properties of a new asset', function (done) {
      framework.start("chrome", "http://www.google.com", function(err, res) {
        expect(err).toEqual(null);
        expect(res).toEqual(true);
        
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
                    "click": "*[type='input'][attributes.type='text']"
                }
            ]
        });

        var Action = action(soda);
        var tempAction = new Action(asset);
        tree     = new Tree(JSON.parse(fs.readFileSync(path.join(__dirname, "trees", "LoginScreen.json")).toString('utf-8')));

        tempAction.evaluate(function(err, result) {
          expect(err).toEqual(null);
          expect(result).toEqual(true);

          framework.stop(function () {
            done();
          });
        }, tree.elements);

      });
    });
});
