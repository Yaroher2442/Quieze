var scenario = require('../content/scenario.json');
var ce = require('cloneextend');


exports.getScenario = function (req, res) {
	res.send(scenario);
}

exports.setScenario = function (theScenario) {
	scenario = theScenario;
}

exports.dumsCount = function () {
	return scenario.dums.length;
}

exports.roundsCountByDumId = function (dumId) {
	return scenario.dums[dumId].rounds.length;
}

exports.getQuestion = function (dumId, roundId) {
	var question = scenario.dums[dumId].rounds[roundId];
	return adjustQuestion(question);
}

function adjustQuestion(question) {
	if (question.type != "express") {
		question.questions = [ce.clone(question)];
	}
	return question;
}

exports.hintsPerDum = function () {
	return scenario.hintsPerDum;
}

exports.oneForAllPerDum = function () {
	return scenario.oneForAllPerDum;
}

exports.turboPerDum = function () {
	return scenario.turboPerDum;
}

exports.getDumById = function(dumId) {    
	return scenario.dums[dumId];
}