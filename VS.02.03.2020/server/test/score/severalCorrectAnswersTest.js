var utils = require('./utils');

describe('Score Rules', function () {
    describe('Several Correct Answers Test', function () {
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
    });
});