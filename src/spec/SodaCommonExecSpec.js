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

 /* jshint ignore:start */

"use strict";

const Sandbox = require("sinon/lib/sinon/sandbox");

var sinon = require("sinon"),
    rewire = require("rewire"),
    path   = require("path"),
    child_process   = require("child_process"),
    Exec   = rewire(path.join(__dirname, "..", "SodaCommon", "Exec"));

require(path.join(__dirname, "..", "SodaCommon", "ProtoLib"));

describe('SodaCommon Exec should work properly', function () {
    var spy, spy1, spy2, savedMethod, savedMethod1, savedMethod2;

    beforeAll(function () {
        savedMethod = console.log;
        savedMethod1 = child_process.exec;
        savedMethod2 = child_process.execSync;
    });

    beforeEach(function() {
      spy = sinon.spy(console, 'log');

      spy1 = sinon.stub(child_process, 'exec').callsFake((command, cb) => {
        switch(command) {
          case "pgrep -a Soda":
            cb.call(null, null, '227007');
            break;
          case "rm -rf directory":
            cb.call(null, null, 'rmdir');
            break;
          case "mkdir directory":
            cb.call(null, null, 'mkdir');
            break;
          case "echo \"command\"":
            cb.call(null, null, 'print');
            break;
          case "open url":
            cb.call(null, null, 'openurl');
            break;
          case 'if [ -f "/Applications/Safari.app" -o "/Applications/Safari.app" ]; then echo "exists"; fi':
            cb.call(null, null, "exists", null);
            break;
          case 'git checkout':
            cb.call(null, null, null);
            break;
          case 'git pull':
            cb.call(null, null, null);
            break;
          default:
            cb.call(null, null, null);
        }
      });

      spy2 = sinon.stub(child_process, 'execSync').returns("command\n");
    });
  
    afterEach(function() {
      spy.restore();
      spy1.restore();
      spy2.restore();
    });

    afterAll(function () {
      console.log = savedMethod;
      child_process.exec = savedMethod1;
      child_process.execSync = savedMethod2;
    });

    it('Exec checkForRunningSodas should properly find number of running Sodas', function () {
        Exec.checkForRunningSodas((err, stdout) => { console.log(stdout); });
        sinon.assert.calledWith(spy, '227007');
    });

    it('Exec removeDirectory should properly send command to remove directory', function () {
        Exec.removeDirectory('directory', (err, stdout) => { console.log(stdout); });
        sinon.assert.calledWith(spy, 'rmdir');
    });

    it('Exec makeDirectory should properly send command to make directory', function () {
        Exec.makeDirectory('directory', (err, stdout) => { console.log(stdout); });
        sinon.assert.calledWith(spy, 'mkdir');
    });

    it('Exec print should properly echo the command', function () {
        Exec.print('command', (err, stdout) => { console.log(stdout); });
        sinon.assert.calledWith(spy, 'print');
    });

    it('Exec printSync should properly echo the command', function () {
        expect(Exec.printSync('command', (err, stdout) => { console.log(stdout); }).toString('utf-8')).toEqual("command\n");
    });

    it('Exec openBrowser should properly echo the command', function () {
        Exec.openBrowser('url', (err, stdout) => { console.log(stdout); });
        sinon.assert.calledWith(spy, 'openurl');
    });

    it('Exec appExists should properly echo the command', function () {
        Exec.appExists('Safari', (result) => { console.log(result); });
        sinon.assert.calledWith(spy, true);
    });

    it('Exec gitCheckoutBranch should properly echo the command', function () {
        Exec.gitCheckoutBranch('test', (err, stdout) => { console.log(stdout); });
        sinon.assert.calledWith(spy, undefined);
    });

    it('Exec gitPull should properly echo the command', function () {
        Exec.gitPull((err, stdout) => { console.log(stdout); });

        sinon.assert.calledWith(spy, undefined);
    });
});
