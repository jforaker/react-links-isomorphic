
var URL = process.env.NODE_ENV === 'production' ? 'https://jakt-slack-links.herokuapp.com' : 'http://localhost:3000';

module.exports = {
    'slackAuth': {
        'clientID': '2165302478.14797407120',
        'clientSecret': '872ee7c3eb1936163b2b0d60d31ef121',
        'callbackURL': URL + '/auth/slack/callback'
    }
};
