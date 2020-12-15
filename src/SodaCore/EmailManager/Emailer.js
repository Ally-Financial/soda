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
 * @module PoductsAndRates/Emailer
 * An emailer class. Performs operations against the SMTP server.
 */

var path          = require('path'),
    nodemailer    = require('nodemailer'),
    handlebars    = require('handlebars'),
    fs            = require('fs');

/**
 * Handlebars helper for math operations
 */
handlebars.registerHelper('math', function(lvalue, operator, rvalue) {
    lvalue = parseFloat(lvalue);
    rvalue = parseFloat(rvalue);

    return {
        '+': lvalue + rvalue,
        '-': lvalue - rvalue,
        '*': lvalue * rvalue,
        '/': lvalue / rvalue,
        '%': lvalue % rvalue
    }[operator];
});

/**
 * Handlebars helper for row striping operations
 */
handlebars.registerHelper('stripe', function(lvalue, operator, rvalue) {
    lvalue = parseFloat(lvalue);
    rvalue = parseFloat(rvalue);

    return {
        'z': lvalue % rvalue === 0 ? '#F7F7F7' : '#EBEBEB'
    }[operator];
});

/**
 * The standard email template
 * @type {String}
 */
var sourceTest = fs.readFileSync(path.join(__dirname, 'templates', 'EmailTestTemplate.html')).toString('utf-8'),

/**
 * The standard email template
 * @type {String}
 */
sourceModule = fs.readFileSync(path.join(__dirname, 'templates', 'EmailModuleTemplate.html')).toString('utf-8'),

/**
 * The standard email template
 * @type {String}
 */
sourceSuite = fs.readFileSync(path.join(__dirname, 'templates', 'EmailSuiteTemplate.html')).toString('utf-8'),

/**
 * The error email template
 * @type {String}
 */
sourceTestFailed = fs.readFileSync(path.join(__dirname, 'templates', 'EmailTestFailedTemplate.html')).toString('utf-8'),

/**
 * The error email template
 * @type {String}
 */
sourceModuleFailed = fs.readFileSync(path.join(__dirname, 'templates', 'EmailModuleFailedTemplate.html')).toString('utf-8'),

/**
 * The error email template
 * @type {String}
 */
sourceSuiteFailed = fs.readFileSync(path.join(__dirname, 'templates', 'EmailSuiteFailedTemplate.html')).toString('utf-8'),

/**
 * The standard email HTML template
 * @type {String}
 */
testTemplate = handlebars.compile(sourceTest),

/**
 * The standard email HTML template
 * @type {String}
 */
moduleTemplate = handlebars.compile(sourceModule),

/**
 * The standard email HTML template
 * @type {String}
 */
suiteTemplate = handlebars.compile(sourceSuite),

/**
 * The no-results email HTML template
 * @type {String}
 */
testTemplateFailed = handlebars.compile(sourceTestFailed),

/**
 * The no-results email HTML template
 * @type {String}
 */
moduleTemplateFailed = handlebars.compile(sourceModuleFailed),

/**
 * The no-results email HTML template
 * @type {String}
 */
suiteTemplateFailed = handlebars.compile(sourceSuiteFailed);

/**
 * An emailer class. Used to send various HTML/Plain text emails
 * @constructor
 * @param {DBProxyClient} client A database client instance
 */
