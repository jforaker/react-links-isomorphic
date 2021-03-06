
//this is Client...

var React = require('react/addons');
var LinksApp = require('./components/LinksApp');

var initialStateLinks = JSON.parse(document.getElementById('initial-state-links').innerHTML);
var channels = JSON.parse(document.getElementById('initial-state-channels').innerHTML);
var users = JSON.parse(document.getElementById('initial-state-users').innerHTML);
var userJSON = JSON.parse(document.getElementById('initial-state-currentUser').innerHTML);
var mountNodes = document.getElementById('react-main-mount');

React.render(<LinksApp links={initialStateLinks} channels={channels} users={users} currentUser={userJSON}/>, mountNodes);