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

var path   = require("path"),
    Soda   = require(path.join(__dirname, "..", "SodaCore", "lib", "Soda")),
    BaseDriver = require(path.join(__dirname, "..", "SodaCore", "asset_drivers", "BaseDriver")),
    AssetCollection = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "AssetCollection"));

describe('Soda Base Driver Test', function () {
    "use strict";

    var soda, assetCollection, baseDriver;

    beforeAll(function (done) {
        soda = new Soda({ testPath: baseDriver, logSupressed: true });

        soda.init(function () {
            soda.config.set("headless", true, true, true);
            
            assetCollection = new AssetCollection(soda, path.join(__dirname, '..', 'sample_project'));
            baseDriver = new BaseDriver(soda, assetCollection, path.join(__dirname, '..', 'sample_project'));

            done();
        });
    });

    afterAll(function (done) {
        soda.kill();
        
        soda = null;
  
        done();
      });

    it('Should successfully validate the path', function (done) {
        expect(baseDriver.path).toEqual(path.join(__dirname, '..', 'sample_project'));

        done();
    });

    it('Should successfully validate when there are no suites', function (done) {
        expect(baseDriver.getAllSuites().sodamembers).toEqual(0);
        expect(baseDriver.suites.sodamembers).toEqual(0);

        done();
    });

    it('Should successfully validate when there are no modules', function (done) {

        expect(baseDriver.getAllModules().sodamembers).toEqual(0);

        done();
    });

    it('Should successfully validate when there are no assets', function (done) {

        expect(baseDriver.assets.sodamembers).toEqual(0);

        done();
    });

    it('Should successfully add a suite', function (done) {
        baseDriver.addSuite("my_suite");
        expect(baseDriver.getAllSuites().sodamembers).toEqual(1);
        expect(baseDriver.suites.sodamembers).toEqual(1);
        expect(baseDriver.getSuite("my_suite")).toBeInstanceOf(Object);
        expect(baseDriver.getSuiteUsingString("my_suite")).toBeInstanceOf(Object);

        done();
    });

    it('Should successfully add a module to a suite', function (done) {
        baseDriver.addSuite("my_suite");
        baseDriver.getSuite("my_suite").addModule("my_module");
        expect(baseDriver.getAllModules().sodamembers).toEqual(1);        

        done();
    });

    afterAll(function (done) {
        done();
    });
});
