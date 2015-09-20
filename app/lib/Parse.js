
var Parse = require('node-parse-api').Parse;

module.exports = new Parse({
    app_id: process.env.PARSE_APP_ID,
    master_key: process.env.PARSE_MASTER_KEY
});