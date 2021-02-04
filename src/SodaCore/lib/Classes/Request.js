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
 * The SEQUEL driver for the DBProxyServer for unit testing
 * @module ProductsAndRates/MSSQL
 */

var queryString = require('query-string'),
    HttpsProxyAgent = require('https-proxy-agent'),
    https = require('https');

/**
 * A test class/driver to work with the DBProxyServer, which will be exported as a singleton
 * @constructor
 */
function Request (soda) {
    var self       = this;

    /**
     * The name of the driver
     * @type {String}
     */
    this.name = 'Request';

    /**
     * The connectionOptions needed to connect to AWS through APIGEE
     * @type {String}
     */
    this.connectionOptions = null;

    /**
     * Parses http results
     * @param  {String} result The http result
     * @return {result} The http result
     */
    function parseResults(result) {
        var finalResult = {}
        
        if (result) {
          if (typeof result === "string") {
            var payload = JSON.parse(result);
      
            try {
                if (payload) {
                    if (payload && payload.body && typeof payload.body === "string") {
                        finalResult = JSON.parse(payload.body)
                    }
                    else if (payload && payload.body) {
                        finalResult = payload.body
                    }
                    else {
                        finalResult = JSON.parse(payload)
                    }
                }
            }
            catch (exception) {
            }
          }
          else {
            if (payload.body && typeof payload.body === "string") {
                finalResult = JSON.parse(payload.body)
            }
            else if (payload && payload.body) {
                finalResult = payload.body
            }
            else {
                finalResult = JSON.parse(payload)
            }
          }
        }
      
        return finalResult
      }

    /**
     * Sends HTTP data
     * @return {result} The http result
     */
    this.send = function send (host, path, method, body, done) {
        var proxy = process.env.HTTP_PROXY ? process.env.HTTP_PROXY : process.env.http_proxy;
        var agent = null;
        
        if (proxy) agent = new HttpsProxyAgent(proxy);
        var finalResult = "";
        var encodedBody = "";
        var err = null;

        encodedBody = JSON.stringify(body);
        var options = {
            host: host,
            port: 443,
            followRedirect: true,
            agent: agent,
            path: path,
            method: method,
            headers: { 
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(encodedBody)
            }
        };

        //making the https post call
        var postReq = https.request(options, function(res) {
            res.setEncoding('utf8')  

            res.on('data', function (chunk) {
                finalResult += chunk;
            });
            
            res.on('end', function () {
                if (res && res.statusCode === 500 && body.retry == null) {
                    setTimeout(function() {
                        body['retry'] = true
                        self.send(method, body, done)
                    }, 250)
                }
                else {
                    var res = {};

                    try {
                        res = JSON.parse(finalResult);

                        if (res.errors) {
                            err = new Error("Command failed", finalResult)
                        }
                    }
                    catch (e) {
                        err = e;
                    }

                    done.call(self, err, res);
                }
            });
        });

        postReq.write(encodedBody);
        
        postReq.end();

        postReq.on('error', function(err){
            done.call(self, err, null);
        });
    }

    /**
     * Posts HTTP data
     * @return {result} The http result
     */
    this.postCall = function put (host, path, body, done) {
        self.send(host, path, "POST", body, done);
    }

    /**
     * Puts HTTP data
     * @return {result} The http result
     */
    this.putCall = function put (host, path, body, done) {
        self.send(host, path, "PUT", body, done);
    }

    /**
     * Deletes HTTP data
     * @return {result} The http result
     */
    this.delCall = function del (host, path, body, done) {
        self.send(host, path, "DELETE", body, done);
    }

    /**
     * Gets HTTP data
     * @param  {Object} connectionOptions Connection options
     * @return {autorization_token} The current authorization token
     */
    this.getCall = function get (host, path, options, done) {
        var encodedBody = "";

        if (!options) {
            options = {
                timeout: 3000
            }
        }
        
        var proxy = process.env.HTTP_PROXY ? process.env.HTTP_PROXY : process.env.http_proxy;
        var agent = null;
        
        if (proxy) agent = new HttpsProxyAgent(proxy);
        
        var err = null;
        var finalResult = "";
        var getOptions = {
            host: host,
            port: 443,
            followRedirect: true,
            agent: agent,
            path: path,
            timeout: options.timeout,
            method: 'GET',
            headers: {
            }
        };

        //making the https get call
        var getReq = https.request(getOptions, function(res) {
            res.setEncoding('utf8')

            res.on('data', function (chunk) {
                finalResult += chunk;
            });
            
            res.on('end', function () {
                var res = {};

                try {
                    res = JSON.parse(finalResult);

                    if (res.errors) {
                        err = new Error("Command failed", finalResult)
                    }
                }
                catch (e) {
                    err = e
                }

                done.call(self, err, res);
            });
        });
     
        //end the request
        getReq.end();
        getReq.on('error', function(err){
            done.call(self, err, null);
        });
    }

    /**
     * Invoke the SEQUEL `get` method
     * @param  {Object} meta Meta data for retrieval/storing purposes
     * @param  {Object} data Other data for storing purposes (not used in the get method)
     * @param  {Function} done A callback for completion
     * @return {MSSQL} The current SEQUEL instance
     */
    this.get = function get (host, path, options, done) {
        done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};

        self.getCall(host, path, options, done);

        return self;
    };

    /**
     * Invoke the SEQUEL `post` method
     * @param  {Object} meta Meta data for retrieval/storing purposes
     * @param  {object} data The data to put
     * @param  {Function} done A callback for completion
     * @return {MSSQL} The current SEQUEL instance
     */
    this.post = function (host, path, data, done) {
        done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};

        if(!data) {
            done.call(self, new Error('The `post` method requires data to put with!'), null);
        }
        else {
            self.postCall(host, path, data, done);
        }

        return self;
    };

    /**
     * Invoke the SEQUEL `put` method
     * @param  {Object} meta Meta data for retrieval/storing purposes
     * @param  {object} data The data to put
     * @param  {Function} done A callback for completion
     * @return {MSSQL} The current SEQUEL instance
     */
    this.put = function (host, path, data, done) {
        done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};

        if(!data) {
            done.call(self, new Error('The `put` method requires data to put with!'), null);
        }
        else {
            self.putCall(host, path, data, done);
        }

        return self;
    };

    /**
     * Invoke the SEQUEL `update` method
     * @param {Object} meta Meta data for retrieval/storing purposes
     * @param {Object} data The data to update with
     * @param {Function} done A callback for completion
     * @return {MSSQL} The current SEQUEL instance
     */
    this.update = function (host, path, data, done) {
        done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};


        if(!data) {
            done.call(self, new Error('The `put` method requires data to put with!'), null);
        }
        else {
            self.putCall(host, path, data, done);
        }

        return self;
    };

    /**
     * Invoke the SEQUEL `delete` method
     * @param  {Object} meta Meta data for retrieval/storing purposes
     * @param  {Object} data Other data for storing purposes (not used in the delete method)
     * @param  {Function} done A callback for completion
     * @return {MSSQL} The current SEQUEL instance
     */
    this.del = function (host, path, data, done) {
        done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};

        self.delCall(host, path, data, done);

        return self;
    };
}

module.exports = Request;
