/** @jsx React.DOM */

var React = require('react/addons'),
    Vote = require('./Vote'),
    $ = require('jquery'),
    _ = require('lodash')
    ;

var Dropdown = React.createClass({
    getInitialState: function () {
        return {
            listVisible: false,
            selected: 'All',
            currentFilter: 'All'
        };
    },

    clear: function (e) {
        e.preventDefault();
        this.setState({
            currentFilter: 'All'
        });
        return this.props.clear();
    },

    byVotes: function (e) {
        e.preventDefault();
        this.setState({
            currentFilter: 'byVotes'
        });
        return this.props.filterByVotes();
    },

    mostRecent: function (e) {
        e.preventDefault();
        this.setState({
            currentFilter: 'mostRecent'
        });
        return this.props.filterByDate();
    },

    select: function (id, name) {
        this.setState({
            selected: name
        });
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
            color: 'darkslategray'
        };

        var checkHidden = function (kind) {
            console.log('this.state.currentFilter', this.state.currentFilter);
            if (this.state.currentFilter === 'All') {
                return {
                    display: 'none'
                }
            } else if (this.state.currentFilter === kind){
                return {
                    display: 'inline-block'
                }
            } else {
                return {
                    display: 'none'
                }
            }
        }.bind(this);

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

                <div className="header-container-container">
                    <div className="column header-container">
                        <a
                            href="#"
                            style={style}
                            className={'filterTab'}
                            onClick={this.clear}>
                            Clear filter <i className="fa fa-check" style={checkHidden('All')}></i>
                        </a>
                    </div>
                    <div className="column header-container">
                        <a
                            href="#"
                            style={style}
                            className={'filterTab'}
                            onClick={this.byVotes}>
                            Votes <i className="fa fa-check" style={checkHidden('byVotes')}></i>
                        </a>
                    </div>
                    <div className="column header-container">
                        <a
                            href="#"
                            style={style}
                            className={'filterTab'}
                            onClick={this.mostRecent}>
                            Recent <i className="fa fa-check" style={checkHidden('mostRecent')}></i>
                        </a>
                    </div>
                </div>
            </div>

            //todo trickle selected filter to recent and byvotes
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
                    filterByVotes={props.doFilterByVotes}
                    filterByDate={props.doFilterByDate}
                    />
            </div>
        )
    }
});

module.exports = Filter;