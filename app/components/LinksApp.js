/** @jsx React.DOM */

var React = require('react/addons'),
    _ = require('lodash'),
    Link = require('./Link'),
    inspect = require('eyespect').inspector()
    ;

var App = React.createClass({

    componentDidMount: function () {
        console.log('this componentDidMount', this);
    },

    render: function () {

        var content = _.map(this.props.links, function (linkdata) {
            return (
                <Link key={linkdata.objectId} link={linkdata}/>
            )
        });

        return (
            <ul className="links">{content}</ul>
        );
    }
});

module.exports = App;