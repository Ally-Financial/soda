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
 * @module VisualEditorLauncher
 */

/**
 * Launches the SodaVisualEditor
 */
function VisualEditorLauncher() {
    process.title = "SodaVisualEditor";

    var path               = require("path"),
        SodaConfig         = require(path.join(__dirname, "AWSSodaConfig")),
        Soda               = require(path.join(__dirname, "index")),
        Server             = require(path.join(__dirname, "SodaVisualEditor", "lib", "Server")),
        visualEditorEvents = require(path.join(__dirname, "SodaVisualEditor", "lib", "VisualEditorEvents")),
        repl               = require(path.join(__dirname, "SodaREPL")),
        server;

    /**
     * @composes Server
     * @composes VisualEditorEvents
     */

    var y = new Soda(SodaConfig.SODA.OPTIONS);

    y.on('pre init', function(soda) {
        // Set log4js
        soda.config.set('log4js', false);

        // Set the soda platform
        soda.config.set('platform', 'web');
        
        // Ignore file updates
        soda.config.set('ignoreFileChanges', true);
        
        // Sets devMode (If true, test results, test traces, and failure screenshots will be written to disk).
        soda.config.set('devMode', SodaConfig.SODA.DEV_MODE);

        // Prevent 'interactiveMode', or waiting for keypresses on test failures
        soda.config.set('interactiveMode', false);

        // Sets the default number of findElementRetries
        soda.config.set('findElementRetries', SodaConfig.SODA.FIND_ELEMENT_RETRIES);

        // Prevents Soda from overwriting the process title
        soda.config.set('noTitle', true);
        
        // Sets the Soda temp path for this instance
        soda.config.set('temp', path.join(SodaConfig.APP_DATA, 'scantemp'));

        // Alter where test results are saved...
        soda.config.set('takeScreenshotOnFailure', true);
        soda.config.set('traceInteractions', true);
        soda.config.set('resultJSON', path.join(SodaConfig.APP_DATA, "[type]_results_[yyyymmdd].json"));

        soda.config.set('headless', SodaConfig.SODA.OPTIONS.headless);
        soda.config.set('awslambda', SodaConfig.SODA.OPTIONS.awslambda);
        soda.config.set('chromeawslambda', SodaConfig.SODA.OPTIONS.chromeawslambda);
        soda.config.set('assetsarn', process.env.ASSETS_ARN);
        soda.config.set('proxy', SodaConfig.SODA.OPTIONS.proxy);
        soda.config.set('chromiumargs', SodaConfig.SODA.OPTIONS.chromiumargs);
    });

    y.init(function (err, soda) {
        soda.console.setOption('log4js', true);
        console.log('y.init', path.join(SodaConfig.APP_DATA, 'scantemp'), soda.config.get('assetsarn'), SodaConfig.SODA.OPTIONS.testPath);

        if(err) return done.call(err);

        soda.loadAssets(SodaConfig.SODA.OPTIONS.testPath, function(err) {
            console.log('y.init loadAssets complete', SodaConfig.SODA.OPTIONS.testPath);
            if(err) {
                console.log(err);
                console.log('Unable to load assets for Soda with yid #' + soda.yid);
                console.log('Asset load error:' + err.message + ' testPath of ' + SodaConfig.SODA.OPTIONS.testPath);
                return done(err);
            }

            console.log("y.init", path.join(__dirname, "server.key"), path.join(__dirname, "server.cert"));
            console.log("y.init", SodaConfig.SODA.BROWSER, 'about:blank', JSON.stringify({ sessionName: SodaConfig.SODA.BROWSER+'-soda' }));

            soda.framework
                .load('puppeteer')
                .start(SodaConfig.SODA.BROWSER, 'about:blank', { sessionName: SodaConfig.SODA.BROWSER+'-soda' }, function(err) {
                    console.log('y.init Started soda with browser', SodaConfig.SODA.BROWSER, 'on about:blank');
                    if(!err) {
                        console.log('y.init Soda started');

                        server = new Server(soda, true, true);
                    
                        server
                            .add(visualEditorEvents(server, repl, y, function (err) { if(err) throw err; }))
                            .start(process.env.SODA_PORT ? process.env.SODA_PORT: 8080, function () {
                                console.log("*** Visual Editor for " + (soda.alias ? soda.alias : "Soda #" + soda.yid) + " started on port " + server.port + " ***");
                            })
                            .on("stop", function () {
                                console.warn("Visual Editor for " + (soda.alias ? soda.alias : "Soda #" + soda.yid) + " stopped");
                            });
                    }
                    else {
                        console.log("y.init", err);
                    }
                });
        });
    });
}

VisualEditorLauncher(); // jshint ignore:line
