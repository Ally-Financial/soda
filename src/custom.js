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

var https    = require("https"),
    nodePath = require("path"),
    fs       = require("fs"),
    fsPromises = fs.promises,
    Trace    = require(nodePath.join(__dirname, "SodaCore", "lib", "Classes", "Trace")),
    execSync = require("child_process").execSync,
    exec     = require("child_process").exec,
    repl     = require(nodePath.join(__dirname, "SodaREPL")),
    Soda     = require(nodePath.join(__dirname, "SodaCore", "lib", "Soda")),
    Emailer    = require(nodePath.join(__dirname, "SodaCore", "EmailManager", "Emailer")),
    windowsSoda = null,
    seleniumSoda = null,

    isJsonString = function(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    };

// A simple way to track bugs
repl.addCommand("found-bug", "bug", function (code, args) {
    fs.readFile(nodePath.join(repl.currentSoda.config.get("root"), "bugs.json"), function (err, contents) {
        var bugs = [], count = 0, newBug;

        if(!err) {
            try {
                bugs = JSON.parse(contents.toString('utf-8'));
            }
            catch (e) {
                bugs = [];
            }
        }

        count  = bugs.length;
        newBug = {
            date        : (new Date()).toUTCString(),
            timestamp   : Date.now(),
            description : args[0] || "No description",
            platform    : repl.currentSoda.config.get("platform"),
            framework   : repl.currentSoda.framework.name,
            device      : repl.currentSoda.framework.device,
            user        : { name: args[1] === undefined ? repl.currentSoda.vars.get("_user_") : args[1], password: args[2] === undefined ? "Password" : args[2]},
            n           : count++,
        };

        bugs.push(newBug);

        try {
            fs.writeFile(nodePath.join(repl.currentSoda.config.get("root"), "bugs.json"), JSON.stringify(bugs, null, '    '), function (err) {
                if(err) {
                    repl.currentSoda.console.error(err);
                }
                else {
                    repl.currentSoda.console.log("Bug added!\n", newBug);
                }
            });
        }
        catch (e) {
            repl.currentSoda.console.error("Unable to write bug file!");
        }
    });
});

// Custom trace solution for OTP
Trace.emitter.on("trace line item", function (traceItem, trace, soda, args, perform) {
    if(typeof traceItem.targets === "object") {
        traceItem.targets.sodaeach(function (target) {
            if(target.name === "userName") {
                soda.vars.save("_user_", traceItem.options.value);
            }
        });
    }

    perform(true);
});

