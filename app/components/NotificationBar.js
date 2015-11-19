/**
 * Created by jakeforaker on 11/19/15.
 */

var React = require('react/addons');

var NotificationBar = React.createClass({
    render: function () {
        var count = this.props.count;

        return (
            <div className={"notification-bar" + (count > 0 ? ' active' : '')}>
                <p>There is {count} new link! @ {this.props.updatedLink.user_name} just
                    added {this.props.updatedLink.url} </p>
                <a href="#" onClick={this.props.onDismissNew}> dismiss</a>
            </div>
        )
    }
});

module.exports = NotificationBar;