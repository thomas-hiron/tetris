function Tetris(c)
{
	this.canvas = c;
	this.context = canvas.getContext("2d");
	this.case_w = 25; // Largeur de la case
	this.space = 1; // Espace entre les cases
	this.next_bloc = null;
	this.lignes = new Array();
	this.default_color = "#eee",
	this.timer_speed_slow = 800, // Timer slow/quick
	this.timer_speed_quick = 50; // Timer slow/quick
	this.score = 0;
	this.full_speed = false;
}

Tetris.prototype = {
	draw_grid: function() {
		this.context.clearRect(0, 0, (this.case_w+this.space)*10, (this.case_w+this.space)*20);
		this.context.fillStyle = this.default_color;

		for(var i = 0 ; i < 20 ; i++) // Lignes
		{
			this.lignes.push(new Ligne(i, this.default_color, this));
			this.lignes[i].draw(this.context, i, this.case_w, this.space);
		}
	},
	draw_score: function() {
		this.context.fillStyle = "#fff";
		this.context.font = '16px Arial';
		this.context.fillText(this.score + " points", this.canvas.width-110, 30);
		this.context.fillText("Bloc suivant", this.canvas.width-110, 70);
	},
	draw_next: function() {
		if(this.next_bloc) this.next_bloc.placer(this.lignes[0]);
		this.next_bloc = new Bloc(parseInt(Math.random()*7)+1, this);
		this.next_bloc.draw();
	},
	get_cases: function(coord)
	{
		if(coord.y >= 0 && coord.y < this.lignes.length)
			return this.lignes[coord.y].get_cases(coord.x);
		else
			return null;
	},
	get_ligne: function(i) {
		return this.lignes[i];
	},
	get_nb_lignes: function() {
		return this.lignes.length;
	},
	get_full_lines: function() {
		var ret = new Array();

		for(var i = 0 ; i < this.lignes.length ; i++)
		{
			if(this.lignes[i].get_touched() == 0)
				ret.push(this.lignes[i]);
		}

		ret.forEach(function(l) {
			l.delete();
		});

		if(ret.length > 0)
			return true;
		else
			return false;
	},
	remove_lines: function() {
		var new_array = new Array(),
			nb_lignes = this.lignes.length;
		for(var i = 0 ; i < this.lignes.length ; i++)
		{
			if(this.lignes[i].get_touched() != 0)
				new_array.push(this.lignes[i]);
		}

		this.lignes = new Array();
		this.lignes = new_array;
		
		var diff = nb_lignes - this.lignes.length;

		this.score += diff*100 + (diff-1)*100;
		this.update_score();	

		for(i = 0 ; i < diff ; i++)
			this.lignes.splice(0, 0, new Ligne(0, this.default_color, this));

		for(i = 0 ; i < nb_lignes ; i++)
		{
			this.lignes[i].update_y(i);
			this.lignes[i].draw(this.context, i, this.case_w, this.space);
		}
	},
	update_score: function() {
		this.context.clearRect(this.canvas.width-110, 0, 110, 100);
		this.draw_score();
	},
	lose: function() {
		this.context.fillStyle = "#fff";
		this.context.font = '26px Arial';
		this.context.fillText("Perdu !", this.canvas.width-110, 300);

		document.getElementsByClassName("jouer")[0].style.visibility = "visible	";
	}
}