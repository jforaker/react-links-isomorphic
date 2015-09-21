/** @jsx React.DOM */

var React = require('react/addons');
var $ = require('jquery');
var parse = require('../lib/Parse');
var _ = require('lodash');

var Vote = React.createClass({

    getInitialState: function () {
        return {
            votes: this.props.upvotes || 0
        };
    },

    render: function () {
        var votes = this.props.upvoteButtonProps.upvotes;
        var id = this.props.upvoteButtonProps.objectId;

        var upvoteFunction = this.props.upvoteButtonProps.onUpvote;

        return (
            <a  href="#"
                onClick={upvoteFunction.bind(null, id, votes)}>
                votes = {votes}
            </a>
        );
    }
});

module.exports = Vote;