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
 * @module Soda/StaticServer
 * @description A basic, static HTTP server for the Soda Visual Editor
 */

const { MORTGAGE_URL_BASE_PREFIX } = require('../../AWSSodaConfig');

module.exports = function (soda, useExpress, options) {
    if(typeof options !== "object") options = {};

    var self    = this,
        fs = require('fs'),
        path    = require("path"),
        express = require('express'),
        helmet = require('helmet'),
        setHeader = require('setheader'),
        passport   = require('passport'),
        session    = require('express-session'),
        bodyParser = require('body-parser'),
        exphbs = require('express-handlebars'),
        bCrypt = require('bcryptjs'),
        authController = require(path.join(__dirname, "..", "static", "controllers", "authcontroller")),
        LocalStrategy = require('passport-local').Strategy,
        user = null,
        app     = useExpress ? express() : function (req, res) { 
            setHeader(res, 'X-Frame-Options', 'DENY'); 
            res.end('(\/)(;,,;)(\/)'); 
        },
        minify  = require("express-minify"),
        server  = require('https').createServer({
            key: fs.readFileSync(path.join(__dirname, "..", "..", "server.key")),
            cert: fs.readFileSync(path.join(__dirname, "..", "..", "server.cert"))
          },app),
        sodaInstance = soda,
        driver = null;

        app.use(helmet.frameguard({action: "deny"}));

        if (process.env.SODA_SECRET) {
            var Driver = require(path.join(__dirname, "..", "..", "SodaCore", "asset_drivers", "lambda"));
            driver = new Driver(soda, self, soda.config.get("testPath"));
            
            //For BodyParser
            app.use(bodyParser.urlencoded({ extended: true }));
            app.use(bodyParser.json());

            // For Passport
            app.use(session({ 
                secret: process.env.SODA_SECRET, 
                resave: false, saveUninitialized:false,
                cookie:{
                    maxAge : 90000 // fifteen minutes in millis
                }
                }
            )); // session secret

            app.use(passport.initialize());

            app.use(passport.session()); // persistent login sessions

            //For Handlebars
            app.set('views', path.join(__dirname, "..", "static", "views"))
            app.engine(
                "hbs",
                exphbs({
                extname: "hbs",
                defaultLayout: false,
                layoutsDir: "views/layouts/"
                })
            );
            app.set('view engine', '.hbs');

            passport.use('local-signup', new LocalStrategy(
                {
                    usernameField: 'email',
                    passwordField: 'password',
                    passReqToCallback: true // allows us to pass back the entire request to the callback
                },
                function(req, email, password, done) {
                    var generateHash = function(password) {
                        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
                    };

                    var userPassword = generateHash(password);

                    var data = {
                        email: email,
                        password: userPassword
                    };

                    return done(null, data);
                }
            ));

            app.get('/signup', authController.signup);
            app.get('/signin', authController.signin);

            /**
             * Creates the user
             * 
             * @param {Object} req The request object
             * @param {Object} res The response object
             * @param {Function} next The function to call when complete
             */
            function signupUser(req, res, next) {
                driver.makeUser({
                    firstname: req.body.firstname, 
                    lastname: req.body.lastname, 
                    email: req.body.email,
                    password: bCrypt.hashSync(req.body.password, bCrypt.genSaltSync(10), null),
                    last_login: new Date(),
                    status: 0
                }, function(user) {
                    if (user && user.email) {
                        return res.redirect('/signin');
                    }
                    res.redirect('/signup');
                });
            }

            app.post('/signup', signupUser);

            //LOCAL SIGNIN
            passport.use('local-signin', new LocalStrategy(
                {
                    usernameField: 'email',
                    passwordField: 'password',
                    passReqToCallback: true // allows us to pass back the entire request to the callback
                },
                function(req, email, password, done) {
                    driver.getUser({ email: email }, function(err, user) {
                        if (!user) {
                            console.error("Couldn't get user", err);
                            return done(null, false, {
                                message: 'Username does not exist'
                            });
                        }

                        var isValidPassword = function(plainpassword, hashedpassword) {
                            var result = bCrypt.compareSync(plainpassword, hashedpassword);
                            return result;
                        }

                        if (!isValidPassword(password, user.password)) {
                            return done(null, false, {
                                message: 'Incorrect password.'
                            });
                        }
                        else {
                            sodaInstance.config.set('sodauser', email);
                            sodaInstance.assets.reload(sodaInstance.config.get("testPath"), function (err) {
                                if(err) {
                                    console.error(err);
                                }
                                else {
                                    code(0, "Assets for path `" + soda.sodaInstance.get("testPath") + "` reloaded!");
                                }
                            });
                        }
                        
                        return done(null, user);
                    });
                }
            ));

            app.post('/signin', async function(req, res, next) {
                if (req.body.signup) {
                    res.redirect('/signup');
                }
                else {
                    passport.authenticate('local-signin', {
                        successRedirect: '/dashboard',
                        failureRedirect: '/signin'
                    })(req, res, next);
                }
            });

            //serialize
            passport.serializeUser(function(user, done) {
                done(null, user);
            });

            // deserialize user 
            passport.deserializeUser(function(user, done) {
                if (user && user.id) {
                    done(null, user);
                }
                else {
                    driver.getUser({ id: user.id }, function(err, user) {
                        if (err) {
                            soda.console.error("Couldn't deserialize user", err);
                            done(null, false);
                        }
                        
                        done(null, user);
                    });
                }
            });

            /**
             * Determines whether the user is allowed to continue or should be forced to sign in
             * 
             * @param {Object} req The request object
             * @param {Object} res The response object
             * @param {Function} next The function to call when complete
             */
            function isLoggedInBase(req, res, next) {
                if (req.isAuthenticated()) {
                    return next();
                }
                res.redirect('/signin');
            }

             /**
             * Determines whether the user is allowed to continue or should be forced to sign in
             * 
             * @param {Object} req The request object
             * @param {Object} res The response object
             * @param {Function} next The function to call when complete
             */
            function isLoggedIn(req, res, next) {
                if (req.isAuthenticated()) {
                    return res.redirect('/dashboard');
                }
                res.redirect('/signin');
            }

            app.get('/', isLoggedIn, authController.login);

            app.use(express.static(path.join(__dirname, "..", "static")));

            if(options.hook instanceof Function) {
                options.hook.call(self, app);
            }

            if(useExpress) {
                if(options.compression !== false) app.use(require("compression")());
        
                if(options.minify !== false)
                    app.use(minify({ cache: (typeof options.cache === "string" && options.cache !== false) ? options.cache : path.join(__dirname, "..", "cache") }));
        
                app.use('/dashboard', isLoggedInBase, express.static(path.resolve(typeof options.static === "string" ? options.static : (path.join(__dirname, '..', 'static')))));

                process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
            }
        }
        else {
            if(options.hook instanceof Function) {
                options.hook.call(self, app);
            }

            if(useExpress) {
                if(options.compression !== false) app.use(require("compression")());
        
                if(options.minify !== false)
                    app.use(minify({ cache: (typeof options.cache === "string" && options.cache !== false) ? options.cache : path.join(__dirname, "..", "cache") }));
        
                if(options.static !== false) app.use(express.static(path.resolve(typeof options.static === "string" ? options.static : (path.join(__dirname, '..', 'static')))));
        
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
            }
        }
    

    // Workaround for 100-continue status error for Node.js 5.5+
    server.on("checkExpectation", function (req, res) {
        server.emit("request", req, res);
    });

    return {
        app    : app,
        server : server
    };
};
