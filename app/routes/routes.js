var React = require('react/addons'),
    parseHelper = require('../lib/Parse'),
    slacker = require('../lib/Slack'),
    inspect = require('eyespect').inspector(),
    $ = require('jquery-deferred'),
    _ = require('lodash'),
    ImageResolver = require('image-resolver'),
    User = require('../../config/models/User')
    ;
var Parse = require('parse/node').Parse;
Parse.initialize(process.env.PARSE_APP_ID, process.env.PARSE_MASTER_KEY);


LinksApp = React.createFactory(require('../components/LinksApp'));



module.exports = function (app, passport) {



    app.get('/', isLoggedIn, function (req, res) {
        var currentUser = req.user;
        inspect(currentUser, 'currentUser');
        if (currentUser) {
            res.redirect('/main');
        } else {
            res.render('login.ejs', {
                message: req.flash('loginMessage')
            });
        }
    });


    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/login', function (req, res) {
        res.render('login.ejs', {message: req.flash('loginMessage')});
    });

    //Slack

    app.get('/auth/slack', passport.authenticate('slack'));

    app.get('/auth/slack/callback',
        passport.authenticate('slack', { passReqToCallback: true, failureRedirect: '/' }), function (req, res) {
            console.log('req.user /auth/slack/callback ' , req.user);
            res.redirect('/main');
        });


    /////
    app.get('/main', isLoggedIn, function (req, res) {

        inspect(req.user, 'req.user get /main');

        User.findById(req.session.passport.user, function (err, user) {
            if (err) {
                console.log(err);
            } else {
                inspect(user, 'user fuck ya');
                //res.render('account', {user: user});
            }
        })

        var links = [];
        var channels = [];
        var users = [];

        slacker.getSlackUsers().then(function (userdata) {

            return _.each(userdata, function (user) {
                users.push(user);
            });

        }).then(function () {

            slacker.getSlackChannels().then(function (data) {

                _.each(data.channels, function (channel) {
                    //inspect(channel, 'channel');

                    if (!channel.is_archived) {
                        channels.push({
                            name: channel.name,
                            id: channel.id
                        });
                    }
                });

                return channels;

            }).then(function (channelz) {

                //inspect(channelz, 'channels');

                var resolver = new ImageResolver();
                resolver.register(new ImageResolver.Webpage());

                parseHelper.getLinks().then(function (linkz) {

                    _.each(linkz, function (item, i) {
                        if (!_.has(item, 'upvotes')) {
                            _.extend(item, {
                                upvotes: 0
                            });
                        }
                        if (i < 100) {


                            //todo promise

                            //resolver.resolve(item.url, function (result) {
                            //    if (result) {
                            //        console.log(result.image);
                            //        _.extend(item, {
                            //            image: result.image
                            //        });
                            //        //var socketio = req.app.get('socketio');
                            //        //socketio.emit('imageUpdated', result.image);
                            //    } else {
                            //        console.log('No image found');
                            //    }
                            //});
                        }

                        //outside this if block
                        links.push(item);
                    });

                    // React.renderToString takes your component and generates the markup
                    var reactHtml = React.renderToString(
                        LinksApp({
                            links: links, //goes to this.props.links in LinksApp!
                            channels: channels,
                            users: users,
                            userJSON: JSON.stringify(req.user)
                        })
                    );

                    //could make api only by setting res.json and calling get('/') from client
                    res.render('main.ejs', {
                        reactOutput: reactHtml,  //render via server. can remove if also remove <%- reactOutput %> from index.ejs
                        links: JSON.stringify(links), //only for pure client side rendering
                        channels: JSON.stringify(channelz),
                        users: JSON.stringify(users),
                        userEjs: req.user,
                        userJSON: JSON.stringify(req.user)
                    });
                });
            });
        });
    });

    app.post('/saved', function (req, res) {

        /*
         https://www.parse.com/apps/slack-bot/cloud_code/webhook#
         https://jakt-slack-links.herokuapp.com/saved
         */

        inspect(req.body, '/link req.body');

        var socketio = req.app.get('socketio');
        socketio.emit('linkSaved', req.body);
    });


};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    inspect(req.isAuthenticated(), 'req.isAuthenticated()');

    if (req.isAuthenticated()){
        return next();
    }

    res.redirect('/login');
}

/*
 ngrok http -subdomain=jakt-links 4444
 */
