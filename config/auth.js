// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'slackAuth': {
        'clientID': '2165302478.14797407120',
        'clientSecret': '872ee7c3eb1936163b2b0d60d31ef121',
        'callbackURL': 'http://localhost:3000/auth/slack/callback'
    }

};
