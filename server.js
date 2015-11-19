/************************************************
 JAKT Slack links isomorphic react app
 created by jforaker https://github.com/jforaker
 https://github.com/jforaker/react-links-isomorphic
 ***********************************************/

require('dotenv').load();
var express = require('express');
var path = require('path');
var app = express();
var port = process.env.PORT || 3000;
var _ = require('lodash');
var http = require('http');
var inspect = require('eyes').inspector();
var bodyParser = require('body-parser');
var socketio = require('socket.io');
var React = require('react/addons');
var SlackStrategy = require('passport-slack').Strategy;
var mongoose = require('mongoose');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
var configDB = require('./config/database.js');
var passport = require('passport');
var User = require('./config/models/user');
var configAuth = require('./config/auth');
var slacker = require('./app/lib/Slack');
var parseHelper = require('./app/lib/Parse');
var engine = require('ejs-locals');
var async = require('async');
require('node-jsx').install();

var LinksApp = React.createFactory(require('./app/components/LinksApp'));

mongoose.connect(configDB.url);

app.set('views', __dirname + '/views');
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('port', port);
app.use(cookieParser());
app.use(bodyParser());
app.use(session({secret: 'Methionylglutaminylarginyltyrosylglutamyl'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(express.static(__dirname + '/public'));

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


//todo - separate into modular files...

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

app.get('/', isLoggedIn, function (req, res) {
    var currentUser = req.user;
    if (currentUser) {
        res.redirect('/main');
    } else {
        res.render('login.ejs', {
            userEjs: null,
            message: req.flash('loginMessage')
        });
    }
});

app.get('/profile', isLoggedIn, function (req, res) {
    res.render('profile.ejs', {
        user: req.user,
        userEjs: req.user
    });
});

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

app.get('/login', function (req, res) {
    var currentUser = req.user;
    if (currentUser) {
        res.redirect('/main');
    } else {
        res.render('login.ejs', {
            userEjs: null,
            message: req.flash('loginMessage')
        });
    }
});

/***********************************************
 Passport slack
 ***********************************************/

app.get('/auth/slack', passport.authenticate('slack'));

app.get('/auth/slack/callback',
    passport.authenticate('slack', {passReqToCallback: true, failureRedirect: '/'}), function (req, res) {
        res.redirect('/main');
    });

/***********************************************
 ***********************************************/

app.get('/main', isLoggedIn, function (req, res) {
    var users = [];
    var links = [];
    var channels = [];

    async.parallel({
            users: function (callback) {
                slacker.getApi('users.list', function (err, userdata) {
                    if (err) return callback(err);
                    _.each(userdata.members, function (user) {
                        users.push(user);  //create users array for frontend matching profile pics etc.
                    });
                    callback(null, users);
                })
            },
            channels: function (callback) {
                slacker.getApi('channels.list', function (err, data) {
                    if (err) return callback(err);
                    _.each(data.channels, function (channel) {
                        if (!channel.is_archived) {
                            channels.push({
                                name: channel.name,
                                id: channel.id
                            });
                        }
                    });
                    callback(null, channels); //get slack channels to store in dropdown filter
                })
            },
            links: function (callback) {
                parseHelper.getLinks(function (err, linkz) {
                    if (err) return callback(err);
                    _.each(linkz.results, function (item, i) {
                        if (!_.has(item, 'upvotes')) _.extend(item, {upvotes: 0}); //if link has no upvotes, add 0 value for upvotes
                        links.push(item); //return links from /link slash command on parse and extend them with 0 vote ^
                    });
                    callback(null, links);
                });
            }
        },
        function (err, results) {
            if (err) throw err;
            // React.renderToString takes your component and generates the markup
            var reactHtml = React.renderToString(
                LinksApp({
                    links: results.links, //goes to this.props.links in LinksApp!
                    channels: results.channels,
                    users: results.users,
                    userJSON: JSON.stringify(req.user)
                })
            );
            res.render('main.ejs', {
                reactOutput: reactHtml,  //render via server. can remove if also remove <%- reactOutput %> from index.ejs
                users: JSON.stringify(results.users),
                channels: JSON.stringify(results.channels),
                links: JSON.stringify(results.links),   //only for pure client side rendering
                userEjs: req.user,
                userJSON: JSON.stringify(req.user)
            });
        });
});

app.post('/saved', function (req, res) {

    /***************************************************
     https://www.parse.com/apps/slack-bot/cloud_code/webhook#
        ^^webhook called when a link is saved - show it in the Notifications component on the frontend
     https://jakt-slack-links.herokuapp.com/saved
     ***************************************************/

    inspect(req.body, '/link req.body');

    var socketio = req.app.get('socketio');
    socketio.emit('linkSaved', req.body);
});

app.post('/commentSaved', function (req, res) {
    //when a comment is saved, update ui in
    var socketio = req.app.get('socketio');
    socketio.emit('commentSaved', req.body);
});

var server = http.createServer(app);
var io = socketio.listen(server);
app.set('socketio', io); //can call socket io in a route: var socketio = req.app.get('socketio');
app.set('server', server);
app.get('server').listen(port, function () {
    inspect(port, 'Server is Up and Running at Port ');
});

function isLoggedIn(req, res, next) {
    //express middleware to detect session login state
    inspect(req.isAuthenticated(), 'req.isAuthenticated()');
    if (req.isAuthenticated()) return next(); //if authenticated user, do next action, otherwise redirect to login page
    res.redirect('/login');
}
