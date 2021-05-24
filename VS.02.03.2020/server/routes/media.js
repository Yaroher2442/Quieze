exports.setup = function (io) {
    var currentMedia = {};

    exports.loadMedia = function (req, res) {
        res.send(currentMedia);
    };

    exports.startMedia = function (req, res) {
        currentMedia = req.body;

        io.sockets.emit('media:start', currentMedia);

        res.send(204);
    };

    exports.completeMedia = function (req, res) {
        io.sockets.emit('media:complete');
        res.send(204);
    };
};
