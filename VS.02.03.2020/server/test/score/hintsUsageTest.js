var utils = require('./utils');

describe('Score Rules', function () {
    describe('Simple scenarios', function () {
        describe('Hints Usage', function () {
            var teams = [];

            // Team 1
            teams.push({
                data: { name: "ViaCode_1", table: "1", members: [
                    {name: "player1"}
                ]}
            });

            // Team 2
            teams.push({
                data: { name: "ViaCode_2", table: "2", members: [
                    {name: "player2"}
                ]}
            });

            var CORRECT_ANSWER = 1;
            var INCORRECT_ANSWER = 2;
            var POINTS = 80;

            var scenario = {
                "hintsPerDum": 2,
                "oneForAllPerDum": 1,
                "dums": [
                    {
                        "rounds": [
                            {
                                "type": "question",
                                "correctOption": CORRECT_ANSWER,
                                "time": POINTS
                            }
                        ]
                    }
                ]
            };

            before(function (done) {
                utils.setNewScenario(scenario, done);
            });

            beforeEach(function (done) {
                utils.startNewGameWithTeams(teams, done);
            });

            it('should return (base * 0.75) points if team answers correctly but have used 1 hint', function (done) {
                var client = utils.connect();
                client.on('connect', function () {
                    client.on('round:showResults', function (teams) {
                        utils.containsTeamWithScore(teams, teams[0].teamId, POINTS / 2 * 0.75);
                        utils.containsTeamWithScore(teams, teams[1].teamId, POINTS / 2 * 0.75);

                        client.disconnect();
                        done();
                    });

                    var options = { isHiEndRound: false };
                    var answers = [
                        { teamId: teams[0].teamId, selected: CORRECT_ANSWER, remainingSeconds: POINTS / 2, hintsUsed: 1 },
                        { teamId: teams[1].teamId, selected: CORRECT_ANSWER, remainingSeconds: POINTS / 2, hintsUsed: 1 }
                    ];

                    utils.playNextRound(options, [], answers);
                });
            });

            it('should return (base * 0.5) points if team answers correctly but have used 2 hints', function (done) {
                var client = utils.connect();
                client.on('connect', function () {
                    client.on('round:showResults', function (teams) {
                        utils.containsTeamWithScore(teams, teams[0].teamId, POINTS / 2 * 0.5);
                        utils.containsTeamWithScore(teams, teams[1].teamId, POINTS / 2 * 0.5);

                        client.disconnect();
                        done();
                    });

                    var options = { isHiEndRound: false };
                    var answers = [
                        { teamId: teams[0].teamId, selected: CORRECT_ANSWER, remainingSeconds: POINTS / 2, hintsUsed: 2 },
                        { teamId: teams[1].teamId, selected: CORRECT_ANSWER, remainingSeconds: POINTS / 2, hintsUsed: 2 }
                    ];

                    utils.playNextRound(options, [], answers);
                });
            });

            it('should return 0 points if team answers incorrectly but have used 2 hint', function (done) {
                var client = utils.connect();
                client.on('connect', function () {
                    client.on('round:showResults', function (teams) {
                        utils.containsTeamWithScore(teams, teams[0].teamId, 0);
                        utils.containsTeamWithScore(teams, teams[1].teamId, 0);

                        client.disconnect();
                        done();
                    });

                    var options = { isHiEndRound: false };
                    var answers = [
                        { teamId: teams[0].teamId, selected: INCORRECT_ANSWER, remainingSeconds: POINTS / 2, hintsUsed: 2 },
                        { teamId: teams[1].teamId, selected: INCORRECT_ANSWER, remainingSeconds: POINTS / 2, hintsUsed: 2 }
                    ];

                    utils.playNextRound(options, [], answers);
                });
            });
        });
    });
    describe('Complicated scenarios', function () {
        describe('Hints Usage', function () {
            var teams = [];

            // Team 1
            teams.push({
                data: { name: "ViaCode_1", table: "1", members: [
                    {name: "player1"}
                ]}
            });

            // Team 2
            teams.push({
                data: { name: "ViaCode_2", table: "2", members: [
                    {name: "player2"}
                ]}
            });

            var NO_CORRECT_ANSWER = 0;
            var CORRECT_ANSWER = 1;
            var INCORRECT_ANSWER = 2;
            var POINTS = 80;

            var scenario = {
                "hintsPerDum": 2,
                "oneForAllPerDum": 1,
                "dums": [
                    {
                        "rounds": [
                            {
                                "type": "question",
                                "correctOption": NO_CORRECT_ANSWER,
                                "time": POINTS
                            },
                            {
                                "type": "question",
                                "correctOption": CORRECT_ANSWER,
                                "time": POINTS
                            },
                            {
                                "type": "question",
                                "correctOption": CORRECT_ANSWER,
                                "time": POINTS
                            },
                            {
                                "type": "question",
                                "correctOption": CORRECT_ANSWER,
                                "time": POINTS
                            }
                        ]
                    }
                ]
            };

            before(function (done) {
                utils.setNewScenario(scenario, done);
            });

            beforeEach(function (done) {
                utils.startNewGameWithTeams(teams, done);
            });

            it('should return (base * 1.5 * 0.5) points if team answers correctly but have used 2 hints and the correct answer is "No correct answer"', function (done) {
                var client = utils.connect();
                client.on('connect', function () {
                    client.on('round:showResults', function (teams) {
                        utils.containsTeamWithScore(teams, teams[0].teamId, POINTS * 1.5 * 0.5);

                        client.disconnect();
                        done();
                    });

                    var options = { isHiEndRound: false };
                    var answers = [
                        { teamId: teams[0].teamId, selected: NO_CORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 2 },
                        { teamId: teams[1].teamId, selected: NO_CORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 2 }
                    ];

                    utils.playNextRound(options, [], answers);
                });
            });

            it('should return (base * 1.2 * 0.75) points if team answers correctly but have used 1 hint and it is the third correct answer in sequence"', function (done) {
                var options = { isHiEndRound: false };

                var moveToFirstRound = function () {
                    var answers = [
                        { teamId: teams[0].teamId, selected: CORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 }
                    ];

                    // round #1: team #1 answers correctly - and gets some points
                    utils.playNextRound(options, [], answers, moveToSecondRound);
                };

                var moveToSecondRound = function () {
                    var answers = [
                        { teamId: teams[0].teamId, selected: CORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 }
                    ];

                    // round #2: team #1 answers correctly - and gets some points
                    utils.playNextRound(options, [], answers, moveToThirdRound);
                };

                var moveToThirdRound = function () {
                    var client = utils.connect();
                    client.on('connect', function () {
                        client.on('round:showResults', function (teams) {
                            utils.containsTeamWithScore(teams, teams[0].teamId, POINTS * 1.2 * 0.75);

                            client.disconnect();
                            done();
                        });

                        var answers = [
                            { teamId: teams[0].teamId, selected: CORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 1 },
                            { teamId: teams[1].teamId, selected: CORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 }
                        ];

                        utils.playNextRound(options, [], answers);
                    });
                };

                utils.playTestRound(options, moveToFirstRound);
            });

            it('should return (base * 3 * 0.5) points if team answers correctly but have used 2 hints and is the only one with correct answer"', function (done) {
                var options = { isHiEndRound: false };

                var moveToFirstRound = function () {
                    var client = utils.connect();
                    client.on('connect', function () {
                        client.on('round:showResults', function (teams) {
                            utils.containsTeamWithScore(teams, teams[0].teamId, POINTS * 3 * 0.5);

                            client.disconnect();
                            done();
                        });

                        var answers = [
                            { teamId: teams[0].teamId, selected: CORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 2 }
                        ];

                        utils.playNextRound(options, [], answers);
                    });
                };

                utils.playTestRound(options, moveToFirstRound);
            });
        });
    });
});
