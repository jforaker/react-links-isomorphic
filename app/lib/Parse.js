
var Parse = require('node-parse-api').Parse,
    $ = require('jquery-deferred'),
    def = $.Deferred()
    ;

var ParseHelper = function (appId, master_key){
    this.app_id = appId;
    this.master_key = master_key;

    this.P = new Parse({
        app_id: this.app_id,
        master_key: this.master_key
    })
};

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

    this.P.find('Links', opts, cb);

    return def.promise();
};



module.exports = new ParseHelper(process.env.PARSE_APP_ID, process.env.PARSE_MASTER_KEY);