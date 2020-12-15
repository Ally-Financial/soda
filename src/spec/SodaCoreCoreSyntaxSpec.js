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
    os          = require('os').platform(),
    Soda   = require(path.join(__dirname, "..", "SodaCore", "lib", "Soda")),
    Framework   = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "Framework")),
    CoreSyntax   = require(path.join(__dirname, "..", "SodaCore", "lib", "CoreSyntax")),
    Run = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "Run")),
    fs     = require("fs");

require(path.join(__dirname, "..", "SodaCommon", "ProtoLib"));

Object.freeze = function(obj) { return obj; };

describe('CoreSyntax should pass all validation tests', function () {
  var soda, Tree, framework, tree, savedMethod1, savedMethod2, savedMethod3, spy, spy1, spy2, stub;

    beforeAll(function (done) {
      savedMethod1 = fs.access;
      savedMethod2 = fs.writeFile;
      savedMethod3 = console.log;

        soda = new Soda({ testPath: path.join(__dirname, '..', 'sample_project'), logSupressed: true });

        soda.init(function() {
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
      stub.restore();
      fs.access = savedMethod1;
      fs.writeFile = savedMethod2;
      console.log = savedMethod3;

      soda.kill();
      
      soda = null;

      done();
    });

    it('Should find an element by id', function (done) {
      tree.findElementById('textfield:1', function(err, result) {
       expect(err).toEqual(null);
       expect(result.sodamembers).toEqual(1);

       done();
      });
    });

    it('Should not find an element by a non-existent id', function (done) {
      tree.findElementById('tf:1', function(err, result) {
       expect(err).toEqual(null);
       expect(result.sodamembers).toEqual(0);

       done();
      });
    });

    it('Should setValue on a found element', function (done) {
     tree.findElementById('textfield:1', function(err, result) {
       expect(err).toEqual(null);
       expect(result.sodamembers).toEqual(1);

       var sandbox = sinon.createSandbox();

       sandbox.stub(soda.framework, 'performElementInteraction').callsFake((interaction, elems, options, cb) => {
         cb(null, true);
       });

       CoreSyntax.setValue(result[0], "ok", function(res, string) {
         sandbox.restore();

         expect(res).toEqual(true);
         expect(string).toEqual("Should set value of " + " `[{ id: \"textfield:1\" }]`");

         done();
       }, '[{ id: "textfield:1" }]', "");
     });
    });

    it('Should checkExistsAndIsSingleElement on a found element', function (done) {
      var result = tree.elements()["withId"]("textfield:1");
      expect(result.sodamembers).toEqual(1);

      CoreSyntax.checkExistsAndIsSingleElement("setValue", result, "id", "textfield:1", result, function(res, string) {
       expect(res).toEqual(false);

       done();
      }, function(res) {
       expect(res).toEqual(result);

       done();
      });
    });

    it('Should checkExistsAndIsSingleElement on multiple elements', function (done) {
        var result = tree.elements()["withName"]("userName");
        expect(result.sodamembers).toEqual(2);

        CoreSyntax.checkExistsAndIsSingleElement("setValue", result, "name", "userName", result, function(res, string) {
         expect(res).toEqual(false);
         expect(string).toEqual("Should setValue `userName` (AmbiguousSelector: Unable to setValue multiple elements)");

         done();
        }, function(res) {
         expect(res).toEqual(result);

         done();
        });
    });

    it('Should checkElementExists on a found element', function (done) {
      var result = tree.elements()["withId"]("textfield:1");
      expect(result.length).toEqual(1);

      CoreSyntax.checkElementExists("setValue", result[0], "id", "textfield:1", result, function(res, string) {
        expect(res).toEqual(false);

      done();
      }, function(res) {
        expect(res).toEqual(result[0]);

      done();
      });
    });

    it('Should checkElementExists on multiple elements', function (done) {
      var result = tree.elements()["withName"]("userName");
      expect(result.length).toEqual(2);

      CoreSyntax.checkElementExists("setValue", result, "name", "userName", result, function(res, string) {
        expect(res).toEqual(false);

      done();
      }, function(res) {
        expect(res).toEqual(result);

      done();
      });
    });

    it('Should checkElementExists on a not found element', function (done) {
      tree.findElementById('a', function(err, result) {
        expect(result.sodamembers).toEqual(0);

        CoreSyntax.checkElementExists("setValue", result, "id", "a", { run: { state: "stopped"}}, function(res, string) {
          expect(res).toEqual(false);
          expect(string).toEqual("Should setValue `a` (No elements found with id `a`)");

          done();
        }, function(res) {
          expect(res).toEqual(result);

          done();
        });
      });
    });

    it('Should checkElementDoesNotExist on a found element', function (done) {
        var result = tree.elements()["withId"]("textfield:1");
        expect(result.sodamembers).toEqual(1);

        CoreSyntax.checkElementDoesNotExist("assertExistsUsing", result, "id", "textfield:1", result, function(res, string) {
          expect(res).toEqual(false);
          done();
        }, function (res) {
          expect(res.length).toEqual(1);

          done();
        });
    });

    it('Should checkElementDoesNotExist on a not found element', function (done) {
        var result = tree.elements()["withId"]("a");
        expect(result.sodamembers).toEqual(0);

        CoreSyntax.checkElementDoesNotExist("assertExistsUsing", result, "id", "a", result, function(res, string) {
         expect(res).toEqual(false);

         done();
        }, function(res) {
         expect(res.length).toEqual(0);

         done();
        });
    });

    it('Should checkUsing on a tree with a valid using clause', function (done) {
        var result = CoreSyntax.checkUsing(tree.elements(), "id", function(res, string) {
         expect(res).toEqual(true);

         done();
       });

       if (result) {
         done();
       }
    });

    it('Should checkUsing on a tree with an invalid using clause', function (done) {
        var result = CoreSyntax.checkUsing(tree.elements(), "blah", function(res, string) {
         expect(res).toEqual(false);
         expect(string).toEqual('Invalid value for key `using`');

         done();
       });

       if (result) {
         done();
       }
       else {
         expect(result).toEqual(false);
       }
    });

    it('Should debug on a set of actions', function (done) {
        var actions = [
            {
                "goto": "http://www.google.com"
            },
            {
                "set": "GOOGLE_SEARCH_INPUT_FIELD",
                "to": "${to_search}"
            },
            {
                "wait": 1
            },
            {
                "waitFor": "GOOGLE_SEARCH_SEARCH_BUTTON"
            },
            {
                "click": "GOOGLE_SEARCH_SEARCH_BUTTON"
            },
            {
                "wait": 3
            }
        ];

        spy2.resetHistory();

        var result = CoreSyntax.debug(actions, function(res) {
         expect(res).toEqual(true);

         expect(spy2.callCount).toEqual(6);

         done();
       }, { console: { log: function(string) {console.log(string);}}});
    });

    it('Should debug without actions', function (done) {
        var actions = [];

        spy2.resetHistory();

        var result = CoreSyntax.debug(actions, function(res) {
         expect(res).toEqual(true);

         expect(spy2.callCount).toEqual(0);

         done();
       }, { console: { log: function(string) {console.log(string);}}});
    });

    it('Should refresh the tree', function (done) {
        var actions = [];

        spy2.resetHistory();

        var reply = function(res) {
         expect(res).toEqual(true);

         expect(spy2.callCount).toEqual(0);

         done();
       };

        CoreSyntax.debug(actions, reply, { tree: { update: function(func) { func(null, {}) }}});
    });

    it('Should scrollToVisibleUsing', function (done) {
      var action = {
        using: "id",
        scrollToVisible: "textfield:1",
        refresh: true
      };

      var newTree = {
       tree: tree,
       update: function() { return tree; }
      };

      var sandbox = sinon.createSandbox();

      sandbox.stub(CoreSyntax, 'performElementInteraction').callsFake((name, e, reply, options, selector, refresh, scope, n, refreshTemp) => {
        reply(null, newTree);
      });

        var reply = function(err, res) {
          sandbox.restore();
          expect(res.tree).toEqual(tree);

          done();
       };

        CoreSyntax.scrollToVisibleUsing(action, reply, tree);
    });

    it('Should scrollToVisible', function (done) {
      var action = {
        using: "id",
        scrollToVisible: "textfield:1",
        refresh: true
      };

      var newTree = {
       tree: tree,
       update: function() { return tree; }
      };

      var sandbox = sinon.createSandbox();

      sandbox.stub(CoreSyntax, 'performElementInteraction').callsFake((name, e, reply, options, selector, refresh, scope, n, refreshTemp) => {
        reply(null, newTree);
      });

        var reply = function(err, res) {
          sandbox.restore();
          expect(err).toEqual(true);
          expect(res).toEqual("Didn\'t need to scroll because it already was visible");

          done();
       };

        CoreSyntax.scrollToVisible(action, reply, tree);
    });

    it('Should scrollToVisibleText', function (done) {
      var action = {
        scrollToVisibleText: "Username"
      };

      var newTree = {
       tree: tree,
       update: function() { return tree; }
      };

      var sandbox = sinon.createSandbox();

      sandbox.stub(CoreSyntax, 'performElementInteraction').callsFake((name, e, reply, options, selector, refresh, scope, n, refreshTemp) => {
        reply(null, newTree);
      });

        var reply = function(err, res) {
          sandbox.restore();
          expect(err).toEqual(null);
          expect(res.tree).toEqual(tree);

          done();
       };

        CoreSyntax.scrollToVisibleText(action, reply, tree);
    });

    it('Should scrollToVisibleWithDirection', function (done) {
      var action = {
        scrollToVisibleWithDirection: "*[id='textfield:1']",
        direction: "down",
        refresh: true
      };

      var newTree = {
       tree: tree,
       update: function() { return tree; }
      };

      var sandbox = sinon.createSandbox();

      sandbox.stub(CoreSyntax, 'performElementInteraction').callsFake((name, e, reply, options, selector, refresh, scope, n, refreshTemp) => {
        reply(null, newTree);
      });

        var reply = function(err, res) {
          sandbox.restore();
          expect(err).toEqual(null);
          expect(res.tree).toEqual(tree);

          done();
       };

        CoreSyntax.scrollToVisibleWithDirection(action, reply, tree);
    });

    it('Should scrollDirectionUsing', function (done) {
      var action = {
        using: "id",
        direction: "down",
        scroll: "textfield:1",
        refresh: true
      };

      var newTree = {
       tree: tree,
       update: function() { return tree; }
      };

      var sandbox = sinon.createSandbox();

      sandbox.stub(CoreSyntax, 'performElementInteraction').callsFake((name, e, reply, options, selector, refresh, scope, n, refreshTemp) => {
        reply(null, newTree);
      });

        var reply = function(err, res) {
          sandbox.restore();
          expect(err).toEqual(null);
          expect(res.tree).toEqual(tree);

          done();
       };

        CoreSyntax.scrollDirectionUsing(action, reply, tree);
    });

    it('Should scrollDirection', function (done) {
      var action = {
        using: "id",
        direction: "down",
        scroll: "textfield:1",
        refresh: true
      };

      var newTree = {
        tree: tree,
        update: function() { return tree; }
      };

      var sandbox = sinon.createSandbox();

      sandbox.stub(CoreSyntax, 'performElementInteraction').callsFake((name, e, reply, options, selector, refresh, scope, n, refreshTemp) => {
        reply(null, newTree);
      });

        var reply = function(err, res) {
          sandbox.restore();
          expect(err).toEqual(null);
          expect(res.tree).toEqual(tree);

          done();
       };

        CoreSyntax.scrollDirectionUsing(action, reply, tree);
    });

    it('Should scroll', function (done) {
      var action = {
        scroll: "*[id='textfield:1']",
        refresh: true
      };

      var newTree = {
        tree: tree,
        update: function() { return tree; }
      };

      var sandbox = sinon.createSandbox();

      sandbox.stub(CoreSyntax, 'performElementInteraction').callsFake((name, e, reply, options, selector, refresh, scope, n, refreshTemp) => {
        reply(null, newTree);
      });

        var reply = function(err, res) {
          sandbox.restore();
          expect(err).toEqual(null);
          expect(res.tree).toEqual(tree);

          done();
       };

        CoreSyntax.scroll(action, reply, tree);
    });

    it('Should storeAs and load into soda without capture', function (done) {
      var action = {
        store: "world",
        as: "hello"
      };

      var reply = function(result) {
        expect(result).toEqual(true);
        expect(soda.vars.get('hello')).toEqual('world');

        done();
      };

      CoreSyntax.storeAs(action, reply, soda);
    });

    it('Should storeAs and load into soda with capture', function (done) {
      var action = {
        store: "hello 12 world",
        as: "captured",
        "index": 1,
        capture: "([0-9]+)"
      };

      var reply = function(result) {
        expect(result).toEqual(true);
        expect(soda.vars.get('captured')).toEqual('12');

        done();
      };

      CoreSyntax.storeAs(action, reply, soda);
    });

    it('Should storeLazyAs and load into soda without capture', function (done) {
      var action = {
        store: "world",
        as: "hello"
      };

      var reply = function(result) {
        expect(result).toEqual(true);
        expect(soda.vars.get('hello')).toEqual('world');

        done();
      };

      CoreSyntax.storeLazyAs(action, reply, soda);
    });

    it('Should storeLazyAs and load into soda with capture', function (done) {
      var action = {
        store: "hello 12 world",
        as: "captured",
        "index": 1,
        capture: "([0-9]+)"
      };

      var reply = function(result) {
        expect(result).toEqual(true);
        expect(soda.vars.get('captured')).toEqual('12');

        done();
      };

      CoreSyntax.storeLazyAs(action, reply, soda);
    });

    it('Should saveAsPropertyUsing and load into soda without capture', function (done) {
      var action = {
        save: "textfield:0",
        using: "id",
        property: "value",
        as: "nameLabel"
      };

      tree.vars = soda.vars;

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(soda.vars.get('nameLabel')).toEqual('Username');

        done();
      };

      CoreSyntax.saveAsPropertyUsing(action, reply, tree);
    });

    it('Should saveAsPropertyUsing and load into soda without capture', function (done) {
      var action = {
        save: "textfield:0",
        using: "id",
        property: "value",
        capture: "([e]+)",
        index: 1,
        as: "nameLabel"
      };

      tree.vars = soda.vars;

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(soda.vars.get('nameLabel')).toEqual('e');

        done();
      };

      CoreSyntax.saveAsPropertyUsing(action, reply, tree);
    });

    it('Should saveAsProperty and load into soda without capture', function (done) {
      var action = {
        save: "*[id='textfield:0']",
        property: "value",
        as: "nameLabel"
      };

      tree.vars = soda.vars;

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(soda.vars.get('nameLabel')).toEqual('Username');

        done();
      };

      CoreSyntax.saveAsProperty(action, reply, tree);
    });

    it('Should saveAsProperty and load into soda without capture', function (done) {
      var action = {
        save: "*[id='textfield:0']",
        property: "value",
        capture: "([e]+)",
        index: 1,
        as: "nameLabel"
      };

      tree.vars = soda.vars;

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(soda.vars.get('nameLabel')).toEqual('e');

        done();
      };

      CoreSyntax.saveAsProperty(action, reply, tree);
    });

    it('Should saveAsUsing and load into soda without capture', function (done) {
      var element = tree.elements()["withId"]("textfield:1");

      var action = {
        save: "textfield:1",
        using: "id",
        property: "value",
        as: "nameLabel"
      };

      tree.vars = soda.vars;

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(soda.vars.get('nameLabel')).toEqual(element[0]);

        done();
      };

      CoreSyntax.saveAsUsing(action, reply, tree);
    });

    it('Should saveAsIfExistsUsing and load into soda without capture', function (done) {
      var element = tree.elements()["withId"]("textfield:1");

      var action = {
        saveIfExists: "textfield:1",
        using: "id",
        property: "value",
        as: "nameLabel"
      };

      tree.vars = soda.vars;

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(soda.vars.get('nameLabel')).toEqual("Username");

        done();
      };

      CoreSyntax.saveAsIfExistsUsing(action, reply, tree);
    });

    it('Should saveAs and load into soda without capture', function (done) {
      var element = tree.elements()["withId"]("textfield:1");

      var action = {
        save: "*[id='textfield:1']",
        property: "value",
        as: "nameLabel"
      };

      tree.vars = soda.vars;

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(soda.vars.get('nameLabel')).toEqual(element[0]);

        done();
      };

      CoreSyntax.saveAs(action, reply, tree);
    });

    it('Should saveAsIfExists and load into soda without capture', function (done) {
      var element = tree.elements()["withId"]("textfield:1");

      var action = {
        saveIfExists: "*[id='textfield:1']",
        property: "value",
        as: "nameLabel"
      };

      tree.vars = soda.vars;

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(soda.vars.get('nameLabel')).toEqual("Username");

        done();
      };

      CoreSyntax.saveAsIfExists(action, reply, tree);
    });

    it('Should saveAllAsPropertyUsing and load into soda without capture', function (done) {
      var element = tree.elements()["withId"]("textfield:1");

      var action = {
        saveAll: "userName",
        using: "name",
        property: "value",
        as: "nameLabel"
      };

      tree.vars = soda.vars;

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(soda.vars.get('nameLabel')[0]).toEqual("Username");

        done();
      };

      CoreSyntax.saveAllAsPropertyUsing(action, reply, tree);
    });

    it('Should saveAllAsProperty and load into soda without capture', function (done) {
      var element = tree.elements()["withId"]("textfield:1");

      var action = {
        saveAll: "*[id='textfield:1']",
        property: "value",
        as: "nameLabel"
      };

      tree.vars = soda.vars;

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(soda.vars.get('nameLabel')[0]).toEqual("Username");

        done();
      };

      CoreSyntax.saveAllAsProperty(action, reply, tree);
    });

    it('Should saveAllAsUsing and load into soda without capture', function (done) {
      var element = tree.elements()["withId"]("textfield:1");

      var action = {
        saveAll: "userName",
        using: "name",
        property: "value",
        as: "nameLabel"
      };

      tree.vars = soda.vars;

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(soda.vars.get('nameLabel').sodamembers).toEqual(2);

        done();
      };

      CoreSyntax.saveAllAsUsing(action, reply, tree);
    });

    it('Should saveAllAs and load into soda without capture', function (done) {
      var element = tree.elements()["withId"]("textfield:1");

      var action = {
        saveAll: "*[name='userName']",
        property: "value",
        as: "nameLabel"
      };

      tree.vars = soda.vars;

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(soda.vars.get('nameLabel').sodamembers).toEqual(2);

        done();
      };

      CoreSyntax.saveAllAs(action, reply, tree);
    });

    it('Should setTo', function (done) {
      var action = {
        set: "*[id='textfield:1']",
        to: 'hi'
      };

      var newTree = {
       tree: tree,
       update: function() { return tree; }
      };

      var sandbox = sinon.createSandbox();

      sandbox.stub(soda.framework, 'performElementInteraction').callsFake((interaction, elems, options, cb) => {
        cb(null, true);
      });

        var reply = function(err) {
          sandbox.restore();
          expect(err).toEqual(true);

          done();
       };

        CoreSyntax.setTo(action, reply, tree);
    });

    it('Should setToUsing', function (done) {
      var action = {
        set: "textfield:1",
        using: "id",
        to: 'hi'
      };

      var newTree = {
       tree: tree,
       update: function() { return tree; }
      };

      var sandbox = sinon.createSandbox();

      sandbox.stub(soda.framework, 'performElementInteraction').callsFake((interaction, elems, options, cb) => {
        cb(null, true);
      });

        var reply = function(err) {
          sandbox.restore();
          expect(err).toEqual(true);

          done();
       };

        CoreSyntax.setToUsing(action, reply, tree);
    });

    it('Should typeIn', function (done) {
        var action = {
          typeIn: "*[id='textfield:1']",
          to: 'hi'
        };

        var newTree = {
         tree: tree,
         update: function() { return tree; }
        };

        var sandbox = sinon.createSandbox();

        sandbox.stub(CoreSyntax, 'performElementInteraction').callsFake((name, e, reply, options, selector, refresh, scope, n, refreshTemp) => {
          reply(null, newTree);
        });

        var reply = function(err, res) {
          sandbox.restore();
          expect(res.tree).toEqual(tree);

          done();
        };

        CoreSyntax.typeIn(action, reply, tree);
    });

    it('Should typeInUsing', function (done) {
      var action = {
        typeIn: "textfield:1",
        using: "id",
        value: 'hi',
        refresh: false
      };

      var newTree = {
       tree: tree,
       update: function() { return tree; }
      };

      var sandbox = sinon.createSandbox();

      sandbox.stub(soda.framework, 'performElementInteraction').callsFake((interaction, elems, options, cb) => {
        cb(null, true);
      });

        var reply = function(err) {
          sandbox.restore();
          expect(err).toEqual(true);

          done();
       };

        CoreSyntax.typeInUsing(action, reply, tree);
    });

    it('Should sendKeys', function (done) {
        var action = {
          sendKeys: "*[id='textfield:1']",
          to: 'hi'
        };

        var newTree = {
         tree: tree,
         update: function() { return tree; }
        };

        var sandbox = sinon.createSandbox();

        sandbox.stub(CoreSyntax, 'performElementInteraction').callsFake((name, e, reply, options, selector, refresh, scope, n, refreshTemp) => {
          reply(null, newTree);
        });

        var reply = function(err, res) {
          sandbox.restore();
          expect(res.tree).toEqual(tree);

          done();
        };

        CoreSyntax.sendKeys(action, reply, tree);
    });

    it('Should sendKeysUsing', function (done) {
      var action = {
        sendKeys: "textfield:1",
        using: "id",
        value: 'hi',
        refresh: false
      };

      var newTree = {
       tree: tree,
       update: function() { return tree; }
      };

      var sandbox = sinon.createSandbox();

      sandbox.stub(soda.framework, 'performElementInteraction').callsFake((interaction, elems, options, cb) => {
        cb(null, true);
      });

        var reply = function(err) {
          sandbox.restore();
          expect(err).toEqual(true);

          done();
       };

        CoreSyntax.sendKeysUsing(action, reply, tree);
    });

    it('Should executeType an action', function (done) {
      var action = {
        execute: "googlewait",
        type: "action"
      };

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(result).toEqual('Should execute `googlewait` ❯ Should wait for elements `GOOGLE_SEARCH_SEARCH_BUTTON`');

        done();
      };

      soda.loadAssets(path.join(__dirname, '..', 'sample_project'), function(err, assetCollection) {
        tree.update = function() { return tree; };

        var run = new Run(soda);
        run.state = "running";

        var tempTree     = new Tree(JSON.parse(fs.readFileSync(path.resolve(__dirname + "/trees/google.json")).toString('utf-8')));

        soda.framework.getTree = function (complete, dontInstantiate, times) {
          complete('null', tempTree);
        };


        var newTree = {
         assets: assetCollection,
         config: soda.config,
         vars: soda.vars,
         soda: soda,
         elements: function() { return tempTree.elements() },
         tree: tempTree,
         run: run,
         console: { debug: function(str) {
                     console.log(str);
                   },
                   log: function(str) {
                     console.log(str)
                   }
                 }
        };

        CoreSyntax.executeType(action, reply, newTree);
      });
    });

    it('Should executeAndRepeatType an action', function (done) {
      var action = {
        execute: "googlewait",
        repeat: 3,
        type: "action"
      };

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(result).toEqual('Should execute `googlewait`');

        done();
      };

      soda.loadAssets(path.join(__dirname, '..', 'sample_project'), function(err, assetCollection) {
        tree.update = function() { return tree; };

        var run = new Run(soda);
        run.state = "running";

        var tempTree     = new Tree(JSON.parse(fs.readFileSync(path.resolve(__dirname + "/trees/google.json")).toString('utf-8')));

        soda.framework.getTree = function (complete, dontInstantiate, times) {
          complete('null', tempTree);
        };


        var newTree = {
         assets: assetCollection,
         config: soda.config,
         vars: soda.vars,
         soda: soda,
         elements: function() { return tempTree.elements() },
         tree: tempTree,
         run: run,
         console: { debug: function(str) {
                     console.log(str);
                   },
                   log: function(str) {
                     console.log(str)
                   }
                 }
        };

        CoreSyntax.executeAndRepeatType(action, reply, newTree);
      });
    });

    it('Should executeOverType on an action', function (done) {
      var action = {
        execute: "googlewait",
        over: [10, 8, 6],
        type: "action"
      };

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(result).toEqual('Should execute and repeat over `googlewait`');

        done();
      };

      soda.loadAssets(path.join(__dirname, '..', 'sample_project'), function(err, assetCollection) {
        tree.update = function() { return tree; };

        var run = new Run(soda);
        run.state = "running";

        var tempTree     = new Tree(JSON.parse(fs.readFileSync(path.resolve(__dirname + "/trees/google.json")).toString('utf-8')));

        soda.framework.getTree = function (complete, dontInstantiate, times) {
          complete('null', tempTree);
        };

        var newTree = {
         assets: assetCollection,
         config: soda.config,
         vars: soda.vars,
         soda: soda,
         elements: function() { return tempTree.elements() },
         tree: tempTree,
         run: run,
         console: { debug: function(str) {
                     console.log(str);
                   },
                   log: function(str) {
                     console.log(str)
                   }
                 }
        };

        CoreSyntax.executeOverType(action, reply, newTree);
      });
    });

    it('Should executeOver an action', function (done) {
      var action = {
        execute: "googlewait",
        over: [10, 8, 6]
      };

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(result).toEqual('Should execute and repeat over `googlewait`');

        done();
      };

      soda.loadAssets(path.join(__dirname, '..', 'sample_project'), function(err, assetCollection) {
        tree.update = function() { return tree; };

        var run = new Run(soda);
        run.state = "running";

        var tempTree     = new Tree(JSON.parse(fs.readFileSync(path.resolve(__dirname + "/trees/google.json")).toString('utf-8')));

        soda.framework.getTree = function (complete, dontInstantiate, times) {
          complete('null', tempTree);
        };

        var newTree = {
         assets: assetCollection,
         config: soda.config,
         vars: soda.vars,
         soda: soda,
         elements: function() { return tempTree.elements() },
         tree: tempTree,
         run: run,
         console: { debug: function(str) {
                     console.log(str);
                   },
                   log: function(str) {
                     console.log(str)
                   }
                 }
        };

        CoreSyntax.executeOver(action, reply, newTree);
      });
    });

    it('Should executeOverVariable an action', function (done) {
      var action = {
        execute: "googlewait",
        overVariable: "lengthObject"
      };

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(result).toEqual('Should execute and repeat over `googlewait`');

        done();
      };

      soda.loadAssets(path.join(__dirname, '..', 'sample_project'), function(err, assetCollection) {
        tree.update = function() { return tree; };

        var run = new Run(soda);
        run.state = "running";

        var tempTree     = new Tree(JSON.parse(fs.readFileSync(path.resolve(__dirname + "/trees/google.json")).toString('utf-8')));

        soda.framework.getTree = function (complete, dontInstantiate, times) {
          complete('null', tempTree);
        };

        soda.vars.save("lengthObject", [10, 8, 6]);

        var newTree = {
         assets: assetCollection,
         config: soda.config,
         vars: soda.vars,
         soda: soda,
         elements: function() { return tempTree.elements() },
         tree: tempTree,
         run: run,
         console: { debug: function(str) {
                     console.log(str);
                   },
                   log: function(str) {
                     console.log(str)
                   }
                 }
        };

        CoreSyntax.executeOverVariable(action, reply, newTree);
      });
    });

    it('Should execute an action', function (done) {
      var action = {
        execute: "googlewait"
      };

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(result).toEqual('Should execute `googlewait` ❯ Should wait for elements `GOOGLE_SEARCH_SEARCH_BUTTON`');

        done();
      };

      soda.loadAssets(path.join(__dirname, '..', 'sample_project'), function(err, assetCollection) {
        tree.update = function() { return tree; };

        var run = new Run(soda);
        run.state = "running";

        var tempTree     = new Tree(JSON.parse(fs.readFileSync(path.resolve(__dirname + "/trees/google.json")).toString('utf-8')));

        soda.framework.getTree = function (complete, dontInstantiate, times) {
          complete('null', tempTree);
        };


        var newTree = {
         assets: assetCollection,
         config: soda.config,
         vars: soda.vars,
         soda: soda,
         elements: function() { return tempTree.elements() },
         tree: tempTree,
         run: run,
         console: { debug: function(str) {
                     console.log(str);
                   },
                   log: function(str) {
                     console.log(str)
                   }
                 }
        };

        CoreSyntax.execute(action, reply, newTree);
      });
    });

    it('Should executeWidget an action', function (done) {
      var action = {
        executeWidget: "googlewait"
      };

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(result).toEqual('Should execute `googlewait` ❯ Should wait for elements `GOOGLE_SEARCH_SEARCH_BUTTON`');

        done();
      };

      soda.loadAssets(path.join(__dirname, '..', 'sample_project'), function(err, assetCollection) {
        tree.update = function() { return tree; };

        var run = new Run(soda);
        run.state = "running";

        var tempTree     = new Tree(JSON.parse(fs.readFileSync(path.resolve(__dirname + "/trees/google.json")).toString('utf-8')));

        soda.framework.getTree = function (complete, dontInstantiate, times) {
          complete('null', tempTree);
        };


        var newTree = {
         assets: assetCollection,
         config: soda.config,
         vars: soda.vars,
         soda: soda,
         elements: function() { return tempTree.elements() },
         tree: tempTree,
         run: run,
         console: { debug: function(str) {
                     console.log(str);
                   },
                   log: function(str) {
                     console.log(str)
                   }
                 }
        };

        CoreSyntax.executeWidget(action, reply, newTree);
      });
    });

    it('Should executeAndRepeat an action', function (done) {
      var action = {
        execute: "googlewait",
        repeat: 3
      };

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(result).toEqual('Should execute `googlewait`');

        done();
      };

      soda.loadAssets(path.join(__dirname, '..', 'sample_project'), function(err, assetCollection) {
        tree.update = function() { return tree; };

        var run = new Run(soda);
        run.state = "running";

        var tempTree     = new Tree(JSON.parse(fs.readFileSync(path.resolve(__dirname + "/trees/google.json")).toString('utf-8')));

        soda.framework.getTree = function (complete, dontInstantiate, times) {
          complete('null', tempTree);
        };


        var newTree = {
         assets: assetCollection,
         config: soda.config,
         vars: soda.vars,
         soda: soda,
         elements: function() { return tempTree.elements() },
         tree: tempTree,
         run: run,
         console: { debug: function(str) {
                     console.log(str);
                   },
                   log: function(str) {
                     console.log(str)
                   }
                 }
        };

        CoreSyntax.executeAndRepeat(action, reply, newTree);
      });
    });

    it('Should validateType on a screen', function (done) {
      var action = {
        validate: "googlesearch",
        type: "screen"
      };

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(result).toEqual('Should validate `googlesearch` ❯ 1 Element(s) with selector `GOOGLE_SEARCH_INPUT_FIELD` should exist');

        done();
      };

      soda.loadAssets(path.join(__dirname, '..', 'sample_project'), function(err, assetCollection) {
        tree.update = function() { return tree; };

        var run = new Run(soda);
        run.state = "running";

        var tempTree     = new Tree(JSON.parse(fs.readFileSync(path.resolve(__dirname + "/trees/google.json")).toString('utf-8')));

        var newTree = {
         assets: assetCollection,
         config: soda.config,
         vars: soda.vars,
         soda: soda,
         elements: function() { return tempTree.elements() },
         tree: tempTree,
         run: run,
         console: { debug: function(str) {
                     console.log(str);
                   },
                   log: function(str) {
                     console.log(str)
                   }
                 }
        };

        CoreSyntax.validateType(action, reply, newTree);
      });
    });

    it('Should validate a screen', function (done) {
      var action = {
        validate: "googlesearch"
      };

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(result).toEqual('Should validate `googlesearch` ❯ 1 Element(s) with selector `GOOGLE_SEARCH_INPUT_FIELD` should exist');

        done();
      };

      soda.loadAssets(path.join(__dirname, '..', 'sample_project'), function(err, assetCollection) {
        tree.update = function() { return tree; };

        var run = new Run(soda);
        run.state = "running";

        var tempTree     = new Tree(JSON.parse(fs.readFileSync(path.resolve(__dirname + "/trees/google.json")).toString('utf-8')));

        var newTree = {
         assets: assetCollection,
         config: soda.config,
         vars: soda.vars,
         soda: soda,
         elements: function() { return tempTree.elements() },
         tree: tempTree,
         run: run,
         console: { debug: function(str) {
                     console.log(str);
                   },
                   log: function(str) {
                     console.log(str)
                   }
                 }
        };

        CoreSyntax.validate(action, reply, newTree);
      });
    });

    it('Should wait on element', function (done) {
      var action = {
        wait: 1
      };

      tree.update = function() { return tree; };

      var newTree = {
       config: soda.config,
       soda: soda,
       elements: function() { return tree.elements() },
       tree: tree,
       run: { state: "running"},
       console: { debug: function(str) {
                   console.log(str);
                 },
                 log: function(str) {
                   console.log(str)
                 }
               }
      };

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(result).toEqual('Should wait 1 seconds');

        done();
      };

      CoreSyntax.wait(action, reply, newTree);
    });

    it('Should waitForUsing on element', function (done) {
      var action = {
        waitFor: "textfield:1",
        using: "id"
      };

      tree.update = function() { return tree; };

      var newTree = {
       config: soda.config,
       soda: soda,
       elements: function() { return tree.elements() },
       tree: tree,
       run: { state: "running"},
       console: { debug: function(str) {
         console.log(str);
       }}
      };

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(result).toEqual('Should wait for elements `textfield:1`');

        done();
      };

      CoreSyntax.waitForUsing(action, reply, newTree);
    });

    it('Should waitFor on element', function (done) {
      var action = {
        waitFor: "*[id='textfield:1']"
      };

      tree.update = function() { return tree; };

      var newTree = {
       config: soda.config,
       soda: soda,
       elements: function() { return tree.elements() },
       tree: tree,
       run: { state: "running"},
       console: { debug: function(str) {
         console.log(str);
       }}
      };

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(result).toEqual('Should wait for elements `*[id=\'textfield:1\']`');

        done();
      };

      CoreSyntax.waitFor(action, reply, newTree);
    });

    it('Should assertHasCountUsing not match on elements', function (done) {
      var action = {
        assert: "*[type='button']",
        using: "selector",
        hasCount: 7
      };

      var reply = function(err, result) {
        expect(err).toEqual(false);
        expect(result).toEqual('Elements with selector `*[type=\'button\']` should return 7 elements (Got 6 element(s)).');

        done();
      };

      CoreSyntax.assertHasCountUsing(action, reply, tree);
    });

    it('Should assertHasCountUsing on elements', function (done) {
      var action = {
        assert: "*[type='button']",
        using: "selector",
        hasCount: 6
      };

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(result).toEqual('Elements with selector `*[type=\'button\']` should return 6 elements.');

        done();
      };

      CoreSyntax.assertHasCountUsing(action, reply, tree);
    });

    it('Should assertHasCountGreaterThanUsing fails on an element that exists', function (done) {
      var action = {
        assert: "*[type='button']",
        using: "selector",
        hasCountGreaterThan: 7
      };

      var reply = function(err, result) {
        expect(err).toEqual(false);
        expect(result).toEqual('Elements with selector `*[type=\'button\']` should return more than 7 elements (Got 6 element(s)).');

        done();
      };

      CoreSyntax.assertHasCountGreaterThanUsing(action, reply, tree);
    });

    it('Should assertHasCountGreaterThanUsing on an element that exists', function (done) {
      var action = {
        assert: "*[type='button']",
        using: "selector",
        hasCountGreaterThan: 5
      };

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(result).toEqual('Elements with selector `*[type=\'button\']` should return more than 5 elements.');

        done();
      };

      CoreSyntax.assertHasCountGreaterThanUsing(action, reply, tree);
    });

    it('Should assertHasCountLessThanUsing fails on an element that exists', function (done) {
      var action = {
        assert: "*[type='button']",
        using: "selector",
        hasCountLessThan: 5
      };

      var reply = function(err, result) {
        expect(err).toEqual(false);
        expect(result).toEqual('Elements with selector `*[type=\'button\']` should return no more than 5 elements (Got 6 element(s)).');

        done();
      };

      CoreSyntax.assertHasCountLessThanUsing(action, reply, tree);
    });

    it('Should assertHasCountLessThanUsing on an element that exists', function (done) {
      var action = {
        assert: "*[type='button']",
        using: "selector",
        hasCountLessThan: 7
      };

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(result).toEqual('Elements with selector `*[type=\'button\']` should return no more than 7 elements.');

        done();
      };

      CoreSyntax.assertHasCountLessThanUsing(action, reply, tree);
    });

    it('Should assertHasCount not match on elements', function (done) {
      var action = {
        assert: "*[type='button']",
        hasCount: 7
      };

      var reply = function(err, result) {
        expect(err).toEqual(false);
        expect(result).toEqual('Elements with selector `*[type=\'button\']` should return 7 elements (Got 6 element(s)).');

        done();
      };

      CoreSyntax.assertHasCount(action, reply, tree);
    });

    it('Should assertHasCount on elements', function (done) {
      var action = {
        assert: "*[type='button']",
        hasCount: 6
      };

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(result).toEqual('Elements with selector `*[type=\'button\']` should return 6 elements.');

        done();
      };

      CoreSyntax.assertHasCount(action, reply, tree);
    });

    it('Should assertHasCountGreaterThan fails on an element that exists', function (done) {
      var action = {
        assert: "*[type='button']",
        hasCountGreaterThan: 7
      };

      var reply = function(err, result) {
        expect(err).toEqual(false);
        expect(result).toEqual('Elements with selector `*[type=\'button\']` should return more than 7 elements (Got 6 element(s)).');

        done();
      };

      CoreSyntax.assertHasCountGreaterThan(action, reply, tree);
    });

    it('Should assertHasCountGreaterThan on an element that exists', function (done) {
      var action = {
        assert: "*[type='button']",
        hasCountGreaterThan: 5
      };

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(result).toEqual('Elements with selector `*[type=\'button\']` should return more than 5 elements.');

        done();
      };

      CoreSyntax.assertHasCountGreaterThan(action, reply, tree);
    });

    it('Should assertHasCountLessThan fails on an element that exists', function (done) {
      var action = {
        assert: "*[type='button']",
        hasCountLessThan: 5
      };

      var reply = function(err, result) {
        expect(err).toEqual(false);
        expect(result).toEqual('Elements with selector `*[type=\'button\']` should return no more than 5 elements (Got 6 element(s)).');

        done();
      };

      CoreSyntax.assertHasCountLessThan(action, reply, tree);
    });

    it('Should assertHasCountLessThan on an element that exists', function (done) {
      var action = {
        assert: "*[type='button']",
        hasCountLessThan: 7
      };

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(result).toEqual('Elements with selector `*[type=\'button\']` should return no more than 7 elements.');

        done();
      };

      CoreSyntax.assertHasCountLessThan(action, reply, tree);
    });

    it('Should assertIsUsingProperty on an element that exists according to regex', function (done) {
      var action = {
        assert: "textfield:1",
        using: "id",
        property: "value",
        is: 'Username'
      };

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(result).toEqual('1 Element(s) with id `textfield:1` and property `value` should have value `Username`');

        done();
      };

      CoreSyntax.assertIsUsingProperty(action, reply, tree);
    });

    it('Should assertIsUsingProperty on an element that does not exist according to regex', function (done) {
      var action = {
        assert: "textfield:1",
        using: "id",
        property: "value",
        is: '1234'
      };

      var reply = function(err, result) {
        expect(err).toEqual(false);
        expect(result).toEqual('1 Element(s) with id `textfield:1` and property `value` should have value `1234`\n    (Element property `value` !== `1234`)');

        done();
      };

      CoreSyntax.assertIsUsingProperty(action, reply, tree);
    });

    it('Should assertIsUsing on an element that exists according to regex', function (done) {
      var action = {
        assert: "textfield:1",
        using: "id",
        is: 'Username'
      };

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(result).toEqual('1 Element(s) with id `textfield:1` and property `value` should have value `Username`');

        done();
      };

      CoreSyntax.assertIsUsing(action, reply, tree);
    });

    it('Should assertIsUsing on an element that does not exist according to regex', function (done) {
      var action = {
        assert: "a",
        using: "id",
        is: 'Username'
      };

      tree.run = { state: "stopped"};

      var reply = function(err, result) {
        expect(err).toEqual(false);
        expect(result).toEqual('Should assertIsUsing `a` (No elements found with id `a`)');

        done();
      };

      CoreSyntax.assertIsUsing(action, reply, tree);
    });

    it('Should assertIsProperty on an element that exists according to regex', function (done) {
      var action = {
        assert: "*[id='textfield:1']",
        property: "value",
        is: 'Username'
      };

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(result).toEqual('1 Element(s) with selector `*[id=\'textfield:1\']` and property `value` should have value `Username`');

        done();
      };

      CoreSyntax.assertIsProperty(action, reply, tree);
    });

    it('Should assertIsProperty on an element that does not exist according to regex', function (done) {
      var action = {
        assert: "*[id='a']",
        property: "value",
        is: 'Username'
      };

      tree.run = { state: "stopped"};

      var reply = function(err, result) {
        expect(err).toEqual(false);
        expect(result).toEqual('Should assertIsUsing `*[id=\'a\']` (No elements found with selector `*[id=\'a\']`)');

        done();
      };

      CoreSyntax.assertIsProperty(action, reply, tree);
    });

    it('Should assertIs on an element that exists according to regex', function (done) {
      var action = {
        assert: "*[id='textfield:1']",
        is: 'Username'
      };

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(result).toEqual('1 Element(s) with selector `*[id=\'textfield:1\']` and property `value` should have value `Username`');

        done();
      };

      CoreSyntax.assertIs(action, reply, tree);
    });

    it('Should assertIs on an element that does not exist according to regex', function (done) {
      var action = {
        assert: "*[id='a']",
        is: 'Username'
      };

      tree.run = { state: "stopped"};

      var reply = function(err, result) {
        expect(err).toEqual(false);
        expect(result).toEqual('Should assertIsUsing `*[id=\'a\']` (No elements found with selector `*[id=\'a\']`)');

        done();
      };

      CoreSyntax.assertIs(action, reply, tree);
    });

    it('Should assertMatchesUsingProperty on an element that exists according to regex', function (done) {
      var action = {
        assert: "textfield:1",
        using: "id",
        property: "value",
        matches: '^[a-zA-Z0-9_ ]*'
      };

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(result).toEqual('1 Element(s) with id `textfield:1` and property `value` should match /^[a-zA-Z0-9_ ]*/');

        done();
      };

      CoreSyntax.assertMatchesUsingProperty(action, reply, tree);
    });

    it('Should assertMatchesUsingProperty on an element that does not exist according to regex', function (done) {
      var action = {
        assert: "textfield:1",
        using: "id",
        property: "value",
        matches: '\d+'
      };

      var reply = function(err, result) {
        expect(err).toEqual(false);
        expect(result).toEqual('1 Element(s) with id `textfield:1` and property `value` should match /d+/');

        done();
      };

      CoreSyntax.assertMatchesUsingProperty(action, reply, tree);
    });

    it('Should assertMatchesUsing on an element that exists according to regex', function (done) {
      var action = {
        assert: "textfield:1",
        using: "id",
        matches: '^[a-zA-Z0-9_ ]*'
      };

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(result).toEqual('1 Element(s) with id `textfield:1` and property `value` should match /^[a-zA-Z0-9_ ]*/');

        done();
      };

      CoreSyntax.assertMatchesUsing(action, reply, tree);
    });

    it('Should assertMatchesUsing on an element that does not exist according to regex', function (done) {
      var action = {
        assert: "textfield:1",
        using: "id",
        matches: '\d+'
      };

      var reply = function(err, result) {
        expect(err).toEqual(false);
        expect(result).toEqual('1 Element(s) with id `textfield:1` and property `value` should match /d+/');

        done();
      };

      CoreSyntax.assertMatchesUsing(action, reply, tree);
    });

    it('Should assertMatchesProperty on an element that does exist according to regex', function (done) {
      var action = {
        assert: "*[id='textfield:1']",
        property: "value",
        matches: '^[a-zA-Z0-9_ ]*'
      };

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(result).toEqual('1 Element(s) with selector `*[id=\'textfield:1\']` and property `value` should match /^[a-zA-Z0-9_ ]*/');

        done();
      };

      CoreSyntax.assertMatchesProperty(action, reply, tree);
    });

    it('Should assertMatchesProperty on an element that does not exist according to regex', function (done) {
      var action = {
        assert: "*[id='textfield:1']",
        property: "value",
        matches: 'Myname'
      };

      var reply = function(err, result) {
        expect(err).toEqual(false);
        expect(result).toEqual('1 Element(s) with selector `*[id=\'textfield:1\']` and property `value` should match /Myname/');

        done();
      };

      CoreSyntax.assertMatchesProperty(action, reply, tree);
    });

    it('Should assertMatches on an element that exists according to regex', function (done) {
      var action = {
        assert: "*[id='textfield:1']",
        matches: '^[a-zA-Z0-9_ ]*'
      };

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(result).toEqual('1 Element(s) with selector `*[id=\'textfield:1\']` and property `value` should match /^[a-zA-Z0-9_ ]*/');

        done();
      };

      CoreSyntax.assertMatches(action, reply, tree);
    });

    it('Should assertMatches on an element that does not exist according to regex', function (done) {
      var action = {
        assert: "*[id='textfield:1']",
        matches: '\d+'
      };

      var reply = function(err, result) {
        expect(err).toEqual(false);
        expect(result).toEqual('1 Element(s) with selector `*[id=\'textfield:1\']` and property `value` should match /d+/');

        done();
      };

      CoreSyntax.assertMatches(action, reply, tree);
    });

    it('Should assertExistsUsing is true on an element that is in the tree', function (done) {
      var action = {
        assert: "textfield:1",
        using: "id",
        exists: true
      };

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(result).toEqual('1 Element(s) with id `textfield:1` should exist');

        done();
      };

      CoreSyntax.assertExistsUsing(action, reply, tree);
    });

    it('Should assertExistsUsing is false on an element that is in the tree', function (done) {
      var action = {
        assert: "textfield:1",
        using: "id",
        exists: false
      };

      var reply = function(err, result) {
        expect(err).toEqual(false);
        expect(result).toEqual('1 Element(s) with id `textfield:1` should not exist');

        done();
      };

      CoreSyntax.assertExistsUsing(action, reply, tree);
    });

    it('Should assertExistsUsing is true on an element that is not in the tree', function (done) {
      var action = {
        assert: "a",
        using: "id",
        exists: true
      };

      tree.run = { state: "stopped"};

      var reply = function(err, result) {
        expect(err).toEqual(false);
        expect(result).toEqual("Should assertExistsUsing `a` (No elements found with id `a`)");

        done();
      };

      CoreSyntax.assertExistsUsing(action, reply, tree);
    });

    it('Should assertExists is true on an element that is in the tree', function (done) {
      var action = {
        assert: "*[id='textfield:1']",
        exists: true
      };

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(result).toEqual('1 Element(s) with selector `*[id=\'textfield:1\']` should exist');

        done();
      };

      CoreSyntax.assertExists(action, reply, tree);
    });

    it('Should assertExists is true on an element that is not in the tree', function (done) {
      var action = {
        assert: "*[id='a']",
        exists: true
      };

      tree.run = { state: "stopped"};

      var reply = function(err, result) {
        expect(err).toEqual(false);
        expect(result).toEqual("Should assertExistsUsing `*[id=\'a\']` (No elements found with selector `*[id=\'a\']`)");

        done();
      };

      CoreSyntax.assertExists(action, reply, tree);
    });

    it('Should assertExists is false on an element that is in the tree', function (done) {
      var action = {
        assert: "*[id='textfield:1']",
        exists: false
      };

      var reply = function(err, result) {
        expect(err).toEqual(false);
        expect(result).toEqual('1 Element(s) with selector `*[id=\'textfield:1\']` should not exist');

        done();
      };

      CoreSyntax.assertExists(action, reply, tree);
    });

    it('Should getConfigAs and save into soda', function (done) {
      var action = {
        getConfig: "findElementRetries",
        as: "retryValue"
      };

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(soda.vars.get('retryValue')).toEqual(soda.config.get('findElementRetries'));

        done();
      };

      CoreSyntax.getConfigAs(action, reply, soda);
    });

    it('Should osexec as text', function (done) {

      var action = {
        saveResultsAs: "consolelog",
        osexec: (os === "win32" || os === "win64") ? "dir" : "ls"
      };

      var resultShouldBe = 'Should execute shell command `';
      resultShouldBe += (os === "win32" || os === "win64") ? 'dir' : 'ls';
      resultShouldBe +=  ' `';

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(result).toEqual(resultShouldBe);
        done();
      };

      CoreSyntax.osexec(action, reply, soda);
    });

    it('Should saveToFile as text', function (done) {
      var action = {
        savetofile: path.join(__dirname, "..", "file.txt"),
        input: "This is new data."
      };

      fs.exists(path.join(__dirname, "..", "file.txt"), function(exists) {
        if(exists) {
          fs.unlinkSync(path.join(__dirname, "..", "file.txt"));
        } else {
        }
      });

      spy1.resetHistory();

      var reply = function(err, result) {
        done();
      };

      CoreSyntax.saveToFile(action, reply, soda);

      expect(spy1.callCount).toEqual(1);

      done();
    });

    it('Should set retries in soda', function (done) {
      var action = {
        retries: 99
      };

      expect(soda.config.get('findElementRetries')).toEqual(3);

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(soda.config.get('findElementRetries')).toEqual(99);

        done();
      };

      CoreSyntax.retries(action, reply, soda);
    });

    it('Should setConfigTo in soda', function (done) {
      var action = {
        setConfig: "findElementCount",
        to: 12
      };

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(soda.config.get('findElementCount')).toEqual(12);

        done();
      };

      CoreSyntax.setConfigTo(action, reply, soda);
    });

    it('Should saveObjectAs in soda', function (done) {
      var action = {
        saveObject: "myobject",
        as: "newobject"
      };

      var myobj = { here: 'is', an: 'object' };

      soda.vars.save('myobject', myobj);

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(soda.vars.get('newobject')).toEqual(myobj);

        done();
      };

      CoreSyntax.saveObjectAs(action, reply, tree);
    });

    it('Should deleteVar from soda', function (done) {
      var action = {
        delete: "hello"
      };

      soda.vars.save('hello', 'world');

      expect(soda.vars.get('hello')).toEqual('world');

      var reply = function(err, result) {
        expect(err).toEqual(true);
        expect(soda.vars.get('hello')).toEqual(null);

        done();
      };

      CoreSyntax.deleteVar(action, reply, tree);
    });
});
