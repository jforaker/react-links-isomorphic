var React = require('react/addons'),
    parse = require('../lib/Parse'),
    inspect = require('eyespect').inspector(),
    _ = require('lodash')
    ;

LinksApp = React.createFactory(require('../components/LinksApp'));

module.exports = function(app) {

	app.get('/', function(req, res){

        var items = [];

        parse.find('Links', '', function (err, response) {

            if (response.results && response.results.length) {
                _.each(response.results, function (item) {
                    items.push(item);
                });
            }

            // React.renderToString takes your component and generates the markup
            var reactHtml = React.renderToString(
                LinksApp({
                    links: items //goes to this.props.links in LinksApp!!
                })
            );

            res.render('index.ejs', {
                reactOutput: reactHtml,
                state: JSON.stringify(items) //only for pure client side rendering
            });
        });
	});
};