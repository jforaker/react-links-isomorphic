/** @jsx React.DOM */

var React = require('react/addons');
var Vote = require('./Vote');
var _ = require('lodash');

var User = React.createClass({

    match: function () {
        var name = this.props.name;
        return _.findWhere(this.props.users[1], {name: name}).profile.image_48;
    },

    render: function () {

        return (
            <img height="48" src={this.match()} width="48"/>
        )
    }
});

var Link = React.createClass({

    render: function () {
        var link = this.props.link;
        var users = this.props.users;

        var UpvoteButtonProps = {
            upvotes: link.upvotes || 0,
            onUpvote: this.props.handleUpvote,
            objectId: link.objectId
        };

        /*
         <img src={link.image}/>

         */

        return (
            <li className="link">
                <Vote upvoteButtonProps={UpvoteButtonProps}/>
                <div className="center">

                    <a className="link-link" href={link.url} target="_blank">{link.url}</a>
                    <span className="content-desc">{link.description}</span>
                </div>
                <div className="right">
                    <div className="user-image">@{link.user_name}</div>
                    <User name={link.user_name} users={users} />
                </div>
            </li>
        )
    }
});

module.exports = Link;