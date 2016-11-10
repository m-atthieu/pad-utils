'use strict';

var app = angular.module('padEvoApp', ['ngResource']);

/* RESOURCES */
app.factory('Monsters', function($resource){
	return $resource('data/monsters.json', {}, {
		all: {
			method: 'GET',
			isArray: true,
			cache: true
		}
	});
});

/* RESOURCES */
app.factory('Evolutions', function($resource){
	return $resource('data/evolutions.json', {}, {
		all: {
			method: 'GET',
			isArray: false,
			cache: true
		}
	});
});

app.controller('MainCtrl', function($scope, Monsters, Evolutions){
	var monsters = {};
	var evolutions = {};
	var r_evolutions = {};
	
	Monsters.all(function(data){
		for(var i = 0; i < data.length; ++i){
			monsters[data[i].id] = data[i];
		}

		Evolutions.all(function(data_){
			evolutions = data_;
			angular.forEach(data_, function(value, key){
				for(var i = 0; i < value.length; ++i){
					var dest = value[i].evolves_to;
					var src = parseInt(key);
					//if()
					if(value[i].evolves_to > parseInt(key)){
						r_evolutions[value[i].evolves_to] = {
							evolves_from: key,
							is_ultimate: value[i].is_ultimate,
							materials: value[i].materials
						};
					}
				}
			});
		});
		
	});

	$scope.monster = {};
	$scope.evolution = {};
	$scope.r_evolution = {};

	$scope.change_id = function(id){
		$scope.monster = monsters[id];
		$scope.evolution = evolutions[id];
		$scope.r_evolution = r_evolutions[id];

		// tree creation
		var chart_config = {
			chart: {
				container: "#tree-simple",
				//node: { collapsable: true }
				connectors: { type: 'step' },
				scrollbar: 'native'
			},
			nodeStructure: make_tree(id)
		};
		var my_chart = new Treant(chart_config, function () {
			console.log('chart done');
		});
	};

	var make_tree = function(id){
		// http://www.padherder.com{{ team[0].image40_href }}
		// http://puzzledragonx.com/en/img/book/3274.png
		var tree = {
			//image: "http://www.padherder.com" + monsters[id].image40_href,
			image: "http://puzzledragonx.com/en/img/book/" + id + ".png",
			link: { href: "http://puzzledragonx.com/en/monster.asp?n=" + id }//,
			//text: { desc: monsters[id].name }
			//connectors: { type: 'step' }
		};
		if(r_evolutions[id]){
			var children = [{
				image: "http://puzzledragonx.com/en/img/book/" + r_evolutions[id].evolves_from + ".png",
				link: { href: "http://puzzledragonx.com/en/monster.asp?n=" + r_evolutions[id].evolves_from },
				//text: { desc: monsters[r_evolutions[id].evolves_from].name },
				children: []
			}];
			for(var i = 0; i < r_evolutions[id].materials.length; ++i){
				for(var j = 0; j < r_evolutions[id].materials[i][1]; ++j){
					var child = make_tree(r_evolutions[id].materials[i][0]);
					children[0].children.push(child);
				}
				
			}
			tree.children = children;
			tree.stackChildren = true;
		}
		return tree;
	};

});