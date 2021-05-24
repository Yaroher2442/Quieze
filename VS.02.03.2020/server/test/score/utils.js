var request = require('supertest');
var should = require('should');
var assert = require('assert');
var io = require('socket.io-client');

var url = 'http://localhost:3000';
var socketClientOptions = { transports: ['websocket'], 'force new connection': true };

//IO client
exports.connect = function () {
    return io.connect(url, socketClientOptions);
};

//Verify HTTP response
var verifyNoErrors = function (err) {
    if (err)
        throw err;
};

var verifyStatus = function (res, status) {
    res.should.have.status(status);
};

//HTTP methods
var httpRequestHandling = function (err, res, success, next) {
    verifyNoErrors(err);

    if (success) {
        success(res);
    }

    if (next) {
        next();
    }
};

var post = function (path, data, success, next) {
    request(url)
        .post(path)
        .send(data)
        .end(function (err, res) {
            httpRequestHandling(err, res, success, next);
        }
    );
};

//Game
exports.setNewScenario = function (scenario, callback) {
    var requests = [
        buildPostRequest('/api/game/scenario', scenario)
    ];
    processRequests(requests, callback);
};

exports.startNewGameWithTeams = function (teams, callback) {
    var requests = [];
    requests.push(buildPostRequest('/restart'));
    requests.push(buildPostRequest('/api/game/start'));

    for (var index = 0; index < teams.length; ++index) {
        var team = teams[index];
        var data = team.data;

        var teamCreatedCallback = function (res) {
            var createdTeam = res.body;

            var filtered = teams.filter(function (team) {
                return team.data.name === createdTeam.name;
            });

            filtered[0].teamId = createdTeam.teamId;
        };

        requests.push(buildPostRequest('/api/teams', data, teamCreatedCallback));
    }

    processRequests(requests, callback);
};

exports.playTestRound = function (options, callback) {
    exports.playNextRound(options, [], [], callback);
};

exports.playNextRound = function (options, decisions, answers, callback) {
    var requests = [];
    requests.push(buildPostRequest('/api/game/round/start', options));

    for (var index = 0; index < decisions.length; ++index) {
        var decision = decisions[index];

        requests.push(buildPostRequest('/api/game/round/setTeamDecision', decision));
    }

    for (var index = 0; index < answers.length; ++index) {
        var answer = answers[index];

        requests.push(buildPostRequest('/api/game/round/addAnswer', answer));
    }

    requests.push(buildPostRequest('/api/game/round/showResults'));
    requests.push(buildPostRequest('/api/game/round/finish'));

    processRequests(requests, callback);
};

//Request helpers
var buildPostRequest = function (path, data, callback) {
    return {
        method: post,
        path: path,
        data: data,
        callback: callback
    };
};

var buildRequestCall = function (method, path, data, callback, next) {
    return function () {
        method(path, data, callback, next);
    }
};

var processRequests = function (requests, done) {
    var call = done ? done : null;

    var queue = requests.slice();
    while (queue.length > 0) {
        var request = queue.pop();

        call = buildRequestCall(request.method, request.path, request.data, request.callback, call);
    }

    if (call) {
        call();
    }
};

//Asserts
exports.containsTeamWithScore = function (teams, teamId, lastRoundScore) {
    var actualTeam = teams.filter(function (existingTeam) {
        return existingTeam.teamId === teamId;
    });

    actualTeam[0].lastRoundScore.should.eql(lastRoundScore);
};