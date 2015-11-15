require('dotenv').load();
var express = require('express'),
    path = require('path'),
    app = express(),
    port = 3000,
    http = require('http'),
    inspect = require('eyes').inspector(),
    bodyParser = require('body-parser').json(),
    Parse = require('./app/lib/Parse'),
    socketio = require('socket.io')
    ;

// Make sure to include the JSX transpiler
require('node-jsx').install();

// Include static assets. Not advised for productions
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set up Routes for the application
require('./app/routes/routes.js')(app);

//Route not found -- Set 404
app.get('*', function (req, res) {
    res.json({
        'route': 'Sorry this page does not exist!'
    });
});

var server = http.createServer(app);
var io = socketio.listen(server);
app.set('socketio', io); //can call socket io in a route: var socketio = req.app.get('socketio');
app.set('server', server);
app.get('server').listen(port, function () {
    inspect(port, 'Server is Up and Running at Port ');
});