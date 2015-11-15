/** @jsx React.DOM */

var React = require('react/addons');
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

            <a href="#"
               className="post-vote-button"
               onClick={upvoteFunction.bind(null, id, votes)}>

                <span><i className="fa fa-chevron-up"></i></span>
                <span className="post-vote-button--count"> {votes} </span>

            </a>
        );
    }
});

module.exports = Vote;