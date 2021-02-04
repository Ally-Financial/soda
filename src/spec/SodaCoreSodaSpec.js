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

var path = require("path");
delete require.cache[require(path.join(__dirname, "..", "SodaCommon", "Exception"))];
delete require.cache[require(path.join(__dirname, '..', 'SodaCore', 'lib', 'Classes', 'AssetCollection'))];

var fs           = require("fs"),
    child_process   = require("child_process"),
    exception   = require(path.join(__dirname, "..", "SodaCommon", "Exception")),
    sinon = require('sinon');
    AssetCollection = require(path.join(__dirname, '..', 'SodaCore', 'lib', 'Classes', 'AssetCollection'));

function jsonFunctionReplacer (key, value) {
    if(typeof value === "function") return value.name ? "[Function:" + value.name + "]" : "[Function:anonymous]";
    return value;
}

let Soda = require(path.join(__dirname, '..', 'SodaCore', 'lib', 'Soda'));

describe('Soda', () => {

  sandbox = sinon.createSandbox();

  let soda, soda1, soda2, spy, spy2, spy3, spy4, spy5, spy6, savedMethod1, savedMethod2, savedMethod3, savedMethod4, savedMethod5;

  function clearRequireCache() {
    Object.keys(require.cache).forEach(function (key) {
        delete require.cache[key];
    });
  }

  beforeAll(function (done) {
    clearRequireCache();
    
    savedMethod1 = fs.rmdir;
    savedMethod2 = fs.mkdir;
    savedMethod3 = fs.writeFile;
    savedMethod4 = fs.stat;
    savedMethod5 = fs.exists;

    done();
  });

  beforeEach(function() {
    spy = sinon.spy(fs, "rmdir");
    spy2 = sinon.spy(fs, "mkdir");
    spy3 = sinon.spy(fs, "writeFile");
    spy4 = sinon.spy(fs, "stat");
    spy5 = sinon.spy(fs, "exists");
  });

  afterEach(function() {
    spy.restore();
    spy2.restore();
    spy3.restore();
    spy4.restore();
    spy5.restore();
  });

  afterAll(function (done) {
    fs.rmdir = savedMethod1;
    fs.mkdir = savedMethod2;
    fs.writeFile = savedMethod3;
    fs.stat = savedMethod4;
    fs.exists = savedMethod5;

    done();
  });

  it('should have a yid of 0', function(done) {
    soda = new Soda();
    expect(soda.yid).toEqual(0);

    done();
  });

  it ('should support multiple sodas properly', function(done) {
    soda1 = new Soda();
    expect(soda1.yid).toEqual(1);
    soda2 = new Soda();
    expect(soda2.yid).toEqual(2);
    soda1.kill();
    soda2.kill();
    expect(soda2.sids()).toEqual(1);
    soda1 = null;
    soda2 = null;

    done();
  });

  it('should have a valid process id', function() {
    expect(soda.pid).toBeInstanceOf(Number);
  });

  it('should not have an alias', function() {
    expect(soda.alias).toEqual(null);
  });

  it('should have a version', function() {
    var pjson = require(path.join(__dirname, '..', 'package.json'));
    expect(soda.version).toEqual(pjson.version);
  });

  it('should not be initialized', function() {
    expect(soda.initialized).toEqual(false);
  });

  it('should not be killed', function() {
    expect(soda.initialized).toEqual(false);
  });

  it ('should not recognize an invalid DB Path', function() {
    expect(soda.isDBPath("/Users/myuser/soda")).toEqual(false);
  });

  it ('should recognize a DB Path', function() {
    expect(soda.isDBPath("@database:a")).toEqual(true);
  });

  it ('should not recognize an invalid Lambda Path', function() {
    expect(soda.isLambdaPath("/Users/myuser/soda")).toEqual(false);
  });

  it ('should recognize a Lambda Path', function() {
    expect(soda.isLambdaPath("@lambda:a")).toEqual(true);
  });


  it ('should create a DB EventEmitter', function() {
    soda.database('a');
    expect(soda.useDb('a')).toBeInstanceOf(Object);
    expect(soda.noFs('a')).toBeInstanceOf(Object);
  });

  it ('should have a valid title', function() {
    expect(soda.toString()).toMatch(/Soda:\d+:\d+/)
  });

  it ('should have a valid title when using a safe string', function() {
    expect(soda.toSafeString()).toMatch(/Soda-\d+-\d+/)
  });

  it ('should throw an error if no soda.json is found', function(done) {
    soda.init(function() {
      soda.config.set("headless", true, true, true);

      soda.checkForSodaJson('/Users/nouserfound', function(err, result) {
        expect(err).toBeInstanceOf(exception.SodaError);
        expect(result).toBeInstanceOf(Soda);

        done();
      });
    });
  });

  it ('should find a soda.json file', function(done) {
    soda.init(function() {
      soda.config.set("headless", true, true, true);

      soda.checkForSodaJson(path.join(__dirname, '..', 'sample_project'), function(err, result) {
        expect(err).toEqual(null);
        expect(result).toBeInstanceOf(Soda);
        done();
      });
    });
  });

  it ('should have the default environment setup', function(done) {
    soda.init(function() {
      soda.config.set("headless", true, true, true);

      expect(soda.vars.get('_env_')).toEqual('env');
      done();
    });
  });

  it ('should load the assets', function(done) {
    soda.init(function() {
      soda.config.set("headless", true, true, true);

      soda.loadAssets(path.join(__dirname, '..', 'sample_project'), function(err, assetCollection) {
        expect(err).toEqual(null);
        expect(assetCollection).toBeInstanceOf(AssetCollection);
        done();
      });
    });
  });

  it ('should attempt to delete the test results', function(done) {
    soda.init(function() {
      soda.config.set("headless", true, true, true);

      soda.cleanTestResults(path.join(__dirname, '..', 'test_results'), function(err, assetCollection) {
        sinon.assert.calledWith(spy, path.join(path.join(__dirname, '..', 'test_results'), soda.config.get("testResultsDir")));

        done();
      });
    });
  });

  it ('should clean the test results', function(done) {
    try {
      fs.mkdirSync(path.join(__dirname, '..', soda.config.get("testResultsDir")));
    }
    catch (e) {

    }
    
    var file = path.join(path.join(__dirname, '..', soda.config.get("testResultsDir"), 'todelete.file'));

    fs.appendFile(file, 'File contents', function (err) {
      expect(err).toEqual(null);
      expect(fs.existsSync(file)).toEqual(true);

      soda.init(function() {
        soda.config.set("headless", true, true, true);
        
        soda.cleanTestResults(path.join(__dirname, '..'), function(err, soda) {
          expect(fs.existsSync(file)).toEqual(false);

          done();
        });
      });
    });
  });

  it ('should clean the temp directory', function(done) {
    soda.kill();

    expect(soda.sids()).toEqual(0);

    soda = null;

    var stub = sinon.stub(child_process, 'exec').callsFake((command, cb) => {
      switch(command) {
        case "tasklist /FI \"IMAGENAME eq node.exe\" /FO CSV":
          cb.call(null, null, "\"Image Name\",\"PID\",\"Session Name\",\"Session#\",\"Mem Usage\"\r\n\"node.exe\",\"227007\",\"Console\",\"1\",\"42,452 K\"", null);
          break;
        case "pgrep -a Soda":
          cb.call(null, null, '1');
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

    var soda3 = new Soda();
    expect(soda3.sids()).toEqual(1);

    soda3.init(function() {
      sinon.assert.calledWith(spy, soda3.config.get("temp"));

      stub.restore();

      soda3.kill();

      soda3 = null;

      done();
    });
  });

  it ('should kill a running soda', function(done) {
    var soda4 = new Soda();

      soda4.init(function() {
          expect(soda4.sids()).toEqual(1);
          soda4.kill();
          expect(soda4.sids()).toEqual(0);

          done();
      });
  });

  it ('should have correct number of sids', function(done) {
    var soda5 = new Soda();

      soda5.init(function() {
        expect(soda5.sids()).toEqual(1);

          var soda6 = new Soda();
          soda6.init(function() {
            expect(soda5.sids()).toEqual(2);
            expect(soda6.sids()).toEqual(2);

            soda5.kill();

            expect(soda5.sids()).toEqual(1);
            expect(soda6.sids()).toEqual(1);

            soda6.kill();

            expect(soda5.sids()).toEqual(0);
            expect(soda6.sids()).toEqual(0);

            done();
          });
      });
  });

  it ('should set options properly', function(done) {
    var soda7 = new Soda();

    soda7.init(function() {
      soda7.setOptions({
        logDebug: true,
        logColors: true,
        logVerbose: true,
        logSupressed: true,
        testResultDir: path.join(__dirname, 'logResultDir')
      });

      expect(soda7.config.get('logDebug')).toEqual(true);
      expect(soda7.config.get('logColors')).toEqual(true);
      expect(soda7.config.get('logVerbose')).toEqual(true);
      expect(soda7.config.get('logSupressed')).toEqual(true);
      expect(soda7.config.get('testResultDir')).toEqual(path.join(__dirname, 'logResultDir'));

      soda7.setOptions({
        logDebug: false,
        logColors: false,
        logVerbose: false,
        logSupressed: false,
        testResultDir: ''
      });

      expect(soda7.config.get('logDebug')).toEqual(false);
      expect(soda7.config.get('logColors')).toEqual(false);
      expect(soda7.config.get('logVerbose')).toEqual(false);
      expect(soda7.config.get('logSupressed')).toEqual(false);
      expect(soda7.config.get('testResultDir')).toEqual('');

      soda7.kill();
      soda7 = null;

      done();
    });
  });

  it ('should set a single option properly', function(done) {
    var soda8 = new Soda();

    soda8.init(function() {
      soda8.setOption('logSupressed', true);
      soda8.setOption('testResultDir', path.join(__dirname, 'logResultDir'));

      expect(soda8.config.get('logSupressed')).toEqual(true);
      expect(soda8.config.get('testResultDir')).toEqual(path.join(__dirname, 'logResultDir'));

      soda8.setOption('logSupressed', false);
      soda8.setOption('testResultDir', '');

      expect(soda8.config.get('logSupressed')).toEqual(false);
      expect(soda8.config.get('testResultDir')).toEqual('');

      soda8.kill();
      soda8 = null;

      done();
    });
  });

  it ('should send save events to listeners', function(done) {
    var soda9 = new Soda();
    var saveCount = 0;

    soda9.use(function(tempSoda) {
      // Hook into variables
      tempSoda.vars.on("save", function (name, value) {
          soda9.kill();
          done();
      });
    });

    soda9.init(function() {
      soda9.vars.save('name', 'value');

      soda9.kill();
      soda9 = null;
    });
  });

  it ('should send get events to listeners', function(done) {
    var soda10 = new Soda();
    var getCount = 0;

    soda10.use(function(tempSoda) {
      // Hook into variables
      tempSoda.config.on("config get", function (name) {
        getCount++;

        if (getCount === 3) {
          soda10.kill();
          done();
        }
      });
    });

    soda10.init(function() {
      soda10.config.get('name');
    });
  });

  it ('should remove a listener', function (done) {
    var soda10 = new Soda();
    var getCount = 0;

    var getFunction = function(tempSoda) {
      // Hook into variables
      tempSoda.config.on("config get", function (name) {
        getCount++;

        if (getCount === 3) {
          soda10.stopUsing(getFunction);

          soda10.config.get('name');

          setTimeout(function() {
            done();
          }, 1000);
        }
      });
    };

    soda10.use(getFunction);

    soda10.init(function() {
      soda10.config.get('name');

      soda10.kill();
      soda10 = null;
      
      done();
    });
  });

  it ('should support dumping the temp directory', function(done) {
    var soda11 = new Soda();

    soda11.init(function() {
      soda11.dumpTemp(function(err, result) {
        sinon.assert.calledWith(spy, soda11.config.get("temp"));
        sinon.assert.calledWith(spy2, soda11.config.get("temp"));

        soda11.kill();
        soda11 = null;

        done();
      });
    });
  });

  it ('should dump the contents of what we ask for with a temp directory', function(done) {
    var soda12 = new Soda();

    var toStringify = {'onevar':'oneval', 'twovar':'twoval'};
    var stringified = JSON.stringify(toStringify, jsonFunctionReplacer, '    ');

    soda12.init(function() {
      soda12.dump(toStringify, soda12.config.get("temp"), function(err, result) {
        sinon.assert.calledWith(spy3, soda12.config.get("temp"), stringified);

        soda12.kill();
        soda12 = null;

        done();
      });
    });
  });

  it ('should dump the contents of what we ask for without a temp directory', function(done) {
    var soda13 = new Soda();

    var toStringify = {'onevar':'oneval', 'twovar':'twoval'};
    var stringified = JSON.stringify(toStringify, jsonFunctionReplacer, '    ');

    soda13.init(function() {
      soda13.dump(toStringify, function(err, result) {
        sinon.assert.called(spy3);

        soda13.kill();
        soda13 = null;

        done();
      });
    });
  });

  it ('should initialize properly', function(done) {
    var stub = sinon.stub(child_process, 'exec').callsFake((command, cb) => {
      console.log(command);
      switch(command) {
        case "tasklist /FI \"IMAGENAME eq node.exe\" /FO CSV":
          cb.call(null, null, "\"Image Name\",\"PID\",\"Session Name\",\"Session#\",\"Mem Usage\"\r\n\"node.exe\",\"227007\",\"Console\",\"1\",\"42,452 K\"", null);
          break;
        case "pgrep -a Soda":
          cb.call(null, null, '1');
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

    var soda14 = new Soda();

    soda14.init(function() {
      expect(soda14.exception).not.toEqual(null);
      expect(soda14.assert).not.toEqual(null);
      expect(soda14.config).not.toEqual(null);
      sinon.assert.called(spy4);
      expect(soda14.console).not.toEqual(null);
      expect(soda14.vars).not.toEqual(null);
      expect(soda14.Tree).not.toEqual(null);
      expect(soda14.framework).not.toEqual(null);
      expect(soda14.device).not.toEqual(null);
      expect(soda14.syntax).not.toEqual(null);
      expect(soda14.element).not.toEqual(null);
      expect(soda14.Action).not.toEqual(null);
      expect(soda14.assets).not.toEqual(null);
      expect(soda14.runner).not.toEqual(null);
      expect(soda14.core).not.toEqual(null);
      expect(soda14.vars.get("_env_")).toEqual(soda14.config.get("env"));
      expect(soda14.vars.get("_testurl_")).toEqual(soda14.config.get("testURL"));
      sinon.assert.calledWith(spy5, path.join(soda14.config.get("root"), "custom.js"));
      expect(soda14.initialized).toEqual(true); 

      stub.restore();

      soda14.kill();
      soda14 = null;

      done();
    });
  });
});
