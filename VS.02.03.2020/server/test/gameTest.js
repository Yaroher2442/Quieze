var should = require('should');
var assert = require('assert');
var request = require('supertest');
var io = require('socket.io-client');

describe('Game Service', function () {
    var url = 'http://localhost:3000';

    var verifyNoErrors = function (err, res) {
        if (err)
            throw err;
    };

    var showQuestion = function (callback) {
        request(url)
            .post('/api/game/question/show')
            .send({questionId : 0})
            .end(function(err, res) {
                verifyNoErrors();
                if (callback) {
                    callback();
                }
            }
        );
    };

    var startQuestion = function (callback) {
        request(url)
            .post('/api/game/question/start')
            .end(function(err, res) {
                verifyNoErrors();
                if (callback) {
                    callback();
                }
            });
    };

    describe('Show new question', function () {
        it('should broadcast "round:showQuestion" event', function (done) {
            var notifiedClientsCount = 0;
            var listenGameStartEvent = function (client) {
                client.on('round:showQuestion', function (data) {
                    client.disconnect();
                    data.question.should.eql('Сколько раз в сутки подзаводят часы на Спасской башне московского Кремля?');
                    notifiedClientsCount++;
                    if (notifiedClientsCount == 2) {
                        done();
                    }
                })
            };

            var socketClientOptions = { transports: ['websocket'], 'force new connection': true };
            var client1 = io.connect(url, socketClientOptions);
            listenGameStartEvent(client1);
            client1.on('connect', function (data) {
                var client2 = io.connect(url, socketClientOptions);
                listenGameStartEvent(client2);
                client2.on('connect', showQuestion);
            });
        });

        it('should return No_Content status', function (done) {
            request(url)
                .post('/api/game/question/show')
                .send({questionId : 0})
                .end(function (err, res) {
                    res.should.have.status(204);
                    done();
                })
        })
    });

    describe('Start question', function () {

        beforeEach(function (done) {
            showQuestion(done);
        });

        it('should broadcast "round:startQuestion" event', function (done) {


            var notifiedClientsCount = 0;
            var listenGameStartEvent = function (client) {
                client.on('round:startQuestion', function (data) {
                    client.disconnect();
                    notifiedClientsCount++;
                    if (notifiedClientsCount == 2) {
                        done();
                    }
                })
            };

            var socketClientOptions = { transports: ['websocket'], 'force new connection': true };
            var client1 = io.connect(url, socketClientOptions);
            listenGameStartEvent(client1);
            client1.on('connect', function (data) {
                var client2 = io.connect(url, socketClientOptions);
                listenGameStartEvent(client2);
                client2.on('connect', startQuestion);
            });
        });


        it('should return No_Content status', function (done) {
            request(url)
                .post('/api/game/question/start')
                .end(function (err, res) {
                    res.should.have.status(204);
                    done();
                })
        })
    })


    describe('Stop question', function () {
        beforeEach(function (done) {
            showQuestion(startQuestion(done));
        });

        it('should broadcast "round:stopQuestion" event', function (done) {
            var stopQuestionRequest = function () {
                request(url)
                    .post('/api/game/question/stop')
                    .end(verifyNoErrors);
            };

            var notifiedClientsCount = 0;
            var listenGameStartEvent = function (client) {
                client.on('round:stopQuestion', function (data) {
                    client.disconnect();
                    notifiedClientsCount++;
                    if (notifiedClientsCount == 2) {
                        done();
                    }
                })
            };

            var socketClientOptions = { transports: ['websocket'], 'force new connection': true };
            var client1 = io.connect(url, socketClientOptions);
            listenGameStartEvent(client1);
            client1.on('connect', function (data) {
                var client2 = io.connect(url, socketClientOptions);
                listenGameStartEvent(client2);
                client2.on('connect', stopQuestionRequest);
            });
        });


        it('should return No_Content status', function (done) {
            request(url)
                .post('/api/game/question/stop')
                .end(function (err, res) {
                    res.should.have.status(204);
                    done();
                })
        })
    })

    describe('Save answer', function () {

        beforeEach(function (done) {
            showQuestion(startQuestion(done));
        });

        it('should save team answer', function (done) {
            var answer = { teamName: "ViaCode", selected: 1 };

            request(url)
                .post('/api/game/question/answer')
                .send(answer)
                .end(function (err, res) {
                    res.should.have.status(204);
                    request(url)
                        .get('/api/game/question/answer/ViaCode')
                        .end(function (err, res) {
                            res.body.selected.should.eql(1);
                            done();
                        });
                })
        })
    });

    describe('Show results', function () {

        beforeEach(function (done) {
            showQuestion(startQuestion(done));
        });

        it('should broadcast all teams answers', function (done) {
            var answer1 = { teamName: "ViaCode", selected: 1 };
            var answer2 = { teamName: "Wittendo", selected: 2 };

            var sendAnswersAndShowResults = function () {
                request(url)
                    .post('/api/game/question/answer')
                    .send(answer1)
                    .end(function (err, res) {
                        request(url)
                            .post('/api/game/question/answer')
                            .send(answer2)
                            .end(function (err, res) {
                                request(url)
                                    .post('/api/game/question/results')
                                    .end(function (err, res) {
                                        if (err)
                                            throw err
                                    });
                            })
                    });
            };

            var notifiedClientsCount = 0;
            var listenGameStartEvent = function (client) {
                client.on('round:showResults', function (results) {
                    client.disconnect();
                    results['ViaCode'].selected.should.eql(1);
                    results['Wittendo'].selected.should.eql(2);
                    notifiedClientsCount++;
                    if (notifiedClientsCount == 2) {
                        done();
                    }
                })
            };

            var socketClientOptions = { transports: ['websocket'], 'force new connection': true };
            var client1 = io.connect(url, socketClientOptions);
            listenGameStartEvent(client1);
            client1.on('connect', function (data) {
                var client2 = io.connect(url, socketClientOptions);
                listenGameStartEvent(client2);
                client2.on('connect', sendAnswersAndShowResults);
            });
        })
    })
});