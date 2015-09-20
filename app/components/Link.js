/** @jsx React.DOM */

var React = require('react/addons');

var Link = React.createClass({
    render: function () {
        var link = this.props.link;
        return (
            <li className="link">
                <blockquote>
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