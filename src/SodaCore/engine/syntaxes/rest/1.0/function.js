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
 * @module Engine/Syntaxes/Web/Functions
 * @description The web v1.0 Soda stynax callback library
 */

/**
 * Parse JSON object with a field in it and store it
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.parseJSON = function (action, reply, scope) {
    var parsed = scope.soda.vars.get(action.parseJSON);

    if (action.field && parsed) parsed = parsed[action.field];
    if (!parsed) parsed = {};
    scope.soda.vars.save(action.storeAs, parsed);
    reply(true, parsed);
};

/**
 * Stringify JSON object and store it as a string
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.stringifyJSON = function (action, reply, scope) {
  var stringified = JSON.stringify(action.stringifyJSON);
  scope.soda.vars.save(action.storeAs, stringified);
  reply(true, stringified);
};

/**
 * Gets and stores the ip
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.getip = function (action, reply, scope) {
  var localIps = [];
  var os = require('os');
  var ifaces = os.networkInterfaces();

  Object.keys(ifaces).forEach(function (ifname) {
    var alias = 0;

    ifaces[ifname].forEach(function (iface) {
      if ('IPv4' !== iface.family || iface.internal !== false) {
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        return;
      }

      if (alias >= 1) {
        // this single interface has multiple ipv4 addresses
        localIps.push(iface.address);
      } else {
        // this interface has only one ipv4 adress
        localIps.push(iface.address);
      }
      ++alias;
    });
  });

  scope.soda.vars.save('ip', localIps[localIps.length-1]);

  reply(true, scope.soda.vars.get('ip'));
};

/**
 * Gets and stores the ip in a variable
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.getipStoreIn = function (action, reply, scope) {
  var localIps = [];
  var os = require('os');
  var ifaces = os.networkInterfaces();

  Object.keys(ifaces).forEach(function (ifname) {
    var alias = 0;

    ifaces[ifname].forEach(function (iface) {
      if ('IPv4' !== iface.family || iface.internal !== false) {
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        return;
      }

      if (alias >= 1) {
        // this single interface has multiple ipv4 addresses
        localIps.push(iface.address);
      } else {
        // this interface has only one ipv4 adress
        localIps.push(iface.address);
      }
      ++alias;
    });
  });

  scope.soda.vars.save(action.storeIn, localIps[localIps.length-1]);

  reply(true, scope.soda.vars.get(action.storeIn));
};

/**
 * POST to a REST url and store the result
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.post = function (action, reply, scope) {
  var url = action.post,
      body = scope.soda.vars.get(action.body),
      headers = scope.soda.vars.get(action.headers),
      storeResponse = action.storeResponse;

  try {
    headers = JSON.parse(headers);
  }
  catch (e) {
    headers = action.headers;
  }

  scope.device.post({ url: url, headers: headers, body: body }, function(err, result, response) {
    if (err || result.errorCode !== '') {
      scope.soda.vars.save('last', result);
      scope.soda.vars.save('passfail', 0);
      if (storeResponse) scope.soda.vars.save('response', response);
      
      reply(true, err ? err.message : result.errorDescription);

      return;
    }

    scope.soda.vars.save('last', result);
    if (storeResponse) scope.soda.vars.save('response', response);
    scope.soda.vars.save('passfail', 1);

    reply(true, response);
  });
};

/**
 * GET to a REST url and store the result
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.get = function (action, reply, scope) {
  var url = action.get,
      body = scope.soda.vars.get(action.body),
      headers = scope.soda.vars.get(action.headers),
      storeResponse = action.storeResponse;

  scope.device.get({ url: url, headers: headers, body: body }, function(err, result, response) {
    if (err || result.errorCode !== '') {
      scope.soda.vars.save('last', result);
      scope.soda.vars.save('passfail', 0);
      reply(true, err ? err.message : result.errorDescription);

      return;
    }

    scope.soda.vars.save('last', result);
    if (storeResponse) scope.soda.vars.save('response', response);
    scope.soda.vars.save('passfail', 1);

    reply(true, response);
  });
};

/**
 * DELETE to a REST url and store the result
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.del = function (action, reply, scope) {
  var url = action.delete,
      body = scope.soda.vars.get(action.body),
      headers = scope.soda.vars.get(action.headers),
      storeResponse = action.storeResponse;

  scope.device.del({ url: url, headers: headers, body: body }, function(err, result, response) {
    if (err || result.errorCode !== '') {
      scope.soda.vars.save('last', result);
      scope.soda.vars.save('passfail', 0);
      reply(true, err ? err.message : result.errorDescription);

      return;
    }

    scope.soda.vars.save('last', result);
    if (storeResponse) scope.soda.vars.save('response', response);
    scope.soda.vars.save('passfail', 1);

    reply(true, response);
  });
};

/**
 * Delete all cookies in the browser
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.deleteAllCookies = function (action, reply, scope) {
    scope.device.deleteAllCookies(function (err, res) {
        if(err) {
            reply(false, "Should delete All Cookies in browser");
        }
        else {
            reply(true, "Should delete All Cookies in browser");
        }
    });
};

/**
 * Assert that an error value matches
 * @param {object} action A copy of the action being evaluated, with variables replaced
 * @param {function} reply A completion callback.<br>
 *     This must be called when you are done evaluating the current action or the test will hang forever.<br>
 *     You should pass it true to pass the current action, or false to fail it. The second argument is an optional
 *     message
 * @param {object} scope Library objects (includes) that have been passed in, in their current state
 */
exports.assertError = function (action, reply, scope) {
    reply(JSON.stringify(action.assert) === JSON.stringify(action.is), action.error);
};
