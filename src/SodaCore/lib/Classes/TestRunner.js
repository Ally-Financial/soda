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

 /**
 * @module SodaCore/TestRunner
 */

"use strict";

var util         = require("util"),
    EventEmitter = require("events").EventEmitter,
    nodePath     = require("path"),
    os           = require('os'),
    fs           = require('fs'),
    fsPromises = fs.promises,
    Run          = require(nodePath.join(__dirname, "Run")),
    runnerIds    = 0,
    suites       = [],

/**
 * Starts, stops, and initializes test runs
 * @constructor
 * @augments EventEmitter
 */
TestRunner = function (soda) {

    var self = this,

        lastResult       = true,
        lastModuleResult = true,
        lastSuiteResult  = true,

        lastStart       = 0,
        lastModuleStart = 0,
        lastSuiteStart  = 0,

        moduleFailureMessages = [],
        moduleFailureArtifacts = [],
        suiteFailureMessages  = [],
        suiteFailureArtifacts = [],
        testsRun = 0;

    Object.defineProperties(self, {

        /**
         * The last test start time
         * @type {Number}
         * @memberof module.SodaCore/TestRunner.TestRunner
         */
        lastStart: {
            configurable : false,
            enumerable   : false,
            get          : function () { return lastStart; }
        },

        /**
         * The last test result
         * @type {Boolean}
         * @memberof module.SodaCore/TestRunner.TestRunner
         */
        last: {
            configurable : false,
            enumerable   : false,
            value        : {
                get result  () { return lastResult; }
            }
        },

        /**
         * True if a test is running, false otherwise
         * @type {Boolean}
         * @memberof module.SodaCore/TestRunner.TestRunner
         */
        running: {
            configurable : false,
            enumerable   : false,
            get          : function () { return soda.config.get("testingInProgress"); }
        },

        /**
         * An object containing the current suite, module, test, and action
         * @type {Boolean}
         * @memberof module.SodaCore/TestRunner.TestRunner
         */
        current: {
            configurable : false,
            enumerable   : false,
            value        : {
                get suite  () { return soda.config.get("suite");  },
                get module () { return soda.config.get("module"); },
                get test   () { return soda.config.get("test");   },
                get action () { return soda.config.get("action"); }
            }
        }
    });

    /**
     * This is useless, don't use it.
     * @deprecated
     */
    this.init = function () {
        /**
         * Emitted when the TestRunner object is being created
         * @event module.SodaCore/TestRunner.TestRunner#init
         * @argument self The current TestRunner instance
         */
        self.emit("init", self);
    };

    /**
     * Starts a test or individual action. Initializes variables, and sets fresh test state.
     * @param {string} test The test object to start
     * @return {TestRunner} The current TestRunner instance
     */
    function startTest (test) {
        soda.config.set("testingInProgress", true);
        soda.config.set("test-last", soda.config.get("test"));
        soda.config.set("test", test.name);
        soda.config.set("treeHashes", {});

        testsRun++;
        soda.vars.empty(); // Reset variables...

        soda.vars.save("_test_info_", {
            name        : test.name,
            suite       : test.suite.name,
            module      : test.module.name,
            platform    : test.platform.name,
            description : test.description,
            id          : test.id,
            path        : test.path
        });

        if(soda.config.get("interactiveMode") === true)
            soda.console.warn("Interactive test mode enabled: press (p) to pause the test and (s) to stop it...");

        lastStart  = Date.now();
        lastResult = true;

        soda.config.set("suite"   , test.module.suite.name);
        soda.config.set("module"  , test.module.name);
        soda.config.set("platform", soda.config.get("platform"));
        soda.config.set("test"    , test.humanName);

        var allVariables = [];
        var eachVariable;
        var individualVariable;

        if (soda.config.get("variableJSONFile")) {
          allVariables = JSON.parse(fs.readFileSync(soda.config.get("variableJSONFile"), 'utf8'));

          for (var l = 0; l < allVariables.length; l++) {
              eachVariable = allVariables[l];

              if (!eachVariable.test && !eachVariable.module && eachVariable.suite === test.module.suite.name) {
                  for (individualVariable in eachVariable)
                  {
                    if (eachVariable.hasOwnProperty(individualVariable) && individualVariable !== 'suite') {
                          soda.vars.save(individualVariable, eachVariable[individualVariable]);
                    }
                  }
              }
              else if (!eachVariable.test && eachVariable.suite === test.module.suite.name && eachVariable.module === test.module.name) {
                  for (individualVariable in eachVariable)
                  {
                    if (eachVariable.hasOwnProperty(individualVariable) && (individualVariable !== 'suite' && individualVariable !== 'module')) {
                        soda.vars.save(individualVariable, eachVariable[individualVariable]);
                    }
                  }
              }
              else if (eachVariable.suite === test.module.suite.name && eachVariable.module === test.module.name && eachVariable.test === test.name) {

                for (individualVariable in eachVariable)
                {
                  if (eachVariable.hasOwnProperty(individualVariable) &&  (individualVariable !== 'suite' && individualVariable !== 'module' && individualVariable !== 'test')) {
                    soda.vars.save(individualVariable, eachVariable[individualVariable]);
                  }
                }
              }
          }
        }

        return self;
    }

    /**
     * Starts a module
     * @param  {Module} module The module object to start
     * @return {TestRunner} The current test runner instance
     */
    function startModule (module) {
        lastModuleStart       = Date.now();
        moduleFailureMessages = [];
        moduleFailureArtifacts = [];

        soda.vars.save("_module_info_", {
            name        : module.name,
            suite       : module.suite.name
        }, true);

        soda.console.start(
            "\n ⎋  Starting Module `" + module.name + "`..." +
            "\n    Suite    : " + module.suite.name +
            "\n    Platform : " + soda.config.get("platform") + "\n"
        );
        return self;
    }

    /**
     * Starts a suite
     * @param  {Suite} suite The suite object to start
     * @return {TestRunner} The current test runner instance
     */
    function startSuite (suite) {
        lastSuiteStart       = Date.now();
        suiteFailureMessages = [];
        suiteFailureArtifacts = [];

        soda.vars.save("_suite_info_", suite.name, true);

        soda.console.start(
            "\n ⎋  Starting Suite `" + suite.name   + "`..."       +
            "\n    Platform : "  + soda.config.get("platform") + "\n"
        );
        return self;
    }

    /**
     * Prints the results of the test to the stdout
     * @param  {Object} res A test results object
     * @param  {Test} test The Test object representing the test that was run
     * @return {undefined}
     */
    function printTestResults (msg, res, test) {
        var message =
            "\n-------------------------------------------------- TEST RESULTS ----------------------------------------------------"   +
            "\n" + test.type.ucFirst + "         : "  + test.name                                                                      +
            "\nFilename     : "  + test.getPath()                                                                                      +
            "\nId           : "  + (test.id            || "N/A")                                                                       +
            "\nName         : "  + (test.humanName     || "N/A")                                                                       +
            "\nDescription  : "  + (test.description   || "N/A")                                                                       +
            "\nSuite        : "  + soda.config.get("suite")                                                                            +
            "\nModule       : "  + soda.config.get("module")                                                                           +
            "\nPlatform     : "  + soda.config.get("platform")                                                                         +
            "\nUser         : "  + res.user                                                                                            +
            "\nResult       : "  + (res.stopped ? "Stopped" : res.resultBool === true ? "Pass" : "Fail")                               +
            "\nStarted      : "  + res.started                                                                                         +
            "\nDuration     : "  + res.duration                                                                                        +
            "\nFailure ID   : "  + res.failureId                                                                                       +
            "\nTrace File   : "  + (res.trace || "N/A")                                                                                +
            "\nScreen Shot  : "  + (res.failureScreenshot || "N/A")                                                                    +
            "\nReason(s)    :\n    • " + (res.resultBool === false ? res.reason : "Good job!")                                         +
            "\n--------------------------------------------------------------------------------------------------------------------\n" ;

        /**
         * Emitted when a test is complete
         * @event module.SodaCore/TestRunner.TestRunner#results
         * @argument {Object} res An object containing action/test result information
         * @argument {Test|Action} test The Test or Action object associated with this test Run
         * @argument {String} message The results message return from the action/test run
         */
        self.emit("results", res, test, msg);

        // Print test results to the screen
        var method = res.resultBool === false || res.stopped ? "fail" : "pass";
        soda.console[method](message);
    }

    /**
     * Ends a test. Logs test duration and sets test state to "off"
     * @param {Test|Action} test The test or action object that was run
     * @param {string} result The result to the test run
     * @param {string=} msg A failure message, if on exists
     * @param {function} done A callback for completion
     * @return {TestRunner} The current TestRunner instance
     */
    function endTest (test, result, msg, stopped, run, done) {
        console.log("Test `" + test.name + "` in module `" + soda.config.get("module") + "` and suite `" + soda.config.get("suite") + "` complete!");

        var duration = Date.now() - lastStart,
            start    = new Date(lastStart).toUTCString(),
            fid      = Date.now(),

            res = {
                filename    : test.getPath(),
                id          : (test.id          || "N/A"),
                name        : (test.humanName   || "N/A"),
                description : (test.description || "N/A"),
                suite       : soda.config.get("suite"),
                module      : soda.config.get("module"),
                platform    : soda.config.get("platform"),
                type        : test.type.ucFirst,
                user        : soda.vars.get(soda.syntax.get(null, soda.config.get("syntax").name, soda.config.get("syntax").version).syntax.userVariable) || "N/A",
                result      : (stopped ? "Stopped" : result === true ? "Pass" : "Fail"),
                resultBool  : stopped ? false : result,
                timestamp   : Date.now(),
                stopped     : stopped,
                started     : start,
                totalTests  : 1,
                run         : 1,
                duration    : duration.clockTime(),
                failureId   : result === false ? fid : "N/A",
                reason      : msg,
                variables   : {}
            };

        var mess = '';
        if (msg && msg.length > 0) msg.replace(/[^a-zA-Z0-9_]+/g, "_").substr(0, 50);

        var ssDest = (soda.config.get("resultsScreenshot") || "")
            .replace(/\[reason]/g, mess)
            .replace(/\[now]/g, Date.now())
            .replace(/\[platform]/g, soda.config.get("platform"))
            .replace(/\[test_path]/g, soda.config.get("testResultsPath").withoutTrailingSlash)
            .replace(/\[test_results_dir]/g, soda.config.get("testResultsDir"))
            .replace(/\[fid]/g, fid)
            .replace(/\[host]/g, os.hostname())
            .replace(/\[yyyymmdd]/g, (new Date()).yyyymmdd("-"));

        fsPromises.mkdir(nodePath.dirname(ssDest), { recursive: true }).then( made => {
          var variables = {}, keys;
          soda.vars.getAllVariables().sodaeach(function (v, k) { if(v.report) variables[k] = v.value; });

          keys = variables.getKeys;
          keys.sort(function (a, b) { return a < b ? -1 : b < a ? 1 : 0; });
          keys.sodaeach(function (k) { res.variables[k] = variables[k]; });

          if(result === false && typeof soda.config.get("resultsScreenshot") === "string") res.screenShotFilename = ssDest;

          lastResult = result;
          soda.config.set("testingInProgress", false);
          soda.config.set("test", soda.config.get("test-last"));

          // Save test results using the collection driver
          if(soda.config.get("resultsJSON") && soda.config.get("reportJSON")) {
              test.suite.collection.saveResults(res, function () {

                  // Take failure screenshot
                  if(result === false && soda.config.get("takeScreenshotOnFailure") && soda.config.get("resultsScreenshot")) {
                      res.failureScreenshot = ssDest;
                      soda.console.debug("Saving failure screenshot at path: `" + ssDest + "`");
                      soda.device.captureHeader({"name": "TLTSID"}, function (err, headerValue) {
                          res.TLTSID = headerValue;

                          soda.device.captureScreen({ filename: "failure", destination : ssDest }, function () {
                              fs.readFile(ssDest, function (err, fc) {
                                  if (err) {
                                      console.log(err);
                                  }
                                  else {
                                      res.screenShot = fc.toString('base64');
                                  }

                                  if(soda.config.get("traceInteractions") === true && typeof soda.config.get("resultsTrace") === "string") {
                                      test.suite.collection.saveTrace(run.trace.get(), res, function (err, dest) {
                                          res.trace = dest || "N/A";

                                          self.saveTree(res, function(err) {
                                              if(err) soda.console.error(err);

                                              printTestResults(msg, res, test);
                                              if(done instanceof Function) done.call(self, null, res, test, msg, stopped);
                                          });
                                      });
                                  }
                                  else {
                                      printTestResults(msg, res, test);
                                      if(done instanceof Function) done.call(self, null, res, test, msg, stopped);
                                  }
                              });
                          });
                      });
                  }
                  // Save trace using the collection driver
                  else if(soda.config.get("traceInteractions") === true && typeof soda.config.get("resultsTrace") === "string") {
                      test.suite.collection.saveTrace(run.trace.get(), res, function (err, dest) {
                          res.trace = dest || "N/A";

                          self.saveTree(res, function(err) {
                              if(err) soda.console.error(err);

                              printTestResults(msg, res, test);
                              if(done instanceof Function) done.call(self, null, res, test, msg, stopped);
                          });
                      });
                  }
                  else {
                      printTestResults(msg, res, test);
                      if(done instanceof Function) done.call(self, null, res, test, msg, stopped);
                  }
              });
          }
          else {
              printTestResults(msg, res, test);
              if(done instanceof Function) done.call(self, null, res, test, msg, stopped);
          }
        });

        return self;
    }

    /**
     * Ends a module.
     * @param moduleTestCount The number of tests in the module
     * @param {function} done A callback for completion
     * @return {TestRunner} The current TestRunner instance
     */
    function endModule (moduleTestCount, module, stopped, done) {
        var duration = Date.now() - lastModuleStart,
            start    = new Date(lastModuleStart).toUTCString(),
            resMsg,

            res = {
                type        : "Module",
                suite       : soda.config.get("suite"),
                module      : soda.config.get("module"),
                platform    : soda.config.get("platform"),
                result      : (moduleFailureMessages.length === 0 ? "Pass" : "Fail"),
                resultBool  : moduleFailureMessages.length === 0,
                timestamp   : Date.now(),
                started     : start,
                duration    : duration.clockTime(),
                totalTests  : testsRun,
                run         : testsRun,
                passed      : (testsRun - moduleFailureMessages.length),
                failed      : moduleFailureMessages.length,
                reasons     : moduleFailureMessages,
                artifacts   : moduleFailureArtifacts
            };

        resMsg =
            "\n-------------------------------------------------- MODULE RESULTS --------------------------------------------------"   +
            "\nSuite        : "  + soda.config.get("suite")                                                                            +
            "\nModule       : "  + soda.config.get("module")                                                                           +
            "\nPlatform     : "  + soda.config.get("platform")                                                                         +
            "\nResult       : "  + res.result                                                                                          +
            "\nStarted      : "  + res.started                                                                                         +
            "\nDuration     : "  + res.duration                                                                                        +
            "\nTotal Tests  : "  + res.totalTests                                                                                      +
            "\nRun          : "  + res.run                                                                                             +
            "\nPassed       : "  + res.passed                                                                                          +
            "\nFailed       : "  + res.failed                                                                                          +
            "\nReason(s)    :\n    • " + (moduleFailureMessages.length > 0 ? moduleFailureMessages.join("\n    • ") : "Good job!")     +
            "\n--------------------------------------------------------------------------------------------------------------------\n" ;

        var method = res.resultBool === false ? "fail" : "pass";
        soda.console[method](resMsg);

        /**
         * Emitted when a module is complete
         * @event module.SodaCore/TestRunner.TestRunner#module results
         * @argument {Boolean} res Whether or not the module passed or failed
         * @argument {Array<String>} messages The failure messages (in any) associated with this module run
         */
        self.emit("module results", res, moduleFailureMessages);

        if(soda.config.get("resultsJSON") && soda.config.get("reportJSON") && soda.config.get("devMode") === false) {
            module.suite.collection.saveResults(res, function (err) {
                if(done instanceof Function) done.call(self, err, res, moduleFailureMessages, stopped);
            });
        }
        else {
            if(done instanceof Function) done.call(self, null, res, moduleFailureMessages, stopped);
        }

        return self;
    }

    /**
     * Ends a suite.
     * @param suiteModuleCount The number of modules in the suiteModuleCount
     * @param suiteTestCount The number of tests in the suite
     * @param {function} done A callback for completion
     * @return {TestRunner} The current TestRunner instance
     */
    function endSuite (suiteModuleCount, suiteTestCount, suite, done) {
        var duration = Date.now() - lastSuiteStart,
            start    = new Date(lastSuiteStart).toUTCString(),
            resMsg,

            res = {
                type         : "Suite",
                suite        : soda.config.get("suite"),
                platform     : soda.config.get("platform"),
                result       : (suiteFailureMessages.length === 0 ? "Pass" : "Fail"),
                resultBool   : suiteFailureMessages.length === 0,
                started      : start,
                duration     : duration.clockTime(),
                totalModules : suiteModuleCount,
                totalTests   : suiteTestCount,
                run          : testsRun,
                passed       : (testsRun - suiteFailureMessages.length),
                failed       : suiteFailureMessages.length,
                reasons      : suiteFailureMessages,
                artifacts    : suiteFailureArtifacts
            };

        resMsg =
            "\n-------------------------------------------------- SUITE RESULTS ---------------------------------------------------"  +
            "\nSuite         : "  + soda.config.get("suite")                                                                          +
            "\nPlatform      : "  + soda.config.get("platform")                                                                       +
            "\nResult        : "  + res.result                                                                                        +
            "\nStarted       : "  + res.started                                                                                       +
            "\nDuration      : "  + res.duration                                                                                      +
            "\nTotal Modules : "  + res.totalModules                                                                                  +
            "\nTotal Tests   : "  + res.totalTests                                                                                    +
            "\nTests Run     : "  + res.run                                                                                           +
            "\nPassed        : "  + res.passed                                                                                        +
            "\nFailed        : "  + res.failed                                                                                        +
            "\nReason(s)     :\n    • " + (suiteFailureMessages.length > 0 ? suiteFailureMessages.join("\n    • ") : "Good job!")     +
            "\n--------------------------------------------------------------------------------------------------------------------\n";

        var method = res.resultBool === false ? "fail" : "pass";
        soda.console[method](resMsg);

        /**
         * Emitted when a suite is complete
         * @event module.SodaCore/TestRunner.TestRunner#suite results
         * @argument {Object} res The suite results information
         * @argument {Array<String>} failureMessages An array of failure messages, if any
         */
        self.emit("suite results", res, suiteFailureMessages);

        if(soda.config.get("resultsJSON") && soda.config.get("reportJSON") && soda.config.get("devMode")=== false) {
            suite.collection.saveResults(res, function (err) {
                if(done instanceof Function) done.call(self, err, res, moduleFailureMessages);
            });
        }
        else {
            if(done instanceof Function) done.call(self, null, res, suiteFailureMessages);
        }

        return self;
    }

    /**
     * Run a test or action
     * @param {string} suite The test/action suite
     * @param {string} platform The test/action platform
     * @param {string} module The test/action module
     * @param {string} testOrAction The test/action name as a string
     * @param {string} type Is this a test or action? Should be a string "test" or "action"
     * @param {function} complete A callback for completion
     * @return {TestRunner} The current TestRunner instance
     */
    function doTest (suite, platform, module, test, type, done, run) {
        var err = arguments.sodaexpect("string|number", "string|number", "string|number", "string|number", "string", "function|undefined").error;

        if(err) {
            if(done instanceof Function) done.call(self, err, null, null, false);
            return self;
        }

        // Get the assets at the current test path
        soda.assets.get(soda.config.get("testPath"), function (err, assets) {
            if(err) {
                if(done) done.call(self, err, null, null, false);
                return self;
            }

            var doTestAfterCheck = function(done) {
              // Resolve the desired assets at the current test path
              assets.resolve(
                  {
                      type     : type,
                      name     : test,
                      suite    : suite,
                      module   : module,
                      platform : soda.config.get("platform"),
                      accept   : { global: false, common: false },
                      run      : run
                  },
                  function (err, action, asset) {
                      if(err) {
                          if(done instanceof Function) done.call(self, err, null, null, false);
                          return self;
                      }
                      if(!asset) {
                          err = new soda.exception.AssetNotFoundError("Unable to resolve " + type + " `" + test + "` in module `" + module + "` and suite `" + suite + "`");
                          if(done instanceof Function) done.call(self, err, null, null, false );
                          return;
                      }

                      // Get the asset's contents to check for an empty action list
                      asset.getContents(function (err, contents) {
                          if(err) {
                              if(done instanceof Function) done.call(self, err, null, null, false);
                              return self;
                          }

                          var environments = [soda.vars.get("_env_")];

                          if (contents.meta.environments) {
                              environments = contents.meta.environments;
                          }

                          if (!environments.includes(soda.vars.get("_env_"))) {
                            done.call(self, null, null, "Action file `" + asset.name + "` contains no actions!", false);
                            return;
                          }

                          // Print message indicating that the test is starting
                          startTest(asset);
                          if(!contents.actions || contents.actions.sodaIsEmpty()) {
                              soda.console.warn("Action file `" + test + "` contains no actions!");
                              lastResult = false;
                              if(done) done.call(self, null, null, "Action file `" + asset.name + "` contains no actions!", false);
                              return self;
                          }

                          // Start the trace for this test
                          run.trace.start();

                          // Evaluate the action
                          action.evaluate(function (err, results, msg, stopped) {
                              run.trace.stop();
                              endTest(asset, results, (!err ? msg : err.message), stopped, run, done);
                          });
                      });
                  }
              );
            };

            var applicationName = null;

            if (soda.framework.name.toLowerCase() === 'perfecto') {
              applicationName = soda.framework.args[1];
              soda.device.stopApp(applicationName, {}, function(err, result) {

                    setTimeout(function() {
                      soda.device.startApp(applicationName, {}, function(err, result) {
                          if (err || !result) done(new Error("Could not start application."), result);

                          doTestAfterCheck(done);
                      });
                    }, 5000);
                });
            }
            else if (soda.framework.name.toLowerCase() === 'instruments') {
              applicationName = soda.framework.args[2];
              soda.device.stopApp(applicationName, {}, function(err, result) {

                    setTimeout(function() {
                      soda.device.startApp(applicationName, {}, function(err, result) {
                          if (err || !result) done(new Error("Could not start application."), result);

                          doTestAfterCheck(done);
                      });
                    }, 5000);
                });
            }
            else {
              doTestAfterCheck(done);
            }
        });
        return self;
    }

    /**
     * Run an action
     * @param {string} suite The action's suite
     * @param {string} platform The platform to run
     * @param {string} module The action's module
     * @param {string} action The action's name
     * @param {function=} done A callback for completion
     * @return {TestRunner} The current TestRunner instance
     */
    function runAction (suite, platform, module, action, done, run) {
        var err = arguments.sodaexpect("string|number", "string|number", "string|number", "string|number", "function|undefined").error;
        if(err) {
            if(done instanceof Function) done.call(self, err, null, null);
            return self;
        }

        doTest(suite, platform, module, action, "action", done, run);
        return self;
    }

    /**
     * Run a test
     * @param {string} suite The test's suite
     * @param {string} platform The platform to run
     * @param {string} module The test's module
     * @param {string} test The test's name
     * @param {function=} done A callback for completion
     * @return {TestRunner} The current TestRunner instance
     */
    function runTest (suite, platform, module, test, done, run) {
        var err = arguments.sodaexpect("string|number", "string|number", "string|number", "string|number", "function|undefined").error;
        if(err) {
            if(done instanceof Function) done.call(self, err, null, null, false);
            return self;
        }

        doTest(suite, platform, module, test, "test", done, run);
        return self;
    }

    /**
     * Run a module
     * @param {string} suite The module's suite
     * @param {string} platform The platform to run
     * @param {string} module The module's name
     * @param {Array|function=} range The range of test to run
     * @param {function=} done A callback for completion
     * @param {boolean} startedBySuite "For internal use only*
     * @return {TestRunner} The current TestRunner instance
     */
    function runModule (suite, platform, module, range, startedBySuite, done, run) {
        var err = arguments.sodaexpect("string|number", "string|number", "string|number", "array|undefined|null", "boolean|undefined|null", "function|undefined|null").error,
            moduleQueue = [];

        if(err) {
            if(done instanceof Function) done.call(self, err, null, null, false);
            return self;
        }

        var s, m, p, g;
        soda.assets.get(soda.config.get("testPath"), function (err, assets) {
            if(err) {
                if(done instanceof Function) done.call(self, err, null, null, false);
                return self;
            }

            s = assets.getSuite(suite);
            if(!s) {
                err = new soda.exception.AssetNotFoundError("Unable to resolve suite `" + suite + "`");
                if(done) done.call(self, err, null, null, false);
                return self;
            }

            m = s.getModule(module);
            if(!m) {
                err = new soda.exception.AssetNotFoundError("Unable to resolve module `" + module + "` in suite `" + suite + "`");
                if(done) done.call(self, err, null, null, false);
                return self;
            }

            if(m.ignore === true) {
                soda.console.warn("Module `" + m.name + "` has been ignored for this platform... testing will not be performed.");
                if(done) done.call(self, err, null, null, false);
                return self;
            }

            p = m.getPlatform(soda.config.get("platform"));
            g = m.getPlatform("generic");

            var tests = [];

            if (p) p.getTests().sodaeach(function (i) { tests.push(i); });
            if (g) g.getTests().sodaeach(function (i) { tests.push(i); });

            var performTest = function (i) {
                return function () {
                    soda.config.set("module", m.name);

                    var test = tests[i];
                    run.state = "running";
                    runTest(suite, platform, module, test.name, function (err, res, test, msg, stopped) {
                        var t = moduleQueue.shift();

                        var artifact = [];

                        // Push test results to module results
                        if(res && typeof res === "object" && res.resultBool === false) {
                            moduleFailureMessages.push(test.name + ": " + msg);

                            artifact.testId = test.id;
                            artifact.failureMessage = test.name + ": " + msg;
                            artifact.screnShotname = test.name;
                            artifact.screenShot = res.screenShot;
                            artifact.trace = res.trace;
                            moduleFailureArtifacts.push(artifact);
                        }

                        // Push test results to suite results (if started by a suite)
                        if(res && typeof res === "object" && res.resultBool === false && startedBySuite) {
                            suiteFailureMessages.push(module + "-" + test.name + ": " + msg);

                            artifact.testId = test.id;
                            artifact.failureMessage = module + "-" + test.name + ": " + msg;
                            artifact.screnShotname = test.name;
                            artifact.screenShot = res.screenShot;
                            artifact.trace = res.trace;
                            suiteFailureArtifacts.push(artifact);
                        }

                        if(t && stopped !== true) {
                            if(res && typeof res === "object" && res.resultBool === false && soda.config.get("stopOnFailure") === true) {
                                soda.console.warn("Module run stopped due to test failure.");
                                endModule(tests.length, m, stopped, done);
                            }
                            else {
                                t();
                            }
                        }
                        else {
                            console.log("Module run complete!");
                            endModule(tests.length, m, stopped, done);
                        }
                    }, run);
                };
            };

            for(var i = 0; i < tests.length; i++) moduleQueue.push(performTest(i));
            var t = moduleQueue.shift();

            startModule(m);
            return t ? t() : endModule(0, m, false, done);
        });
        return self;
    }

    /**
     * Run a test suite
     * @param {string} suite The suite name
     * @param {string} platform The platform to run
     * @param {Array<string>|undefined} modules An array of modules to run
     * @param {function|Array<string>|undefined=} done A callback for completion
     * @return {TestRunner} The current TestRunner instance
     */
    function runSuite (suite, platform, modules, done, run) {
        var err = arguments.sodaexpect("string", "string", "array|undefined", "function|undefined").error,
            suiteQueue = [];

        if(err) {
            if(done instanceof Function) done.call(self, err, null, null);
            return self;
        }

        var s, oldModule = soda.config.get("module");
        soda.assets.get(soda.config.get("testPath"), function (err, assets) {
            if(err) {
                if(done instanceof Function) done.call(self, err, null, null);
                return self;
            }

            s = assets.getSuite(suite);
            if (!s) {
                err = new soda.exception.AssetNotFoundError("Unable to resolve suite `" + suite + "`");
                if (done) done.call(self, err, null, null);
                return self;
            }

            if(!modules || !modules.isAnArray) modules = s.getModules().getKeys;
            var totalTests    = 0,
                getTotalTests = function () { return totalTests; };

            var moduleCount = 0;
            modules.sodaeach(function (m) {
                m = s.getModule(m);

                if (m.name !== 'common') {
                  if(typeof m === "object" && m.ignore !== true) {
                      moduleCount++;
                      var p = m.getPlatform(soda.config.get("platform")),
                          g = m.getPlatform("generic");

                      if(p) totalTests += p.getTests().getKeys.length;
                      if(g) totalTests += g.getTests().getKeys.length;

                      suiteQueue.push(function () {
                          run.state = "running";
                          soda.config.set("module", m.name);
                          runModule(suite, platform, m.name, null, true, function (err, result, msg, stopped) {
                              if(err) {
                                  if(done instanceof Function) done.call(self, err, result, msg, stopped);
                                  return self;
                              }

                              var t = suiteQueue.shift();
                              if(t && stopped !== true) {
                                  t();
                              }
                              else {
                                  console.log("Suite run complete!");
                                  endSuite(moduleCount, getTotalTests(), s, done);
                                  soda.config.set("module", oldModule);
                              }
                          }, run);
                      });
                  }
                  else if(typeof m === "object" && m.ignore === true) {
                      soda.console.warn("Module `" + m.name + "` has been ignored for this platform... skipping...");
                  }
                  else {
                      err = new soda.exception.AssetNotFoundError("Unable to resolve module `" + m + "` in suite `" + suite + "`");
                      if(done instanceof Function) done.call(self, err, null);
                      return false;
                  }
                }
            });

            startSuite(s);
            var t = suiteQueue.shift();
            return t ? t() : endSuite(0, 0, s, done);
        });
        return self;
    }

    /**
     * Runs a suite/module/test/action by inferring with the arguments provided
     * @param {object} options Testing options (e.g. suite, module, etc.)
     * @param {function=} done A callback for completion
     * @returns {Run} The Run object associated with this Test Run
     */
    this.run = function (options, done) {
        if(soda.config.get("testingInProgress") === false) {   
            if(!soda.framework.started) {
                if(done instanceof Function) {
                    done.call(self, new soda.exception.NoFrameworkStartedError("No framework loaded"), null, null, null, null);
                }
                    
                return;
            }

            var run = new Run(soda, runnerIds++),
                err = arguments.sodaexpect("object", "function|undefined|null").error;

            if(err) {
                if(done instanceof Function) done.call(self, err);
                return self;
            }

            testsRun = 0;
            switch(true) {
                case options.test !== undefined:
                    runTest(
                        options.suite  || soda.config.get("suite"),
                        soda.config.get("platform"),
                        options.module || soda.config.get("module"),
                        options.test,
                        done,
                        run
                    );
                    break;

                case options.action !== undefined:
                    runAction(
                        options.suite  || soda.config.get("suite"),
                        soda.config.get("platform"),
                        options.module || soda.config.get("module"),
                        options.action,
                        done,
                        run
                    );
                    break;

                case options.module !== undefined:
                    runModule(
                        options.suite || soda.config.get("suite"),
                        soda.config.get("platform"),
                        options.module,
                        options.range,
                        !!options.startedBySuite,
                        done,
                        run
                    );
                    break;

                case options.suite !== undefined:
                    runSuite(
                        options.suite,
                        soda.config.get("platform"),
                        options.modules,
                        done,
                        run
                    );
                    break;

                default:
                    if(done instanceof Function) {
                            done.call(
                            self,
                            new soda.exception.InvalidArgumentsError('TestRunner.run: Invalid test arguments provided'),
                            null
                        );
                    }
            }
            return run;
        }
        else {
            if(done instanceof Function)
                done.call(self, new soda.exception.NoFrameworkStartedError("Testing already in progress!"), null, null, null, null);
            return null;
        }
    };

    /**
     * Saves a tree file
     * @param  {Object} trace The trace object from Run.trace.get
     * @param  {String} dest The path to save the trace to
     * @param  {Function} done A callback for completion
     * @return {FileSystem} The current FileSystem instance
     */
    this.saveTree = function (res, done) {
        soda.framework.getTree(function (err, tree) {

          var ress = '';
          if (res && res.length > 0) res.reason.replace(/[^a-zA-Z0-9_]+/g, "_").substr(0, 120);

            var treeResult = null,
                dest = (soda.config.get("treeScreenshot") || "")
                .replace(/\[reason]/g, ress)
                .replace(/\[now]/g, Date.now())
                .replace(/\[platform]/g, soda.config.get("platform"))
                .replace(/\[test_path]/g, soda.config.get("testResultsPath").withoutTrailingSlash)
                .replace(/\[test_results_dir]/g, soda.config.get("testResultsDir"))
                .replace(/\[fid]/g, res.reason)
                .replace(/\[host]/g, os.hostname())
                .replace(/\[yyyymmdd]/g, (new Date()).yyyymmdd("-"));

            soda.console.debug("Saving trace to: `" + dest + "`");

            try {
                treeResult = JSON.stringify(tree.contents, null, '    ');
            }
            catch (e) {
                if(done instanceof Function) done.call(self, e, null);
                return;
            }

            fsPromises.mkdir(nodePath.dirname(dest), { recursive: true }).then( made => {
              fs.writeFile(dest, treeResult, function (err) {
                  if(err) {
                      soda.console.error("Unable to write trace file:", err.message);
                  }
                  else {
                      res.tree = dest;
                  }

                  if(done instanceof Function) done.call(self, err, err ? null : dest);
              });
            });
        });

        return self;
    };

    /**
     * An alias for TestRunner.run
     * @see TestRunner.run
     * @type {Function}
     * @memberof module.SodaCore/TestRunner.TestRunner
     */
    this["do"] = self.run; // An alias

};

util.inherits(TestRunner, EventEmitter);
module.exports = TestRunner;
