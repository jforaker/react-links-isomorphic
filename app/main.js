/** @jsx React.DOM */

//this is for client side rendering only

var React = require('react/addons');
var LinksApp = require('./components/LinksApp');

var initialState = JSON.parse(document.getElementById('initial-state').innerHTML);

var mountNodes = document.getElementById('react-main-mount');

React.renderComponent(<LinksApp links={initialState}/>, mountNodes);