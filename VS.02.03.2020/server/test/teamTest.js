var should = require('should');
var assert = require('assert');
var request = require('supertest');
var io = require('socket.io-client');

describe('Teams Service', function () {
    var url = 'http://localhost:3000';

    var verifyNoErrors = function (err, res) {
        if (err)
            throw err;
    };

    var assertResponseHasTeam = function (expectedTeam, res) {
        assertTeamsAreEquals(res.body, expectedTeam);
    };

    var assertResponseHasTeams = function (expectedTeams, res) {
        for (var i = 0; i < expectedTeams.length; i++) {
            assertTeamsAreEquals(res.body[i], expectedTeams[i]);
        }
    };

    var assertTeamsAreEquals = function (expectedTeam, actualTeam) {
        actualTeam.name.should.eql(expectedTeam.name);
        actualTeam.score.should.eql(expectedTeam.score);
    }

    /**
     * Delete all teams
     */
    beforeEach(function (done) {
        request(url)
            .del("/api/teams")
            .end(function (err, res) {
                if (err) throw err;
                res.should.have.status(204);
                done();
            })
    });

    describe('Create team', function () {
        it('should return added team in the POST response', function (done) {
            var team = { name: "ViaCode", score: 0 };

            request(url)
                .post('/api/teams')
                .send(team)
                .end(function (err, res) {
                    res.should.have.status(201);
                    assertResponseHasTeam(team, res);
                    done();
                })
        });

        it('should set "createTime" for added team', function (done) {
            var team = { name: "ViaCode", score: 0 };

            request(url)
                .post('/api/teams')
                .send(team)
                .end(function (err, res) {
                    res.body.should.have.property('createTime');
                    done();
                })
        });

        it('should add first team to empty teams', function (done) {
            var team = { name: "ViaCode", score: 0 };

            request(url)
                .post('/api/teams')
                .send(team)
                .end(function () {
                    request(url)
                        .get('/api/teams')
                        .end(function (err, res) {
                            assertResponseHasTeams([team], res);
                            done();
                        })
                })
        });

        it('should add team to non empty teams', function (done) {
            var existingTeam = { name: "Avengers", score: 1 };
            request(url)
                .post('/api/teams')
                .send(existingTeam)
                .end(function () {
                    var addedTeam = { name: "ViaCode", score: 0 };

                    request(url)
                        .post('/api/teams')
                        .send(addedTeam)
                        .end(function () {
                            request(url)
                                .get('/api/teams')
                                .end(function (err, res) {
                                    assertResponseHasTeams([existingTeam, addedTeam], res);
                                    done();
                                })
                        })
                });
        });

        it("should broadcast 'team added' event to all clients", function (done) {
            var addedTeam = { name: "ViaCode", score: 0 };

            function sendPostWith(team) {
                request(url)
                    .post('/api/teams')
                    .send(team)
                    .end(verifyNoErrors);
            }

            var notifiedClientsCount = 0;
            var listenTeamAddedEvent = function (client) {
                client.on('team:added', function (team) {
                    assertTeamsAreEquals(addedTeam, team)
                    client.disconnect();
                    notifiedClientsCount++;
                    if (notifiedClientsCount == 2) {
                        done();
                    }
                })
            };

            var socketClientOptions = { transports: ['websocket'], 'force new connection': true };
            var client1 = io.connect(url, socketClientOptions);
            listenTeamAddedEvent(client1);
            client1.on('connect', function (data) {
                var client2 = io.connect(url, socketClientOptions);
                listenTeamAddedEvent(client2);
                client2.on('connect', function (data) {
                    sendPostWith(addedTeam);
                });
            });
        })
    })
})