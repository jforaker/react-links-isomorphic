module.exports = function (stream, io) {

    // todo - wip

    stream.on('data', function (data) {

        io.emit('linkSaved', data);

    });

};