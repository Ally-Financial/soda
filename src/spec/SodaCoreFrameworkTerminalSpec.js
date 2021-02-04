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
    os       = require('os').platform(),
    fs     = require("fs"),
    Soda   = require(path.join(__dirname, "..", "SodaCore", "lib", "Soda")),
    events = require("events");

require(path.join(__dirname, "..", "SodaCommon", "ProtoLib"));

Object.freeze = function(obj) { return obj; };

describe('Framework terminal should pass all validation tests', function () {
  var soda, terminalFramework, settings, buildTree, restControl;

    beforeAll(function (done) {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 300000;

      soda = new Soda({ testPath: path.join(__dirname, '..', 'sample_project'), logSupressed: false });

      soda.init(function() {
        soda.config.set("headless", true, true, true);
        
          terminalFramework = require(path.join(__dirname, "..", "SodaCore", "frameworks", "terminal"))(soda);
          soda.framework = terminalFramework;

          done();
      });
    });

    afterAll(function (done) {
        soda.framework.stop(function(err, res) {
            soda.kill();

            soda = null;

            done();
        });
    });

    it('Should validate framework terminal', function (done) {
      expect(terminalFramework.name).toEqual('Shell');
      expect(terminalFramework.platform).toEqual(os);
      expect(terminalFramework.version).toEqual('1.0');
      expect(terminalFramework.defaultSyntaxVersion).toEqual('1.0');
      expect(terminalFramework.defaultSyntaxName).toEqual('console');

      done();
    });

    it('Should start for terminal sh/cmd', function (done) {
      var shell = "";

      if (os === "win32" || os === "win64") {        
        shell = "cmd";
      }
      else {
        shell = "sh";
      }

      terminalFramework.start({ shell: shell}, function(err) {
        expect(err).toEqual(null);

        terminalFramework.stop();

        done();
      });
    });

    it('Should start for terminal bash/powershell', function (done) {
      var shell = "";

      if (os === "win32" || os === "win64") {        
        shell = "powershell";
      }
      else {
        shell = "bash";
      }

      terminalFramework.start({ shell: shell}, function(err) {
        expect(err).toEqual(null);

        terminalFramework.stop(function () {
          done();
        });
      });
    });

    it('Should listAvailableDevices for terminal', function (done) {
      terminalFramework.listAvailableDevices(function(result) {
        expect(result).toBeInstanceOf(Array);

        done();
      });
    });

    it('Should getTree for terminal', function (done) {
      terminalFramework.getTree({}, function (err, res) {
        expect(err).toEqual(null);
        expect(res).toBeInstanceOf(Object);

        done();
      });
    });

    it('Should getScreenBounds for terminal', function (done) {
      terminalFramework.getScreenBounds(function(err, bounds) {
        expect(err).toEqual(null);
        expect(bounds.sodamembers).toEqual(2);

        done();
      });
    });

    it('Should getOrientation for terminal', function (done) {
      terminalFramework.getOrientation(function(err, result) {
        expect(err).toEqual(null);
        expect(result).toEqual(1);

        done();
      });
    });

    it('Should stop for terminal', function (done) {
      terminalFramework.stop(function(err) {
        expect(err).toEqual(null);

        done();
      });
    });

    it('Should restart for terminal sh/cmd', function (done) {
      var shell = "";

      if (os === "win32" || os === "win64") {        
        shell = "cmd";
      }
      else {
        shell = "sh";
      }

      terminalFramework.start({ shell: shell}, function(err) {
        expect(err).toEqual(null);

        terminalFramework.restart(function(err) {
          expect(err).toEqual(null);

          terminalFramework.stop(function () {
            done();
          });
        });
      });
    });

    it('Should restart for terminal bash/powershell', function (done) {
      var shell = "";

      if (os === "win32" || os === "win64") {        
        shell = "powershell";
      }
      else {
        shell = "bash";
      }

      terminalFramework.start({ shell: shell}, function(err) {
        expect(err).toEqual(null);

        terminalFramework.restart(function(err) {
          expect(err).toEqual(null);

          terminalFramework.stop(function () {
            done();
          });
        });
      });
    });
});
