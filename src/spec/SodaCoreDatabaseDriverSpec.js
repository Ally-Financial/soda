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

var sinon = require('sinon'),
    path   = require("path"),
    child_process   = require("child_process"),
    Soda   = require(path.join(__dirname, "..", "SodaCore", "lib", "Soda")),
    os       = require('os').platform(),

    AssetCollection = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "AssetCollection")),
    Suite           = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "Suite")),
    Module          = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "Module")),
    Platform        = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "Platform")),
    Framework   = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "Framework")),

    assetTypes   = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "AssetTypes")),

    Test    = assetTypes.Test;

describe('Soda Database Driver Test, Part I', function () {
    "use strict";

    var soda, framework, stub, spy;

    beforeAll(function (done) {
        // Allow up to 30 seconds for framework initialization
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 200000;

        if (os === "win32" || os === "win64") {
            spy = sinon.stub(child_process, 'exec').callsFake((command, cb) => {
                switch(command) {  
                    case "tasklist /FI \"IMAGENAME eq node.exe\" /FO CSV":
                        cb.call(null, null, "\"Image Name\",\"PID\",\"Session Name\",\"Session#\",\"Mem Usage\"\r\n\"node.exe\",\"227007\",\"Console\",\"1\",\"42,452 K\"", null);
                        break;
                    case "mkdir":                                
                    case "mkdir directory":
                    case "mkdir directory /s /q":
                        cb.call(null, null, 'mkdir');
                        break;
                    default:
                        cb.call(null, null, null);
                    }
            });
        }

        soda = new Soda({ testPath: "@database", logSupressed: true, platform: "web", framework: "selenium", suite: "my_suite", module: "my_module" });

        /**
         * The following methods are required to work with the database driver
         */

        var db = soda.useDb("@database");

        // Send the list of suites
        db.on("list suites", function (send) {
            send(null, [
                {
                    name        : "global",
                    description : "The global suite",
                    map         : {}
                },
                {
                    name        : "test",
                    description : "A test suite",
                    map         : {
                        SUPER_SELECTOR: ".super"
                    }
                }
            ]);
        });

        // Send the list of modules
        db.on("list modules", function (send) {
            send(null, [
                {
                    name        : "common",
                    suite       : "test",
                    description : "The common module for suite test",
                    map         : {}
                },
                {
                    name        : "global",
                    suite       : "global",
                    description : "The global module, for the global suite"
                },
                {
                    name        : "foo",
                    suite       : "test",
                    description : "The foo module, for the test suite",
                    map         : {
                        SUPER_SELECTOR: ".super"
                    }
                }
            ]);
        });

        // Send the list of assets
        db.on("list assets", function (send) {
            send(null, [
                {
                    name        : "assetA",
                    type        : "test",
                    suite       : "test",
                    module      : "foo",
                    description : "An asset named assetA",
                    platform    : "generic"
                },
                {
                    name        : "assetB",
                    type        : "test",
                    suite       : "test",
                    module      : "foo",
                    description : "An asset named assetB",
                    platform    : "generic"
                },
                {
                    name        : "assetC",
                    type        : "test",
                    suite       : "test",
                    module      : "foo",
                    description : "An asset named assetC",
                    platform    : "generic"
                },
                {
                    name        : "globalAssetA",
                    type        : "test",
                    suite       : "global",
                    module      : "global",
                    description : "An asset named globalAssetA",
                    platform    : "generic"
                },
                {
                    name        : "globalAssetB",
                    type        : "test",
                    suite       : "global",
                    module      : "global",
                    description : "An asset named globalAssetB",
                    platform    : "generic"
                },
                {
                    name        : "globalAssetC",
                    type        : "test",
                    suite       : "global",
                    module      : "global",
                    description : "An asset named globalAssetC",
                    platform    : "generic"
                },
                {
                    name        : "commonAssetA",
                    type        : "test",
                    suite       : "test",
                    module      : "common",
                    description : "An asset named commonAssetA",
                    platform    : "generic"
                },
                {
                    name        : "commonAssetB",
                    type        : "test",
                    suite       : "test",
                    module      : "common",
                    description : "An asset named commonAssetB",
                    platform    : "generic"
                }
            ]);
        });

        db.on("get contents for", function (asset, send) {
            switch(true) {
                case asset.name === "assetA" && asset.module === "foo" && asset.suite === "test" && asset.platform === "generic":
                    send(null, { a: 3, b: 2 });
                    break;

                case asset.name === "assetB" && asset.module === "foo" && asset.suite === "test" && asset.platform === "generic":
                    send(null, { a: "foo", b: "bar" });
                    break;

                case asset.name === "assetC" && asset.module === "foo" && asset.suite === "test" && asset.platform === "generic":
                    send(null, { a: "baz", b: "bah" });
                    break;

                case asset.name === "globalAssetA" && asset.module === "global" && asset.suite === "global" && asset.platform === "generic":
                    send(null, { a: 3, b: 2, g: true });
                    break;

                case asset.name === "globalAssetB" && asset.module === "global" && asset.suite === "global" && asset.platform === "generic":
                    send(null, { a: "foo", b: "bar", g: true });
                    break;

                case asset.name === "globalAssetC" && asset.module === "global" && asset.suite === "global" && asset.platform === "generic":
                    send(null, { a: "baz", b: "bah", g: true });
                    break;

                default:
                    send(new Error("Something went wrong"));
            }
        });

        soda.init(function() {
            soda.config.set("headless", true, true, true);

            framework = new Framework(soda);
            framework.load('selenium');
            soda.framework = framework;
            stub = sinon.stub(soda.framework, 'started').get(function getterFn() {
              return true;
            });

            done();
          });
    });

    it('Should successfully load the given assets', function (done) {
        soda.assets.load("@database", function (err, collection) {
            expect(err).toEqual(null);
            expect(collection).toBeInstanceOf(AssetCollection);

            var suites = collection.getAllSuites();
            expect(suites).toBeInstanceOf(Object);
            expect(suites.sodamembers).toEqual(2);

            expect(suites.test).toBeInstanceOf(Suite);
            expect(suites.global).toBeInstanceOf(Suite);

            var testSuite = collection.getSuite("test");
            expect(testSuite).toBeInstanceOf(Suite);
            expect(testSuite.name).toEqual("test");

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

            var fooModule = testSuite.getModule("foo");
            expect(fooModule).toBeInstanceOf(Module);
            expect(fooModule.name).toEqual("foo");
            expect(fooModule.suite).toEqual(testSuite);

            var commonModule = testSuite.getModule("common");
            expect(commonModule).toBeInstanceOf(Module);
            expect(commonModule.name).toEqual("common");
            expect(commonModule.suite).toEqual(testSuite);

            var fooPlatform = fooModule.getPlatform("generic");
            expect(fooPlatform).toBeInstanceOf(Platform);
            expect(fooPlatform.name).toEqual("generic");
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

            var testA = fooPlatform.getTest("assetA");
            expect(testA).toBeInstanceOf(Test);
            expect(testA.name).toEqual("assetA");
            expect(testA.type).toEqual("test");
            expect(testA.id).toEqual(null);
            expect(testA.description).toEqual("An asset named assetA");
            expect(testA.suite).toEqual(testSuite);
            expect(testA.module).toEqual(fooModule);
            expect(testA.platform).toEqual(fooPlatform);

            testA.getContents(function (err, contents) {
                expect(err).toEqual(null);
                expect(JSON.stringify(contents)).toEqual(JSON.stringify({ a: 3, b: 2 }));

                var testB = fooPlatform.getTest("assetB");
                expect(testB).toBeInstanceOf(Test);
                expect(testB.name).toEqual("assetB");
                expect(testB.type).toEqual("test");
                expect(testB.id).toEqual(null);
                expect(testB.description).toEqual("An asset named assetB");
                expect(testB.suite).toEqual(testSuite);
                expect(testB.module).toEqual(fooModule);
                expect(testB.platform).toEqual(fooPlatform);

                testB.getContents(function (err, contents) {
                    expect(err).toEqual(null);
                    expect(JSON.stringify(contents)).toEqual(JSON.stringify({ a: "foo", b: "bar" }));

                    var testC = fooPlatform.getTest("assetC");
                    expect(testC).toBeInstanceOf(Test);
                    expect(testC.name).toEqual("assetC");
                    expect(testC.type).toEqual("test");
                    expect(testC.id).toEqual(null);
                    expect(testC.description).toEqual("An asset named assetC");
                    expect(testC.suite).toEqual(testSuite);
                    expect(testC.module).toEqual(fooModule);
                    expect(testC.platform).toEqual(fooPlatform);

                    testC.getContents(function (err, contents) {
                        expect(err).toEqual(null);
                        expect(JSON.stringify(contents)).toEqual(JSON.stringify({ a: "baz", b: "bah" }));

                        var globalA = globalPlatform.getTest("globalAssetA");
                        expect(globalA).toBeInstanceOf(Test);
                        expect(globalA.name).toEqual("globalAssetA");
                        expect(globalA.type).toEqual("test");
                        expect(globalA.id).toEqual(null);
                        expect(globalA.description).toEqual("An asset named globalAssetA");
                        expect(globalA.suite).toEqual(globalSuite);
                        expect(globalA.module).toEqual(globalModule);
                        expect(globalA.platform).toEqual(globalPlatform);

                        globalA.getContents(function (err, contents) {
                            expect(err).toEqual(null);
                            expect(JSON.stringify(contents)).toEqual(JSON.stringify({ a: 3, b: 2, g: true }));

                            var globalB = globalPlatform.getTest("globalAssetB");
                            expect(globalB).toBeInstanceOf(Test);
                            expect(globalB.name).toEqual("globalAssetB");
                            expect(globalB.type).toEqual("test");
                            expect(globalB.id).toEqual(null);
                            expect(globalB.description).toEqual("An asset named globalAssetB");
                            expect(globalB.suite).toEqual(globalSuite);
                            expect(globalB.module).toEqual(globalModule);
                            expect(globalB.platform).toEqual(globalPlatform);

                            globalB.getContents(function (err, contents) {
                                expect(err).toEqual(null);
                                expect(JSON.stringify(contents)).toEqual(JSON.stringify({ a: "foo", b: "bar", g: true }));

                                var globalC = globalPlatform.getTest("globalAssetC");
                                expect(globalC).toBeInstanceOf(Test);
                                expect(globalC.name).toEqual("globalAssetC");
                                expect(globalC.type).toEqual("test");
                                expect(globalC.id).toEqual(null);
                                expect(globalC.description).toEqual("An asset named globalAssetC");
                                expect(globalC.suite).toEqual(globalSuite);
                                expect(globalC.module).toEqual(globalModule);
                                expect(globalC.platform).toEqual(globalPlatform);

                                globalC.getContents(function (err, contents) {
                                    expect(err).toEqual(null);
                                    expect(JSON.stringify(contents)).toEqual(JSON.stringify({ a: "baz", b: "bah", g: true }));
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    afterAll(function (done) {
        if (os === "win32" || os === "win64") {
            spy.restore();
        }

        soda.kill();

        soda = null;

        done();
    });
});


describe('Soda Database Driver Test, Part II', function () {
    "use strict";

    var soda, framework, db, suites, modules, assets, contents, stub, spy;

    beforeAll(function (done) {
        // Allow up to 30 seconds for framework initialization
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 800000;

        if (os === "win32" || os === "win64") {
            spy = sinon.stub(child_process, 'exec').callsFake((command, cb) => {
                switch(command) {  
                    case "tasklist /FI \"IMAGENAME eq node.exe\" /FO CSV":
                        cb.call(null, null, "\"Image Name\",\"PID\",\"Session Name\",\"Session#\",\"Mem Usage\"\r\n\"node.exe\",\"227007\",\"Console\",\"1\",\"42,452 K\"", null);
                        break;
                    case "mkdir":                                
                    case "mkdir directory":
                    case "mkdir directory /s /q":
                        cb.call(null, null, 'mkdir');
                        break;
                    default:
                        cb.call(null, null, null);
                    }
            });
        }

        soda = new Soda({ testPath: "@database:2", logSupressed: true, platform: "web", framework: "selenium", suite: "my_suite", module: "my_module" });

        // Tell the database driver that we're connected
        db = soda.useDb("@database:2");

        suites   = require(path.join(__dirname, "dummy_db_data", "suites"))(db);
        modules  = require(path.join(__dirname, "dummy_db_data", "modules"))(db);
        assets   = require(path.join(__dirname, "dummy_db_data", "assets"))(db);
        contents = require(path.join(__dirname, "dummy_db_data", "contents"))(db);

        soda.init(function() {
            soda.config.set("headless", true, true, true);
            
            framework = new Framework(soda);
            framework.load('selenium');
            soda.framework = framework;
            stub = sinon.stub(soda.framework, 'started').get(function getterFn() {
              return true;
            });

            done();
          });
    });

    it('Should successfully run tests/actions', function (done) {
        framework.start("chrome", "about:blank", {}, function(err) {
            expect(err).toEqual(null);

            soda.assets.load("@database:2", function (err, collection) {
                expect(err).toEqual(null);
                expect(collection).toBeInstanceOf(AssetCollection);

                var doTest = function (asset) {

                    soda.runner.run({
                        suite: asset.suite,
                        module: asset.module,
                        test: asset.name,
                    }, function (err, res) {
                        if(asset.name === "099") {
                            expect(err).toBeInstanceOf(soda.exception.SodaError);
                        }
                        else {
                            var possibilities = [
                                asset.name + " " + asset.suite + " " + asset.module + " " + "ipad",
                                asset.name + " " + asset.suite + " " + asset.module + " " + "generic"
                            ];
                            expect(possibilities.indexOf(res.variables.assetInfo) > -1).toEqual(true);
                        }

                        var next = queue.shift();
                        if(next) {
                            doTest(next);
                        }
                        else {
                            framework.stop(function () {
                                done();
                              });
                        }
                    });
                };

                var queue = [];
                assets.sodaeach(function (a) {
                    queue.push(a);
                });

                doTest(queue.shift());
            });
        });
    });

    afterAll(function (done) {
        if (os === "win32" || os === "win64") {
            spy.restore();
        }

        soda.kill();

        soda = null;

        done();
    });
});
