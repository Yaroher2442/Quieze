angular.module("wittendoMonitor", ["ngRoute", "ngSanitize"]).config(["$routeProvider", function(a) {
	a.when("/intro", {
		templateUrl: "views/intro.html"
	});
	a.when("/teams", {
		templateUrl: "views/teams.html",
		controller: "TeamsCtrl"
	});
	a.when("/results", {
		templateUrl: "views/results.html",
		controller: "ResultsCtrl"
	});
	a.when("/round", {
		templateUrl: "views/round.html",
		controller: "RoundCtrl"
	});
	a.when("/question", {
		templateUrl: "views/question.html",
		controller: "QuestionCtrl"
	});
	a.when("/media/audio", {
		templateUrl: "views/media/audio.html",
		controller: "AudioCtrl"
	});
	a.when("/media/video", {
		templateUrl: "views/media/video.html",
		controller: "VideoCtrl"
	});
	a.when("/media/image", {
		templateUrl: "views/media/image.html",
		controller: "ImageCtrl"
	});
	a.when("/end", {
		templateUrl: "views/end.html"
	});
	a.otherwise({
		redirectTo: "/intro"
	})
}]).constant("server", "http://localhost:3000").run(["Game", function(a) {}]);
angular.module("wittendoMonitor").controller("TeamsCtrl", ["$scope", "$timeout", "GameService", function(a, c, b) {
	a.$on("team:added", function(c, b) {
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
	});
	a.init = function(b) {
		// a.teamPerPage = 10;
		a.teamPerPage = 20;
		a.currentPage = 0;
		a.teams = b;
		a.results = a.teams.slice(0, a.teamPerPage);
		var e = function() {
			(a.currentPage + 1) * a.teamPerPage >=
				a.teams.length ? (a.currentPage = 0, a.results = a.teams.slice(0, a.teamPerPage)) : (a.currentPage++, a.results = a.teams.slice(a.currentPage * a.teamPerPage, (a.currentPage + 1) * a.teamPerPage));
			c(e, 3E3)
		};
		c(e, 3E3)
	};
	b.loadTeams(function(b) {
		a.init(b)
	})
}]).controller("ResultsCtrl", ["$scope", "$timeout", "GameService", function(a, c, b) {
	a.init = function(b) {
		// a.teamPerPage = 10;
		a.teamPerPage = 20;
		a.currentPage = 0;
		a.results = b.slice(0, a.teamPerPage);
		a.resultState = {
			hasCorrect: false,
			hasHints: false,
			hasExpress: false,
			hasOneForAll: false,
			hasCorrectSeries: false,
			hasTernaryDumDum: false,
			hasZeitnot: false,
			hasTurbo: false,
			hasBase: false
		};

		if (a.results && a.results.length) {
			for (var i = 0; i < a.results.length; i++) {
				if (!a.results[i].formula)
					continue;

				if (a.results[i].formula.extendedBase && a.results[i].formula.extendedBase.length) {
					if (a.results[i].formula.extendedBase.length == 1) {
						a.results[i].formula.base = a.results[i].formula.extendedBase[0];
					} else {
						var explItems = [];
						for (var j = 0; j < a.results[i].formula.extendedBase.length; j++) {
							var base = a.results[i].formula.extendedBase[j].base;
							var eItem = [base];

							if (a.results[i].formula.extendedBase[j].hints) {
								base *= a.results[i].formula.extendedBase[j].hints.multiplier;
								eItem.push("*");
								eItem.push(a.results[i].formula.extendedBase[j].hints.multiplier);
							}

							explItems.push(eItem.join(' '));
						}

						a.results[i].formula.base = {
							base: explItems.join(" + ")
						};
					}
				}

				if (a.results[i].formula.turbo) {
					a.resultState.hasTurbo = true;

					a.results[i].formula.base = null;
					a.results[i].formula.express = null;
					a.results[i].formula.oneForAll = null;
					a.results[i].formula.correctSeries = null;
					a.results[i].formula.ternaryDumDum = null;
					a.results[i].formula.zeitnot = null;
				}

				if (a.results[i].formula.base && a.results[i].formula.base.hints)
					a.resultState.hasHints = true;

				if (a.results[i].formula.express)
					a.resultState.hasExpress = true;

				if (a.results[i].formula.oneForAll)
					a.resultState.hasOneForAll = true;

				if (a.results[i].formula.correctSeries)
					a.resultState.hasCorrectSeries = true;

				if (a.results[i].formula.ternaryDumDum)
					a.resultState.hasTernaryDumDum = true;

				if (a.results[i].formula.zeitnot)
					a.resultState.hasZeitnot = true;

				if (a.results[i].isCorrect)
					a.resultState.hasCorrect = true;

				if (a.results[i].formula.base && a.results[i].formula.base.base) {
					a.resultState.hasBase = true;
				}
			}
		}

		// console.log(a.results);
		// console.log(a.resultState);

		var e = function() {
			(a.currentPage + 1) * a.teamPerPage >= b.length ? (a.currentPage = 0, a.results = b.slice(0, a.teamPerPage)) :
				(a.currentPage++, a.results = b.slice(a.currentPage * a.teamPerPage, (a.currentPage + 1) * a.teamPerPage));
			c(e, 3E3)
		};
		c(e, 3E3)
	};
	b.loadCurrentStep(function(b) {
		a.currentStep = b
	});
	a.isGameEnded = b.isGameEnded();
	a.isGameEnded ? b.loadTeams(function(b) {
		a.init(b)
	}) : a.init(b.getResults())
}]).controller("RoundCtrl", ["$scope", "GameService", function(a, c) {
	c.loadCurrentRoundOptions(function(b) {
		a.roundOptions = b
	});
	c.loadCurrentStep(function(b) {
		a.currentStep = b
	})
}]).controller("QuestionCtrl", ["$scope", "GameService", function(a,
	c) {
	a.questionState = c.getQuestionState();
	c.loadCurrentQuestion(function(b) {
		a.question = b
	});
	c.loadCurrentStep(function(b) {
		a.currentStep = b
	})
}]).controller("AudioCtrl", ["$scope", "MediaService", function(a, c) {
	a.loaded = !1;
	a.completed = !1;
	c.loadMedia(function(b) {
		a.media = b
	});
	a.onLoaded = function() {
		a.loaded = !0;
		a.$apply()
	};
	a.onCompleted = function() {
		a.completed = !0;
		a.$apply();
		c.onCompleted()
	}
}]).controller("VideoCtrl", ["$scope", "MediaService", function(a, c) {
	a.loaded = !1;
	a.completed = !1;
	c.loadMedia(function(b) {
		a.media =
			b
	});
	a.onLoaded = function() {
		a.loaded = !0;
		a.$apply()
	};
	a.onCompleted = function() {
		a.completed = !0;
		a.$apply();
		c.onCompleted()
	}
}]).controller("ImageCtrl", ["$scope", "MediaService", function(a, c) {
	a.loaded = !1;
	c.loadMedia(function(b) {
		a.media = b
	});
	a.onLoaded = function() {
		a.loaded = !0;
		a.$apply();
		c.onCompleted()
	}
}]);
angular.module("wittendoMonitor").directive("mediaLoad", function() {
	return function(a, c) {
		c.bind("load", function() {
			a.onLoaded()
		})
	}
}).directive("mediaSrc", function() {
	return function(a, c) {
		a.$watch("media.src", function(a) {
			void 0 != a && c[0].load()
		})
	}
}).directive("mediaLoadeddata", function() {
	return function(a, c) {
		c.bind("loadeddata", function() {
			a.onLoaded();
			c[0].play()
		})
	}
}).directive("mediaEnded", function() {
	return function(a, c) {
		c.bind("ended", function() {
			a.onCompleted()
		})
	}
});
angular.module("wittendoMonitor").filter("interpolate", ["version", function(a) {
	return function(c) {
		return String(c).replace(/\%VERSION\%/mg, a)
	}
}]).filter("fixed", function() {
	return function(a, c) {
		return a && a.toString().length < c ? Array(c + 1 - a.toString().length).join("&nbsp;").toString() + a : a
	}
});
angular.module("wittendoMonitor").factory("Game", ["$rootScope", "$location", "socket", "GameService", "MediaService", function(a, c, b, d, e) {
	b.on("team:added", function(b) {
		a.$broadcast("team:added", b)
	});
	b.on("team:updated", function(b) {
		a.$broadcast("team:updated", b)
	});
	b.on("game:start", function() {
		d.goTo("/teams")
	});
	b.on("game:end", function() {
		d.setGameEnded();
		d.goTo("/end")
	});
	b.on("round:start", function(a) {
		d.setCurrentRoundOptions(a.options);
		d.setCurrentStep(a.stepInfo);
		d.goTo("/round")
	});
	b.on("round:showQuestion",
		function(a) {
			d.setCurrentQuestion(a);
			"express" === a.type && d.showOptions();
			d.goTo("/question")
		});
	b.on("round:startQuestion", function() {
		d.goTo("/question");
		d.showOptions()
	});
	b.on("round:stopQuestion", function() {
		d.stopQuestion();
		d.goTo("/question");
	});
	b.on("round:showResults", function(a) {
		d.setResults(a);
		d.goTo("/results")
	});
	b.on("media:start", function(a) {
		e.setMedia(a);
		"audio" === a.type && d.goTo("/media/audio");
		"video" === a.type && d.goTo("/media/video");
		"image" === a.type && d.goTo("/media/image")
	})
}]);
angular.module("wittendoMonitor").factory("socket", ["$rootScope", "server", function(a, c) {
	var b = io.connect(c);
	return {
		on: function(c, e) {
			b.on(c, function() {
				var c = arguments;
				a.$apply(function() {
					e.apply(b, c)
				})
			})
		},
		emit: function(c, e, h) {
			b.emit(c, e, function() {
				var c = arguments;
				a.$apply(function() {
					h && h.apply(b, c)
				})
			})
		}
	}
}]).factory("GameService", ["$http", "server", "$location", "$route", "$timeout", function(a, c, b, d, e) {
	function h() {
		g.remainSeconds--;
		m = 0 < g.remainSeconds ? e(h, 1E3) : e(n, 1E3)
	}

	function n() {
		f.current = "undefined" ===
			typeof f.current ? 0 : f.current + 1;
		if (f.current < f.questions.length) {
			var a = f.questions[f.current];
			f.questionsToShow = [a];
			g.remainSeconds = a.time;
			m = e(h, 1E3)
		}
	}

	function r() {
		f.questions.forEach(function(a) {
			g.correctOptions.push(a.correctOption)
		})
	}
	var p = [],
		g, k, f, l, q = !1,
		m;
	return {
		goTo: function(a) {
			b.path(a);
			d.reload()
		},
		loadCurrentRoundOptions: function(b) {
			var d = this;
			l ? b(l) : a.get(c + "/api/game/currentRoundOptions").success(function(a) {
				d.setCurrentRoundOptions(a);
				b(l)
			})
		},
		setCurrentRoundOptions: function(a) {
			l = a
		},
		loadCurrentQuestion: function(b) {
			var d =
				this;
			f ? b(f) : a.get(c + "/api/game/currentQuestion").success(function(a) {
				d.setCurrentQuestion(a);
				b(f)
			})
		},
		setCurrentQuestion: function(a) {
			g = {};
			f = a;
			n();
			g.showOptions = !1;
			g.correctOptions = []
		},
		showOptions: function() {
			g.showOptions = !0
		},
		stopQuestion: function() {
			e.cancel(m);
			f.questionsToShow = f.questions;
			r()
		},
		getQuestionState: function() {
			return g
		},
		loadCurrentStep: function(b) {
			var d = this;
			k ? b(k) : a.get(c + "/api/game/currentStep").success(function(a) {
				d.setCurrentStep(a);
				b(k)
			})
		},
		setCurrentStep: function(a) {
			k = a
		},
		getResults: function() {
			return p
		},
		setResults: function(a) {
			p = a
		},
		loadTeams: function(b) {
			a.get(c + "/api/teams").success(function(a) {
				b(a)
			})
		},
		setGameEnded: function() {
			q = !0
		},
		isGameEnded: function() {
			return q
		}
	}
}]).factory("MediaService", ["$http", "server", function(a, c) {
	var b;
	return {
		setMedia: function(a) {
			b = {
				type: a.type,
				src: "../content/" + a.type + "/" + a.src
			}
		},
		loadMedia: function(d) {
			var e = this;
			b ? d(b) : a.get(c + "/api/media").success(function(a) {
				e.setMedia(a);
				d(b)
			})
		},
		onCompleted: function() {
			a.post(c + "/api/media/complete")
		}
	}
}]);