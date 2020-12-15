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
    Exception = require(path.join(__dirname, "..", "SodaCommon", "Exception")),
    fs     = require("fs");

require(path.join(__dirname, "..", "SodaCommon", "ProtoLib"));

describe('Core Tree should pass all validation tests on the Login Screen', function () {
    var tree, elements, Soda   = require(path.join(__dirname, "..", "SodaCore", "lib", "Soda")), localSoda = new Soda({ console: { supress: true } }).init(), Tree   = (require(path.join(__dirname, "..", "SodaCore", "lib", "Tree")))(localSoda);

    beforeAll(function () {
        tree     = new Tree(JSON.parse(fs.readFileSync(path.resolve(__dirname + "/trees/LoginScreen.json")).toString('utf-8')));
        elements = tree.elements();
    });

    afterAll(function (done) {
      localSoda.kill();

      localSoda = null;
      
      done();
    });

    it('Should get the proper selector type', function () {
      expect(tree.selectorType('#myid')).toEqual('id');
    });

    it('Should get the proper tree hash', function () {
      expect(tree.treeHash('{ body: {} }')).toBeInstanceOf(String);
      expect(tree.treeHash({ body: {} })).toBeInstanceOf(String);
    });

    it('Should print the proper tree', function () {
      var savedMethod = console.log;
      var localTree = new Tree(JSON.parse(fs.readFileSync(path.resolve(__dirname + "/trees/SmallScreen.json")).toString('utf-8')));
      let spy = sinon.spy(console, 'log');
      expect(tree.print()).toBeInstanceOf(Object);
      sinon.assert.called(spy);
      spy.restore();
      console.log = savedMethod;
    });

    it('Should get the elements', function () {
      var localTree = new Tree(JSON.parse(fs.readFileSync(path.resolve(__dirname + "/trees/SmallScreen.json")).toString('utf-8')));
      expect(localTree.elements).toBeInstanceOf(Function);
    });

    it('Should find elements at multiple levels', function (done) {
      var localTree = new Tree(JSON.parse(fs.readFileSync(path.resolve(__dirname + "/trees/SmallScreen.json")).toString('utf-8')));

      localTree.findElementsAtLevel(0, function(err, result) {
        expect(result.length).toEqual(1);

        localTree.findElementsAtLevel(1, function(err, result) {
          expect(result.length).toEqual(1);

          localTree.findElementsAtLevel(2, function(err, result) {
            expect(result.length).toEqual(0);

            done();
          });
        });
      });
    });

    it('Should find elements at level and include everything above', function (done) {
      var localTree = new Tree(JSON.parse(fs.readFileSync(path.resolve(__dirname + "/trees/LoginScreen.json")).toString('utf-8')));

      localTree.findElementsAtDelta(0, function(err, result) {
        expect(result.length).toEqual(44);

        localTree.findElementsAtDelta(1, function(err, result) {
          expect(result.length).toEqual(41);

          localTree.findElementsAtDelta(2, function(err, result) {
            expect(result.length).toEqual(19);

            localTree.findElementsAtDelta(3, function(err, result) {
              expect(result.length).toEqual(6);

              localTree.findElementsAtDelta(4, function(err, result) {
                expect(result.length).toEqual(0);

                done();
              });
            });
          });
        });
      });
    });

    it('Should find an element by id', function (done) {
      var localTree = new Tree(JSON.parse(fs.readFileSync(path.resolve(__dirname + "/trees/LoginScreen.json")).toString('utf-8')));

      localTree.findElementById('window:0', function(err, result) {
        expect(result.length).toEqual(1);
        expect(result[0].type).toEqual('window');

        done();
      });
    });

    it('Should not find an element by id that is not there', function (done) {
      var localTree = new Tree(JSON.parse(fs.readFileSync(path.resolve(__dirname + "/trees/LoginScreen.json")).toString('utf-8')));

      localTree.findElementById('thiselementisnotthere', function(err, result) {
        expect(result.length).toEqual(0);

        done();
      });
    });

    it('Should find an element by id with alias', function (done) {
      var localTree = new Tree(JSON.parse(fs.readFileSync(path.resolve(__dirname + "/trees/LoginScreen.json")).toString('utf-8')));

      localTree.findElementsById('window:0', function(err, result) {
        expect(result.length).toEqual(1);
        expect(result[0].type).toEqual('window');

        done();
      });
    });

    it('Should find an element by name', function (done) {
      var localTree = new Tree(JSON.parse(fs.readFileSync(path.resolve(__dirname + "/trees/LoginScreen.json")).toString('utf-8')));

      localTree.findElementsByName('help icon', function(err, result) {
        expect(result.length).toEqual(1);
        expect(result[0].type).toEqual('button');

        done();
      });
    });

    it('Should not find an element by name that is not there', function (done) {
      var localTree = new Tree(JSON.parse(fs.readFileSync(path.resolve(__dirname + "/trees/LoginScreen.json")).toString('utf-8')));

      localTree.findElementsByName('thiselementisnotthere', function(err, result) {
        expect(result.length).toEqual(0);

        done();
      });
    });

    it('Should find an element by label', function (done) {
      var localTree = new Tree(JSON.parse(fs.readFileSync(path.resolve(__dirname + "/trees/LoginScreen.json")).toString('utf-8')));

      localTree.findElementsByLabel('1-877-247-ALLY (2559)', function(err, result) {
        expect(result.length).toEqual(1);
        expect(result[0].type).toEqual('statictext');

        done();
      });
    });

    it('Should not find an element by label that is not there', function (done) {
      var localTree = new Tree(JSON.parse(fs.readFileSync(path.resolve(__dirname + "/trees/LoginScreen.json")).toString('utf-8')));

      localTree.findElementsByLabel('thiselementisnotthere', function(err, result) {
        expect(result.length).toEqual(0);

        done();
      });
    });

    it('Should find an element by value', function (done) {
      var localTree = new Tree(JSON.parse(fs.readFileSync(path.resolve(__dirname + "/trees/LoginScreen.json")).toString('utf-8')));

      localTree.findElementsByValue('Find ATMs', function(err, result) {
        expect(result.length).toEqual(1);
        expect(result[0].type).toEqual('statictext');

        done();
      });
    });

    it('Should not find an element by value that is not there', function (done) {
      var localTree = new Tree(JSON.parse(fs.readFileSync(path.resolve(__dirname + "/trees/LoginScreen.json")).toString('utf-8')));

      localTree.findElementsByValue('thiselementisnotthere', function(err, result) {
        expect(result.length).toEqual(0);

        done();
      });
    });

    it('Should find an element by type', function (done) {
      var localTree = new Tree(JSON.parse(fs.readFileSync(path.resolve(__dirname + "/trees/LoginScreen.json")).toString('utf-8')));

      localTree.findElementsByType('button', function(err, result) {
        expect(result.length).toEqual(6);
        expect(result[0].type).toEqual('button');

        done();
      });
    });

    it('Should not find an element by type that is not there', function (done) {
      var localTree = new Tree(JSON.parse(fs.readFileSync(path.resolve(__dirname + "/trees/LoginScreen.json")).toString('utf-8')));

      localTree.findElementsByType('thistypeisnotthere', function(err, result) {
        expect(result.length).toEqual(0);

        done();
      });
    });

    it('Should find an element by a selector set', function (done) {
      var localTree = new Tree(JSON.parse(fs.readFileSync(path.resolve(__dirname + "/trees/LoginScreen.json")).toString('utf-8')));

      localTree.findElementsBySelectorSet('#{window:0} @{Find ATMs}', function(err, result) {
        expect(result.length).toEqual(1);

        done();
      });
    });

    it('Should find an element by a selector', function (done) {
      var localTree = new Tree(JSON.parse(fs.readFileSync(path.resolve(__dirname + "/trees/LoginScreen.json")).toString('utf-8')));

      localTree.findElementsBySelector('@{Find ATMs}', function(err, result) {
        expect(result.length).toEqual(1);

        done();
      });
    });

    it('Should not find non-existent elements', function () {
        expect(elements.withSelector("@{doesn't exist}").length).toEqual(0);
        expect(elements.withSelector("#{doesn't exist}").length).toEqual(0);
        expect(elements.withSelector("^{doesn't exist}").length).toEqual(0);
        expect(elements.withSelector(".{doesn't exist}").length).toEqual(0);

        expect(elements.withSelector("#{window:0} .doesntExist").length).toEqual(0);
        expect(elements.withSelector(".{userName} .doesntExist").length).toEqual(0);

        expect(elements.withSelector("#{window:0} .{userName} .doesntExist").length).toEqual(0);
        expect(elements.withSelector("#{window:0} .{userName} .{userName}").length).toEqual(1);
        expect(elements.withSelector("#{window:0} .{userName} .{userName} .doesntExist").length).toEqual(0);
    });

    it('Should find the `username` textfield and `Username` label using various selectors', function () {
        expect(elements.withSelector("@{Username}").length).toEqual(2);
        expect(elements.withSelector("@{Username}[type='textfield']").length).toEqual(2);
        expect(elements.withSelector("@{Username}[rect.origin.x='219.5']").length).toEqual(2);
        expect(elements.withSelector("@{Username}[type='textfield'][rect.origin.x='219.5']").length).toEqual(2);
        expect(elements.withSelector("@{Username}[type='textfield'][rect.origin.x='219.5'][value='Username']").length).toEqual(2);
        expect(elements.withSelector("@{Username}[type='textfield'][rect.origin.x='219.5'][label='userName']").length).toEqual(2);

        expect(elements.withSelector("^{userName}").length).toEqual(2);
        expect(elements.withSelector(".{userName}").length).toEqual(2);
        expect(elements.withSelector("#{window:0} @{Username}").length).toEqual(2);
        expect(elements.withSelector("#{window:0} .{userName}").length).toEqual(2);

        expect(elements.withSelector("#window:0 .userName[nth=0] < .userName .userName[nth=0]").length).toEqual(1);
        expect(elements.withSelector("#window:0 .userName[nth=0] < .userName .userName[nth=1]").length).toEqual(0);
        expect(elements.withSelector(".userName .userName[nth=0]").length).toEqual(1);
        expect(elements.withSelector(".userName .userName[nth=1]").length).toEqual(0);
        expect(elements.withSelector(".userName .userName .userName").length).toEqual(0);
    });

    it('Should expect a space between selectors to represent hierarchy', function () {
        expect(elements.withSelector(".userName^{userName}").length).toEqual(2);
        expect(elements.withSelector("@Username.{userName}").length).toEqual(2);
        expect(elements.withSelector(".userName.userName").length).toEqual(2);
        expect(elements.withSelector("#{window:0}@{Username}").length).toEqual(0);
        expect(elements.withSelector("#{window:0}.{userName}").length).toEqual(0);
        
        expect(elements.withSelector("#window:0.userName[nth=0]<.userName.userName[nth=0]")).toEqual(new Error("Invalid selector: `" + "#window:0.userName[nth=0]<.userName.userName[nth=0]" + "`"));
        expect(elements.withSelector("#window:0.userName[nth=0]<.userName.userName[nth=1]")).toEqual(new Error("Invalid selector: `" + "#window:0.userName[nth=0]<.userName.userName[nth=1]" + "`"));

        expect(elements.withSelector(".userName.userName[nth=0]").length).toEqual(1);
        expect(elements.withSelector(".userName.userName[nth=1]").length).toEqual(1);
        expect(elements.withSelector(".userName.userName .userName").length).toEqual(1);
    });

    it('Should find the `username` textfield and `Username` label compound selectors', function () {
        expect(elements.withSelector(".userName@{Username}").length).toEqual(2);
        expect(elements.withSelector(".userName@{Username}^{userName}").length).toEqual(2);
        expect(elements.withSelector(".userName@{Username}^{userName}#textfield:0").length).toEqual(1);
        expect(elements.withSelector(".userName@{Username}^{userName}#textfield:1").length).toEqual(1);
        expect(elements.withSelector(".userName@{Username}^{userName}[nth=0]").length).toEqual(1);
        expect(elements.withSelector(".userName@{Username}^{userName}").length).toEqual(2);

        expect(elements.withSelector("#window:0 .userName@{Username}").length).toEqual(2);
        expect(elements.withSelector("#window:0 .userName@{Username}^{userName}").length).toEqual(2);
        expect(elements.withSelector("#window:0 .userName@{Username}^{userName}#textfield:0").length).toEqual(1);
        expect(elements.withSelector("#window:0 .userName@{Username}^{userName}[nth=0]").length).toEqual(1);
        expect(elements.withSelector("#window:0 .userName@{Username}^{userName}").length).toEqual(2);

        expect(elements.withSelector("#window:0 .userName .userName@{Username}").length).toEqual(1);
        expect(elements.withSelector("#window:0 .userName .userName@{Username}^{userName}").length).toEqual(1);
        expect(elements.withSelector("#window:0 .userName .userName@{Username}^{userName}#textfield:0").length).toEqual(0);
        expect(elements.withSelector("#window:0 .userName .userName@{Username}^{userName}#textfield:1").length).toEqual(1);
        expect(elements.withSelector("#window:0 .userName .userName@{Username}^{userName}[nth=0]").length).toEqual(1);
        expect(elements.withSelector("#window:0 .userName .userName@{Username}^{userName}").length).toEqual(1);

        expect(elements.withSelector("#window:0 .userName^userName@Username#textfield:0 .userName@{Username}").length).toEqual(1);
        expect(elements.withSelector("#window:0 .userName^userName@Username#textfield:0 .userName@{Username}^{userName}").length).toEqual(1);
        expect(elements.withSelector("#window:0 .userName^userName@Username#textfield:0 .userName@{Username}^{userName}#textfield:0").length).toEqual(0);
        expect(elements.withSelector("#window:0 .userName^userName@Username#textfield:0 .userName@{Username}^{userName}#textfield:1").length).toEqual(1);
        expect(elements.withSelector("#window:0 .userName^userName@Username#textfield:1 .userName@{Username}^{userName}#textfield:1").length).toEqual(0);
        expect(elements.withSelector("#window:0 .userName^userName@Username#textfield:0 .userName@{Username}^{userName}[nth=0]").length).toEqual(1);
        expect(elements.withSelector("#window:0 .userName^userName@Username#textfield:0 .userName@{Username}^{userName}").length).toEqual(1);

        expect(elements.withSelector("#window:0 .userName.userName.userName").length).toEqual(2);
        expect(elements.withSelector("#window:0 .userName.userName.userName .userName.userName.userName").length).toEqual(1);

        expect(elements.withSelector("#window:0 ^userName^userName^userName").length).toEqual(2);
        expect(elements.withSelector("#window:0 ^userName^userName^userName ^userName^userName^userName").length).toEqual(1);

        expect(elements.withSelector("#window:0[rect.origin.x=0] .userName^userName@Username#textfield:0[type='textfield'] .userName@{Username}").length).toEqual(1);
        expect(elements.withSelector("#window:0[rect.origin.x=0] .userName^userName@Username#textfield:0[type='textfield'] .userName@{Username}^{userName}").length).toEqual(1);
        expect(elements.withSelector("#window:0[rect.origin.x=0] .userName^userName@Username#textfield:0[type='textfield'] .userName@{Username}^{userName}#textfield:0").length).toEqual(0);
        expect(elements.withSelector("#window:0[rect.origin.x=0] .userName^userName@Username#textfield:0[type='textfield'] .userName@{Username}^{userName}#textfield:1").length).toEqual(1);
        expect(elements.withSelector("#window:0[rect.origin.x=0] .userName^userName@Username#textfield:1[type='textfield'] .userName@{Username}^{userName}#textfield:1").length).toEqual(0);
        expect(elements.withSelector("#window:0[rect.origin.x=0] .userName^userName@Username#textfield:0[type='textfield'] .userName@{Username}^{userName}[nth=0]").length).toEqual(1);
        expect(elements.withSelector("#window:0[rect.origin.x=0] .userName^userName@Username#textfield:0[type='textfield'] .userName@{Username}^{userName}").length).toEqual(1);

        expect(elements.withSelector("#window:0 .userName^userName@Username#textfield:0[nth=0] .userName@{Username}").length).toEqual(1);
        expect(elements.withSelector("#window:0 .userName^userName@Username#textfield:0[nth=0] .userName@{Username}^{userName}").length).toEqual(1);
        expect(elements.withSelector("#window:0 .userName^userName@Username#textfield:0[nth=0] .userName@{Username}^{userName}#textfield:0").length).toEqual(0);
        expect(elements.withSelector("#window:0 .userName^userName@Username#textfield:0[nth=0] .userName@{Username}^{userName}#textfield:1").length).toEqual(1);
        expect(elements.withSelector("#window:0 .userName^userName@Username#textfield:1[nth=0] .userName@{Username}^{userName}#textfield:1").length).toEqual(0);
        expect(elements.withSelector("#window:0 .userName^userName@Username#textfield:0[nth=0] .userName@{Username}^{userName}[nth=0]").length).toEqual(1);
        expect(elements.withSelector("#window:0 .userName^userName@Username#textfield:0[nth=0] .userName@{Username}^{userName}").length).toEqual(1);

        expect(elements.withSelector("#window:0 .userName^userName@Username#textfield:0[nth=1] .userName@{Username}").length).toEqual(0);
        expect(elements.withSelector("#window:0 .userName^userName@Username#textfield:0[nth=1] .userName@{Username}^{userName}").length).toEqual(0);
        expect(elements.withSelector("#window:0 .userName^userName@Username#textfield:0[nth=1] .userName@{Username}^{userName}#textfield:0").length).toEqual(0);
        expect(elements.withSelector("#window:0 .userName^userName@Username#textfield:0[nth=1] .userName@{Username}^{userName}#textfield:1").length).toEqual(0);
        expect(elements.withSelector("#window:0 .userName^userName@Username#textfield:1[nth=1] .userName@{Username}^{userName}#textfield:1").length).toEqual(0);
        expect(elements.withSelector("#window:0 .userName^userName@Username#textfield:0[nth=1] .userName@{Username}^{userName}[nth=0]").length).toEqual(0);
        expect(elements.withSelector("#window:0 .userName^userName@Username#textfield:0[nth=1] .userName@{Username}^{userName}").length).toEqual(0);

        expect(elements.withSelector("* .userName@{Username}").length).toEqual(2);
        expect(elements.withSelector("* * .userName#{textfield:1}").length).toEqual(1);
        expect(elements.withSelector(".userName > < .userName#{textfield:1}@Username").length).toEqual(1);
        expect(elements.withSelector(".userName@Username[nth=0] *").length).toEqual(1);
        expect(elements.withSelector(".userName@Username[nth=1] *").length).toEqual(0);
    });

    it('Should find the `username` textfield using various selectors', function () {
        expect(elements.withSelector("#{textfield:0}").length).toEqual(1);
        expect(elements.withSelector("#{textfield:0}[type='textfield']").length).toEqual(1);
        expect(elements.withSelector("#{textfield:0}[rect.origin.x='219.5']").length).toEqual(1);
        expect(elements.withSelector("#{textfield:0}[type='textfield'][rect.origin.x='219.5']").length).toEqual(1);
        expect(elements.withSelector("#{textfield:0}[type='textfield'][rect.origin.x='219.5'][value='Username']").length).toEqual(1);
        expect(elements.withSelector("#{textfield:0}[type='textfield'][rect.origin.x='219.5'][label='userName']").length).toEqual(1);
        expect(elements.withSelector("#{textfield:0}[type='textfield'][rect.origin.x='219.5'][label='userName'][parent.id='window:0']").length).toEqual(1);
        expect(elements.withSelector("#{textfield:0}[type='textfield'][rect.origin.x='219.5'][label~'user.*'][parent.id='window:0']").length).toEqual(1);
        expect(elements.withSelector("#{textfield:0}[type='textfield'][rect.origin.x='219.5'][label~'userFAIL.*'][parent.id='window:0']").length).toEqual(0);
    });

    it('Should find the `Username` label using various selectors', function () {
        expect(elements.withSelector("@{Username} @{Username}").length).toEqual(1);
        expect(elements.withSelector(".{userName} .{userName}").length).toEqual(1);
        expect(elements.withSelector(".{userName} @{Username}").length).toEqual(1);
        expect(elements.withSelector("@{Username} .{userName}").length).toEqual(1);

        var a = elements.withSelector("@{Username} @{Username}")[0];
        var b = elements.withSelector("@{Username} .{userName}")[0];
        expect(a === b).toEqual(true);

        a = elements.withSelector(".{userName} @{Username}")[0];
        b = elements.withSelector("@{Username} .{userName}")[0];
        expect(a === b).toEqual(true);

        a = elements.withSelector(".{userName} .{userName}")[0];
        b = elements.withSelector("@{Username} .{userName}")[0];
        expect(a === b).toEqual(true);

        a = elements.withSelector(".{userName} @{Username}")[0];
        b = elements.withSelector(".{userName} .{userName}")[0];
        expect(a === b).toEqual(true);

        expect(elements.withSelector("#{textfield:1}").length).toEqual(1);
        expect(elements.withSelector("#{textfield:1}[type='textfield']").length).toEqual(1);
        expect(elements.withSelector("#{textfield:1}[rect.origin.x='219.5']").length).toEqual(1);
        expect(elements.withSelector("#{textfield:1}[type='textfield'][rect.origin.x='219.5']").length).toEqual(1);
        expect(elements.withSelector("#{textfield:1}[type='textfield'][rect.origin.x='219.5'][value='Username']").length).toEqual(1);
        expect(elements.withSelector("#{textfield:1}[type='textfield'][rect.origin.x='219.5'][label='userName']").length).toEqual(1);
        expect(elements.withSelector("#{textfield:1}[type='textfield'][rect.origin.x='219.5'][label='userName'][parent.id='textfield:0']").length).toEqual(1);
        expect(elements.withSelector("#{textfield:1}[type='textfield'][rect.origin.x='219.5'][label~'user.*'][parent.id='textfield:0']").length).toEqual(1);
        expect(elements.withSelector("#{textfield:1}[type='textfield'][rect.origin.x='219.5'][label~'userFAIL.*'][parent.id='textfield:0']").length).toEqual(0);
    });

    it('Should find the `password` securetextfield and `Password` label using various selectors', function () {

        expect(elements.withSelector("@{Password}").length).toEqual(2);
        expect(elements.withSelector("@{Password}[type='securetextfield']").length).toEqual(2);
        expect(elements.withSelector("@{Password}[rect.origin.x='220.5']").length).toEqual(2);
        expect(elements.withSelector("@{Password}[type='securetextfield'][rect.origin.x='220.5']").length).toEqual(2);
        expect(elements.withSelector("@{Password}[type='securetextfield'][rect.origin.x='220.5'][value='Password']").length).toEqual(2);
        expect(elements.withSelector("@{Password}[type='securetextfield'][rect.origin.x='220.5'][label='password']").length).toEqual(2);

        expect(elements.withSelector("^{password}").length).toEqual(2);
        expect(elements.withSelector(".{password}").length).toEqual(2);
        expect(elements.withSelector("#{window:0} @{Password}").length).toEqual(2);
        expect(elements.withSelector("#{window:0} .{password}").length).toEqual(2);
    });

    it('Should find the `pasword` securetextfield using various selectors', function () {
        expect(elements.withSelector("#{securetextfield:0}").length).toEqual(1);
        expect(elements.withSelector("#{securetextfield:0}[type='securetextfield']").length).toEqual(1);
        expect(elements.withSelector("#{securetextfield:0}[rect.origin.x='220.5']").length).toEqual(1);
        expect(elements.withSelector("#{securetextfield:0}[type='securetextfield'][rect.origin.x='220.5']").length).toEqual(1);
        expect(elements.withSelector("#{securetextfield:0}[type='securetextfield'][rect.origin.x='220.5'][value='Password']").length).toEqual(1);
        expect(elements.withSelector("#{securetextfield:0}[type='securetextfield'][rect.origin.x='220.5'][label='password']").length).toEqual(1);
        expect(elements.withSelector("#{securetextfield:0}[type='securetextfield'][rect.origin.x='220.5'][label='password'][parent.id='window:0']").length).toEqual(1);
        expect(elements.withSelector("#{securetextfield:0}[type='securetextfield'][rect.origin.x='220.5'][label~'pass.*'][parent.id='window:0']").length).toEqual(1);
        expect(elements.withSelector("#{securetextfield:0}[type='securetextfield'][rect.origin.x='220.5'][label~'thisshouldfail.*'][parent.id='window:0']").length).toEqual(0);
    });

    it('Should find the `Password` label using various selectors', function () {
        expect(elements.withSelector("#{securetextfield:1}").length).toEqual(1);
        expect(elements.withSelector("#{securetextfield:1}[type='securetextfield']").length).toEqual(1);
        expect(elements.withSelector("#{securetextfield:1}[rect.origin.x='220.5']").length).toEqual(1);
        expect(elements.withSelector("#{securetextfield:1}[type='securetextfield'][rect.origin.x='220.5']").length).toEqual(1);
        expect(elements.withSelector("#{securetextfield:1}[type='securetextfield'][rect.origin.x='220.5'][value='Password']").length).toEqual(1);
        expect(elements.withSelector("#{securetextfield:1}[type='securetextfield'][rect.origin.x='220.5'][label='password']").length).toEqual(1);
        expect(elements.withSelector("#{securetextfield:1}[type='securetextfield'][rect.origin.x='220.5'][label='password'][parent.id='securetextfield:0']").length).toEqual(1);
        expect(elements.withSelector("#{securetextfield:1}[type='securetextfield'][rect.origin.x='220.5'][label~'pass.*'][parent.id='securetextfield:0']").length).toEqual(1);
        expect(elements.withSelector("#{securetextfield:1}[type='securetextfield'][rect.origin.x='220.5'][label~'thisshouldfail.*'][parent.id='securetextfield:0']").length).toEqual(0);
    });

    it('Should validate the login screen', function () {
        expect(elements.withSelector(".loginButton").length).toEqual(1);
        expect(elements.withSelector("^{1-877-247-ALLY (2559)}").length).toBeGreaterThan(0);
        expect(elements.withSelector(".callWaitTime")[0].value).toMatch(/^call wait time: (--|\\d+ min)$/);
        expect(elements.withSelector(".userName")[0].value).toMatch(/^(Username|\\w{4}•{6})$/);
        expect(elements.withSelector("^{Forgot username?}").length).toBeGreaterThan(0);
        expect(elements.withSelector("^{Remember username?}").length).toBeGreaterThan(0);
        expect(elements.withSelector("^{At least 1 number}").length).toBeGreaterThan(0);
        expect(elements.withSelector("^{At least 1 letter, case sensitive}").length).toBeGreaterThan(0);
        expect(elements.withSelector("^{8-32 characters, no spaces}").length).toBeGreaterThan(0);
        expect(elements.withSelector(".password")[0].value).toEqual("Password");
        expect(elements.withSelector(".loginButton ^{Log In}")[0].value).toEqual("Log In");
        expect(elements.withSelector(".locatorButton ^{Find ATMs}")[0].value).toEqual("Find ATMs");
        expect(elements.withSelector(".productsAndRatesButton ^{Products & Rates}")[0].value).toEqual("Products & Rates");
        expect(elements.withSelector(".aboutAllyButton ^{About Ally}")[0].value).toEqual("About Ally");
        expect(elements.withSelector("^{©2015 Ally Financial, Inc. }")[0].value).toEqual("©2015 Ally Financial, Inc. ");
        expect(elements.withSelector("^{©2015 Ally Financial, Inc. }").length).toBeGreaterThan(0);
        expect(elements.withSelector("^{©2015 Ally Financial, Inc. }").length).toBeGreaterThan(0);
        expect(elements.withSelector(".saveUserNameSwitch")[0].value).toEqual(0);
    });

    it('Should find elements using the direct descendant operator (>)', function () {

        expect(elements.withSelector(">").length).toEqual(3);
        expect(elements.withSelector("> >").length).toEqual(22);
        expect(elements.withSelector("> > >").length).toEqual(13);
        expect(elements.withSelector("> > > >").length).toEqual(6);
        expect(elements.withSelector("> > > > >").length).toEqual(0);

        expect(elements.withSelector(">[nth=0]").length).toEqual(1);
        expect(elements.withSelector(">[nth=1]").length).toEqual(1);
        expect(elements.withSelector(">[nth=2]").length).toEqual(1);

        expect(elements.withSelector(">[nth=0]")[0].id).toEqual("window:0");
        expect(elements.withSelector(">[nth=1]")[0].id).toEqual("window:1");
        expect(elements.withSelector(">[nth=2]")[0].id).toEqual("window:2");

        expect(elements.withSelector("#{window:0}").length).toEqual(1);
        expect(elements.withSelector("#{window:0} >").length).toEqual(21);
        expect(elements.withSelector("#{window:0} > >").length).toEqual(9);
        expect(elements.withSelector("#{window:0} > > >").length).toEqual(6);
        expect(elements.withSelector("#{window:0} > > > >").length).toEqual(0);

        expect(elements.withSelector("#{window:1}").length).toEqual(1);
        expect(elements.withSelector("#{window:1} >").length).toEqual(0);
        expect(elements.withSelector("#{window:1} > >").length).toEqual(0);
        expect(elements.withSelector("#{window:1} > > >").length).toEqual(0);
        expect(elements.withSelector("#{window:1} > > > >").length).toEqual(0);

        expect(elements.withSelector("#{window:2}").length).toEqual(1);
        expect(elements.withSelector("#{window:2} >").length).toEqual(1);
        expect(elements.withSelector("#{window:2} > >").length).toEqual(4);
        expect(elements.withSelector("#{window:2} > > >").length).toEqual(0);
        expect(elements.withSelector("#{window:2} > > > >").length).toEqual(0);

        expect(elements.withSelector("> #{switch:0}").length).toEqual(1);
        expect(elements.withSelector("> > #{switch:0}").length).toEqual(0);
        expect(elements.withSelector("#{switch:0} >").length).toEqual(0);
        expect(elements.withSelector("> > #{textfield:1}").length).toEqual(1);
        expect(elements.withSelector("#{window:0} > #{textfield:1}").length).toEqual(1);

        expect(elements.withSelector(".{userName} >").length).toEqual(1);
        expect(elements.withSelector("#{window:0} > .{userName}").length).toEqual(1);
        expect(elements.withSelector("#{window:0} > .{userName} .userName").length).toEqual(0);
        expect(elements.withSelector(".{userName} .{userName}").length).toEqual(1);
        expect(elements.withSelector(".{userName} .{userName} >").length).toEqual(0);
        expect(elements.withSelector("> > .{userName}").length).toEqual(1);
        expect(elements.withSelector("> .{userName}").length).toEqual(2);
        expect(elements.withSelector(".{userName} >").length).toEqual(1);
        expect(elements.withSelector(".{userName} .{userName} > *").length).toEqual(0);
        expect(elements.withSelector(".{userName} .{userName} > >").length).toEqual(0);

        expect(elements.withSelector(".{password} >").length).toEqual(1);
        expect(elements.withSelector("> .{password}").length).toEqual(2);
    });

    it('Should find elements using the direct ascendant operator (<)', function () {

        expect(elements.withSelector("<").length).toEqual(0);
        expect(elements.withSelector("* <").length).toEqual(11);
        expect(elements.withSelector("* * * <").length).toEqual(9);
        expect(elements.withSelector(".userName <").length).toEqual(2);
        expect(elements.withSelector(".userName < .userName").length).toEqual(2);
        expect(elements.withSelector(".userName < .userName .userName").length).toEqual(1);
        expect(elements.withSelector(".userName < *").length).toEqual(36);

        expect(elements.withSelector(".userName .userName <").length).toEqual(1);
        expect(elements.withSelector(".userName .userName <")[0].id).toEqual("textfield:0");

        expect(elements.withSelector(".userName > <").length).toEqual(1);
        expect(elements.withSelector(".userName > <")[0].id).toEqual("textfield:0");

        expect(elements.withSelector(".userName * <").length).toEqual(1);
        expect(elements.withSelector(".userName * <")[0].id).toEqual("textfield:0");

        expect(elements.withSelector(".userName").length).toEqual(2);
        expect(elements.withSelector(".userName >").length).toEqual(1);
        expect(elements.withSelector(".userName > >").length).toEqual(0);
        expect(elements.withSelector(".userName > > >").length).toEqual(0);
        expect(elements.withSelector(".userName > <").length).toEqual(1);
        expect(elements.withSelector(".userName > < >").length).toEqual(1);
        expect(elements.withSelector(".userName > < > <").length).toEqual(1);
        expect(elements.withSelector(".userName > < > < >").length).toEqual(1);
        expect(elements.withSelector(".userName > < > < > <").length).toEqual(1);
        expect(elements.withSelector(".userName > < > < > < <").length).toEqual(1);
        expect(elements.withSelector(".userName > < > < > < < *").length).toEqual(36);

        expect(elements.withSelector("> > <").length).toEqual(2);

        expect(elements.withSelector("* <").length).toEqual(11);
        expect(elements.withSelector("* <[nth=0]").length).toEqual(11);
        expect(elements.withSelector("* <[nth=1]").length).toEqual(0);

        expect(elements.withSelector(".userName <").length).toEqual(2);
        expect(elements.withSelector(".userName <[nth=0]").length).toEqual(2);
        expect(elements.withSelector(".userName <[nth=1]").length).toEqual(0);

        expect(elements.withSelector(".userName[nth=1] <").length).toEqual(1);
        expect(elements.withSelector(".userName[nth=1] <")[0].id).toEqual("textfield:0");

        expect(elements.withSelector(".userName[nth=0] <").length).toEqual(1);
        expect(elements.withSelector(".userName[nth=0] <")[0].id).toEqual("window:0");
    });

    it('Should find elements using the descendant operator (*)', function () {

        expect(tree.findElementsAtDelta(0).length).toEqual(44);
        expect(tree.findElementsAtDelta(1).length).toEqual(41);
        expect(tree.findElementsAtDelta(2).length).toEqual(19);
        expect(tree.findElementsAtDelta(3).length).toEqual(6);
        expect(tree.findElementsAtDelta(4).length).toEqual(0);
        expect(tree.findElementsAtDelta(5).length).toEqual(0);

        expect(elements.withSelector("*").length).toEqual(44);
        expect(elements.withSelector("* *").length).toEqual(41);
        expect(elements.withSelector("* * *").length).toEqual(19);
        expect(elements.withSelector("* * * *").length).toEqual(6);
        expect(elements.withSelector("* * * * *").length).toEqual(0);
        expect(elements.withSelector("* * * * * *").length).toEqual(0);
        expect(elements.withSelector("* * * * * * *").length).toEqual(0);
        expect(elements.withSelector("* * * * * * * *").length).toEqual(0);
    });

});


