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
 * Manages the Test Runner Toolbox
 * @constructor
 * @extends SodaEmitter
 * @param {Soda} soda The window.Soda instance
 */
window.SodaRunner = function (soda) {
    var self        = this,
        initialized = false,
        runIds      = 0;

    // Inherit from the SodaEmitter class
    window.SodaEmitter.call(self);
    this.$runner = {};

    // A template for the "current" action, as it will be appended to the Test Monitor
    var currentTemplate = $(
        '<div class="attribute-info">' +
            '<div class="inline attribute-key">Tap</div>' +
            '<div class="inline attribute-value">Selector</div>' +
        '</div>'
    );

    /**
     * A callback for adding console output to the test monitor toolbox
     * @param  {Array} messages An array of server stdout messages
     * @return {undefined}
     */
    function testOutputPipe (messages) {
        for(var i in messages) {
            if(messages.hasOwnProperty(i)) {
                var $msg = $(messages[i]);
                if($msg.hasClass("pass") || $msg.hasClass("fail")) {
                    $("#test-output").children('li:gt(49)').remove();
                    $("#test-output").prepend('<li class="soda-test-message list-group-item">' + messages[i] + '</li>');
                }
            }
        }
    }

    /**
     * When the server returns the "running" test state
     * @return {undefined}
     */
    function onRunning () {
        self.$monitor.$testStatus.html('Running<span class="dot-dot-dot">...</span>');
        self.$monitor.$testInfo.html('<span>Testing in progress. Click <em class="fa fa-stop"></em> to stop testing, or ' +
        '<em class="fa fa-pause"></em> to pause testing.');
    }

    /**
     * Callback for when the server emits the "test start" event
     * @param  {object} data Data from the server, in regard to the current test
     * @return {undefined}
     */
    function onStart (data) {
        $(".test-monitor-test-name.attribute-value").html(data.name);
        $(".test-monitor-test-id.attribute-value").html(data.id);
        $(".test-monitor-test-desc.attribute-value").html(data.description);
        $(".test-monitor-test-module.attribute-value").html(data.module);
        $(".test-monitor-test-suite.attribute-value").html(data.suite);
        onRunning();
    }

    /**
     * Called by the below function, to build out the "current" and "last" actions on the Test Monitor
     * @param  {object} action The action object, as sent by the server
     * @param  {jQuery} $parent The parent object to append the built action to
     * @param  {Boolean} isRoot If the sub-action is at the root leve of the action, then true, false otherwise
     * @return {undefined}
     */
    function buildCurrent (action, $parent, isRoot) {
        for(var i in action) {
            if(action.hasOwnProperty(i)) {
                var $action = currentTemplate.clone();
                $action.find(".attribute-key").html(i);
                if(typeof action[i] === "object") {
                    buildCurrent(action[i], $action, false);
                }
                else {
                    $action.find(".attribute-value").html(action[i]);
                    if(isRoot) $action.addClass("root");
                    $parent.append($action);
                }
            }
        }
    }

    /**
     * When the server returns the "paused" test state
     * @param  {Error} err An exception, if one is present
     * @return {undefined}
     */
    function onPause (err) {
        if(err) return console.error(err);
        self.$monitor.$testStatus.html("Test Paused");
        self.$monitor.$testInfo.html('<span>Test Paused. Click <em class="fa fa-play"></em> to resume testing, ' +
        '<em class="fa fa-forward"></em> to skip to the next text evaluation,' +
        '<em class="fa fa-backward"></em> to repeat the last evaluation, or ' +
        '<em class="fa fa-stop"></em> to stop testing.</span>');
    }

    /**
     * When the server returns the "paused" test state
     * @param  {Error} err An exception, if one is present
     * @return {undefined}
     */
    function onStop (err) {
        if(err) return console.error(err);
        self.$monitor.$testStatus.html("Test Stopped");
        self.$monitor.$testInfo.html('<span>Test aborted.' +
        '<br><span class="show-results-tab bold">Click here to view detailed test results</span>');
    }

    /**
     * When the server returns the "failed" test state
     * @param  {Error} err An exception, if one is present
     * @return {undefined}
     */
    function onFail (err) {
        if(err) return console.error(err);
        self.$monitor.$testStatus.html("Test Failed");
        self.$monitor.$testInfo.html('<span>Test Failed. Click <em class="fa fa-eject"></em> to continue, ' +
        '<em class="fa fa-forward"></em> to skip failed evaluation, or' +
        '<em class="fa fa-backward"></em> to repeat the last evaluation</span>');
    }

    /**
     * As the server encounters new actions, it will emit the "current" event, and this callback will be invoked
     * @param  {object} action The action object, as sent by the server
     * @return {undefined}
     */
    function onCurrent (action) {
        self.$monitor.$last.empty();
        self.$monitor.$current.children().detach().appendTo(self.$monitor.$last);
        buildCurrent(action, self.$monitor.$current, true);
    }

    /**
     * Disable all next/last/skip/continue, etc. buttons
     * @return {undefined}
     */
    function disableAllButtons () {
        self.$monitor.$lastButton.addClass("disabled");
        self.$monitor.$nextButton.addClass("disabled");
        self.$monitor.$stopButton.addClass("disabled");
        self.$monitor.$pauseButton.addClass("disabled");
        self.$monitor.$skipButton.addClass("disabled");
        self.$monitor.$resumeButton.addClass("disabled");
        self.$monitor.$continueButton.addClass("disabled");
    }

    /**
     * Enables/disables test buttons, per the data returned from the server
     * @param  {object} data An object with allowable states, as returned from the server
     * @return {undefined}
     */
    function onAllow (data) {
        disableAllButtons();
        if(data.last   === true) self.$monitor.$lastButton.removeClass("disabled");
        if(data.next   === true) self.$monitor.$nextButton.removeClass("disabled");
        if(data.skip   === true) self.$monitor.$skipButton.removeClass("disabled");
        if(data.resume === true) self.$monitor.$resumeButton.removeClass("disabled");
        if(data.stop   === true) self.$monitor.$stopButton.removeClass("disabled");
        if(data.pause  === true) self.$monitor.$pauseButton.removeClass("disabled");
        if(data.end    === true) self.$monitor.$continueButton.removeClass("disabled");
    }

    /**
     * A callback for when a suite/module/test is started
     * @param  {Error} err An exception, if one is present
     * @param  {object} data The data returned from the server
     * @return {undefined}
     */
    function onTestCallback (err, data) {
        var testReferenceId = data.tid;

        soda.editor
            .enableToolbox("test-monitor")
            .disableToolbox("test-runner")
            .switchToToolbox("test-monitor");

        disableAllButtons();
        self.$monitor.$testStatus.html('Running<span class="dot-dot-dot">...</span>');

        soda.socket.on("current " + testReferenceId, onCurrent);
        soda.socket.on("running " + testReferenceId, onRunning);
        soda.socket.on("allow "   + testReferenceId, onAllow);
        soda.socket.on("paused "  + testReferenceId, onPause);
        soda.socket.on("failed "  + testReferenceId, onFail);
        soda.socket.on("stopped " + testReferenceId, onStop);
        soda.addOutputPipe(testOutputPipe);

        soda.socket.once("run results " + this, function () { // jshint ignore:line
            soda.socket.removeListener("current " + testReferenceId, onCurrent);
            soda.socket.removeListener("allow "   + testReferenceId, onAllow);
            soda.socket.removeListener("paused "  + testReferenceId, onPause);
            soda.socket.removeListener("failed "  + testReferenceId, onFail);
            soda.socket.removeListener("running " + testReferenceId, onRunning);
            soda.socket.removeListener("stopped " + testReferenceId, onStop);
            soda.removeOutputPipe(testOutputPipe);
        });
    }

    /**
     * Sorts the test menus in alphabetical order
     * @param  {jQuery} m The jQuery menu item to sort
     * @return {undefined}
     */
    function sortMenu (m) {
        var sorted = m.children();
        sorted.sort(function (a, b) {
            var aN = $(a).attr("data-sort"),
                bN = $(b).attr("data-sort");
            return aN < bN ? -1 : aN > bN ? 1 : 0;
        });
        sorted.appendTo(m);
    }

    /**
     * When a suite is clicked from the run menu this callback is invoked
     * @return {undefined}
     */
    function suiteOnClick () {
        $("#test-output").empty();

        var runId = runIds++;
        soda.send("run", { type: "suite", suite: $(this).attr("data-suite"), runId: runIds }, onTestCallback.bind(runId)); // jshint ignore:line
        soda.editor.setStatus({ which: "left", message: 'Testing in progress<span class="dot-dot-dot">...</span>' });
        soda.socket.once("run results " + runId, function (data) {
            soda.editor.enableToolbox("test-runner");
            self.emit("test results", data.results, data.message);
            self.$monitor.$testStatus.html(data.results.results);
            self.$monitor.$testInfo.html("Suite run complete. Results: " + data.results.result + '<br><span class="show-results-tab bold">Click here to view detailed results</span>');
            disableAllButtons();
            soda.editor.setStatus({ which: "left", message: 'Testing stopped' });
        });
    }

    /**
     * When a module is clicked from the run menu this callback is invoked
     * @return {undefined}
     */
    function moduleOnClick () {
        $("#test-output").empty();

        var runId = runIds++;
        soda.send("run", { type: "module", suite: $(this).attr("data-suite"), module: $(this).attr("data-module"), runId: runId }, onTestCallback.bind(runId)); // jshint ignore:line
        soda.editor.setStatus({ which: "left", message: 'Testing in progress<span class="dot-dot-dot">...</span>' });
        soda.socket.once("run results " + runId, function (data) {
            soda.editor.enableToolbox("test-runner");
            self.emit("test results", data.results, data.message);
            self.$monitor.$testStatus.html(data.results.result);
            self.$monitor.$testInfo.html("Module run complete. Results: " + data.results.result + '<br><span class="show-results-tab bold">Click here to view detailed results</span>');
            disableAllButtons();
            soda.editor.setStatus({ which: "left", message: 'Testing stopped' });
        });
    }

    /**
     * When a test is clicked from the run menu this callback is invoked
     * @return {undefined}
     */
    function testOnClick () {
        $("#test-output").empty();

        var runId = runIds++,
            // jshint ignore:start
            runObj = {
                name    : $(this).attr("data-type"),
                suite   : $(this).attr("data-suite"),
                module  : $(this).attr("data-module"),
                test    : $(this).attr("data-id"), runId: runId
            };
            // jshint ignore:end

        runObj[$(this).attr("data-type")] = $(this).attr("data-name");  // jshint ignore:line
        soda.send("run", runObj, onTestCallback.bind(runId));           // jshint ignore:line
        soda.editor.setStatus({ which: "left", message: 'Testing in progress<span class="dot-dot-dot">...</span>' });
        soda.socket.once("run results " + runId, function (data) {
            soda.editor.enableToolbox("test-runner");
            self.emit("test results", data.results, data.message);
            self.$monitor.$testStatus.html(data.results.result);
            self.$monitor.$testInfo.html("Test run complete. Results: " + data.results.result + '<br><span class="show-results-tab bold">Click here to view detailed results</span>');
            disableAllButtons();
            soda.editor.setStatus({ which: "left", message: 'Testing stopped' });
        });
    }

    /**
     * Initalized the SodaRunner object
     * @param  {object} $runner  An object containing the Run Menu HTML elements
     * @param  {object} $monitor An object containing the test monitor HTML elements
     * @return {SodaRunner} The current SodaRunner instance
     */
    this.init = function ($runner, $monitor) {

        // Setup jQuery objects...
        self.$runner  = $runner;
        self.$monitor = $monitor;

        self.$runner.$suiteTemplate  = self.$runner.self.find(".runner-run-item.suite").detach();
        self.$runner.$moduleTemplate = self.$runner.self.find(".runner-run-item.module").detach();
        self.$runner.$testTemplate   = self.$runner.self.find(".runner-run-item.test").detach();
        self.$runner.$suiteWrapper   = self.$runner.self.find("#runner-list-suites");
        self.$runner.$moduleWrapper  = self.$runner.self.find("#runner-list-modules");
        self.$runner.$testWrapper    = self.$runner.self.find("#runner-list-tests");
        self.$runner.$allWrapper     = self.$runner.self.find("#runner-list-all");
        self.$runner.$allButton      = self.$runner.self.find("#runner-options-all-button");
        self.$runner.$moduleFilter   = self.$runner.self.find("#test-filter-module");
        self.$runner.$suiteFilter    = self.$runner.self.find(".suite-filter");

        self.$monitor.$lastButton     = self.$monitor.self.find("#do-last");
        self.$monitor.$nextButton     = self.$monitor.self.find("#do-next");
        self.$monitor.$stopButton     = self.$monitor.self.find("#do-stop");
        self.$monitor.$pauseButton    = self.$monitor.self.find("#do-pause");
        self.$monitor.$skipButton     = self.$monitor.self.find("#do-skip");
        self.$monitor.$resumeButton   = self.$monitor.self.find("#do-resume");
        self.$monitor.$continueButton = self.$monitor.self.find("#do-continue");
        self.$monitor.$current        = self.$monitor.self.find("#test-monitor-current-wrapper");
        self.$monitor.$last           = self.$monitor.self.find("#test-monitor-last-wrapper");

        self.$monitor.$testStatus   = self.$monitor.self.find("#test-monitor-status");
        self.$monitor.$testInfo     = self.$monitor.self.find(".test-monitor-info-message");

        // Handle test results from the server
        soda.socket.on("start test", onStart);

        // When the "last" button is clicked perform the last action
        self.$monitor.$lastButton.click(function () {
            if(!$(this).hasClass("disabled")) soda.send("keypress", "l", function () {
                self.$monitor.$testStatus.html('Repeating Last Action<span class="dot-dot-dot"></span>');
                self.$monitor.$testInfo.html('<span>Repating the last test action.</span>');
            });
        });

        // When the "next" button is clicked perform the next action
        self.$monitor.$nextButton.click(function () {
            if(!$(this).hasClass("disabled")) soda.send("keypress", "n", function () {
                self.$monitor.$testStatus.html('Performing Next Action<span class="dot-dot-dot"></span>');
                self.$monitor.$testInfo.html('<span>Performing the next test action.</span>');
            });
        });

        // When the "stop" button is clicked stop the test
        self.$monitor.$stopButton.click(function () {
            if(!$(this).hasClass("disabled")) soda.send("keypress", "s", function () {
                self.$monitor.$testStatus.html('Stopping<span class="dot-dot-dot">...</span>');
                self.$monitor.$testInfo.html('<span>Attempting to abort test—this may take a few minutes.</span>');
            });
        });

        // When the "pause" button is clicked pause testing
        self.$monitor.$pauseButton.click(function () {
            if(!$(this).hasClass("disabled")) soda.send("keypress", "p", function () {
                self.$monitor.$testStatus.html('Pausing<span class="dot-dot-dot">...</span>');
                self.$monitor.$testInfo.html('<span>Pausing test—this may take a few moments.</span>');
            });
        });

        // When the "skip" button is clicked skip the current test action
        self.$monitor.$skipButton.click(function () {
            if(!$(this).hasClass("disabled")) soda.send("keypress", "k", function () {
                self.$monitor.$testStatus.html('Skipping<span class="dot-dot-dot">...</span>');
                self.$monitor.$testInfo.html('<span>Skipping to the next test action and evaluating.</span>');
            });
        });

        // When the "resume" button is clicked resume testing from the paused state
        self.$monitor.$resumeButton.click(function () {
            if(!$(this).hasClass("disabled")) soda.send("keypress", "r", function () {
                self.$monitor.$testStatus.html('Resuming<span class="dot-dot-dot">...</span>');
                self.$monitor.$testInfo.html('<span>Resuming test.</span>');
            });
        });

        // When the "continue" button is clicked, continue an fail the test
        self.$monitor.$continueButton.click(function () {
            if(!$(this).hasClass("disabled")) soda.send("keypress", "e", function () {
                self.$monitor.$testStatus.html('Continuing<span class="dot-dot-dot">...</span>');
                self.$monitor.$testInfo.html('<span>Continuing with test failure. Results will be available shortly.</span>');
            });
        });

        // Trigger the all button click and show the "all tests" tab
        soda.on("editor shown", function (err) {
            if(err) return console.error(err);
            soda.editor.disableToolbox("test-monitor");
            self.$runner.$allButton.trigger("click");
            $(".category-filter").trigger("change");
        });

        // When the Project Manager loads the hierarchy and builds the file system,
        // clear the run menu's for subsequent propagation
        soda.projectManager.on("build", function () {
            self.clearRunMenu();
        });

        // When the Project Manager loads the hierarchy and builds the file system,
        // as it encounters suites, we'll add the suite to the run menu...
        soda.projectManager.on("suite", function (i, obj, context) {
            var $suite,
                formalName = i.titleCase.replace(/[^a-zA-Z0-9]/g, ' ');

            $suite = self.$runner.$suiteTemplate.clone();
            $suite.attr("data-name", i);
            $suite.attr("data-sort", formalName);

            $suite.find(".r-icon").addClass("fa-folder-open-o");
            $suite.find(".r-name").html(formalName);
            $suite.find(".r-misc").html(soda.framework.testPath);

            $suite.click(suiteOnClick);
            $suite.attr("data-suite", context.suite);
            $suite.appendTo(self.$runner.$suiteWrapper);

            var $allSuite = $suite.clone();
            $allSuite.click(suiteOnClick);
            $allSuite.appendTo(self.$runner.$allWrapper);

            if(self.$runner.$suiteFilter.children('option.filter-item-' + i).length === 0)
                self.$runner.$suiteFilter.append('<option value="' + formalName + '" ' + (i === soda.framework.config.suite ? "selected" : "") + '>' + formalName + '</option>');
        });

        // When the Project Manager loads the hierarchy and builds the file system,
        // as it encounters modules, we'll add the module to the run menu...
        soda.projectManager.on("module", function (i, obj, context) {
            var $module,
                formalName       = i.titleCase.replace(/[^a-zA-Z0-9]/g, ' '),
                parentFormalName = context.suite.titleCase.replace(/[^a-zA-Z0-9]/g, ' ');

            $module = self.$runner.$moduleTemplate.clone();
            $module.attr("data-suite", context.suite);
            $module.attr("data-module", context.module);
            $module.attr("data-sort", formalName);

            $module.find(".r-icon").addClass("fa-files-o");
            $module.find(".r-name").html(formalName);
            $module.find(".r-suite").html('<span class="inline-header">Suite</span> <span class="inline-info suite">' + parentFormalName + '</span>');
            $module.click(moduleOnClick);

            if(self.$runner.$moduleFilter.children('option.filter-item-' + i).length === 0) {
                self.$runner.$moduleFilter.append('<option value="' + formalName + '">' + formalName + '</option>');
            }
                
            if(soda.framework.config.suite) {
                self.$runner.$suiteFilter.trigger("change");
            }

            $module.appendTo(self.$runner.$moduleWrapper);
            var $allModule = $module.clone();
            $allModule.click(moduleOnClick);
            $allModule.appendTo(self.$runner.$allWrapper);
        });

        // When the Project Manager loads the hierarchy and builds the file system,
        // as it encounters tests, we'll add the test to the run menu...
        soda.projectManager.on("test", function (i, obj, context, item) {
            var $test,
                formalName       = i.titleCase.replace(/[^a-zA-Z0-9]/g, ' '),
                parentFormalName = context.module.titleCase.replace(/[^a-zA-Z0-9]/g, ' '),
                suiteFormalName  = context.suite.titleCase.replace(/[^a-zA-Z0-9]/g, ' ');

            $test = self.$runner.$testTemplate.clone();
            $test.attr("data-suite", context.suite);
            $test.attr("data-module", context.module);
            $test.attr("data-sort", formalName);
            $test.attr("data-name", i);
            $test.attr("data-type", context.type);

            $test.find(".r-icon").addClass("fa-file-text-o");
            $test.find(".r-name").html(item.name ? formalName : item.baseName.titleCase);
            $test.find(".r-id").html('<span class="inline-header">Test Id</span> ' + (item.id ? item.id.titleCase : "No id"));
            $test.find(".r-description").html('<span class="inline-header">Description</span><br>' + (typeof item.description === "string" ? item.description.ucFirst : "No description"));
            $test.find(".r-module").html('<span class="inline-header">Module</span> <span class="inline-info module">' + parentFormalName + '</span>');
            $test.find(".r-suite").html('<span class="inline-header">Suite</span> <span class="inline-info suite">' + suiteFormalName + '</span>');

            $test.click(testOnClick);
            $test.appendTo(self.$runner.$testWrapper);

            var $allTest = $test.clone();
            $allTest.click(testOnClick);
            $allTest.appendTo(self.$runner.$allWrapper);
        });

        // Sort the test menus, once the project hierarchy is done being iterated over
        soda.projectManager.on("build complete", function () {
            sortMenu(self.$runner.$suiteWrapper);
            sortMenu(self.$runner.$moduleWrapper);
            sortMenu(self.$runner.$testWrapper);
            sortMenu(self.$runner.$allWrapper);
        });

        self.initialized = true;
        return self;
    };

    /**
     * Clears the run menus
     * @return {SodaRunner} The current SodaRunner instance
     */
    this.clearRunMenu = function () {
        self.$runner.$moduleFilter
            .empty()
            .prepend('<option value="all">Filter tests by module...</option>');

        self.$runner.$suiteFilter.empty();
        self.$runner.$suiteWrapper.empty();
        self.$runner.$moduleWrapper.empty();
        self.$runner.$testWrapper.empty();
        self.$runner.$allWrapper.empty();
        return self;
    };

    /**
     * Append test results to the results menu when received from the server...
     */
    self.on("test results", function (results) {
        var html   = $('<ul class="list-group"></ul>');
        for(var i in results) {
            if(results.hasOwnProperty(i) && results[i] !== undefined) {
                if(i !== "variables") {
                    $('<li class="list-group-item active"><h5 class="list-group-item-heading">' + i.toString().titleCase + '</h4><p class="list-group-item-text">' + results[i].toString().replace(/\n/g, '<br />') + '</p></li>').appendTo(html);
                }
                else {
                    var item;
                    try {
                        item = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(results[i], null, '   '));
                        $('<li class="list-group-item active"><h5 class="list-group-item-heading">' + i.toString().titleCase + '</h4><p class="list-group-item-text"><a target="_blank" href="' + item + '" download="' + i + '.json">' + "Download " + i + '</a></p></li>').appendTo(html);
                    }
                    catch (e) {
                        console.error(e);
                    }
                }
            }
        }
        $("#soda-results-history").prepend(html);
    });
};
