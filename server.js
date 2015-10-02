require('dotenv').load();
var express = require('express'),
    path = require('path'),
    app = express(),
    port = 4444,
    inspect = require('eyes').inspector({
        styles: {
            all: 'magenta',
            special: 'bold',
            key: 'bold'
        }
    }),
    bodyParser = require('body-parser'),
    Parse = require('./app/lib/Parse')
    ;

// Make sure to include the JSX transpiler
require('node-jsx').install();

// Include static assets. Not advised for production
app.use(express.static(path.join(__dirname, 'public')));
// Set view path
app.set('views', path.join(__dirname, 'views'));
// set up ejs for templating. You can use whatever
app.set('view engine', 'ejs');

// Set up Routes for the application
require('./app/routes/routes.js')(app);

//Route not found -- Set 404
app.get('*', function (req, res) {
    res.json({
        'route': 'Sorry this page does not exist!'
    });
});

app.listen(port);
inspect(port, 'Server is Up and Running at Port ');