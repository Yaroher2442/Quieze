var utils = require('./utils');

describe('Score Rules', function () {
    describe('Simple Scenarios', function () {
        describe('Triple Dum-Dum', function () {
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

            // Team 3
            teams.push({
                data: { name: "ViaCode_3", table: "3", members: [
                    {name: "player1"}
                ]}
            });

            // Team 4
            teams.push({
                data: { name: "ViaCode_4", table: "4", members: [
                    {name: "player1"}
                ]}
            });

            // Team 5
            teams.push({
                data: { name: "ViaCode_5", table: "5", members: [
                    {name: "player1"}
                ]}
            });

            var CORRECT_ANSWER = 1;
            var INCORRECT_ANSWER = 2;
            var POINTS = 10;

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

            it('should return (base * 3) points for team that is the only one who answering correctly', function (done) {
                var client = utils.connect();
                client.on('connect', function () {
                    client.on('round:showResults', function (teams) {
                        utils.containsTeamWithScore(teams, teams[0].teamId, POINTS * 3);

                        client.disconnect();
                        done();
                    });

                    var options = { isHiEndRound: false };

                    var answers = [
                        { teamId: teams[0].teamId, selected: CORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 },
                        { teamId: teams[1].teamId, selected: INCORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 },
                        { teamId: teams[2].teamId, selected: INCORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 },
                        { teamId: teams[3].teamId, selected: INCORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 },
                        { teamId: teams[4].teamId, selected: INCORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 }
                    ];

                    utils.playNextRound(options, [], answers);
                });
            });

            it('should return (base * 3) points for team that is the only one who answering correctly, 2 others answer incorrectly, 2 another ones - no answers', function (done) {
                var client = utils.connect();
                client.on('connect', function () {
                    client.on('round:showResults', function (teams) {
                        utils.containsTeamWithScore(teams, teams[0].teamId, POINTS * 3);

                        client.disconnect();
                        done();
                    });

                    var options = { isHiEndRound: false };

                    var answers = [
                        { teamId: teams[0].teamId, selected: CORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 },
                        { teamId: teams[1].teamId, selected: INCORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 },
                        { teamId: teams[2].teamId, selected: INCORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 }
                    ];

                    utils.playNextRound(options, [], answers);
                });
            });
        });
    });

    describe('Complicated Scenarios', function () {
        describe('Triple Dum-Dum', function () {
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

            // Team 3
            teams.push({
                data: { name: "ViaCode_3", table: "3", members: [
                    {name: "player1"}
                ]}
            });

            // Team 4
            teams.push({
                data: { name: "ViaCode_4", table: "4", members: [
                    {name: "player1"}
                ]}
            });

            // Team 5
            teams.push({
                data: { name: "ViaCode_5", table: "5", members: [
                    {name: "player1"}
                ]}
            });

            var NO_CORRECT_ANSWER = 0;
            var CORRECT_ANSWER = 1;
            var INCORRECT_ANSWER = 2;
            var POINTS = 10;

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

            it('should return (base * 1.5 * 3) points for team that is the only one who answering correctly and the correct answer is "No correct answer"', function (done) {
                var client = utils.connect();
                client.on('connect', function () {
                    client.on('round:showResults', function (teams) {
                        utils.containsTeamWithScore(teams, teams[0].teamId, POINTS * 1.5 * 3);

                        client.disconnect();
                        done();
                    });

                    var options = { isHiEndRound: false };
                    var answers = [
                        { teamId: teams[0].teamId, selected: NO_CORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 }
                    ];

                    utils.playNextRound(options, [], answers);
                });
            });

            it('should return (base * 1.1 * 3) points for team that is the only one who answering correctly and it is the second correct answer for the team in sequence', function (done) {
                var options = { isHiEndRound: false };

                var moveToFirstRound = function () {
                    var answers = [
                        { teamId: teams[0].teamId, selected: CORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 }
                    ];

                    // round #1: team #1 answers correctly - and gets some points
                    utils.playNextRound(options, [], answers, moveToSecondRound);
                };

                var moveToSecondRound = function () {
                    var client = utils.connect();
                    client.on('connect', function () {
                        client.on('round:showResults', function (teams) {
                            utils.containsTeamWithScore(teams, teams[0].teamId, POINTS * 1.1 * 3);

                            client.disconnect();
                            done();
                        });

                        var answers = [
                            { teamId: teams[0].teamId, selected: CORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 }
                        ];

                        // round #2: team #2 answers correctly - and it's the second correct answer in sequence
                        utils.playNextRound(options, [], answers);
                    });
                };

                utils.playTestRound(options, moveToFirstRound);
            });
        });
    });
});
