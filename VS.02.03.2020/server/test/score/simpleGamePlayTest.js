var utils = require('./utils');

describe('Score Rules', function () {
    describe('Simple scenarios', function () {
        describe('Simple Game Play', function () {
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
                    {name: "player1"}
                ]}
            });

            var CORRECT_ANSWER = 1;
            var INCORRECT_ANSWER = 2;
            var POINTS = 10;

            var scenario = {
                hintsPerDum: 2,
                oneForAllPerDum: 1,
                dums: [
                    {
                        rounds: [
                            {
                                type: "question",
                                correctOption: CORRECT_ANSWER,
                                time: POINTS
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

            it('should return T-1 points for correct answer on first second', function (done) {
                var client = utils.connect();
                client.on('connect', function () {
                    client.on('round:showResults', function (teams) {
                        utils.containsTeamWithScore(teams, teams[0].teamId, POINTS - 1);
                        utils.containsTeamWithScore(teams, teams[1].teamId, POINTS - 1);

                        client.disconnect();
                        done();
                    });

                    var options = { isHiEndRound: false };
                    var answers = [
                        { teamId: teams[0].teamId, selected: CORRECT_ANSWER, remainingSeconds: POINTS - 1, hintsUsed: 0 },
                        { teamId: teams[1].teamId, selected: CORRECT_ANSWER, remainingSeconds: POINTS - 1, hintsUsed: 0 }
                    ];

                    utils.playNextRound(options, [], answers);
                });
            });

            it('should return T/2 points for correct answer in the middle of T', function (done) {
                var client = utils.connect();
                client.on('connect', function () {
                    client.on('round:showResults', function (teams) {
                        utils.containsTeamWithScore(teams, teams[0].teamId, POINTS / 2);
                        utils.containsTeamWithScore(teams, teams[1].teamId, POINTS / 2);

                        client.disconnect();
                        done();
                    });

                    var options = { isHiEndRound: false };
                    var answers = [
                        { teamId: teams[0].teamId, selected: CORRECT_ANSWER, remainingSeconds: POINTS / 2, hintsUsed: 0 },
                        { teamId: teams[1].teamId, selected: CORRECT_ANSWER, remainingSeconds: POINTS / 2, hintsUsed: 0 }
                    ];

                    utils.playNextRound(options, [], answers);
                });
            });

            it('should return 1 point for correct answer on last second', function (done) {
                var client = utils.connect();
                client.on('connect', function () {
                    client.on('round:showResults', function (teams) {
                        utils.containsTeamWithScore(teams, teams[0].teamId, 1);
                        utils.containsTeamWithScore(teams, teams[1].teamId, 1);

                        client.disconnect();
                        done();
                    });

                    var options = { isHiEndRound: false };
                    var answers = [
                        { teamId: teams[0].teamId, selected: CORRECT_ANSWER, remainingSeconds: 1, hintsUsed: 0 },
                        { teamId: teams[1].teamId, selected: CORRECT_ANSWER, remainingSeconds: 1, hintsUsed: 0 }
                    ];

                    utils.playNextRound(options, [], answers);
                });
            });

            it('should return 0 points for no answer', function (done) {
                var client = utils.connect();
                client.on('connect', function () {
                    client.on('round:showResults', function (teams) {
                        utils.containsTeamWithScore(teams, teams[0].teamId, 0);
                        utils.containsTeamWithScore(teams, teams[1].teamId, 0);

                        client.disconnect();
                        done();
                    });

                    var options = { isHiEndRound: false };
                    var answers = [];

                    utils.playNextRound(options, [], answers);
                });
            });

            it('should return 0 points for incorrect answer', function (done) {
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
                        { teamId: teams[0].teamId, selected: INCORRECT_ANSWER, remainingSeconds: POINTS - 1, hintsUsed: 0 },
                        { teamId: teams[1].teamId, selected: INCORRECT_ANSWER, remainingSeconds: POINTS - 1, hintsUsed: 0 }
                    ];

                    utils.playNextRound(options, [], answers);
                });
            });
        });
    });
});