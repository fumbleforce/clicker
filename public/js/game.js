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

	return {
		resources: {
			wood: 0,
			stone: 0,
			food: 0
		},
		inventory: {},
		upgrades: {
			miner_speed: 10,
			logger_speed: 10,
			hunter_speed: 10,
			miner_speed_factor: 1,
			logger_speed_factor: 1,
			hunter_speed_factor: 1,

			miner_quantity: 1,
			logger_quantity: 1,
			hunter_quantity: 1,
			
		},
		buildings: {
			hovel: {
				name: "Hovel",
				cost: [{
					resource: 'wood',
					amount: 100
				}],
				owned: 0,
                key: "hovel",
				desc: 'Basic housing. Room for 3 people',
				positions: [],
			},
            /*
			forge: {
				name: "Forge",
				cost: [{
					resource: 'wood',
					amount: 100
				}],
				owned: 0,
                key: "forge",
				desc: 'Improves resource gathering rate of stone by 10%',
				positions: [],
			},
            */
            well: {
                name: "Well",
                cost: [{
                    resource: 'stone',
                    amount: 100
                }],
                owned: 0,
                key: "well",
                desc: 'Provides villagers with water. Keeps 10 more villagers from dying of thirst.',
                positions: [],
            },
            camp: {
                name: "Hunter Camp",
                cost: [{
                    resource: 'wood',
                    amount: 100
                }],
                owned: 0,
                key: "camp",
                desc: 'Improves food gathering rate by 10%',
                positions: [],
            },
			town_center: {
				name: "Town Center",
				cost: [{
					resource: 'wood',
					amount: 100
				}],
				owned: 0,
                key: "town_center",
				desc: 'The heart of the city. Is pretty.',
				positions: [],
			},
            /*
			logging_camp: {
				name: "Logging Camp",
				cost: [{
					resource: 'wood',
					amount: 100
				}],
				owned: 0,
                key: "logging_camp",
				desc: 'Improves wood quantity gathered by 10%',
				positions: [],
			},
            */
			mill: {
				name: "Mill",
				cost: [{
					resource: 'wood',
					amount: 100
				}],
				owned: 0,
                key: "mill",
				desc: 'Improves the yield of crops by 10%',
				positions: [],
			},
			farm: {
				name: "Farm",
				cost: [{
					resource: 'wood',
					amount: 100
				}, {
					resource: 'stone',
					amount: 100
				}],
				owned: 0,
                key: "farm",
				desc: 'Slowly generates food',
				positions: [],
			},
            warehouse: {
                name: "Warehouse",
                cost: [{
                    resource: 'wood',
                    amount: 200
                }, {
                    resource: 'stone',
                    amount: 200
                }],
                owned: 0,
                key: "farm",
                desc: 'Stores resources so they don\'t spoil. Increases capacity by 100',
                positions: [],
            },
            /*
			butchery: {
				name: "Butchery",
				cost: [{
					resource: 'wood',
					amount: 100
				}],
				owned: 0,
                key: "butchery",
				desc: 'Improves the quality of meat resources. Meat yield increases by 10%',
				positions: [],
			},
            */
			blacksmith: {
				name: "Blacksmith",
				cost: [{
					resource: 'wood',
					amount: 1
				}],
				owned: 0,
                key: "blacksmith",
				desc: 'Ability to create tools.',
				positions: [],
			}
		},
		units: {
			cost: [{
				resource: 'food',
				amount: 10
			}],
			population: 9,
			hunger: 0.03,

			labour: {
				miner: {
					name: "Miner",
					active: 3,
					desc: "Mines stone",
				},
				hunter: {
					name: "Hunter",
					active: 3,
					desc: "Hunts animals for food",
				},
				logger: {
					name: "Lumberjack",
					active: 3,
					desc: "Chops wood"
				},
			}
		},
		town_name: "My Town"
	};
})


/* Resource Service
 *
 * Handles functions related to resources
 */
