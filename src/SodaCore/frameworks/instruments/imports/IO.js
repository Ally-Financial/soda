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
 * Object Driven Automation Utility Functions
 * @module Instruments/IO
 */

/**
 * Object which contains all the functions for Instruments Read/Write operations
 * @type {Object}
 */
var IO = {};

/**
 * Execute a shell script
 * @param {string} script The script to execute
 * @param {Array} args The arguments to pass the script
 * @returns {*}
 */
IO.performHostAction = function (/** string */ script, /** Array */ args) {
    return Simulator.host.performTaskWithPathArgumentsTimeout(script, args, Config.DEFAULT_TASK_TIMEOUT);
};

/**
 * Returns a list of the cwd contents as an array
 */
IO.ls = function(/** void */) {
    if(typeof path !== "string") { return path; }
    return IO.performHostAction(Vars.PATHS.SHELL_PATH, ["l"]).stdout.split(/\n/g);
};

/**
 * Determines if path is a file in the cwd and is a regular file
 * @param {string} path The file to test
 */
IO.isFile = function(/** string */ path) {
    if(typeof path !== "string") { return path; }
    return parseInt(IO.performHostAction(Vars.PATHS.SHELL_PATH, ["f", path]).stdout.replace(/\n/g, ''), 10) === 1;
};

/**
 * Determines if path is a directory in the cwd
 * @param {string} path The directory to test
 */
IO.isDirectory = function(/** string */ path) {
    if(typeof path !== "string") { return path; }
    return parseInt(IO.performHostAction(Vars.PATHS.SHELL_PATH, ["i", path]).stdout.replace(/\n/g, ''), 10) === 1;
};

/**
 * Determines if the path passed is absolute or relative
 * @param {string} path The path to test
 * @returns {boolean|string}
 */
IO.isRelativePath = function (/** string */ path) {
    if(typeof path !== "string") { return path; }
    return /^\.\//g.test(path);
};

/**
 * Determines if the path passed is absolute or relative
 * @param {string} path The path to test
 * @returns {boolean|string}
 */
IO.isAbsolutePath = function (/** string */ path) {
    if(typeof path !== "string") { return path; }
    return path[0] === "/";
};

/**
 * Opens the url in Firefox
 * @param {string} url The url to open in Firefox
 */
IO.openhtml = function(/** string */ url) {
    return IO.performHostAction(Vars.PATHS.SHELL_PATH, ["o", url]);
};

/**
 * Reads a file from disk
 * @param {string} fn The filename of the file to read
 * @returns {process.stdout|{}|*}
 */
IO.readfile = function (/** string */ fn) {
    return IO.performHostAction(Vars.PATHS.SHELL_PATH, ["r", fn]).stdout;
};

/**
 * Write a file to disk, if the file exists it is appended to.
 * @param {string} fn The filename of the file to append
 * @returns {process.stdout|{}|*}
 * @param {string} contents The contents to append
 */
IO.appendfile = function(/** string */ fn, /** string */ contents) {
    return IO.performHostAction(Vars.PATHS.SHELL_PATH, ["a", fn, contents]);
};

/**
 * Prepend a line to a file (the \n is built-in)
 * @param fn The filename of the file to prepend to
 * @returns {process.stdout|{}|*}
 * @param contents The contents to prepend
 */
IO.prependfile = function(/** string */ fn, /** string */ contents) {
    return IO.performHostAction(Vars.PATHS.SHELL_PATH, ["n", fn, contents]);
};

/**
 * Write to a file, if the file doesn't exist it is created, if it does, it's truncated!
 * @param {string} fn The filename of the file to write
 * @returns {process.stdout|{}|*}
 * @param {string} contents The contents to write
 */
IO.writefileShell = function(/** string */ fn, /** string */ contents) {
    return IO.performHostAction(Vars.PATHS.SHELL_PATH, ["w", fn, contents]);
};

/**
 * Write a "file" to the stdout
 * @param {string} fn The filename of the file to write
 * @returns {process.stdout|{}|*}
 * @param {string} contents The contents to write
 * @deprecated
 */
IO.writefile = function(/** string */ fn, /** string */ contents) {
    if(fn && contents) {
        var chunks = Math.ceil(contents.length / Config.FILE_WRITE_CHUNK_SIZE),
            fid = Date.now();

        for (var i = 0; i < chunks; i++) {

            var start = Config.FILE_WRITE_CHUNK_SIZE * i,
                chunk = contents.substr(start, Config.FILE_WRITE_CHUNK_SIZE);

            UIALogger.logMessage("__WRITEFILE__" + fid + "__" + fn + "__CHUNK__" + (i + 1) + "__OF__" + chunks + "__DATA__" + chunk + "__");
            Simulator.target.delay(Config.WRITE_CHUNK_DELAY);
        }
    }
    else {
        throw new Error("Attempting to write empty file...");
    }
};

/**
 * Respond to a directive event
 * @param {number} eid The event id
 * @param {*} contents The contents to respond with
 */
IO.respondToEvent = function(/** string */ eid, /** string */ contents) {
    if(typeof eid === "number" && contents) {
        var chunks = Math.ceil(contents.length / Config.FILE_WRITE_CHUNK_SIZE);
        for (var i = 0; i < chunks; i++) {
            var start = Config.FILE_WRITE_CHUNK_SIZE * i,
                chunk = contents.substr(start, Config.FILE_WRITE_CHUNK_SIZE);

            UIALogger.logMessage("__EVENT__" + eid + "__CHUNK__" + (i + 1) + "__OF__" + chunks + "__DATA__" + chunk + "__");
            Simulator.target.delay(Config.WRITE_CHUNK_DELAY);
        }
    }
    else {
        throw new Error("Attempting to write empty file...");
    }
};

/**
 * Move source to destination
 * @param {string} source
 * @param {string} destination
 */
IO.movefile = function(/** string */ source, /** string */ destination) {
    return IO.performHostAction(Vars.PATHS.SHELL_PATH, ["m", source, destination]);
};

/**
 * Copy contents to the clipboard
 * @param {string} item The item to copy
 * @param {function} replacer @see JSON.stringify (argument #2)
 * @returns {process.stdout|{}|*}
 */
IO.copyToClipboard = function (/** string */ item, /** function= */ replacer) {
    return IO.performHostAction(Vars.PATHS.SHELL_PATH, ["c", (typeof item !== "string") ? JSON.stringify(item, replacer || null, '\t') : item]).stdout;
};
