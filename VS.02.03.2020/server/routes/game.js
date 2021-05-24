var round = require('./round');
var teams = require('./teams');
var scenario = require('./scenario');
var saveResults = require('./saveResults');
var uuid = require('uuid');

var gameStatuses = {
	notStarted: "notStarted",
	started: "started",
	finished: "finished"
};

exports.setup = function(io) {

	var currentStep;
	var gameStatus;
	var gemeUUID;

	initNewGame();

	function initNewGame() {
		currentStep = {
			dumId: 0,
			roundId: 0,
			totalDums: scenario.dumsCount(),
			totalRounds: scenario.roundsCountByDumId(0)
		};
		gameStatus = gameStatuses.notStarted;
		gameUUID = uuid.v1();
	}


	exports.restart = function() {
		initNewGame();
		teams.deleteAll();
		round.clear()
	};

	exports.getState = function() {
		return {
			status: gameStatus,
			currentStep: currentStep,
			rating: teams.getRating()
		}
	};

	exports.setScenario = function(req, res) {
		scenario.setScenario(req.body);
		exports.restart();

		res.send(200);
	};

	exports.getCurrentStep = function(req, res) {
		res.send(currentStep);
	};

	exports.getCurrentRoundOptions = function(req, res) {
		res.send(round.getOptions());
	};

	exports.getCurrentQuestion = function(req, res) {
		res.send(currentQuestion());
	};

	exports.startRound = function(req, res) {
		round.reset(currentQuestion());

		var options = req.body;
		if (options.isHiEndRound === true) {
			round.setHiEndMode();
		}

		io.sockets.emit('round:start', {
			stepInfo: currentStep,
			options: options
		});

		res.send(204);
	};

	exports.finishRound = function(req, res) {
		var lastRoundInDum = currentStep.roundId + 1 === currentStep.totalRounds;
		if (!lastRoundInDum) {
			currentStep.roundId++;
		} else {
			resetScoreIfDumWasTest();
			currentStep.dumId++;
			currentStep.roundId = 0;
			currentStep.totalRounds = scenario.roundsCountByDumId(currentStep.dumId);
			teams.resetDumSpecifics();
		}
		res.send(200, currentStep);
	};

	exports.showQuestion = function(req, res) {
		io.sockets.emit('round:showQuestion', currentQuestion());
		res.send(204);
	};

	exports.startQuestion = function(req, res) {
		io.sockets.emit('round:startQuestion');
		res.send(204);
	};

	exports.stopQuestion = function(req, res) {
		io.sockets.emit('round:stopQuestion');
		res.send(204);
	};

	exports.addAnswer = function(req, res) {
		var answer = req.body;
		round.addAnswer(answer);
		io.sockets.emit('round:answerAdded', answer);
		res.send(204);
	};

	exports.showResults = function(req, res) {
		function adjustTotalScore() {
			var allTeams = teams.getRating();
			for (var index = 0; index < allTeams.length; ++index) {
				var team = allTeams[index];
				team.totalScore += team.lastRoundScore;
			}
		}

		round.calculateRoundResults();
		//var isFirstRound = currentStep.dumId === 0 && currentStep.roundId === 0;
		//if (!isFirstRound) {  //First round is training and doesn't effect total score
		round.adjustTeamOptions();
		adjustTotalScore();
		//}
		io.sockets.emit('round:showResults', teams.getRating());
		res.send(204);
	};

	exports.startGame = function(req, res) {
		io.sockets.emit('game:start');
		gameStatus = gameStatuses.started;
		res.send(204);
	};

	exports.finishGame = function(req, res) {
		io.sockets.emit('game:end');

		saveResults.initWith(teams.getRating()).saveToFiles();
		gameStatus = gameStatuses.finished;
		res.send(204);
	};

	exports.setTeamDecisionBeforeRound = function(req, res) {
		var decision = req.body;
		round.setTeamDecision(decision);
		io.sockets.emit('round:teamDecision', decision);
		res.send(204);
	};

	//TEAMS
	exports.getTeam = function(req, res) {
		var teamId = req.params.teamId;
		var team = teams.getById(teamId);
		if (team) {
			res.send(200, team);
		} else {
			res.send(404);
		}
	};

	exports.getAllTeams = function(req, res) {
		res.send(teams.getRating());
	};

	exports.saveTeam = function(req, res) {
		var receivedTeam = req.body;

		try {
			if (receivedTeam.teamId) {
				var updatedTeam = teams.updateTeam(receivedTeam);
				res.send(200, updatedTeam);
				io.sockets.emit('team:updated', updatedTeam)
			} else {
				var savedTeam = teams.createTeam(receivedTeam, gameUUID);
				res.send(201, savedTeam);
				io.sockets.emit('team:added', savedTeam)
			}
		} catch (e) {
			if (e.name && e.name === "TEAMS_LIMIT") {
				res.send(400, "Превышено допустимое количество команд в игре");
			} else {
				res.send(400, "Имя команды и номер стола должны быть уникальными");
			}
		}
	};

	exports.deleteAllTeams = function(req, res) {
		teams.deleteAll();
		res.send(204);
	};

	function currentQuestion() {
		return scenario.getQuestion(currentStep.dumId, currentStep.roundId);
	}

	function resetScoreIfDumWasTest() {
		var dum = scenario.getDumById(currentStep.dumId);

		if (dum && dum.test) {
			teams.resetAllScores();
		}
	}

	// restore game state
	exports.restoreGameState = function(req, res) {
		var result = {
			'status': false
		};

		var reqTeamId = req.params.teamId;
		var reqGameUUID = req.params.gameUUID;

		if (reqTeamId && reqGameUUID && reqGameUUID == gameUUID) {
			result.status = 'true';
			result.team = teams.getById(reqTeamId);
		}		

		res.json(result);
	}


};