var Emailer = function (soda) {
        /**
         * A self reference
         * @type {Emailer}
         */
    var self = this;

    /**
     * Gets the recipients list based on the provided email mask.
     * @param {String} mask An email mask. @see /core/EmailManager/index.js
     * @param {Function} done A callback for completion
     * @return {undefined}
     */
    function getRecipients (done) {
        done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};

        done.call(self, null, soda.config.get("devDistro"));
    }

    /**
     * Gets the text version of the email
     * @param {Object} data The data sent to Emailer.send
     * @return {undefined}
     */
    function getTextVersion (res) {
        var title = res.title;

        var txt = '';

        txt += title + '\n';
        txt += '=======================================================================================================\n';
        txt += 'Test Status          : ' + (res.stopped ? "Stopped" : res.resultBool === true ? "Pass" : "Fail") + '\n';
        txt += 'Total Tests Ran      : ' + res.totalTests + '\n';
        txt += 'Total Passed         : ' + res.passed  + '\n';
        txt += 'Total Failures       : ' + res.failed  + '\n';
        txt += 'Time Started         : ' + res.started  + '\n';
        txt += 'Total Exection Time  : ' + res.duration  + '\n';

        if (res.failureMessages > 0) {
            txt += '=======================================================================================================\n';
            txt += 'Tes Failure Reasons:\n';
            txt += '=======================================================================================================\n';

            txt += res.failureMessages.join("\n    • ");

            txt += '\n=======================================================================================================\n\n';
        }

        txt += 'sODA\n';
        txt += 'If you think you\'ve received this email in error or wish to unsubscribe from these reports, contact: ' + soda.config.get("maintainer").email + '\n';
        return txt;
    }

    this.setData = function (res) {
        var data = {
                title: res.subject,
                totaltests: res.totaltests,
                totalpassed: res.passed,
                totalfailed: res.failed,
                totalstopped: res.stopped,
                timestart  : res.started,
                totaltime: res.duration,
                test: res.test,
                module: res.module,
                suite: res.suite,
                platform: res.platform,
                reason: res.reason,
                status: {
                    message         : (res.stopped ? "Stopped" : (res.failureMessages.length > 0 ? 'Failed' : 'Passed')),
                    failed          : res.failureMessages.length,
                    displayFailures : res.failureMessages.length > 0 ? true : false,
                    color           : res.failureMessages.length > 0 ? '#e5173e' : '#27ad12'
                },
                failed: res.failureMessages,
                artifacts: res.artifacts,
                maintainer: {
                    name : soda.config.get("maintainer").name,
                    email: soda.config.get("maintainer").email
                }
            };

        return data;
    };

    this.sendTestReport = function (res) {
      if (res.failureMessages.length > 0) {
        this.sendReport(testTemplateFailed, res);
      }
      else {
        this.sendReport(testTemplate, res);
      }
    };

    this.sendModuleReport = function (res) {
      if (res.failureMessages.length > 0) {
        this.sendReport(moduleTemplateFailed, res);
      }
      else {
        this.sendReport(moduleTemplate, res);
      }
    };

    this.sendSuiteReport = function (res) {
      if (res.failureMessages.length > 0) {
        this.sendReport(suiteTemplateFailed, res);
      }
      else {
        this.sendReport(suiteTemplate, res);
      }
    };

    this.getTestReport = function (res) {
      if (res.failureMessages.length > 0) {
        return this.getReport(testTemplateFailed, res);
      }
      else {
        return this.getReport(testTemplate, res);
      }
    };

    this.getModuleReport = function (res) {
      if (res.failureMessages.length > 0) {
        return this.getReport(moduleTemplateFailed, res);
      }
      else {
        return this.getReport(moduleTemplate, res);
      }
    };

    this.getSuiteReport = function (res) {
      if (res.failureMessages.length > 0) {
        return this.getReport(suiteTemplateFailed, res);
      }
      else {
        return this.getReport(suiteTemplate, res);
      }
    };

    /**
     * Sends a rate report
     * @param {String} mask The recipient mask to send the emails to subscribers that have this mask.
     * @param {Number} start The start time to grab rate results for
     * @param {Number} end The end time to grab rate results for
     * @param {String} subject The email subejct.
     * @param {Array<Object>} failedResults An array of failed result objects
     * @param {Number} total The total number of rates scanned
     * @param {Function} done A callback for completion
     * @return {Emailer} The current Emailer instance
     */
    this.send = function (templateFunction, res) {
        getRecipients((err, recipients) => {
            recipients = recipients instanceof Array ? recipients : [];

            soda.console.debug(recipients.length + ' Recipient(s) this scan...');

            if(recipients.length > 0) {
                var transporter   = nodemailer.createTransport({
                    host: soda.config.get("bareSmtpConnectionString"),
                    port: 25,
                    secure: false
                });

                var data = this.setData(res);

                var attachments = [];

                if (res.artifacts && res.failed > 0) {
                  res.artifacts.sodaeach((failure) => {
                      if (failure.screenShot) {
                        attachments.push({   // encoded string as an attachment
                              filename: failure.screnShotname+'.png',
                              content: failure.screenShot,
                              contentType: 'image/png',
                              encoding: 'base64',
                              cid: failure.screnShotname
                            });
                      }

                      if (failure.trace) {
                          attachments.push({
                              filename: failure.trace.replace(/^.*[\\\/]/, ''),
                              contentType: 'application/json',
                              content: fs.createReadStream(failure.trace)
                          });
                      }
                    });
                }
                else if (res.failed > 0) {
                  if (res.screenShot) {
                    attachments.push({   // encoded string as an attachment
                          filename: res.name+'.png',
                          content: res.screenShot,
                          contentType: 'image/png',
                          encoding: 'base64',
                          cid: res.name
                        });
                  }

                  if (res.trace) {
                      attachments.push({
                          filename: res.trace.replace(/^.*[\\\/]/, ''),
                          contentType: 'application/json',
                          content: fs.createReadStream(res.trace)
                      });
                  }
                }

                transporter.sendMail(
                    {
                        from    : soda.config.get("smtpFromAddress"),
                        to      : process.env.SMTP_FROM_ADDRESS,
                        bcc     : recipients.join(', '),
                        subject : res.subject,
                        text    : getTextVersion(res),
                        html    : templateFunction(data),
                        attachments: attachments
                    },
                    (err, info) => {
                        return self;
                    }
                );
            }
        });

        return self;
    };

    /**
     * Gets a failed report
     * @param {String} mask The recipient mask to send the emails to subscribers that have this mask.
     * @param {Number} start The start time to grab rate results for
     * @param {Number} end The end time to grab rate results for
     * @param {String} subject The email subejct.
     * @param {Array<Object>} failedResults An array of failed result objects
     * @param {Number} total The total number of rates scanned
     * @param {Function} done A callback for completion
     * @return {Emailer} The current Emailer instance
     */
    this.getReport = function (templateFunction, res) {
        var data = this.setData(res);

        return templateFunction(data);
    };

    /**
     * Sends a failed report
     * @param {String} mask The recipient mask to send the emails to subscribers that have this mask.
     * @param {Number} start The start time to grab rate results for
     * @param {Number} end The end time to grab rate results for
     * @param {String} subject The email subejct.
     * @param {Array<Object>} failedResults An array of failed result objects
     * @param {Number} total The total number of rates scanned
     * @param {Function} done A callback for completion
     * @return {Emailer} The current Emailer instance
     */
    this.sendReport = function (templateFunction, res) {
        var transporter   = nodemailer.createTransport({
                                host: soda.config.get("bareSmtpConnectionString"),
                                port: 25,
                                secure: false
                            });

        var data = this.setData(res);

        var attachments = [];

        if (res.artifacts && res.failed > 0) {
          res.artifacts.sodaeach((failure) => {
              if (failure.screenShot) {
                attachments.push({   // encoded string as an attachment
                      filename: failure.screnShotname+'.png',
                      content: failure.screenShot,
                      contentType: 'image/png',
                      encoding: 'base64',
                      cid: failure.screnShotname
                    });
              }

              if (failure.trace) {
                  attachments.push({
                      filename: failure.trace.replace(/^.*[\\\/]/, ''),
                      contentType: 'application/json',
                      content: fs.createReadStream(failure.trace)
                  });
              }
            });
        }
        else if (res.failed > 0) {
          if (res.screenShot) {
            attachments.push({   // encoded string as an attachment
                  filename: res.name+'.png',
                  content: res.screenShot,
                  contentType: 'image/png',
                  encoding: 'base64',
                  cid: res.name
                });
          }

          if (res.trace) {
              attachments.push({
                  filename: res.trace.replace(/^.*[\\\/]/, ''),
                  contentType: 'application/json',
                  content: fs.createReadStream(res.trace)
              });
          }
        }

        console.log('Sending emails to: ', soda.config.get("failureDistro").join(', '));

        transporter.sendMail(
            {
                from    : soda.config.get("smtpFromAddress"),
                to      : process.env.SMTP_FROM_ADDRESS,
                bcc     : soda.config.get("failureDistro").join(', '),
                subject : res.subject,
                text    : getTextVersion(res),
                html    : templateFunction(data),
                attachments: attachments
            },
            (err, info) => {
                return self;
            }
        );

        return self;
    };
};

module.exports = Emailer;
