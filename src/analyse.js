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

 /* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var fs = require('fs'),
    esprima = require('esprima'),
    dirname = process.argv[2];

function analyzeCode(code, filename) {
    var ast = esprima.parse(code);
    //console.log(JSON.stringify(ast, null, 4));
    
    filename = filename + "on";  // To change file extension to json
    fs.writeFile(filename, JSON.stringify(ast, null, 4), function (err) {
      if (err) throw err;
      //console.log('It\'s saved!');
    });
}

// http://stackoverflow.com/q/5827612/
function walk(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
//      file = dir + '\\' + file;  ON Windows
      var path = require('path'); 
      file = path.resolve(dir, './'+file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

// 2
if (process.argv.length < 3) {
    console.log('Usage: node analyze.js \Users\LeoHumberto\esprima-tutorial');
    process.exit(1);
}


// 3
//var filename = process.argv[2];
//console.log('Reading ' + filename);

//var code = fs.readFileSync(filename);
//analyzeCode(code);
walk(dirname, function(err, results) {
    var filename, extension, code;
    if (err) throw err;
    for(var i = 0;i < results.length;i++) {
        filename = results[i];
        extension = filename.substring(filename.length-3,filename.length);
        if (extension.toUpperCase() ===  ".JS") {
            console.log(filename);
            code = fs.readFileSync(filename);
            analyzeCode(code, filename);
        }
      //var code = fs.readFileSync(filename);
      //code
      //console.log(results[i] + "\n");
        //console.log(filename.substring(filename.length-3,filename.length));
    }
});

//console.log('Done OK');

