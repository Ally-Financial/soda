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

var sinon = require('sinon'),
    path   = require("path"),
    fs     = require("fs"),
    Soda   = require(path.join(__dirname, "..", "SodaCore", "lib", "Soda")),
    events = require("events"),
    child_process = require('child_process');

require(path.join(__dirname, "..", "SodaCommon", "ProtoLib"));

Object.freeze = function(obj) { return obj; };

describe('Framework automator should pass all validation tests', function () {
  var soda, automatorFramework, settings, buildTree, emulatorControl, deviceInteractions, elementInteractions, execSync, exec, spawn, stat, exists, readdir, extname, readfile, spy1, spy2, spy3, spy4, spy5, spy6, spy7, spy8;

    beforeAll(function (done) {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 300000;

      execSync = child_process.execSync;
      exec = child_process.exec;
      spawn = child_process.spawn;
      stat = fs.stat;
      exists = fs.exists;
      readdir = fs.readdir;
      extname = path.extname;
      readfile = fs.readFile;

      soda = new Soda({ testPath: path.join(__dirname, '..', 'sample_project'), logSupressed: true });

      soda.init(function() {
        soda.config.set("headless", true, true, true);
        
          automatorFramework = require(path.join(__dirname, "..", "SodaCore", "frameworks", "automator"))(soda);
          soda.framework = automatorFramework;
          settings  = require(path.join(__dirname, "..", "SodaCore", "frameworks", "automator", "imports", "Config.js"))(soda);
          buildTree = require(path.join(__dirname, "..", "SodaCore", "frameworks", "automator", "imports", "BuildTree.js"));
          emulatorControl = new (require(path.join(__dirname, "..", "SodaCore", "frameworks", "automator", "imports", "EmulatorControl.js")))(soda, settings);
          deviceInteractions  = new (require(path.join(__dirname, "..", "SodaCore", "frameworks", "automator", "imports", "DeviceInteractions.js")))(soda, settings, emulatorControl);
          elementInteractions = new (require(path.join(__dirname, "..", "SodaCore", "frameworks", "automator", "imports", "ElementInteractions.js")))(soda, settings, emulatorControl);

          done();
      });
    });

    beforeEach(function (done) {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

      var screen = "<?xml version='1.0' encoding='UTF-8' standalone='yes' ?><hierarchy rotation='0'><node index='0' text='' resource-id='' class='android.widget.FrameLayout' package='com.ally.MobileBanking.debug' content-desc='' checkable='false' checked='false' clickable='false' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[0,0][1440,2368]'><node index='0' text='' resource-id='' class='android.widget.LinearLayout' package='com.ally.MobileBanking.debug' content-desc='' checkable='false' checked='false' clickable='false' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[0,0][1440,2368]'><node index='0' text='' resource-id='' class='android.widget.FrameLayout' package='com.ally.MobileBanking.debug' content-desc='' checkable='false' checked='false' clickable='false' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[0,100][1440,2368]'><node index='0' text='' resource-id='com.ally.MobileBanking.debug:id/action_bar_root' class='android.widget.FrameLayout' package='com.ally.MobileBanking.debug' content-desc='' checkable='false' checked='false' clickable='false' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[0,100][1440,2368]'><node index='0' text='' resource-id='android:id/content' class='android.widget.FrameLayout' package='com.ally.MobileBanking.debug' content-desc='' checkable='false' checked='false' clickable='false' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[0,100][1440,2368]'><node index='0' text='' resource-id='' class='android.widget.LinearLayout' package='com.ally.MobileBanking.debug' content-desc='' checkable='false' checked='false' clickable='false' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[0,100][1440,2368]'><node index='0' text='' resource-id='com.ally.MobileBanking.debug:id/activity_content' class='android.widget.FrameLayout' package='com.ally.MobileBanking.debug' content-desc='' checkable='false' checked='false' clickable='false' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[0,100][1440,2368]'><node index='0' text='' resource-id='' class='android.widget.LinearLayout' package='com.ally.MobileBanking.debug' content-desc='' checkable='false' checked='false' clickable='false' enabled='true' focusable='true' focused='true' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[0,100][1440,2368]'><node index='0' text='' resource-id='com.ally.MobileBanking.debug:id/login_header' class='android.widget.RelativeLayout' package='com.ally.MobileBanking.debug' content-desc='' checkable='false' checked='false' clickable='false' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[0,100][1440,324]'><node index='0' text='About Us' resource-id='com.ally.MobileBanking.debug:id/login_header_about' class='android.widget.TextView' package='com.ally.MobileBanking.debug' content-desc='About us Button' checkable='false' checked='false' clickable='true' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[0,129][342,295]' /><node index='1' text='' resource-id='com.ally.MobileBanking.debug:id/login_header_logo' class='android.widget.ImageView' package='com.ally.MobileBanking.debug' content-desc='About Ally App' checkable='false' checked='false' clickable='true' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[572,112][868,312]' /><node index='2' text='' resource-id='' class='android.widget.LinearLayout' package='com.ally.MobileBanking.debug' content-desc='' checkable='false' checked='false' clickable='false' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[864,100][1440,324]'><node index='0' text='' resource-id='com.ally.MobileBanking.debug:id/login_header_settings' class='android.widget.ImageView' package='com.ally.MobileBanking.debug' content-desc='Settings' checkable='false' checked='false' clickable='true' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[864,116][1056,308]' /><node index='1' text='' resource-id='com.ally.MobileBanking.debug:id/login_header_flags' class='android.widget.ImageView' package='com.ally.MobileBanking.debug' content-desc='Settings' checkable='false' checked='false' clickable='true' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[1056,116][1248,308]' /><node index='2' text='' resource-id='com.ally.MobileBanking.debug:id/login_header_help' class='android.widget.ImageView' package='com.ally.MobileBanking.debug' content-desc='Help' checkable='false' checked='false' clickable='true' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[1248,116][1440,308]' /></node></node><node index='1' text='' resource-id='com.ally.MobileBanking.debug:id/scrollView' class='android.widget.ScrollView' package='com.ally.MobileBanking.debug' content-desc='' checkable='false' checked='false' clickable='false' enabled='true' focusable='true' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[0,324][1440,2128]'><node index='0' text='' resource-id='com.ally.MobileBanking.debug:id/auth_layout' class='android.widget.LinearLayout' package='com.ally.MobileBanking.debug' content-desc='' checkable='false' checked='false' clickable='false' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[0,324][1440,2128]'><node index='0' text='' resource-id='' class='android.widget.LinearLayout' package='com.ally.MobileBanking.debug' content-desc='' checkable='false' checked='false' clickable='false' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[0,324][1440,1521]'><node index='0' text='' resource-id='com.ally.MobileBanking.debug:id/input_layout_username' class='android.widget.LinearLayout' package='com.ally.MobileBanking.debug' content-desc='' checkable='false' checked='false' clickable='false' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[64,388][1376,613]'><node index='0' text='' resource-id='' class='android.widget.FrameLayout' package='com.ally.MobileBanking.debug' content-desc='' checkable='false' checked='false' clickable='false' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[64,432][1376,613]'><node index='0' text='Username' resource-id='com.ally.MobileBanking.debug:id/edittext_login_username' class='android.widget.EditText' package='com.ally.MobileBanking.debug' content-desc='Username' checkable='false' checked='false' clickable='true' enabled='true' focusable='true' focused='false' scrollable='false' long-clickable='true' password='false' selected='false' bounds='[64,432][1376,613]' /></node></node><node index='1' text='' resource-id='com.ally.MobileBanking.debug:id/input_layout_password' class='android.widget.LinearLayout' package='com.ally.MobileBanking.debug' content-desc='' checkable='false' checked='false' clickable='false' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[64,633][1376,869]'><node index='0' text='' resource-id='' class='android.widget.FrameLayout' package='com.ally.MobileBanking.debug' content-desc='' checkable='false' checked='false' clickable='false' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[64,677][1376,869]'><node index='0' text='Password' resource-id='com.ally.MobileBanking.debug:id/edittext_auth_password' class='android.widget.EditText' package='com.ally.MobileBanking.debug' content-desc='' checkable='false' checked='false' clickable='true' enabled='true' focusable='true' focused='false' scrollable='false' long-clickable='true' password='true' selected='false' bounds='[64,677][1376,869]' /><node index='1' text='' resource-id='com.ally.MobileBanking.debug:id/text_input_password_toggle' class='android.widget.ImageButton' package='com.ally.MobileBanking.debug' content-desc='toggle to display password text' checkable='true' checked='false' clickable='true' enabled='true' focusable='true' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[1184,677][1376,869]' /></node></node><node index='2' text='Save Username' resource-id='com.ally.MobileBanking.debug:id/chkbox_login_saveUsername' class='android.widget.CheckBox' package='com.ally.MobileBanking.debug' content-desc='Save Username' checkable='true' checked='false' clickable='true' enabled='true' focusable='true' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[64,901][637,1029]' /><node index='3' text='Submit' resource-id='com.ally.MobileBanking.debug:id/btn_login_login' class='android.widget.Button' package='com.ally.MobileBanking.debug' content-desc='' checkable='false' checked='false' clickable='true' enabled='false' focusable='true' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[64,1061][1376,1301]' /><node index='4' text='' resource-id='' class='android.widget.LinearLayout' package='com.ally.MobileBanking.debug' content-desc='' checkable='false' checked='false' clickable='false' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[64,1301][1376,1457]'><node index='0' text='Forgot username' resource-id='com.ally.MobileBanking.debug:id/textview_auth_forgot_username' class='android.widget.TextView' package='com.ally.MobileBanking.debug' content-desc='Forgot &lt;u&gt;username&lt;/u&gt;' checkable='false' checked='false' clickable='true' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[334,1341][758,1417]' /><node index='1' text=' or password?' resource-id='com.ally.MobileBanking.debug:id/textview_auth_forgot_password' class='android.widget.TextView' package='com.ally.MobileBanking.debug' content-desc='Forgot Password' checkable='false' checked='false' clickable='true' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[758,1341][1106,1417]' /></node></node><node index='1' text='' resource-id='' class='android.view.View' package='com.ally.MobileBanking.debug' content-desc='' checkable='false' checked='false' clickable='false' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[0,1521][1440,1778]'><node index='0' text='Passcode' resource-id='com.ally.MobileBanking.debug:id/auth_passcode_layout' class='android.widget.TextView' package='com.ally.MobileBanking.debug' content-desc='' checkable='false' checked='false' clickable='true' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[560,1521][880,1738]' /></node><node index='2' text='' resource-id='' class='android.view.View' package='com.ally.MobileBanking.debug' content-desc='' checkable='false' checked='false' clickable='false' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[0,1778][1440,1788]' /><node index='3' text='' resource-id='' class='android.widget.LinearLayout' package='com.ally.MobileBanking.debug' content-desc='' checkable='false' checked='false' clickable='false' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[0,1788][1440,2128]'><node index='0' text='' resource-id='' class='android.widget.LinearLayout' package='com.ally.MobileBanking.debug' content-desc='' checkable='false' checked='false' clickable='false' enabled='true' focusable='true' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[64,1852][980,1938]'><node index='0' text='Ally Financial Inc.' resource-id='com.ally.MobileBanking.debug:id/textview_auth_footer_allybank' class='android.widget.TextView' package='com.ally.MobileBanking.debug' content-desc='' checkable='false' checked='false' clickable='false' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[64,1852][560,1938]' /><node index='1' text='©' resource-id='com.ally.MobileBanking.debug:id/textview_auth_footer_copyright' class='android.widget.TextView' package='com.ally.MobileBanking.debug' content-desc='' checkable='false' checked='false' clickable='false' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[576,1852][626,1938]' /><node index='2' text='2009 - 2020' resource-id='com.ally.MobileBanking.debug:id/textview_auth_footer_year' class='android.widget.TextView' package='com.ally.MobileBanking.debug' content-desc='' checkable='false' checked='false' clickable='false' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[642,1852][980,1938]' /></node><node index='1' text='' resource-id='' class='android.widget.LinearLayout' package='com.ally.MobileBanking.debug' content-desc='' checkable='false' checked='false' clickable='false' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[64,1938][803,2064]'><node index='0' text=' Privacy Policy ' resource-id='com.ally.MobileBanking.debug:id/textview_auth_footer_privacy' class='android.widget.TextView' package='com.ally.MobileBanking.debug' content-desc='Privacy Policy link' checkable='false' checked='false' clickable='true' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[64,1938][493,2064]' /><node index='1' text='|' resource-id='com.ally.MobileBanking.debug:id/textview_auth_footer_separator' class='android.widget.TextView' package='com.ally.MobileBanking.debug' content-desc='' checkable='false' checked='false' clickable='false' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[509,1958][525,2044]' /><node index='2' text='  Security ' resource-id='com.ally.MobileBanking.debug:id/textview_auth_footer_security' class='android.widget.TextView' package='com.ally.MobileBanking.debug' content-desc='Security link' checkable='false' checked='false' clickable='true' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[525,1938][803,2064]' /></node></node></node></node><node index='2' text='' resource-id='' class='android.widget.LinearLayout' package='com.ally.MobileBanking.debug' content-desc='' checkable='false' checked='false' clickable='false' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[0,2128][1440,2368]'><node index='0' text='' resource-id='com.ally.MobileBanking.debug:id/login_footer_findatms' class='android.widget.LinearLayout' package='com.ally.MobileBanking.debug' content-desc='' checkable='false' checked='false' clickable='true' enabled='true' focusable='true' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[0,2128][741,2368]'><node index='0' text='' resource-id='' class='android.widget.ImageView' package='com.ally.MobileBanking.debug' content-desc='Find ATMs button' checkable='false' checked='false' clickable='false' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[149,2184][277,2312]' /><node index='1' text='Find ATMs' resource-id='' class='android.widget.TextView' package='com.ally.MobileBanking.debug' content-desc='Find ATMs button' checkable='false' checked='false' clickable='false' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[289,2205][592,2291]' /></node><node index='1' text='' resource-id='com.ally.MobileBanking.debug:id/login_footer_callus' class='android.widget.LinearLayout' package='com.ally.MobileBanking.debug' content-desc='' checkable='false' checked='false' clickable='true' enabled='true' focusable='true' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[703,2128][1440,2368]'><node index='0' text='' resource-id='' class='android.widget.ImageView' package='com.ally.MobileBanking.debug' content-desc='Call us button' checkable='false' checked='false' clickable='false' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[901,2184][1029,2312]' /><node index='1' text='Call Us' resource-id='' class='android.widget.TextView' package='com.ally.MobileBanking.debug' content-desc='Call us button' checkable='false' checked='false' clickable='false' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[1041,2205][1241,2291]' /></node><node index='2' text='' resource-id='' class='android.widget.LinearLayout' package='com.ally.MobileBanking.debug' content-desc='' checkable='false' checked='false' clickable='false' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[714,2128][726,2368]'><node index='0' text='' resource-id='' class='android.view.View' package='com.ally.MobileBanking.debug' content-desc='' checkable='false' checked='false' clickable='false' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[714,2168][718,2328]' /></node></node></node></node></node></node></node></node></node><node index='1' text='' resource-id='android:id/statusBarBackground' class='android.view.View' package='com.ally.MobileBanking.debug' content-desc='' checkable='false' checked='false' clickable='false' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[0,0][1440,100]' /><node index='2' text='' resource-id='android:id/navigationBarBackground' class='android.view.View' package='com.ally.MobileBanking.debug' content-desc='' checkable='false' checked='false' clickable='false' enabled='true' focusable='false' focused='false' scrollable='false' long-clickable='false' password='false' selected='false' bounds='[0,2368][1440,2560]' /></node></hierarchy>";

      spy1 = sinon.stub(fs, 'exists').yieldsAsync(true);

      spy2 = sinon.stub(fs, 'readdir').yieldsAsync(null, ["Alcatel_API_29.avd",  "Nexus_S_API_29.avd", "Pixel_XL_API_29.avd"]);

      spy3 = sinon.stub(fs, 'readFile').yieldsAsync(null, screen);

      spy4 = sinon.stub(path, 'extname').returns('.ini');

      spy5 = sinon.stub(child_process, 'execSync').returns('');

      spy6 = sinon.stub(child_process, 'exec').callsFake((command, func) => {
        var result = '';
        if (command.indexOf('adb kill-server &&') >= 0) {
          result = "* daemon not running; starting now at tcp:5037\n* daemon started successfully\nemulator-5554	device";
        }
        else if (command.indexOf('shell getprop sys.boot_completed') >= 0) {
          result = "1";
        }
        else if (command.indexOf('shell setprop persist.usb.serialno') >= 0) {
          result = "emulator-5554";
        }
        else if (command.indexOf('adb start-server') >= 0) {
          result = "";
        }
        else if (command.indexOf('adb devices') >= 0) {
          result = "List of devices attached\n* daemon not running; starting now at tcp:5037\n* daemon started successfully\nemulator-5554	device";
        }
        else if (command.indexOf('adb -s emulator-5554 shell pm list packages com.test.AppName') >= 0) {
          result = "package:com.test.AppName";
        }
        else if (command.indexOf('adb -s emulator-5554 install -r ~/Documents/AppName-release.apk') >= 0) {
          result = "~/Documents/AppName-relea... 116.1 MB/s (15457311 bytes in 0.127s)\n	pkg: /data/local/tmp/AppName-release.apk\nSuccess";
        }
        else if (command.indexOf('adb -s emulator-5554 uninstall com.test.AppName') >= 0) {
          result = "Success";
        }
        else if (command.indexOf('-c android.intent.category.LAUNCHER') >= 0) {
          result = null;
        }
        else if (command.indexOf('shell input keyevent') >= 0) {
          result = null;
        }
        else if (command.indexOf('shell input tap') >= 0) {
          result = "Success";
        }
        else if (command.indexOf('shell dumpsys input') >= 0) {
          result = "0";
        }
        else if (command.indexOf('shell wm size') >= 0) {
          result = "Physical size: 1080x1920";
        }
        else if (command.indexOf('shell uiautomator dump') >= 0) {
          result = screen;
        }
        else if (command.indexOf('adb -s ') >= 0) {
          result = "EMULATOR28X0X23X0";
        }
        else if (command.indexOf('aapt dump badging') >= 0) {
          result = "package: name='com.test.AppName' versionCode='40' versionName='3.1.0.9' platformBuildVersionName='5.1.1-1819727'";
        }
        else if (command.indexOf('shell am force-stop') >= 0) {
          result = "";
        }
        

        func(null, result);
      });

      let spawnEvent = new events.EventEmitter();
      spawnEvent.stdout = new events.EventEmitter();
      spawnEvent.stderr = new events.EventEmitter();

      spy7 = sinon.stub(child_process, 'spawn').returns(spawnEvent);

      // and emit your event
      spawnEvent.stdout.emit('data', 'emulator-5554');
      spawnEvent.stderr.emit('data', '');

      spy8 = sinon.stub(fs, 'stat').callsFake((command, func) => {
        func(null, {
                    isFile: function() { return true },
                    isDirectory: function() { return true; },
                    dev: 16777220,
                    mode: 16877,
                    nlink: 18,
                    uid: 1334043681,
                    gid: 20,
                    rdev: 0,
                    blksize: 4194304,
                    ino: 27859880,
                    size: 576,
                    blocks: 0,
                    atimeMs: 1551386074856.6555,
                    mtimeMs: 1551380224400.358,
                    ctimeMs: 1551380224400.358,
                    birthtimeMs: 1488209437000 });
                  });

      done();
    });

    afterEach(function (done) {
      spy1.restore();
      spy2.restore();
      spy3.restore();
      spy4.restore();
      spy5.restore();
      spy6.restore();
      spy7.restore();
      spy8.restore();

      done();
    });

    afterAll(function (done) {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

      child_process.execSync = execSync;
      child_process.exec = exec;
      child_process.spawn = spawn
      fs.stat = stat;
      fs.exists = exists;
      fs.readdir = readdir;
      path.extname = extname;
      fs.readFile = readfile;

      soda.framework.stop(function(err, res) {
          soda.kill();

          soda = null;

          done();
      });
    });

    it('Should validate automator', function (done) {
      expect(automatorFramework.name).toEqual('Automator');
      expect(automatorFramework.platform).toEqual('Android');
      expect(automatorFramework.version).toEqual('1.0');
      expect(automatorFramework.defaultSyntaxVersion).toEqual('2.0');
      expect(automatorFramework.defaultSyntaxName).toEqual('mobile');

      done();
    });

    it('Should validate automator build with bad arguments', function (done) {
      try {
        automatorFramework.build("Nexus", function() {}, function(err, started, device) {
        });
      }
      catch (exception) {
        expect(exception.name).toEqual('InvalidArgumentsError');

        done();
      }

    });

    it('Should validate automator build with running device', function (done) {
      automatorFramework.build("emulator-5554", "~/Documents/AppName-release.apk", function(err) {
        expect(err).toEqual(null);

        done();
      });
    });

    it('Should validate automator build without a running device', function (done) {
      automatorFramework.build("emulator-5554", "~/Documents/AppName-release.apk", function(err) {
        expect(err).toEqual(null);

        done();
      });
    });

    it('Should listAvailableDevices for automator', function (done) {
      automatorFramework.listAvailableDevices(function(result) {
        expect(JSON.stringify(result)).toEqual(JSON.stringify(["Alcatel_API_29.avd","Nexus_S_API_29.avd","Pixel_XL_API_29.avd","5037","5554"]));
        done();
      });
    });

    it('Should restartApplication for automator', function (done) {
      automatorFramework.start("emulator-5554", "~/Documents/AppName-release.apk", {}, function(err, result) {
        expect(err).toEqual(null);
        expect(result).toEqual(true);

        automatorFramework.restartApplication(function() {
          automatorFramework.stop(function () {
            done();
          });
        });
      });
    });

    it('Should start for automator', function (done) {
      automatorFramework.start("emulator-5554", "~/Documents/AppName-release.apk", {}, function(err, result) {
        expect(err).toEqual(null);
        expect(result).toEqual(true);

        done();
      });
    });

    it('Should stop for automator', function (done) {
      automatorFramework.stop(function(err, result) {
        expect(err).toEqual(null);
        expect(result).toEqual(true);

        done();
      });
    });

    it('Should restart for automator', function (done) {
      automatorFramework.start("emulator-5554", "~/Documents/AppName-release.apk", {}, function(err, result) {
        expect(err).toEqual(null);
        expect(result).toEqual(true);

        automatorFramework.restart(function(err, result) {
          expect(err).toEqual(null);
          expect(result).toEqual(true);

          automatorFramework.stop(function () {
            done();
          });
        });
      });
    });

    it('Should perform element interaction', function (done) {
      automatorFramework.start("emulator-5554", "~/Documents/AppName-release.apk", {}, function(err, result) {
        expect(err).toEqual(null);
        expect(result).toEqual(true);

        var Tree = require(path.join(__dirname, "..", "SodaCore", "lib", "Tree"))(soda);
        var tree     = new Tree(JSON.parse(fs.readFileSync(path.join(__dirname, "trees", "LoginScreen.json")).toString('utf-8')));

        tree.findElementById('textfield:1', function(err, result) {
         expect(err).toEqual(null);
         expect(result.sodamembers).toEqual(1);

         automatorFramework.performElementInteraction("tap", result, {}, function(err, result) {
           expect(err).toEqual(null);
           expect(result).toEqual(true);

           automatorFramework.stop(function () {
            done();
          });
         });
        });
      });
    });

    it('Should perform device interaction', function (done) {
      automatorFramework.start("emulator-5554", "~/Documents/AppName-release.apk", {}, function(err, result) {
        expect(err).toEqual(null);
        expect(result).toEqual(true);

        automatorFramework.performDeviceInteraction("openApp", {}, function(err, result) {
          expect(err).toEqual(null);
          expect(result).toEqual(true);

          automatorFramework.stop(function () {
            done();
          });
        });
      });
    });

    it('Should getTree', function (done) {
      automatorFramework.start("emulator-5554", "~/Documents/AppName-release.apk", {}, function(err, result) {
        expect(err).toEqual(null);
        expect(result).toEqual(true);

        automatorFramework.getTree({}, function(err, result) {
          expect(err).toEqual(null);
          expect(result).toBeInstanceOf(Object);

          automatorFramework.stop(function () {
            done();
          });
        });
      });
    });

    it('Should getOrientation', function (done) {
      automatorFramework.start("emulator-5554", "~/Documents/AppName-release.apk", {}, function(err, result) {
        expect(err).toEqual(null);
        expect(result).toEqual(true);

        automatorFramework.getOrientation(function(err, result) {
          expect(err).toEqual(null);
          expect(result).toEqual(0);

          automatorFramework.stop(function () {
            done();
          });
        });
      });
    });

    it('Should getScreenBounds', function (done) {
      automatorFramework.start("emulator-5554", "~/Documents/AppName-release.apk", {}, function(err, result) {
        expect(err).toEqual(null);
        expect(result).toEqual(true);

        automatorFramework.getScreenBounds(function(err, result) {
          expect(err).toEqual(null);
          expect(JSON.stringify(result)).toEqual(JSON.stringify([ 1080, 1920 ]));

          automatorFramework.stop(function () {
            done();
          });
        });
      });
    });
});
