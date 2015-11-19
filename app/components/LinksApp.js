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
            updatedLink: null,
            count: 0,
            currentUser: this.props.currentUser
        };
    },

    componentDidMount: function () {
        console.log('this componentDidMount', this.state.links);

        var that = this;
        var socket = io.connect();

        socket.on('linkSaved', function (data) {
           // console.log('data socket' , data);
            if(!data.installationId){
                //no installationId means it is new
                that.addLinkViaSocket(data);
            }
        });

        socket.on('imageUpdated', function (data) {
            console.log('data socket imageUpdated', data);
        });
    },

    addLinkViaSocket: function (link) {
        // Get current application state
        var updatedLinks = this.state.links;
        var count = this.state.count;
        // Add link to the beginning of array
        updatedLinks.unshift(link.object);
        // Set application state
        this.setState({
            links: updatedLinks,
            count: ++count,
            updatedLink: link.object
        });
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

    doFilterByVotes: function () {
        var all = _.sortByOrder(this.props.links, ['upvotes'], ['desc']);
        this.setState({
            links: all,
            isFiltered: false
        });
    },

    doFilterByDate: function () {
        var all = _.sortByOrder(this.props.links, ['createdAt'], ['desc']);
        this.setState({
            links: all,
            isFiltered: false
        });
    },

    render: function () {
        return (
            <div className="posts-app">
                <LinkList
                    handleUpvote={this.handleUpvote}
                    sortFilter={this.sortFilter}
                    clearFilter={this.clearFilter}
                    doFilterByVotes={this.doFilterByVotes}
                    doFilterByDate={this.doFilterByDate}
                    links={this.state.links}
                    channels={this.props.channels}
                    users={this.props.users}
                    count={this.state.count}
                    dismissNew={this.dismissNew}
                    updatedLink={this.state.updatedLink}
                    currentUser={this.state.currentUser}
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
                <p>There is {count} new link! @ {this.props.updatedLink.user_name} just added {this.props.updatedLink.url} </p>
                <a href="#" onClick={this.props.onDismissNew}> dismiss</a>
            </div>
        )
    }
});

var LinkList = React.createClass({
    render: function () {
        var props = this.props;
        var users = this.props.users;
        var links = _.map(this.props.links, function (linkdata) {
            return (
                <Link
                    doSomething={props.something}
                    handleUpvote={props.handleUpvote}
                    handleRemoveUpvote={props.handleRemoveUpvote}
                    key={linkdata.objectId + _.uniqueId()}
                    link={linkdata}
                    users={users}
                    currentUser={props.currentUser}
                    />
            )
        });

        var nots = function () {
            if (this.props.updatedLink) {
                return (
                    <NotificationBar
                        updatedLink={this.props.updatedLink}
                        count={props.count}
                        onDismissNew={props.dismissNew}
                        />
                )
            }
        }.bind(this);

        return (
            <div className="container">
                <ul className="links">

                    {nots()}

                    <Filter
                        sortFilter={props.sortFilter}
                        clearFilter={props.clearFilter}
                        doFilterByVotes={props.doFilterByVotes}
                        doFilterByDate={props.doFilterByDate}
                        channels={props.channels}
                        />
                    {links}
                </ul>
            </div>

        );

        //todo -- remember - parent component is App ^^

        //todo - sort by date or upvotes count
    }
});

module.exports = App;