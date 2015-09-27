/** @jsx React.DOM */

var React = require('react/addons'),
    _ = require('lodash'),
    Link = require('./Link'),
    Filter = require('./Filter'),
    inspect = require('eyespect').inspector()
    ;
var parse = require('../lib/Parse');


var App = React.createClass({

    getInitialState: function () {
        return {
            links: this.props.links,
            allLinks: _.cloneDeep(this.props.links)
        };
    },

    componentDidMount: function () {
        console.log('this componentDidMount', this);
    },

    updatePostsAfterUpvote: function () {
        var all = _.sortByOrder(this.props.links, ['upvotes', 'createdAt'], ['desc', 'desc']);

        this.setState({
            links: all
        });
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

    sortFilter: function (channelId, channelName, e) {
        e.preventDefault();
        var id = channelId.replace('id=', '');

        var all = _.filter(this.props.links, function (n) {
            return n.channel_id === id;
        });

        this.setState({links: all});
    },

    clearFilter: function (e) {
        e.preventDefault();
        this.setState({links: this.state.allLinks});
    },

    render: function () {
        return (
            <div className="posts-app">
                <LinkList
                    handleUpvote={this.handleUpvote}
                    sortFilter={this.sortFilter}
                    clearFilter={this.clearFilter}
                    links={this.state.links}
                    channels={this.props.channels}
                    />
            </div>
        );
    }
});

var LinkList = React.createClass({
    render: function () {
        var props = this.props;

        var links = _.map(this.props.links, function (linkdata) {
            return (
                <Link
                    doSomething={props.something}
                    handleUpvote={props.handleUpvote}
                    handleRemoveUpvote={props.handleRemoveUpvote}
                    key={linkdata.objectId}
                    link={linkdata}
                    />
            )
        });

        return (
            <ul className="links">
                <Filter
                    sortFilter={props.sortFilter}
                    clearFilter={props.clearFilter}
                    channels={props.channels}/>
                {links}
            </ul>
        );
    }
});

module.exports = App;