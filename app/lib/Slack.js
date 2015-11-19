var Slack = require('slack-node');
var $ = require('jquery-deferred');
var def = $.Deferred();

var Slacker = function (token){
    this.token = token;
    this.Slackr = new Slack(this.token);
};

Slacker.prototype.getSlackChannels = function () {

    var def = $.Deferred();

    var cb = function (err, response) {
        if (err) {
            def.reject({status: 500, data: {error: err.message}});
        } else if (response.ok) {
            def.resolve(response);
        } else {
            def.reject(response);
        }
    };

    this.Slackr.api('channels.list', cb);

    return def.promise();
};

Slacker.prototype.getSlackUsers = function () {

    var def = $.Deferred();

    var cb = function (err, response) {
        if (err) {
            def.reject({status: 500, data: {error: err.message}});
        } else if (response.ok) {
            def.resolve(response);
        } else {
            def.reject(response);
        }
    };

    this.Slackr.api('users.list', cb);

    return def.promise();
};

module.exports = new Slacker(process.env.SLACK_API_TOKEN);