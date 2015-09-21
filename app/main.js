/** @jsx React.DOM */

//this is Client...

var React = require('react/addons');
var LinksApp = require('./components/LinksApp');

var initialState = JSON.parse(document.getElementById('initial-state').innerHTML);

var mountNodes = document.getElementById('react-main-mount');

React.render(<LinksApp links={initialState}/>, mountNodes);