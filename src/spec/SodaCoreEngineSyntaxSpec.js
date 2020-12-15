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

"use strict";

var sinon = require('sinon'),
    path   = require("path"),
    Soda   = require(path.join(__dirname, "..", "SodaCore", "lib", "Soda"));

require(path.join(__dirname, "..", "SodaCommon", "ProtoLib"));

describe('Engine Syntax should pass all validation tests', function () {
  var soda;

    beforeAll(function (done) {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;

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

    it('Should validate events for default syntax', function (done) {
      var name = soda.config.get("defaultSyntaxName");
      var version = soda.config.get("defaultSyntaxVersion");

      var syntax = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'syntax.js'));

      expect(syntax.userVariable).toEqual("_user_");
      expect(syntax.variableFormat.toString()).toEqual((/(\$\{\s*([_a-zA-Z0-9\-](?:\.?[_a-zA-Z0-9\-])*)\s*})/g).toString());
      expect(syntax.name).toEqual("web");
      expect(syntax.version).toEqual("1.0");

      expect(JSON.stringify(syntax.actionPaths)).toEqual(JSON.stringify([
          'screen/components/*/',
          'popup/components/*/',
          'menu/components/*/',
          'actions/*/'
      ]));

      var m, re = syntax.variableFormat;

      soda.vars.save("test", "myvalue");

      re.exec("");

      m = re.exec("Hi ${test} James");
      expect(syntax.variableOnMatch(soda.vars, m, "Hi ${test} James")).toEqual("Hi myvalue James");

      done();
    });

    it('Should validate events for mobile 2.0 syntax', function (done) {
      var name = 'mobile';
      var version = '2.0';

      var syntax = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'syntax.js'));

      expect(syntax.userVariable).toEqual("_user_");
      expect(syntax.variableFormat.toString()).toEqual((/(\$\{\s*([_a-zA-Z0-9\-](?:\.?[_a-zA-Z0-9\-])*)\s*})/g).toString());
      expect(syntax.name).toEqual("mobile");
      expect(syntax.version).toEqual("2.0");

      expect(JSON.stringify(syntax.actionPaths)).toEqual(JSON.stringify([
          'screen/components/*/',
          'popup/components/*/',
          'menu/components/*/',
          'actions/*/'
      ]));

      var m, re = syntax.variableFormat;

      soda.vars.save("test", "myvalue");

      re.exec("");

      m = re.exec("Hi ${test} James");
      expect(syntax.variableOnMatch(soda.vars, m, "Hi ${test} James")).toEqual("Hi myvalue James");

      done();
    });

    it('Should validate events for perfecto 2.0 syntax', function (done) {
      var name = 'perfecto';
      var version = '2.0';

      var syntax = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'syntax.js'));

      expect(syntax.userVariable).toEqual("_user_");
      expect(syntax.variableFormat.toString()).toEqual((/(\$\{\s*([_a-zA-Z0-9\-](?:\.?[_a-zA-Z0-9\-])*)\s*})/g).toString());
      expect(syntax.name).toEqual("perfecto");
      expect(syntax.version).toEqual("2.0");

      expect(JSON.stringify(syntax.actionPaths)).toEqual(JSON.stringify([
          'screen/components/*/',
          'popup/components/*/',
          'menu/components/*/',
          'actions/*/'
      ]));

      var m, re = syntax.variableFormat;

      soda.vars.save("test", "myvalue");

      re.exec("");

      m = re.exec("Hi ${test} James");
      expect(syntax.variableOnMatch(soda.vars, m, "Hi ${test} James")).toEqual("Hi myvalue James");

      done();
    });

    it('Should validate events for rest 1.0 syntax', function (done) {
      var name = 'rest';
      var version = '1.0';

      var syntax = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'syntax.js'));

      expect(syntax.userVariable).toEqual("_user_");
      expect(syntax.variableFormat.toString()).toEqual((/(\$\{\s*([_a-zA-Z0-9\-](?:\.?[_a-zA-Z0-9\-])*)\s*})/g).toString());
      expect(syntax.name).toEqual("rest");
      expect(syntax.version).toEqual("1.0");

      expect(JSON.stringify(syntax.actionPaths)).toEqual(JSON.stringify([
          'screen/components/*/',
          'popup/components/*/',
          'menu/components/*/',
          'actions/*/'
      ]));

      var m, re = syntax.variableFormat;

      soda.vars.save("test", "myvalue");

      re.exec("");

      m = re.exec("Hi ${test} James");
      expect(syntax.variableOnMatch(soda.vars, m, "Hi ${test} James")).toEqual("Hi myvalue James");

      done();
    });

    it('Should validate events for web 1.0 syntax', function (done) {
      var name = 'web';
      var version = '1.0';

      var syntax = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'syntax.js'));

      expect(syntax.userVariable).toEqual("_user_");
      expect(syntax.variableFormat.toString()).toEqual((/(\$\{\s*([_a-zA-Z0-9\-](?:\.?[_a-zA-Z0-9\-])*)\s*})/g).toString());
      expect(syntax.name).toEqual("web");
      expect(syntax.version).toEqual("1.0");

      expect(JSON.stringify(syntax.actionPaths)).toEqual(JSON.stringify([
          'screen/components/*/',
          'popup/components/*/',
          'menu/components/*/',
          'actions/*/'
      ]));

      var m, re = syntax.variableFormat;

      soda.vars.save("test", "myvalue");

      re.exec("");

      m = re.exec("Hi ${test} James");
      expect(syntax.variableOnMatch(soda.vars, m, "Hi ${test} James")).toEqual("Hi myvalue James");

      done();
    });

    it('Should validate events for windows 1.0 syntax', function (done) {
      var name = 'windows';
      var version = '1.0';

      var syntax = require(path.join(__dirname, "..", "SodaCore", "engine", "syntaxes", name, version, 'syntax.js'));

      expect(syntax.userVariable).toEqual("_user_");
      expect(syntax.variableFormat.toString()).toEqual((/(\$\{\s*([_a-zA-Z0-9\-](?:\.?[_a-zA-Z0-9\-])*)\s*})/g).toString());
      expect(syntax.name).toEqual("windows");
      expect(syntax.version).toEqual("1.0");

      expect(JSON.stringify(syntax.actionPaths)).toEqual(JSON.stringify([
          'screen/components/*/',
          'popup/components/*/',
          'menu/components/*/',
          'actions/*/'
      ]));

      var m, re = syntax.variableFormat;

      soda.vars.save("test", "myvalue");

      re.exec("");

      m = re.exec("Hi ${test} James");
      expect(syntax.variableOnMatch(soda.vars, m, "Hi ${test} James")).toEqual("Hi myvalue James");

      done();
    });
});
