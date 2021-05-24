angular.module("app", ["ngRoute", "ngTouch", "ngAnimate", "ngSanitize"]).config(["$routeProvider", function(a) {
	a.when("/intro", {
		templateUrl: "views/intro.html",
		controller: "IntroCtrl"
	});
	a.when("/game", {
		templateUrl: "views/game.html",
		controller: "GameCtrl"
	});
	a.when("/registration", {
		templateUrl: "views/team-registration.html",
		controller: "RegistrationCtrl"
	});
	a.when("/team", {
		templateUrl: "views/team-details.html",
		controller: "TeamDetailsCtrl"
	});
	a.when("/rating", {
		templateUrl: "views/rating.html",
		controller: "RatingCtrl"
	});
	a.when("/rules", {
		templateUrl: "views/rules.html"
	});
	a.when("/game/question", {
		templateUrl: "views/question.html",
		controller: "QuestionCtrl"
	});
	a.when("/game/round-info", {
		templateUrl: "views/round-info.html",
		controller: "RoundInfoCtrl"
	});
	a.otherwise({
		redirectTo: "/intro"
	})
}]).run(["Game", function(a) {}]);
angular.module("app").controller("AppCtrl", ["$scope", "GameService", "RegistrationService", "GameEvents", "$rootScope", function(a, b, c, e, r) {
	var savedTeamData = c.getLocalTeamData();
	if (savedTeamData && savedTeamData.teamId && savedTeamData.gameUUID) {
		b.restoreGameState(savedTeamData, e, function(result, data) {
			if (result) {
				c.setTeam(data.team);
				b.setGameStarted();
			} else {
				b.goTo('/intro');
			}
		});
	}

	a.team = b.getTeam();
	a.$on("team:updated", function() {
		a.team = b.getTeam()
	});

	r.$watch('registrationInputFocus', function(val) {
		a.registrationInputFocus = val;
	});
}]).controller("IntroCtrl", ["$scope", "GameService", function(a, b) {
	a.next = function() {
		b.setGameStarted()
	}
}]).controller("GameCtrl", ["$scope", "$location", "GameService", function(a, b, c) {
	a.isGameEnded = c.isGameEnded();
	a.currentGamePath = c.getCurrentGamePath();
	"/game" != a.currentGamePath && c.goTo(a.currentGamePath)
}]).controller("RatingCtrl", ["$scope", "GameService",
	function(a, b) {
		b.hasCurrentTeam() && (a.currentTeamId = b.getCurrentTeamId());
		b.loadTeams(function(b) {
			a.teams = b
		});
		a.$on("team:added", function(b, e) {
			a.teams.push(e)
		});
		a.$on("team:updated", function(b, e) {
			a.teams.filter(function(a) {
				return a.teamId === e.teamId
			}).forEach(function(a) {
				a.name = e.name;
				a.table = e.table;
				a.totalScore = e.totalScore;
				a.members = e.members
			})
		})
	}
]).controller("RegistrationCtrl", ["$rootScope", "$scope", "$location", "GameService", "RegistrationService", '$timeout', function(a, b, c, e, f, $timeout) {
	b.currentStepIndex = f.getCurrentStepIndex();
	b.team = f.getTeam();
	b.addTeamMember = function() {
		b.team.members.push({
			name: "",
			email: ""
		});

	};
	b.deleteTeamMember = function(a) {
		b.team.members.splice(a, 1)
	};
	b.saveTeam = function(a) {
		b.clearEmptyMembers();
		b.validate() && f.saveTeam(b.team, a, b.showRegistrationErrors)
	};
	b.registration = function() {
		b.saveTeam(function() {
			e.setTeamRegistered(!0)
		})
	};
	b.validate = function() {
		return 0 === b.currentStepIndex ? b.validateTeam() : 1 === b.currentStepIndex ? b.validateMembers() : !0
	};
	b.validateTeam = function() {
		var a = f.validateTeam(b.team);
		return "" != a ? (b.showRegistrationErrors(a), !1) : !0
	};
	b.validateMembers = function() {
		for (var a = b.team.members, e = 0; e < a.length; ++e) {
			var c = f.validateMembers(a[e]);
			if ("" != c) return b.showRegistrationErrors(c), !1
		}
		return !0
	};
	b.showRegistrationErrors = function(a) {
		$(".msgValidation").popover({
			trigger: "manual",
			container: "body",
			placement: "top",
			content: a
		});
		$(".msgValidation").popover("toggle")
	};
	b.clearEmptyMembers = function() {
		var members = [];
		var cMembers = b.team.members;

		for (var i = 0; i < cMembers.length; i++) {
			if (cMembers[i].name.trim().length != 0 || cMembers[i].email.trim().length != 0)
				members.push(cMembers[i]);
		}

		if (members.length)
			b.team.members = members;
	}
	b.$watch("currentStepIndex", function(a) {
		f.setCurrentStepIndex(a)
	});
	b.$watch("team", function(a) {
		f.setTeam(a)
	});

	b.rTeamNameFocus = false;
	b.rTeamTableFocus = false;
	b.registrationInputFocus = false;
	b.$watch("rTeamNameFocus + rTeamTableFocus", function() {
		b.registrationInputFocus = b.rTeamNameFocus || b.rTeamTableFocus;
		a.registrationInputFocus = b.rTeamNameFocus || b.rTeamTableFocus;
	});

}]).controller("TeamDetailsCtrl", ["$scope", "GameService", "RegistrationService", function(a, b, c) {
	b.updateCurrentTeamFromServer(function(b) {
		a.team = b
	});
	$("#addTeamMemberModal").on("shown.bs.modal", b.disableHighlightingUnderModal);
	$("#addTeamMemberModal").on("hidden.bs.modal", b.enableHighlightingUnderModal);
	a.addNewTeamMember = function() {
		a.validateMembers() && c.addNewMember(a.newMember, function() {
			a.team.members.push(a.newMember);
			a.newMember = {
				name: "",
				email: ""
			};
			$("#addTeamMemberModal").modal("hide")
		})
	};
	a.deleteTeamMember = function(b) {
		c.deleteMember(b, function() {
			a.team.members.splice(b,
				1)
		})
	};
	a.cancelNewTeamMember = function() {
		a.newMember = {
			name: "",
			email: ""
		};
		$("#addTeamMemberModal").modal("hide")
	};
	a.validateMembers = function() {
		var b = c.validateMembers(a.newMember);
		return "" != b ? (a.showErrors(b), !1) : !0
	};
	a.showErrors = function(a) {
		$(".msgValidation").popover({
			trigger: "manual",
			container: "body",
			placement: "left",
			content: a
		});
		$(".msgValidation").popover("toggle")
	}

	a.rMemberNameFocus = false;
	a.rMemberEmailFocus = false;
	a.registrationInputFocus = false;
	a.$watch("rMemberNameFocus + rMemberEmailFocus", function() {
		a.registrationInputFocus = a.rMemberNameFocus || a.rMemberEmailFocus;
	});

}]).controller("QuestionCtrl", ["$scope", "$timeout", "GameService", function(a, b, c) {
	a.Math = window.Math;
	a.currentTeamId = c.getCurrentTeamId();
	a.questionState =
		c.getQuestionState();

	a.question = c.getQuestion();
	a.currentStep = c.getCurrentStep();
	a.removeWrongOption = function() {
		c.removeWrongOption()
	};
	a.chooseAnswer = function(a) {
		c.chooseAnswer(a)
	};
	a.openCalculationDetailsModal = function(b) {
		a.details = b;
		$("#calculationDetailsModal").modal("toggle")
	};
	a.closeCalculationDetailsModal = function() {
		$("#calculationDetailsModal").modal("hide")
	};
	$("#calculationDetailsModal").on("shown.bs.modal", c.disableHighlightingUnderModal);
	$("#calculationDetailsModal").on("hidden.bs.modal",
		c.enableHighlightingUnderModal);
	$("#questionModal").on("shown.bs.modal", c.disableHighlightingUnderModal);
	$("#questionModal").on("hidden.bs.modal", c.enableHighlightingUnderModal);
	"question:show" == a.questionState.status && $("#questionModal").modal("toggle")
}]).controller("RoundInfoCtrl", ["$scope", "GameService", "RoundService", function(a, b, c) {
	a.currentStep = b.getCurrentStep();
	a.roundState = b.getRoundState();
	a.chooseSimple = function() {
		a.chooseOption(c.getRoundOptions().simple);
		b.sendTeamIsReady()
	};
	a.chooseOneForAll =
		function() {
			a.chooseOption(c.getRoundOptions().oneForAll);
			a.roundState.oneForAllAvailable -= 1;
			b.sendTeamChoseOneForAll()
		};
	a.chooseTurbo =
		function() {
			a.chooseOption(c.getRoundOptions().turbo);
			a.roundState.turboAvailable -= 1;
			b.sendTeamChoseTurbo()
		};

	a.chooseOption = function(b) {
		a.roundState.chosenOption = b;
		a.roundState.isOptionChosen = !0
	};
	a.isChosenOption = function(b) {
		return a.roundState.chosenOption == b
	};
	a.isSimple = function() {
		return a.isChosenOption(c.getRoundOptions().simple)
	};
	a.isOneForAll = function() {
		return a.isChosenOption(c.getRoundOptions().oneForAll)
	};
	a.isOneForAllAvailable = function() {
		return 0 < a.roundState.oneForAllAvailable
	};
	a.isTurbo = function() {
		return a.isChosenOption(c.getRoundOptions().turbo)
	};
	a.isTurboAvailable = function() {
		return 0 < a.roundState.turboAvailable
	};
	a.isZeitnot = function() {
		return a.isChosenOption(c.getRoundOptions().zeitnot)
	};
	a.chooseZeitnot = function() {
		a.chooseOption(c.getRoundOptions().zeitnot);
		b.sendTeamChoseZeitnot(a.roundState.partnerTeamId);
		$("#choosePartnerTeamModal").modal("hide")
	};
	a.cancelZeitnot = function() {
		$("#choosePartnerTeamModal").modal("hide")
	};
	$("#choosePartnerTeamModal").on("shown.bs.modal", b.disableHighlightingUnderModal);
	$("#choosePartnerTeamModal").on("hidden.bs.modal", b.enableHighlightingUnderModal);
}]).controller("ImageCtrl", ["$scope", function(a) {}]).controller("VideoCtrl", ["$scope", function(a) {}]).controller("AudioCtrl", ["$scope", function(a) {}]);
angular.module("app").directive("wizard", function() {
	return {
		restrict: "EA",
		link: function(a) {
			a.steps[a.currentStepIndex].show()
		},
		controller: ["$scope", function(a) {
			a.steps = [];
			this.registerStep = function(b) {
				b.hide();
				a.steps.push(b)
			};
			var b = function(b) {
				a.steps[a.currentStepIndex].hide();
				a.currentStepIndex = b;
				a.steps[a.currentStepIndex].show()
			};
			a.showNextStep = function() {
				a.saveTeam(function() {
					b(a.currentStepIndex + 1)
				})
			};
			a.showPreviousStep = function() {
				b(a.currentStepIndex - 1)
			};
			a.hasNext = function() {
				return a.currentStepIndex <
					a.steps.length - 1
			};
			a.hasPrevious = function() {
				return 0 < a.currentStepIndex
			}
		}]
	}
}).directive("step", function() {
	return {
		require: "^wizard",
		restrict: "EA",
		link: function(a, b, c, e) {
			e.registerStep(b)
		}
	}
}).directive("elMenu", ["$location", function(a) {
	return {
		link: function(b) {
			b.$on("$locationChangeSuccess", function() {
				var b = a.path();
				"/intro" === b ? $("#menu").hide() : "/registration" === b ? ($("#menu li:has(a[href='#registration'])").show(), $("#menu li:has(a[href='#team'])").hide(), $("#menu li").find("a[href='#registration']").tab("show")) :
					"/team" == b ? ($("#menu li:has(a[href='#team'])").show(), $("#menu li:has(a[href='#registration'])").hide(), $("#menu li").find("a[href='#team']").tab("show")) : 0 == b.indexOf("/game") ? $("#menu li").find("a[href='#game']").tab("show") : 0 == b.indexOf("/rating") && $("#menu li").find("a[href='#rating']").tab("show")
			});
			b.$on("game:start", function() {
				$("#menu").show()
			})
		}
	}
}]).directive("number", function() {
	return {
		require: "ngModel",
		link: function(a, b, c, e) {
			e.$parsers.push(function(a) {
				if (void 0 == a) return "";
				var b = a.replace(/[^0-9]/g,
					"");
				b != a && (e.$setViewValue(b), e.$render());
				return b
			})
		}
	}
}).directive("onBlurHideErrors", ["$document", function(a) {
	return {
		link: function(b, c) {
			var e = function(a) {
				!$(a.target).hasClass("msgValidation") && c.is(":visible") && ($(".msgValidation").popover("destroy"), $(".popover").remove())
			};
			a.bind("tap", e);
			a.bind("click", e)
		}
	}
}]);
angular.module("app").filter("fixed", function() {
	return function(a, b) {
		return a && a.toString().length < b ? Array(b + 1 - a.toString().length).join("&nbsp;").toString() + a : a
	}
});
angular.module("app").factory("GameEvents", ["$rootScope", "socket", "GameService", function(a, b, c) {
	var events = {
		"team:added": function(b) {
			c.saveLastState("team:added");
			a.$broadcast("team:added", b)
		},
		"team:updated": function(b) {
			c.saveLastState("team:updated");
			a.$broadcast("team:updated", b)
		},
		"round:start": function(a) {
			c.saveLastState("round:start", a);
			c.setGamePath("/game/round-info");
			console.log("Started round");
			c.setCurrentStep(a.stepInfo);
			c.startRound(a.options);

		},
		"round:showQuestion": function(a) {
			c.saveLastState("round:showQuestion", a);
			c.setQuestion(a);
			"express" === a.type && c.startQuestion();
			c.setGamePath("/game/question")
		},
		"game:end": function() {
			c.saveLastState("game:end");
			c.setGameEnded();
			c.setGamePath("/game")
		},
		"round:startQuestion": function() {
			c.saveLastState("round:startQuestion");
			c.startQuestion()
		},
		"round:stopQuestion": function() {
			c.saveLastState("round:stopQuestion");
			c.stopQuestion()
		},
		"round:showResults": function(a) {
			c.saveLastState("round:showResults", a);
			c.showResults(a)
		}
	}

	return events;
}]);
angular.module("app").factory("Game", ["$rootScope", "socket", "GameService", "GameEvents", function(a, b, c, e) {

	for (var n in e) {
		b.on(n, e[n]);
	}

}]);
angular.module("app").factory("GameService", ["$rootScope", "$http", "server", "$window", "$location", "$route", "$timeout", function(a, b, c, e, f, h, m) {
	function r() {
		var a = g.question.questions[g.question.currentIndex];
		d.initialSeconds = a.time;
		d.remainSeconds = k.isZeitnotChosen ? a.time - Math.round(a.time / 3) : a.time;
		d.remainPercents = 100 * d.remainSeconds / d.initialSeconds;
		d.answerDone = !1;
		d.remainSecondsToChangeQuestion = a.time;
		d.areOptionsDisabled = !1;
		d.hideOption = [!1, !1, !1, !1, !1];
		d.wrongOptionsRemoved = 0;
		d.selected = -1
	}

	function w(a) {
		a.questions.forEach(function(a) {
			var b = [1, 2, 3, 4],
				c = b.indexOf(a.correctOption);
			b.splice(c, 1);
			for (var c = [], e = 0; 2 > e; e++) {
				var d = Math.floor(Math.random() * b.length);
				c.push(b[d]);
				b.splice(d, 1)
			}
			a.wrongOptions = c
		});
		return a
	}

	function q() {
		d.remainSecondsToChangeQuestion--;
		d.answerDone || (d.remainSeconds--, d.remainPercents = 100 * d.remainSeconds / d.initialSeconds, 0 === d.remainSeconds && l.chooseAnswer(-1));
		if (d.remainSeconds <= 0) {
			d.areOptionsDisabled = !0;
			d.remainSeconds = 0;
		}
		p = 0 < d.remainSecondsToChangeQuestion ? m(q, 1E3) : m(x, 1E3)
	}

	function x() {
		g.question.currentIndex + 1 !== g.question.questions.length && (g.question.currentIndex += 1,
			r(), p = m(q, 1E3))
	}
	var g = {},
		s = !1,
		t = !1,
		u = !1,
		v = "/game",
		n = null,
		p, d = {},
		k = {},
		l;
	return {
		goTo: function(a) {
			f.path(a)
		},
		setGameStarted: function() {
			l = this;
			s = !0;
			this.hasCurrentTeam() ? this.goTo("/team") : this.goTo("/registration");
			a.$broadcast("game:start")
		},
		isGameStarted: function() {
			return s
		},
		setGameEnded: function() {
			u = !0;
			this.clearLocalData();
		},
		isGameEnded: function() {
			return u
		},
		setTeamRegistered: function() {
			t = !0;
			this.goTo("/team");
			a.$broadcast("team:registered")
		},
		isTeamRegistered: function() {
			return t
		},
		setCurrentGamePath: function(a) {
			v = a
		},
		getCurrentGamePath: function() {
			return v
		},
		hasCurrentTeam: function() {
			return null !== n
		},
		getCurrentTeamId: function() {
			return n.teamId
		},
		getTeam: function() {
			return n
		},
		loadTeams: function(a) {
			b.get(c + "/api/teams").success(function(b) {
				a(b)
			})
		},
		updateCurrentTeamFromServer: function(e) {
			b.get(c + "/api/teams/" + this.getCurrentTeamId()).success(function(b) {
				n = b;
				a.$broadcast("team:updated");
				e(b)
			})
		},
		saveTeam: function(e, d, f) {
			b.post(c + "/api/teams", e).success(function(b) {
				n = b;
				a.$broadcast("team:updated");
				d(b)
			}).error(function(a) {
				f(a)
			})
		},
		getQuestion: function() {
			return g.question
		},
		getCurrentStep: function() {
			return g.currentStep
		},
		setCurrentStep: function(a) {
			g.currentStep = a
		},
		setQuestion: function(a) {
			g.question = w(a);
			this.getQuestion().currentIndex = 0;
			d = {
				areOptionsDisabled: !1,
				status: "question:show",
				selectedArray: []
			};
			this.updateCurrentTeamFromServer(function(a) {
				d.hintsAvailable = a.hintsAvailable
			});
			r();
			l.disableHighlightingUnderModal()
		},
		sendAnswer: function(a) {
			b.post(c + "/api/game/round/addAnswer", {
				teamId: this.getCurrentTeamId(),
				selected: a,
				remainingSeconds: d.remainSeconds,
				hintsUsed: d.wrongOptionsRemoved
			})
		},
		setGamePath: function(a) {
			$(".modal-backdrop").remove();
			if (this.isTeamRegistered()) {
				this.setCurrentGamePath(a);
				this.goTo(a);
			}
			// this.isTeamRegistered() && (this.setCurrentGamePath(a), this.goTo(a))
		},
		sendTeamIsReady: function() {
			b.post(c + "/api/game/round/setTeamDecision", {
				teamId: this.getCurrentTeamId()
			})
		},
		sendTeamChoseOneForAll: function() {
			b.post(c + "/api/game/round/setTeamDecision", {
				teamId: this.getCurrentTeamId(),
				optionSelected: "OneForAll"
			})
		},
		sendTeamChoseTurbo: function() {
			b.post(c + "/api/game/round/setTeamDecision", {
				teamId: this.getCurrentTeamId(),
				optionSelected: "Turbo"
			})
		},
		sendTeamChoseZeitnot: function(a) {
			k.isZeitnotChosen = !0;
			b.post(c + "/api/game/round/setTeamDecision", {
				teamId: this.getCurrentTeamId(),
				optionSelected: "Zeitnot",
				partnerTeamId: a
			})
		},
		getQuestionState: function() {
			return d
		},
		getRoundState: function() {
			return k
		},
		startRound: function(a) {
			k = {
				isOptionChosen: !1,
				oneForAllAvailable: 0,
				turboAvailable: 0
			};
			k.options = a;
			k.partnerTeamId = -1;
			this.updateCurrentTeamFromServer(function(a) {
				if (!a.totalScore)
					a.turboAvailable = "";
				k.oneForAllAvailable = a.oneForAllAvailable;
				k.turboAvailable = a.turboAvailable;
			});
			this.loadTeams(function(a) {
				k.otherTeams = a.filter(function(a) {
					return a.teamId != l.getCurrentTeamId()
				})
			})
		},
		startQuestion: function() {
			d.status = "questionStarted";
			p = m(q, 1E3);
			$("#myModal").modal("toggle");
			$(".modal-backdrop").remove();
			l.enableHighlightingUnderModal()
		},
		removeWrongOption: function() {
			d.wrongOptionsRemoved += 1;
			d.hintsAvailable -= 1;
			d.hideOption[g.question.questions[g.question.currentIndex].wrongOptions[d.wrongOptionsRemoved - 1]] = !0
		},
		chooseAnswer: function(a) {
			d.selected = a;
			d.selectedArray.push(a);
			l.sendAnswer(a);
			d.answerDone = !0;
			d.areOptionsDisabled = !0
		},
		stopQuestion: function() {
			d.areOptionsDisabled = !0;
			m.cancel(p);
			d.correctOptions = [];
			this.getQuestion().questions.forEach(function(a) {
				d.correctOptions.push(a.correctOption)
			});
			"express" === this.getQuestion().type &&
				(d.showCorrectAnswersExpress = !0)
		},
		showResults: function(a) {
			d.showResults = !0;
			d.answers = a;
			var details = a.filter(function(item) {
				return item.teamId == n.teamId;
			});
			if (details.length) {
				var details = details[0];
				var hints = [];				

				if (details.formula.extendedBase.length > 1) {

					var basePoints = 0;
					var explItems = [];
					for (var i = 0; i < details.formula.extendedBase.length; i++) {						
						var base = details.formula.extendedBase[i].base;
						var eItem = [base];

						if (details.formula.extendedBase[i].hints) {
							base *= details.formula.extendedBase[i].hints.multiplier;
							eItem.push("*");
							eItem.push(details.formula.extendedBase[i].hints.multiplier);								
						}

						basePoints += base;
						explItems.push(eItem.join(' '));
					}

					details.basePoints = basePoints;
					details.explanation = "(" + explItems.join(" + ") + ")";
				}

				d.details = details;
			}
		},
		disableHighlightingUnderModal: function() {
			$("#menu").addClass("highlight-disabled");
			$(".btn").not(".btn-modal").addClass("highlight-disabled")
		},
		enableHighlightingUnderModal: function() {
			$("#menu").removeClass("highlight-disabled");
			$(".btn").not(".btn-modal").removeClass("highlight-disabled")
		},

		//
		restoreGameState: function(teamData, gameEvents, cb) {
			if (!teamData || !teamData.teamId || !teamData.gameUUID)
				return cb(false);

			var self = this;
			b.get(c + "/api/game/restoreGameState/" + teamData.teamId + '/' + teamData.gameUUID).success(function(res, statusCode) {
				if (res && res.status && res.team) {
					n = res.team;
					self.setTeamRegistered();
					cb(true, res);
					self._restoreGameState(gameEvents);
				} else {
					return cb(false);
				}
			});
		},
		_restoreGameState: function(gameEvents) {
			var lastState = this.getLastState();
			// console.log(lastState);
			if (lastState && lastState.length) {
				for (var i = 0; i < lastState.length; i++) {
					if (lastState[i].state && typeof gameEvents[lastState[i].state] === "function") {
						if (lastState[i].state == "round:showQuestion" && lastState[i].args.startTime) {
							var now = Date.now() / 1000 | 0;
							var time = lastState[i].args.time - (now - lastState[i].args.startTime);
							if (time < 0)
								time = 0;
							lastState[i].args.time = time;
							if (typeof lastState[i].args.currentIndex !== "undefined")
								lastState[i].args.questions[lastState[i].args.currentIndex].time = time;
							else
								lastState[i].args.questions[0].time = time;
						}

						gameEvents[lastState[i].state](lastState[i].args);
					}
				}
			}
		},
		_getState: function() {
			var data = window.localStorage.getItem('prevState');
			if (data && data.length && data !== 'undefined') {
				return JSON.parse(data);
			} else {
				return [];
			}
		},
		_saveState: function(state) {
			// if (state.length == 5) {
			// 	state.shift();
			// }
			window.localStorage.setItem('prevState', JSON.stringify(state));
		},

		saveLastState: function(state, args) {
			var stateObj = this._getState();

			var cState = {
				state: state,
				args: args
			};

			if (state == "round:start") {
				stateObj = [];
			}

			if (state == "round:showQuestion")
				args.startTime = Date.now() / 1000 | 0;

			stateObj.push(cState);
			this._saveState(stateObj);
		},

		getLastState: function() {
			return this._getState();
		}
	}
}]).factory("RoundService", function() {
	var a = {
		simple: 0,
		oneForAll: 1,
		zeitnot: 2,
		turbo: 3
	};
	return {
		getRoundOptions: function() {
			return a
		}
	}
}).factory("RegistrationService", ["GameService", function(a) {
	var b = 0,
		c = {
			picture: "/img/team_default.jpg",
			members: [{
				name: "",
				email: "",
				picture: "/img/team_member_default.jpg"
			}]
		};
	return {
		getTeam: function() {
			return c
		},
		setTeam: function(a) {
			c = a
		},
		getCurrentStepIndex: function() {
			return b
		},
		setCurrentStepIndex: function(a) {
			b = a
		},
		saveTeam: function(b, f, h) {
			var self = this;
			a.saveTeam(b, function(a) {
				c.teamId = a.teamId;
				self.saveTeamDataLocal(a);
				f(a)
			}, h)
		},
		addNewMember: function(b, c) {
			a.updateCurrentTeamFromServer(function(h) {
				h.members.push(b);
				a.saveTeam(h, c)
			})
		},
		deleteMember: function(b, c) {
			a.updateCurrentTeamFromServer(function(h) {
				h.members.splice(b,
					1);
				a.saveTeam(h, c)
			})
		},
		validateTeam: function(a) {
			var b = a.name;
			if (void 0 == b || 0 == b.trim().length) return "\u0418\u043c\u044f \u043a\u043e\u043c\u0430\u043d\u0434\u044b \u043d\u0435 \u043c\u043e\u0436\u0435\u0442 \u0431\u044b\u0442\u044c \u043f\u0443\u0441\u0442\u044b\u043c";
			a = a.table;
			return void 0 == a || 0 == a.trim().length ? "\u041d\u043e\u043c\u0435\u0440 \u0441\u0442\u043e\u043b\u0430 \u043d\u0435 \u043c\u043e\u0436\u0435\u0442 \u0431\u044b\u0442\u044c \u043f\u0443\u0441\u0442\u044b\u043c" : ""
		},
		validateMembers: function(a) {
			if (void 0 ==
				a || void 0 == a.name || 0 == a.name.trim().length) return "\u0418\u043c\u044f \u0443\u0447\u0430\u0441\u0442\u043d\u0438\u043a\u0430 \u043d\u0435 \u043c\u043e\u0436\u0435\u0442 \u0431\u044b\u0442\u044c \u043f\u0443\u0441\u0442\u044b\u043c";
			var b = /^([\u0430-\u044f\u0410-\u042fa-zA-Z0-9_\.\-])+\@(([\u0430-\u044f\u0410-\u042fa-zA-Z0-9\-])+\.)+([\u0430-\u044f\u0410-\u042fa-zA-Z0-9]{2,4})+$/;
			return void 0 != a.email && 0 < a.email.length && !b.test(a.email) ? "Email \u0443\u0447\u0430\u0441\u0442\u043d\u0438\u043a\u0430 \u0434\u043e\u043b\u0436\u0435\u043d \u0431\u044b\u0442\u044c \u0432\u0430\u043b\u0438\u0434\u043d\u044b\u043c (\u043f\u0440\u0438\u043c\u0435\u0440: dum@ya.ru)" :
				""
		},
		saveTeamDataLocal: function(team) {
			this.clearLocalData();
			window.localStorage.setItem('teamId', team.teamId);
			window.localStorage.setItem('gameUUID', team.gameUUID);
		},
		clearLocalData: function() {
			window.localStorage.clear();
		},
		getLocalTeamData: function() {
			var result = {
				"teamId": window.localStorage.getItem("teamId"),
				"gameUUID": window.localStorage.getItem("gameUUID")
			};

			return result;
		}
	}
}]).filter('range', function() {
	return function(input, total) {
		total = parseInt(total);

		for (var i = 0; i < total; i++) {
			input.push(i);
		}

		return input;
	};
}).filter('declOfNum', function() {
	return function(number, titles) {
		if (!number)
			return "";

		cases = [2, 0, 1, 1, 1, 2];
		return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
	}
});
angular.module("app").factory("socket", ["$rootScope", "server", function(a, b) {
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
}]);


//JSON.parse('{"a":"\u041d\u043e\u043c\u0435\u0440 \u0441\u0442\u043e\u043b\u0430 \u043d\u0435 \u043c\u043e\u0436\u0435\u0442 \u0431\u044b\u0442\u044c \u043f\u0443\u0441\u0442\u044b\u043c"}');