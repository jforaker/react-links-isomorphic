
var URL = process.env.NODE_ENV === 'production' ? 'https://jakt-slack-links.herokuapp.com' : 'http://localhost:3000';

module.exports = {
    'slackAuth': {
        'clientID': process.env.SLACK_OAUTH_CLIENT_ID,
        'clientSecret': process.env.SLACK_OAUTH_CLIENT_SECRET,
        'callbackURL': URL + '/auth/slack/callback'
    }
};
