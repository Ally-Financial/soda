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
    Soda   = require(path.join(__dirname, "..", "SodaCore", "lib", "Soda")),
    Emailer   = require(path.join(__dirname, "..", "SodaCore", "EmailManager", "Emailer")),
    nodemailer    = require('nodemailer');

require(path.join(__dirname, "..", "SodaCommon", "ProtoLib"));

describe('Emailer should pass all validation tests', function () {
  var soda, emailer, dataWithFail, dataNoFail, moduleFail, moduleNoFail, suiteFail, suiteNoFail, fakeMailer, sendMail, createTransport, spy;
    beforeAll(function (done) {
      createTransport = nodemailer.createTransport;

      soda = new Soda({ testPath: path.join(__dirname, '..', 'sample_project'), logSupressed: true });

      soda.init(function() {
        soda.config.set("headless", true, true, true);
        
          emailer = new Emailer(soda);

          dataWithFail = {
                  title: "Email on its way",
                  subject: "Subject",
                  totalTests: 10,
                  passed: 9,
                  failed: 1,
                  stopped: 0,
                  started  : 1551200031706,
                  duration: 100,
                  test: "001",
                  module: "my_module",
                  suite: "my_suite",
                  platform: "web",
                  failureMessages: ["Should not have failed"],
                  reason: "Passed",
                  status: {
                      message         : 'Passed',
                      failed          : 1,
                      displayFailures : true,
                      color           : '#e5173e'
                  },
                  failed: "Should not have failed",
                  artifacts: {},
                  maintainer: {
                      name : soda.config.get("maintainer").name,
                      email: soda.config.get("maintainer").email
                  }
              };

              dataNoFail = {
                      title: "Email on its way",
                      subject: "Subject",
                      totalTests: 10,
                      passed: 10,
                      failed: 0,
                      stopped: 0,
                      started  : 1551200031706,
                      duration: 100,
                      test: "001",
                      module: "my_module",
                      suite: "my_suite",
                      platform: "web",
                      failureMessages: [],
                      reason: "Passed",
                      status: {
                          message         : 'Passed',
                          failed          : 1,
                          displayFailures : true,
                          color           : '#e5173e'
                      },
                      artifacts: {},
                      maintainer: {
                          name : soda.config.get("maintainer").name,
                          email: soda.config.get("maintainer").email
                      }
                  };

                  moduleFail = {
                    title: "Email on its way",
                    failureMessages: [],
                    subject: 'sODA Testing Report',
                    suite: 'my_suite',
                    module: 'my_module',
                    test: '',
                    platform: 'web',
                    started  : 1551200031706,
                    duration: 100,
                    totalTests: 10,
                    run: '1',
                    passed: 9,
                    failed: 1,
                    stopped: 0,
                    artifacts: {}
                  };

                  moduleNoFail = {
                    title: "Email on its way",
                    failureMessages: [],
                    subject: 'sODA Testing Report',
                    suite: 'my_suite',
                    module: 'my_module',
                    test: '',
                    platform: 'web',
                    started  : 1551200031706,
                    duration: 100,
                    totalTests: 10,
                    run: '1',
                    passed: 10,
                    failed: 0,
                    stopped: 0,
                    artifacts: {}
                  };

                  suiteFail = {
                    title: "Email on its way",
                    failureMessages: [],
                    subject: 'sODA Testing Report',
                    suite: 'my_suite',
                    module: '',
                    test: '',
                    platform: 'web',
                    started  : 1551200031706,
                    duration: 100,
                    totalTests: 10,
                    run: '1',
                    passed: 9,
                    failed: 1,
                    stopped: 0,
                    artifacts: {}
                  };

                  suiteNoFail = {
                    title: "Email on its way",
                    failureMessages: [],
                    subject: 'sODA Testing Report',
                    suite: 'my_suite',
                    module: '',
                    test: '',
                    platform: 'web',
                    started  : 1551200031706,
                    duration: 100,
                    totalTests: 10,
                    run: '1',
                    passed: 10,
                    failed: 0,
                    stopped: 0,
                    artifacts: {}
                  };

          fakeMailer = { sendMail: function(obj, cb) {
            cb(null, emailer);
          }};

          sinon.stub(nodemailer, 'createTransport').callsFake((options) => {
              return { sendMail: function(obj, cb) {
                cb(null, emailer);
              }};
          });

          done();
      });
    });

    afterAll(function (done) {
      nodemailer.createTransport = createTransport;

      soda.kill();
      
      soda = null;

      done();
    });

    afterEach(function() {
      fakeMailer.sendMail = sendMail;

      if (spy) {
        spy.restore();
      }
    });

    it('Should validate setData on an Emailer', function (done) {
      var result = emailer.setData(dataWithFail);

      expect(JSON.stringify(result)).toEqual(JSON.stringify({"title":"Subject","totalpassed":9,"totalfailed":"Should not have failed","totalstopped":0,"timestart":1551200031706,"totaltime":100,"test":"001","module":"my_module","suite":"my_suite","platform":"web","reason":"Passed","status":{"message":"Failed","failed":1,"displayFailures":true,"color":"#e5173e"},"failed":["Should not have failed"],"artifacts":{},"maintainer":{"name":process.env. MAINTAINER_NAME,"email":process.env.MAINTAINER_EMAIL}}));

      done();
    });

    it('Should validate failed sendTestReport of a test on an Emailer', function (done) {
      sendMail = fakeMailer.sendMail;

      spy = sinon.stub(fakeMailer, 'sendMail').callsFake((data, cb) => {
        expect(data.from).toEqual(process.env.SMTP_FROM_ADDRESS);
        expect(data.to).toEqual(process.env.SMTP_FROM_ADDRESS);
        expect(data.bcc).toEqual(process.env.MAINTAINER_EMAIL);
        expect(data.subject).toEqual('Subject');
        expect(data.text).toEqual('Email on its way\n=======================================================================================================\nTest Status          : Fail\nTotal Tests Ran      : 10\nTotal Passed         : 9\nTotal Failures       : Should not have failed\nTime Started         : 1551200031706\nTotal Exection Time  : 100\nsODA\nIf you think you\'ve received this email in error or wish to unsubscribe from these reports, contact: ' + process.env.MAINTAINER_EMAIL+'\n');
        expect(data.html).toEqual('<div style="padding: 20px; margin: 0; color: #333333; font-family: \'Helvetica Neue\', \'Helvetica\', \'Arial\', sans-serif;">\n    <h1 style="font-family: \'HelveticaNeue-Thin\', \'ArialNarrow\', \'Helvetica Neue\', \'Helvetica\', \'Arial\', sans-serif; font-weight: normal; font-size: 24px; border-bottom: 1px solid #e7e7e7; padding-bottom: 10px; color: #A21F9D; margin: 0">Failed report for <strong>001</b> test in <strong>my_module</b> module in <strong>my_suite</b> suite for <strong>web</b> platform</h1>\n    <div style="padding: 20px 0 0 0; margin-bottom: 20px; font-family: \'HelveticaNeue-Light\', \'Helvetica Neue\', \'Helvetica\', \'Arial\', sans-serif; font-size: 14px; border-top: 1px solid #e7e7e7; min-height: 20px;">\n        <div>\n          <h2 id="report-status" style="font-weight: bold; font-size: 20px; margin: 0; color: #e5173e">Failed</h2>\n          <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;"></div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Tests Ran</div></div>\n          <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;">9</div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Tests Passed</div></div>\n          <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;">Should not have failed</div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Failures</div></div>\n          <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;">0</div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Stopped</div></div>\n\n          <p style="font-weight: normal; font-size: 14px; margin: 10px 0 10px 0; color: #4C4C4C; border-top: 1px solid #e7e7e7; padding: 10px 0 0 0">The following Soda tests failed...</p>\n\n          <div bgcolor="#F7F7F7" style="background-color: #F7F7F7; border-radius: 6px; max-width: 100%; padding: 20px;">\n              <div style="margin-bottom: 15px; font-family: \'HelveticaNeue-Light\', \'Helvetica Neue\', \'Helvetica\', \'Arial\', sans-serif;">\n                  <h4 style="font-family: \'HelveticaNeue-Light\', \'Helvetica Neue\', \'Helvetica\', \'Arial\', sans-serif; font-weight: normal; font-size: 14px; margin: 0 0 5px 0">\n                      <span style="font-weight: bold">Reason for failure</span> Passed\n                      <p><img style="display: block;" alt="If this does not display, please see attached image: .png" src="cid:" /></p>\n                  </h4>\n              </div>\n          </div>\n        </div>\n    </div>\n    <div style="color: #A7A7A7; text-align: center; font-size: 14px; border-top: 1px solid #e7e7e7; padding-top: 10px; min-height: 20px;">\n        <p style="margin: 0; margin-bottom: 5px;">\n            sODA &#8226;\n        </p>\n        <p style="margin: 0">\n            If you think you\'ve received this email in error or wish to unsubscribe from these reports, contact: <a style="color: #A21F9D; text-decoration: none" href="mailto:'+process.env.MAINTAINER_EMAIL+'">'+process.env.MAINTAINER_EMAIL+'</a>\n        </p>\n    </div>\n</div>\n');

        cb(null, emailer);
      });

      emailer.sendTestReport(dataWithFail);

      done();
    });

    it('Should validate passed sendTestReport of a test on an Emailer', function (done) {
      sendMail = fakeMailer.sendMail;

      spy = sinon.stub(fakeMailer, 'sendMail').callsFake((data, cb) => {
        expect(data.from).toEqual(process.env.SMTP_FROM_ADDRESS);
        expect(data.to).toEqual(process.env.SMTP_FROM_ADDRESS);
        expect(data.bcc).toEqual(process.env.MAINTAINER_EMAIL);
        expect(data.subject).toEqual('Subject');
        expect(data.text).toEqual('Email on its way\n=======================================================================================================\nTest Status          : Fail\nTotal Tests Ran      : 10\nTotal Passed         : 10\nTotal Failures       : 0\nTime Started         : 1551200031706\nTotal Exection Time  : 100\nsODA\nIf you think you\'ve received this email in error or wish to unsubscribe from these reports, contact: '+process.env.MAINTAINER_EMAIL+ '\n');
        expect(data.html).toEqual('<div id="email-wrapper" style="padding: 20px; margin: 0; color: #333333; font-family: \'Helvetica Neue\', \'Helvetica\', \'Arial\', sans-serif;">\n    <h1 style="font-family: \'HelveticaNeue-Thin\', \'ArialNarrow\', \'Helvetica Neue\', \'Helvetica\', \'Arial\', sans-serif; font-weight: normal; font-size: 24px; border-bottom: 1px solid #e7e7e7; padding-bottom: 10px; color: #A21F9D; margin: 0">Report for <strong>001</b> test in <strong>my_module</b> module in <strong>my_suite</b> suite for <strong>web</b> platform</h1>\n    <div id="email-body" style="padding: 20px 0 0 0; margin-bottom: 45px; font-family: \'HelveticaNeue-Light\', \'Helvetica Neue\', \'Helvetica\', \'Arial\', sans-serif; font-size: 14px; border-top: 1px solid #e7e7e7; min-height: 20px;">\n        <div id="report-status-wrapper">\n            <h2 id="report-status" style="font-weight: bold; font-size: 20px; margin: 0; color: #27ad12">Passed</h2>\n            <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;"></div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Tests Ran</div></div>\n            <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;">10</div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Tests Passed</div></div>\n            <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;">0</div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Failures</div></div>\n            <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;">0</div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Stopped</div></div>\n        </div>\n    </div>\n    <div id="footer" style="color: #A7A7A7; text-align: center; font-size: 14px; border-top: 1px solid #e7e7e7; padding-top: 20px; min-height: 20px;">\n        <p style="margin: 0; margin-bottom: 5px;">\n            sODA\n        </p>\n        <p style="margin: 0">\n            If you think you\'ve received this email in error or wish to unsubscribe from these reports, contact: <a style="color: #A21F9D; text-decoration: none" href="mailto:'+process.env.MAINTAINER_EMAIL+'">'+process.env.MAINTAINER_EMAIL+'</a>\n        </p>\n    </div>\n</div>\n');

        cb(null, emailer);
      });

      emailer.sendTestReport(dataNoFail);

      done();
    });

    beforeEach(() => {
    })

    it('Should validate failed getTestReport of a test on an Emailer', function (done) {
      var data = emailer.getTestReport(dataWithFail).replace(/\r?\n|\r/g, "");

      expect(data).toEqual('<div style="padding: 20px; margin: 0; color: #333333; font-family: \'Helvetica Neue\', \'Helvetica\', \'Arial\', sans-serif;">    <h1 style="font-family: \'HelveticaNeue-Thin\', \'ArialNarrow\', \'Helvetica Neue\', \'Helvetica\', \'Arial\', sans-serif; font-weight: normal; font-size: 24px; border-bottom: 1px solid #e7e7e7; padding-bottom: 10px; color: #A21F9D; margin: 0">Failed report for <strong>001</b> test in <strong>my_module</b> module in <strong>my_suite</b> suite for <strong>web</b> platform</h1>    <div style="padding: 20px 0 0 0; margin-bottom: 20px; font-family: \'HelveticaNeue-Light\', \'Helvetica Neue\', \'Helvetica\', \'Arial\', sans-serif; font-size: 14px; border-top: 1px solid #e7e7e7; min-height: 20px;">        <div>          <h2 id="report-status" style="font-weight: bold; font-size: 20px; margin: 0; color: #e5173e">Failed</h2>          <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;"></div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Tests Ran</div></div>          <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;">9</div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Tests Passed</div></div>          <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;">Should not have failed</div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Failures</div></div>          <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;">0</div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Stopped</div></div>          <p style="font-weight: normal; font-size: 14px; margin: 10px 0 10px 0; color: #4C4C4C; border-top: 1px solid #e7e7e7; padding: 10px 0 0 0">The following Soda tests failed...</p>          <div bgcolor="#F7F7F7" style="background-color: #F7F7F7; border-radius: 6px; max-width: 100%; padding: 20px;">              <div style="margin-bottom: 15px; font-family: \'HelveticaNeue-Light\', \'Helvetica Neue\', \'Helvetica\', \'Arial\', sans-serif;">                  <h4 style="font-family: \'HelveticaNeue-Light\', \'Helvetica Neue\', \'Helvetica\', \'Arial\', sans-serif; font-weight: normal; font-size: 14px; margin: 0 0 5px 0">                      <span style="font-weight: bold">Reason for failure</span> Passed                      <p><img style="display: block;" alt="If this does not display, please see attached image: .png" src="cid:" /></p>                  </h4>              </div>          </div>        </div>    </div>    <div style="color: #A7A7A7; text-align: center; font-size: 14px; border-top: 1px solid #e7e7e7; padding-top: 10px; min-height: 20px;">        <p style="margin: 0; margin-bottom: 5px;">            sODA &#8226;        </p>        <p style="margin: 0">            If you think you\'ve received this email in error or wish to unsubscribe from these reports, contact: <a style="color: #A21F9D; text-decoration: none" href="mailto:'+ process.env.MAINTAINER_EMAIL + '">'+process.env.MAINTAINER_EMAIL+'</a>        </p>    </div></div>');

      done();
    });

    it('Should validate passed getTestReport of a test on an Emailer', function (done) {
      var data = emailer.getTestReport(dataNoFail).replace(/\r?\n|\r/g, "");

      expect(data).toEqual('<div id="email-wrapper" style="padding: 20px; margin: 0; color: #333333; font-family: \'Helvetica Neue\', \'Helvetica\', \'Arial\', sans-serif;">    <h1 style="font-family: \'HelveticaNeue-Thin\', \'ArialNarrow\', \'Helvetica Neue\', \'Helvetica\', \'Arial\', sans-serif; font-weight: normal; font-size: 24px; border-bottom: 1px solid #e7e7e7; padding-bottom: 10px; color: #A21F9D; margin: 0">Report for <strong>001</b> test in <strong>my_module</b> module in <strong>my_suite</b> suite for <strong>web</b> platform</h1>    <div id="email-body" style="padding: 20px 0 0 0; margin-bottom: 45px; font-family: \'HelveticaNeue-Light\', \'Helvetica Neue\', \'Helvetica\', \'Arial\', sans-serif; font-size: 14px; border-top: 1px solid #e7e7e7; min-height: 20px;">        <div id="report-status-wrapper">            <h2 id="report-status" style="font-weight: bold; font-size: 20px; margin: 0; color: #27ad12">Passed</h2>            <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;"></div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Tests Ran</div></div>            <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;">10</div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Tests Passed</div></div>            <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;">0</div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Failures</div></div>            <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;">0</div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Stopped</div></div>        </div>    </div>    <div id="footer" style="color: #A7A7A7; text-align: center; font-size: 14px; border-top: 1px solid #e7e7e7; padding-top: 20px; min-height: 20px;">        <p style="margin: 0; margin-bottom: 5px;">            sODA        </p>        <p style="margin: 0">            If you think you\'ve received this email in error or wish to unsubscribe from these reports, contact: <a style="color: #A21F9D; text-decoration: none" href="mailto:'+process.env.MAINTAINER_EMAIL+'">'+process.env.MAINTAINER_EMAIL+'</a>        </p>    </div></div>');

      done();
    });

    it('Should validate failed sendModuleReport of a module on an Emailer', function (done) {
      sendMail = fakeMailer.sendMail;

      spy = sinon.stub(fakeMailer, 'sendMail').callsFake((data, cb) => {
        expect(data.from).toEqual(process.env.SMTP_FROM_ADDRESS);
        expect(data.to).toEqual(process.env.SMTP_FROM_ADDRESS);
        expect(data.bcc).toEqual(process.env.MAINTAINER_EMAIL);
        expect(data.subject).toEqual('sODA Testing Report');
        expect(data.text).toEqual('Email on its way\n=======================================================================================================\nTest Status          : Fail\nTotal Tests Ran      : 10\nTotal Passed         : 9\nTotal Failures       : 1\nTime Started         : 1551200031706\nTotal Exection Time  : 100\nsODA\nIf you think you\'ve received this email in error or wish to unsubscribe from these reports, contact: '+process.env.MAINTAINER_EMAIL+'\n');
        expect(data.html).toEqual('<div id="email-wrapper" style="padding: 20px; margin: 0; color: #333333; font-family: \'Helvetica Neue\', \'Helvetica\', \'Arial\', sans-serif;">\n    <h1 style="font-family: \'HelveticaNeue-Thin\', \'ArialNarrow\', \'Helvetica Neue\', \'Helvetica\', \'Arial\', sans-serif; font-weight: normal; font-size: 24px; border-bottom: 1px solid #e7e7e7; padding-bottom: 10px; color: #A21F9D; margin: 0">Report for <strong>my_module</b> module in <strong>my_suite</b> suite for <strong>web</b> platform</h1>\n    <div id="email-body" style="padding: 20px 0 0 0; margin-bottom: 45px; font-family: \'HelveticaNeue-Light\', \'Helvetica Neue\', \'Helvetica\', \'Arial\', sans-serif; font-size: 14px; border-top: 1px solid #e7e7e7; min-height: 20px;">\n        <div id="report-status-wrapper">\n            <h2 id="report-status" style="font-weight: bold; font-size: 20px; margin: 0; color: #27ad12">Passed</h2>\n            <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;"></div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Tests Ran</div></div>\n            <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;">9</div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Tests Passed</div></div>\n            <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;">1</div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Failures</div></div>\n            <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;">0</div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Stopped</div></div>\n        </div>\n    </div>\n    <div id="footer" style="color: #A7A7A7; text-align: center; font-size: 14px; border-top: 1px solid #e7e7e7; padding-top: 20px; min-height: 20px;">\n        <p style="margin: 0; margin-bottom: 5px;">\n            sODA\n        </p>\n        <p style="margin: 0">\n            If you think you\'ve received this email in error or wish to unsubscribe from these reports, contact: <a style="color: #A21F9D; text-decoration: none" href="mailto:' + process.env.MAINTAINER_EMAIL + '">'+process.env.MAINTAINER_EMAIL+'</a>\n        </p>\n    </div>\n</div>\n');

        cb(null, emailer);
      });

      emailer.sendModuleReport(moduleFail);

      done();
    });

    it('Should validate passed sendModuleReport of a module on an Emailer', function (done) {
      sendMail = fakeMailer.sendMail;

      spy = sinon.stub(fakeMailer, 'sendMail').callsFake((data, cb) => {
        expect(data.from).toEqual(process.env.SMTP_FROM_ADDRESS);
        expect(data.to).toEqual(process.env.SMTP_FROM_ADDRESS);
        expect(data.bcc).toEqual(process.env.MAINTAINER_EMAIL);
        expect(data.subject).toEqual('sODA Testing Report');
        expect(data.text).toEqual('Email on its way\n=======================================================================================================\nTest Status          : Fail\nTotal Tests Ran      : 10\nTotal Passed         : 10\nTotal Failures       : 0\nTime Started         : 1551200031706\nTotal Exection Time  : 100\nsODA\nIf you think you\'ve received this email in error or wish to unsubscribe from these reports, contact: ' + process.env.MAINTAINER_EMAIL + '\n');
        expect(data.html).toEqual('<div id="email-wrapper" style="padding: 20px; margin: 0; color: #333333; font-family: \'Helvetica Neue\', \'Helvetica\', \'Arial\', sans-serif;">\n    <h1 style="font-family: \'HelveticaNeue-Thin\', \'ArialNarrow\', \'Helvetica Neue\', \'Helvetica\', \'Arial\', sans-serif; font-weight: normal; font-size: 24px; border-bottom: 1px solid #e7e7e7; padding-bottom: 10px; color: #A21F9D; margin: 0">Report for <strong>my_module</b> module in <strong>my_suite</b> suite for <strong>web</b> platform</h1>\n    <div id="email-body" style="padding: 20px 0 0 0; margin-bottom: 45px; font-family: \'HelveticaNeue-Light\', \'Helvetica Neue\', \'Helvetica\', \'Arial\', sans-serif; font-size: 14px; border-top: 1px solid #e7e7e7; min-height: 20px;">\n        <div id="report-status-wrapper">\n            <h2 id="report-status" style="font-weight: bold; font-size: 20px; margin: 0; color: #27ad12">Passed</h2>\n            <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;"></div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Tests Ran</div></div>\n            <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;">10</div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Tests Passed</div></div>\n            <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;">0</div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Failures</div></div>\n            <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;">0</div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Stopped</div></div>\n        </div>\n    </div>\n    <div id="footer" style="color: #A7A7A7; text-align: center; font-size: 14px; border-top: 1px solid #e7e7e7; padding-top: 20px; min-height: 20px;">\n        <p style="margin: 0; margin-bottom: 5px;">\n            sODA\n        </p>\n        <p style="margin: 0">\n            If you think you\'ve received this email in error or wish to unsubscribe from these reports, contact: <a style="color: #A21F9D; text-decoration: none" href="mailto:' + process.env.MAINTAINER_EMAIL + '">' + process.env.MAINTAINER_EMAIL + '</a>\n        </p>\n    </div>\n</div>\n');

        cb(null, emailer);
      });

      emailer.sendModuleReport(moduleNoFail);

      done();
    });

    it('Should validate failed getModuleReport of a module on an Emailer', function (done) {
      var data = emailer.getModuleReport(moduleFail).replace(/\r?\n|\r/g, "");;

      expect(data).toEqual('<div id="email-wrapper" style="padding: 20px; margin: 0; color: #333333; font-family: \'Helvetica Neue\', \'Helvetica\', \'Arial\', sans-serif;">    <h1 style="font-family: \'HelveticaNeue-Thin\', \'ArialNarrow\', \'Helvetica Neue\', \'Helvetica\', \'Arial\', sans-serif; font-weight: normal; font-size: 24px; border-bottom: 1px solid #e7e7e7; padding-bottom: 10px; color: #A21F9D; margin: 0">Report for <strong>my_module</b> module in <strong>my_suite</b> suite for <strong>web</b> platform</h1>    <div id="email-body" style="padding: 20px 0 0 0; margin-bottom: 45px; font-family: \'HelveticaNeue-Light\', \'Helvetica Neue\', \'Helvetica\', \'Arial\', sans-serif; font-size: 14px; border-top: 1px solid #e7e7e7; min-height: 20px;">        <div id="report-status-wrapper">            <h2 id="report-status" style="font-weight: bold; font-size: 20px; margin: 0; color: #27ad12">Passed</h2>            <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;"></div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Tests Ran</div></div>            <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;">9</div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Tests Passed</div></div>            <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;">1</div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Failures</div></div>            <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;">0</div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Stopped</div></div>        </div>    </div>    <div id="footer" style="color: #A7A7A7; text-align: center; font-size: 14px; border-top: 1px solid #e7e7e7; padding-top: 20px; min-height: 20px;">        <p style="margin: 0; margin-bottom: 5px;">            sODA        </p>        <p style="margin: 0">            If you think you\'ve received this email in error or wish to unsubscribe from these reports, contact: <a style="color: #A21F9D; text-decoration: none" href="mailto:' + process.env.MAINTAINER_EMAIL + '">' + process.env.MAINTAINER_EMAIL + '</a>        </p>    </div></div>');

      done();
    });

    it('Should validate passed getModuleReport of a module on an Emailer', function (done) {
      var data = emailer.getModuleReport(moduleNoFail).replace(/\r?\n|\r/g, "");;

      expect(data).toEqual('<div id="email-wrapper" style="padding: 20px; margin: 0; color: #333333; font-family: \'Helvetica Neue\', \'Helvetica\', \'Arial\', sans-serif;">    <h1 style="font-family: \'HelveticaNeue-Thin\', \'ArialNarrow\', \'Helvetica Neue\', \'Helvetica\', \'Arial\', sans-serif; font-weight: normal; font-size: 24px; border-bottom: 1px solid #e7e7e7; padding-bottom: 10px; color: #A21F9D; margin: 0">Report for <strong>my_module</b> module in <strong>my_suite</b> suite for <strong>web</b> platform</h1>    <div id="email-body" style="padding: 20px 0 0 0; margin-bottom: 45px; font-family: \'HelveticaNeue-Light\', \'Helvetica Neue\', \'Helvetica\', \'Arial\', sans-serif; font-size: 14px; border-top: 1px solid #e7e7e7; min-height: 20px;">        <div id="report-status-wrapper">            <h2 id="report-status" style="font-weight: bold; font-size: 20px; margin: 0; color: #27ad12">Passed</h2>            <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;"></div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Tests Ran</div></div>            <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;">10</div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Tests Passed</div></div>            <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;">0</div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Failures</div></div>            <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;">0</div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Stopped</div></div>        </div>    </div>    <div id="footer" style="color: #A7A7A7; text-align: center; font-size: 14px; border-top: 1px solid #e7e7e7; padding-top: 20px; min-height: 20px;">        <p style="margin: 0; margin-bottom: 5px;">            sODA        </p>        <p style="margin: 0">            If you think you\'ve received this email in error or wish to unsubscribe from these reports, contact: <a style="color: #A21F9D; text-decoration: none" href="mailto:' + process.env.MAINTAINER_EMAIL + '">' + process.env.MAINTAINER_EMAIL + '</a>        </p>    </div></div>');

      done();
    });

    it('Should validate failed sendSuiteReport of a module on an Emailer', function (done) {
      sendMail = emailer.sendMail;

      spy = sinon.stub(fakeMailer, 'sendMail').callsFake((data, cb) => {
        expect(data.from).toEqual(process.env.SMTP_FROM_ADDRESS);
        expect(data.to).toEqual(process.env.SMTP_FROM_ADDRESS);
        expect(data.bcc).toEqual(process.env.MAINTAINER_EMAIL);
        expect(data.subject).toEqual('sODA Testing Report');
        expect(data.text).toEqual('Email on its way\n=======================================================================================================\nTest Status          : Fail\nTotal Tests Ran      : 10\nTotal Passed         : 9\nTotal Failures       : 1\nTime Started         : 1551200031706\nTotal Exection Time  : 100\nsODA\nIf you think you\'ve received this email in error or wish to unsubscribe from these reports, contact: ' + process.env.MAINTAINER_EMAIL + '\n');
        expect(data.html).toEqual('<div id="email-wrapper" style="padding: 20px; margin: 0; color: #333333; font-family: \'Helvetica Neue\', \'Helvetica\', \'Arial\', sans-serif;">\n    <h1 style="font-family: \'HelveticaNeue-Thin\', \'ArialNarrow\', \'Helvetica Neue\', \'Helvetica\', \'Arial\', sans-serif; font-weight: normal; font-size: 24px; border-bottom: 1px solid #e7e7e7; padding-bottom: 10px; color: #A21F9D; margin: 0">Report for <strong>my_suite</b> suite for <strong>web</b> platform</h1>\n    <div id="email-body" style="padding: 20px 0 0 0; margin-bottom: 45px; font-family: \'HelveticaNeue-Light\', \'Helvetica Neue\', \'Helvetica\', \'Arial\', sans-serif; font-size: 14px; border-top: 1px solid #e7e7e7; min-height: 20px;">\n        <div id="report-status-wrapper">\n            <h2 id="report-status" style="font-weight: bold; font-size: 20px; margin: 0; color: #27ad12">Passed</h2>\n            <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;"></div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Tests Ran</div></div>\n            <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;">9</div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Tests Passed</div></div>\n            <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;">1</div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Failures</div></div>\n            <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;">0</div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Stopped</div></div>\n        </div>\n    </div>\n    <div id="footer" style="color: #A7A7A7; text-align: center; font-size: 14px; border-top: 1px solid #e7e7e7; padding-top: 20px; min-height: 20px;">\n        <p style="margin: 0; margin-bottom: 5px;">\n            sODA\n        </p>\n        <p style="margin: 0">\n            If you think you\'ve received this email in error or wish to unsubscribe from these reports, contact: <a style="color: #A21F9D; text-decoration: none" href="mailto:' + process.env.MAINTAINER_EMAIL + '">' + process.env.MAINTAINER_EMAIL + '</a>\n        </p>\n    </div>\n</div>\n');

        cb(null, emailer);
      });

      emailer.sendSuiteReport(suiteFail);

      done();
    });

    it('Should validate passed sendSuiteReport of a module on an Emailer', function (done) {
      sendMail = fakeMailer.sendMail;

      spy = sinon.stub(fakeMailer, 'sendMail').callsFake((data, cb) => {
        expect(data.from).toEqual(process.env.SMTP_FROM_ADDRESS);
        expect(data.to).toEqual(process.env.SMTP_FROM_ADDRESS);
        expect(data.bcc).toEqual(process.env.MAINTAINER_EMAIL);
        expect(data.subject).toEqual('sODA Testing Report');
        expect(data.text).toEqual('Email on its way\n=======================================================================================================\nTest Status          : Fail\nTotal Tests Ran      : 10\nTotal Passed         : 10\nTotal Failures       : 0\nTime Started         : 1551200031706\nTotal Exection Time  : 100\nsODA\nIf you think you\'ve received this email in error or wish to unsubscribe from these reports, contact: ' + process.env.MAINTAINER_EMAIL + '\n');
        expect(data.html).toEqual('<div id="email-wrapper" style="padding: 20px; margin: 0; color: #333333; font-family: \'Helvetica Neue\', \'Helvetica\', \'Arial\', sans-serif;">\n    <h1 style="font-family: \'HelveticaNeue-Thin\', \'ArialNarrow\', \'Helvetica Neue\', \'Helvetica\', \'Arial\', sans-serif; font-weight: normal; font-size: 24px; border-bottom: 1px solid #e7e7e7; padding-bottom: 10px; color: #A21F9D; margin: 0">Report for <strong>my_suite</b> suite for <strong>web</b> platform</h1>\n    <div id="email-body" style="padding: 20px 0 0 0; margin-bottom: 45px; font-family: \'HelveticaNeue-Light\', \'Helvetica Neue\', \'Helvetica\', \'Arial\', sans-serif; font-size: 14px; border-top: 1px solid #e7e7e7; min-height: 20px;">\n        <div id="report-status-wrapper">\n            <h2 id="report-status" style="font-weight: bold; font-size: 20px; margin: 0; color: #27ad12">Passed</h2>\n            <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;"></div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Tests Ran</div></div>\n            <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;">10</div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Tests Passed</div></div>\n            <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;">0</div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Failures</div></div>\n            <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;">0</div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Stopped</div></div>\n        </div>\n    </div>\n    <div id="footer" style="color: #A7A7A7; text-align: center; font-size: 14px; border-top: 1px solid #e7e7e7; padding-top: 20px; min-height: 20px;">\n        <p style="margin: 0; margin-bottom: 5px;">\n            sODA\n        </p>\n        <p style="margin: 0">\n            If you think you\'ve received this email in error or wish to unsubscribe from these reports, contact: <a style="color: #A21F9D; text-decoration: none" href="mailto:' + process.env.MAINTAINER_EMAIL + '">' + process.env.MAINTAINER_EMAIL + '</a>\n        </p>\n    </div>\n</div>\n');

        cb(null, emailer);
      });

      emailer.sendSuiteReport(suiteNoFail);

      done();
    });

    it('Should validate failed getSuiteReport of a module on an Emailer', function (done) {
      var data = emailer.getSuiteReport(suiteFail).replace(/\r?\n|\r/g, "");;

      expect(data).toEqual('<div id="email-wrapper" style="padding: 20px; margin: 0; color: #333333; font-family: \'Helvetica Neue\', \'Helvetica\', \'Arial\', sans-serif;">    <h1 style="font-family: \'HelveticaNeue-Thin\', \'ArialNarrow\', \'Helvetica Neue\', \'Helvetica\', \'Arial\', sans-serif; font-weight: normal; font-size: 24px; border-bottom: 1px solid #e7e7e7; padding-bottom: 10px; color: #A21F9D; margin: 0">Report for <strong>my_suite</b> suite for <strong>web</b> platform</h1>    <div id="email-body" style="padding: 20px 0 0 0; margin-bottom: 45px; font-family: \'HelveticaNeue-Light\', \'Helvetica Neue\', \'Helvetica\', \'Arial\', sans-serif; font-size: 14px; border-top: 1px solid #e7e7e7; min-height: 20px;">        <div id="report-status-wrapper">            <h2 id="report-status" style="font-weight: bold; font-size: 20px; margin: 0; color: #27ad12">Passed</h2>            <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;"></div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Tests Ran</div></div>            <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;">9</div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Tests Passed</div></div>            <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;">1</div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Failures</div></div>            <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;">0</div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Stopped</div></div>        </div>    </div>    <div id="footer" style="color: #A7A7A7; text-align: center; font-size: 14px; border-top: 1px solid #e7e7e7; padding-top: 20px; min-height: 20px;">        <p style="margin: 0; margin-bottom: 5px;">            sODA        </p>        <p style="margin: 0">            If you think you\'ve received this email in error or wish to unsubscribe from these reports, contact: <a style="color: #A21F9D; text-decoration: none" href="mailto:' + process.env.MAINTAINER_EMAIL + '">' + process.env.MAINTAINER_EMAIL + '</a>        </p>    </div></div>');

      done();
    });

    it('Should validate passed getSuiteReport of a module on an Emailer', function (done) {
      var data = emailer.getSuiteReport(suiteNoFail).replace(/\r?\n|\r/g, "");;

      expect(data).toEqual('<div id="email-wrapper" style="padding: 20px; margin: 0; color: #333333; font-family: \'Helvetica Neue\', \'Helvetica\', \'Arial\', sans-serif;">    <h1 style="font-family: \'HelveticaNeue-Thin\', \'ArialNarrow\', \'Helvetica Neue\', \'Helvetica\', \'Arial\', sans-serif; font-weight: normal; font-size: 24px; border-bottom: 1px solid #e7e7e7; padding-bottom: 10px; color: #A21F9D; margin: 0">Report for <strong>my_suite</b> suite for <strong>web</b> platform</h1>    <div id="email-body" style="padding: 20px 0 0 0; margin-bottom: 45px; font-family: \'HelveticaNeue-Light\', \'Helvetica Neue\', \'Helvetica\', \'Arial\', sans-serif; font-size: 14px; border-top: 1px solid #e7e7e7; min-height: 20px;">        <div id="report-status-wrapper">            <h2 id="report-status" style="font-weight: bold; font-size: 20px; margin: 0; color: #27ad12">Passed</h2>            <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;"></div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Tests Ran</div></div>            <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;">10</div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Tests Passed</div></div>            <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;">0</div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Failures</div></div>            <div style="margin: 5px 0; line-height: 20px;"><div style="font-size: 20px; font-weight: bold; vertical-align: middle; line-height: 20px; display: inline-block; min-width: 45px; max-width: 40%; text-align:center;">0</div><div style="text-align: center; margin-left: 10px; vertical-align: middle; display: inline-block; line-height: 20px;">Total Stopped</div></div>        </div>    </div>    <div id="footer" style="color: #A7A7A7; text-align: center; font-size: 14px; border-top: 1px solid #e7e7e7; padding-top: 20px; min-height: 20px;">        <p style="margin: 0; margin-bottom: 5px;">            sODA        </p>        <p style="margin: 0">            If you think you\'ve received this email in error or wish to unsubscribe from these reports, contact: <a style="color: #A21F9D; text-decoration: none" href="mailto:' + process.env.MAINTAINER_EMAIL + '">' + process.env.MAINTAINER_EMAIL + '</a>        </p>    </div></div>');

      done();
    });

});
