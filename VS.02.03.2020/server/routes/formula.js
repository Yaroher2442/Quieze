var ONE_HINT_COST = 0.25;
var ALL_ANSWERS_WRONG_MULTIPLIER = 1.5;
//var CORRECT_SERIES_MULTIPLIER = 0.1;
var CORRECT_SERIES_MULTIPLIER = 1.5;
var EXPRESS_DUM_DUM_MULTIPLIER = 3;
var TERNARY_DUM_DUM_MULTIPLIER = 3;
var HI_END_MULTIPLIER = 5;
// var ONE_FOR_ALL_MULTIPLIER = 5;
var ONE_FOR_ALL_MULTIPLIER = 4;
var TURBO_MULTIPLIER = 2;
var TURBO_DEMULTIPLIER = 2;

var teams;
var teamsById;
var teamOptions;
var teamAnswers;

var answeredCorrect;

var generalOptions;
var roundTime;

var team;
var teamOption;
var teamAnswer;
var zeitnotJackPot;

resetData();

function resetData() {
	teams = [];
	teamsById = [];
	teamOptions = [];
	teamAnswers = [];
	answeredCorrect = [];
	generalOptions = null;
	roundTime = null;
	team = null;
	teamOption = null;
	teamAnswer = null;
	zeitnotJackPot = 0;
}

/**
 * Clear all state from the formula
 */
exports.reset = resetData;

exports.init = function(theOptions, theRoundTime) {
	generalOptions = theOptions;
	roundTime = theRoundTime;

	teams = [];
	teamsById = [];
	teamOptions = [];
	teamAnswers = [];
	answeredCorrect = [];
	clearCurrent();

	return module.exports;
}

function clearCurrent() {
	team = null;
	teamOption = null;
	teamAnswer = null;
}

exports.add = function(theTeam) { // TODO: 'theTeam' should not be null
	if (team) {
		throw "'team' is not empty, call #calculateTeamSpecifics() first!";
	}
	team = theTeam;
	teams.push(theTeam);
	teamsById[theTeam.teamId] = theTeam;
	return module.exports;
}

exports.withOption = function(option) {
	if (!team) {
		throw "'team' is empty, call #add(theTeam) first!";
	}
	teamOption = option;
	teamOptions[team.teamId] = option;
	return module.exports;
}

exports.withAnswer = function(answer) {
	if (!team) {
		throw "'team' is empty, call #add(theTeam) first!";
	}
	teamAnswer = answer;
	teamAnswers[team.teamId] = answer;
	return module.exports;
}

exports.calculateTeamSpecifics = function() {
	if (!team || !teamAnswer || !teamOption) {
		throw "'team', 'teamAnswer' and 'teamOption' need to be define before calculation!";
	}

	init();
	if (team.isCorrect) {
		answeredCorrect.push(team);

		teamAnswer.forEach(function(next) {
			processAnswer(next);
		});

		// One for all bonus:
		if (teamOption.optionSelected === "OneForAll") {
			processOneForAll();
		}

		// Correct answers series:
		processCorrectSeries();

		// Express Dum-Dum
		if (isExpressRound()) {
			processExpress();
		}
	}

	if (teamOption.optionSelected === "Turbo") {
		if (team.isCorrect) {
			processTurboRight();
		} else {
			processTurboWrong();
		}
	}

	team.lastRoundScore = Math.round(team.lastRoundScore);
	clearCurrent();
}

function isExpressRound() {
	return generalOptions.isExpress;
}

function init() {
	team.lastRoundScore = 0;
	team.formula = {};
}

function processAnswer(answer) {
	if (!team.formula.extendedBase) {
		team.formula.extendedBase = [];
	}
	var extendedBase = {};

	// base score
	var score = answer.remainingSeconds;
	extendedBase.base = answer.remainingSeconds;

	// hints based scoring
	if (answer.hintsUsed > 0) {
		var multiplier = 1 - ONE_HINT_COST * answer.hintsUsed;

		score *= multiplier;
		extendedBase.hints = {
			used: answer.hintsUsed,
			multiplier: multiplier
		}
	}

	// "All answers are wrong" logic:
	if (answer.selected == 0) {
		var multiplier = ALL_ANSWERS_WRONG_MULTIPLIER;

		score *= multiplier;
		extendedBase.allAnswersWrong = {
			multiplier: multiplier
		}
	}

	team.lastRoundScore += score;
	team.formula.extendedBase.push(extendedBase);
}

