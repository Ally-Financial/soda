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
 * The Soda Command Line Launcher
 * @module Sodac
 */

/**
 * The main entry point into the Simple Object Driven Automation framework
 */

var Sodac = function main () {
    process.title = "Soda";

    var path     = require("path"),
        minimist = require("minimist"),
        Soda     = require(path.join(__dirname, "index")),
        pkgInfo  = require(path.join(__dirname, "package.json")),
        os       = require("os"),
        fs       = require("fs"),
        Trace    = require(path.join(__dirname, "SodaCore", "lib", "Classes", "Trace")),
        Server             = require(path.join(__dirname, "SodaVisualEditor", "lib", "Server")),
        visualEditorEvents = require(path.join(__dirname, "SodaVisualEditor", "lib", "VisualEditorEvents")),
        args = minimist(process.argv.slice(2), {
            string  : ['test', 'suite', 'module', 'action']
        }),

        command = args._.shift(),
        vesStarted         = {};

    /**
     * @composes Soda
     */
    var y = new Soda({
        logSupressed : args.o === true ? args.o : args.o === 'false' || args.o === 0 || args.o === false ? false : undefined,
        logColors    : args.c === true ? args.c : args.c === 'false' || args.c === 0 || args.c === false ? false : undefined,
        logDebug     : args.d === true ? args.d : args.d === 'false' || args.d === 0 || args.d === false ? false : undefined,
        logVerbose   : args.v === true ? args.v : args.v === 'false' || args.v === 0 || args.v === false ? false : undefined,
        resetDevice  : args.r === true ? args.r : args.r === 'false' || args.r === 0 || args.r === false ? false : undefined,
        devMode      : args.z === true ? args.z : args.z === 'false' || args.z === 0 || args.z === false ? false : undefined,

        proxy     : args.y,
        platform  : args.x,
        suite     : args.s,
        module    : args.m,
        framework : args.f,
        port      : args.p,
        env       : args.e,
        testPath  : args.t,
        testResultsPath : args.a ? args.a: process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'],
        failureDistro: args.b,
        updateSource: args.uc ? args.uc: false,
        perfectoUser: args.puser ? args.puser: '',
        perfectoPassword: args.ppassword ? args.ppassword: '',
        testURL: args.testurl ? args.testurl: 'about:blank',
        applitoolsAPIKey: args.applikey ? args.applikey: '',
        variableExcelFile: args.varexcelfile ? args.varexcelfile: null,
        variableJSONFile: args.varjsonfile ? args.varjsonfile: null,
        headless: args.headless ? args.headless: false,
        perflog: args.perflog ? args.perflog: false,
        editor: args.editor ? args.editor: false,
        testResultsDir: args.u ? args.u : "test-results",
        clean: args.clean ? args.clean: false,
        sodauser: args.sodauser ? args.sodauser: 'devsoda',
        command   : command,

        alias     : "SodaCLI"
    });

    y.init(function onInitComplete (err, soda) {
        if(err) throw err;

        console.log(
           "----------------------------------------------------------------   \n" +
           "            _________            .___                      \n" +
           "           /   _____/  ____    __| _/_____                 \n" +
           "           \\_____  \\  /  _ \\  / __ | \\__  \\             \n" +   
           "           /        \\(  <_> )/ /_/ |  / __ \\_              \n" +
           "          /_______  / \\____/ \\____ | (____  /              \n" +
           "                  \\/              \\/      \\/               \n" +                                          
           "----------------------------------------------------------------   \n" +
           "                                                                   \n" +
           "             'Testing is simple, do it!'                           \n" +
           "                                                                   \n" +
           "                                                                   \n" +
           "                     ────────────                                  \n" +               
           "                     │          │                                  \n" +                                       
           "                     │          │                                  \n" +              
           "                     │   ┬───   │                                  \n" +              
           "                     │   │      │                                  \n" +               
           "                     │   └──┐   │                                  \n" +               
           "                     │      │   │                                  \n" +               
           "                     │   ───┴   │                                  \n" +               
           "                     │          │                                  \n" +                                         
           "                     │          │                                  \n" +               
           "                     ────────────                                  \n" +               
           "                                                                   \n" +
           "                                                                   \n" +     
           "----------------------------------------------------------------   \n" +
           "                                                                   \n" +
           " Soda v" + pkgInfo.version + " initialized on `"        +
           os.type().toLowerCase()    + "`\n"                       +
           "----------------------------------------------------------------   \n"
       );

        switch(command) {
            case "run":
                args._.push(function (err) {
                    if(err) {
                        soda.console.error(err.message);
                        process.exit(1);
                    }
                    soda.config.set("interactiveMode", false);

                    if (args.b) {
                        soda.config.set("failureDistro", args.b.split(','));
                    }

                    soda.cleanTestResults(args.t, function(err) {
                      if (err) {
                          soda.console.error(err.toString());
                      }

                      soda.loadAssets(args.t, function (err) {
                          if(err) {
                              soda.console.error(err.toString());
                              process.exit(1);
                          }

                          soda.console.debug('COMPLETED LOADING SCRIPTS');

                          var finalFunction = function (err, result) {
                            var finalAction = function() {
                              if(err) {
                                  soda.console.error(err.message);

                                  setTimeout(function() {
                                    console.log("Pausing before close to allow for email to send...");
                                    soda.framework.stop(function(err, result) {
                                      process.exit(1);
                                    });
                                  }, 10000);
                              }
                              else if (result.failed > 0){
                                setTimeout(function() {
                                  console.log("Pausing before close to allow for email to send...");
                                  console.log("One or more tests failed");
                                  console.log(result);
                                  soda.framework.stop(function(err, result) {
                                    process.exit(1);
                                  });
                                }, 10000);
                              }
                              else {
                                  setTimeout(function() {
                                    console.log("Pausing before close to allow for email to send...");
                                    soda.framework.stop(function(err, result) {
                                      process.exit(0);
                                    });
                                  }, 10000);
                              }
                            };

                            finalAction();
                          };

                          soda.console.debug(soda.config.get("variableJSONFile"));

                          if (soda.config.get("variableJSONFile")) {
                            var allVariables = [];

                            if (soda.config.get("variableJSONFile")) {
                              allVariables = JSON.parse(fs.readFileSync(soda.config.get("variableJSONFile"), 'utf8'));
                            }

                            var runTest = function(variableArray, count) {
                              var eachVariable = variableArray[count];
                              var localCount = count + 1;

                              soda.runner.run(
                                  {
                                      suite  : eachVariable.suite,
                                      module : eachVariable.module,
                                      test   : eachVariable.test,
                                      action : eachVariable.action
                                  },
                                  function (err, result) {
                                    if (localCount < variableArray.length) {
                                      runTest(variableArray, count + 1);
                                    }
                                    else {
                                      finalFunction(err, result);
                                    }
                                  }
                              );
                            };

                            runTest(allVariables, 0);
                          }
                          else {
                            soda.runner.run(
                                {
                                    suite  : args.suite  || args.s,
                                    module : args.module || args.m,
                                    test   : args.test,
                                    action : args.action
                                },
                                finalFunction
                            );
                          }
                        });
                    });
                });

                soda.framework
                    .load(args.f)
                    .start.apply(soda.framework, args._);
                break;

            case "build":
                if (args.q) {
                    soda.config.set("updateSource", args.q === 'true');
                }
                else {
                    soda.config.set("updateSource", false);
                }

                args._.push(function () { process.exit(0); });
                soda.framework
                    .load(args.f)
                    .build.apply(soda, args._);
                break;

            case "upload":
                args._.push(function () { process.exit(0); });
                soda.framework
                    .load(args.f)
                    .upload.apply(soda, args._);
                break;

            case "reset":
                args._.push(function (err) {
                    if(err) {
                        soda.console.error(err);
                        process.exit(1);
                    }
                    else {
                        process.exit(0);
                    }
                });

                soda.framework
                    .load(args.f)
                    .reset.apply(soda, args._);
                break;

            case "runtrace":
                if(args._.length > 0) {
                    var traceFile = args._[0];
                    fs.readFile(traceFile, function (err, contents) {
                        if(err) {
                            soda.console.error(err.message);
                            process.exit(1);
                        }
                        else {
                            contents = contents.toString('utf-8');
                            console.log("Running trace file " + traceFile  + "...");

                            Trace.run(contents, soda, function (err) {
                                if(err) {
                                    soda.console.error(err);
                                    soda.console.warn("*** Trace run terminated due to failure ***");
                                    process.exit(1);
                                }
                                else {
                                    soda.console.pass("Trace run successfully completed!");
                                    process.exit(0);
                                }
                            });
                        }
                    });
                }
                else {
                    soda.console.error("Missing argument #0: `traceFile`");
                }
                break;

            case "repl":
                /**
                 * @composes REPL
                 * @memberof module.Sodac.Sodac
                 */
                var repl = require("./REPL");
                args._.push(function (err) {
                    if(err) {
                        soda.console.error(err.message);
                        process.exit(1);
                    }
                    repl.init(soda, soda.config.get("console"));
                });

                soda.config.set('variableExcelFile', args.varexcelfile ? args.varexcelfile: null);
                soda.config.set('variableJSONFile', args.varjsonfile ? args.varjsonfile: null);
                soda.config.set('testURL', args.testurl);
                soda.config.set('headless', args.headless ? args.headless: false);
                soda.config.set('editor', args.editor ? args.editor: false);
                soda.config.set('perflog', args.perflog ? args.perflog: false);

                if(args.t) {
                    soda.cleanTestResults(args.t, function(err) {
                      if (err) {
                          soda.console.error(err.toString());
                      }

                      soda.loadAssets(args.t, function (err) {
                          if(err) {
                              soda.console.error(err.toString());
                              process.exit(1);
                          }

                          soda.console.debug('COMPLETED LOADING SCRIPTS');

                          if(typeof args.f === "string") {
                              soda.framework
                                  .load(args.f)
                                  .start.apply(soda.framework, args._);
                          }
                          else {
                              repl.init(soda, soda.config.get("console"));
                          }

                          if (args.editor) {

                            var server = new Server(soda, true, true);
                            server
                                .add(visualEditorEvents(server, repl, soda, function (err) { if(err) throw err; }))
                                .start(args.p, function () {
                                    vesStarted[soda.yid] = server;
                                    soda.console.warn("*** Visual Editor for " + (soda.alias ? soda.alias : "Soda #" + soda.yid) + " started on port " + server.port + " ***");
                                })
                                .on("stop", function () {
                                    vesStarted[soda.yid] = null;
                                    delete vesStarted[soda.yid];
                                    soda.console.warn("Visual Editor for " + (soda.alias ? soda.alias : "Soda #" + soda.yid) + " stopped");
                                });
                          }
                      });
                    });
                }
                else {
                    repl.init(soda, soda.config.get("console"));
                }
                break;

            default:
                throw new soda.exception.SodaError("Unknown CLI directive `" + command + "`");
        }
    });
};

Sodac(); // jshint ignore:line
