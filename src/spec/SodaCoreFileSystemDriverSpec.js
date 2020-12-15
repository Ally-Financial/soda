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
    AssetCollection = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "AssetCollection")),
    Suite           = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "Suite")),
    Module          = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "Module")),
    Platform        = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "Platform")),
    assetTypes   = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "AssetTypes")),
    Test    = assetTypes.Test;

require(path.join(__dirname, "..", "SodaCommon", "ProtoLib"));

describe('Soda FileSystem Driver Test, Part I', function () {
    var soda, seleniumFramework, settings, seleniumControl;

    beforeAll(function (done) {
        // Allow up to 30 seconds for framework initialization
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 300000;

        soda = new Soda({ testPath: path.join(__dirname, '..', 'sample_project'), logSupressed: false });

        soda.init(function() {
            soda.config.set("headless", true, true, true);
            
            seleniumFramework = require(path.join(__dirname, "..", "SodaCore", "frameworks", "selenium"))(soda);
            soda.framework = seleniumFramework;
            settings  = require(path.join(__dirname, "..", "SodaCore", "frameworks", "selenium", "imports", "Config.js"))(soda);
            seleniumControl  = new (require(path.join(__dirname, "..", "SodaCore", "frameworks", "selenium", "imports", "Driver.js")))(soda);
  
            done();
        });
    });

    it('Should successfully load the given assets', function (done) {
        seleniumFramework.start("chrome", "about:blank", {}, function(err) {
            expect(err).toEqual(null);

            soda.assets.load(path.join(__dirname, '..', 'sample_project'), function (err, collection) {
                expect(err).toEqual(null);
                expect(collection).toBeInstanceOf(AssetCollection);

                var suites = collection.getAllSuites();
                expect(suites).toBeInstanceOf(Object);
                expect(suites.sodamembers).toEqual(2);

                expect(suites.my_suite).toBeInstanceOf(Suite);
                expect(suites.global).toBeInstanceOf(Suite);

                var testSuite = collection.getSuite("my_suite");
                expect(testSuite).toBeInstanceOf(Suite);
                expect(testSuite.name).toEqual("my_suite");

                var globalSuite = collection.getSuite("global");
                expect(globalSuite).toBeInstanceOf(Suite);
                expect(globalSuite.name).toEqual("global");

                var testModules = testSuite.getModules();
                expect(testModules).toBeInstanceOf(Object);
                expect(testModules.sodamembers).toEqual(2);

                var globalModules = globalSuite.getModules();
                expect(globalModules).toBeInstanceOf(Object);
                expect(globalModules.sodamembers).toEqual(1);

                var globalModule = globalSuite.getModule("global");
                expect(globalModule).toBeInstanceOf(Module);

                var fooModule = testSuite.getModule("my_module");
                expect(fooModule).toBeInstanceOf(Module);
                expect(fooModule.name).toEqual("my_module");
                expect(fooModule.suite).toEqual(testSuite);

                var commonModule = testSuite.getModule("common");
                expect(commonModule).toBeInstanceOf(Module);
                expect(commonModule.name).toEqual("common");
                expect(commonModule.suite).toEqual(testSuite);

                var fooPlatform = fooModule.getPlatform("web");
                expect(fooPlatform).toBeInstanceOf(Platform);
                expect(fooPlatform.name).toEqual("web");
                expect(fooPlatform.module).toEqual(fooModule);
                expect(fooPlatform.suite).toEqual(testSuite);

                var globalPlatform = globalModule.getPlatform("generic");
                expect(globalPlatform).toBeInstanceOf(Platform);
                expect(globalPlatform.name).toEqual("generic");
                expect(globalPlatform.module).toEqual(globalModule);
                expect(globalPlatform.suite).toEqual(globalSuite);

                var tests = fooPlatform.getTests();
                expect(tests).toBeInstanceOf(Object);
                expect(tests.sodamembers).toEqual(3);

                var testA = fooPlatform.getTest("001");
                expect(testA).toBeInstanceOf(Test);
                expect(testA.name).toEqual("001");
                expect(testA.type).toEqual("test");
                expect(testA.id).toEqual(null);
                expect(testA.description).toEqual("The \'cat meme\' Google example from the documentation");
                expect(testA.suite).toEqual(testSuite);
                expect(testA.module).toEqual(fooModule);
                expect(testA.platform).toEqual(fooPlatform);

                testA.getContents(function (err, contents) {
                    expect(err).toEqual(null);
                    expect(JSON.stringify(contents)).toEqual(JSON.stringify({"meta":{"name":"Google","description":"The \'cat meme\' Google example from the documentation","syntax":{"name":"web","version":"1.0"}},"actions":[{"store":"cat memes","as":"to_search"},{"execute":"googlesomething"},{"execute":"closebrowser"},{"store":"dog memes","as":"to_search"},{"execute":"googlesomething"},{"execute":"closebrowser"}]}));

                    var testB = fooPlatform.getTest("002");
                    expect(testB).toBeInstanceOf(Test);
                    expect(testB.name).toEqual("002");
                    expect(testB.type).toEqual("test");
                    expect(testB.id).toEqual(null);
                    expect(testB.description).toEqual("Go to Google, search for \"soda\" and click the first link that appears");
                    expect(testB.suite).toEqual(testSuite);
                    expect(testB.module).toEqual(fooModule);
                    expect(testB.platform).toEqual(fooPlatform);

                    testB.getContents(function (err, contents) {
                        expect(err).toEqual(null);
                        expect(JSON.stringify(contents)).toEqual(JSON.stringify({"meta":{"name":"Google","description":"Go to Google, search for \"soda\" and click the first link that appears","syntax":{"name":"web","version":"1.0"}},"actions":[{"store":"soda","as":"to_search"},{"execute":"googlesomething"},{"execute":"clickfirstgooglelink"},{"wait":3},{"execute":"closebrowser"}]}));

                        var testC = fooPlatform.getTest("003");
                        expect(testC).toBeInstanceOf(Test);
                        expect(testC.name).toEqual("003");
                        expect(testC.type).toEqual("test");
                        expect(testC.id).toEqual(null);
                        expect(testC.description).toEqual("Same as test two, but uses *mappings*, see this module's module.json file");
                        expect(testC.suite).toEqual(testSuite);
                        expect(testC.module).toEqual(fooModule);
                        expect(testC.platform).toEqual(fooPlatform);

                        testC.getContents(function (err, contents) {
                            expect(err).toEqual(null);
                            expect(JSON.stringify(contents)).toEqual(JSON.stringify({"meta":{"name":"Google","description":"Same as test two, but uses *mappings*, see this module\'s module.json file","syntax":{"name":"web","version":"1.0"}},"actions":[{"store":"soda","as":"to_search"},{"execute":"googlesomethingwithmappings"},{"execute":"clickfirstgooglelink"},{"wait":3},{"execute":"closebrowser"}]}));

                            var globalA = globalPlatform.getTest("004");
                            expect(globalA).toBeInstanceOf(Test);
                            expect(globalA.name).toEqual("004");
                            expect(globalA.type).toEqual("test");
                            expect(globalA.id).toEqual(null);
                            expect(globalA.description).toEqual("The 'cat meme' Google example from the documentation");
                            expect(globalA.suite).toEqual(globalSuite);
                            expect(globalA.module).toEqual(globalModule);
                            expect(globalA.platform).toEqual(globalPlatform);

                            globalA.getContents(function (err, contents) {
                                expect(err).toEqual(null);
                                expect(JSON.stringify(contents)).toEqual(JSON.stringify({"meta":{"name":"Google","description":"The \'cat meme\' Google example from the documentation","syntax":{"name":"web","version":"1.0"}},"actions":[{"store":"cat memes","as":"to_search"},{"execute":"googlesomething"},{"execute":"closebrowser"},{"store":"dog memes","as":"to_search"},{"execute":"googlesomething"},{"execute":"closebrowser"}]}));

                                var globalB = globalPlatform.getTest("005");
                                expect(globalB).toBeInstanceOf(Test);
                                expect(globalB.name).toEqual("005");
                                expect(globalB.type).toEqual("test");
                                expect(globalB.id).toEqual(null);
                                expect(globalB.description).toEqual("Go to Google, search for \"soda\" and click the first link that appears");
                                expect(globalB.suite).toEqual(globalSuite);
                                expect(globalB.module).toEqual(globalModule);
                                expect(globalB.platform).toEqual(globalPlatform);

                                globalB.getContents(function (err, contents) {
                                    expect(err).toEqual(null);
                                    expect(JSON.stringify(contents)).toEqual(JSON.stringify({"meta":{"name":"Google","description":"Go to Google, search for \"soda\" and click the first link that appears","syntax":{"name":"web","version":"1.0"}},"actions":[{"store":"soda","as":"to_search"},{"execute":"googlesomething"},{"execute":"clickfirstgooglelink"},{"wait":3},{"execute":"closebrowser"}]}));

                                    var globalC = globalPlatform.getTest("006");
                                    expect(globalC).toBeInstanceOf(Test);
                                    expect(globalC.name).toEqual("006");
                                    expect(globalC.type).toEqual("test");
                                    expect(globalC.id).toEqual(null);
                                    expect(globalC.description).toEqual("Same as test two, but uses *mappings*, see this module's module.json file");
                                    expect(globalC.suite).toEqual(globalSuite);
                                    expect(globalC.module).toEqual(globalModule);
                                    expect(globalC.platform).toEqual(globalPlatform);

                                    globalC.getContents(function (err, contents) {
                                        expect(err).toEqual(null);
                                        expect(JSON.stringify(contents)).toEqual(JSON.stringify({"meta":{"name":"Google","description":"Same as test two, but uses *mappings*, see this module\'s module.json file","syntax":{"name":"web","version":"1.0"}},"actions":[{"store":"soda","as":"to_search"},{"execute":"googlesomethingwithmappings"},{"execute":"clickfirstgooglelink"},{"wait":3},{"execute":"closebrowser"}]}));

                                        done();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    afterAll(function (done) {
        soda.framework.stop(function () {
            soda.kill();

            soda = null;
            
            done();
        });
    });
});
