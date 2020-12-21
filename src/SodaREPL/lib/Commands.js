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
 * @module SodaREPL/Commands
 * @description A callback which add listeners to listen for for all Soda-based REPL commands
 */

var nodePath           = require("path"),
    Server             = require(nodePath.join("..", "..", "SodaVisualEditor", "lib", "Server")),
    visualEditorEvents = require(nodePath.join("..", "..", "SodaVisualEditor", "lib", "VisualEditorEvents")),
    exec               = require(nodePath.join("..", "..", "SodaCommon", "Exec")),
    Trace              = require(nodePath.join("..", "..", "SodaCore", "lib", "Classes", "Trace")),
    fs                 = require("fs"),
    vesStarted         = {},
    traces             = {};

module.exports = function (soda, repl) {

    // Start the VisualEditor
    repl.addCommand("repl-start-ve", "ve|Ve|startve", function () {
        if(!vesStarted[soda.yid]) {
            var url_prefix = 'http';

            if (fs.existsSync(nodePath.join(__dirname, "..", "..", "server.cert")) && fs.existsSync(nodePath.join(__dirname, "..", "..", "server.key"))) {
                url_prefix = 'https'
            }

            var server = new Server(soda, true, true);
            server
                .add(visualEditorEvents(server, repl, soda, function (err) { if(err) throw err; }))
                .start(function () {
                    vesStarted[soda.yid] = server;
                    soda.console.warn("*** Visual Editor for " + (soda.alias ? soda.alias : "Soda #" + soda.yid) + " started on port " + server.port + " ***");
                    repl.prompt();
                    exec.openBrowser(url_prefix+'://localhost:' + server.port + '/');
                })
                .on("stop", function () {
                    vesStarted[soda.yid] = null;
                    delete vesStarted[soda.yid];
                    soda.console.warn("Visual Editor for " + (soda.alias ? soda.alias : "Soda #" + soda.yid) + " stopped");
                });
        }
        else {
            soda.console.warn("Visual Editor for " + (soda.alias ? soda.alias : "Soda #" + soda.yid) + " is already listenting on port " + vesStarted[soda.yid].port + "!");
        }
    }, true, true);

    // Stop the VisualEditor
    repl.addCommand("repl-stop-ve", "ves|Ves|stopve", function () {
        if(vesStarted[soda.yid]) {
            vesStarted[soda.yid].stop();
            vesStarted[soda.yid] = null;
            delete vesStarted[soda.yid];
        }
        else {
            soda.console.warn("No visual editors started for " + (soda.alias ? soda.alias : "Soda #" + soda.yid) + " to stop!");
        }
    }, false, true);

    // Start/stop a new trace
    repl.addCommand("start-stop-trace", "trace", function (code, args) {
        if(!traces[soda.yid]) {
            traces[soda.yid] = new Trace(soda);
            console.log("Starting new interaction trace. Enter command `trace` again to stop and write the trace.");
            traces[soda.yid].start();
        }
        else {
            traces[soda.yid].stop();
            var fn = nodePath.join(soda.config.get("userHome"), (typeof args[0] === "string" ? args[0].replace(/\.json$/, '') : "trace" + Date.now()) + ".json");
            console.log("Trace stopped. Writing trace file to:", fn);

            try {
                fs.writeFile(fn, JSON.stringify(traces[soda.yid].get(), null, '    '), function (err) {
                    if(err) soda.console.error(err);
                });
            }
            catch (e) {
                soda.console.error("Unable to write trace file:", e.message);
            }
            traces[soda.yid] = null;
            delete traces[soda.yid];
        }
    }, false, true);

    // List the attached Soda processes
    repl.addCommand("repl-list-sodas", "sodas", function () {
        repl.listSodas();
    }, false, false);

    // List available modules
    repl.addCommand("ls-modules", "lsm|Lsm", function () {
        soda.assets.get(soda.config.get("testPath"), function (err, collection) {
            var modules = [];
            if(err) return soda.console.error("There was an error trying retrieve assets!");
            var sus = collection.getAllModules();
            sus.sodaeach(function (s) {
                s.sodaeach(function (m) {
                    modules.push({
                        name    : m.name,
                        suite   : m.suite.name,
                        ignored : m.ignore
                    });
                });
            });
            modules.sort(function (a, b) { return a.name < b.name ? -1 : a.name > b.name ? 1 : 0; });
            console.log(modules);
            modules = null;
        });
    }, false, true);

    // List available suites
    repl.addCommand("ls-suites", "ls|Ls", function () {
        soda.assets.get(soda.config.get("testPath"), function (err, collection) {
            var suites = [];
            if(err) return soda.console.error("There was an error trying retrieve assets!");
            var sus = collection.getAllSuites();
            sus.sodaeach(function (s) { suites.push(s.name); });
            suites.sort(function (a, b) { return a < b ? -1 : a > b ? 1 : 0; });
            console.log(suites);
            suites = null;
        });
    }, false, true);

    // Switch to a Soda process
    repl.addCommand("repl-switch-to-soda", "soda", function (code, args) {
        repl.switchToSodaUsingYid(args[0]);
    }, false, false);

    // Prints the assets hierarchy
    repl.addCommand("soda-hierarchy", "lt|h|hierarchy", function (code, args) {
        soda.assets.get(args[0] || soda.config.get("testPath"), function (err, assets) {
            if(err) {
                soda.console.error(err);
            }
            else {
                console.log(assets.getHierarchy());
            }
            repl.prompt();
        });
    }, true, true);

    // Resolve a variable string
    repl.addCommand("check-vars", "pv|cv|Pv|Cv|rv|Rv", function replaceVariables (code, args) {
        var re   = soda.config.get("variableFormat")  || soda.config.get("defaultVariableFormat"), m, v = args[0],
            func = soda.config.get("variableOnMatch") || soda.config.get("defaultVariableMatch");

        if(re) {
            re.exec("");
            while (m = re.exec(v)) { // jshint ignore:line
                v = func(soda.vars, m, v);
            }

            re.exec("");
            if(re.test(v) === true) {
                v = replaceVariables(null, [v]);
            }
        }

        console.log(":=", v);
        return v;
    }, false, true);

    // Change platforms
    repl.addCommand("stdlib—ipad", "ipad", function () {
        soda.config.set("platform", "ipad");
        console.log("Platform changed to `ipad`");
    }, false, false);

    // Change platforms
    repl.addCommand("stdlib—iphone", "iphone", function () {
        soda.config.set("platform", "iphone");
        console.log("Platform changed to `iphone`");
    }, false, true);

    // Change platforms
    repl.addCommand("stdlib—android", "aphone", function () {
        soda.config.set("platform", "android");
        console.log("Platform changed to `android`");
    }, false, true);

    // Change platforms
    repl.addCommand("stdlib—androidtab", "atab", function () {
        soda.config.set("platform", "androidtab");
        console.log("Platform changed to `androidtab`");

    }, false, true);

    // Change platforms
    repl.addCommand("stdlib—web", "web", function () {
        soda.config.set("platform", "web");
        console.log("Platform changed to `web`");

    }, false, true);

    // Change platforms
    repl.addCommand("stdlib—win", "win", function () {
        soda.config.set("platform", "windows");
        console.log("Platform changed to `windows`");

    }, false, true);

    // Change env
    repl.addCommand("stdlib—env", "env", function (code, args) {
        if(args[0]) {
            soda.config.set("env" , args[0]);
            soda.vars.save("_env_", args[0], true, false, false);
            console.log("Environment variable changed to: `" + args[0] + "`");
        }
    }, false, true);

    // Run test command
    repl.addCommand("test-runner-run", "r|R|run", function (code, args) {
        var type = args[0], options = {};

        switch(type) {
            case "test":
                options.test   = args[1];
                options.module = args[2];
                options.suite  = args[3];
                break;

            case "action":
                options.action = args[1];
                options.module = args[2];
                options.suite  = args[3];
                break;

            case "module":
                options.module = args[1];
                options.suite  = args[2];
                break;

            case "suite":
                options.suite  = args[1];
                break;

            default:
                soda.console.error("Unexpected run type `" + type + "`, run aborted.");
                return;
        }

        soda.runner.run(options, function (err) {
            if(err) soda.console.error("Run failed:", err.message);
            repl.prompt();
        });
    }, false, true);

    // Dump command
    repl.addCommand("soda-dump", "yd|Yd|dump", function (code, args) {
        args    = args.slice(0, 2);
        args[0] = soda.vars.get(args[0]); // jshint ignore:line

        args.push(function (err, path) {
            if(err) {
                soda.console.error(err.message);
            }
            else {
                console.log("Contents dumped to `" + path + "`");
            }
        });
        soda.dump.apply(soda, args);
    }, true, true);

    // Set test variables
    repl.addCommand("soda-set-var", "v|V|var", function (code, args) {
        if(args[1]) {
            soda.vars.save(args[0].toString(), args[1], !!args[2] || true, !!args[3] || true);
            console.log(":=", args[1]);
        }
        else {
            console.log(":=", soda.vars.get(args[0]));
        }

    }, true, true);

    // Set test path
    repl.addCommand("soda-test-path", "tp|Tp|testpath", function (code, args) {
        if(args[0]) {
            soda.config.set("testPath", args[0]);
            console.log(":=", args[0]);
        }
        else {
            console.log(":=", soda.config.get("testPath"));
        }

    }, true, true);

    // Set test result path
    repl.addCommand("soda-test-result-path", "trp|Trp|testresultpath", function (code, args) {
        if(args[0]) {
            soda.config.set("testResultsPath", args[0]);
            console.log(":=", args[0]);
        }
        else {
            console.log(":=", soda.config.get("testResultsPath"));
        }

    }, true, true);

    // Add the :load command
    repl.addCommand("assets-load", "l|L|load", function (code, args) {
        // Load new assets, if an argument is provided
        if(typeof args[0] === "string") {
            console.log("Loading assets at path `" + args[0] + "`");
            soda.assets.load(args[0], function (err) {
                if(err) {
                    soda.console.error(err);
                }
                else {
                    code(0, "Assets at path `" + args[0] + "` loaded!");
                }
            });
        }
        // Load the previouly loaded assets path
        else if(soda.assets.current) {
            console.log("Reloading assets at path `" + soda.assets.current.path + "`");
            soda.assets.reload(soda.assets.current.path, function (err) {
                if(err) {
                    soda.console.error(err);
                }
                else {
                    code(0, "Assets for path `" + soda.assets.current.path + "` reloaded!");
                }
            });
        }
        // Load the currently configured testPath
        else if(soda.config.get("testPath")) {
            console.log("Reloading assets at path `" + soda.config.get("testPath") + "`");
            soda.assets.reload(soda.config.get("testPath"), function (err) {
                if(err) {
                    soda.console.error(err);
                }
                else {
                    code(0, "Assets for path `" + soda.config.get("testPath") + "` reloaded!");
                }
            });
        }
        // No assets previously loaded, or arguments provided
        else {
            code(1, "No path specified, nor assets loaded.");
        }
    }, true, true);

    // Add the :suite command
    repl.addCommand("testing-change-suite", "s|S|suite", function (code, args) {
        if(typeof args[0] === "string") {
            soda.config.set("suite", args[0]);
            console.log("Suite changed to `" + soda.config.get("suite") + "`");
        }
        else {
            console.log("Current suite is:", soda.config.get("suite"));
        }
    }, true, true);

    // Add the :module command
    repl.addCommand("testing-change-module", "m|M|module", function (code, args) {
        if(typeof args[0] === "string") {
            soda.config.set("module", args[0]);
            console.log("Module changed to `" + soda.config.get("module") + "`");
        }
        else {
            console.log("Current module is:", soda.config.get("module"));
        }
    }, true, true);

    // Add the :platform command
    repl.addCommand("testing-change-platform", "x|X|platform", function (code, args) {
        if(typeof args[0] === "string") {
            soda.config.set("platform", args[0]);
            console.log("Platform changed to `" + soda.config.get("platform") + "`");
        }
        else {
            console.log("Current platform is:", soda.config.get("platform"));
        }
    }, true, true);

    // Quit the REPL and shutdown the program
    repl.addCommand("framework-quit", "q|quit|exit", function (code) {
        console.log("Closing REPL Interface");
        
        if (Object.keys(vesStarted).length > 0) {
            for (var i = 0; i < Object.keys(vesStarted).length; i++) {
                var server = vesStarted[Object.keys(vesStarted)[i]];
                server.stop(function(err, res) {
                    if (i === Object.keys(vesStarted).length) {
                        soda.framework.stop(function () { 
                            code(99, "REPL Interface Closed"); 
                            soda.assets.destroy(); 
                            repl.kill(function(res) {
                                process.exit(1);
                            });
                        });
                    }
                });
            }
        }
        else {
            soda.framework.stop(function () { 
                code(99, "REPL Interface Closed"); 
                soda.assets.destroy();
                repl.kill(function(res) {
                    process.exit(1);
                });
            });
        }
    }, true, true);

    // Load a framework
    repl.addCommand("framework-load-framework", "fload|load framework", function (code, args) {
        if(args[0] && args[0] !== "") {
            soda.framework.load(args[0]);
        }
        else {
            soda.console.error("Expected a framework name, but got 0 arguments...");
        }
    }, true, true);

    // Stop the currently running framework
    repl.addCommand("framework-stop-framework", "fstop|stop framework", function () {
        soda.framework.stop(function () { repl.prompt(); });
    }, true, true);

    // Start a framework
    repl.addCommand("framework-start-framework", "fstart|start framework", function (code, args) {
        args.push(function () { repl.prompt(); });
        soda.framework.start.apply(soda.framework, args);
    }, true, true);

    // Restart the current framework
    repl.addCommand("framework-restart-framework", "frestart|restart framework", function (code, args) {
        args.push(function () { repl.prompt(); });
        soda.framework.restart.apply(soda.framework, args);
    }, true, true);

    // Print the current element tree
    repl.addCommand("framework-print-element-tree", "p|P|print", function () {
        soda.framework.getTree(function (err, tree) {
            if(err) {
                soda.console.error(err);
            }
            else {
                tree.print();
            }
            repl.prompt();
        });
    }, true, true);

    // Get a refreshed element tree, and set a variable to the elements object
    repl.addCommand("framework-get-elements", "e|E|elements", function () {
        soda.framework.getTree(function (err, tree) {
            if(err) {
                soda.console.error(err);
            }
            else {
                console.log("Variable `e` set to the elements object");
                repl.evalSafe.set("e", tree.elements());
                repl.evalSafe.set("elements", tree.elements());
                repl.prompt();
            }
        });
    }, true, true);

    // Help for the program
    repl.addCommand("framework-help", "h|help", function () {
        console.log("soda.vars.get\n\tDefinition:\n\t\tGets a test variable\n\tParameters:\n\t\t{string} variable\n\tExample usage:\n\t\tsoda.vars.get(\"_env_\")\n");
        console.log("soda.vars.save\n\tDefinition:\n\t\tSets a testing variable with name value either in current scope, persistent between tests or globally persistent\n\tParameters:\n\t\t{string} name\n\t\t{string} value\n\t\t{boolean=} persistent\n\t\t{boolean=} global\n\tExample usage:\n\t\tsoda.vars.save(\"myvar\", \"1\")\n\t\tsoda.vars.save(\"myvar\", \"1\", true)\n\t\tsoda.vars.save(\"myvar\", \"1\", true, true)\n");
        console.log("soda.config.get\n\tDefinition:\n\t\tGet a configuration variable’s value\n\tParameters:\n\t\t{string} name\n\tExample usage:\n\t\tsoda.config.get(\"findElementRetries\")\n");
        console.log("soda.config.set\n\tDefinition:\n\t\tSet a configuration variable\n\tParameters:\n\t\t{string} name\n\t\t{*} value\n\tExample usage:\n\t\tsoda.config.set(\"myvar\", \"1\")\n\t\tsoda.config.set(\"findElementRetries\", \"3\")\n");
        console.log("soda.config.delete\n\tDefinition:\n\t\tDelete a configuration variable\n\tParameters:\n\t\t{string} name\n\tExample usage:\n\t\tsoda.config.delete(\"findElementRetries\")");
        console.log("soda.assert\n\tDefinition:\n\t\tContains an assertion library, the methods of soda.assert can be called individually\n\tExample usage:\n\t\tsoda.assert\n");
        console.log("soda.framework\n\tDefinition:\n\t\tManages the loading/starting/stopping of frameworks\n\tExample usage:\n\t\tsoda.framework.load(\"instruments\")\n\n\t\tsoda.framework.start(\"iPhone 6s 10.1\", \"~/Source/Application.app\", \"com.myapp.app\", \"~/Source/automation-scripts\", {})\n\t\tsoda.framework.stop()\n");
        console.log("soda.runner\n\tDefinition:\n\t\tRuns test/actions/suites/modules\n");
        console.log("ve|Ve|startve\n\tDefinition:\n\t\tStarts the visual editor\n\tExample usage:\n\t\t:ve\n");
        console.log("ves|Ves|stopve\n\tDefinition:\n\t\tStops the visual editor\n\tExample usage:\n\t\t:ves\n");
        console.log("trace\n\tDefinition:\n\t\tStarts or stops a new trace, which provides a trace of all element/device interactions from the time the trace was started. The trace will continue logging, until :trace is entered again. On the second call, an optional path parameter is available to specify where to save the trace file relative to your home folder. If no path is specified, it defaults to the user home directory.\n\tParameters:\n\t\t{string} filename\n\tExample usage:\n\t\t:trace \"~/traces/mytrace.trace\"");
        console.log("sodas\n\tDefinition:\n\t\tLists all Soda instances attached to this REPL instance\n\tExample usage:\n\t\t:sodas\n");
        console.log("soda\n\tDefinition:\n\t\tSwitches REPL stdin control to the Soda instance tied to the integer\n\tParameters:\n\t\t{integer} soda\n\tExample usage:\n\t\t:soda 0\n");
        console.log("lsm|Lsm\n\tDefinition:\n\t\tLists the available modules\n\tExample usage:\n\t\t:lsm\n");
        console.log("ls|Ls\n\tDefinition:\n\t\tLists the available suites\n\tExample usage:\n\t\t:ls\n");
        console.log("lt|h|hierarchy\n\tDefinition:\n\t\tPrints the assets hierarchy\n\tExample usage:\n\t\t:h\n");
        console.log("pv|cv|Pv|Cv|rv|Rv\n\tDefinition:\n\t\tResolve a variable string\n\tParameters:\n\t\t{string} variable\n\tExample usage:\n\t\t:pv findElementRetries\n");
        console.log("ipad\n\tDefinition:\n\t\Sets the platform setting to iPad\n\tExample usage:\n\t\t:ipad\n");
        console.log("iphone\n\tDefinition:\n\t\Sets the platform setting to iPhone\n\tExample usage:\n\t\t:iphone\n");
        console.log("aphone\n\tDefinition:\n\t\Sets the platform setting to Android\n\tExample usage:\n\t\t:aphone\n");
        console.log("aphone\n\tDefinition:\n\t\Sets the platform setting to Android Tablet\n\tExample usage:\n\t\t:atab\n");
        console.log("web\n\tDefinition:\n\t\Sets the platform setting to web\n\tExample usage:\n\t\t:web\n");
        console.log("win\n\tDefinition:\n\t\Sets the platform setting to Windows Desktop\n\tExample usage:\n\t\t:win\n");
        console.log("env\n\tDefinition:\n\t\tSwitches environment for pipeline testing\n\tParameters:\n\t\t{string} environment\n\tExample usage:\n\t\t:env env\n");
        console.log("r|R|run\n\tDefinition:\n\t\tRuns a suite.\n\tParameters:\n\t\tsuite {string}\n\tExample usage:\n\t\t:r suite mobile\n");
        console.log("r|R|run\n\tDefinition:\n\t\tRuns a module using the current suite.\n\tParameters:\n\t\tmodule {string}\n\tExample usage:\n\t\t:r module login\n");
        console.log("r|R|run\n\tDefinition:\n\t\tRuns a test using the current suite and module.\n\tParameters:\n\t\ttest {string}\n\tExample usage:\n\t\t:r test 001\n");
        console.log("r|R|run\n\tDefinition:\n\t\tRuns an action using the current suite.\n\tParameters:\n\t\taction {string}\n\tExample usage:\n\t\t:r action 001-vars\n");
        console.log("yd|Yd|dump\n\tDefinition:\n\t\tDump any variable’s contents to file in JSON format. Outputs the file name and path. Second (optional) argument is the path to dump the contents to. If no path is specified it defaults to the user home directory.\n\tParameters:\n\t\t{string} variable_name\n\t\t{string} dump_path\n\tExample usage:\n\t\t:dump user-info ~/traces/dump.dump\n");
        console.log("v|V|var\n\tDefinition:\n\t\tSets a testing variable with name value either in current scope, persistent between tests or globally persistent\n\tParameters:\n\t\t{string} name\n\t\t{string} value\n\t\t{boolean=} persistent\n\t\t{boolean=} global\n\tExample usage:\n\t\t:v \"test\" 1\n\t\t:v \"test\" 1 true\n\t\t:v \"test\" 1 true true\n");
        console.log("l|L|load\n\tDefinition:\n\t\tLoads assets at the given path or, without a parameter, reload the current assets\n\tParameters:\n\t\t{string} asset_path\n\tExample usage:\n\t\t:l ~/Source/automation-scripts\n");
        console.log("x|X|platform\n\tDefinition:\n\t\tSets the current testing platform\n\tParameters:\n\t\t{string} platform\n\tExample usage:\n\t\t:x iphone\n\t\t:x ipad\n\t\t:x aphone\n\t\t:x atab\n\t\t:x web\n\t\t:x windows\n");
        console.log("q|quit|exit\n\tDefinition:\n\t\tIf a framework has been loaded, this will gracefully close it. If not the quit command above will be executed.\n\tExample usage:\n\t\t:q\n");
        console.log("fload|load framework\n\tDefinition:\n\t\t\"Loads\" the given framework. This doesn’t start it, but requires the module in an initializes it.\n\tParameters:\n\t\t{string} framework_name\n\tExample usage:\n\t\t:fload instruments\n\t\t:fload automator\n\t\t:fload web\n\t\t:fload windows\n");
        console.log("fstart|start framework\n\tDefinition:\n\t\tStarts the currently loaded framework; all arguments are specific to the framework.\n\tParameters:\n\t\t{*} arg_1\n\t\t{*} arg_2\n\t\t{*} arg_n\n\tExample usage:\n\t\t:fstart \"iPhone 6s 10.1\" \"~/Source/Application.app\" \"com.myapp.app\" \"~/Source/automation-scripts\" {}");
        console.log("fstop|stop framework\n\tDefinition:\n\t\t\tStop the currently running framework\n\tExample usage:\n\t\t:fstop\n");
        console.log("frestart|restart framework\n\tDefinition:\n\t\tRestarts the last framework that was started first by gracefully stopping it, then starting it with the previously used arguments\n\tExample usage:\n\t\t:frestart\n");
        console.log("p|P|print\n\tDefinition:\n\t\tRetrieves the current DOM from the framework and dumps it to the screen\n\tExample usage:\n\t\t:p\n");
        console.log("e|E|elements\n\tDefinition:\n\t\tRetrieves the current tree and then stores it to the variable e\n\tExample usage:\n\t\t:e");

    }, true, true);
};
