var scenario = require('./scenario');

var TEAM_ID = 0;
var teams = [];

/**
 * Sort by:
 * - total score
 * - last round score
 * - team name
 */
function sortTeamsForRating(team1, team2) {
    if (team1.totalScore > team2.totalScore) {
        return -1;
    }
    if (team1.totalScore < team2.totalScore) {
        return 1;
    }
    if (team1.lastRoundScore > team2.lastRoundScore) {
        return -1;
    }
    if (team1.lastRoundScore < team2.lastRoundScore) {
        return 1;
    }
    if (team1.name > team2.name) {
        return -1;
    }
    if (team1.name < team2.name) {
        return 1;
    }
    console.error("There are two identical teams: \r\n" +
        JSON.stringify(team1) + "\r\n" +
        JSON.stringify(team2));
    return 0;
}

function findTeamById(teamId) {
    var teamsWithSpecifiedId = teams.filter(function (existingTeam) {
        return existingTeam.teamId === teamId;
    });
    if (teamsWithSpecifiedId.length > 1) {
        console.error('There are two teams with id = ' + teamId);
        throw new Error('There are two teams with id = ' + teamId);
    }
    return teamsWithSpecifiedId[0];
}

/**
 * Note that this method changes internal teams array.
 */
exports.getRating = function () {
    return teams.sort(sortTeamsForRating);
};

exports.resetDumSpecifics = function resetDumSpecifics() {
    for (var index = 0; index < teams.length; ++index) {
        var team = teams[index];
        team.hintsAvailable = scenario.hintsPerDum();
        team.oneForAllAvailable = scenario.oneForAllPerDum();
        team.turboAvailable = scenario.turboPerDum();
        team.correctAnswersCount = 0;
    }
};

exports.getById = function (id) {
    for (var index = 0; index < teams.length; index++) {
        var team = teams[index];
        if (team.teamId == id) {
            return team;
        }
    }
    console.error('Try to fetch not-existing team by id = ' + id);
    return null;
};

exports.deleteAll = function () {
    TEAM_ID = 0;
    teams = [];
};

checkTeamIsNotDuplicate = function (team) {
    var isEqualToSpecifiedTeam = function (existingTeam) {
        return existingTeam.teamId !== team.teamId &&
            (existingTeam.name === team.name || existingTeam.table === team.table);
    };
    if (teams.filter(isEqualToSpecifiedTeam).length > 0) {
        console.error('Attempt to save duplicate team ' + JSON.stringify(team));
        throw new Error('Attempt to save duplicate team');
    }
};

// var TEAMS_LIMIT = 15;
var TEAMS_LIMIT = 40;
function checkTeamsCountAcceptable() {
    if (teams.length >= TEAMS_LIMIT) {
        var error = new Error('Too much teams for the game!');
        error.name = "TEAMS_LIMIT"; // just to distinguish errors
        throw error;
    }
}

exports.createTeam = function (team, gameUUID) {
    checkTeamIsNotDuplicate(team);
    checkTeamsCountAcceptable();
    team.teamId = ++TEAM_ID;
    team.createTime = new Date();
    team.totalScore = 0;
    team.lastRoundScore = 0;
    team.correctAnswersCount = 0;
    team.hintsAvailable = scenario.hintsPerDum();
    team.oneForAllAvailable = scenario.oneForAllPerDum();
    team.turboAvailable = scenario.turboPerDum();
    team.gameUUID = gameUUID;
    teams.push(team);
    return team;
};

exports.updateTeam = function (team) {
    checkTeamIsNotDuplicate(team);
    var updatedTeam = findTeamById(team.teamId);
    updatedTeam.table = team.table;
    updatedTeam.name = team.name;
    updatedTeam.members = team.members;
    return updatedTeam;
};

exports.resetAllScores = function() {
    for (var i = 0; i < teams.length; i++) {
        if (typeof teams[i] == "object") {
            teams[i].totalScore = 0;
            teams[i].lastRoundScore = 0;
            teams[i].correctAnswersCount = 0;
        }
    }    
}