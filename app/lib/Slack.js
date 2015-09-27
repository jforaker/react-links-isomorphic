var Slack = require('slack-node'),
    $ = require('jquery-deferred'),
    def = $.Deferred()
    ;

var Slacker = function (){};

Slacker.prototype.getSlackChannels = function () {

    var def = $.Deferred();
    var slack = new Slack(process.env.SLACK_API_TOKEN);

    var cb = function (err, response) {
        if (err) {
            def.reject({status: 500, data: {error: err.message}});
        } else if (response.ok) {
            def.resolve(response);
        } else {
            def.reject(response);
        }
    };

    slack.api('channels.list', cb);

    return def.promise();
};

module.exports = new Slacker();