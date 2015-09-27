var React = require('react/addons'),
    parse = require('../lib/Parse'),
    slacker = require('../lib/Slack'),
    inspect = require('eyespect').inspector(),
    request = require('request'),
    $ = require('jquery-deferred'),
    _ = require('lodash')
    ;

LinksApp = React.createFactory(require('../components/LinksApp'));

module.exports = function(app) {

    var links = [];
    var channels = [];

	app.get('/', function(req, res){

        slacker.getSlackChannels().then(function (data) {

            _.each(data.channels, function (channel) {
                channels.push({
                    channel_name: 'channel_name_' + channel.name,
                    channel_id: 'channel_id_' + channel.id
                });
            });

        }).then(function () {

            parse.getLinks().then(function (d) {

                _.each(d, function (item) {
                    if (!_.has(item, 'upvotes')) {
                        _.extend(item, {
                            upvotes: 0
                        });
                    }
                    links.push(item);
                });

                // React.renderToString takes your component and generates the markup
                var reactHtml = React.renderToString(
                    LinksApp({
                        links: links, //goes to this.props.links in LinksApp!
                        channels: channels
                    })
                );

                res.render('index.ejs', {
                    reactOutput: reactHtml,
                    state: JSON.stringify(links), //only for pure client side rendering
                    channels: JSON.stringify(channels)
                });
            });
        });
	});
};