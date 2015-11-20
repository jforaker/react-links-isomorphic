/************************************************
 JAKT Slack links isomorphic react app
 created by jforaker https://github.com/jforaker
 https://github.com/jforaker/react-links-isomorphic
 ***********************************************/

require('dotenv').load();
var express = require('express');
var path = require('path');
var app = express();
var port = process.env.PORT || 3000;
var _ = require('lodash');
var http = require('http');
var inspect = require('eyes').inspector();
var bodyParser = require('body-parser');
var socketio = require('socket.io');
var mongoose = require('mongoose');
var session = require('express-session');
var cookieSession = require('cookie-session')
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
var configDB = require('./config/database.js');
var passport = require('passport');
var engine = require('ejs-locals');
require('node-jsx').install();

mongoose.connect(configDB.url);

app.set('views', __dirname + '/views');
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('port', port);
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieSession({
    name: 'session',
    keys: ['foo', 'bar'] 
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(express.static(__dirname + '/public'));

var server = http.createServer(app);
var io = socketio.listen(server);
app.set('socketio', io); //can call socket io in a route: var socketio = req.app.get('socketio');
app.set('server', server);
require('./config/passport')(app, passport);
require('./config/routes')(app, io); // load our routes and pass in our app and fully configured passport

app.get('server').listen(port, function () {
    inspect(port, 'Server is Up and Running at Port ');
});
