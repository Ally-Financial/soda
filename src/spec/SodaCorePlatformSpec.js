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
    Platform = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "Platform")),
    child_process     = require("child_process"),
    assetTypes   = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "AssetTypes")),
    Test    = assetTypes.Test,
    Menu    = assetTypes.Menu,
    Screen  = assetTypes.Screen,
    Action  = assetTypes.Action,
    Popup   = assetTypes.Popup;

require(path.join(__dirname, "..", "SodaCommon", "ProtoLib"));

describe('Platform should pass all validation tests', function () {
  var soda, action, spy, savedMethod;

    function clearRequireCache() {
        Object.keys(require.cache).forEach(function (key) {
            delete require.cache[key];
        });
    }

    beforeAll(function (done) {
      clearRequireCache();

      savedMethod = child_process.exec;

      spy = sinon.stub(child_process, 'exec').callsFake((command, cb) => {
        switch(command) {
          case "pgrep -a Soda":
            cb.call(null, null, '227007');
            break;
          case "rm -rf directory":
            cb.call(null, null, 'rmdir');
            break;
          case "mkdir directory":
            cb.call(null, null, 'mkdir');
            break;
          case "echo \"command\"":
            cb.call(null, null, 'print');
            break;
          case "open url":
            cb.call(null, null, 'openurl');
            break;
          case 'if [ -f "/Applications/Safari.app" -o "/Applications/Safari.app" ]; then echo "exists"; fi':
            cb.call(null, null, "exists", null);
            break;
          case 'git checkout':
            cb.call(null, null, null);
            break;
          case 'git pull':
            cb.call(null, null, null);
            break;
          default:
            cb.call(null, null, null);
        }
      });

      soda = new Soda({ testPath: path.join(__dirname, '..', 'sample_project'), logSupressed: true }).init();

      done();
    });

    afterEach(function() {
        spy.restore();
      });
  
    afterAll(function () {
        child_process.exec = savedMethod;

        soda.kill();

        soda = null;
    });

    it('Should validate properties of a Platform with no name', function (done) {
      var platform = new Platform('new_suite', 'new_module');
      expect(platform.name).toEqual('No name');
      expect(platform.suite).toEqual('new_suite');
      expect(platform.module).toEqual('new_module');
      expect(platform.getTests().sodamembers).toEqual(0);
      expect(platform.getActions().sodamembers).toEqual(0);
      expect(platform.getScreens().sodamembers).toEqual(0);
      expect(platform.getPopups().sodamembers).toEqual(0);
      expect(platform.getMenus().sodamembers).toEqual(0);

      done();
    });

    it('Should validate properties of a named Platform', function (done) {
      var platform = new Platform('new_suite', 'new_module', 'web');
      expect(platform.name).toEqual('web');
      expect(platform.suite).toEqual('new_suite');
      expect(platform.module).toEqual('new_module');
      expect(platform.getTests().sodamembers).toEqual(0);
      expect(platform.getActions().sodamembers).toEqual(0);
      expect(platform.getScreens().sodamembers).toEqual(0);
      expect(platform.getPopups().sodamembers).toEqual(0);
      expect(platform.getMenus().sodamembers).toEqual(0);

      done();
    });

    it('Should validate platform after adding an Action', function (done) {
      var platform = new Platform('new_suite', 'new_module', 'web');
      expect(platform.name).toEqual('web');
      expect(platform.suite).toEqual('new_suite');
      expect(platform.module).toEqual('new_module');
      expect(platform.getTests().sodamembers).toEqual(0);
      expect(platform.getActions().sodamembers).toEqual(0);
      expect(platform.getScreens().sodamembers).toEqual(0);
      expect(platform.getPopups().sodamembers).toEqual(0);
      expect(platform.getMenus().sodamembers).toEqual(0);

      var action = new Action(soda, 'new_suite', 'new_module', 'web', 'new-action', path.join(__dirname, '..', 'sample_project', 'new_suite', 'modules', 'new_module', 'actions', 'new-action.json'));
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

      platform.addAction(action);
      expect(platform.name).toEqual('web');
      expect(platform.suite).toEqual('new_suite');
      expect(platform.module).toEqual('new_module');
      expect(platform.getTests().sodamembers).toEqual(0);
      expect(platform.getActions().sodamembers).toEqual(1);
      expect(platform.getScreens().sodamembers).toEqual(0);
      expect(platform.getPopups().sodamembers).toEqual(0);
      expect(platform.getMenus().sodamembers).toEqual(0);

      done();
    });

    it('Should validate platform after adding a Test', function (done) {
      var platform = new Platform('new_suite', 'new_module', 'web');

      expect(platform.name).toEqual('web');
      expect(platform.suite).toEqual('new_suite');
      expect(platform.module).toEqual('new_module');
      expect(platform.getTests().sodamembers).toEqual(0);
      expect(platform.getActions().sodamembers).toEqual(0);
      expect(platform.getScreens().sodamembers).toEqual(0);
      expect(platform.getPopups().sodamembers).toEqual(0);
      expect(platform.getMenus().sodamembers).toEqual(0);

      var test = new Test(soda, 'new_suite', 'new_module', 'web', 'new-test', path.join(__dirname, '..', 'sample_project', 'new_suite', 'modules', 'new_module', 'tests', 'new-test.json'));
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

      platform.addTest(test);
      expect(platform.name).toEqual('web');
      expect(platform.suite).toEqual('new_suite');
      expect(platform.module).toEqual('new_module');
      expect(platform.getTests().sodamembers).toEqual(1);
      expect(platform.getActions().sodamembers).toEqual(0);
      expect(platform.getScreens().sodamembers).toEqual(0);
      expect(platform.getPopups().sodamembers).toEqual(0);
      expect(platform.getMenus().sodamembers).toEqual(0);

      done();
    });

    it('Should validate platform after adding a Screen', function (done) {
      var platform = new Platform('new_suite', 'new_module', 'web');

      expect(platform.name).toEqual('web');
      expect(platform.suite).toEqual('new_suite');
      expect(platform.module).toEqual('new_module');
      expect(platform.getTests().sodamembers).toEqual(0);
      expect(platform.getActions().sodamembers).toEqual(0);
      expect(platform.getScreens().sodamembers).toEqual(0);
      expect(platform.getPopups().sodamembers).toEqual(0);
      expect(platform.getMenus().sodamembers).toEqual(0);

      var screen = new Screen(soda, 'new_suite', 'new_module', 'web', 'new-screen', path.join(__dirname, '..', 'sample_project', 'new_suite', 'modules', 'new_module', 'screens', 'new-screen.json'));
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

      platform.addScreen(screen);
      expect(platform.name).toEqual('web');
      expect(platform.suite).toEqual('new_suite');
      expect(platform.module).toEqual('new_module');
      expect(platform.getTests().sodamembers).toEqual(0);
      expect(platform.getActions().sodamembers).toEqual(0);
      expect(platform.getScreens().sodamembers).toEqual(1);
      expect(platform.getPopups().sodamembers).toEqual(0);
      expect(platform.getMenus().sodamembers).toEqual(0);

      done();
    });

    it('Should validate platform after adding a Popup', function (done) {
      var platform = new Platform('new_suite', 'new_module', 'web');

      expect(platform.name).toEqual('web');
      expect(platform.suite).toEqual('new_suite');
      expect(platform.module).toEqual('new_module');
      expect(platform.getTests().sodamembers).toEqual(0);
      expect(platform.getActions().sodamembers).toEqual(0);
      expect(platform.getScreens().sodamembers).toEqual(0);
      expect(platform.getPopups().sodamembers).toEqual(0);
      expect(platform.getMenus().sodamembers).toEqual(0);

      var popup = new Popup(soda, 'new_suite', 'new_module', 'web', 'new-popup', path.join(__dirname, '..', 'sample_project', 'new_suite', 'modules', 'new_module', 'popups', 'new-popup.json'));
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

      platform.addPopup(popup);
      expect(platform.name).toEqual('web');
      expect(platform.suite).toEqual('new_suite');
      expect(platform.module).toEqual('new_module');
      expect(platform.getTests().sodamembers).toEqual(0);
      expect(platform.getActions().sodamembers).toEqual(0);
      expect(platform.getScreens().sodamembers).toEqual(0);
      expect(platform.getPopups().sodamembers).toEqual(1);
      expect(platform.getMenus().sodamembers).toEqual(0);

      done();
    });

    it('Should validate properties of a Menu type', function (done) {
      var platform = new Platform('new_suite', 'new_module', 'web');

      expect(platform.name).toEqual('web');
      expect(platform.suite).toEqual('new_suite');
      expect(platform.module).toEqual('new_module');
      expect(platform.getTests().sodamembers).toEqual(0);
      expect(platform.getActions().sodamembers).toEqual(0);
      expect(platform.getScreens().sodamembers).toEqual(0);
      expect(platform.getPopups().sodamembers).toEqual(0);
      expect(platform.getMenus().sodamembers).toEqual(0);

      var menu = new Menu(soda, 'new_suite', 'new_module', 'web', 'new-menu', path.join(__dirname, '..', 'sample_project', 'new_suite', 'modules', 'new_module', 'menus', 'new-menu.json'));
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

      platform.addMenu(menu);
      expect(platform.name).toEqual('web');
      expect(platform.suite).toEqual('new_suite');
      expect(platform.module).toEqual('new_module');
      expect(platform.getTests().sodamembers).toEqual(0);
      expect(platform.getActions().sodamembers).toEqual(0);
      expect(platform.getScreens().sodamembers).toEqual(0);
      expect(platform.getPopups().sodamembers).toEqual(0);
      expect(platform.getMenus().sodamembers).toEqual(1);

      done();
    });

    it('Should validate platform after adding, getting, and removing an Action, Test, Screen, Popup, and Menu', function (done) {
      var platform = new Platform('new_suite', 'new_module', 'web');
      expect(platform.name).toEqual('web');
      expect(platform.suite).toEqual('new_suite');
      expect(platform.module).toEqual('new_module');
      expect(platform.getTests().sodamembers).toEqual(0);
      expect(platform.getActions().sodamembers).toEqual(0);
      expect(platform.getScreens().sodamembers).toEqual(0);
      expect(platform.getPopups().sodamembers).toEqual(0);
      expect(platform.getMenus().sodamembers).toEqual(0);

      var action = new Action(soda, 'new_suite', 'new_module', 'web', 'new-action', path.join(__dirname, '..', 'sample_project', 'new_suite', 'modules', 'new_module', 'actions', 'new-action.json'));
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

      platform.addAction(action);

      var test = new Test(soda, 'new_suite', 'new_module', 'web', 'new-test', path.join(__dirname, '..', 'sample_project', 'new_suite', 'modules', 'new_module', 'tests', 'new-test.json'));
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

      platform.addTest(test);

      var screen = new Screen(soda, 'new_suite', 'new_module', 'web', 'new-screen', path.join(__dirname, '..', 'sample_project', 'new_suite', 'modules', 'new_module', 'screens', 'new-screen.json'));
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

      platform.addScreen(screen);

      var popup = new Popup(soda, 'new_suite', 'new_module', 'web', 'new-popup', path.join(__dirname, '..', 'sample_project', 'new_suite', 'modules', 'new_module', 'popups', 'new-popup.json'));
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

      platform.addPopup(popup);

      var menu = new Menu(soda, 'new_suite', 'new_module', 'web', 'new-menu', path.join(__dirname, '..', 'sample_project', 'new_suite', 'modules', 'new_module', 'menus', 'new-menu.json'));
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

      platform.addMenu(menu);
      expect(platform.name).toEqual('web');
      expect(platform.suite).toEqual('new_suite');
      expect(platform.module).toEqual('new_module');
      expect(platform.getTests().sodamembers).toEqual(1);
      expect(platform.getActions().sodamembers).toEqual(1);
      expect(platform.getScreens().sodamembers).toEqual(1);
      expect(platform.getPopups().sodamembers).toEqual(1);
      expect(platform.getMenus().sodamembers).toEqual(1);

      expect(platform.getTest('new-test').name).toEqual('new-test');
      expect(platform.getAction('new-action').name).toEqual('new-action');
      expect(platform.getScreen('new-screen').name).toEqual('new-screen');
      expect(platform.getPopup('new-popup').name).toEqual('new-popup');
      expect(platform.getMenu('new-menu').name).toEqual('new-menu');

      platform.removeTest('none');
      platform.removeAction('none');
      platform.removeScreen('none');
      platform.removePopup('none');
      platform.removeMenu('none');

      expect(platform.getTests().sodamembers).toEqual(1);
      expect(platform.getActions().sodamembers).toEqual(1);
      expect(platform.getScreens().sodamembers).toEqual(1);
      expect(platform.getPopups().sodamembers).toEqual(1);
      expect(platform.getMenus().sodamembers).toEqual(1);

      platform.removeTest('new-test');
      platform.removeAction('new-action');
      platform.removeScreen('new-screen');
      platform.removePopup('new-popup');
      platform.removeMenu('new-menu');

      expect(platform.getTests().sodamembers).toEqual(0);
      expect(platform.getActions().sodamembers).toEqual(0);
      expect(platform.getScreens().sodamembers).toEqual(0);
      expect(platform.getPopups().sodamembers).toEqual(0);
      expect(platform.getMenus().sodamembers).toEqual(0);

      done();
    });
});
