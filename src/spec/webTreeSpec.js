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
    fs     = require("fs"),
    Soda   = require(path.join(__dirname, "..", "SodaCore", "lib", "Soda"));

require(path.join(__dirname, "..", "SodaCommon", "ProtoLib"));

describe('webTree Tree should pass all validation tests on the Login Screen', function () {    
    var soda, Tree, tree, elements;

    beforeAll(function (done) {       
      soda = new Soda({ testPath: path.join(__dirname, '..', 'sample_project'), logSupressed: true });

      soda.init(function() {     
        Tree = require(path.join(__dirname, "..", "SodaCore", "lib", "Tree"))(soda);
        tree     = new Tree(JSON.parse(fs.readFileSync(path.join(__dirname, "trees", "webTree.json")).toString('utf-8')));
        elements = tree.elements();
        
        done();
      });
    });

    afterAll(function (done) {  
      soda.kill();

      soda = null;

      done();
    });

    it('Should find only one of each', function () {
        expect(elements.withSelector(".{boxed} @{High Yield CD} < .{rates-wrap} >[nth=0] .{apy-tier}").length).toEqual(1);   
    });
});
