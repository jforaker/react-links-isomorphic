/**
 * Created by jakeforaker on 11/19/15.
 */

var React = require('react/addons');
var _ = require('lodash');

var User = React.createClass({

    matchImage: function () {
        var name = this.props.name;
        var size = this.props.size || 'image_48';
        return _.findWhere(this.props.users, {name: name}).profile[size];
    },

    render: function () {
        var hw = this.props.size ? '24' : '48';
        return (
            <img height={hw} src={this.matchImage()} width={hw}/>
        )
    }
});

module.exports = User;