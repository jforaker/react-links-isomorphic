/** @jsx React.DOM */

var React = require('react/addons');
var Vote = require('./Vote')
    ;

var Link = React.createClass({

    render: function () {
        var link = this.props.link;

        var UpvoteButtonProps = {
            upvotes: link.upvotes || 0,
            onUpvote: this.props.handleUpvote,
            objectId: link.objectId
        };

        return (
            <li className="link">
                <Vote upvoteButtonProps={UpvoteButtonProps}/>
                <blockquote>
                    <img src={link.image}/>
                    <cite>
                        <div className="screen-name">@{link.user_name}</div>
                        <a href={link.url} target="_blank">{link.url}</a>
                    </cite>
                    <span className="content">{link.description}</span>
                </blockquote>
            </li>
        )
    }
});

module.exports = Link;