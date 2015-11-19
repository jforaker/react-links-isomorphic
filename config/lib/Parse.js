var Parse = require('node-parse-api').Parse;
var $ = require('jquery-deferred');
var def = $.Deferred();

var ParseHelper = function (appId, master_key){
    this.app_id = appId;
    this.master_key = master_key;

    this.Parsr = new Parse({
        app_id: this.app_id,
        master_key: this.master_key
    })
};

ParseHelper.prototype.getLinks = function (callback) {

    var def = $.Deferred();
    var opts = {
        limit: 75,
        order: '-createdAt' //upvotess
    };

    //keep old cb func -- this is how to return .then()  to def.promise
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

    this.Parsr.find('Links', opts, callback);
};

module.exports = new ParseHelper(process.env.PARSE_APP_ID, process.env.PARSE_MASTER_KEY);