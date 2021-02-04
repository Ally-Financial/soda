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
 * @module SodaCommon/Cypher
 * @description Encryption and decription static functions
 */

var crypto      = require("crypto"),
    key16    = process.env.KEY16,
    key24    = process.env.KEY24,
    key32    = process.env.KEY32,
    outputEncoding = 'hex';

/**
 * Encrypt a string
 * @param  {string} what The string to encrypt
 * @param  {string=} algo The name of the algorithm to encrypt the string with
 * @return {string} The encrypted string
 */
exports.encryptIv = function (what, algo) {
  var key;

  if (algo === ('aes-128-ctr')) {
    key = crypto.scryptSync(key16, 'salt', 16);
  }
  else if (algo === ('aes-192-ctr')) {
    key = crypto.scryptSync(key24, 'salt', 24);
  }
  else {
    key = crypto.scryptSync(key32, 'salt', 32);
  }

  var iv = Buffer.alloc(16, 0); // Initialization vector.
  var cipher = crypto.createCipheriv(algo, key, iv);
  var encrypted = cipher.update(what);
  var finalBuffer = Buffer.concat([encrypted, cipher.final()]);

  //Need to retain IV for decryption, so this can be appended to the output with a separator (non-hex for this example)
  return iv.toString('hex') + ':' + finalBuffer.toString('hex');
};

/**
 * Decrypt a string
 * @param  {string} what The string to decrypt
 * @param  {string=} algo The name of the algorithm to decrypt the string with
 * @return {string} The decrypted string
 */
exports.decryptIv = function (what, algo) {
  var key;

  if (algo === ('aes-128-ctr')) {
    key = crypto.scryptSync(key16, 'salt', 16);
  }
  else if (algo === ('aes-192-ctr')) {
    key = crypto.scryptSync(key24, 'salt', 24);
  }
  else {
    key = crypto.scryptSync(key32, 'salt', 32);
  }

  var encryptedArray = what.split(':');
  var iv = new Buffer.from(encryptedArray[0], outputEncoding);
  var encrypted = new Buffer.from(encryptedArray[1], outputEncoding);
  var decipher = crypto.createDecipheriv(algo, key, iv);
  var decrypted = decipher.update(encrypted);

  return Buffer.concat([decrypted, decipher.final()]).toString();
};
