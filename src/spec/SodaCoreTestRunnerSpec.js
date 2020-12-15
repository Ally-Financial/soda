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
    TestRunner   = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "TestRunner")),
    Framework   = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "Framework")),
    fs     = require("fs");

require(path.join(__dirname, "..", "SodaCommon", "ProtoLib"));

Object.freeze = function(obj) { return obj; };

describe('TestRunner should pass all validation tests', function () {
  var soda, testRunner, framework, Tree, tree, savedMethod, stub, spy;

    beforeAll(function (done) {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;

      soda = new Soda({ testPath: path.join(__dirname, '..', 'sample_project'), logSupressed: true, platform: "web", framework: "selenium", suite: "my_suite", module: "my_module" });

      savedMethod = fs.writeFile;

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

        Tree = require(path.join(__dirname, "..", "SodaCore", "lib", "Tree"))(soda);
        tree     = new Tree(JSON.parse(fs.readFileSync(path.resolve(__dirname + "/trees/LoginScreen.json")).toString('utf-8')));

        testRunner = new TestRunner(soda);

        done();
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
      stub.restore();

      soda.kill();
      
      soda = null;

      done();
    });


    it('Should run a suite', function (done) {
      expect(soda.config.get("testingInProgress")).toEqual(false);

        testRunner.run({ suite: "my_suite" }, function (err, result) {
          expect(err).toEqual(null);
          expect(soda.vars.get("_suite_info_")).toEqual('my_suite');
          expect(JSON.stringify(soda.vars.get("_module_info_"))).toEqual(JSON.stringify({ name: 'my_module', suite: 'my_suite' }));
          // expect(JSON.stringify(soda.vars.get("_test_info_"))).toEqual(JSON.stringify({"name":"003","suite":"my_suite","module":"my_module","platform":"web","description":"Same as test two, but uses *mappings*, see this module\'s module.json file","id":null,"path":path.join(__dirname, '..')+"/sample_project/my_suite/modules/my_module/tests/003.web.json"}));
          expect(soda.config.get("testingInProgress")).toEqual(false);
          expect(soda.config.get("test-last")).toEqual("001");
          expect(soda.config.get("test")).toEqual("001");
          expect(JSON.stringify(soda.config.get("treeHashes"))).toEqual(JSON.stringify({}));

          done();
        });
    });

    it('Should run a module', function (done) {
      var testRunner = new TestRunner(soda);

      expect(soda.config.get("testingInProgress")).toEqual(false);

      testRunner.run({ suite: "my_suite", module: "my_module" }, function (err, result){
          expect(err).toEqual(null);
          expect(soda.vars.get("_suite_info_")).toEqual('my_suite');
          expect(JSON.stringify(soda.vars.get("_module_info_"))).toEqual(JSON.stringify({ name: 'my_module', suite: 'my_suite' }));
          // expect(JSON.stringify(soda.vars.get("_test_info_"))).toEqual(JSON.stringify({"name":"003","suite":"my_suite","module":"my_module","platform":"web","description":"Same as test two, but uses *mappings*, see this module's module.json file","id":null,"path":path.join(__dirname, '..')+"/sample_project/my_suite/modules/my_module/tests/003.web.json"}));
          expect(soda.config.get("testingInProgress")).toEqual(false);
          expect(soda.config.get("test-last")).toEqual("001");
          expect(soda.config.get("test")).toEqual("001");
          expect(JSON.stringify(soda.config.get("treeHashes"))).toEqual(JSON.stringify({}));

          done();
      });
    });

    it('Should run a test', function (done) {
      var testRunner = new TestRunner(soda);

      expect(soda.config.get("testingInProgress")).toEqual(false);

      
        testRunner.run({ suite: "my_suite", module: "my_module", test: "001" }, function (err, result){
          // setTimeout(function() {
            expect(err).toEqual(null);
            expect(soda.vars.get("_suite_info_")).toEqual('my_suite');
            expect(JSON.stringify(soda.vars.get("_module_info_"))).toEqual(JSON.stringify({ name: 'my_module', suite: 'my_suite' }));
            // expect(JSON.stringify(soda.vars.get("_test_info_"))).toEqual(JSON.stringify({"name":"001","suite":"my_suite","module":"my_module","platform":"web","description":"The \'cat meme\' Google example from the documentation","id":null,"path":path.join(__dirname, '..')+"/sample_project/my_suite/modules/my_module/tests/001.web.json"}));
            expect(soda.config.get("testingInProgress")).toEqual(false);
            expect(soda.config.get("test-last")).toEqual("001");
            expect(soda.config.get("test")).toEqual("001");
            expect(JSON.stringify(soda.config.get("treeHashes"))).toEqual(JSON.stringify({}));

            done();
          // }, 2000);
        });
    });

    it('Should run an action', function (done) {
      var testRunner = new TestRunner(soda);

      expect(soda.config.get("testingInProgress")).toEqual(false);

      testRunner.run({ suite: "my_suite", module: "my_module", action: "closebrowser" }, function (err, result){
        // setTimeout(function() {
          expect(err).toEqual(null);
          expect(soda.vars.get("_suite_info_")).toEqual('my_suite');
          expect(JSON.stringify(soda.vars.get("_module_info_"))).toEqual(JSON.stringify({ name: 'my_module', suite: 'my_suite' }));
          expect(JSON.stringify(soda.vars.get("_test_info_"))).toEqual(JSON.stringify({"name":"closebrowser","suite":"my_suite","module":"my_module","platform":"web","description":"Navigates to Google and searches for the value of the variable ${to_search}","id":"google","path":path.join(__dirname, '..')+"/sample_project/my_suite/modules/my_module/actions/closebrowser.web.json"}));
          expect(soda.config.get("testingInProgress")).toEqual(false);
          expect(soda.config.get("test-last")).toEqual("001");
          expect(soda.config.get("test")).toEqual("001");
          expect(JSON.stringify(soda.config.get("treeHashes"))).toEqual(JSON.stringify({}));

          done();
        // }, 2000);
      });
    });

    it('Should run and save a tree', function (done) {
      soda.loadAssets(path.join(__dirname, '..', 'sample_project'), function(err, assetCollection) {
        tree.update = function() { return tree; };

        var tempTree     = new Tree(JSON.parse(fs.readFileSync(path.resolve(__dirname + "/trees/google.json")).toString('utf-8')));

        soda.framework.getTree = function (complete, dontInstantiate, times) {
          complete('null', tempTree);
        };

        var testRunner = new TestRunner(soda);

        expect(soda.config.get("testingInProgress")).toEqual(false);
  
        testRunner.run({ suite: "my_suite", module: "my_module", action: "closebrowser" }, function (err, result) {
        // setTimeout(function() {
              var suite_info = soda.vars.get("_suite_info_");
              expect(err).toEqual(null);
              expect(suite_info).toEqual('my_suite');
              expect(JSON.stringify(soda.vars.get("_module_info_"))).toEqual(JSON.stringify({ name: 'my_module', suite: 'my_suite' }));
              expect(JSON.stringify(soda.vars.get("_test_info_"))).toEqual(JSON.stringify({"name":"closebrowser","suite":"my_suite","module":"my_module","platform":"web","description":"Navigates to Google and searches for the value of the variable ${to_search}","id":"google","path":path.join(__dirname, '..')+"/sample_project/my_suite/modules/my_module/actions/closebrowser.web.json"}));
              expect(soda.config.get("testingInProgress")).toEqual(false);
              expect(soda.config.get("test-last")).toEqual("001");
              expect(soda.config.get("test")).toEqual("001");
              expect(JSON.stringify(soda.config.get("treeHashes"))).toEqual(JSON.stringify({}));
    
              testRunner.saveTree(result, function(err, res) {
                sinon.assert.called(spy);
              });
    
              done();
          // }, 2000);
        });
      });
    });
});
