function Bloc(num, tetris)
{
	this.tetris = tetris;
	this.blocs = new Array(); // Contient toutes les cases
	this.blocs_coord = new Array(); // Coordonnées des blocs lors de la descente
	this.MIDDLE_CASE = true; // Permet de déterminer quelle est la case du milieu pour la rotation
	this.color = "",
	this.timer = null,
	this.speed = this.tetris.timer_speed_slow;

	/*
		Shape1 : |_
		Shape2 : _| fe6600
		Shape3 : ¯|_ 7f007f
		Shape4 : _|¯ 0E7B14
		Shape5 : | FC0000
		Shape6 : || FF99C9
		Shape7 : _|_ 0100F6
	*/

	this.set_shape(num);
	for(var i = 0 ; i < this.blocs.length ; i++)
		this.blocs_coord.push({x:0, y:0}); // Initilisation

	var bloc = this;
}

Bloc.prototype = {
	set_shape: function(num) {
		switch(num)
		{
			case 1 :	this.shape1();		break;
			case 2 :	this.shape2();		break;
			case 3 :	this.shape3();		break;
			case 4 :	this.shape4();		break;
			case 5 :	this.shape5();		break;
			case 6 :	this.shape6();		break;
			case 7 :	this.shape7();		break;
		}
	},
	draw: function() { // Dessine le bloc dans "Bloc suivant"
		var t = this.tetris;
		t.context.fillStyle = this.color;
		this.blocs.forEach(function(c) {
			t.context.fillRect(t.canvas.width-110+c.getX()*t.case_w, 110+c.getY()*t.case_w, t.case_w-t.space, t.case_w-t.space);
		});
	},
	placer: function(ligne) { // Place le bloc sur la grille et l'efface de "Bloc suivant"
		// Création du listener pour le déplacement
		window.onkeydown = bind(this, this.move);
		window.onkeyup = bind(this, this.clearTimer);

		if(this.tetris.full_speed)
			this.speed = this.tetris.timer_speed_quick;

		var width = 0,
			height = 0,
			case_depart = 0,
			t = this.tetris,
			l = this.blocs.length,
			perdu = false;

		this.blocs.forEach(function(b) {
			t.context.clearRect(t.canvas.width-110+b.getX()*t.case_w, 110+b.getY()*t.case_w, t.case_w-t.space, t.case_w-t.space);

			if(b.getX() > width)	width = b.getX();
			if(b.getY() > height)	height = b.getY();
		});

		width++; // Incrémentation de x pour avoir le nombre de bloc (le premier bloc a x = 0)
		case_depart = Math.round((ligne.get_nb_cases() - width)/2);

		for(var i = 0 ; i < l ; i++)
		{
			var c = {}, // Coordonnées de la case
				lc = {}; // Coordonnées de la case sur la ligne
			c.x = this.blocs[i].getX();
			c.y = this.blocs[i].getY();

			lc.x = c.x + case_depart;
			lc.y = c.y - height;
			if(lc.y >= 0 && this.tetris.get_cases(lc).is_touched()) // Erreur de placement
				perdu = true;

			this.blocs_coord[i] = lc;
		}

		if(!perdu)
		{
			for(i = 0 ; i < l ; i++)
			{
				if(this.blocs_coord[i].y >= 0)
				ligne.get_cases(this.blocs_coord[i].x).colorier(this.color, t);
			}

			this.setTimer();
		}
		else
		{
			window.onkeydown = null;
			this.tetris.lose();
		}
	},
	descendre: function(blocs) {
		var  l = this.blocs.length, i = 0,
			nb_lignes = this.tetris.get_nb_lignes(),
			coord_tmp = new Array(), coordX = 0, coordY = 0,
			la_case = null;

		for(i = 0 ; i < l ; i++)
		{
			coordX = this.blocs_coord[i].x;
			coordY = this.blocs_coord[i].y +1;

			la_case = this.tetris.get_cases({x:coordX, y:coordY});
			if(!la_case && coordY < nb_lignes) continue;
			else if(coordY >= nb_lignes || la_case.is_touched())
			{
				this.stop();
				return;
			}

		}

		// Le mouvement peût être effectué
		this.reset_cases(l);

		// Dessin des nouvelles cases
		for(i = 0 ; i < l ; i++)
		{
			this.blocs_coord[i].y++;
			la_case = this.tetris.get_cases(this.blocs_coord[i]);	

			if(la_case)
				la_case.colorier(this.color, this.tetris);
		}

		this.setTimer();
	},
	reset_cases: function(l) {
		// Suppression des cases
		for(var i = 0 ; i < l ; i++)
		{
			var la_case = this.tetris.get_cases(this.blocs_coord[i]);
			if(la_case)
				la_case.reset(this.tetris);
		}
	},
	move: function(e) {
		/*
			37 : left
			38 : top
			39 : right
			40 : bottom
			32 : space
		*/

		var code = e.keyCode,
			min_x = 0, max_x = this.tetris.get_ligne(0).get_nb_cases()-1,
			t = this.tetris, l = this.blocs.length, i = 0,
			la_case = null,
			coordX = 0, coordY = 0;

		for(i = 0 ; i < l ; i++)
		{
			var b = this.blocs_coord[i];
			la_case = t.get_cases(b);
			if(b.x-1 < min_x && code == 37 || b.x+1 > max_x && code == 39) return;

			// Le déplacement peut se faire par rapport aux bordures
			coordY = b.y;
			if(code == 37) // Left
				coordX = b.x-1;
			else if(code == 39) // Right
				coordX = b.x+1;

			la_case = this.tetris.get_cases({x:coordX, y:coordY});
			if(la_case && la_case.is_touched() && (code == 37 || code == 39)) return;
		}

		// Reset cases
		for(i = 0 ; i < l ; i++)
		{
			la_case = this.tetris.get_cases(this.blocs_coord[i]);
			if(la_case) la_case.reset(t);
		}

		if(code == 37) // Left
			for(i = 0 ; i < l ; i++)	this.blocs_coord[i].x--;			
		else if(code == 39) // Right
			for(i = 0 ; i < l ; i++)	this.blocs_coord[i].x++;
		else if(code == 38)
			this.rotate();
		else if(code == 40 && this.speed == this.tetris.timer_speed_slow)
		{
			this.tetris.full_speed = true;
			clearTimeout(this.timer); // On enlève le timer
			this.speed = this.tetris.timer_speed_quick;
			this.setTimer();
		}
		// Dessin nouvelles cases
		for(i = 0 ; i < l ; i++)
		{
			la_case = this.tetris.get_cases(this.blocs_coord[i]);
			if(la_case) la_case.colorier(this.color, this.tetris);
		}

		if(code >= 37 && code <= 40)
			e.preventDefault();
	},
	clearTimer: function(e) {
		if(e.keyCode == 40) // Relâche touche haut
		{
			this.speed = this.tetris.timer_speed_slow;
			this.tetris.full_speed = false;
		}
	},
	rotate: function() {
		var coor_mid_case = null,
			blocs_tmp = new Array(),
			l = this.blocs.length,
			coordX = new Array(), coordY = new Array();

		// Coordonnées de la case du milieu
		for(var i = 0 ; i < l ; i++)
		{
			if(this.blocs[i].is_middle_case())
			{
				coor_mid_case = {x:this.blocs_coord[i].x, y:this.blocs_coord[i].y};
				break;
			}
		}

		if(!coor_mid_case) return; // Pour le shape ||

		// Décalage du repère à l'origine de la pièce centrale
		for(i = 0 ; i < l ; i++)
		{
			coordX[i] = this.blocs_coord[i].x - coor_mid_case.x;
			coordY[i] = this.blocs_coord[i].y - coor_mid_case.y;
		}

		// Rotation de la pièce
		for(i = 0 ; i < l ; i++)
		{
			var x_tmp = coordX[i],
				y_tmp = coordY[i],
				r = Math.sqrt(Math.pow(x_tmp,2) + Math.pow(y_tmp,2)),
				cos_a = x_tmp/r;

			if(isNaN(cos_a)) continue; // Pièce centrale
			
			var angle = Math.atan2(y_tmp, x_tmp) - Math.PI/2;

			coordX[i] = -Math.round(r*Math.cos(angle));
			coordY[i] = -Math.round(r*Math.sin(angle));
		}

		// Décalage du repère à l'origine
		var min_x = 0, max_x = this.tetris.get_ligne(0).get_nb_cases()-1, max_x_tmp = max_x;

		for(i = 0 ; i < l ; i++)
		{
			coordX[i] += coor_mid_case.x;
			coordY[i] += coor_mid_case.y;

			if(coordX[i] < min_x)
				min_x = coordX[i];
			else if(coordX[i] > max_x)
				max_x = coordX[i];
		}

		// Remet la pièce dans la grille si elle dépasse après la rotation
		if(min_x < 0) // Bordure gauche
			for(i = 0 ; i < l ; i++) coordX[i] -= min_x;
		else if(max_x != max_x_tmp) // Bordure droite
			for(i = 0 ; i < l ; i++) coordX[i] -= (max_x - max_x_tmp);

		// Test nouvelles coordonnées ok
		for(i = 0 ; i < l ; i++)
		{
			var la_case = this.tetris.get_cases({x:coordX[i] ,y:coordY[i]});
			if(coordY[i] < 0 || (la_case && la_case.is_touched())) return;
		}

		// Nouveau positionnement ok, on effectue la rotation
		for(i = 0 ; i < l ; i++)
		{
			this.blocs_coord[i].x = coordX[i];
			this.blocs_coord[i].y = coordY[i];
		}
	},
	stop: function() {
		var t = this.tetris, array_full_line = new Array();

		window.onkeydown = null;

		this.blocs_coord.forEach(function(coord) {
			if(coord.y >= 0)
				t.get_cases(coord).set_touched(true);
		});

		array_full_line = t.get_full_lines();
		if(!array_full_line)
			t.draw_next();
		else
		{
			setTimeout(function() {
				t.remove_lines();
				t.draw_next();
			}, 5*100);
		}
	},
	setTimer: function() {
		var bloc = this;
		this.timer = setTimeout(function() {
			bloc.descendre(this.blocs);
		}, this.speed);
	},
	shape1: function() {
		this.color = "#FEFD00";
		this.blocs.push(new Case(0, 0, !this.MIDDLE_CASE, this.color));
		this.blocs.push(new Case(0, 1, !this.MIDDLE_CASE, this.color));
		this.blocs.push(new Case(0, 2, this.MIDDLE_CASE, this.color));
		this.blocs.push(new Case(1, 2, !this.MIDDLE_CASE, this.color));
	},
	shape2: function() {
		this.color = "#FE6600";
		this.blocs.push(new Case(1, 0, !this.MIDDLE_CASE, this.color));
		this.blocs.push(new Case(1, 1, !this.MIDDLE_CASE, this.color));
		this.blocs.push(new Case(1, 2, this.MIDDLE_CASE, this.color));
		this.blocs.push(new Case(0, 2, !this.MIDDLE_CASE, this.color));
	},
	shape3: function() {
		this.color = "#7F007F";
		this.blocs.push(new Case(0, 0, !this.MIDDLE_CASE, this.color));
		this.blocs.push(new Case(1, 0, !this.MIDDLE_CASE, this.color));
		this.blocs.push(new Case(1, 1, this.MIDDLE_CASE, this.color));
		this.blocs.push(new Case(2, 1, !this.MIDDLE_CASE, this.color));
	},
	shape4: function() {
		this.color = "#0E7B14";
		this.blocs.push(new Case(0, 1, !this.MIDDLE_CASE, this.color));
		this.blocs.push(new Case(1, 1, this.MIDDLE_CASE, this.color));
		this.blocs.push(new Case(1, 0, !this.MIDDLE_CASE, this.color));
		this.blocs.push(new Case(2, 0, !this.MIDDLE_CASE, this.color));
	},
	shape5: function() {
		this.color = "#FC0000";
		this.blocs.push(new Case(0, 0, !this.MIDDLE_CASE, this.color));
		this.blocs.push(new Case(1, 0, !this.MIDDLE_CASE, this.color));
		this.blocs.push(new Case(2, 0, this.MIDDLE_CASE, this.color));
		this.blocs.push(new Case(3, 0, !this.MIDDLE_CASE, this.color));
	},
	shape6: function() {
		this.color = "#FF99C9";
		this.blocs.push(new Case(0, 0, !this.MIDDLE_CASE, this.color));
		this.blocs.push(new Case(1, 0, !this.MIDDLE_CASE, this.color));
		this.blocs.push(new Case(0, 1, !this.MIDDLE_CASE, this.color));
		this.blocs.push(new Case(1, 1, !this.MIDDLE_CASE, this.color));
	},
	shape7: function() {
		this.color = "#0100F6";
		this.blocs.push(new Case(0, 1, !this.MIDDLE_CASE, this.color));
		this.blocs.push(new Case(1, 1, this.MIDDLE_CASE, this.color));
		this.blocs.push(new Case(1, 0, !this.MIDDLE_CASE, this.color));
		this.blocs.push(new Case(2, 1, !this.MIDDLE_CASE, this.color));
	}
}