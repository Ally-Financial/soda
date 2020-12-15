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
 * @module SodaCommon/Exec
 * @description A platform agnostic way to execute shell commands
 */

var child_process = require("child_process"),
    os       = require('os').platform();

/**
 * Checks to see if an other Soda processes are running
 * @param  {Function} done A callback for completion
 * @return {undefined}
 */
exports.checkForRunningSodas = function (done) {
    switch(os) {
		case "win32":
        case "win64":
			return child_process.exec("tasklist /FI \"IMAGENAME eq node.exe\" /FO CSV", function (err, stdout, stderr) {
				var processIds = [];

				if(err) {
					if(done instanceof Function) done.call(null, err);
				}
				else if(stderr) {
					if(done instanceof Function) done.call(null, new Error(stderr));
				}
				else {
					var array = stdout.split("\r\n");
					if (array.length > 1) {
						for (var i = 1; i < array.length; i++) {
							var values = array[i].split(",");
							if (values.length > 1 && values[0].replace(/^"(.*)"$/, '$1') === "node.exe") {
                                processIds.push(values[0].replace(/^"(.*)"$/, '$1'));
							}
						}
					}

					if(done instanceof Function) done.call(null, null, processIds.join('\n'));
				}
            });
        default:
            return child_process.exec("pgrep -a Soda", done);
    }
};

/**
 * Forcefully remove a directory and all its contents
 * @param {string} which The directory to delete
 * @param {Function} done A callback for completion
 * @return {undefined}
 */
exports.removeDirectory = function (which, done) {
    if (os === "win32" || os === "win64") {
        return child_process.exec("rmdir " + which + " /s /q", done);
    }
    else {
        return child_process.exec("rm -rf " + which, done);
    }
};

/**
 * Create a directory
 * @param {string} name The name of the directory to create
 * @param {Function} done A callback for completion
 * @return {undefined}
 */
exports.makeDirectory = function (named, done) {
    if (os === "win32" || os === "win64") {
		return child_process.exec("mkdir ", named, done);
    }
    else {
        return child_process.exec("mkdir " + named, done);
    }
};

/**
 * Get the stdout of a command
 * @param {string} command The command to execute
 * @param {Function} done A callback for completion
 * @return {undefined}
 */
exports.print = function (command, done) {
    return child_process.exec("echo \"" + command + "\"", done);
};

/**
 * Get the stdout of a command synchronously
 * @param {string} command The command to execute
 * @return {undefined}
 */
exports.printSync = function (command, options) {
    return child_process.execSync("echo \"" + command + "\"", options);
};

/**
 * Open a URL in a browser
 * @param {string} url The url to open
 * @param {Function} done A callback for completion
 * @return {undefined}
 */
exports.openBrowser = function (url, done) {
    if (os === "win32" || os === "win64") {
        return child_process.exec("start /max " + url, done);
    }
    else {
        return child_process.exec("open " + url, done);
    }
};

/**
 * Check to see if an application exists
 * @param  {string} appName The name of the application, without an extension (case sensitive)
 * @param  {Function} done  A callback for compeltion
 * @return {undefined}
 */
exports.appExists = function (appName, done) {
    var programFiles = "Program Files",
        programFilesx64 = "Program Files (x86)";

    if (os === "win32" || os === "win64") {
        return child_process.exec("IF EXIST \"C:\\" + programFiles + "\\" + appName + "\" ( echo exists )", function (err, stdout, stderr) {
            if(err || stderr) {
                return child_process.exec("IF EXIST \"C:\\" + programFilesx64 + "\\" + appName + "\" ( echo exists )", function (err, stdout, stderr) {
                        if(err || stderr) {
                            if(done instanceof Function) done.call(null, false);
                        }
                        else if (stdout.trim() === "exists") {
                            if(done instanceof Function) done.call(null, true);
                        }
                        else {
                    if(done instanceof Function) done.call(null, false);
                        }
                });
            }
            else if (stdout.trim() === "exists") {
                    if(done instanceof Function) done.call(null, true);
            }
            else {
                return child_process.exec("IF EXIST \"C:\\" + programFilesx64 + "\\" + appName + "\" ( echo exists )", function (err, stdout, stderr) {
                        if(err || stderr) {
                            if(done instanceof Function) done.call(null, false);
                        }
                        else if (stdout.trim() === "exists") {
                            if(done instanceof Function) done.call(null, true);
                        }
                        else {
                    if(done instanceof Function) done.call(null, false);
                        }
                });
            }
        });
    }
    else {
        return child_process.exec('if [ -f "/Applications/' + appName.ucFirst + '.app" -o "/Applications/' + appName.ucFirst + '.app" ]; then echo "exists"; fi', function (err, stdout, stderr) {
            if(err || stderr) {
                if(done instanceof Function) done.call(null, false);
            }
            else if (stdout.trim() === "exists") {
                if(done instanceof Function) done.call(null, true);
            }
            else {
                if(done instanceof Function) done.call(null, false);
            }
        });
    }
};

/**
 * Checks out a git branch to the current directory
 * @param  {string} branch The name of the git branch to checkout
 * @param  {Function} done  A callback for compeltion
 * @return {undefined}
 */
exports.gitCheckoutBranch = function (branch, done) {
    return child_process.exec('git checkout', function (err, stdout, stderr) {
        if(err) {
            if(done instanceof Function) done.call(null, err);
        }
        else if(stderr) {
            if(done instanceof Function) done.call(null, new Error(stderr));
        }
        else {
            if(done instanceof Function) done.call(null, null);
        }
    });
};

/**
 * Pulls a git branch which exists in the current directory
 * @param  {Function} done  A callback for compeltion
 * @return {undefined}
 */
exports.gitPull = function (done) {
    return child_process.exec('git pull', function (err, stdout, stderr) {
        if(err) {
            if(done instanceof Function) done.call(null, err);
        }
        else if(stderr) {
            if(done instanceof Function) done.call(null, new Error(stderr));
        }
        else {
            if(done instanceof Function) done.call(null, null);
        }
    });
};
