/**
 * Created by jakeforaker on 11/19/15.
 */

var React = require('react/addons');
var _ = require('lodash');
var Link = require('./Link');
var Filter = require('./Filter');
var NotificationBar = require('./NotificationBar');

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

module.exports = LinkList;