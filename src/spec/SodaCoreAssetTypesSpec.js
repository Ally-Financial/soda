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
    Asset = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "Asset")),
    assetTypes   = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "AssetTypes")),
    Test    = assetTypes.Test,
    Menu    = assetTypes.Menu,
    Screen  = assetTypes.Screen,
    Action  = assetTypes.Action,
    Popup   = assetTypes.Popup;

require(path.join(__dirname, "..", "SodaCommon", "ProtoLib"));

describe('AssetTypes should pass all validation tests', function () {
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

    it('Should validate properties of an Action type', function (done) {
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

      var action = new Action(soda, asset.suite, asset.module, asset.platform, asset.name, path.join(__dirname, '..', 'sample_project', 'new_suite', 'modules', 'new_module', 'actions', 'new-action.json'));
      action.setId('new-action');
      action.setHumanName('New Action');
      action.setSyntax({ name: 'web', version: '1.0' });
      action.setDescription('This is a description of a new action');
      action.setContents({
          "meta": {
              "name": action.name,
              "id": action.id,
              "description": action.description,
              "syntax": action.syntax
          },
          "actions": [
              {
                  "click": ".rc[nth=0] *[type='a'][nth='first']"
              }
          ]
      });

      expect(action.suite).toEqual(asset.suite);
      expect(action.module).toEqual(asset.module);
      expect(action.platform).toEqual(asset.platform);
      expect(action.name).toEqual(asset.name);
      expect(action.id).toEqual(asset.id);
      expect(action.description).toEqual(asset.description);
      expect(action.syntax.name).toEqual(asset.syntax.name);
      expect(action.syntax.version).toEqual(asset.syntax.version);
      expect(action.path).toEqual(asset.path);
      expect(action.type).toEqual(asset.type);
      expect(JSON.stringify(action.getContents())).toEqual(JSON.stringify(asset.getContents()));

      done();
    });

    it('Should validate properties of a Test type', function (done) {
      var asset = new Asset(soda, 'new_suite', 'new_module', 'web', 'new-test', path.join(__dirname, '..', 'sample_project', 'new_suite', 'modules', 'new_module', 'tests', 'new-test.json'));

      asset.setName('new-test');
      asset.setHumanName('New Test');
      asset.setDescription('This is a description of a new test');
      asset.setId('new-test');
      asset.setSyntax({ name: 'web', version: '1.0' });
      asset.type = 'test';
      asset.setContents({
          "meta": {
              "name": asset.name,
              "id": asset.id,
              "description": asset.description,
              "syntax": asset.syntax
          },
          "actions": [
              {
                  "execute": "newtest"
              }
          ]
      });

      var test = new Test(soda, asset.suite, asset.module, asset.platform, asset.name, path.join(__dirname, '..', 'sample_project', 'new_suite', 'modules', 'new_module', 'tests', 'new-test.json'));
      test.setId('new-test');
      test.setHumanName('New Test');
      test.setSyntax({ name: 'web', version: '1.0' });
      test.setDescription('This is a description of a new test');
      test.setContents({
          "meta": {
              "name": test.name,
              "id": test.id,
              "description": test.description,
              "syntax": test.syntax
          },
          "actions": [
              {
                  "execute": "newtest"
              }
          ]
      });

      expect(test.suite).toEqual(asset.suite);
      expect(test.module).toEqual(asset.module);
      expect(test.platform).toEqual(asset.platform);
      expect(test.name).toEqual(asset.name);
      expect(test.id).toEqual(asset.id);
      expect(test.description).toEqual(asset.description);
      expect(test.syntax.name).toEqual(asset.syntax.name);
      expect(test.syntax.version).toEqual(asset.syntax.version);
      expect(test.path).toEqual(asset.path);
      expect(test.type).toEqual(asset.type);
      expect(JSON.stringify(test.getContents())).toEqual(JSON.stringify(asset.getContents()));

      done();
    });

    it('Should validate properties of a Screen type', function (done) {
        var asset = new Asset(soda, 'new_suite', 'new_module', 'web', 'new-screen', path.join(__dirname, '..', 'sample_project', 'new_suite', 'modules', 'new_module', 'screens', 'new-screen.json'));

        asset.setName('new-screen');
        asset.setHumanName('New Screen');
        asset.setDescription('This is a description of a new screen');
        asset.setId('new-screen');
        asset.setSyntax({ name: 'web', version: '1.0' });
        asset.type = 'screen';
        asset.setContents({
          "meta": {
              "name": asset.name,
              "id": asset.id,
              "description": asset.description,
              "syntax": asset.syntax
          },
          "screen": {
              "components": [
                  {
                      "assert": ".rc[nth=0] *[type='a'][nth='first']",
                      "exists": true
                  }
              ]
          }
      });

      var screen = new Screen(soda, asset.suite, asset.module, asset.platform, asset.name, path.join(__dirname, '..', 'sample_project', 'new_suite', 'modules', 'new_module', 'screens', 'new-screen.json'));
      screen.setName('new-screen');
      screen.setHumanName('New Screen');
      screen.setDescription('This is a description of a new screen');
      screen.setId('new-screen');
      screen.setSyntax({ name: 'web', version: '1.0' });
      screen.setContents({
          "meta": {
              "name": screen.name,
              "id": screen.id,
              "description": screen.description,
              "syntax": screen.syntax
          },
          "screen": {
              "components": [
                  {
                      "assert": ".rc[nth=0] *[type='a'][nth='first']",
                      "exists": true
                  }
              ]
          }
      });

      expect(screen.suite).toEqual(asset.suite);
      expect(screen.module).toEqual(asset.module);
      expect(screen.platform).toEqual(asset.platform);
      expect(screen.name).toEqual(asset.name);
      expect(screen.id).toEqual(asset.id);
      expect(screen.description).toEqual(asset.description);
      expect(screen.syntax.name).toEqual(asset.syntax.name);
      expect(screen.syntax.version).toEqual(asset.syntax.version);
      expect(screen.path).toEqual(asset.path);
      expect(screen.type).toEqual(asset.type);
      expect(JSON.stringify(screen.getContents())).toEqual(JSON.stringify(asset.getContents()));

      done();
    });

    it('Should validate properties of a Popup type', function (done) {
        var asset = new Asset(soda, 'new_suite', 'new_module', 'web', 'new-popup', path.join(__dirname, '..', 'sample_project', 'new_suite', 'modules', 'new_module', 'popups', 'new-popup.json'));

        asset.setName('new-popup');
        asset.setHumanName('New Popup');
        asset.setDescription('This is a description of a new popup');
        asset.setId('new-popup');
        asset.setSyntax({ name: 'web', version: '1.0' });
        asset.type = 'popup';
        asset.setContents({
          "meta": {
              "name": asset.name,
              "id": asset.id,
              "description": asset.description,
              "syntax": asset.syntax
          },
          "popup": {
              "components": [
                  {
                      "assert": ".rc[nth=0] *[type='a'][nth='first']",
                      "exists": true
                  }
              ]
          }
      });

      var popup = new Popup(soda, asset.suite, asset.module, asset.platform, asset.name, path.join(__dirname, '..', 'sample_project', 'new_suite', 'modules', 'new_module', 'popups', 'new-popup.json'));
      popup.setName('new-popup');
      popup.setHumanName('New Popup');
      popup.setDescription('This is a description of a new popup');
      popup.setId('new-popup');
      popup.setSyntax({ name: 'web', version: '1.0' });
      popup.setContents({
          "meta": {
              "name": popup.name,
              "id": popup.id,
              "description": popup.description,
              "syntax": popup.syntax
          },
          "popup": {
              "components": [
                  {
                      "assert": ".rc[nth=0] *[type='a'][nth='first']",
                      "exists": true
                  }
              ]
          }
      });

      expect(popup.suite).toEqual(asset.suite);
      expect(popup.module).toEqual(asset.module);
      expect(popup.platform).toEqual(asset.platform);
      expect(popup.name).toEqual(asset.name);
      expect(popup.id).toEqual(asset.id);
      expect(popup.description).toEqual(asset.description);
      expect(popup.syntax.name).toEqual(asset.syntax.name);
      expect(popup.syntax.version).toEqual(asset.syntax.version);
      expect(popup.path).toEqual(asset.path);
      expect(popup.type).toEqual(asset.type);
      expect(JSON.stringify(popup.getContents())).toEqual(JSON.stringify(asset.getContents()));

      done();
    });

    it('Should validate properties of a Menu type', function (done) {
        var asset = new Asset(soda, 'new_suite', 'new_module', 'web', 'new-menu', path.join(__dirname, '..', 'sample_project', 'new_suite', 'modules', 'new_module', 'menus', 'new-menu.json'));

        asset.setName('new-menu');
        asset.setHumanName('New Menu');
        asset.setDescription('This is a description of a new menu');
        asset.setId('new-menu');
        asset.setSyntax({ name: 'web', version: '1.0' });
        asset.type = 'menu';
        asset.setContents({
          "meta": {
              "name": asset.name,
              "id": asset.id,
              "description": asset.description,
              "syntax": asset.syntax
          },
          "menu": {
              "components": [
                  {
                      "assert": ".rc[nth=0] *[type='a'][nth='first']",
                      "exists": true
                  }
              ]
          }
      });

      var menu = new Menu(soda, asset.suite, asset.module, asset.platform, asset.name, path.join(__dirname, '..', 'sample_project', 'new_suite', 'modules', 'new_module', 'menus', 'new-menu.json'));
      menu.setName('new-menu');
      menu.setHumanName('New Menu');
      menu.setDescription('This is a description of a new menu');
      menu.setId('new-menu');
      menu.setSyntax({ name: 'web', version: '1.0' });
      menu.setContents({
          "meta": {
              "name": menu.name,
              "id": menu.id,
              "description": menu.description,
              "syntax": menu.syntax
          },
          "menu": {
              "components": [
                  {
                      "assert": ".rc[nth=0] *[type='a'][nth='first']",
                      "exists": true
                  }
              ]
          }
      });

      expect(menu.suite).toEqual(asset.suite);
      expect(menu.module).toEqual(asset.module);
      expect(menu.platform).toEqual(asset.platform);
      expect(menu.name).toEqual(asset.name);
      expect(menu.id).toEqual(asset.id);
      expect(menu.description).toEqual(asset.description);
      expect(menu.syntax.name).toEqual(asset.syntax.name);
      expect(menu.syntax.version).toEqual(asset.syntax.version);
      expect(menu.path).toEqual(asset.path);
      expect(menu.type).toEqual(asset.type);
      expect(JSON.stringify(menu.getContents())).toEqual(JSON.stringify(asset.getContents()));

      done();
    });
});
