var React = require('react/addons'),
    parseHelper = require('../lib/Parse'),
    slacker = require('../lib/Slack'),
    inspect = require('eyespect').inspector(),
    $ = require('jquery-deferred'),
    _ = require('lodash'),
    ImageResolver = require('image-resolver')
    ;

LinksApp = React.createFactory(require('../components/LinksApp'));

module.exports = function(app) {

	app.get('/', function(req, res){

        var links = [];
        var channels = [];

        slacker.getSlackChannels().then(function (data) {

            return _.each(data.channels, function (channel) {
                channels.push({
                    name: channel.name,
                    id: channel.id
                });

                return channels;
            });

        }).then(function (channelz) {

            inspect(channelz, 'channels');

            var resolver = new ImageResolver();
            resolver.register(new ImageResolver.Webpage());

            parseHelper.getLinks().then(function (linkz) {

                _.each(linkz, function (item, i) {
                    if (!_.has(item, 'upvotes')) {
                        _.extend(item, {
                            upvotes: 0
                        });
                    }
                    //if(i < 10){
                    //
                    //    //todo promise
                    //
                    //    resolver.resolve(item.url, function (result) {
                    //        if (result) {
                    //            console.log(result.image);
                    //            _.extend(item, {
                    //                image: result.image
                    //            });
                    //        } else {
                    //            console.log('No image found');
                    //        }
                    //    });
                    //}
                    links.push(item);
                });

                // React.renderToString takes your component and generates the markup
                var reactHtml = React.renderToString(
                    LinksApp({
                        links: links, //goes to this.props.links in LinksApp!
                        channels: channels
                    })
                );

                //could make api only by setting res.json and calling get('/') from client
                res.render('index', {
                    reactOutput: reactHtml,  //render via server. can remove if also remove <%- reactOutput %> from index.ejs
                    init_state: JSON.stringify(links), //only for pure client side rendering
                    channels: JSON.stringify(channelz)
                });
            });
        });
	});
};