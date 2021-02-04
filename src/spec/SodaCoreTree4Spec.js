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

describe('Tree should pass all validation tests on the Popmoney Contacts screen', function () {    
    var soda, Tree, tree, elements;

    beforeAll(function (done) {       
      soda = new Soda({ testPath: path.join(__dirname, '..', 'sample_project'), logSupressed: true });

      soda.init(function() {     
        Tree = require(path.join(__dirname, "..", "SodaCore", "lib", "Tree"))(soda);
        tree     = new Tree(JSON.parse(fs.readFileSync(path.join(__dirname, "trees", "iPhonePopContactsScreen.json")).toString('utf-8')));
        elements = tree.elements();
        
        done();
      });
    });

    afterAll(function (done) {  
      soda.kill();

      soda = null;

      done();
    });

    it('Should select elements by using various selectors', function () {
        expect(elements.withSelector(".contactTableView").length).toEqual(1);
        expect(elements.withSelector(".contactTableView *[type='tablecell']").length).toEqual(3);
        expect(elements.withSelector(".contactTableView *[type='tablecell'][nth=2]").length).toEqual(1);
        expect(elements.withSelector(".contactTableView *[type='tablecell'][nth=2] .detailTextLabel").length).toEqual(1);

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
