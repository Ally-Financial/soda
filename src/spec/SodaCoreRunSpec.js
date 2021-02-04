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

var path = require("path");
delete require.cache[require(path.join(__dirname, "..", "SodaCore", "lib", "Soda"))];
delete require.cache[require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "Asset"))];
delete require.cache[require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "Run"))];

var sinon = require('sinon'),
    Soda   = require(path.join(__dirname, "..", "SodaCore", "lib", "Soda")),
    Run = require(path.join(__dirname, "..", "SodaCore", "lib", "Classes", "Run")),
    fs     = require("fs");

require(path.join(__dirname, "..", "SodaCommon", "ProtoLib"));

describe('Run should pass all validation tests', function () {
  var soda, action, spy, spy1, savedMethod, savedMethod1;

    function clearRequireCache() {
      Object.keys(require.cache).forEach(function (key) {
          delete require.cache[key];
      });
    }

    beforeAll(function (done) {
      clearRequireCache();
      
      savedMethod = console.log;
      savedMethod1 = fs.writeFile;
      soda = new Soda({ testPath: path.join(__dirname, '..', 'sample_project'), logSupressed: true, interactiveMode: true, reset: true});
      
      soda.init(function() {
        soda.config.set("headless", true, true, true);
        
        done();
      });
    });

    beforeEach(function() {
      spy = sinon.spy(console, 'log');
      spy1 = sinon.spy(fs, 'writeFile');
    });
  
    afterEach(function() {
      spy.restore();
      spy1.restore();
    });

    afterAll(function (done) {
      console.log = savedMethod;
      fs.writeFile = savedMethod1;

      soda.kill();
      
      soda = null;

      done();
    });


    it('Should validate properties of a Run with no id', function (done) {
      var run = new Run(soda, 'r0', true);

      expect(run.id).toEqual('r0');
      expect(run.state).toEqual('running');
      expect(run.chain.sodamembers).toEqual(0);
      expect(run.inTestMode).toEqual(false);
      expect(run.trace).toBeInstanceOf(Object);
      expect(run.onLast).toEqual(null);
      expect(run.onNext).toEqual(null);
      expect(run.onContinue).toEqual(null);
      expect(run.onResume).toEqual(null);
      expect(run.printChain().id).toEqual('r0');
      expect(run.printChain().state).toEqual('running');
      expect(run.inquiry().id).toEqual('r0');
      expect(run.inquiry().state).toEqual('running');

      done();
    });

    it('Should validate properties of a Run with an id', function (done) {
      var run = new Run(soda, 'r99', true);

      expect(run.id).toEqual('r99');
      expect(run.state).toEqual('running');
      expect(run.chain.sodamembers).toEqual(0);
      expect(run.inTestMode).toEqual(false);
      expect(run.trace).toBeInstanceOf(Object);
      expect(run.onLast).toEqual(null);
      expect(run.onNext).toEqual(null);
      expect(run.onContinue).toEqual(null);
      expect(run.onResume).toEqual(null);
      expect(run.printChain().id).toEqual('r99');
      expect(run.printChain().state).toEqual('running');
      expect(run.inquiry().id).toEqual('r99');
      expect(run.inquiry().state).toEqual('running');

      done();
    });

    it('Should interact with the chain', function (done) {
      var run = new Run(soda, 'r0', true);

      run.pushToChain('action1');
      run.pushToChain('action2');
      run.pushToChain('action3');
      run.pushToChain('action4');
      run.pushToChain('action5');

      expect(run.chain.sodamembers).toEqual(5);
      expect(JSON.stringify(run.chain)).toEqual(JSON.stringify(['action1','action2','action3','action4','action5']));

      run.popChain();
      expect(run.chain.sodamembers).toEqual(4);
      expect(JSON.stringify(run.chain)).toEqual(JSON.stringify(['action1','action2','action3','action4']));

      run.popChain();
      expect(run.chain.sodamembers).toEqual(3);
      expect(JSON.stringify(run.chain)).toEqual(JSON.stringify(['action1','action2','action3']));

      run.popChain();
      expect(run.chain.sodamembers).toEqual(2);
      expect(JSON.stringify(run.chain)).toEqual(JSON.stringify(['action1','action2']));

      run.popChain();
      expect(run.chain.sodamembers).toEqual(1);
      expect(JSON.stringify(run.chain)).toEqual(JSON.stringify(['action1']));

      run.popChain();
      expect(run.chain.sodamembers).toEqual(0);

      done();
    });

    it('Should handle keypresses on the chain from running to paused to failed (f)', function (done) {
      var run = new Run(soda, 'r0', true);

      run.pushToChain('action1');
      run.pushToChain('action2');
      run.pushToChain('action3');
      run.pushToChain('action4');
      run.pushToChain('action5');

      expect(run.state).toEqual('running');
      run.onKeypress('r', { name: 'r'});

      expect(run.state).toEqual('running');
      run.onKeypress('p', { name: 'p'});

      expect(run.state).toEqual('paused');

      run.onKeypress('r', { name: 'r'});
      expect(run.state).toEqual('paused');

      run.onResume = function() {
        expect(run.state).toEqual('running');

        run.onKeypress('p', { name: 'p'});

        run.onContinue = function() {
          expect(run.state).toEqual('finished');

          done();
        }

        run.state = 'failed';

        run.onKeypress('c', { name: 'c'});
      }

      run.onKeypress('r', { name: 'r'});
    });

    it('Should handle keypresses on the chain from running (p, r) to paused to failed (e)', function (done) {
      var run = new Run(soda, 'r0', true);

      run.pushToChain('action1');
      run.pushToChain('action2');
      run.pushToChain('action3');
      run.pushToChain('action4');
      run.pushToChain('action5');

      expect(run.state).toEqual('running');
      run.onKeypress('r', { name: 'r'});

      expect(run.state).toEqual('running');
      run.onKeypress('p', { name: 'p'});

      expect(run.state).toEqual('paused');

      run.onKeypress('r', { name: 'r'});
      expect(run.state).toEqual('paused');

      run.onResume = function() {
        expect(run.state).toEqual('running');

        run.onKeypress('p', { name: 'p'});

        run.onContinue = function() {
          expect(run.state).toEqual('finished');

          done();
        }

        run.state = 'failed';

        run.onKeypress('e', { name: 'e'});
      }

      run.onKeypress('r', { name: 'r'});
    });

    it('Should handle stop (s) in a running state (s)', function (done) {
      var run = new Run(soda, 'r0', true);

      run.pushToChain('action1');
      run.pushToChain('action2');
      run.pushToChain('action3');
      run.pushToChain('action4');
      run.pushToChain('action5');

      expect(run.state).toEqual('running');
      run.onKeypress('r', { name: 'r'});

      expect(run.state).toEqual('running');
      run.onKeypress('s', { name: 's'});

      expect(run.state).toEqual('stopped');

      done();
    });

    it('Should handle stop (s) in a paused state', function (done) {
      var run = new Run(soda, 'r0', true);

      run.pushToChain('action1');
      run.pushToChain('action2');
      run.pushToChain('action3');
      run.pushToChain('action4');
      run.pushToChain('action5');

      expect(run.state).toEqual('running');
      run.onKeypress('r', { name: 'r'});

      expect(run.state).toEqual('running');
      run.onKeypress('p', { name: 'p'});

      expect(run.state).toEqual('paused');

      run.onStop = function() {
        expect(run.state).toEqual('stopped');

        done();
      }

      run.onKeypress('s', { name: 's'});
    });

    it('Should handle an inquiry (i) in a running state', function (done) {
      var run = new Run(soda, 'r0', true);

      run.pushToChain('action1');
      run.pushToChain('action2');
      run.pushToChain('action3');
      run.pushToChain('action4');
      run.pushToChain('action5');

      expect(run.state).toEqual('running');

      run.onInquiry = function() {
        done();
      }

      run.onKeypress('i', { name: 'i'});
    });

    it('Should handle an inquiry (i) in a paused state', function (done) {
      var run = new Run(soda, 'r0', true);

      run.pushToChain('action1');
      run.pushToChain('action2');
      run.pushToChain('action3');
      run.pushToChain('action4');
      run.pushToChain('action5');

      expect(run.state).toEqual('running');

      run.onKeypress('p', { name: 'p'});

      expect(run.state).toEqual('paused');

      run.onInquiry = function() {
        done();
      }

      run.onKeypress('i', { name: 'i'});
    });

    it('Should handle an inquiry (i) in a stopped state', function (done) {
      var run = new Run(soda, 'r0', true);

      run.pushToChain('action1');
      run.pushToChain('action2');
      run.pushToChain('action3');
      run.pushToChain('action4');
      run.pushToChain('action5');

      expect(run.state).toEqual('running');

      run.onKeypress('s', { name: 's'});

      expect(run.state).toEqual('stopped');

      run.onInquiry = function() {
        done();
      }

      run.onKeypress('i', { name: 'i'});
    });

    it('Should handle a next item (n) in a paused state', function (done) {
      var run = new Run(soda, 'r0', true);

      run.pushToChain('action1');
      run.pushToChain('action2');
      run.pushToChain('action3');
      run.pushToChain('action4');
      run.pushToChain('action5');

      expect(run.state).toEqual('running');

      run.onKeypress('p', { name: 'p'});

      expect(run.state).toEqual('paused');

      run.onNext = function() {
        expect(run.state).toEqual('waiting');

        done();
      }

      run.onKeypress('n', { name: 'n'});
    });

    it('Should handle a next item (n) in a failed state', function (done) {
      var run = new Run(soda, 'r0', true);

      run.pushToChain('action1');
      run.pushToChain('action2');
      run.pushToChain('action3');
      run.pushToChain('action4');
      run.pushToChain('action5');

      expect(run.state).toEqual('running');

      run.state = 'failed';

      expect(run.state).toEqual('failed');

      run.onNext = function() {
        expect(run.state).toEqual('waiting');

        done();
      }

      run.onKeypress('n', { name: 'n'});
    });

    it('Should handle a last item (l) in a paused state', function (done) {
      var run = new Run(soda, 'r0', true);

      run.pushToChain('action1');
      run.pushToChain('action2');
      run.pushToChain('action3');
      run.pushToChain('action4');
      run.pushToChain('action5');

      expect(run.state).toEqual('running');

      run.onKeypress('p', { name: 'p'});

      expect(run.state).toEqual('paused');

      run.onLast = function() {
        expect(run.state).toEqual('waiting');

        done();
      }

      run.onKeypress('l', { name: 'l'});
    });

    it('Should handle a last item (l) in a failed state', function (done) {
      var run = new Run(soda, 'r0', true);

      run.pushToChain('action1');
      run.pushToChain('action2');
      run.pushToChain('action3');
      run.pushToChain('action4');
      run.pushToChain('action5');

      expect(run.state).toEqual('running');

      run.state = 'failed';

      expect(run.state).toEqual('failed');

      run.onLast = function() {
        expect(run.state).toEqual('waiting');

        done();
      }

      run.onKeypress('l', { name: 'l'});
    });

    it('Should handle a skip item (k) in a paused state', function (done) {
      var run = new Run(soda, 'r0', true);

      run.pushToChain('action1');
      run.pushToChain('action2');
      run.pushToChain('action3');
      run.pushToChain('action4');
      run.pushToChain('action5');

      expect(run.state).toEqual('running');

      run.onKeypress('p', { name: 'p'});

      expect(run.state).toEqual('paused');

      run.onSkip = function() {
        expect(run.state).toEqual('running');

        done();
      }

      run.onKeypress('k', { name: 'k'});
    });

    it('Should handle a skip item (k) in a failed state', function (done) {
      var run = new Run(soda, 'r0', true);

      run.pushToChain('action1');
      run.pushToChain('action2');
      run.pushToChain('action3');
      run.pushToChain('action4');
      run.pushToChain('action5');

      expect(run.state).toEqual('running');

      run.state = 'failed';

      expect(run.state).toEqual('failed');

      run.onSkip = function() {
        expect(run.state).toEqual('running');

        done();
      }

      run.onKeypress('k', { name: 'k'});
    });

    it('Should handle a exit test mode (x) command', function (done) {
      var run = new Run(soda, 'r0', true);

      run.pushToChain('action1');
      run.pushToChain('action2');
      run.pushToChain('action3');
      run.pushToChain('action4');
      run.pushToChain('action5');

      expect(run.state).toEqual('running');

      run.replTestMode(null, [true]);

      expect(run.inTestMode).toEqual(true);

      run.onKeypress('x', { name: 'x'});

      expect(run.inTestMode).toEqual(false);

      done();
    });

    it('Should handle getting defined variables (d) command', function (done) {
      var run = new Run(soda, 'r0', true);

      run.pushToChain('action1');
      run.pushToChain('action2');
      run.pushToChain('action3');
      run.pushToChain('action4');
      run.pushToChain('action5');

      expect(run.state).toEqual('running');

      run.replTestMode(null, [true]);

      expect(run.inTestMode).toEqual(true);

      run.onKeypress('d', { name: 'd'});

      sinon.assert.calledWith(spy, "Defined Variables:");

      done();
    });

    it('Should handle a trace console (y) command', function (done) {
      var run = new Run(soda, 'r0', true);

      run.pushToChain('action1');
      run.pushToChain('action2');
      run.pushToChain('action3');
      run.pushToChain('action4');
      run.pushToChain('action5');

      expect(run.state).toEqual('running');

      run.onKeypress('y', { name: 'y'});

      sinon.assert.calledWith(spy, "Current Trace:");

      done();
    });

    it('Should handle a trace file (t) command', function (done) {
      var run = new Run(soda, 'r0', true);

      run.pushToChain('action1');
      run.pushToChain('action2');
      run.pushToChain('action3');
      run.pushToChain('action4');
      run.pushToChain('action5');

      expect(run.state).toEqual('running');

      run.onKeypress('t', { name: 't'});

      sinon.assert.called(spy1);

      done();
    });
});
