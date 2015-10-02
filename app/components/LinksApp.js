/** @jsx React.DOM */

var React = require('react/addons'),
    _ = require('lodash'),
    Link = require('./Link'),
    Filter = require('./Filter'),
    inspect = require('eyespect').inspector()
    ;

var App = React.createClass({

    getInitialState: function () {
        console.log('this.props.links.length', this.props.links.length);
        return {
            links: this.props.links,
            allLinks: _.cloneDeep(this.props.links),
            count: 0
        };
    },

    componentDidMount: function () {
        console.log('this componentDidMount', this);

        var that = this;
        var socket = io.connect();

        socket.on('linkSaved', function (data) {
            console.log('data socket' , data);
            if(!data.installationId){
                //no installationId means it is new
                that.addLinkViaSocket(data);
            }
        });
    },

    addLinkViaSocket: function (link) {
        // Get current application state
        var updatedLinks = this.state.links;
        var count = this.state.count;
        // Add link to the beginning of array
        updatedLinks.unshift(link.object);
        // Set application state
        this.setState({links: updatedLinks, count: ++count});
    },

    dismissNew: function () {

        console.log('dismissed');
        this.setState({count: 0})
    },

    updatePostsAfterUpvote: function (channel, isFiltered) {
        var notFIltered = _.sortByOrder(this.props.links, ['upvotes', 'createdAt'], ['desc', 'desc']);
        var all;

        if(isFiltered){
            all = _.filter(notFIltered, function (n) {
                return n.channel_id === channel;
            });
        }

        console.log('all', all);

        this.setState({
            links: isFiltered ? all : notFIltered,
            isFiltered: isFiltered
        });
    },

    updateAfterUpvote: function (id, count) {
        var updatedCount = +(++count);
        var parseObj = new Parse.Query('Links');
        var filter = null;
        var channel = null;

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

        //todo -- does not respect if no filter is chosen


        if(this.state.isFiltered){
            channel = _.findWhere(this.props.links, {objectId: id}).channel_id;
            filter = true;
        }
        
        _.extend(_.findWhere(this.props.links, {objectId: id}), {
            upvotes: updatedCount
        });

        this.updatePostsAfterUpvote(channel, filter);
    },

    handleUpvote: function (postId, count, e) {

        //todo filter should be here

        e.preventDefault();
        this.updateAfterUpvote(postId, count);
    },

    sortFilter: function (channelId, e) {

        var all = _.filter(this.props.links, function (n) {
            return n.channel_id === channelId;
        });

        this.setState({
            links: all,
            isFiltered: true
        });
    },

    clearFilter: function () {
        this.setState({
            links: this.state.allLinks,
            isFiltered: true
        });
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
                    count={this.state.count}
                    dismissNew={this.dismissNew}
                    />
            </div>
        );
    }
});

var NotificationBar = React.createClass({
    render: function () {
        var count = this.props.count;

        return (
            <div className={"notification-bar" + (count > 0 ? ' active' : '')}>
                <p>There are {count} new tweets!</p>
                <a href="#" onClick={this.props.onDismissNew}> dismiss</a>
            </div>
        )
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
                    key={linkdata.objectId + _.uniqueId()}
                    link={linkdata}
                    />
            )
        });

        return (
            <ul className="links">
                <NotificationBar
                    count={props.count}
                    onDismissNew={props.dismissNew}
                    />

                <Filter
                    sortFilter={props.sortFilter}
                    clearFilter={props.clearFilter}
                    channels={props.channels}
                    />
                {links}
            </ul>
        );

        //todo -- remember - parent component is App ^^

        //todo - sort by date or upvotes count 
    }
});

module.exports = App;