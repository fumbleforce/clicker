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
	workers = {
		miners: [],
		loggers: [],
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
	buildings = {
	},
	costs = {
		miner: 100,
		hunter: 100,
		logger: 100,

		hunger: 0.3
	},
	town_name = "My Town";

	return {
		resources: resources,
		workers: workers,
		upgrades: upgrades,
		costs: costs,
		buildings: buildings,
		town_name:town_name
	};
})

.controller('GameCtrl', function ($scope, $timeout, Data) {
	var woodTimer = 0.0,
		stoneTimer = 0.0,
		meatTimer = 0.0;

	function tick() {
		Data.resources.wood += (Data.workers.loggers.length * Data.upgrades.logger_quantity) / (Data.upgrades.logger_speed * fps);
		Data.resources.stone += (Data.workers.miners.length * Data.upgrades.miner_quantity) / (Data.upgrades.miner_speed * fps);
		Data.resources.meat += (Data.workers.hunters.length * Data.upgrades.hunter_quantity) / (Data.upgrades.hunter_speed * fps);

		Data.resources.meat -= Data.hunger * (Data.workers.miners.length + Data.workers.loggers.length + Data.workers.hunters.length) / 30;

		$scope.tick = $timeout(tick, 1000 / fps);
	}
	$timeout(tick, 1000 / fps);
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

	var spend = function(rec, amount) {
		if (Data.resources[rec] - amount < 0) return false;
		Data.resources[rec] -= amount;
		return true;
	};

	$scope.buy_worker = function (worker) {
		if (spend('meat', Data.costs[worker])) {
			Data.workers[worker+'s'].push({
				level: 1
			});
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