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

var path   = require("path"),
    Config   = require(path.join(__dirname, "..", "SodaCommon", "Config")),
    fs     = require("fs"),
    os     = require("os");

require(path.join(__dirname, "..", "SodaCommon", "ProtoLib"));

describe('SodaCommon Config should work properly', function () {
    var config;

    beforeAll(function () {
        config = new Config();
    });

    it('SodaConfig root should have default value', function () {
        expect(config.get("root")).toEqual(path.join(__dirname, ".."));
    });

    it('SodaConfig androidSDKPath should have default value', function () {
        expect(config.get("androidSDKPath")).toEqual(path.join(os.homedir(), 'Library', 'Android', 'sdk'));
    });

    it('SodaConfig androidBuildToolsPath should have default value', function () {
        expect(config.get("androidBuildToolsPath")).toEqual(path.join(os.homedir(), 'Library', 'Android', 'sdk', "build-tools", "28.0.3"));
    });

    it('SodaConfig core should have default value', function () {
        expect(config.get("core")).toEqual(path.join(__dirname, "..", "SodaCore"));
    });

    it('SodaConfig env should have default value', function () {
        expect(config.get("env")).toEqual('env');
    });

    it('SodaConfig SSOnDOM should have default value', function () {
        expect(config.get("SSOnDOM")).toEqual(false);
    });

    it('SodaConfig treeHashes should have default value', function () {
        expect(config.get("treeHashes")).toEqual({});
    });

    it('SodaConfig SSOnDOMDir should have default value', function () {
        expect(config.get("SSOnDOMDir")).toEqual(path.join(os.homedir(), 'AppScreenShots'));
    });

    it('SodaConfig proxy should have default value', function () {
        if (config.get("proxy")) {
            expect(config.get("proxy")).toBeInstanceOf(String);
        }
        else {
            expect(config.get("proxy")).toEqual(undefined);
        }
    });

    it('SodaConfig sodaRootId should have default value', function () {
        expect(config.get("sodaRootId")).toEqual('soda-uid-root');
    });

    it('SodaConfig userHome should have default value', function () {
        expect(config.get("userHome")).toEqual(os.homedir());
    });

    it('SodaConfig userName should have default value', function () {
        expect(config.get("userName")).toEqual(os.platform() === "win32" ? os.homedir().slice(9) : os.homedir().slice(7));
    });

    it('SodaConfig temp should have default value', function () {
        expect(config.get("temp")).toEqual(path.join(os.tmpdir(), ".sodatemp"));
    });

    it('SodaConfig timeToWaitForScreenShot should have default value', function () {
        expect(config.get("timeToWaitForScreenShot")).toEqual(100);
    });

    it('SodaConfig seleniumChromeServer should have default value', function () {
        expect(config.get("seleniumChromeServer")).toEqual('http://localhost:9515/');
    });

    it('SodaConfig seleniumIEServer should have default value', function () {
        expect(config.get("seleniumIEServer")).toEqual('http://localhost:9515/');
    });

    it('SodaConfig command should have default value', function () {
        expect(config.get("command")).toEqual('run');
    });

    it('SodaConfig port should have default value', function () {
        expect(config.get("port")).toEqual(1337);
    });

    it('SodaConfig pid should have default value', function () {
        expect(config.get("pid")).toEqual(process.pid);
    });

    it('SodaConfig framework should have default value', function () {
        expect(config.get("framework")).toEqual("");
    });

    it('SodaConfig say should have default value', function () {
        expect(config.get("say")).toEqual(false);
    });


    it('SodaConfig devMode should have default value', function () {
        expect(config.get("devMode")).toEqual(false);
    });

    it('SodaConfig maxFileScanDepth should have default value', function () {
        expect(config.get("maxFileScanDepth")).toEqual(4);
    });

    it('SodaConfig defaultSyntaxName should have default value', function () {
        expect(config.get("defaultSyntaxName")).toEqual("web");
    });


    it('SodaConfig defaultSyntaxVersion should have default value', function () {
        expect(config.get("defaultSyntaxVersion")).toEqual("1.0");
    });

    it('SodaConfig ignoreTestDirectories should have default value', function () {
        expect(config.get("ignoreTestDirectories")).toEqual([
            ".git",
            "test-results",
            "test-results-editor",
        ]);
    });

    it('SodaConfig traceInteractions should have default value', function () {
        expect(config.get("traceInteractions")).toEqual(true);
    });

    it('SodaConfig resultsJSON should have default value', function () {
        expect(config.get("resultsJSON")).toEqual(path.join("[test_path]", "[test_results_dir]", "[type]_results_[host]_[platform]_[yyyymmdd].json"));
    });

    it('SodaConfig resultsScreenshot should have default value', function () {
        expect(config.get("resultsScreenshot")).toEqual(path.join("[test_path]", "[test_results_dir]", "failures", "failure_[fid]_[reason].png"));
    });

    it('SodaConfig treeScreenshot should have default value', function () {
        expect(config.get("treeScreenshot")).toEqual(path.join("[test_path]", "[test_results_dir]", "traces", "tree_[host]_[yyyymmdd]_[now].json"));
    });

    it('SodaConfig resultsTrace should have default value', function () {
        expect(config.get("resultsTrace")).toEqual(path.join("[test_path]", "[test_results_dir]", "traces", "trace_[host]_[yyyymmdd]_[now].json"));
    });

    it('SodaConfig testPath should have default value', function () {
        expect(config.get("testPath")).toEqual(process.cwd());
    });

    it('SodaConfig testResultsDir should have default value', function () {
        expect(config.get("testResultsDir")).toEqual("test-results");
    });

    it('SodaConfig veUserFavorites should have default value', function () {
        expect(config.get("veUserFavorites")).toEqual(path.join(os.homedir(), "sodaFavorites.json"));
    });

    it('SodaConfig veUserSettings should have default value', function () {
        expect(config.get("veUserSettings")).toEqual(path.join(os.homedir(), "sodaSettings.json"));
    });

    it('SodaConfig interactiveMode should have default value', function () {
        expect(config.get("interactiveMode")).toEqual(true);
    });

    it('SodaConfig stopOnOrphanedAction should have default value', function () {
        expect(config.get("stopOnOrphanedAction")).toEqual(true);
    });

    it('SodaConfig stopOnFailure should have default value', function () {
        expect(config.get("stopOnFailure")).toEqual(false);
    });

    it('SodaConfig sendTestResults should have default value', function () {
        expect(config.get("sendTestResults")).toEqual(false);
    });

    it('SodaConfig sendModuleResults should have default value', function () {
        expect(config.get("sendModuleResults")).toEqual(true);
    });

    it('SodaConfig sendSuiteResults should have default value', function () {
        expect(config.get("sendSuiteResults")).toEqual(true);
    });

    it('SodaConfig takeScreenshotOnFailure should have default value', function () {
        expect(config.get("takeScreenshotOnFailure")).toEqual(true);
    });

    it('SodaConfig reportJSON should have default value', function () {
        expect(config.get("reportJSON")).toEqual(true);
    });

    it('SodaConfig findElementRetries should have default value', function () {
        expect(config.get("findElementRetries")).toEqual(3);
    });

    it('SodaConfig testingInProgress should have default value', function () {
        expect(config.get("testingInProgress")).toEqual(false);
    });

    it('SodaConfig maxBuffer should have default value', function () {
        expect(config.get("maxBuffer")).toEqual(2048 * 512);
    });

    it('SodaConfig defaultVariableFormat should have default value', function () {
        expect(config.get("defaultVariableFormat")).toEqual(/(\$\{\s*([_a-zA-Z0-9\-](?:\.?[_a-zA-Z0-9\-])*)\s*})/g);
    });

    it('SodaConfig defaultVariableMatch should have default value', function () {
        expect(config.get("defaultVariableMatch")).toBeInstanceOf(Function);
    });

    it('SodaConfig console should have default values', function () {
        expect(config.get("console")).toEqual({
            supress : false,
            color   : true,

            log: {
                warnings : true,
                errors   : true,
                debug    : true,
                log      : true,
                verbose  : true,
                pass     : true,
                fail     : true,
                start    : true,
                comment  : true
            },
            colors: {
                debug    : 242,
                log      : 45,
                message  : 45,
                error    : 160,
                warning  : 214,
                verbose  : 45,
                pass     : 82,
                fail     : 160,
                start    : 82,
                comment  : 199
            }
        });
    });

    it('SodaConfig suite should have default value', function () {
        expect(config.get("suite")).toEqual("my_suite");
    });

    it('SodaConfig module should have default value', function () {
        expect(config.get("module")).toEqual("my_module");
    });

    it('SodaConfig test should have default value', function () {
        expect(config.get("test")).toEqual("001");
    });

    it('SodaConfig action should have default value', function () {
        expect(config.get("action")).toEqual("001-vars");
    });

    it('SodaConfig platform should have default value', function () {
        expect(config.get("platform")).toEqual("puppeteer");
    });

    it('SodaConfig syntax should have default value', function () {
        expect(config.get("syntax")).toEqual({ name: "web", version: "1.0" });
    });

    it('SodaConfig resetDevice should have default value', function () {
        expect(config.get("resetDevice")).toEqual(false);
    });

    it('SodaConfig useTemplate should have default value', function () {
        expect(config.get("useTemplate")).toEqual(true);
    });

    it('SodaConfig createLogs should have default value', function () {
        expect(config.get("createLogs")).toEqual(false);
    });

    it('SodaConfig windowsServerIP should have default value', function () {
        expect(config.get("windowsServerIP")).toEqual(os.homedir().indexOf("ID") > -1 ? "127.0.0.1" : "127.0.0.1");
    });

    it('SodaConfig windowsServerPort should have default value', function () {
        expect(config.get("windowsServerPort")).toEqual(11000);
    });

    it('SodaConfig perfectoHost should have default value', function () {
        expect(config.get("perfectoHost")).toEqual('https://mydomain.perfectomobile.com');
    });

    it('SodaConfig perfectoUser should have default value', function () {
        expect(config.get("perfectoUser")).toEqual(process.env.PERFECTO_USER);
    });

    it('SodaConfig perfectoPassword should have default value', function () {
        expect(config.get("perfectoPassword")).toEqual('something');
    });

    it('SodaConfig perfectoImageRepository should have default value', function () {
        expect(config.get("perfectoImageRepository")).toEqual('PUBLIC:soda');
    });

    it('SodaConfig perfectoImageArea should have default value', function () {
        expect(config.get("perfectoImageArea")).toEqual('media');
    });

    it('SodaConfig provisioningProfile should have default value', function () {
        expect(config.get("provisioningProfile")).toEqual('Soda Profile');
    });

    it('SodaConfig storeiOSTrace should have default value', function () {
        expect(config.get("storeiOSTrace")).toContain(os.homedir(), "Desktop", ".tracetemplate");
    });

    it('SodaConfig maintainer should have default value', function () {
        expect(config.get("maintainer")).toEqual({
            name  : process.env.MAINTAINER_NAME,
            email : process.env.MAINTAINER_EMAIL
        });
    });

    it('SodaConfig devDistro should have default value', function () {
        expect(config.get("devDistro")).toEqual([process.env.MAINTAINER_EMAIL]);
    });

    it('SodaConfig smtpConnectionString should have default value', function () {
        expect(config.get("smtpConnectionString")).toEqual('smtp://'+process.env.SMTP_HOST);
    });

    it('SodaConfig smtpFromAddress should have default value', function () {
        expect(config.get("smtpFromAddress")).toEqual(process.env.SMTP_FROM_ADDRESS);
    });

    it('SodaConfig testMailSubjects should have default value', function () {
        expect(config.get("testMailSubjects")).toEqual({
            testPass         : 'Test: Pass', // Unused
            testFail         : 'Test: Failed',
            modulePass       : 'Module: Pass',
            moduleFail       : 'Module: Failed',
            suitePass        : 'Suite: Pass',
            suiteFail        : 'Suite: Failed'
        });
    });

    it('SodaConfig get, set and delete should function properly', function () {
        expect(config.get("newVariable")).toEqual(undefined);
        config.set("newVariable", "test");
        expect(config.get("newVariable")).toEqual("test");
        config.delete("newVariable");
        expect(config.get("newVariable")).toEqual(undefined);
    });
});
