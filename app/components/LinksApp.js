/** @jsx React.DOM */

var React = require('react/addons'),
    _ = require('lodash'),
    Link = require('./Link'),
    inspect = require('eyespect').inspector()
    ;
var parse = require('../lib/Parse');


var App = React.createClass({

    getInitialState: function () {
        return {
            links: this.props.links
        };
    },

    componentDidMount: function () {
        console.log('this componentDidMount', this);
    },

    updatePostsAfterUpvote: function () {
        var all = _.sortByOrder(this.props.links, ['upvotes'], ['desc']);
        this.setState({links: all});
    },

    updateAfterUpvote: function (id, count) {
        var updatedCount = +(++count);
        var parseObj = new Parse.Query('Links');

        parseObj.get(id)
            .then(function (linkObj) {
                linkObj.increment('upvotes');
                linkObj.save();
                return linkObj;

            }, function (object, error) {
                console.log('error ', error);
                if (error.code === 100) {
                    window.alert('There was an error with your request. Please try again.');
                }
            });
        
        _.extend(_.findWhere(this.props.links, {objectId: id}), {
            upvotes: updatedCount
        });

        this.updatePostsAfterUpvote();
    },

    handleUpvote: function (postId, count, e) {
        e.preventDefault();
        this.updateAfterUpvote(postId, count);
    },

    render: function () {
        return (
            <div className="posts-app">
                <LinkList
                    handleUpvote={this.handleUpvote}
                    links={this.state.links}
                    />
            </div>
        );
    }
});

var LinkList = React.createClass({
    render: function () {
        var props = this.props;

        console.log('props POSTList' , props);

        var links = _.map(this.props.links, function (linkdata) {
            return (
                <Link
                    handleUpvote={props.handleUpvote}
                    handleRemoveUpvote={props.handleRemoveUpvote}
                    key={linkdata.objectId}
                    link={linkdata}
                    />
            )
        });

        return (
            <ul className="links">
                {links}
            </ul>
        );
    }
});

module.exports = App;