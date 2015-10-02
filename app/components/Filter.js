/** @jsx React.DOM */

var React = require('react/addons'),
    Vote = require('./Vote'),
    $ = require('jquery'),
    _ = require('lodash')
    ;

var Dropdown = React.createClass({
    getInitialState: function () {
        //console.log('this.props dropdown', this.props);
        return {
            listVisible: false,
            selected: 'All'
        };
    },

    clear: function (e) {
        e.preventDefault();
        this.state.selected = 'All';
        return this.props.clear();
    },

    select: function (id, name) {
        this.state.selected = name;
        return this.props.selectFilter(id);
    },

    show: function () {
        this.setState({listVisible: true});
        $(document).bind('click', this.hide);
    },

    hide: function () {
        this.setState({listVisible: false});
        $(document).unbind('click', this.hide);
    },

    render: function () {

        var props = this.props;
        var that = this;

        var channels = _.map(props.list, function (channel) {
            var c = channel;
            return (
                <Channel
                    name={c.name}
                    key={c.id + _.uniqueId()}
                    id={c.id}
                    filterAction={that.select}
                    />
            );
        });
        var style = {
            color: 'white'
        };

        return (
            <div>
                <div className={'dropdown-container' + (this.state.listVisible ? ' show' : '')}>
                    <div
                        className={'dropdown-display' + (this.state.listVisible ? ' clicked': '')}
                        onClick={this.show}>
                        <span>{this.state.selected}</span>
                        <i className="fa fa-angle-down"></i>
                    </div>
                    <div className="dropdown-list">
                        <div>
                            {channels}
                        </div>
                    </div>
                </div>
                <a
                    href="#"
                    style={style}
                    onClick={this.clear}>
                    clear filter
                </a>
            </div>

        );
    }
});


var Channel = React.createClass({

    render: function () {
        var channelName = this.props.name;
        var id = this.props.id;

        return (
            <div className="filter-list-item"
                 key={id + _.uniqueId()}
                 onClick={this.props.filterAction.bind(null, id, channelName)}>
                <span>
                    {channelName}
                </span>
            </div>
        )
    }
});


var Filter = React.createClass({

    render: function () {

        var props = this.props;

        return (
            <div id="dropper">
                <Dropdown
                    list={props.channels}
                    selectFilter={props.sortFilter}
                    clear={props.clearFilter}
                    />
            </div>
        )
    }
});

module.exports = Filter;