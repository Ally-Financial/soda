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
    Syntax = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "Syntax")),
    Action = require(path.join(__dirname, "..", "SodaCore", "lib", "Action")),
    assetTypes   = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "AssetTypes")),
    Action  = assetTypes.Action;

require(path.join(__dirname, "..", "SodaCommon", "ProtoLib"));

describe('Syntax should pass all validation tests', function () {
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
      var syntax = new Syntax(soda);

      var action = new Action(soda, 'my_suite', 'my_module', 'web', 'new-action', path.join(__dirname, '..', 'sample_project', 'new_suite', 'modules', 'new_module', 'actions', 'new-action.json'));
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
      action.on = function (event, func, type, group, description, nonElemental) {
      };

      expect(syntax.get(action, 'web', '1.0').syntax.name).toEqual('web');
      expect(syntax.get(action, 'web', '1.0').syntax.version).toEqual('1.0');
      expect(syntax.get(action, 'web', '1.0').syntax.userVariable).toEqual('_user_');
      expect(JSON.stringify(syntax.get(action, 'web', '1.0').syntax.actionPaths)).toEqual(JSON.stringify([ 'screen/components/*/',
        'popup/components/*/',
        'menu/components/*/',
        'actions/*/' ]));

      done();
    });
});
