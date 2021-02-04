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

describe('Tree should pass all validation tests on the Transfers Landing screen', function () {
    var soda, Tree, tree, elements;

    beforeAll(function (done) {       
      soda = new Soda({ testPath: path.join(__dirname, '..', 'sample_project'), logSupressed: true });

      soda.init(function() {     
        Tree = require(path.join(__dirname, "..", "SodaCore", "lib", "Tree"))(soda);
        tree     = new Tree(JSON.parse(fs.readFileSync(path.join(__dirname, "trees", "TransfersLanding.json")).toString('utf-8')));
        elements = tree.elements();
        
        done();
      });
    });

    afterAll(function (done) {  
      soda.kill();

      soda = null;

      done();
    });

    it('Should select elements in table views and in all hierarchy views', function () {      
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

        // Hierarchy 2
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

        // hierarchy 3
        var res;

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