describe('Tree should pass all validation tests on the Transfers Landing screen', function () {
  var tree, elements, Soda   = require(path.join(__dirname, "..", "SodaCore", "lib", "Soda")), localSoda = new Soda({ console: { supress: true } }).init(), Tree   = (require(path.join(__dirname, "..", "SodaCore", "lib", "Tree")))(localSoda);

  beforeAll(function () {
      tree     = new Tree(JSON.parse(fs.readFileSync(path.resolve(__dirname + "/trees/TransfersLanding.json")).toString('utf-8')));
      elements = tree.elements();
    });

    afterAll(function (done) {
      localSoda.kill();

      localSoda = null;
      
      done();
    });

    it('Should select elements in table views', function () {

        expect(elements.withSelector(".transferTableView").length).toBeGreaterThan(0);
        expect(elements.withSelector(".transferTableView").length).toEqual(1);
        expect(elements.withSelector("#{tableview:1}").length).toBeGreaterThan(0);

        expect(elements.withSelector("#{tableview:1}[nth=0]").length).toBeGreaterThan(0);
        expect(elements.withSelector("#{tableview:1}[nth=1]").length).toEqual(0);
        expect(elements.withSelector("#{tableview:1}[nth=2]").length).toEqual(0);
        expect(elements.withSelector("#{tableview:1}[nth=3]").length).toEqual(0);

        expect(elements.withSelector("#{tableview:1}[nth=0]").length).toEqual(1);
        expect(elements.withSelector("#{tableview:1} *").length).toEqual(11);
        expect(elements.withSelector("#{tableview:1} *[type~'table(group|cell)']").length).toEqual(6);
        expect(elements.withSelector("#{tableview:1} *[type='tablecell']").length).toEqual(5);
        expect(elements.withSelector("#{tableview:1} *[type='tablegroup']").length).toEqual(1);

        expect(elements.withSelector(".transferTableView[nth=0]").length).toBeGreaterThan(0);
        expect(elements.withSelector(".transferTableView[nth=0]").length).toEqual(1);
        expect(elements.withSelector(".transferTableView *").length).toEqual(11);
        expect(elements.withSelector(".transferTableView *[type~'table(group|cell)']").length).toEqual(6);
        expect(elements.withSelector(".transferTableView *[type='tablecell']").length).toEqual(5);
        expect(elements.withSelector(".transferTableView *[type='tablegroup']").length).toEqual(1);

        expect(elements.withSelector(".transferTableView * *").length).toEqual(5);
        expect(elements.withSelector(".transferTableView * *[type='statictext']").length).toEqual(5);
        expect(elements.withSelector(".transferTableView *[type='tablecell'] *[type='statictext']").length).toEqual(5);

        expect(elements.withSelector(".transferTableView *[type='tablecell']")[0].id).toEqual("tablecell:13");
        expect(elements.withSelector(".transferTableView *[type='tablecell']")[1].id).toEqual("tablecell:14");
        expect(elements.withSelector(".transferTableView *[type='tablecell']")[2].id).toEqual("tablecell:15");
        expect(elements.withSelector(".transferTableView *[type='tablecell']")[3].id).toEqual("tablecell:16");
        expect(elements.withSelector(".transferTableView *[type='tablecell']")[4].id).toEqual("tablecell:17");

        expect(elements.withSelector(".transferTableView *[type='tablecell'][nth=0]").length).toEqual(1);
        expect(elements.withSelector(".transferTableView *[type='tablecell'][nth=1]").length).toEqual(1);
        expect(elements.withSelector(".transferTableView *[type='tablecell'][nth=2]").length).toEqual(1);
        expect(elements.withSelector(".transferTableView *[type='tablecell'][nth=3]").length).toEqual(1);
        expect(elements.withSelector(".transferTableView *[type='tablecell'][nth=4]").length).toEqual(1);
        expect(elements.withSelector(".transferTableView *[type='tablecell'][nth=5]").length).toEqual(0);
        expect(elements.withSelector(".transferTableView *[type='tablecell'][nth=6]").length).toEqual(0);
        expect(elements.withSelector(".transferTableView *[type='tablecell'][nth=7]").length).toEqual(0);
        expect(elements.withSelector(".transferTableView *[type='tablecell'][nth=00]").length).toEqual(0);

        expect(elements.withSelector("   .transferTableView *[type='tablecell'][nth=0]  ").length).toEqual(1);
        expect(elements.withSelector("   .transferTableView *[type='tablecell'][nth=1]  ").length).toEqual(1);
        expect(elements.withSelector("   .transferTableView *[type='tablecell'][nth=2]  ").length).toEqual(1);
        expect(elements.withSelector("   .transferTableView *[type='tablecell'][nth=3]  ").length).toEqual(1);
        expect(elements.withSelector("   .transferTableView *[type='tablecell'][nth=4]  ").length).toEqual(1);
        expect(elements.withSelector("   .transferTableView *[type='tablecell'][nth=5]  ").length).toEqual(0);
        expect(elements.withSelector("   .transferTableView *[type='tablecell'][nth=6]  ").length).toEqual(0);
        expect(elements.withSelector("   .transferTableView *[type='tablecell'][nth=7]  ").length).toEqual(0);

        expect(elements.withSelector("   .transferTableView    *[type='tablecell'][nth=0]  ").length).toEqual(1);
        expect(elements.withSelector("   .transferTableView    *  ").length).toEqual(11);
        expect(elements.withSelector("   .transferTableView    *              *").length).toEqual(5);
        expect(elements.withSelector("   .transferTableView    *              * ").length).toEqual(5);

        expect(elements.withSelector(".transferTableView *[type='tablecell'][nth=0]")[0].name).toEqual("fromAccountCell");
        expect(elements.withSelector(".transferTableView *[type='tablecell'][nth=1]")[0].name).toEqual("toAccountCell");
        expect(elements.withSelector(".transferTableView *[type='tablecell'][nth=2]")[0].name).toEqual("amountCell");
        expect(elements.withSelector(".transferTableView *[type='tablecell'][nth=3]")[0].name).toEqual("dateCell");
        expect(elements.withSelector(".transferTableView *[type='tablecell'][nth=4]")[0].name).toEqual("frequencyCell");

        expect(elements.withSelector(".transferTableView *[type='tablecell'][nth=0] *")[0].value).toEqual("From Account");
        expect(elements.withSelector(".transferTableView *[type='tablecell'][nth=1] *")[0].value).toEqual("To Account");
        expect(elements.withSelector(".transferTableView *[type='tablecell'][nth=2] *")[0].value).toEqual("Amount");
        expect(elements.withSelector(".transferTableView *[type='tablecell'][nth=3] *")[0].value).toEqual("September 17, 2015 (Today)");
        expect(elements.withSelector(".transferTableView *[type='tablecell'][nth=4] *")[0].value).toEqual("One Time Transfer");

        expect(elements.withSelector(".transferTableView *[type='tablecell'][nth=0] *").length).toEqual(1);
        expect(elements.withSelector(".transferTableView *[type='tablecell'][nth=1] *").length).toEqual(1);
        expect(elements.withSelector(".transferTableView *[type='tablecell'][nth=2] *").length).toEqual(1);
        expect(elements.withSelector(".transferTableView *[type='tablecell'][nth=3] *").length).toEqual(1);
        expect(elements.withSelector(".transferTableView *[type='tablecell'][nth=4] *").length).toEqual(1);

        expect(elements.withSelector(".transferTableView *[type='tablecell'][nth=4] *").length).toEqual(1);
    });

    it('Should select elements by hierarchy #1', function () {

        var img3;

        img3 = elements.withSelector("#{window:0} #{navigationbar:0} #{image:2} #{image:3}")[0];
        expect(img3).toBeInstanceOf(Object);
        expect(img3.rect.origin.x).toEqual(0);
        expect(img3.rect.origin.y).toEqual(64);
        expect(img3.parent.id).toEqual("image:2");

        img3 = elements.withSelector("#{window:0} * * #{image:3}")[0];
        expect(img3).toBeInstanceOf(Object);
        expect(img3.rect.origin.x).toEqual(0);
        expect(img3.rect.origin.y).toEqual(64);
        expect(img3.parent.id).toEqual("image:2");

        img3 = elements.withSelector("#{window:0} * * *")[0];
        expect(img3).toBeInstanceOf(Object);
        expect(img3.rect.origin.x).toEqual(0);
        expect(img3.rect.origin.y).toEqual(64);
        expect(img3.parent.id).toEqual("image:2");

        img3 = elements.withSelector("#{window:0} * * *[type='image']")[0];
        expect(img3).toBeInstanceOf(Object);
        expect(img3.rect.origin.x).toEqual(0);
        expect(img3.rect.origin.y).toEqual(64);
        expect(img3.parent.id).toEqual("image:2");

        img3 = elements.withSelector("#{window:0} * *[type='image'] *[type='image']")[0];
        expect(img3).toBeInstanceOf(Object);
        expect(img3.rect.origin.x).toEqual(0);
        expect(img3.rect.origin.y).toEqual(64);
        expect(img3.parent.id).toEqual("image:2");

        img3 = elements.withSelector("#{window:0} * *[type='image'] *")[0];
        expect(img3).toBeInstanceOf(Object);
        expect(img3.rect.origin.x).toEqual(0);
        expect(img3.rect.origin.y).toEqual(64);
        expect(img3.parent.id).toEqual("image:2");

    });

    it('Should select elements by hierarchy #2', function () {

        var res, img3;

        res = elements.withSelector("#{navigationbar:0} #{image:2} #{image:3}");
        expect(res.length).toEqual(1);

        img3 = res[0];

        expect(img3).toBeInstanceOf(Object);
        expect(img3.rect.origin.x).toEqual(0);
        expect(img3.rect.origin.y).toEqual(64);
        expect(img3.parent.id).toEqual("image:2");

        img3 = elements.withSelector("* * * #{image:3}")[0];
        expect(img3).toBeInstanceOf(Object);
        expect(img3.rect.origin.x).toEqual(0);
        expect(img3.rect.origin.y).toEqual(64);
        expect(img3.parent.id).toEqual("image:2");

        img3 = elements.withSelector("* * * *[type='image']")[0];
        expect(img3).toBeInstanceOf(Object);
        expect(img3.rect.origin.x).toEqual(0);
        expect(img3.rect.origin.y).toEqual(64);
        expect(img3.parent.id).toEqual("image:2");

        img3 = elements.withSelector("* * * #{image:3}")[0];
        expect(img3).toBeInstanceOf(Object);
        expect(img3.rect.origin.x).toEqual(0);
        expect(img3.rect.origin.y).toEqual(64);
        expect(img3.parent.id).toEqual("image:2");

        img3 = elements.withSelector("* * *[type='image'] *[type='image']")[0];
        expect(img3).toBeInstanceOf(Object);
        expect(img3.rect.origin.x).toEqual(0);
        expect(img3.rect.origin.y).toEqual(64);
        expect(img3.parent.id).toEqual("image:2");

        img3 = elements.withSelector("* * *[type='image'] *")[0];
        expect(img3).toBeInstanceOf(Object);
        expect(img3.rect.origin.x).toEqual(0);
        expect(img3.rect.origin.y).toEqual(64);
        expect(img3.parent.id).toEqual("image:2");
    });

});