.service('Resource', function (Data, Unit) {
	
	function afford (list) {
		for (var i = 0; i < list.length; i++) {
			if (Data.resources[list[i].resource] - list[i].amount < 0) {
				return false;
			}
		}
		return true;
	}
	this.afford = afford;

	this.spend = function (list) {
		if (!list) return false;

		if (!afford(list)) return false;

		for (var j = 0; j < list.length; j++) {
			Data.resources[list[j].resource] -= list[j].amount;
		}
		return true;
	};

	this.mine = function () {
		Data.resources.stone++;
	};

	this.chop = function () {
		Data.resources.wood++;
	};

	this.hunt = function () {
		Data.resources.food += 10;
	};

	this.add_resource = function(rec, amount) {
		Data.resources[rec] += amount;
	};

	this.eat = function() {
		Data.resources.food -= Data.units.hunger * Unit.population() / 30;
	};

	this.set = function (rec, val) { Data.resources[rec] = val; };

	this.get = function (rec) {
		return Data.resources[rec];
	};

})


/* Game Service
 *
 * Handles game effects
 */
.service('Game', function (Data) {

	this.add_building_effect = function (building) {
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

    this.town = {
        width: 350,
        height: 300,
    };
})

.service("Upgrade", function(Data) {

	this.get = function(item) {
		if (item in Data.upgrades) {
			return Data.upgrades[item];
		}
	};
})


/* Unit Service
 *
 * Handles units
 */
.service('Unit', function (Data) {

	var labour = ['logger', 'miner', 'hunter'],
		Unit = this;


	// Number of free villager
	function free() {
		var active = 0;
		_.each(labour, function(l) {
			active += Data.units.labour[l].active;
		});

		return population() - active;
	}
	this.free = free;


	// Total population number
	function population() {
		return Data.units.population;
	}
	this.population = population;


	// Assign a villager to a task
	this.assign = function (l) {
		if (free() > 0)
			Data.units.labour[l].active++;
	};

	// De-assign a villager from a task
	this.deassign = function (l) {
		console.log(l);
		if (Data.units.labour[l].active > 0)
			Data.units.labour[l].active--;
	};

	this.add_villager = function() {
		console.log('added villager');
		Data.units.population++;
	};

	this.anyone_alive = function() {
		return population() > 0;
	};

	this.increase_cost = function() {
		Data.units.cost[0].amount += 10;
	};

	this.cost = function() {
		return Data.units.cost;
	};

	this.die = function(labour) {
		var workers = _.keys(Data,units.labour),
			type = Math.floor(Math.random() * 3);

		if (!labour) {

			while (Unit.get(type) === 0) {
				type = Math.floor(Math.random() * 3);
			}
			labour = type;

		}

		Data.units.labour[labour].active--;
		Data.units.pupulation--;
	};

    this.move = function() {
        var mod, scale, width, height, type;

        _.each(Data.animals, function(a) {
            if (!a.direction) {
                a.direction = {dist:0};
            }

            if (a.direction.dist <= 0) {
                a.direction.dist = Math.floor(Math.random() * 20) + 1;
                mod = Math.random();
                a.direction.x = (Math.random() < 0.5 ? -1 : 1) * mod;
                mod = Math.random();
                a.direction.y = (Math.random() < 0.5 ? -1 : 1) * mod;
            }

            a.x += a.direction.x;
            a.y += a.direction.y;

            scale = a.y/1080.0;
            type = a.type;
            if (type == 1) {
                width = 50 * scale;
                height = 50 * scale;
            } else {
                width = 25 * scale;
                height = 25 * scale;
            }

            $('#'+a.id).css({
                left: a.x + 'px',
                top: a.y + 'px',
                'z-index': Math.floor(a.y),
                
            }).find('img').css({
                width: width,
                height: height
            });

            a.direction.dist -= 1;
        });
    };

    var regrowTick = 0;

    this.regrow = function () {
        if (regrowTick > 10) {
            regrowTick = 0;
        }

        if (Data.animals.length > 50) {

        }

        regrowTick++;
    };

	this.is_unit = function(item) {
		return (item in Data.units.labour || item === 'villager');
	};

	this.miners = function() { return Data.units.labour.miner.active; };
	this.hunters = function() { return Data.units.labour.hunter.active; };
	this.loggers = function() { return Data.units.labour.logger.active; };
	this.get = function(labour) { return Data.units.labour[labour].active; };
})


.service('Building', function(Data, Game) {

	this.add_building = function(building) {
		Data.buildings[building].owned++;
        var x = Math.floor(Math.random()*Game.town.width),
            y = Math.floor(Math.random()*Game.town.height),
            scale = 1/y,
            width = 30 + y*0.2,
            height = 30  + y*0.2;
        y -= height;
        x -= width;
        Data.buildings[building].positions.push({
            x: x,
            y: y,
            width: width,
            height: height
        });
		Game.add_building_effect(building);
	};

	this.increase_cost = function(building) {
		for (var i = 0; i < Data.buildings[building].cost.length; i++) {
			Data.buildings[building].cost[i].amount *= 2;
		}
	};

	this.cost = function(item) {
		if (item in Data.buildings) {
			return Data.buildings[item].cost;
		}
	};

	this.is_building = function (item) {
		return (item in Data.buildings);
	};

	this.get = function(b) { return Data.buildings[b]; };
})


/* Market Service
 *
 * Handles buying and selling of items
 */
.service('Market', function (Unit, Building, Resource, Game, Upgrade) {

	this.buy_villager = function () {
		if (Resource.spend( Unit.cost('villager') )) {
			Unit.increase_cost();
			Unit.add_villager();
			return true;
		}
		return false;
	};

	this.buy_building = function (building) {
		if (Resource.spend(Building.cost(building))) {
			
			Building.add_building(building);
			Building.increase_cost(building);
			
		}
	};
})


.service("Time", function(Resource, Unit, Upgrade, $timeout) {

	var t,
		wood_timer = 0.0,
		stone_timer = 0.0,
		food_timer = 0.0,
		die_tick = 0,
		dying = false;

	
	function tick() {

		Resource.add_resource('wood',
			(Unit.loggers() * Upgrade.get('logger_quantity')) /
			(Upgrade.get('logger_speed') *
				Upgrade.get('logger_speed_factor') * fps));

		Resource.add_resource('stone',
			(Unit.miners() * Upgrade.get('miner_quantity')) /
			(Upgrade.get('miner_speed') *
				Upgrade.get('miner_speed_factor') * fps));

		Resource.add_resource('food',
			(Unit.hunters() * Upgrade.get('hunter_quantity')) /
			(Upgrade.get('hunter_speed') *
				Upgrade.get('hunter_speed_factor') * fps));

		// Eat
		if (Unit.anyone_alive())
			Resource.eat();
			
		// Start dying if no food
		if (Resource.get('food') <= -1 && Unit.anyone_alive()) {
			
			dying = true;
			die_tick += 30 / 1000;

			if (die_tick >= 10) {
				Unit.die();
				die_tick = 0;
			}

		} else if (!Unit.anyone_alive()) {

			Resource.set('food', 0);
			dying = false;
			die_tick = 0;

		} else {

			dying = false;
			die_tick = 0;

		}

        Unit.move();
        Unit.regrow();

		t = $timeout(tick, 1000 / fps);
	}

	this.start = function () {
		console.log('Time started');
		$timeout(tick, 1000 / fps);
	};
	

})


/* Game Controller
 *
 * Starts the time and constructs board
 */
.controller('GameCtrl', function ($scope, Time, Data) {
	
	Time.start();
	
	// Allows ng-repeat to iterate over a given number of items
	$scope.getNumber = function (num) {
		return new Array(num);
	};

	$scope.buildings = Data.buildings;
	$scope.units = Data.units.labour;

})


/* Data Controller
 *
 * Exposes the Data service to the view
 */
.controller('ResourceDisplayCtrl', function ($scope, Data) {
	$scope.resources = Data.resources;
	$scope.wood = Data.resources.wood;
	$scope.stone = Data.resources.stone;
	$scope.food = Data.resources.food;
})



/* Resource Controller
 *
 * Handles resource functions in the game window, such as clicking
 */
.controller('ResourceCtrl', function ($scope, Resource, Data) {
	$scope.chop_wood = function () {
		Resource.chop();
	};
	$scope.mine_stone = function () {
		Resource.mine();
	};
	$scope.hunt = function (id) {
		Resource.hunt();
        var index = _.find(Data.animals, function(a) { return a.id === id; });
        Data.animals.splice(index, 1);
        $('#'+id).remove();
	};
    $scope.buildings = Data.buildings;
})


/* Management Controller
 *
 * Handles the management window of the village.
 */
.controller('ManagerCtrl', function ($scope, Market, Resource, Building, Unit, Data) {

	var town = {
		left: '600',
		right: '800',
		top: '600',
		bot: '800'
	};

	$scope.town = town;
	$scope.select = false;

	$scope.buy_villager = function () {
		
        Market.buy_villager();
        $scope.population = Unit.population();
        $scope.free = Unit.free();
	};

	$scope.buy_building = function (building) {
		Market.buy_building(building);
	};

	$scope.assign = function(unit) {
		Unit.assign(unit);
        $scope.population = Unit.population();
        $scope.free = Unit.free();
	};
	$scope.deassign = function(unit) {
		Unit.deassign(unit);
        $scope.population = Unit.population();
        $scope.free = Unit.free();
	};

	$scope.population = Data.units.population;
	$scope.free = Unit.free();

	$scope.save = function () {
		var d = JSON.stringify(Data);
		localStorage['clickerSave'] = d;
	};

	$scope.new_game = function () {
		localStorage['clickerSave'] = '';
		window.location.reload(false);
	};

	$scope.can_afford = function (item) {
		if ( Building.is_building(item) ) return Resource.afford( Building.cost(item) );
		else if ( Unit.is_unit(item) ) return Resource.afford( Unit.cost() );
		else return false;
	};

	$scope.select_building = function(b) {
		$scope.select = Building.get(b);
		$scope.select.key = b;
	};
})


/* Toggle Description
 *
 * Shows element with 'desc' class in a container
 */
.directive('toggle_desc', function ($document) {
	return function (scope, elem, attr) {
		elem.bind('click', function () {
			var desc = elem.find('.desc');
			desc.css({
				'display': 'block'
			});
		});
	};
})


.directive('movable', ['$rootScope',
	function ($rootScope) {
		return {
			restrict: 'A',
			link: function (scope, el, attrs, controller) {
				console.log("linking draggable element");

				angular.element(el).attr("draggable", "true");
				var id = attrs.id;
				if (!attrs.id) {
					id = '123';
					angular.element(el).attr("id", id);
				}

				el.bind("dragstart", function (e) {
					e.dataTransfer.setData('text', id);

					$rootScope.$emit("LVL-DRAG-START");
				});

				el.bind("dragend", function (e) {
					$rootScope.$emit("LVL-DRAG-END");
				});
			}
		};
	}
])



.directive('forest', function($compile) {
	return {
		restrict: "E",
		replace: false,
        scope: true,
        compile: function (element, attrs) {
            var i, type, x, y,
                left = ~~attrs.left,
                right = ~~attrs.right,
                bot = ~~attrs.bot,
                top = ~~attrs.top,
                density = 100/~~attrs.density,
                num = (right-left)/density,
                scale = top/1080.0,
                width = 60 * scale,
                height = 100 * scale,
                trees = [];

            for (i = 0; i < num; i++) {
				type = Math.floor(Math.random() * 3)+ 1;
				y = Math.floor(Math.random() * (bot-top)) + top;
				x = ((right-left)/num)*i + left;
				tree = '<button class="tree resource" ng-click="chop_wood()"' +
                    'style="top:' + y + 'px;' +
                    'left:' + x + 'px;' +
                    'z-index:' + y + '">' +
                    '<img '+
                        'width="' + width + '"' +
                        'height="' + height + '"'+
                        'src="/img/tree' + type + '.png">' +
                    '</img></button>';
                element.append(tree);
			}
        }
    };
})

.directive('mountains', function($compile) {
    return {
        restrict: "E",
        replace: false,
        scope: true,
        compile: function (element, attrs) {
            var i, type, x, y,
                left = ~~attrs.left,
                right = ~~attrs.right,
                bot = ~~attrs.bot,
                top = ~~attrs.top,
                density = 10,
                num = (right-left)/density,
                mountains = [];

            for (i = 0; i < num; i++) {
                
                y = Math.floor(Math.random() * (bot-top))+ top;
                x = ((right-left)/num)*i + left;
                type = Math.floor(Math.random() * 2)+ 1;

                scale = Math.abs(y - (1080.0/2)) / (1080.0/2) ;
                width = 100 * scale;
                height = 100 * scale;
                
                tree = '<button class="stone resource" ng-click="mine_stone()"' +
                    'style="top:' + y + 'px;' +
                    'left:' + x + 'px;' +
                    'z-index:' + y + '">' +
                    '<img '+
                        'width="' + width + '"' +
                        'height="' + height + 'px"'+
                        'src="/img/mnt' + type + '.png">' +
                    '</img></button>';
                element.append(tree);
            }
        }
    };
})

.directive('wildlife', function($compile, Data) {

    function add_animal(el, left, right, top, bot) {
        if (!Data.animals) Data.animals = [];

        var animal, scale, width, height, id;

        y = Math.floor(Math.random() * (bot-top))+ top;
        x = Math.floor(Math.random() * (right-left)) + left;
        type = Math.floor(Math.random() * 2)+ 1;
        scale = top/1080.0;

        if (type == 1) {
            width = 100 * scale;
            height = 100 * scale;
        } else {
            width = 50 * scale;
            height = 50 * scale;
        }

        id = Math.random().toString(36).substring(7);
        
        animal = '<button '+
            'id="'+id+'"'+
            'class="food resource" ng-click="hunt(\''+id+'\')"' +
            'style="top:' + y + 'px;' +
            'left:' + x + 'px;' +
            'z-index:' + y + '">' +
            '<img '+
                'width="' + width + '"' +
                'height="' + height + 'px"'+
                'src="/img/animal' + type + '.png">' +
            '</img></button>';
        el.append(animal);
        Data.animals.push({
            width: width,
            height: height,
            x: x,
            y: y,
            scale: scale,
            type: type,
            id: id
        });
    }

    return {
        restrict: "E",
        replace: false,
        scope: true,
        compile: function (element, attrs) {
            var i, type, x, y,
                left = ~~attrs.left,
                right = ~~attrs.right,
                bot = ~~attrs.bot,
                top = ~~attrs.top,
                density = 10,
                num = (right-left)/density;

            for (i = 0; i < num; i++) {
                add_animal(element, left, right, top, bot);
            }

            return function postLink($scope, $element, attrs) {

            };
        }
    };
})

.directive('building', function() {
    return {
        restrict: "E",
        replace: false,
        compile: function (element, attrs) {

            element.css({
                display:'block',
                'z-index':300,
                position:'absolute'
            });

            return function postLink($scope, $element, attrs) {
                var holding = false,
                    l, t;

                $element.hover(function(e) {
                    $element.css('opacity', 0.9);
                }, function() {
                    $element.css('opacity', 1);
                });

                $element.mousedown(function(e) {
                    e.preventDefault();
                    holding = true;
                });
                $element.mouseup(function(e) {
                    e.preventDefault();
                    holding = false;
                });
                $element.mousemove(function(e) {
                    e.preventDefault();
                    if (holding) {
                        l = e.pageX - $element.parent().offset().left - $element.width()/2;
                        t = e.pageY - $element.parent().offset().top - $element.height()/2;
                        $element.css({
                            left: l,
                            top: t,
                        });
                    }
                });
                $element.mouseleave(function(e) {
                    e.preventDefault();
                    holding = false;
                });
            };
        }
    };
})

.directive("menu", function() {
    return {
        restrict: "E",
        replace:true,
        controller: "ManagerCtrl",
        templateUrl: "/html/menu.html",
    };
})
.directive("map", function() {
    return {
        restrict: "E",
        replace:true,
        controller: "ResourceCtrl",
        templateUrl: "/html/map.html",
    };
})

.directive("town", function(Game) {
    return {
        restrict: "E",
        controller: "",
        templateUrl: "/html/town.html",
        compile: function ($element, attrs) {
            var x = ~~attrs.left,
                y = ~~attrs.top,
                height = Game.town.height,
                width = Game.town.width;

            $element.css({
                top: y+'px',
                left: x+'px',
                height: height+'px',
                width:width+'px',
                display:'block',
                border:'1px dashed black',
                'z-index':300,
                position:'absolute'
            });
        }
    };
})


/* Integer filter
 *
 * Turns input into an integer
 */
.filter('integer', function () {
	return function (input) {
		return parseInt(input, 10);
	};
});


$('button').on('dragstart', function(event) { event.preventDefault(); return false; });
$('img').on('dragstart', function(event) { event.preventDefault(); return false; });
window.ondragstart = function() { return false; };