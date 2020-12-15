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
    var exec = require("child_process").exec;
    process.title = "SodaVisualEditor";

    var path               = require("path"),
        Server             = require(path.join(__dirname, "SodaVisualEditor", "lib", "Server")),
        visualEditorEvents = require(path.join(__dirname, "SodaVisualEditor", "lib", "VisualEditorEvents")),
        repl               = require(path.join(__dirname, "SodaREPL")),
        server;

    /**
     * @composes Server
     * @composes VisualEditorEvents
     */
    server = new Server(repl, true, true);
    server
        .add(visualEditorEvents(server, repl, function (err) { if(err) throw err; }))
        .start(process.argv[2], function () {
            if (require("os").platform() === "win32" || require("os").platform() === "win64") {
                if (!process.argv[3]) exec('start " " "https://localhost:' + server.port + '/"');
            }
            else {
                if (!process.argv[3]) exec('open "https://localhost:' + server.port + '/"');
            }
        });
}

VisualEditorLauncher(); // jshint ignore:line
