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

var AWSSDK = require('aws-sdk'),
    queryString = require('query-string'),
    HttpsProxyAgent = require('https-proxy-agent'),
    https = require('https');

/**
 * A test class/driver to work with the DBProxyServer, which will be exported as a singleton
 * @constructor
 */
function AWS (soda) {
    var self       = this;

    /**
     * The name of the driver
     * @type {String}
     */
    this.name = 'AWS';

    /**
     * The connectionOptions needed to connect to AWS through APIGEE
     * @type {String}
     */
    this.connectionOptions = null;

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
     * Sneds HTTP data
     * @return {result} The http result
     */
    this.send = function send (method, body, done) {
        var finalResult = "";
        var encodedBody = "";
        var err = null;
        var arnToInvoke = soda.config.get("assetsarn");

        if (arnToInvoke) {
            body.httpMethod = method;
            encodedBody = JSON.stringify(body);
            const invokeLambda = (lambda, params) => new Promise((resolve, reject) => {
                lambda.invoke(params, (error, data) => {
                  if (error) {
                    console.log('Error invoking arn:', arnToInvoke, error);
                    reject(error);
                  } else {
                    soda.console.debug('Invoked arn:', arnToInvoke, data);
                    resolve(data);
                  }
                });
              });
            
              async function callLambda(arnToInvoke) {    
                var proxy = process.env.HTTP_PROXY ? process.env.HTTP_PROXY : process.env.http_proxy;
                var region = process.env.REGION;
                if (proxy) {
                    var agent = new HttpsProxyAgent(proxy);
                    AWSSDK.config.update({httpOptions: { agent: agent }, region: region});
                }

                const lambda = new AWSSDK.Lambda();
            
                const params = {
                    FunctionName: arnToInvoke,
                    InvocationType: "RequestResponse", 
                    Payload: encodedBody
                };
            
                const result = await invokeLambda(lambda, params);
            
                if (result && result.Payload) {
                    done.call(self, null, parseResults(result.Payload));
                }
                else {
                    done.call(self, null, null);
                }
            };

            callLambda(arnToInvoke);
        }
        else {
            var proxy = process.env.HTTP_PROXY ? process.env.HTTP_PROXY : process.env.http_proxy;
            var agent = null;
            if (proxy) {
                agent = new HttpsProxyAgent(proxy);
            }

            encodedBody = JSON.stringify(body);
            var options = {
                host: self.connectionOptions.apihost,
                port: 443,
                followRedirect: true,
                agent: agent,
                path: self.connectionOptions.apipath,
                method: method,
                headers: { 
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(encodedBody),
                    "Authorization": "Bearer " + self.connectionOptions.access_token
                }
            };
    
            //making the https post call
            var postReq = https.request(options, function(res) {
                res.setEncoding('utf8')  
    
                res.on('data', function (chunk) {
                    finalResult += chunk;
                });
                
                res.on('end', function () {
                    if (res && res.statusCode == 500 && body.retry == null) {
                        console.log('FAILED from ' + method, finalResult, "FOR ", body)
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
                                console.log("Command failed", finalResult);
                                err = new Error("Command failed", finalResult)
                            }
                        }
                        catch (e) {
                            console.log("Command failed", e, body, finalResult);
                            soda.console.error(e, body, finalResult);
                            err = e;
                        }
    
                        done.call(self, err, res);
                    }
                });
            });

            postReq.write(encodedBody);
            
            postReq.end();

            postReq.on('error', function(err){
                console.log("Command failed", err);
                soda.console.error(err);
                done.call(self, err, null);
            });
        }
    }

    /**
     * Posts HTTP data
     * @return {result} The http result
     */
    this.postCall = function put (body, done) {
        self.send("POST", body, done);
    }

    /**
     * Puts HTTP data
     * @return {result} The http result
     */
    this.putCall = function put (body, done) {
        self.send("PUT", body, done);
    }

    /**
     * Deletes HTTP data
     * @return {result} The http result
     */
    this.delCall = function del (body, done) {
        self.send("DELETE", body, done);
    }

    /**
     * Gets HTTP data
     * @param  {Object} connectionOptions Connection options
     * @return {autorization_token} The current authorization token
     */
    this.getCall = function get (body, done) {
        var arnToInvoke = soda.config.get("assetsarn");
        var encodedBody = "";

        if (arnToInvoke) {
            body.httpMethod = "GET";
            encodedBody = JSON.stringify(body)
            
            const invokeLambda = (lambda, params) => new Promise((resolve, reject) => {
                lambda.invoke(params, (error, data) => {
                    if (error) {
                        console.log('Error invoking arn:', arnToInvoke, error);
                        reject(error);
                    } else {
                        soda.console.debug('Invoked arn:', arnToInvoke, data);
                        resolve(data);
                    }
                });
              });
              
              async function callLambda(arnToInvoke) {
                var proxy = process.env.HTTP_PROXY ? process.env.HTTP_PROXY : process.env.http_proxy;
                var region = process.env.REGION;
                if (proxy) {
                    var agent = new HttpsProxyAgent(proxy);
                    AWSSDK.config.update({httpOptions: { agent: agent }, region: region});
                }
                
                const lambda = new AWSSDK.Lambda();
            
                const params = {
                    FunctionName: arnToInvoke, 
                    InvocationType: "RequestResponse",
                    Payload: encodedBody
                };
            
                const result = await invokeLambda(lambda, params);

                if (result && result.Payload) {
                    done.call(self, null, parseResults(result.Payload));
                }
                else {
                    done.call(self, null, null);
                }            
            };

            callLambda(arnToInvoke);
        }
        else {
            var proxy = process.env.HTTP_PROXY ? process.env.HTTP_PROXY : process.env.http_proxy;
            var agent = null;
            if (proxy) {
                agent = new HttpsProxyAgent(proxy);
            }
            var err = null;
            var finalResult = "";
            var options = {
                host: self.connectionOptions.apihost,
                port: 443,
                followRedirect: true,
                agent: agent,
                path: self.connectionOptions.apipath + '?' + queryString.stringify(body),
                method: 'GET',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": "Bearer " + self.connectionOptions.access_token
                }
            };

            //making the https get call
            var getReq = https.request(options, function(res) {
                res.setEncoding('utf8')

                res.on('data', function (chunk) {
                    finalResult += chunk;
                });
                
                res.on('end', function () {
                    if (res && res.statusCode == 500 && body.retry == null) {
                        soda.console.debug('FAILED from GET', finalResult, "FOR ", body)
                        setTimeout(function() {
                            body['retry'] = true
                            self.send(options.method, body, done)
                        }, 250)
                    }
                    else {
                        var res = {};

                        try {
                            res = JSON.parse(finalResult);

                            if (res.errors) {
                                console.log("Command failed", finalResult);
                                err = new Error("Command failed", finalResult)
                            }
                        }
                        catch (e) {
                            console.log(e, body, finalResult);
                            err = e
                        }

                        done.call(self, err, res);
                    }
                });
            });

            //end the request
            getReq.end();
            getReq.on('error', function(err){
                    done.call(self, err, null);
            });
        }
    }

    /**
     * Gets the autnorization token
     * @param  {Function} done A callback for completion
     * @return {MSSQL} The current SEQUEL instance
     */
    this.getAuthorizationToken = function getAuthorizationToken (connectionOptions, done) {
        var arnToInvoke = soda.config.get("assetsarn");

        if (arnToInvoke) {
            done.call(self, null);
        }
        else {
            var err = null;
            var proxy = process.env.HTTP_PROXY ? process.env.HTTP_PROXY : process.env.http_proxy;
            var agent = new HttpsProxyAgent(proxy);
            var auth_token = "Basic " + Buffer.from(connectionOptions.key + ":" + connectionOptions.secret, 'binary').toString('base64');
    
            var options = {
                host: connectionOptions.auth_host,
                port: 443,
                followRedirect: true,
                agent: agent,
                path: connectionOptions.auth_path,
                method: "POST",
                headers: { 
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": auth_token
                }
            };
    
            //making the https post call
            var postReq = https.request(options, function(res) {
                res.on('data', function(data) {
            
                            try {
                                connectionOptions.access_token = JSON.parse(data).access_token;	
                            }
                            catch (e) {
                                err = e
                            }
            
                            done.call(self, err);
                });
            });

        //end the request
            postReq.write("grant_type=client_credentials");
            postReq.end();
            postReq.on('error', function(err){
                done.call(self, err);
            });
        }
    }

    /**
     * Connect to the AWS instance
     * @param  {Function} done A callback for completion
     * @return {MSSQL} The current SEQUEL instance
     */
    this.connect = function connect (options, done) {
        self.connectionOptions = options;
        if (!self.access_token) {
            self.getAuthorizationToken(self.connectionOptions, done);
        }
        else {
            done.call(self, null);
        }

        return self;
    };

    /**
     * Disconnect the SEQUEL connection
     * @param  {Object} options Disconnect options
     * @param  {Function} done A callback for completion
     * @return {MSSQL} The current SEQUEL instance
     */
    this.disconnect = function disconnect (options, done) {
        self.access_token = null;

        done.call(self, null);

        return self;
    };

    /**
     * If there's no connection established, this method will connect, then invoke the callback passed.
     * @param  {Function} done A callback for completion
     * @return {MSSQL} The current SEQUEL instance
     */
    function connectIfNeededThenPerformCallback (done) {
        done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};

        if (self.connectionOptions && self.connectionOptions.access_token) {
          done.call(self, null);
        }
        else {
          soda.console.error('No AWS connection established...establishing connection...');
          self.connect(connectionOptions, function (err) { done.call(self, new Error('No SEQUEL connection available')); });
        }

        return self;
    }

    /**
     * Invoke the SEQUEL `get` method
     * @param  {Object} meta Meta data for retrieval/storing purposes
     * @param  {Object} data Other data for storing purposes (not used in the get method)
     * @param  {Function} done A callback for completion
     * @return {MSSQL} The current SEQUEL instance
     */
    this.get = function get (meta, data, done) {
        done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};

        var body = Object.assign(meta, data);

        if(typeof meta !== 'object')
            return done.call(self, new Error('Cannot `get` without meta data!'), null);

        self.getCall(body, done);

        return self;
    };

    /**
     * Invoke the SEQUEL `put` method
     * @param  {Object} meta Meta data for retrieval/storing purposes
     * @param  {object} data The data to put
     * @param  {Function} done A callback for completion
     * @return {MSSQL} The current SEQUEL instance
     */
    this.put = function (meta, data, done) {
        done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};

        var body = Object.assign(meta, data);

        if(typeof meta !== 'object') {
            done.call(self, new Error('Cannot `put` without meta data!'), null);
        }
        else if(!data) {
            done.call(self, new Error('The `put` method requires data to put with!'), null);
        }
        else {
            self.putCall(body, done);
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
    this.update = function (meta, data, done) {
        done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};

        var body = Object.assign(meta, data);

        if(typeof meta !== 'object') {
            done.call(self, new Error('Cannot `put` without meta data!'), null);
        }
        else if(!data) {
            done.call(self, new Error('The `put` method requires data to put with!'), null);
        }
        else {
            self.putCall(body, done);
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
    this.del = function (meta, data, done) {
        done = arguments.sodalast() instanceof Function ? arguments.sodalast() : function () {};

        var body = Object.assign(meta, data);

        if(typeof meta !== 'object') {
            done.call(self, new Error('Cannot `delete` without meta data!'), null);
        }
        else {
            self.delCall(body, done);
        }

        return self;
    };
}

module.exports = AWS;
