/** @jsx React.DOM */

var React = require('react/addons'),
    Vote = require('./Vote'),
    _ = require('lodash')
    //Select = require('react-select')
    ;

var Channel = React.createClass({

    render: function () {
        var channelName = this.props.channelName;
        var id = this.props.channelId;

        return (
            <li className="link">
                <a
                    href="#"
                    className="vote"
                    onClick={this.props.filter.bind(null, id, channelName)}>
                    {channelName}
                </a>
            </li>
        )
    }
});



var Filter = React.createClass({

    render: function () {

        var props = this.props;

        var channels = _.map(props.channels, function (channel) {
            var c = channel;
            var name = c.channel_name.replace('channel_name_', '');
            var id = c.channel_id.replace('channel_id_', 'id=');
            return (
                <Channel
                    channelName={name}
                    key={id}
                    channelId={id}
                    filter={props.sortFilter}
                    clearFilter={props.clearFilter}
                    />
            );
        });

        var style = {
            color: 'white'
        };

        return (
            <ul>
                {channels}
                <a
                    href="#"
                    style={style}
                    onClick={this.props.clearFilter}>
                    clear filter
                </a>
            </ul>
        )
    }
});

module.exports = Filter;