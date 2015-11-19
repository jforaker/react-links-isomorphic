/** @jsx React.DOM */

var React = require('react/addons');
var $ = require('jquery');
var _ = require('lodash');

var Vote = require('./Vote');
var Comments = require('./Comments');
var User = require('./User');

var Link = React.createClass({

    render: function () {
        var link = this.props.link;
        var users = this.props.users;

        var UpvoteButtonProps = {
            upvotes: link.upvotes || 0,
            onUpvote: this.props.handleUpvote,
            objectId: link.objectId
        };

        return (
            <li className="link">
                <div className="inner">
                    <Vote upvoteButtonProps={UpvoteButtonProps}/>

                    <div className="center">
                        <a className="link-link" href={link.url} target="_blank">{link.url}</a>
                        <span className="content-desc">{link.description}</span>
                    </div>
                    <div className="right">
                        <div className="user-image">@{link.user_name}</div>
                        <User name={link.user_name} users={users}/>
                    </div>
                </div>

                <div className="comments">
                    <Comments currentUser={this.props.currentUser} linkId={link.objectId} users={users}/>
                </div>
            </li>
        )
    }
});

module.exports = Link;