var fps = 10;

angular.module('game', [])


/* Data Factory
 *
 * Defines and serves initial game data.
 */
.factory('Data', function () {
	if (localStorage['clickerSave']) {
		return JSON.parse(localStorage['clickerSave']);
	}

	var resources = {
		wood: 0,
		stone: 0,
		food: 0
	},
		inventory = {},
		upgrades = {
			miner_speed: 1,
			logger_speed: 1,
			hunter_speed: 1,
			miner_speed_factor: 1,
			logger_speed_factor: 1,
			hunter_speed_factor: 1,

			miner_quantity: 1,
			logger_quantity: 1,
			hunter_quantity: 1,
			hunger: 0.3,
		},
		buildings = {
			hovel: {
				name: "Hovel",
				cost: [{
					resource: 'wood',
					amount: 10
				}],
				owned: 0,
				desc: 'Basic housing. Room for 3 people',
			},
			forge: {
				name: "Forge",
				cost: [{
					resource: 'wood',
					amount: 10
				}],
				owned: 0,
				desc: 'Improves resource gathering rate of stone by 10%',
			},
			town_center: {
				name: "Town Center",
				cost: [{
					resource: 'wood',
					amount: 10
				}],
				owned: 0,
				desc: 'The heart of the city. Is pretty.',
			},
			logging_camp: {
				name: "Logging Camp",
				cost: [{
					resource: 'wood',
					amount: 10
				}],
				owned: 0,
				desc: 'Improves wood quantity gathered by 10%',
			},
			mill: {
				name: "Mill",
				cost: [{
					resource: 'wood',
					amount: 10
				}],
				owned: 0,
				desc: 'Improves the yield of crops by 10%',
			},
			granary: {
				name: "Granary",
				cost: [{
					resource: 'wood',
					amount: 10
				}],
				owned: 0,
				desc: 'Improves the quality of grain resources. Grain yield increases by 10%',
			},
			butchery: {
				name: "Butchery",
				cost: [{
					resource: 'wood',
					amount: 10
				}],
				owned: 0,
				desc: 'Improves the quality of meat resources. Meat yield increases by 10%',
			},
			workshop: {
				name: "Workshop",
				cost: [{
					resource: 'wood',
					amount: 10
				}],
				owned: 0,
				desc: 'Ability to create tools.',
			}
		},
		units = {
			miner: {
				name: "Miner",
				cost: [{
					resource: 'food',
					amount: 10
				}],
				owned: 3,
				desc: "Mines stone",
			},
			hunter: {
				name: "Hunter",
				cost: [{
					resource: 'food',
					amount: 10
				}],
				owned: 3,
				desc: "Hunts animals for food",
			},
			logger: {
				name: "Logger",
				cost: [{
					resource: 'food',
					amount: 10
				}],
				owned: 3,
				desc: "Chops wood"
			},



		},
		town_name = "My Town";

	return {
		resources: resources,
		units: units,
		upgrades: upgrades,
		buildings: buildings,
		town_name: town_name
	};
})



/* Game Controller
 *
 * Controls time and high level functions.
 */
