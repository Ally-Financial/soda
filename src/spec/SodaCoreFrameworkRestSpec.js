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

var path   = require("path"),
    Soda   = require(path.join(__dirname, "..", "SodaCore", "lib", "Soda")),
    nock = require('nock');

require(path.join(__dirname, "..", "SodaCommon", "ProtoLib"));

Object.freeze = function(obj) { return obj; };

describe('Framework rest should pass all validation tests', function () {
  var soda, restFramework, settings, buildTree, restControl;

    beforeAll(function (done) {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 300000;

      nock('https://www.google.com', {
        filteringScope: function(scope) {
          return true;
        }
      })
      .persist()
      .post('/')
      .reply(200, JSON.stringify({ "sessionId":"BLAHBLAHBLAH" }));

      nock('https://www.google.com', {
        filteringScope: function(scope) {
          return true;
        }
      })
      .persist()
      .get('/')
      .reply(200, JSON.stringify({ "sessionId":"BLAHBLAHBLAH" }));

      nock('https://www.google.com', {
        filteringScope: function(scope) {
          return true;
        }
      })
      .persist()
      .delete('/')
      .reply(204, JSON.stringify({ "sessionId":"BLAHBLAHBLAH" }));

      if (!nock.isActive()) {
        nock.activate()
      }

      soda = new Soda({ testPath: path.join(__dirname, '..', 'sample_project'), logSupressed: false });

      soda.init(function() {
        soda.config.set("headless", true, true, true);
        
          restFramework = require(path.join(__dirname, "..", "SodaCore", "frameworks", "rest"))(soda);
          soda.framework = restFramework;
          settings  = require(path.join(__dirname, "..", "SodaCore", "frameworks", "perfecto", "imports", "Config.js"))(soda);
          buildTree = require(path.join(__dirname, "..", "SodaCore", "frameworks", "perfecto", "imports", "Tree.js"));
          restControl  = new (require(path.join(__dirname, "..", "SodaCore", "frameworks", "rest", "imports", "Driver.js")))(soda);

          done();
      });
    });

    beforeEach(() => {
    })

    afterAll(function (done) {
      nock.cleanAll();
      nock.restore();

      soda.kill();

      soda = null;

      done();
    });

    it('Should validate rest', function (done) {
      expect(restFramework.name).toEqual('Rest');
      expect(restFramework.platform).toEqual('Rest');
      expect(restFramework.version).toEqual('1.0');
      expect(restFramework.defaultSyntaxVersion).toEqual('1.0');
      expect(restFramework.defaultSyntaxName).toEqual('rest');

      done();
    });

    it('Should start for rest', function (done) {
      restFramework.start({}, function(err) {
        expect(err).toEqual(null);

        done();
      });
    });

    it('Should stop for rest', function (done) {
      restFramework.stop(function(err, result) {
        expect(err).toEqual(null);
        expect(result).toEqual(true);

        done();
      });
    });

    it('Should restart for rest', function (done) {
      restFramework.start({}, function(err) {
        expect(err).toEqual(null);

        restFramework.restart(function(err) {
          expect(err).toEqual(null);

          restFramework.stop(function () {
            done();
          });
        });
      });
    });

    it('Should post to rest', function (done) {
      restFramework.performDeviceInteraction('post', { url: 'https://www.google.com', headers: {}, body: { hi: 'world'}}, function(err, result) {
        expect(err).toEqual(null);

        expect(result).toBeInstanceOf(Object);

        done();
      });
    });

    it('Should get to rest', function (done) {
      restFramework.performDeviceInteraction('get', { url: 'https://www.google.com', headers: {}, body: { hi: 'world'}}, function(err, result) {
        expect(err).toEqual(null);

        expect(result).toBeInstanceOf(Object);

        done();
      });
    });

    it('Should delete to rest', function (done) {
      restFramework.performDeviceInteraction('delete', { url: 'https://www.google.com', headers: {}, body: { hi: 'world'}}, function(err, result) {
        expect(err).toEqual(null);

        expect(result).toBeInstanceOf(Object);

        done();
      });
    });

    it('Should deleteAllCookies for rest', function (done) {
      restFramework.performDeviceInteraction('deleteAllCookies', {}, function(err, result) {
        expect(err).toEqual(null);
        expect(result).toEqual(true);

        done();
      });
    });

    it('Should reset for rest', function (done) {
      restFramework.performDeviceInteraction('reset', {}, function(err, result) {
        expect(err).toEqual(null);
        expect(result).toEqual(true);

        done();
      });
    });

    it('Should close for rest', function (done) {
      restFramework.performDeviceInteraction('close', {}, function(err, result) {
        expect(err).toEqual(null);
        expect(result).toEqual(true);

        done();
      });
    });

    it('Should captureScreen for rest', function (done) {
      restFramework.performDeviceInteraction('captureScreen', {}, function(err, result) {
        expect(err).toEqual(null);
        expect(result).toEqual(true);

        done();
      });
    });

    it('Should getOrientation for rest', function (done) {
      restFramework.getOrientation(function(err, result) {
        expect(err).toEqual(null);
        expect(result).toEqual(1);

        done();
      });
    });

    it('Should getTree for rest', function (done) {
      restFramework.getTree({}, function(err, result) {
        expect(err).toEqual(null);
        expect(result).toBeInstanceOf(Object);

        done();
      });
    });
});
