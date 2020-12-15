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
 * @module SodaVisualEditor/Server
 * @description The Visual Editor socket server and HTTP server wrapper
 */

var sio          = require("socket.io"),
    EventEmitter = require('events').EventEmitter,
    util         = require("util"),

    SERVER_CONNECTIONLESS_TIMEOUT = 1000 * 60 * 5, // 5 Minutes

/**
 * A wrapper to control a socket.io instance with some CRUD functionality
 * @constructor
 * @extends EventEmitter
 */
Server = function (soda, exitOnNoConnections, useExpress, options) {
    var sockets     = [],
        listeners   = [],
        started     = false,
        http        = require("./HTTPServer")(soda, useExpress, options),

        self        = this,
        port        = null,
        io          = sio(http.server),
        terminationTimeout = null,

        status = {
            get started     () { return started;        },
            get connections () { return sockets.length; }
        };

    io.set('transports', ['websocket']);

    var connections = [];
    http.server.on("connection", function (client) {
        connections.push(client);
    });

    Object.defineProperties(self, {
        io      : { get: function () { return io;          }},
        app     : { get: function () { return http.app;    }},
        server  : { get: function () { return http.server; }},
        status  : { get: function () { return status;      }},
        port    : { get: function () { return port;        }},
        sockets : { get: function () { return sockets;     }}
    });

    // When a client connects...
    io.on("connection", function (socket) {
        sockets.push(socket);
        if(terminationTimeout) clearTimeout(terminationTimeout);

        socket.on('disconnect', function (socket) {
            sockets.splice(sockets.indexOf(socket), 1);
            if(exitOnNoConnections && sockets.length === 0) {
                terminationTimeout = setTimeout(function () {
                    self.stop(function () { process.exit(0); });
                }, SERVER_CONNECTIONLESS_TIMEOUT);
            }
            self.emit("disconnect", socket);
        });

        socket.emit("init");
        listeners.forEach(function callListener (listener) {
            listener.call(socket, socket, io);
        });
    });

    /**
     * Initializes the socket server, using the provided port (or the default one: 1337)
     * If the port is in use, it will increment the port until an open one is found.
     * @param {number=} userPort The port to start the server on
     * @param {Function} done A callback for completion
     * @return {Server} The current Server instance
     */
    this.start = function (userPort, done) {
        if(!done && userPort instanceof Function) {
            done = userPort;
            userPort = undefined;
        }

        port = (typeof userPort === "number" || typeof userPort === "string") ? parseInt(userPort, 10) : 1337;

        if(started === false) {
            var fixPort = function (err) {
                if (err.code === 'EADDRINUSE') http.server.listen(++port);
            };

            http.server.once('listening', function () {
                started = true;
                if(done instanceof Function) done.call(self, port);
                http.server.removeListener("error", fixPort);
                self.emit("start", self);
            });

            http.server.on('error', fixPort);
            http.server.listen(port);
        }
        return self;
    };

    /**
     * Add a listener for socket events
     * @param {function} callback The listener to attach to the socket server
     * @return {Server} The current Server instance
     */
    this.add = function (callback) {
        if(callback instanceof Function) listeners.push(callback);
        return self;
    };

    /**
     * Remove a listener from the socket server
     * @param {function} callback The listener to remove
     * @return {Server} The current Server instance
     */
    this.remove = function (callback) {
        if(listeners.indexOf(callback) > -1) listeners.splice(listeners.indexOf(callback), 1);
        return self;
    };

    /**
     * Stops the socket server
     * @return {Server} The current Server instance
     */
    this.stop = function (done) {
        if(io) {
            sockets.sodaeach(function(socket) { socket.disconnect(); });
            io.close();

            http.server.close();
            connections.sodaeach(function (client) { client.destroy(); });
            self.emit("stop", self);
            started = false;
            if(done instanceof Function) done.call(self, null);
        }
        return self;
    };
};

util.inherits(Server, EventEmitter);
module.exports = Server;
