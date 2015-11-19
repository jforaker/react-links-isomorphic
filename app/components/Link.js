/** @jsx React.DOM */

var React = require('react/addons');
var $ = require('jquery');
var Vote = require('./Vote');
var _ = require('lodash');

var ClickMixin = {
    _clickDocument: function (e) {
        var component = this.refs.component.getDOMNode();
        if (e.target == component || $(component).has(e.target).length) {
            this.clickInside(e);
        } else {
            this.clickOutside(e);
        }
    },
    componentDidMount: function () {
        $(document).bind('click', this._clickDocument);
    },
    componentWillUnmount: function () {
        $(document).unbind('click', this._clickDocument);
    }
};

var CommentsForm = React.createClass({

    mixins: [React.addons.LinkedStateMixin],

    getInitialState: function () {
        return {
            comment: '',
            socket: null
        };
    },

    componentDidMount: function () {

        var socket = io.connect();
        this.setState({
            socket: socket
        });
    },

    handleChange: function (e) {
        this.setState({
            comment: e.target.value
        });
    },

    reset: function (comment) {
        console.log('comment', comment.get('comment'));
        var that = this;
        this.state.socket.emit('commentSaved', comment);

        $.ajax({
            url: 'commentSaved',
            type: 'POST',
            data: comment,
            success: function (data, textStatus, jqXHR) {
                console.log('arguments succecss commentSaved' , arguments );
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.warn('err commentSaved', arguments)
            }
        });

        this.state.socket.on('commentSaved', function (data) {
            if (data) {
                that.props.loadComments();
            }
        });
    },

    submit: function (e) {
        e.preventDefault();

        var that = this;
        //save comment
        var myComment = new Parse.Object('Comments');
        myComment.set('comment', this.state.comment);
        myComment.set('user_name', this.props.currentUser.slack.name);

        myComment.save({
            success: function () {
                var Links = new Parse.Object('Links');
                Links.id = that.props.linkId;
                Links.relation('comments').add(myComment);
                Links.save();
                return myComment;
            }
        }).done(function (comment) {
            setTimeout(function () {
                that.setState({ comment: '' });
                that.reset(comment);
            }, 444);  //fucking parse sucks!
        });

    },
    render: function () {
        return (
            <form className="form-inline" onSubmit={this.submit}>
                <div className="form-group">
                    <input type="text" className="form-control" placeholder="Add comment"
                           value={this.state.comment}
                           onChange={this.handleChange}/>
                </div>
            </form>
        );
    }
});

var Comments = React.createClass({

    mixins: [ClickMixin],

    getInitialState: function(){
        return {
            comments: [],
            isShown: false
        }
    },

    componentDidMount: function(){
        this.loadComments();
    },

    loadComments: function () {
        var Links = new Parse.Object('Links');
        Links.id = this.props.linkId;  //'zLvKXQ8ey6';
        var relation = Links.relation('comments');
        var query = relation.query();
        var commentsArray = [];
        var promises = [];

        var done = function (d) {
            this.setState({
                comments: commentsArray,
                isShown: !!commentsArray.length
            });
        }.bind(this);

        var iterate = function (results) {
            results.forEach(function (result) {

                var promise = _.extend({}, {
                    comment: result.get('comment'),
                    user_name: result.get('user_name'),
                    created_at: result.get('createdAt') //internal
                });
                commentsArray.push(promise);
                promises.push(promise);
            });
            return Parse.Promise.when(promises);
        };

        query.find()
            .then(iterate)
            .then(done)
        ;
    },

    clickInside: function (e) {
        this.setState({
            isShown: true
        });
    },
    clickOutside: function (e) {
        this.setState({
            isShown: false
        });
    },

    render: function () {

        var that = this;
        var threadShowing = {
            display: this.state.isShown ? 'block' : 'none'
        };
        var commentBubble = (function () {
            if (this.state.comments.length){
                return (
                    <div className="comm-bubble">
                        <i className="fa fa-comment-o"></i> {this.state.comments.length}
                    </div>
                )
            } else {
                return (  <div className="spacer"></div>)
            }
        }.bind(this))();

        return (
            <div ref='component'>
                {commentBubble}

                <CommentsForm linkId={this.props.linkId} currentUser={this.props.currentUser} loadComments={this.loadComments}/>

                <ul style={threadShowing}>

                    {_.map(_.sortByOrder(this.state.comments, ['created_at'], ['asc']), function (comment, i) {
                        return (
                            <li key={i}>
                                <User name={comment.user_name} users={that.props.users} size={'image_24'}/>
                                <span className="userName"> @{comment.user_name}: </span>
                                <span className="userComment"> {comment.comment} </span>
                            </li>
                        )
                    })}
                </ul>
            </div>
        )
    }
});


var User = React.createClass({

    matchImage: function () {
        var name = this.props.name;
        var size = this.props.size || 'image_48';
        return _.findWhere(this.props.users, {name: name}).profile[size];
    },

    render: function () {
        var hw = this.props.size ? '24' : '48';
        return (
            <img height={hw} src={this.matchImage()} width={hw}/>
        )
    }
});

var Link = React.createClass({

    render: function () {
        var link = this.props.link;
        var users = this.props.users;

        var UpvoteButtonProps = {
            upvotes: link.upvotes || 0,
            onUpvote: this.props.handleUpvote,
            objectId: link.objectId
        };

        return (
            <li className="link">
                <div className="inner">
                    <Vote upvoteButtonProps={UpvoteButtonProps}/>

                    <div className="center">
                        <a className="link-link" href={link.url} target="_blank">{link.url}</a>
                        <span className="content-desc">{link.description}</span>
                    </div>
                    <div className="right">
                        <div className="user-image">@{link.user_name}</div>
                        <User name={link.user_name} users={users}/>
                    </div>
                </div>

                <div className="comments">
                    <Comments currentUser={this.props.currentUser} linkId={link.objectId} users={users}/>
                </div>
            </li>
        )
    }
});

module.exports = Link;