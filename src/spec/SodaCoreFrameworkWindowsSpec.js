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


 "use strict";

const { Socket } = require('dgram');

var sinon = require('sinon'),
    path   = require("path"),
    child_process   = require("child_process"),
    Soda   = require(path.join(__dirname, "..", "SodaCore", "lib", "Soda")),
    net = require('net');

require(path.join(__dirname, "..", "SodaCommon", "ProtoLib"));

Object.freeze = function(obj) { return obj; };

describe('Framework windows should pass all validation tests', function () {
  var soda, windowsFramework, socket, savedMethod, spy1, spy2;

  function clearRequireCache() {
    Object.keys(require.cache).forEach(function (key) {
        delete require.cache[key];
    });
  }

    beforeAll(function (done) {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 300000;

      clearRequireCache();

      socket = net.Socket;
      savedMethod = child_process.exec;

      var jSONToSend1 = {"result": [{ name: "notepad.exe", path: "C:\\system32", description: "Notepad"}]};
      var responseApplications = JSON.stringify(jSONToSend1) + "<EOF>";
      var jSONToSend2 = {"result": {}};
      var jSONToSend3 = {"result": [800, 600] };
      var responseTree = JSON.stringify(jSONToSend2) + "<EOF>";
      var responseSize = JSON.stringify(jSONToSend3) + "<EOF>";
      var dataMethod = null
      var endMethod = null;
      class TestServer {
        constructor(params) {
        }
    
        connect = function(port, ip, complete) {
          return complete();
        }
        on = function(method, complete) {
          if (method === 'data') {
            dataMethod = complete;
          }
          if (method === 'end') {
            endMethod = complete;
          }
        }
        write = function(command) {
          var jsonDeconstruct = JSON.parse(command.replace("<EOF>", ''));

          switch (jsonDeconstruct[0].command) {
            case "getAvailableApplications":
              dataMethod(responseApplications);
              break;
            case "gettree":
              dataMethod(responseTree);
              break;
            case "getsize":
              dataMethod(responseSize);
              break;
            default:
              dataMethod(responseTree);
          }
          
          return endMethod();
        }
        destroy = function() {
          return;
        }
        once = function() {
          return;
        }
      };

      spy2 = sinon.stub(net, 'Socket').callsFake((args) => {
        return new TestServer(args);
      });

      spy1 = sinon.stub(child_process, 'exec').callsFake((command, cb) => {
        switch(command) {
          case "tasklist /FI \"IMAGENAME eq node.exe\" /FO CSV":
            cb.call(null, null, "\"Image Name\",\"PID\",\"Session Name\",\"Session#\",\"Mem Usage\"\r\n\"node.exe\",\"227007\",\"Console\",\"1\",\"42,452 K\"", null);
            break;
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

      soda = new Soda({ testPath: path.join(__dirname, '..', 'sample_project'), logSupressed: false });

      soda.init(function() {
        soda.config.set("headless", true, true, true);
        
        windowsFramework = require(path.join(__dirname, "..", "SodaCore", "frameworks", "windows"))(soda);

        soda.framework = windowsFramework;

        done();
      });
    });

    afterAll(function (done) {
      child_process.exec = savedMethod;
      net.Socket = socket;

      done();
    });

    it('Should validate windows terminal', function (done) {
      expect(windowsFramework.name).toEqual('Windows');
      expect(windowsFramework.platform).toEqual('Windows');
      expect(windowsFramework.version).toEqual('1.0');
      expect(windowsFramework.defaultSyntaxVersion).toEqual('1.0');
      expect(windowsFramework.defaultSyntaxName).toEqual('windows');

      done();
    });

    it('Should start for windows', function (done) {
      windowsFramework.start("notepad", "c:\\windows\\system", { }, function(err) {
        expect(err).toEqual(null);

          soda.framework.stop(function(err, res) {
            done();
          });
      });
    });

    it('Should listAvailableDevices for windows', function (done) {
      windowsFramework.listAvailableDevices(function(result) {
        expect(result).toBeInstanceOf(Array);

        done();
      });
    });

    it('Should getTree for windows', function (done) {
      windowsFramework.getTree({}, function (err, res) {
        expect(err).toEqual(null);
        expect(res).toBeInstanceOf(Object);

        done();
      });
    });

    it('Should getScreenBounds for windows', function (done) {
      windowsFramework.getScreenBounds(function(err, bounds) {
        expect(err).toEqual(null);
        expect(bounds.sodamembers).toEqual(2);

        done();
      });
    });

    it('Should getOrientation for windows', function (done) {
      windowsFramework.getOrientation(function(err, result) {
        expect(err).toEqual(null);
        expect(result).toEqual(1);

        done();
      });
    });

    it('Should stop for windows', function (done) {
      windowsFramework.start("notepad", "c:\\windows\\system", { }, function(err) {
        windowsFramework.stop(function(err) {
          expect(err).toEqual(null);

          windowsFramework.stop(function(err, res) {
            done();
          });
        });
      });
    });

    it('Should restart for windows', function (done) {
      windowsFramework.start("App", "AppPath", { shell: "sh"}, function(err) {
        expect(err).toEqual(null);

        windowsFramework.restart(function(err) {
          expect(err).toEqual(null);

          windowsFramework.stop(function(err, res) {
            done();
          });
        });
      });
    });

    it('Should restart for windows', function (done) {
      windowsFramework.start("App", "AppPath", { shell: "sh"}, function(err) {
        expect(err).toEqual(null);

        windowsFramework.restart(function(err) {
          expect(err).toEqual(null);

          windowsFramework.stop(function(err, res) {
            done();
          });
        });
      });
    });

    it('Should kill soda', function (done) {
          soda.kill();
          
          soda = null;

          done();
    });
});
