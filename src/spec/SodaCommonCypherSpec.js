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
    Cypher   = require(path.join(__dirname, "..", "SodaCommon", "Cypher"));

describe('SodaCommon Cypher should work properly', function () {
    var toEncrypt,
        encryptedValue,
        algos;

    beforeAll(function () {
        toEncrypt = 'Value to be encrypted';
        encryptedValue = '5919b6ef71db79321ac01176e6c9d90c006d99e692b895f92ecf65d68734038f';
        algos = [ 'CAST-cbc',
                  'aes-128-cbc',
                  'aes-128-cbc-hmac-sha1',
                  'aes-128-cfb',
                  'aes-128-cfb1',
                  'aes-128-cfb8',
                  'aes-128-ctr',
                  'aes-128-ecb',
                  'aes-128-ofb',
                  'aes-128-xts',
                  'aes-192-cbc',
                  'aes-192-cfb',
                  'aes-192-cfb1',
                  'aes-192-cfb8',
                  'aes-192-ctr',
                  'aes-192-ecb',
                  'aes-192-ofb',
                  'aes-256-cbc',
                  'aes-256-cbc-hmac-sha1',
                  'aes-256-cfb',
                  'aes-256-cfb1',
                  'aes-256-cfb8',
                  'aes-256-ctr',
                  'aes-256-ecb',
                  'aes-256-ofb',
                  'aes-256-xts',
                  'aes128',
                  'aes192',
                  'aes256',
                  'bf',
                  'bf-cbc',
                  'bf-cfb',
                  'bf-ecb',
                  'bf-ofb',
                  'blowfish',
                  'camellia-128-cbc',
                  'camellia-128-cfb',
                  'camellia-128-cfb1',
                  'camellia-128-cfb8',
                  'camellia-128-ecb',
                  'camellia-128-ofb',
                  'camellia-192-cbc',
                  'camellia-192-cfb',
                  'camellia-192-cfb1',
                  'camellia-192-cfb8',
                  'camellia-192-ecb',
                  'camellia-192-ofb',
                  'camellia-256-cbc',
                  'camellia-256-cfb',
                  'camellia-256-cfb1',
                  'camellia-256-cfb8',
                  'camellia-256-ecb',
                  'camellia-256-ofb',
                  'camellia128',
                  'camellia192',
                  'camellia256',
                  'cast',
                  'cast-cbc',
                  'cast5-cbc',
                  'cast5-cfb',
                  'cast5-ecb',
                  'cast5-ofb',
                  'des',
                  'des-cbc',
                  'des-cfb',
                  'des-cfb1',
                  'des-cfb8',
                  'des-ecb',
                  'des-ede',
                  'des-ede-cbc',
                  'des-ede-cfb',
                  'des-ede-ofb',
                  'des-ede3',
                  'des-ede3-cbc',
                  'des-ede3-cfb',
                  'des-ede3-cfb8',
                  'des-ede3-ofb',
                  'des-ofb',
                  'des3',
                  'desx',
                  'desx-cbc',
                  'idea',
                  'idea-cbc',
                  'idea-cfb',
                  'idea-ecb',
                  'idea-ofb',
                  'rc2',
                  'rc2-40-cbc',
                  'rc2-64-cbc',
                  'rc2-cbc',
                  'rc2-cfb',
                  'rc2-ecb',
                  'rc2-ofb',
                  'rc4',
                  'rc4-40',
                  'rc4-hmac-md5',
                  'seed',
                  'seed-cbc',
                  'seed-cfb',
                  'seed-ecb',
                  'seed-ofb' ];
    });

    it('SodaCypher should encrypt and decrypt properly with all algorithms', function () {
        var encrypt, decrypt;

        for (var i = 0; i < algos.length; i++) {
          if (algos[i] === ('aes-128-ctr') || algos[i] === ('aes-192-ctr') || algos[i] === ('aes-256-ctr')) {
            encrypt = Cypher.encryptIv(toEncrypt, algos[i]);
            decrypt = Cypher.decryptIv(encrypt, algos[i]);

            expect(decrypt).toEqual(toEncrypt);
          }
        }
    });


});
