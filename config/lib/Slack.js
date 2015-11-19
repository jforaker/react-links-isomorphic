var Slack = require('slack-node');
var $ = require('jquery-deferred');

var Slacker = function (token){
    this.token = token;
    this.Slackr = new Slack(this.token);
};

Slacker.prototype.getApi = function (method, callback) {
    this.Slackr.api(method, callback);
};

module.exports = new Slacker(process.env.SLACK_API_TOKEN);