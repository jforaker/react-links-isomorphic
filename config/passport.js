/**
 * Created by jakeforaker on 11/19/15.
 */


var SlackStrategy = require('passport-slack').Strategy;
var inspect = require('eyes').inspector();

var User = require('./models/user');
var configAuth = require('./auth');

module.exports = function (app, passport) {

    // seralize and deseralize user
    passport.serializeUser(function (user, done) {
        done(null, user._id);
    });
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
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

            process.nextTick(function () {

                if (!req.user) {

                    User.findOne({'slack.SlackId': profile.id}, function (err, user) {

                        if (err) return done(err);

                        if (user) {

                            // if there is a user id already but no token (user was linked at one point and then removed)
                            if (!user.slack.token) {
                                user.slack.token = accessToken;
                                user.slack.name = profile.displayName;
                                user.slack.email = profile._json.info.user.profile.email;

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
                            newUser.slack.email = profile._json.info.user.profile.email;

                            inspect(newUser, 'newUser');

                            newUser.save(function (err) {
                                if (err) return done(err);
                                return done(null, newUser);
                            });
                        }
                    });

                } else {
                    // user already exists and is logged in, we have to link accounts
                    inspect('else called on !req.user');
                    var user = req.user; // pull the user out of the session
                    user.slack.SlackId = profile.id;
                    user.slack.token = accessToken;
                    user.slack.name = profile.displayName;
                    user.slack.email = profile._json.info.user.profile.email;

                    user.save(function (err) {
                        if (err) return done(err);
                        return done(null, user);
                    });
                }
            });
        }
    ));

    app.get('/auth/slack', passport.authenticate('slack'));

    app.get('/auth/slack/callback',
        passport.authenticate('slack', {passReqToCallback: true, failureRedirect: '/'}), function (req, res) {
            res.redirect('/main');
        });

};
