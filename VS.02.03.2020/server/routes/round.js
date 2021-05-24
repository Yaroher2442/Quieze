var teams = require('./teams');
var formula = require('./formula');

var answers = [];
var options = [];
var question;

/**
 * Clear all information about score calculations
 */
exports.clear = function() {
	formula.reset();
};

exports.reset = function (roundQuestion) {
	answers = [];
	options = {
		isHiEndRound: false,
		isExpress: roundQuestion && roundQuestion.type === "express",
		teamOptions: []
	};
	question = roundQuestion;

	var allTeams = teams.getRating();
	for (var index = 0; index < allTeams.length; ++index) {
		var teamId = allTeams[index].teamId;
		options.teamOptions[teamId] = {};
		answers[teamId] = [];
	}
};

exports.getOptions = function () {
	return options;
};

exports.setHiEndMode = function () {
	options.isHiEndRound = true;
};

exports.setTeamDecision = function (decision) {
	options.teamOptions[decision.teamId] = {
		optionSelected: decision.optionSelected,
		partnerTeamId: decision.partnerTeamId   //TODO It makes sense only for zeitnot, refactor
	};
};

exports.addAnswer = function (answer) {
	console.log('Answer is added ' + JSON.stringify(answer));
	var teamAnswers = answers[answer.teamId];

	teamAnswers.push({
		selected: answer.selected,
		isCorrect: answer.selected == question.questions[teamAnswers.length].correctOption,
		remainingSeconds: answer.remainingSeconds,
		hintsUsed: answer.hintsUsed
	});
};

/**
 * Recalculate remaining options available for teams after this round
 */
exports.adjustTeamOptions = function () {
	var allTeams = teams.getRating();
	for (var index = 0; index < allTeams.length; ++index) {
		var team = allTeams[index];
		var teamAnswer = answers[team.teamId];

		//Series of correct answers
		if (isCorrect(teamAnswer)) {
			team.correctAnswersCount += 1;
		} else {
			team.correctAnswersCount = 0;
		}

		teamAnswer.forEach(function (item) {
			team.hintsAvailable -= item.hintsUsed;
		});

		if (options.teamOptions[team.teamId].optionSelected === "OneForAll") {
			team.oneForAllAvailable -= 1;
		}

		if (options.teamOptions[team.teamId].optionSelected === "Turbo") {
			team.turboAvailable -= 1;
		}
	}
};

function isCorrect(answer) {
	var allAnswersCorrect = true;
	answer.forEach(function (item) {
		if (!item.isCorrect) {
			allAnswersCorrect = false;
		}
	});

	return allAnswersCorrect && answer.length == roundQuestionsCount();
}

function roundQuestionsCount() {
	return question.questions.length;
}

function getRoundTime() {
	var roundTime = 0;
	for (var i = 0; i < question.questions.length; i++) {
		roundTime += question.questions[i].time;
	}
	return roundTime;
}

exports.calculateRoundResults = function () {
	var calculator = formula.init(options, getRoundTime());
	var allTeams = teams.getRating();

	for (var index = 0; index < allTeams.length; ++index) {
		var team = allTeams[index];
		var teamOption = options.teamOptions[team.teamId];
		var teamAnswer = answers[team.teamId];

		team.isCorrect = isCorrect(teamAnswer);
		calculator.add(team).withOption(teamOption).withAnswer(teamAnswer).calculateTeamSpecifics();		
	}	

	calculator.calculateMixed();
};