function processOneForAll() {
	//var multiplier = team.members.length;
	var multiplier = ONE_FOR_ALL_MULTIPLIER;

	team.lastRoundScore *= multiplier;
	team.formula.oneForAll = {
		multiplier: multiplier
	};
}

function processTurboRight() {
	var multiplier = TURBO_MULTIPLIER;

	team.lastRoundScore = 0;
	team.totalScore *= multiplier;
	team.formula.turbo = {
		isCorrect: true,
		multiplier: multiplier
	};
}

function processTurboWrong() {
	var demultiplier = TURBO_DEMULTIPLIER;

	team.lastRoundScore = 0;
	team.totalScore /= demultiplier;
	team.formula.turbo = {
		isCorrect: false,
		demultiplier: demultiplier
	};
}

function processCorrectSeries() {
	if (team.correctAnswersCount == 2) {
		var multiplier = CORRECT_SERIES_MULTIPLIER;

		team.lastRoundScore *= multiplier;
		team.formula.correctSeries = {
			count: team.correctAnswersCount + 1, // + 1 is for current answer
			multiplier: multiplier
		};

		team.correctAnswersCount = 0;
	}
}

function processExpress() {
	var multiplier = EXPRESS_DUM_DUM_MULTIPLIER;

	team.lastRoundScore *= multiplier;
	team.formula.express = {
		multiplier: multiplier
	};
}

exports.calculateMixed = function() { // TODO: add validation at least for 'team'
	// Ternary Dum-Dum:
	if (answeredCorrect.length == 1) {
		processTernaryDumDum(answeredCorrect[0]);
	}

	if (generalOptions.isHiEndRound === true) {
		processHiEnd();
	}

	processZeitnot();
}

function processTernaryDumDum(theTeam) {
	var multiplier = TERNARY_DUM_DUM_MULTIPLIER;

	theTeam.lastRoundScore *= multiplier;
	theTeam.formula.ternaryDumDum = {
		multiplier: multiplier
	};
}

function processHiEnd() {
	if (teams.length < 3) {
		return;
	}
	var topTeam = teams[0];
	var lastTeam = teams[teams.length - 1];
	var lastButOneTeam = teams[teams.length - 2];

	var generalInfo = {
		topTeam: {
			name: topTeam.name,
			score: topTeam.lastRoundScore
		},
		lastTeam: {
			name: lastTeam.name,
			score: lastTeam.lastRoundScore
		},
		lastButOneTeam: {
			name: lastButOneTeam.name,
			score: lastButOneTeam.lastRoundScore
		}
	}
	topTeam.formula.hiEnd = {
		info: generalInfo
	};
	lastTeam.formula.hiEnd = {
		info: generalInfo
	};
	lastButOneTeam.formula.hiEnd = {
		info: generalInfo
	};

	if (topTeam.lastRoundScore < lastTeam.lastRoundScore + lastButOneTeam.lastRoundScore) {
		topTeam.lastRoundScore *= 0;
		topTeam.formula.hiEnd.multiplier = 0;

		lastTeam.lastRoundScore *= HI_END_MULTIPLIER;
		lastTeam.formula.hiEnd.multiplier = HI_END_MULTIPLIER;

		lastButOneTeam.lastRoundScore *= HI_END_MULTIPLIER;
		lastButOneTeam.formula.hiEnd.multiplier = HI_END_MULTIPLIER;
	} else {
		topTeam.formula.hiEnd.multiplier = 1;
		lastTeam.formula.hiEnd.multiplier = 1;
		lastButOneTeam.formula.hiEnd.multiplier = 1;
	}
}

function processZeitnot() {
	var teamsZeitnotData = {};

	for (var i = 0; i < teams.length; i++) {
		var theTeam = teams[i];

		teamsZeitnotData[theTeam.teamId] = {
			"lastRoundScore": theTeam.lastRoundScore,
			"isCorrect": theTeam.isCorrect,
			"name": theTeam.name
		};
	}

	for (var i = 0; i < teams.length; i++) {
		var theTeam = teams[i];
		var theTeamOption = teamOptions[theTeam.teamId];
		var partnerTeamId = +theTeamOption.partnerTeamId;

		if (isNaN(partnerTeamId))
			continue;

		theTeam.formula.zeitnot = {
			"partnerTeamName": teamsZeitnotData[partnerTeamId].name,
			"score": 0
		};


		if (theTeam.isCorrect && teamsZeitnotData[partnerTeamId].isCorrect) {
			theTeam.lastRoundScore += teamsZeitnotData[partnerTeamId].lastRoundScore;
			theTeam.formula.zeitnot.score = teamsZeitnotData[partnerTeamId].lastRoundScore;
		}
	}
}