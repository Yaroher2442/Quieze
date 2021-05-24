var utils = require('./utils');

describe('Score Rules', function () {
    describe('Simple Scenarios', function () {
        describe('One For All Usage', function () {
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
                    {name: "player1"},
                    {name: "player2"},
                    {name: "player3"},
                    {name: "player4"},
                    {name: "player5"},
                    {name: "player6"}
                ]}
            });

            // Team 3
            teams.push({
                data: { name: "ViaCode_3", table: "3", members: [
                    {name: "player1"},
                    {name: "player2"},
                    {name: "player3"}
                ]}
            });

            // Team 4
            teams.push({
                data: { name: "ViaCode_4", table: "4", members: [
                    {name: "player1"},
                    {name: "player2"},
                    {name: "player3"},
                    {name: "player4"}
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

            it('should return (base * members.length) points if team answers correctly and has chose "One For All" mode before round', function (done) {
                var client = utils.connect();
                client.on('connect', function () {
                    client.on('round:showResults', function (teams) {
                        utils.containsTeamWithScore(teams, teams[0].teamId, POINTS * teams[0].members.length);
                        utils.containsTeamWithScore(teams, teams[1].teamId, POINTS * teams[1].members.length);
                        utils.containsTeamWithScore(teams, teams[2].teamId, POINTS * teams[2].members.length);
                        utils.containsTeamWithScore(teams, teams[3].teamId, 0);

                        client.disconnect();
                        done();
                    });

                    var options = { isHiEndRound: false };

                    var decisions = [
                        { teamId: teams[0].teamId, optionSelected: "OneForAll"},
                        { teamId: teams[1].teamId, optionSelected: "OneForAll"},
                        { teamId: teams[2].teamId, optionSelected: "OneForAll"},
                        { teamId: teams[3].teamId, optionSelected: "OneForAll"}
                    ];

                    var answers = [
                        { teamId: teams[0].teamId, selected: CORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 },
                        { teamId: teams[1].teamId, selected: CORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 },
                        { teamId: teams[2].teamId, selected: CORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 },
                        { teamId: teams[3].teamId, selected: INCORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 }
                    ];

                    utils.playNextRound(options, decisions, answers);
                });
            });
        });
    });

    describe('Complicated Scenarios', function () {
        describe('One For All Usage', function () {
            var teams = [];

            // Team 1
            teams.push({
                data: { name: "ViaCode_1", table: "1", members: [
                    {name: "player1"},
                    {name: "player2"},
                    {name: "player3"}
                ]}
            });

            // Team 2
            teams.push({
                data: { name: "ViaCode_2", table: "2", members: [
                    {name: "player1"}
                ]}
            });

            var NO_CORRECT_ANSWER = 0;
            var CORRECT_ANSWER = 1;
            var INCORRECT_ANSWER = 2;
            var POINTS = 60;

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
                            },
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

            it('should return (base * 1.5 * members.length) points if team answers correctly with "No correct answer" and has chose "One For All" mode before round', function (done) {
                var options = { isHiEndRound: false };

                var moveToFirstRound = function () {
                    var client = utils.connect();
                    client.on('connect', function () {
                        client.on('round:showResults', function (teams) {
                            utils.containsTeamWithScore(teams, teams[0].teamId, POINTS * 1.5 * teams[0].members.length);

                            client.disconnect();
                            done();
                        });


                        var decisions = [
                            { teamId: teams[0].teamId, optionSelected: "OneForAll"}
                        ];

                        var answers = [
                            { teamId: teams[0].teamId, selected: NO_CORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 },
                            { teamId: teams[1].teamId, selected: NO_CORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 }
                        ];

                        utils.playNextRound(options, decisions, answers);
                    });
                };

                utils.playTestRound(options, moveToFirstRound);
            });

            it('should return (base * 1.2 * members.length) points if team answers correctly for the third time in sequence and has chose "One For All" mode before round', function (done) {
                var options = { isHiEndRound: false };

                var moveToFirstRound = function () {
                    var answers = [
                        { teamId: teams[0].teamId, selected: NO_CORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 }
                    ];

                    // round #1: team #1 answers correctly - and gets some points
                    utils.playNextRound(options, [], answers, moveToSecondRound);
                };

                var moveToSecondRound = function () {
                    var answers = [
                        { teamId: teams[0].teamId, selected: CORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 }
                    ];

                    // round #1: team #1 answers correctly - and gets some points
                    utils.playNextRound(options, [], answers, moveToThirdRound);
                };

                var moveToThirdRound = function () {
                    var client = utils.connect();
                    client.on('connect', function () {
                        client.on('round:showResults', function (teams) {
                            utils.containsTeamWithScore(teams, teams[0].teamId, POINTS * 1.2 * teams[0].members.length);

                            client.disconnect();
                            done();
                        });


                        var decisions = [
                            { teamId: teams[0].teamId, optionSelected: "OneForAll"}
                        ];

                        var answers = [
                            { teamId: teams[0].teamId, selected: CORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 },
                            { teamId: teams[1].teamId, selected: CORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 }
                        ];

                        utils.playNextRound(options, decisions, answers);
                    });
                };

                utils.playTestRound(options, moveToFirstRound);
            });

            it('should return (base * 3 * members.length) points if it is the only one team that answers correctly and has chose "One For All" mode before round', function (done) {
                var client = utils.connect();
                client.on('connect', function () {
                    client.on('round:showResults', function (teams) {
                        utils.containsTeamWithScore(teams, teams[0].teamId, POINTS * 3 * teams[0].members.length);

                        client.disconnect();
                        done();
                    });

                    var options = { isHiEndRound: false };
                    var decisions = [
                        { teamId: teams[0].teamId, optionSelected: "OneForAll"}
                    ];

                    var answers = [
                        { teamId: teams[0].teamId, selected: CORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 0 }
                    ];

                    utils.playNextRound(options, decisions, answers);
                });
            });

            it('should return (base * 0.75 * members.length) points if team answers correctly and has chose "One For All" mode before round and has used 1 hint', function (done) {
                var client = utils.connect();
                client.on('connect', function () {
                    client.on('round:showResults', function (teams) {
                        utils.containsTeamWithScore(teams, teams[0].teamId, POINTS * 0.75 * teams[0].members.length);

                        client.disconnect();
                        done();
                    });

                    var options = { isHiEndRound: false };
                    var decisions = [
                        { teamId: teams[0].teamId, optionSelected: "OneForAll"}
                    ];

                    var answers = [
                        { teamId: teams[0].teamId, selected: CORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 1 },
                        { teamId: teams[1].teamId, selected: CORRECT_ANSWER, remainingSeconds: POINTS, hintsUsed: 1 }
                    ];

                    utils.playNextRound(options, decisions, answers);
                });
            });
        });
    });
});
