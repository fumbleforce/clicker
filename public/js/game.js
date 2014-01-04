var fps = 30;

angular.module('game', [])
	.factory('Data', function () {
		if (localStorage['clickerSave']) {
			return JSON.parse(localStorage['clickerSave']);
		}

		var resources = {
			wood: 0,
			stone: 0,
			meat: 0
		},
			inventory = {},
			workers = {
				miners: [],
				loggers: [{}, {}, {}, {}, {}],
				hunters: [{
					level: 1
				}]
			},
			upgrades = {
				miner_speed: 1,
				logger_speed: 1,
				hunter_speed: 1,

				miner_quantity: 1,
				logger_quantity: 1,
				hunter_quantity: 1
			},
			buildings = {},
			costs = {
				miner: [{
					resource: 'meat',
					amount: 10
				}],
				hunter: [{
					resource: 'meat',
					amount: 10
				}],
				logger: [{
					resource: 'meat',
					amount: 10
				}],

				hunger: 0.3,

				hovel: [{
					resource: 'wood',
					amount: 10
				}],
				forge: [{
					resource: 'wood',
					amount: 10
				}],
				town_center: [{
					resource: 'wood',
					amount: 10
				}],
				logging_camp: [{
					resource: 'wood',
					amount: 10
				}],
				mill: [{
					resource: 'wood',
					amount: 10
				}],
				granary: [{
					resource: 'wood',
					amount: 10
				}],
				butchery: [{
					resource: 'wood',
					amount: 10
				}],
				workshop: [{
					resource: 'wood',
					amount: 10
				}],
			},
			town_name = "My Town";

		return {
			resources: resources,
			workers: workers,
			upgrades: upgrades,
			costs: costs,
			buildings: buildings,
			town_name: town_name
		};
	})

.controller('GameCtrl', function ($scope, $timeout, Data) {
	var woodTimer = 0.0,
		stoneTimer = 0.0,
		meatTimer = 0.0,
		dieTick = 0,
		dying = false;

	function anyoneAlive() {
		for (var i in Data.workers) {
			if (Data.workers[i].length > 0) {
				return true;
			}
		}
		return false;
	}

	function tick() {
		Data.resources.wood += (Data.workers.loggers.length * Data.upgrades.logger_quantity) / (Data.upgrades.logger_speed * fps);
		Data.resources.stone += (Data.workers.miners.length * Data.upgrades.miner_quantity) / (Data.upgrades.miner_speed * fps);
		Data.resources.meat += (Data.workers.hunters.length * Data.upgrades.hunter_quantity) / (Data.upgrades.hunter_speed * fps);

		// Eat
		if (Data.workers.miners.length + Data.workers.loggers.length + Data.workers.hunters.length > 0) {
			Data.resources.meat -= Data.costs.hunger * (Data.workers.miners.length + Data.workers.loggers.length + Data.workers.hunters.length) / 30;
		}

		// Start dying if no food
		if (Data.resources.meat <= -1 && anyoneAlive()) {
			dying = true;
			die_tick += 30 / 1000;
			if (die_tick >= 10) {
				var workers = ['loggers', 'miners', 'hunters'],
					type = Math.floor(Math.random() * 3);
				while (!Data.workers[workers[type]] || Data.workers[workers[type]].length === 0) {
					type = Math.floor(Math.random() * 3);
				}
				Data.workers[workers[type]].pop();
				die_tick = 0;
			}
		} else if (!anyoneAlive()) {
			Data.resources.meat = 0;
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
			top: Math.floor(Math.random()*50) + 20,
			left: i*10
		};
		mountain_positions[i] = pos;
		return pos;
	};

	var mountain_positions = {};
	$scope.random_top = function (i) {
		if (mountain_positions[i]) return mountain_positions[i];
		var pos = Math.floor(Math.random()*50);
		mountain_positions[i] = pos;
		return pos;
	};
})

.controller('DataCtrl', function ($scope, Data) {
	$scope.data = Data;
})

.controller('ResourceCtrl', function ($scope, Data) {
	$scope.chop_wood = function () {
		Data.resources.wood += 1;
	};
	$scope.mine_stone = function () {
		Data.resources.stone += 1;
	};
	$scope.hunt = function () {
		Data.resources.meat += 1;
	};
})

.controller('ManagerCtrl', function ($scope, Data) {

	var spend = function (list) {
		if (!list) return false;

		for (var i = 0; i < list.length; i++) {
			if (Data.resources[list[i].resource] - list[i].amount < 0) {
				return false;
			}
		}

		for (var j = 0; j < list.length; j++) {
			Data.resources[list[j].resource] -= list[j].amount;
		}
		return true;
	};

	$scope.buy_worker = function (worker) {
		if (spend(Data.costs[worker])) {
			Data.workers[worker + 's'].push({
				level: 1
			});
		}
	};

	$scope.buy_building = function (building) {
		if (spend(Data.costs[building])) {

			if (Data.buildings[building]) {
				Data.buildings[building].amount += 1;
			} else {
				Data.buildings[building] = {
					name: building,
					amount: 1
				};
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
})


.filter('integer', function () {
	return function (input) {
		return parseInt(input);
	};
});