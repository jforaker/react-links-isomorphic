var React = require('react/addons'),
    parseHelper = require('../lib/Parse'),
    slacker = require('../lib/Slack'),
    inspect = require('eyespect').inspector(),
    $ = require('jquery-deferred'),
    _ = require('lodash'),
    ImageResolver = require('image-resolver')
    ;

LinksApp = React.createFactory(require('../components/LinksApp'));


module.exports = function (app) {

    /*
     ngrok http -subdomain=jakt-links 4444
     */


    app.get('/', function (req, res) {

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
                        if(i < 100){

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
                            users: users
                        })
                    );

                    //could make api only by setting res.json and calling get('/') from client
                    res.render('index', {
                        reactOutput: reactHtml,  //render via server. can remove if also remove <%- reactOutput %> from index.ejs
                        links: JSON.stringify(links), //only for pure client side rendering
                        channels: JSON.stringify(channelz),
                        users: JSON.stringify(users)
                    });
                });
            });
        });
    });

    app.post('/saved', function (req, res) {

        inspect(req.body, '/link req.body');

        var socketio = req.app.get('socketio');
        socketio.emit('linkSaved', req.body);
    });
};