module.exports = function customEvents (soda) {
    // Define custom syntax events
    soda.syntax.on("define", function (test) {
        test.on("actions/*/:timestamp", function (action, reply) {
          soda.vars.save('timestamp', new Date().getTime());

          reply(true);
        });

        test.on("actions/*/:executeOnSelenium", function (action, reply) {
            var localArgs     = action.executeOnSelenium;

            soda.console.debug("executeOnSelenium", localArgs);

            seleniumSoda = new Soda().init( function () {
                seleniumSoda.config.set("env", localArgs.environment, true, true);
                seleniumSoda.config.set("framework", localArgs.framework, true, true);
                seleniumSoda.config.set("interactiveMode", localArgs.interactive, true, true);
                seleniumSoda.config.set("testPath", localArgs.testPath, true, true);
                seleniumSoda.config.set("testResultsPath", localArgs.testResultsPath, true, true);
                seleniumSoda.config.set("platform", localArgs.platform, true, true);
                seleniumSoda.config.set("suite", localArgs.suite, true, true);
                seleniumSoda.config.set("module", localArgs.module, true, true);
                seleniumSoda.config.set("test", localArgs.test, true, true);
                seleniumSoda.config.set("headless", true, true, true);
                seleniumSoda.loadAssets(localArgs.testPath, function (err) {
                    if(err) soda.console.error(err.message);
                    seleniumSoda.framework
                        .load(localArgs.framework)
                        .start(localArgs.browser, localArgs.url, {}, function (err, result) {
                            if (err) throw new Error("Could not start Soda properly");
                            seleniumSoda.vars.save('_env_', soda.config.get("env"), true, true);
                            seleniumSoda.vars.save('env', soda.config.get("env"), true, true);
                            seleniumSoda.vars.save('targetenv', soda.config.get("env"), true, true);

                            soda.console.debug("Running tests with env: ", seleniumSoda.vars.get('_env_'));

                            seleniumSoda.runner.run(localArgs, function (err, results) {
                                if (err) throw new Error("Could not run Selenium test");
                                seleniumSoda.framework.stop(err => {
                                    seleniumSoda.kill();
                                    seleniumSoda = null;
                                    soda.vars.save('seleniumResults', results, true, true);
                                    reply(true, "Finisehd executing on selenium " + localArgs + " with results " + results);
                                });
                            });
                        });
                });
            });
        });

        test.on("actions/*/:executeOnWindows", function (action, reply) {
          var dataName     = action.executeOnWindows.dataName,
              localArgs     = action.executeOnWindows.arguments,
              data = soda.vars.get(dataName);

          soda.console.debug("executeOnWindows", localArgs, dataName, JSON.stringify(data));

          windowsSoda = new Soda().init( function () {
              windowsSoda.config.set("env", localArgs.environment, true, true);
              windowsSoda.config.set("framework", localArgs.framework, true, true);
              windowsSoda.config.set("interactiveMode", localArgs.interactive, true, true);
              windowsSoda.config.set("testPath", localArgs.testPath, true, true);
              windowsSoda.config.set("testResultsPath", localArgs.testPath, true, true);
              windowsSoda.config.set("platform", localArgs.platform, true, true);
              windowsSoda.config.set("suite", localArgs.suite, true, true);
              windowsSoda.config.set("module", localArgs.module, true, true);
              windowsSoda.config.set("test", localArgs.test, true, true);

              windowsSoda.loadAssets(localArgs.testPath, function (err) {
                  if(err) soda.console.error(err.message);
                  windowsSoda.framework
                      .load(localArgs.framework)
                      .start(null, null, null, function (err, result) {
                          if (err) throw new Error("Could not start Soda properly");
                          windowsSoda.vars.save(dataName, data, true, true);

                          windowsSoda.runner.run({ suite: "windows", module: localArgs.module, test: localArgs.test }, function (err, results) {
                              if (err) throw new Error("Could not run Windows test");
                              windowsSoda = null;
                              reply(true, "Finished executing on windows");
                          });
                      });
              });
          });
        });

        
        test.on("actions/*/:as:incinstring", function (action, reply) {
          var stringvar = action.incinstring;

          if (stringvar) {
              stringvar = stringvar.replace( /([1-9]+[0-9]*)/, function(){return arguments[1]*1+1;} );

              soda.vars.save(action.as, stringvar);

              reply(true, "Stored increment");
          }
          else {
              reply(false, "Could not find variable");
          }
        });

        test.on("actions/*/:as:getMonths", function (action, reply) {
            var months = 0;
            if (action.getMonths.includes("month")) {
              months = action.getMonths.match(/\d+/g).map(Number)[0];
              soda.vars.save(action.as, months);
            }
            else if (action.getMonths.includes("year")) {
              months = action.getMonths.match(/\d+/g).map(Number)[0];
              soda.vars.save(action.as, months*12);
            }

            reply(true, "Saved as months");
        });

        test.on("actions/*/:addToArray:value", function (action, reply) {
            var array = soda.vars.get(action.addToArray);
            array.push(action.value);
            soda.vars.save(action.addToArray, array);

            reply(true, "Added to array");
        });

        test.on("actions/*/:truncate", function (action, reply) {
            var toTruncate = soda.vars.get(action.truncate);

            if (toTruncate) {
              soda.vars.save(action.truncate, Math.trunc(toTruncate));

              reply(true, "Truncated");
            }
        });
    });

    // Add a custom callback for test results
    soda.runner.on("results", function (res, test, msg) {
      var result = {};
      result.totaltests = res.totalTests;
      result.failed = (res.stopped ? 0 : res.resultBool === true ? 0 : 1);
      result.passed = res.resultBool === true ? 1: 0;
      result.stopped = result.totaltests-(result.passed+result.failed);
      result.failureMessages = (res.resultBool === false ? [res.reason] : []);
      result.subject = 'sODA Testing Report';
      result.message = (res.resultBool === false ? "Failed" : "Passed");
      result.suite = soda.config.get("suite");
      result.module = soda.config.get("module");
      result.test = test.humanName;
      result.platform = soda.config.get("platform");
      result.description = test.description;
      result.user = res.user;
      result.failureid = res.failureId;
      result.filename = test.getPath();
      result.id = test.id;
      result.name = test.name;
      result.screenShot = res.screenShot;
      result.trace = res.trace;
      result.reason = res.reason;
      result.artifacts = null;

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

          console.log(message);

          var emailer = new Emailer(soda);

          if (soda.config.get("sendTestResults")) {
            emailer.sendTestReport(result);
          }

          var ssDest = (soda.config.get("resultsHTML") || "")
              .replace(/\[test_path]/g, soda.config.get("testResultsPath").withoutTrailingSlash)
              .replace(/\[test_results_dir]/g, soda.config.get("testResultsDir"))
              .replace(/\[type]/g, "test_"+result.test);

          fsPromises.mkdir(ssDest.substring(0, ssDest.lastIndexOf(nodePath.sep)), { recursive: true}).then( made => {
            fs.writeFile(ssDest, emailer.getTestReport(result), function (err) {
                if(err) {
                    soda.console.error("Unable to write report file:", err.message);
                }
            });
          });
    });

    soda.runner.on("module results", function(res, moduleFailureMessages) {
      var result = {};
      result.failureMessages = (moduleFailureMessages.length > 0) ? moduleFailureMessages : [];
      result.subject = 'sODA Testing Report';
      result.suite = soda.config.get("suite");
      result.module = soda.config.get("module");
      result.test = "";
      result.platform = soda.config.get("platform");
      result.started = res.started;
      result.duration = res.duration;
      result.totaltests = res.totalTests;
      result.run = res.run;
      result.passed = res.passed;
      result.failed = res.failed;
      result.stopped = parseInt(res.totalTests)-(parseInt(res.passed)+parseInt(res.failed));
      result.artifacts = res.artifacts;

      var message =
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

          console.log(message);

          var emailer = new Emailer(soda);

          if (soda.config.get("sendModuleResults")) {
            emailer.sendModuleReport(result);
          }

          var ssDest = (soda.config.get("resultsHTML") || "")
              .replace(/\[test_path]/g, soda.config.get("testResultsPath").withoutTrailingSlash)
              .replace(/\[test_results_dir]/g, soda.config.get("testResultsDir"))
              .replace(/\[type]/g, "module_"+result.module);

          fsPromises.mkdir(ssDest.substring(0, ssDest.lastIndexOf(nodePath.sep)), { recursive: true}).then( made => {
            fs.writeFile(ssDest, emailer.getModuleReport(result), function (err) {
                if(err) {
                    soda.console.error("Unable to write report file:", err.message);
                }
            });
          });
    });

    soda.runner.on("suite results", function(res, suiteFailureMessages) {
      var result = {};
      result.failureMessages = (suiteFailureMessages.length > 0) ? suiteFailureMessages : [];
      result.subject = 'sODA Testing Report';
      result.suite = soda.config.get("suite");
      result.module = "";
      result.test = "";
      result.platform = soda.config.get("platform");
      result.started = res.started;
      result.duration = res.duration;
      result.totalmodules = res.totalModules;
      result.totaltests = res.totalTests;
      result.run = res.run;
      result.passed = res.passed;
      result.failed = res.failed;
      result.stopped = parseInt(res.totalTests)-(parseInt(res.passed)+parseInt(res.failed));
      result.artifacts = res.artifacts;

      var message =
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

          console.log(message);

          var emailer = new Emailer(soda);

          if (soda.config.get("sendSuiteResults")) {
              emailer.sendSuiteReport(result);
          }

          var ssDest = (soda.config.get("resultsHTML") || "")
              .replace(/\[test_path]/g, soda.config.get("testResultsPath").withoutTrailingSlash)
              .replace(/\[test_results_dir]/g, soda.config.get("testResultsDir"))
              .replace(/\[type]/g, "suite");

          fsPromises.mkdir(ssDest.substring(0, ssDest.lastIndexOf(nodePath.sep)), { recursive: true}).then( made => {
            fs.writeFile(ssDest, emailer.getSuiteReport(result), function (err) {
                if(err) {
                    soda.console.error("Unable to write report file:", err.message);
                }
            });
          });
    });
};
