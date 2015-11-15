
var Parse = require('node-parse-api').Parse,
    $ = require('jquery-deferred'),
    def = $.Deferred()
    ;

var ParseHelper = function (){};

ParseHelper.prototype.getLinks = function () {

    var def = $.Deferred();
    var opts = {
        limit: 100,
        order: '-createdAt' //upvotess
    };

    var P = new Parse({
        app_id: process.env.PARSE_APP_ID,
        master_key: process.env.PARSE_MASTER_KEY
    });

    var cb = function (err, response) {
        if (err) {
            def.reject({status: 500, data: {error: err.message}});
        } else if (response.results && response.results.length) {
            def.resolve(response.results);
            return response.results;
        } else {
            def.reject(response);
        }
    };

    P.find('Links', opts, cb);

    return def.promise();
};

module.exports = new ParseHelper();