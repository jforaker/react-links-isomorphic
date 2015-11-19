var LocalStrategy = require('passport-local').Strategy;
var SlackStrategy = require('passport-slack').Strategy;
var User = require('./models/user');
var configAuth = require('./auth');
var inspect = require('eyes').inspector();
var Parse = require('parse/node').Parse;
Parse.initialize(process.env.PARSE_APP_ID, process.env.PARSE_MASTER_KEY);


module.exports = function(passport) {

    passport.serializeUser(function (user, done) {
        console.log('serializeUser: ' + user._id)
        done(null, user._id);
    });
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            console.log(user);
            if (!err) done(null, user);
            else done(err, null);
        })
    });

    passport.use(new SlackStrategy({
            clientID: configAuth.slackAuth.clientID,
            clientSecret: configAuth.slackAuth.clientSecret,
            callbackURL: configAuth.slackAuth.callbackURL,
            scope: 'identify,read,client',
            passReqToCallback: true
        },
        function (req, accessToken, refreshToken, obj, profile, done) {

            inspect(req.user, 'SlackStrategy passReqToCallback');

            process.nextTick(function () {
                inspect(profile._json.info.user.profile.email, 'profile._json.info.user.profile.email');

                //todo was // if the user is not already logged in:  if (!req.user)
                if (!req.user) {

                    User.findOne({'slack.SlackId': profile.id}, function (err, user) {

                        if (err) return done(err);

                        if (user) {

                            // if there is a user id already but no token (user was linked at one point and then removed)
                            if (!user.slack.token) {
                                user.slack.token = accessToken;
                                user.slack.name = profile.displayName;

                                user.save(function (err) {
                                    if (err) return done(err);

                                    return done(null, user);
                                });
                            }

                            return done(null, user); // user found, return that user

                        } else {
                            // if there is no user, create them
                            var newUser = new User();

                            newUser.slack.SlackId = profile.id;
                            newUser.slack.token = accessToken;
                            newUser.slack.name = profile.displayName;

                            inspect(newUser, 'newUser');

                            newUser.save(function (err) {
                                if (err) return done(err);

                                return done(null, newUser);
                            });
                        }
                    });

                } else {
                    // user already exists and is logged in, we have to link accounts
                    inspect('else called');
                    var user = req.user; // pull the user out of the session
                    user.slack.SlackId = profile.id;
                    user.slack.token = accessToken;
                    user.slack.name = profile.displayName;

                    user.save(function (err) {
                        if (err)
                            return done(err);

                        return done(null, user);
                    });
                }
            });

            //User.findOrCreate({SlackId: profile.id}, function (err, user) {
            //    return done(err, user);
            //});
        }
    ));


    // LOCAL LOGIN ============================================================

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {
        if (email)
            email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

        // asynchronous
        process.nextTick(function() {
            User.findOne({ 'local.email' :  email }, function(err, user) {
                // if there are any errors, return the error
                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!user)
                    return done(null, false, req.flash('loginMessage', 'No user found.'));

                if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

                // all is well, return user
                else
                    return done(null, user);
            });
        });

    }));


    // LOCAL SIGNUP ============================================================

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {
        if (email)
            email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

        // asynchronous
        process.nextTick(function() {
            // if the user is not already logged in:
            if (!req.user) {
                User.findOne({ 'local.email' :  email }, function(err, user) {
                    // if there are any errors, return the error
                    if (err)
                        return done(err);

                    // check to see if theres already a user with that email
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {

                        // create the user
                        var newUser            = new User();

                        newUser.local.email    = email;
                        newUser.local.password = newUser.generateHash(password);

                        newUser.save(function(err) {
                            if (err)
                                return done(err);

                            return done(null, newUser);
                        });
                    }

                });
            // if the user is logged in but has no local account...
            } else if ( !req.user.local.email ) {
                // ...presumably they're trying to connect a local account
                // BUT let's check if the email used to connect a local account is being used by another user
                User.findOne({ 'local.email' :  email }, function(err, user) {
                    if (err)
                        return done(err);
                    
                    if (user) {
                        return done(null, false, req.flash('loginMessage', 'That email is already taken.'));
                        // Using 'loginMessage instead of signupMessage because it's used by /connect/local'
                    } else {
                        var user = req.user;
                        user.local.email = email;
                        user.local.password = user.generateHash(password);
                        user.save(function (err) {
                            if (err)
                                return done(err);
                            
                            return done(null,user);
                        });
                    }
                });
            } else {
                // user is logged in and already has a local account. Ignore signup. (You should log out before trying to create a new account, user!)
                return done(null, req.user);
            }

        });

    }));
};