.controller('GameCtrl', function ($scope, $timeout, Data) {
	var woodTimer = 0.0,
		stoneTimer = 0.0,
		foodTimer = 0.0,
		dieTick = 0,
		dying = false;

	function anyoneAlive() {
		for (var i in Data.units) {
			if (Data.units[i].owned > 0) {
				return true;
			}
		}
		return false;
	}

	function tick() {
		Data.resources.wood += (Data.units.logger.owned * Data.upgrades.logger_quantity) / (Data.upgrades.logger_speed * Data.upgrades.logger_speed_factor * fps);
		Data.resources.stone += (Data.units.miner.owned * Data.upgrades.miner_quantity) / (Data.upgrades.miner_speed * Data.upgrades.miner_speed_factor * fps);
		Data.resources.food += (Data.units.hunter.owned * Data.upgrades.hunter_quantity) / (Data.upgrades.hunter_speed * Data.upgrades.hunter_speed_factor * fps);

		// Eat
		if (Data.units.hunter.owned + Data.units.miner.owned + Data.units.logger.owned > 0) {
			Data.resources.food -= Data.upgrades.hunger * (Data.units.logger.owned + Data.units.miner.owned + Data.units.hunter.owned) / 30;
		}

		// Start dying if no food
		if (Data.resources.food <= -1 && anyoneAlive()) {
			console.log('dying!');
			dying = true;
			die_tick += 30 / 1000;
			if (die_tick >= 10) {
				var workers = ['loggers', 'miners', 'hunters'],
					type = Math.floor(Math.random() * 3);
				while (Data.units[workers[type]].owned === 0) {
					type = Math.floor(Math.random() * 3);
				}
				Data.units[workers[type]].owned -= 1;
				die_tick = 0;
			}
		} else if (!anyoneAlive()) {
			Data.resources.food = 0;
			dying = false;
			die_tick = 0;
		} else {
			dying = false;
			die_tick = 0;
		}

		$scope.tick = $timeout(tick, 1000 / fps);
	}
	$timeout(tick, 1000 / fps);


	$scope.getNumber = function (num) {
		return new Array(num);
	};


	$scope.mountain_pos = function (i) {


		var pos = {
			top: Math.floor(Math.random() * 50) + 20,
			left: i * 10
		};
		mountain_positions[i] = pos;
		return pos;
	};

	var mountain_positions = {};
	$scope.random_top = function (i) {
		if (mountain_positions[i]) return mountain_positions[i];
		var pos = Math.floor(Math.random() * 50);
		mountain_positions[i] = pos;
		return pos;
	};

	$scope.add_building_effect = function (building) {
		switch (building) {
		case 'forge':
			Data.upgrades.stone_speed_factor *= 0.5;
			break;
		case 'workshop':
			// TODO Needs effect
			break;
		case 'town_center':
			// TODO Needs effect
			break;
		case 'logging_camp':
			Data.upgrades.logger_speed_factor *= 0.5;
			break;
		case 'butchery':
			Data.upgrades.hunter_speed_factor *= 0.5;
			break;
		case 'granary':
			// TODO Needs effect
			break;

		}
	};
})


/* Data Controller
 *
 * Exposes the Data service to the view
 */
.controller('DataCtrl', function ($scope, Data) {
	$scope.data = Data;
})


/* Resource Controller
 *
 * Handles resource functions in the game window, such as clicking
 */
.controller('ResourceCtrl', function ($scope, Data) {
	$scope.chop_wood = function () {
		Data.resources.wood += 1;
	};
	$scope.mine_stone = function () {
		Data.resources.stone += 1;
	};
	$scope.hunt = function () {
		Data.resources.food += 1;
	};
})


/* Management Controller
 *
 * Handles the management window of the village.
 */
.controller('ManagerCtrl', function ($scope, Data) {

	var afford = function (list) {
		for (var i = 0; i < list.length; i++) {
			if (Data.resources[list[i].resource] - list[i].amount < 0) {
				return false;
			}
		}
		return true;
	};

	var spend = function (list) {
		if (!list) return false;

		var can_afford = afford(list);
		if (!can_afford) return false;

		for (var j = 0; j < list.length; j++) {
			Data.resources[list[j].resource] -= list[j].amount;
		}
		return true;
	};

	$scope.buy_worker = function (worker) {
		if (spend(Data.units[worker].cost)) {
			Data.units[worker].owned += 1;
		}
	};

	$scope.buy_building = function (building) {
		console.log('buying ' + building);
		if (spend(Data.buildings[building].cost)) {
			Data.buildings[building].owned += 1;
			$scope.add_building_effect(building);
			for (var i = 0; i < Data.buildings[building].cost.length; i++) {
				Data.buildings[building].cost[i].amount *= 2;
			}
		}
	};

	$scope.save = function () {
		var d = JSON.stringify(Data);
		console.log(d);
		localStorage['clickerSave'] = d;
	};

	$scope.new_game = function () {
		localStorage['clickerSave'] = '';
		window.location.reload(false);
	};

	$scope.can_afford = function (item) {
		if (item in Data.buildings) return afford(Data.buildings[item].cost);
		else if (item in Data.units) return afford(Data.units[item].cost);
		else return false;
	};
})


.directive('toggle_desc', function ($document) {
	return function (scope, elem, attr) {

		elem.bind('click', function () {

			var desc = elem.find('.desc');
			console.log(desc);
			desc.css({
				'display': 'block'
			});
		});
	};
})

/* Integer filter
 *
 * Turns input into an integer
 */
.filter('integer', function () {
	return function (input) {
		return parseInt(input);
	};
});