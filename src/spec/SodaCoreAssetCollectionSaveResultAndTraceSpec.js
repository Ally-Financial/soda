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

var sinon = require('sinon'),
    path   = require("path"),
    Soda   = require(path.join(__dirname, "..", "SodaCore", "lib", "Soda")),
    AssetCollection = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "AssetCollection")),
    Asset = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "Asset")),
    fs    = require("fs");

require(path.join(__dirname, "..", "SodaCommon", "ProtoLib"));

describe('AssetCollection should pass all validation tests', function () {
  var soda, spy, savedMethod;

    beforeAll(function (done) {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 300000;

      savedMethod = fs.writeFile;

      fs.rmdirSync(path.join(__dirname, '..', 'sample_project', 'new_suite'), { recursive: true });
      soda = new Soda({ testPath: path.join(__dirname, '..', 'sample_project'), logSupressed: true });
      soda.init(function() {
        soda.config.set("headless", true, true, true);
        
        soda.cleanTestResults(soda.config.get('testResultsPath'), function(err, assetCollection) {
          fs.mkdir(path.join(soda.config.get('testResultsPath'), soda.config.get("testResultsDir")), function() {
            done();
          });
        });
      });
    });

    beforeEach(function() {
      spy = sinon.spy(fs, 'writeFile');
    });
  
    afterEach(function() {
      spy.restore();
    });

    afterAll(function (done) {
      fs.writeFile = savedMethod;

      soda.kill();
      
      soda = null;

      done();
    });

    it ('Should save a test result', function(done) {
      var testResult =
      {
          "filename": "~/Source/systemmonitor/scripts/system/modules/standard/tests/001.json",
          "id": "T001",
          "name": "001",
          "description": "Login to URL",
          "suite": "system",
          "module": "standard",
          "platform": "rest",
          "type": "Test",
          "user": "USERNAME",
          "result": "Pass",
          "resultBool": true,
          "stopped": false,
          "started": "2018-11-29 15:27:26",
          "totalTests": 1,
          "run": 1,
          "duration": "00:00:28.900",
          "failureId": "N/A",
          "reason": "Should execute `store-result-value` ❯ Should store `[object Object]` as `RESULT`",
          "variables": {
              "RESULT": {
                  "REPORTED": "1543523275756",
                  "RESULT": {
                      "USER": "USERNAME",
                      "PASSWORD": "PASSWORD",
                      "RESULT": "1",
                      "TESTTYPE": "UI Validation",
                      "TYPE": "",
                      "URL": "https://someexampledomain.com/index.jsp",
                      "STATUS_CODE": "200",
                      "STATUS_MESSAGE": "",
                      "TIME_STAMP": "1543523275757",
                      "ERROR_CODE": "",
                      "ERROR_DESCRIPTION": ""
                  },
                  "ASSET_INFO": {
                      "TEST": {
                          "NAME": "001",
                          "ID": "T001"
                      },
                      "ACTION": {
                          "NAME": "001",
                          "ID": "001"
                      }
                  }
              },
              "_asset_info_": {
                  "name": "store-result-value",
                  "suite": "system",
                  "module": "standard",
                  "platform": "generic",
                  "description": "Store result",
                  "id": "store-result",
                  "path": "~/Source/systemmonitor/scripts/system/modules/standard/actions/store-result-value.json"
              },
              "_test_info_": {
                  "name": "001",
                  "suite": "system",
                  "module": "standard",
                  "platform": "generic",
                  "description": "Login to URL",
                  "id": "T001",
                  "path": "~/Source/systemmonitor/scripts/system/modules/standard/tests/001.json"
              },
              "_testurl_": "about:blank",
              "system": "",
              "system-result": 1,
              "tempRetries": 120,
              "testtype": "UI Validation",
              "uri": "https://someexampledomain.com/index.jsp"
          }
      };

      var assetCollection = new AssetCollection(soda, path.join(__dirname, '..', 'sample_project'));

      assetCollection.load(function(err, result) {
        assetCollection.saveResults(testResult, function(err) {
          sinon.assert.called(spy);
          done();
        });
      });
    });

    it ('Should save a trace', function(done) {
      var testResult =
      {
          "filename": "~/Source/systemmonitor/scripts/system/modules/standard/tests/001.json",
          "id": "T001",
          "name": "001",
          "description": "Login to CIDM",
          "suite": "system",
          "module": "standard",
          "platform": "rest",
          "type": "Test",
          "user": "USERNAME",
          "result": "Pass",
          "resultBool": true,
          "stopped": false,
          "started": "2018-11-29 15:27:26",
          "totalTests": 1,
          "run": 1,
          "duration": "00:00:28.900",
          "failureId": "N/A",
          "reason": "Should execute `store-result-value` ❯ Should store `[object Object]` as `RESULT`",
          "variables": {
              "RESULT": {
                  "REPORTED": "1543523275756",
                  "RESULT": {
                      "USER": "USERNAME",
                      "PASSWORD": "PASSWORD",
                      "RESULT": "1",
                      "TESTTYPE": "UI Validation",
                      "TYPE": "",
                      "URL": "https://someexampledomain.com/index.jsp",
                      "STATUS_CODE": "200",
                      "STATUS_MESSAGE": "",
                      "TIME_STAMP": "1543523275757",
                      "ERROR_CODE": "",
                      "ERROR_DESCRIPTION": ""
                  },
                  "ASSET_INFO": {
                      "TEST": {
                          "NAME": "001",
                          "ID": "T001"
                      },
                      "ACTION": {
                          "NAME": "001",
                          "ID": "001"
                      }
                  }
              },
              "_asset_info_": {
                  "name": "store-result-value",
                  "suite": "system",
                  "module": "standard",
                  "platform": "generic",
                  "description": "Store result",
                  "id": "store-result",
                  "path": "~/Source/systemmonitor/scripts/system/modules/standard/actions/store-result-value.json"
              },
              "_test_info_": {
                  "name": "001",
                  "suite": "system",
                  "module": "standard",
                  "platform": "generic",
                  "description": "Login to CIDM",
                  "id": "T001",
                  "path": "~/Source/systemmonitor/scripts/system/modules/standard/tests/001.json"
              },
              "_testurl_": "about:blank",
              "_user_": "USERNAME",
              "global_n": {
                  "next": 1,
                  "curr": 1,
                  "prev": 0
              },
              "password": "PASSWORD",
              "system": "",
              "system-result": 1,
              "tempRetries": 120,
              "testtype": "UI Validation",
              "uri": "https://someexampledomain.com/index.jsp"
          }
      },
      trace =
      {
        "framework": {
            "name": "Selenium",
            "version": "1.0",
            "args": [
                "chrome",
                "about:blank",
                {
                    "sessionName": "chrome-soda-0"
                },
                null
            ]
        },
        "options": {
            "root": "~/Source/soda",
            "androidSDKPath": "~/Library/Android/sdk",
            "androidBuildToolsPath": "~/Library/Android/sdk/build-tools/25.0.2",
            "core": "~/Source/soda/SodaCore",
            "SSOnDOM": false,
            "treeHashes": {},
            "SSOnDOMDir": "~/AppScreenShots",
            "proxy": "http://username:password@host:port",
            "headless": false,
            "perflog": false,
            "sodaRootId": "soda-uid-root",
            "userHome": "~/",
            "userName": "ZID",
            "temp": "~/Documents/appdata/scantemp",
            "timeToWaitForScreenShot": 100,
            "seleniumChromeServer": "http://localhost:9515/",
            "seleniumIEServer": "http://localhost:9515/",
            "command": "run",
            "port": 1337,
            "pid": 31861,
            "framework": "rest",
            "say": false,
            "devMode": false,
            "maxFileScanDepth": 4,
            "defaultSyntaxName": "mobile",
            "defaultSyntaxVersion": "2.0",
            "ignoreTestDirectories": [
                ".git",
                "test-results",
                "test-results-editor"
            ],
            "traceInteractions": true,
            "resultsJSON": "[test_path]/[test_results_dir]/[type]_results_[host]_[platform]_[yyyymmdd].json",
            "resultsScreenshot": "[test_path]/[test_results_dir]/failures/failure_[fid]_[reason].png",
            "treeScreenshot": "[test_path]/[test_results_dir]/traces/tree_[host]_[yyyymmdd]_[now].json",
            "resultsJunit": "[test_path]/[test_results_dir]/results/output_junit.xml",
            "resultsHTML": "[test_path]/[test_results_dir]/results/output_[type].html",
            "resultsTrace": "[test_path]/[test_results_dir]/traces/trace_[host]_[yyyymmdd]_[now].json",
            "testPath": "~/Source/systemmonitor/scripts",
            "testResultsPath": "~/Documents/appdata",
            "testResultsDir": "test-results",
            "veUserFavorites": "~/sodaFavorites.json",
            "veUserSettings": "~/sodaSettings.json",
            "interactiveMode": false,
            "stopOnOrphanedAction": true,
            "stopOnFailure": false,
            "sendTestResults": false,
            "sendModuleResults": true,
            "sendSuiteResults": true,
            "takeScreenshotOnFailure": true,
            "reportJSON": true,
            "findElementRetries": 500,
            "testingInProgress": false,
            "maxBuffer": 1048576,
            "defaultVariableFormat": {},
            "startMaximized": false,
            "incognito": false,
            "console": {
                "supress": false,
                "color": true,
                "log": {
                    "warnings": true,
                    "errors": true,
                    "debug": true,
                    "log": true,
                    "verbose": true,
                    "pass": true,
                    "fail": true,
                    "start": true,
                    "comment": true
                },
                "colors": {
                    "debug": 242,
                    "log": 45,
                    "message": 45,
                    "error": 160,
                    "warning": 214,
                    "verbose": 45,
                    "pass": 82,
                    "fail": 160,
                    "start": 82,
                    "comment": 199
                }
            },
            "suite": "system",
            "module": "standard",
            "test": "001",
            "action": "001-vars",
            "platform": "rest",
            "syntax": {
                "name": "web",
                "version": "1.0",
                "actionPaths": [
                    "screen/components/*/",
                    "popup/components/*/",
                    "menu/components/*/",
                    "actions/*/"
                ]
            },
            "resetDevice": false,
            "useTemplate": true,
            "createLogs": false,
            "windowsServerIP": "10.34.167.245",
            "windowsServerPort": 11000,
            "perfectoHost": "https://subdomain.perfectomobile.com",
            "perfectoHostOnly": "subdomain.perfectomobile.com",
            "perfectoUser": process.env.PERFECTO_USER,
            "perfectoPassword": "something",
            "perfectoImageRepository": "PUBLIC:soda",
            "perfectoScriptRepository": "PUBLIC:sodascripts",
            "perfectoImageArea": "media",
            "codeSignIdentity": "iPhone Distribution",
            "provisioningProfile": "Soda Profile",
            "testURL": "about:blank",
            "variableExcelFile": "",
            "variableJSONFile": "",
            "storeiOSTrace": "~/Desktop/1543523235590.tracetemplate",
            "maintainer": {
                "name": "James Pavlic",
                "email": "james.pavlic@Ally.com"
            },
            "devDistro": [
                "james.pavlic@Ally.com"
            ],
            "failureDistro": [
                "james.pavlic@Ally.com"
            ],
            "smtpConnectionString": "smtp://mailhost.ally.corp",
            "bareSmtpConnectionString": "mailhost.ally.corp",
            "smtpFromAddress": "sODA",
            "testMailSubjects": {
                "testPass": "Test: Pass",
                "testFail": "Test: Failed",
                "modulePass": "Module: Pass",
                "moduleFail": "Module: Failed",
                "suitePass": "Suite: Pass",
                "suiteFail": "Suite: Failed"
            },
            "ignoreFileChanges": true,
            "noTitle": true,
            "resultJSON": "~/Documents/appdata/[type]_results_[yyyymmdd].json",
            "logSupressed": false,
            "logDebug": true,
            "logVerbose": true,
            "useChromeServer": false,
            "alias": "SystemMonitoring-Soda",
            "test-last": "001",
            "variableFormat": {}
        },
        "trace": [
            {
                "timestamp": 1543523397613,
                "date": "2018-11-29 15:29:57",
                "type": "device",
                "interaction": "goto",
                "event": 0,
                "error": null,
                "options": {
                    "url": "https://someexampledomain.com/index.jsp"
                }
            },
            {
                "timestamp": 1543523402838,
                "date": "2018-11-29 15:30:02",
                "type": "element",
                "interaction": "setValue",
                "event": 1,
                "error": null,
                "targets": [
                    {
                        "id": "username",
                        "type": "input",
                        "name": [
                            "",
                            "x-form-text",
                            "x-form-field"
                        ],
                        "label": "username",
                        "rect": {
                            "origin": {
                                "x": 906,
                                "y": 141
                            },
                            "size": {
                                "width": 240,
                                "height": 17
                            }
                        },
                        "enabled": true,
                        "visible": true,
                        "hasKeyboardFocus": false,
                        "attributes": {
                            "type": "text",
                            "size": "20",
                            "autocomplete": "off",
                            "id": "username",
                            "name": "username",
                            "class": " x-form-text x-form-field",
                            "tabindex": "1",
                            "style": "width: 232px; height: auto;"
                        },
                        "valid": true,
                        "index": 0,
                        "parent": {
                            "id": "ext-gen28",
                            "name": [
                                "x-table-layout-cell"
                            ],
                            "label": null,
                            "value": null
                        },
                        "hitpoint": {
                            "x": 1026,
                            "y": 149.5
                        },
                        "level": 11
                    }
                ],
                "options": {
                    "value": "USERNAME",
                    "mask": false
                }
            },
            {
                "timestamp": 1543523402920,
                "date": "2018-11-29 15:30:02",
                "type": "element",
                "interaction": "setValue",
                "event": 2,
                "error": null,
                "targets": [
                    {
                        "id": "password",
                        "type": "input",
                        "name": [
                            "",
                            "x-form-text",
                            "x-form-field"
                        ],
                        "label": "password",
                        "rect": {
                            "origin": {
                                "x": 906,
                                "y": 186
                            },
                            "size": {
                                "width": 240,
                                "height": 17
                            }
                        },
                        "enabled": true,
                        "visible": true,
                        "hasKeyboardFocus": false,
                        "attributes": {
                            "type": "password",
                            "size": "20",
                            "autocomplete": "off",
                            "id": "password",
                            "name": "password",
                            "class": " x-form-text x-form-field",
                            "tabindex": "2",
                            "style": "width: 232px; height: auto;"
                        },
                        "valid": true,
                        "index": 0,
                        "parent": {
                            "id": "ext-gen31",
                            "name": [
                                "x-table-layout-cell"
                            ],
                            "label": null,
                            "value": null
                        },
                        "hitpoint": {
                            "x": 1026,
                            "y": 194.5
                        },
                        "level": 11
                    }
                ],
                "options": {
                    "value": "PASSWORD",
                    "mask": false
                }
            }
        ]
    };

      var assetCollection = new AssetCollection(soda, path.join(__dirname, '..', 'sample_project'));

      assetCollection.load(function(err, result) {
        assetCollection.saveTrace(trace, testResult, function(err) {
          sinon.assert.called(spy);

          assetCollection.unload();
          expect(assetCollection.getAllSuites()).toEqual(null);
          
          done();
        });
      });
    });
});
