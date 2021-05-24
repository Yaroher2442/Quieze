var express = require('express');
var http = require('http');
var app = express();
var game = require('./routes/game');
var scenario = require('./routes/scenario');
var media = require('./routes/media');

var server = http.createServer(app).listen(3000, function () {
    console.log('Express server listening on port 3000');
});
var io = require('socket.io').listen(server);
game.setup(io);
media.setup(io);

app.use(express.logger('dev'));
app.use(express.json());
app.use(app.router);
app.use(express.static(__dirname + '/public'));

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.all("/api/*", function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
});

//User Interface
app.get('/', function (req, res) {
    res.render('index', {gameState: game.getState()});
});

app.post('/restart', function (req, res) {
    game.restart();
    res.redirect('/');
});

// REST API
app.get('/healthcheck', function (req, res) {
    res.send(200, "Wittendo Server is up and running")
});

//Teams service
app.get('/api/teams/:teamId', game.getTeam);
app.get('/api/teams', game.getAllTeams);
app.post('/api/teams', game.saveTeam);
app.delete('/api/teams', game.deleteAllTeams);

//Game service
app.post('/api/game/start', game.startGame);
app.get('/api/game/scenario', scenario.getScenario);
app.get('/api/game/currentStep', game.getCurrentStep);
app.get('/api/game/currentQuestion', game.getCurrentQuestion);
app.get('/api/game/currentRoundOptions', game.getCurrentRoundOptions);
app.post('/api/game/end', game.finishGame);

// restore player game state
app.get('/api/game/restoreGameState/:teamId/:gameUUID', game.restoreGameState);


//Round Controller for Host
app.post('/api/game/round/start', game.startRound);
app.post('/api/game/round/showQuestion', game.showQuestion);
app.post('/api/game/round/startQuestion', game.startQuestion);
app.post('/api/game/round/showCorrectAnswer', game.stopQuestion);
app.post('/api/game/round/showResults', game.showResults);
app.post('/api/game/round/finish', game.finishRound);

//Round controller for Players
app.post('/api/game/round/addAnswer', game.addAnswer);
app.post('/api/game/round/setTeamDecision', game.setTeamDecisionBeforeRound);

//Media service
app.post('/api/media/start', media.startMedia);
app.get('/api/media', media.loadMedia);
app.post('/api/media/complete', media.completeMedia);

//For test purposes only, to load scenario for test cases
app.post('/api/game/scenario', game.setScenario);

