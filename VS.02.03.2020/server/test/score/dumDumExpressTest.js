var utils = require('./utils');

describe('Score Rules', function () {
    describe('Dum-Dum Express', function () {
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
            gameTitle: "Игра 'Тестовые замашки'",
            hintsPerDum: 2,
            oneForAllPerDum: 1,
            dums: [
                {
                    name: "Дум №1",
                    rounds: [
                        {
                            "type": "express",
                            "questions": [
                                {
                                    "correctOption": CORRECT_ANSWER,
                                    "time": POINTS
                                },
                                {
                                    "correctOption": CORRECT_ANSWER,
                                    "time": POINTS
                                },
                                {
                                    "correctOption": CORRECT_ANSWER,
                                    "time": POINTS
                                }
                            ]
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

        it('should return (base * 3) points if all answers are correct', function (done) {
            var client = utils.connect();
            client.on('connect', function () {
                client.on('round:showResults', function (teams) {
                    utils.containsTeamWithScore(teams, teams[0].teamId, POINTS * 3 * 3);
                    utils.containsTeamWithScore(teams, teams[1].teamId, POINTS * 3 * 3);

                    client.disconnect();
                    done();
                });

                var options = { isHiEndRound: false };
                var answers = [
                    //Team 1 - all answers are correct
                    { teamId: teams[0].teamId, selected: CORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 },
                    { teamId: teams[0].teamId, selected: CORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 },
                    { teamId: teams[0].teamId, selected: CORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 },

                    //Team 2 - all answers are correct
                    { teamId: teams[1].teamId, selected: CORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 },
                    { teamId: teams[1].teamId, selected: CORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 },
                    { teamId: teams[1].teamId, selected: CORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 }
                ];

                utils.playNextRound(options, [], answers);
            });
        });

        it('should return 0 points if 2 answers are correct and there is no answer for the third question', function (done) {
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
                    //Team 1 - all answers are correct
                    { teamId: teams[0].teamId, selected: CORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 },
                    { teamId: teams[0].teamId, selected: CORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 },

                    //Team 2 - all answers are correct
                    { teamId: teams[1].teamId, selected: CORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 },
                    { teamId: teams[1].teamId, selected: CORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 }
                ];

                utils.playNextRound(options, [], answers);
            });
        });

        it('should return 0 points if 1 answer is correct and 2 answers are incorrect', function (done) {
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
                    //Team 1 - all answers are correct
                    { teamId: teams[0].teamId, selected: CORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 },
                    { teamId: teams[0].teamId, selected: INCORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 },
                    { teamId: teams[0].teamId, selected: INCORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 },

                    //Team 2 - all answers are correct
                    { teamId: teams[1].teamId, selected: CORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 },
                    { teamId: teams[1].teamId, selected: INCORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 },
                    { teamId: teams[1].teamId, selected: INCORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 }
                ];

                utils.playNextRound(options, [], answers);
            });
        });

        it('should return 0 points if all 3 answers are incorrect', function (done) {
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
                    //Team 1 - all answers are correct
                    { teamId: teams[0].teamId, selected: INCORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 },
                    { teamId: teams[0].teamId, selected: INCORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 },
                    { teamId: teams[0].teamId, selected: INCORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 },

                    //Team 2 - all answers are correct
                    { teamId: teams[1].teamId, selected: INCORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 },
                    { teamId: teams[1].teamId, selected: INCORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 },
                    { teamId: teams[1].teamId, selected: INCORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 }
                ];

                utils.playNextRound(options, [], answers);
            });
        });
    });
});