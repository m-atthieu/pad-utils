'use strict';

var app = angular.module('padCalcApp', ['ngResource']);

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

app.factory('Awakenings', function($resource){
	return $resource('data/awakenings.json', {}, {
		all: {
			method: 'GET',
			isArray: true,
			cache: true
		}
	});
});

app.factory('LeaderSkills', function($resource){
	return $resource('data/leader_skills.json', {}, {
		all: {
			method: 'GET',
			isArray: true,
			cache: true
		}
	});
});


app.constant('Constants', {
	Attr: {
		0: 'Fire',
		1: 'Water',
		2: 'Wood',
		3: 'Light',
		4: 'Dark'
	},
	RAttr: {
		'Fire': 0,
		'Water': 1,
		'Wood': 2,
		'Light': 3,
		'Dark': 4
	}
});

/* CONTROLLERS */
app.controller('MainCtrl', function($scope, Monsters, Awakenings, LeaderSkills, Constants){
	var monsters = {};
	var awakenings = {};
	var leader_skills = {};
	
	$scope.team = [undefined, undefined, undefined, undefined, undefined, undefined];
	$scope.team_var = {
		id:    [undefined, undefined, undefined, undefined, undefined, undefined],
		level: [undefined, undefined, undefined, undefined, undefined, undefined],
		awkn: {
			hp:  [undefined, undefined, undefined, undefined, undefined, undefined],
			atk: [undefined, undefined, undefined, undefined, undefined, undefined],
			rcv: [undefined, undefined, undefined, undefined, undefined, undefined],
			tpa: [undefined, undefined, undefined, undefined, undefined, undefined]
		},
		eggs: {
			hp:  [undefined, undefined, undefined, undefined, undefined, undefined],
			atk: [undefined, undefined, undefined, undefined, undefined, undefined],
			rcv: [undefined, undefined, undefined, undefined, undefined, undefined]
		},
		latent: {
			hp:  [undefined, undefined, undefined, undefined, undefined, undefined],
			atk: [undefined, undefined, undefined, undefined, undefined, undefined],
			rcv: [undefined, undefined, undefined, undefined, undefined, undefined]
		},

	};
	
	$scope.board_var = {
		awkn: {
			oe:  { Fire: undefined, Water: undefined, Wood: undefined, Light: undefined, Dark: undefined },
			row: { Fire: undefined, Water: undefined, Wood: undefined, Light: undefined, Dark: undefined }
		},
		atk_mult: { leader: 1, friend: 1, as: 1 },
		oe:   { Fire: undefined, Water: undefined, Wood: undefined, Light: undefined, Dark: undefined },
		rows: { Fire: undefined, Water: undefined, Wood: undefined, Light: undefined, Dark: undefined },
		combo: {
			 3: { Fire: undefined, Water: undefined,  Wood: undefined, Light: undefined, Dark: undefined },
			 4: { Fire: undefined, Water: undefined,  Wood: undefined, Light: undefined, Dark: undefined },
			 5: { Fire: undefined, Water: undefined,  Wood: undefined, Light: undefined, Dark: undefined },
			 6: { Fire: undefined, Water: undefined,  Wood: undefined, Light: undefined, Dark: undefined },
			 7: { Fire: undefined, Water: undefined,  Wood: undefined, Light: undefined, Dark: undefined },
			30: { Fire: undefined, Water: undefined,  Wood: undefined, Light: undefined, Dark: undefined }
		},
		enemy: {
			attr: undefined,
			defense: 0
		},
		nb_cmb: function(){
			var s = 0;
			for(var i = 3; i <= 30; ++i){
				if(this.combo[i]){
					s += (this.combo[i].Fire  || 0);
					s += (this.combo[i].Water || 0);
					s += (this.combo[i].Wood  || 0);
					s += (this.combo[i].Light || 0);
					s += (this.combo[i].Dark  || 0);
				}
			}
			return s;
		}
	};

	LeaderSkills.all(function(data){ 
		for(var i = 0; i < data.length; ++i){
			leader_skills[data[i].name] = data[i];
		}
		console.log('leader skill list created');
	});

	Awakenings.all(function(data){
		for(var i = 0; i < data.length; ++i){
			awakenings[data[i].id] = data[i];
		}
		console.log('awakenings list created');
	});

	Monsters.all(function(data){
		for(var i = 0; i < data.length; ++i){
			monsters[data[i].id] = data[i];
			monsters[data[i].id].element = Constants.Attr[monsters[data[i].id].element];
			monsters[data[i].id].element2 = Constants.Attr[monsters[data[i].id].element2];
			monsters[data[i].id].max_tpa = function(){
				var s = 0;
				for(var i = 0; i < this.awoken_skills.length; ++i){
					if(awakenings[this.awoken_skills[i]].name == "Two-Pronged Attack"){ ++s; }
				}
				return s;
			};
			monsters[data[i].id].max_oe = function(attr){
				var s = 0;
				for(var i = 0; i < this.awoken_skills.length; ++i){
					if(awakenings[this.awoken_skills[i]].name == "Enhanced " + attr + " Orbs"){ ++s; }
				}
				return s;
			};
			monsters[data[i].id].max_re = function(attr){
				var s = 0;
				for(var i = 0; i < this.awoken_skills.length; ++i){
					if(awakenings[this.awoken_skills[i]].name == "Enhanced " + attr + " Att."){ ++s; }
				}
				return s;
			};
		}
		console.log('monsters list created');
	});
	
	$scope.change_id = function(index){
		$scope.team[index] = monsters[$scope.team_var.id[index]];
		// change leader effect multiplier
		var get_atk_mult = function(_index){
			if(! $scope.team[_index]){ return 1; }
			if($scope.team[_index].leader_skill && $scope.team[_index].leader_skill != null
				&& leader_skills[$scope.team[_index].leader_skill].data
				&& leader_skills[$scope.team[_index].leader_skill].data.length >= 2)
			{
				return leader_skills[$scope.team[_index].leader_skill].data[1];
			} else {
				return 1;
			}
			
		}
		if(index == 0 || index == 5){
			var m = get_atk_mult(index);
			var s = index == 0 ? 'leader': 'friend'
			if(m){
				$scope.board_var.atk_mult[s] = m;
			}
		}
	};

	var leader_skill_effect = function(index){
		if(! $scope.team[index] || $scope.team[index].leader_skill == null){ return ''; }
		return leader_skills[$scope.team[index].leader_skill].effect;
	}

	$scope.get_leader_skill = function(){
		return leader_skill_effect(0);
	};

	$scope.get_friend_leader_skill = function(){
		return leader_skill_effect(5);
	};

	$scope.max_tpa = function(index){
		return $scope.team[index] ? $scope.team[index].max_tpa(): '';
	};

	$scope.max_oe = function(attr){
		var s = 0;
		for(var i = 0; i < 6; ++i){ if($scope.team[i]){ s += $scope.team[i].max_oe(attr); } }
		return s;
	};

	$scope.max_re = function(attr){
		var s = 0;
		for(var i = 0; i < 6; ++i){ if($scope.team[i]){ s += $scope.team[i].max_re(attr); } }
		return s;
	}

	$scope.base_dmg = function(attr){
		var base_base_dmg = function(index){
			if(! $scope.team[index]){ return 0; }
			var monster = $scope.team[index];
			var atk = $scope.calc_stat('atk', index);
			if(monster.element == attr && monster.element2 == attr){
				return atk * 1.1;
			} else if(monster.element == attr){
				return atk;
			} else if(monster.element2 == attr){
				return atk / 3.0;
			} else { 
				return 0; 
			}
		};
		var sum = 0;
		for(var i = 0; i < 6; ++i){
			sum += base_base_dmg(i);
		}
		return Math.round(sum);
	};

	$scope.calc_stat = function(stat, index){
		if(! $scope.team[index]){ return undefined; }
		var monster = $scope.team[index];
		if(! monster){ return undefined; }
		var egg_bonus = { hp: 10, atk: 5, rcv: 3 };
		var awk_bonus = { hp: 200, atk: 100, rcv: 50 };
		var lat_bonus = { hp: 0.015, atk: 0.01, rcv: 0.04 };
		var latent = $scope.team_var.latent[stat][index] || 0;
		var eggs   = $scope.team_var.eggs[stat][index] || 0;
		var awkn   = $scope.team_var.awkn[stat][index] || 0;
		var lvl    = $scope.team_var.level[index]    || 1;
		var min = monster[stat + '_min'];
		var max = monster[stat + '_max'];
		var scale = monster[stat + '_scale'];
		var p1 = min + (max - min) * Math.pow((lvl - 1) / (monster.max_level - 1), scale) * (1 + latent * lat_bonus[stat]) ;
		var p2 = eggs * egg_bonus[stat];
		var p3 = awkn * awk_bonus[stat];
		return Math.round(p1 + p2 + p3);
	};

	$scope.individual_dmg_old = function(index, main_or_sub){
		if(! $scope.team[index]){ return 0; }

		var atk = $scope.calc_stat('atk', index);
		var el = (main_or_sub == 'main') ? $scope.team[index].element: $scope.team[index].element2;
		var sum = 0;
		for(var i = 3; i <= 30; ++i){
			var c = nb_cmb(i, el);
			var norb_coeff = c * (1 + ((i - 3) * 0.25));
			var atk_i = atk * norb_coeff;
			var coeff = 1;
			if(main_or_sub == 'sub'){
				if($scope.team[index].element == $scope.team[index].element2){ 
					coeff = 0.1;
				} else {
					coeff = 1 / 3.;
				}
			}
			sum += (atk_i * coeff);
		}
		
		return Math.round(sum);
	};

	$scope.individual_dmg = function(index, main_or_sub){
		if(! $scope.team[index]){ return 0; }

		var skills = $scope.board_var.atk_mult.leader * $scope.board_var.atk_mult.friend * $scope.board_var.atk_mult.as;
		var _nb_cmb = $scope.board_var.nb_cmb();
		var board_contribution = (_nb_cmb == 0) ? 1: 1 + ((_nb_cmb - 1) / 4);

		var attr = (main_or_sub == 'main') ? $scope.team[index].element: $scope.team[index].element2;
		var ri = $scope.board_var.rows[attr] || 0;
		var ra = $scope.board_var.awkn.row[attr] || 0;
		var row_enhance_skills = 1 + (0.1 * ri * ra);
		var resulting_multiplier = skills * board_contribution * row_enhance_skills;
		//console.log('attr:', attr, 'ri:', ri, 'ra:', ra, 'res:', row_enhance_skills, 'rm:', resulting_multiplier, 'skills:', skills, 'bc:', board_contribution);
		var s = 0;
		for(var i = 3; i <= 30; ++i){
			// if(i != 3){ continue; } // debug
			var c = nb_cmb(i, attr);
			var nie = i * (($scope.board_var.awkn.oe[attr] || 0) * 0.2);
			if(nie > i){ nie = i; }
			var nia = $scope.board_var.awkn.oe[attr] || 0;
			var eo = (1 + (0.06 * nie)) * (nie >= 1? 1 + (0.05 * nia): 1);
			var cmb = 1 + ((i - 3) / 4);
			var tpa = (i == 4) ? Math.pow(1.5, $scope.team_var.awkn.tpa[index] || 0): 1;
			var xi = eo * cmb * tpa;
			//console.log('i', i, 'c', c, 'nie', nie, 'nia', nia, 'eo', eo, 'cmb', cmb, 'tpa', tpa, 'xi', xi);
			s += (c * xi);
		}
		var atk = $scope.calc_stat('atk', index);
		var coeff = 1;
		if(main_or_sub == 'sub'){
			if($scope.team[index].element == $scope.team[index].element2){ 
				coeff = 0.1;
			} else {
				coeff = 1 / 3.;
			}
		}
		var resistance = 1;
		var dmg = resistance * resulting_multiplier * s * atk * coeff;
		return Math.round(dmg);
	}

	$scope.total_dmg = function(attr, with_resistance)
	{
		with_resistance = with_resistance || false;
		var enemy_attr_coeff = function(card_attr, enemy_attr){
			var c = card_attr + '-against-' + enemy_attr;
			switch(c){
				case 'Fire-against-Wood':
				case 'Water-against-Fire':
				case 'Wood-against-Water':
				case 'Light-against-Dark':
				case 'Dark-against-Light':
					return 2;
				case 'Fire-against-Water':
				case 'Water-against-Wood':
				case 'Wood-against-Fire':
					return 0.5;
				default: 
					return 1;
			}
		}
		var s = 0;
		var resistance = 1;
		for(var i = 0; i < 6; ++i){
			if(! $scope.team[i]){ continue; }
			if($scope.team[i].element == attr){
				resistance = with_resistance ? enemy_attr_coeff($scope.team[i].element, $scope.board_var.enemy.attr): 1;
				s += (resistance * $scope.individual_dmg(i, 'main') - $scope.board_var.enemy.defense);
			}
			if($scope.team[i].element2 == attr){
				resistance = with_resistance ? enemy_attr_coeff($scope.team[i].element2, $scope.board_var.enemy.attr): 1;
				s += (resistance * $scope.individual_dmg(i, 'sub') - $scope.board_var.enemy.defense);
			}
		}
		return s;
	}

	var nb_cmb = function(orbs, el){
		return $scope.board_var.combo[orbs] ? $scope.board_var.combo[orbs][el] || 0: 0;
	};
});