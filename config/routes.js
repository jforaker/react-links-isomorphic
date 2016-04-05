/**
 * Created by jakeforaker on 11/19/15.
 */


var async = require('async');
var _ = require('lodash');
var React = require('react/addons');
var ReactDOMServer = require('react-dom/server');
var inspect = require('eyes').inspector();

var slacker = require('./lib/Slack');
var parseHelper = require('./lib/Parse');
var LinksApp = React.createFactory(require('../app/components/LinksApp'));

module.exports = function (app, io) {

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
            userEjs: req.user,
            isProfile: true
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
                var reactHtml = ReactDOMServer.renderToString(
                    LinksApp({
                        links: results.links, //goes to this.props.links in LinksApp!
                        channels: results.channels,
                        users: results.users,
                        userJSON: JSON.stringify(req.user)
                    })
                );
                res.render('main.ejs', {
                    //reactOutput: reactHtml,  //render via server. can remove if also remove <%- reactOutput %> from index.ejs
                    users: JSON.stringify(results.users),
                    channels: JSON.stringify(results.channels),
                    links: JSON.stringify(results.links),   //only for pure client side rendering
                    userEjs: req.user,
                    userJSON: JSON.stringify(req.user),
                    isProfile: false
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

        io.emit('linkSaved', req.body);
    });

    app.post('/commentSaved', function (req, res) {
        //when a comment is saved, update ui in
        //can also call like this:  var socketio = req.app.get('socketio');
        io.emit('commentSaved', req.body);
    });


};

function isLoggedIn(req, res, next) {
    //express middleware to detect session login state
    inspect(req.isAuthenticated(), 'req.isAuthenticated()');
    if (req.isAuthenticated()) return next(); //if authenticated user, do next action, otherwise redirect to login page
    res.redirect('/login');
}