describe('Tree should pass all validation tests on the OTP Selection screen', function () {

  var tree, elements, Soda   = require(path.join(__dirname, "..", "SodaCore", "lib", "Soda")), localSoda = new Soda({ console: { supress: true } }).init(), Tree   = (require(path.join(__dirname, "..", "SodaCore", "lib", "Tree")))(localSoda);

  beforeAll(function () {
      tree = new Tree(JSON.parse(fs.readFileSync(path.resolve(__dirname + "/trees/iPhoneSelectOTPScreen.json")).toString('utf-8')));
      elements = tree.elements();
    });

    afterAll(function (done) {
      localSoda.kill();

      localSoda = null;
      
      done();
    });

    it('Should select elements by using `nth`', function () {
        expect(elements.withSelector(".rsaOptionsTableView .rsaTableViewCell .sendMethodValueLabel").length).toEqual(6);

        expect(elements.withSelector(".rsaOptionsTableView .rsaTableViewCell[nth=0] .sendMethodValueLabel").length).toEqual(1);
        expect(elements.withSelector(".rsaOptionsTableView .rsaTableViewCell[nth=1] .sendMethodValueLabel").length).toEqual(1);
        expect(elements.withSelector(".rsaOptionsTableView .rsaTableViewCell[nth=2] .sendMethodValueLabel").length).toEqual(1);
        expect(elements.withSelector(".rsaOptionsTableView .rsaTableViewCell[nth=3] .sendMethodValueLabel").length).toEqual(1);
        expect(elements.withSelector(".rsaOptionsTableView .rsaTableViewCell[nth=4] .sendMethodValueLabel").length).toEqual(1);
        expect(elements.withSelector(".rsaOptionsTableView .rsaTableViewCell[nth=5] .sendMethodValueLabel").length).toEqual(1);

        expect(elements.withSelector(".rsaOptionsTableView .rsaTableViewCell[nth=0] .sendMethodValueLabel")[0].value).toEqual("(xxx) xxx-2754");
        expect(elements.withSelector(".rsaOptionsTableView .rsaTableViewCell[nth=1] .sendMethodValueLabel")[0].value).toEqual("(xxx) xxx-9363");
        expect(elements.withSelector(".rsaOptionsTableView .rsaTableViewCell[nth=2] .sendMethodValueLabel")[0].value).toEqual("(xxx) xxx-2493");
        expect(elements.withSelector(".rsaOptionsTableView .rsaTableViewCell[nth=3] .sendMethodValueLabel")[0].value).toEqual("(xxx) xxx-8237");
        expect(elements.withSelector(".rsaOptionsTableView .rsaTableViewCell[nth=4] .sendMethodValueLabel")[0].value).toEqual("(xxx) xxx-3957");
        expect(elements.withSelector(".rsaOptionsTableView .rsaTableViewCell[nth=5] .sendMethodValueLabel")[0].value).toEqual("t...1@yahoo.com");

        expect(elements.withSelector(".rsaOptionsTableView .rsaTableViewCell *").length).toEqual(12);
        expect(elements.withSelector(".rsaOptionsTableView .rsaTableViewCell *[nth=0]").length).toEqual(6); // Semantically, I think this is correct... ???
        expect(elements.withSelector(".rsaOptionsTableView .rsaTableViewCell *[nth=1]").length).toEqual(6); // Semantically, I think this is correct... ???
        expect(elements.withSelector(".rsaOptionsTableView .rsaTableViewCell *[nth=2]").length).toEqual(0); // Semantically, I think this is correct... ???
        expect(elements.withSelector(".rsaOptionsTableView .rsaTableViewCell *[nth=3]").length).toEqual(0); // Semantically, I think this is correct... ???
        expect(elements.withSelector(".rsaOptionsTableView .rsaTableViewCell *[nth=4]").length).toEqual(0); // Semantically, I think this is correct... ???
        expect(elements.withSelector(".rsaOptionsTableView .rsaTableViewCell *[nth=5]").length).toEqual(0); // Semantically, I think this is correct... ???

        expect(elements.withSelector(".rsaOptionsTableView .sendMethodValueLabel[nth=0]").length).toEqual(1);
        expect(elements.withSelector(".rsaOptionsTableView .sendMethodValueLabel[nth=1]").length).toEqual(1);
        expect(elements.withSelector(".rsaOptionsTableView .sendMethodValueLabel[nth=2]").length).toEqual(1);
        expect(elements.withSelector(".rsaOptionsTableView .sendMethodValueLabel[nth=3]").length).toEqual(1);
        expect(elements.withSelector(".rsaOptionsTableView .sendMethodValueLabel[nth=4]").length).toEqual(1);
        expect(elements.withSelector(".rsaOptionsTableView .sendMethodValueLabel[nth=5]").length).toEqual(1);

        expect(elements.withSelector(".rsaOptionsTableView .sendMethodValueLabel[nth=0]")[0].value).toEqual("(xxx) xxx-2754");
        expect(elements.withSelector(".rsaOptionsTableView .sendMethodValueLabel[nth=1]")[0].value).toEqual("(xxx) xxx-9363");
        expect(elements.withSelector(".rsaOptionsTableView .sendMethodValueLabel[nth=2]")[0].value).toEqual("(xxx) xxx-2493");
        expect(elements.withSelector(".rsaOptionsTableView .sendMethodValueLabel[nth=3]")[0].value).toEqual("(xxx) xxx-8237");
        expect(elements.withSelector(".rsaOptionsTableView .sendMethodValueLabel[nth=4]")[0].value).toEqual("(xxx) xxx-3957");
        expect(elements.withSelector(".rsaOptionsTableView .sendMethodValueLabel[nth=5]")[0].value).toEqual("t...1@yahoo.com");

        expect(elements.withSelector(".rsaOptionsTableView .rsaTableViewCell[nth=0] .sendMethodValueLabel[nth=0]").length).toEqual(1);
        expect(elements.withSelector(".rsaOptionsTableView .rsaTableViewCell[nth=0] .sendMethodValueLabel[nth=1]").length).toEqual(0);
        expect(elements.withSelector(".rsaOptionsTableView .rsaTableViewCell[nth=0] .sendMethodValueLabel[nth=2]").length).toEqual(0);
        expect(elements.withSelector(".rsaOptionsTableView .rsaTableViewCell[nth=0] .sendMethodValueLabel[nth=3]").length).toEqual(0);
        expect(elements.withSelector(".rsaOptionsTableView .rsaTableViewCell[nth=0] .sendMethodValueLabel[nth=4]").length).toEqual(0);
        expect(elements.withSelector(".rsaOptionsTableView .rsaTableViewCell[nth=0] .sendMethodValueLabel[nth=5]").length).toEqual(0);

        expect(elements.withSelector(".rsaOptionsTableView .rsaTableViewCell[nth=0] .sendMethodValueLabel[nth=0]").length).toEqual(1);
        expect(elements.withSelector(".rsaOptionsTableView .rsaTableViewCell[nth=1] .sendMethodValueLabel[nth=0]").length).toEqual(1);
        expect(elements.withSelector(".rsaOptionsTableView .rsaTableViewCell[nth=2] .sendMethodValueLabel[nth=0]").length).toEqual(1);
        expect(elements.withSelector(".rsaOptionsTableView .rsaTableViewCell[nth=3] .sendMethodValueLabel[nth=0]").length).toEqual(1);
        expect(elements.withSelector(".rsaOptionsTableView .rsaTableViewCell[nth=4] .sendMethodValueLabel[nth=0]").length).toEqual(1);
        expect(elements.withSelector(".rsaOptionsTableView .rsaTableViewCell[nth=5] .sendMethodValueLabel[nth=0]").length).toEqual(1);

        expect(elements.withSelector(".rsaOptionsTableView .rsaTableViewCell[nth=0] .sendMethodValueLabel[nth=0]")[0].value).toEqual("(xxx) xxx-2754");
        expect(elements.withSelector(".rsaOptionsTableView .rsaTableViewCell[nth=1] .sendMethodValueLabel[nth=0]")[0].value).toEqual("(xxx) xxx-9363");
        expect(elements.withSelector(".rsaOptionsTableView .rsaTableViewCell[nth=2] .sendMethodValueLabel[nth=0]")[0].value).toEqual("(xxx) xxx-2493");
        expect(elements.withSelector(".rsaOptionsTableView .rsaTableViewCell[nth=3] .sendMethodValueLabel[nth=0]")[0].value).toEqual("(xxx) xxx-8237");
        expect(elements.withSelector(".rsaOptionsTableView .rsaTableViewCell[nth=4] .sendMethodValueLabel[nth=0]")[0].value).toEqual("(xxx) xxx-3957");
        expect(elements.withSelector(".rsaOptionsTableView .rsaTableViewCell[nth=5] .sendMethodValueLabel[nth=0]")[0].value).toEqual("t...1@yahoo.com");
    });
});

