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

var path   = require("path");

delete require.cache[require(path.join(__dirname, "..", "SodaCore", "lib", "Soda"))];
delete require.cache[require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "Framework"))];
delete require.cache[require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "Trace"))];
delete require.cache[require(path.join(__dirname, "..", "SodaCore", "frameworks", "selenium"))];
delete require.cache[require(path.join(__dirname, "..", "SodaCore", "frameworks", "selenium", "imports", "Config.js"))];
delete require.cache[require(path.join(__dirname, "..", "SodaCore", "frameworks", "selenium", "imports", "Driver.js"))];

var sinon = require('sinon'),
    Soda   = require(path.join(__dirname, "..", "SodaCore", "lib", "Soda")),
    Framework   = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "Framework")),
    Trace   = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "Trace"));

require(path.join(__dirname, "..", "SodaCommon", "ProtoLib"));

describe('Trace should pass all validation tests', function () {
    var soda, framework, trace, settings, seleniumControl, stub;

    beforeAll(function (done) {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;

      soda = new Soda({ testPath: path.join(__dirname, '..', 'sample_project'), logSupressed: true, platform: "web", framework: "selenium", suite: "my_suite", module: "my_module" });

      soda.init(function() {
        soda.config.set("headless", true, true, true);
        
        framework = new Framework(soda);
        framework.load('selenium');
        soda.framework = framework;
        stub = sinon.stub(soda.framework, 'started').get(function getterFn() {
          return true;
        });

        soda.config.set("suite", "my_suite", true, true);
        soda.config.set("module", "my_module", true, true);
        soda.config.set("platform", "web", true, true);

        done();
      });
    });

    afterAll(function(done) {
      soda.framework.stop(function (err, res) {
        expect(err).toEqual(null);
        expect(res).toEqual(true);

        soda.framework.stop(function () {
          soda.kill();

          soda = null;

          done();
        });
      });
    });

    it('Should validate an element interaction trace', function (done) {
      soda.framework.start("chrome", "about:blank", {}, function(err) {
        expect(err).toEqual(null);
        
        trace = new Trace(soda);
        trace.start();

        soda.framework.performElementInteraction("click", [{ id: "gb" }], {}, function(err, res) {
            expect(trace.get().trace[0].interaction).toEqual("click");

            trace.stop();
            trace.clear();

            expect(trace.get().trace.sodamembers).toEqual(0);

            done();
          });
        });
      });

      it('Should validate multiple element interaction traces', function (done) {
        trace.start();

        soda.framework.performElementInteraction("click", [{ id: "gb" }], {}, function(err, res) {
            expect(trace.get().trace[0].interaction).toEqual("click");

            soda.framework.performElementInteraction("click", [{ id: "gb" }], {}, function(err, res) {
              expect(trace.get().trace[1].interaction).toEqual("click");
              expect(trace.get().trace.sodamembers).toEqual(2);

              trace.stop();
              trace.clear();

              expect(trace.get().trace.sodamembers).toEqual(0);

              done();
            });
          });
        });

      it('Should validate a device interaction trace', function (done) {
        trace.start();

        soda.framework.performDeviceInteraction("getVariable", { variableName: "location.href", storeIn: "href"}, function (err, res) {
          expect(err).toEqual(null);
          expect(res).toEqual("about:blank");
          expect(soda.vars.get('href')).toEqual('about:blank');

          expect(trace.get().trace[0].interaction).toEqual("getVariable");

          trace.stop();
          trace.clear();

          expect(trace.get().trace.sodamembers).toEqual(0);

          done();
        });
      });

      it('Should validate multiple device interaction traces', function (done) {
        trace.start();

        soda.framework.performDeviceInteraction("getVariable", { variableName: "location.href", storeIn: "href"}, function (err, res) {
          expect(err).toEqual(null);
          expect(res).toEqual("about:blank");
          expect(soda.vars.get('href')).toEqual('about:blank');

          expect(trace.get().trace[0].interaction).toEqual("getVariable");

          soda.framework.performDeviceInteraction("getVariable", { variableName: "location.href", storeIn: "href"}, function (err, res) {
            expect(err).toEqual(null);
            expect(res).toEqual("about:blank");
            expect(soda.vars.get('href')).toEqual('about:blank');
            expect(trace.get().trace.sodamembers).toEqual(2);

            expect(trace.get().trace[1].interaction).toEqual("getVariable");

            trace.stop();
            trace.clear();

            expect(trace.get().trace.sodamembers).toEqual(0);

            done();
          });
        });
      });

      it('Should run an existing device interaction trace', function (done) {
        trace.start();

        soda.framework.performDeviceInteraction("getVariable", { variableName: "location.href", storeIn: "href"}, function (err, res) {
          expect(err).toEqual(null);
          expect(res).toEqual("about:blank");
          expect(soda.vars.get('href')).toEqual('about:blank');

          expect(trace.get().trace[0].interaction).toEqual("getVariable");

          soda.framework.performDeviceInteraction("getVariable", { variableName: "location.href", storeIn: "href"}, function (err, res) {
            expect(err).toEqual(null);
            expect(res).toEqual("about:blank");
            expect(soda.vars.get('href')).toEqual('about:blank');
            expect(trace.get().trace.sodamembers).toEqual(2);

            expect(trace.get().trace[1].interaction).toEqual("getVariable");

            var oldTrace = trace.get();
            trace.clear();

            Trace.run(oldTrace, soda, function(err, result) {
              expect(trace.get().trace.sodamembers).toEqual(2);

              trace.stop();
              trace.clear();

              expect(trace.get().trace.sodamembers).toEqual(0);

              done();
            });
          });
        });
      });
});
