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

describe('Tree should pass all validation tests on the OTP Selection screen', function () {   
    var soda, Tree, tree, elements;

    beforeAll(function (done) {       
      soda = new Soda({ testPath: path.join(__dirname, '..', 'sample_project'), logSupressed: true });

      soda.init(function() {     
        Tree = require(path.join(__dirname, "..", "SodaCore", "lib", "Tree"))(soda);
        tree     = new Tree(JSON.parse(fs.readFileSync(path.join(__dirname, "trees", "iPhoneSelectOTPScreen.json")).toString('utf-8')));
        elements = tree.elements();
        
        done();
      });
    });

    afterAll(function (done) {  
      soda.kill();

      soda = null;

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
