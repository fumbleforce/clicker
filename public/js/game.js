angular.module('game', [])


.factory('Data', function () {
	var resources = {
		wood: 0,
		stone: 0,
		meat: 0
	};
	var workers = {
		miners: [],
		loggers: [{
			level: 1
		}],
		hunters: []
	};
	var upgrades = {
		miner_speed: 10,
		logger_speed: 10,
		hunter_speed: 10,

		miner_quantity: 1,
		logger_quantity: 1,
		hunter_quantity: 1
	};

	if (localStorage['clickerSave']) {
		return JSON.parse(localStorage['clickerSave']);
	}

	return {
		resources: resources,
		workers: workers,
		upgrades: upgrades
	};
})

.controller('GameCtrl', function ($scope, $timeout, Data) {
	var woodTimer = 0.0,
		stoneTimer = 0.0,
		meatTimer = 0.0;

	function tick() {
		Data.resources.wood += Data.workers.loggers.length * Data.upgrades.logger_quantity / Data.upgrades.logger_speed;
		Data.resources.stone += Data.workers.miners.length * Data.upgrades.miner_quantity / Data.upgrades.miner_speed;
		Data.resources.meat += Data.workers.hunters.length * Data.upgrades.hunter_quantity / Data.upgrades.hunter_speed;
		$scope.tick = $timeout(tick, 100);
	}

	$timeout(tick, 1000 / 30);

	$scope.start_game = function() {
		$timeout(tick, 1000 / 30);
	};

})

.controller('DataCtrl', function ($scope, Data) {
	$scope.resources = Data.resources;
	$scope.workers = Data.workers;
	$scope.upgrades = Data.upgrades;
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
	$scope.buy_logger = function () {
		Data.workers.loggers.push({
			level: 1
		});
	};
	$scope.buy_miner = function () {
		Data.workers.miners.push({
			level: 1
		});
	};
	$scope.buy_hunter = function () {
		Data.workers.hunters.push({
			level: 1
		});
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