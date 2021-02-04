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
    fs     = require("fs"),
    Soda   = require(path.join(__dirname, "..", "SodaCore", "lib", "Soda"));

require(path.join(__dirname, "..", "SodaCommon", "ProtoLib"));

Object.freeze = function(obj) { return obj; };

describe('Framework selenium close should pass all validation tests', function () {
  var soda, seleniumFramework, settings, buildTree, seleniumControl, savedMethod1, savedMethod2, savedMethod3, spy, spy1, spy2;

    beforeAll(function (done) {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;

      savedMethod1 = fs.access;
      savedMethod2 = fs.writeFile;
      savedMethod3 = console.log;

      soda = new Soda({ testPath: path.join(__dirname, '..', 'sample_project'), logSupressed: false });

      soda.init(function() {
        soda.config.set("headless", true, true, true);
        
          seleniumFramework = require(path.join(__dirname, "..", "SodaCore", "frameworks", "selenium"))(soda);
          soda.framework = seleniumFramework;
          settings  = require(path.join(__dirname, "..", "SodaCore", "frameworks", "selenium", "imports", "Config.js"))(soda);
          seleniumControl  = new (require(path.join(__dirname, "..", "SodaCore", "frameworks", "selenium", "imports", "Driver.js")))(soda);

          done();
      });
    });

    beforeEach(function() {
      spy = sinon.spy(fs, "access");
      spy1 = sinon.spy(fs, "writeFile");
      spy2 = sinon.spy(console, 'log');
    });
  
    afterEach(function() {
      spy.restore();
      spy1.restore();
      spy2.restore();
    });

    afterAll(function (done) {
      fs.access = savedMethod1;
      fs.writeFile = savedMethod2;
      console.log = savedMethod3;

      soda.kill();

      soda = null;

      done();
    });
});
