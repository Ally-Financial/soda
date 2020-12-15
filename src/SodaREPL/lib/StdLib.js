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
 * @module SodaREPL/StdLib
 * @description A callback which add listeners to listen for for all non-Soda-based REPL commands (standard, generic commands)
 */

// Adds a set of StdLib commands to the REPL
module.exports = function (repl) {
    // Change current working directory
    repl.addCommand("stdlib—cd", "cd", function (respond, args) {
        try {
            if(typeof args[0] === "string" && args[0] !== "") {
                process.chdir(args[0].replace(/(["'])/g, ''));
                respond(0, process.cwd());
            }
            else {
                respond(2, "No directory argument provided!");
            }
        }
        catch (e) {
            respond(1, e.message);
        }
    }, false, false);

    // Print current working directory
    repl.addCommand("stdlib—pwd", "pwd", function (code) {
        code(0, process.cwd());
        repl.emit("command-end");
    }, false, false);

    // Print the repl history
    repl.addCommand("stdlib—history", "his|history", function () {
        if(repl.currentSoda === "object" && typeof repl.currentSoda.yid === "number") {
            repl.currentconsole.log(repl.rl.history.sodaclone.reverse().join("\n"));
        }
        else {
            repl.rsole.log(repl.rl.history.sodaclone.reverse().join("\n"));
        }
    }, false, false);

    // Kills the process
    repl.addCommand("stdlib—die", "die", function () {
        process.exit(0);
    }, false, false);

    // Kills the process
    repl.addCommand("stdlib—quit", "q|quit", function () {
        repl.kill();
        repl.emit("quitting");
    }, false, false);
};
