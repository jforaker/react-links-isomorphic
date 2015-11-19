
var url = process.env.NODE_ENV === 'production' ? 'mongodb://jakeforaker:tester@ds057244.mongolab.com:57244/heroku_br5xgsww' : 'mongodb://jakeforaker83:tester@apollo.modulusmongo.net:27017/etA8bymo';

module.exports = {
    'url': 'mongodb://jakeforaker:tester@ds057244.mongolab.com:57244/heroku_br5xgsww' || url
};
