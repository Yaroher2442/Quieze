var wittendoHost = angular.module("wittendoHost", ["ngRoute", "ngSanitize"]);
wittendoHost.config(["$routeProvider", function(a) {
	a.when("/intro", {
		templateUrl: "views/intro.html",
		controller: "IntroCtrl"
	});
	a.when("/rules", {
		templateUrl: "views/rules.html"
	});
	a.when("/teams", {
		templateUrl: "views/teams.html",
		controller: "TeamsCtrl"
	});
	a.when("/game/:dumId?/:roundId?", {
		templateUrl: "views/game.html",
		controller: "GameCtrl",
		resolve: {
			init: ["$q", "GameService", function(a, c) {
				var e = a.defer();
				c.init(e);
				return e.promise
			}]
		}
	});
	a.otherwise({
		redirectTo: "/intro"
	})
}]).constant("server", "http://localhost:3000").run(["Game",
	function(a) {}
]);
angular.module("wittendoHost").controller("NavigationCtrl", ["$scope", "$location", function(a, b) {
	a.isActive = function(a) {
		return 0 == b.path().indexOf(a)
	}
}]).controller("IntroCtrl", ["$scope", "$location", "GameService", function(a, b, c) {
	a.init = function() {
		$("#menu").hide();
		a.processing = !1
	};
	a.next = function() {
		a.processing = !0;
		c.startGame(function() {
			$("#menu").show();
			b.path("/game")
		})
	};
	a.init()
}]).controller("TeamsCtrl", ["$scope", "TeamService", function(a, b) {
	b.loadTeams(function(c) {
		a.teams = c
	});
	a.$on("team:added",
		function(c, b) {
			a.teams.push(b)
		});
	a.$on("team:updated", function(c, b) {
		a.teams.filter(function(a) {
			return a.teamId === b.teamId
		}).forEach(function(a) {
			a.name = b.name;
			a.table = b.table;
			a.totalScore = b.totalScore;
			a.members = b.members
		})
	})
}]).controller("GameCtrl", ["$scope", "RoundService", "GameService", "MediaService", "$routeParams", function(a, b, c, e, f) {
	a.isGameEnded = c.isGameEnded();
	a.isHieEndMode = !1;
	a.roundStatus = b.getCurrentRoundStatus();
	a.roundSteps = b.getRoundSteps();
	f.dumId && f.roundId ? (a.scenario = c.getScenario(),
		a.currentQuestion = b.getCurrentQuestion(),
		a.nextQuestion = c.getNextQuestion(),
		a.currentStepInfo = c.getCurrentStepInfo(),
		e.initMedia(a.currentQuestion.media, a.currentQuestion.media2)
	) : c.moveToCurrentStep();

	a.startRound = function() {
		b.startRound({
			isHiEndRound: a.isHieEndMode,
			isExpress: a.isExpress()
		})
	};
	a.isTimeout = function(a) {
		return -1 == a
	};
	a.isExpress = function() {
		return a.currentQuestion && "express" === a.currentQuestion.type
	};
	a.showQuestion = function() {
		b.showQuestion()
	};
	a.showOptions = function() {
		b.showOptions()
	};
	a.showCorrectAnswer = function() {
		b.showCorrectAnswer()
	};
	a.showRoundResults = function() {
		b.showRoundResults()
	};
	a.finishRound = function() {
		c.moveToNextRound()
	};
	a.finishDum = function() {
		c.moveToNextRound()
	};
	a.finishGame = function() {
		c.finishGame()
	};
	a.isLastDum = function() {
		return c.isLastDum()
	};
	a.isLastRound = function() {
		return c.isLastRound()
	};
	a.mediaStarted = e.isMediaStarted();
	a.mediaCompleted = e.isMediaCompleted();
	a.hasMedia = function() {
		return b.hasMedia()
	};
	a.isMediaCompleted = function() {
		return !a.hasMedia() || a.mediaCompleted
	};
	a.isMediaStarted = function() {
		return !a.hasMedia() ||
			a.mediaStarted
	};
	a.showMedia = function() {
		b.showMedia()
	};
	a.getMediaDescription = function() {
		return b.getMediaDescription()
	};
	a.$on("media:start", function() {
		a.mediaStarted = !0;
		a.mediaCompleted = !1
	});
	a.$on("media:complete", function() {
		a.mediaCompleted = !0
	});
	// media2
	a.media2Started = e.isMedia2Started();
	a.media2Completed = e.isMedia2Completed();
	a.hasMedia2 = function() {
		return b.hasMedia2()
	};
	a.isMedia2Completed = function() {
		return !a.hasMedia2() || a.media2Completed
	};
	a.isMedia2Started = function() {
		return !a.hasMedia2() ||
			a.media2Started
	};
	a.showMedia2 = function() {
		b.showMedia2()
	};
	a.getMedia2Description = function() {
		return b.getMedia2Description()
	};
	a.$on("media2:start", function() {
		a.media2Started = !0;
		a.media2Completed = !1
	});
	a.$on("media2:complete", function() {
		a.media2Completed = !0
	})
}]);
angular.module("wittendoHost").filter("timer", ["dateFilter", function(a) {
	return function(b) {
		return a(new Date(1E3 * b), "mm:ss")
	}
}]).filter("fixed", function() {
	return function(a, b) {
		return a && a.toString().length < b ? Array(b + 1 - a.toString().length).join("&nbsp;").toString() + a : a
	}
}).filter("newlines", function() {
	return function(a) {
		return a && a.replace(/\n/g, "<br/>")
	}
});
angular.module("wittendoHost").factory("Game", ["$rootScope", "$location", "socket", "GameService", "MediaService", function(a, b, c, e, f) {
	c.on("team:added", function(b) {
		a.$broadcast("team:added", b)
	});
	c.on("team:updated", function(b) {
		a.$broadcast("team:updated", b)
	});
	c.on("game:end", function() {
		e.setGameEnded();
		b.path("/game")
	});
	c.on("media:complete", function() {
		f.setMediaCompleted();
		a.$broadcast("media:complete")
	})
}]);
angular.module("wittendoHost").factory("socket", ["$rootScope", "server", function(a, b) {
	var c = io.connect(b);
	return {
		on: function(b, f) {
			c.on(b, function() {
				var b = arguments;
				a.$apply(function() {
					f.apply(c, b)
				})
			})
		},
		emit: function(b, f, h) {
			c.emit(b, f, function() {
				var b = arguments;
				a.$apply(function() {
					h && h.apply(c, b)
				})
			})
		}
	}
}]).factory("TeamService", ["$http", "server", function(a, b) {
	return {
		loadTeams: function(c) {
			a.get(b + "/api/teams").success(function(a) {
				c(a)
			})
		},
		loadTeam: function(c, e) {
			a.get(b + "/api/teams/" + c).success(function(a) {
				e(a)
			})
		}
	}
}]).factory("RoundService", ["$location", "$http", "socket", "server", "$rootScope", "TeamService", "MediaService", "$timeout", function(a, b, c, e, f, h, r, k) {
	function d() {
		g.answers = [];
		h.loadTeams(function(a) {
			a.forEach(function(a) {
				g.answers.push({
					teamId: a.id,
					teamName: a.name,
					teamTable: a.table,
					selected: []
				})
			})
		})
	}

	function p() {
		g.teamsStatus = [];
		h.loadTeams(function(a) {
			a.forEach(function(a) {
				g.teamsStatus.push({
					teamId: a.teamId,
					teamName: a.name,
					teamTable: a.table,
					selected: ""
				})
			})
		})
	}

	function n() {
		g.remainingSeconds--;
		f.$broadcast("timerUpdated");
		0 < g.remainingSeconds ?
			q = k(n, 1E3) :
			finishTimer();
	}

	function finishTimer() {
		k.cancel(q);
		g.isTimerFinished = !0;
	}

	function s() {
		g.isTimerFinished = !1;
		g.step = m.optionsShown;
		q = k(n, 1E3)
	}

	function t(a) {
		var b = 0;
		a.forEach(function(a) {
			b += a.time
		});
		return b + (a.length - 1) * u
	}
	var m = {
			notStarted: 0,
			roundStarted: 1,
			questionShown: 2,
			optionsShown: 3,
			correctAnswerShown: 4,
			resultsShown: 5
		},
		l, g = {},
		q;
	c.on("round:answerAdded", function(a) {
		h.loadTeam(a.teamId, function(b) {
			g.answers.filter(function(a) {
				return a.teamName === b.name
			}).forEach(function(b) {
				b.selected.push({
					value: 0 == a.selected ? "\u041f\u0440\u0430\u0432\u0438\u043b\u044c\u043d\u043e\u0433\u043e \u043e\u0442\u0432\u0435\u0442\u0430 \u043d\u0435\u0442" : a.selected
				})
			});

			var selectedCount = g.answers.filter(function(a) {
				return a.selected.length;
			});

			if (l && l.type == "express")
				return;
			
			if (selectedCount.length == g.answers.length)
				finishTimer();
		})
	});
	c.on("round:teamDecision", function(a) {
		h.loadTeam(a.teamId, function(b) {
			var c = g.teamsStatus.filter(function(a) {
					return a.teamName === b.name
				}),
				d = "Простая игра",
				e;
			"OneForAll" === a.optionSelected && (d = "Один за всех");
			if ("Zeitnot" === a.optionSelected) {
				var f = g.teamsStatus.filter(function(b) {
						return b.teamId == a.partnerTeamId
					}),
					d = "Цейтнот";
				e = {
					name: f[0].teamName,
					table: f[0].teamTable
				}
			}
			if ("Turbo" === a.optionSelected) {
				d = "Турбо";
			}
			c.forEach(function(a) {
				a.selected = d;
				a.partner = e
			})
		})
	});
	var u = 1;
	return {
		getRoundSteps: function() {
			return m
		},
		hasMedia: function() {
			return l && l.media
		},
		hasMediaDescription: function() {
			return this.hasMedia() && l.media.description
		},
		getMediaDescription: function() {
			return this.hasMediaDescription() ? l.media.description : "\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435 \u043e\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442."
		},
		// media2
		hasMedia2: function() {
			return l && l.media2
		},
		hasMedia2Description: function() {
			return this.hasMedia2() && l.media2.description
		},
		getMedia2Description: function() {
			return this.hasMedia2Description() ? l.media2.description : "\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435 \u043e\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442."
		},
		showMedia2: function() {
			r.showMedia2()
		},
		//
		startRound: function(a) {
			b.post(e + "/api/game/round/start",
				a).success(function() {
				p();
				g.step = m.roundStarted
			})
		},
		showMedia: function() {
			r.showMedia()
		},
		showQuestion: function() {
			b.post(e + "/api/game/round/showQuestion").success(function() {
				d();
				g.step = m.questionShown;
				l && "express" === l.type && s()
			})
		},
		showOptions: function() {
			b.post(e + "/api/game/round/startQuestion").success(s)
		},
		showCorrectAnswer: function() {
			b.post(e + "/api/game/round/showCorrectAnswer").success(function() {
				g.step = m.correctAnswerShown
			})
		},
		showRoundResults: function() {
			b.post(e + "/api/game/round/showResults").success(function() {
				g.step =
					m.resultsShown
			})
		},
		getCurrentRoundStatus: function() {
			return g
		},
		getCurrentQuestion: function() {
			return l
		},
		moveToQuestion: function(a) {
			if ("express" != a.type) {
				var b = $.extend(!0, {}, a);
				a.questions = [b]
			}
			l = a;
			q = null;
			g.step = m.notStarted;
			g.remainingSeconds = t(l.questions)
		}
	}
}]).factory("GameService", ["$http", "socket", "server", "$rootScope", "$location", "RoundService", "$window", function(a, b, c, e, f, h, r) {
	var k = null,
		d = null,
		p = !1,
		n = !1;
	return {
		init: function(b) {
			if (n) b.resolve();
			else {
				var e = function() {
					null != k && null != d && (n = !0, h.moveToQuestion(k.dums[d.dumId].rounds[d.roundId]),
						b.resolve())
				};
				a.get(c + "/api/game/scenario").success(function(a) {
					k = a;
					e()
				});
				a.get(c + "/api/game/currentStep").success(function(a) {
					d = a;
					e()
				})
			}
		},
		getScenario: function() {
			return k
		},
		getCurrentStepInfo: function() {
			return d
		},
		getNextQuestion: function() {
			return d.roundId + 1 < k.dums[d.dumId].rounds.length ? k.dums[d.dumId].rounds[d.roundId + 1] : d.dumId + 1 < k.dums.length ? k.dums[d.dumId + 1].rounds[0] : null
		},
		moveToCurrentStep: function() {
			f.path("/game/" + d.dumId + "/" + d.roundId)
		},
		moveToNextRound: function() {
			a.post(c + "/api/game/round/finish").success(function(a) {
				d =
					a;
				h.moveToQuestion(k.dums[d.dumId].rounds[d.roundId]);
				f.path("/game/" + d.dumId + "/" + d.roundId)
			})
		},
		startGame: function(b) {
			a.post(c + "/api/game/start").success(function() {
				b()
			})
		},
		finishGame: function() {
			a.post(c + "/api/game/end")
		},
		setGameEnded: function() {
			p = !0
		},
		isGameEnded: function() {
			return p
		},
		isLastRound: function() {
			return d.roundId == k.dums[d.dumId].rounds.length - 1
		},
		isLastDum: function() {
			return d.dumId == k.dums.length - 1
		}
	}
}]).factory("MediaService", ["$http", "server", "$rootScope", function(a, b, c) {
	var e = null,
		f = !1,
		h = !1,

		e2 = null,
		f2 = !1,
		h2 = !1;
	return {
		initMedia: function(a, a2) {
			e = a;
			h = f = !1;

			e2 = a2;
			h2 = f2 = !1
		},
		showMedia: function(h) {
			f = !0;
			a.post(b + "/api/media/start", e).success(function() {
				c.$broadcast("media:start");
				h && h()
			})
		},
		setMediaCompleted: function() {
			h = !0
		},
		isMediaStarted: function() {
			return f
		},
		isMediaCompleted: function() {
			return h
		},
		//
		showMedia2: function(h) {
			f2 = !0;
			a.post(b + "/api/media/start", e2).success(function() {
				c.$broadcast("media:start");
				h2 && h2()
			})
		},
		setMedia2Completed: function() {
			h2 = !0
		},
		isMedia2Started: function() {
			return f2
		},
		isMedia2Completed: function() {
			return h2
		}
	}
}]);