describe('Tree should pass all validation tests on the Popmoney Contacts screen', function () {

  var tree, elements, Soda   = require(path.join(__dirname, "..", "SodaCore", "lib", "Soda")), localSoda = new Soda({ console: { supress: true } }).init(), Tree   = (require(path.join(__dirname, "..", "SodaCore", "lib", "Tree")))(localSoda);

  beforeAll(function () {
      tree = new Tree(JSON.parse(fs.readFileSync(path.resolve(__dirname + "/trees/iPhonePopContactsScreen.json")).toString('utf-8')));
      elements = tree.elements();
    });

    afterAll(function (done) {
      localSoda.kill();

      localSoda = null;
      
      done();
    });

    it('Should select elements by using various selectors', function () {
        expect(elements.withSelector(".contactTableView").length).toEqual(1);
        expect(elements.withSelector(".contactTableView *[type='tablecell']").length).toEqual(3);
        expect(elements.withSelector(".contactTableView *[type='tablecell'][nth=2]").length).toEqual(1);
        expect(elements.withSelector(".contactTableView *[type='tablecell'][nth=2] .detailTextLabel").length).toEqual(1);
    });

    it('Should select elements using the property operators (=, ~, <, >, <=, >=, !=)', function () {
        expect(elements.withSelector(".contactTableView").length).toEqual(1);
        expect(elements.withSelector(".contactTableView[type!='tablecell']").length).toEqual(1);
        expect(elements.withSelector(".contactTableView[type='tableview']").length).toEqual(1);
        expect(elements.withSelector(".contactTableView[rect.origin.x!=1]").length).toEqual(1);
        expect(elements.withSelector(".contactTableView[rect.origin.x!='1']").length).toEqual(1);
        expect(elements.withSelector(".contactTableView[rect.origin.x=0]").length).toEqual(1);
        expect(elements.withSelector(".contactTableView[rect.origin.x='0']").length).toEqual(1);
        expect(elements.withSelector(".contactTableView[rect.origin.x<2]").length).toEqual(1);
        expect(elements.withSelector(".contactTableView[rect.origin.x>'-1']").length).toEqual(1);
        expect(elements.withSelector(".contactTableView[rect.origin.x>=0]").length).toEqual(1);
        expect(elements.withSelector(".contactTableView[rect.origin.x<=0]").length).toEqual(1);
        expect(elements.withSelector(".contactTableView[rect.origin.x>='-1234']").length).toEqual(1);
        expect(elements.withSelector(".contactTableView[rect.origin.x<=1234]").length).toEqual(1);
        expect(elements.withSelector(".contactTableView[rect.origin.x~0]").length).toEqual(1);
        expect(elements.withSelector(".contactTableView[rect.origin.x~'\\d+']").length).toEqual(1);

        expect(elements.withSelector(".contactTableView[value~'rows 1 to 3 of 3']").length).toEqual(1);
        expect(elements.withSelector(".contactTableView[value='rows 1 to 3 of 3']").length).toEqual(1);
        expect(elements.withSelector(".contactTableView[value!='rows 2 to 3 of 3']").length).toEqual(1);
        expect(elements.withSelector(".contactTableView[value!='rows1 to 3 of 3']").length).toEqual(1);
        expect(elements.withSelector(".contactTableView[value!='rows 1 to 3 of 3 ']").length).toEqual(1);
        expect(elements.withSelector(".contactTableView[value>='rows 1 to 3 of 3']").length).toEqual(1);
        expect(elements.withSelector(".contactTableView[value<='rows 1 to 3 of 3']").length).toEqual(1);
        expect(elements.withSelector(".contactTableView[value>'rows 1 to 3 of 3']").length).toEqual(0);
        expect(elements.withSelector(".contactTableView[value<'rows 1 to 3 of 3']").length).toEqual(0);
        expect(elements.withSelector(".contactTableView[value>'a']").length).toEqual(1);
        expect(elements.withSelector(".contactTableView[value<'zzzzzzzzzzzzzzzzzzzzzz']").length).toEqual(1);
    });
});
