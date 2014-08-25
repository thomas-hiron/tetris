function Ligne(i, c, t)
{
	var empty_cases = 10; // A 0 la ligne s'efface
	var cases = new Array();
	var tetris = t;
	
	for(var j = 0 ; j < 10 ; j++) // Colonnes
		cases.push(new Case(j, i, false, c, this));

	this.draw = function(ctx, i, cw, s)
	{
		cases.forEach(function(e) {
			ctx.fillStyle = e.get_color();
			ctx.fillRect(e.getX()*(cw+s), i*(cw+s), cw,cw);	
		});
	}

	this.get_nb_cases = function()
	{
		return cases.length;
	}

	this.get_cases = function(args)
	{
		if(typeof args == "undefined")
			return cases;
		else
			return cases[args];
	}

	this.set_touched = function()
	{
		empty_cases--;
	}

	this.get_touched = function()
	{
		return empty_cases;
	}

	this.delete = function()
	{
		var i = 0, j = 0, timer, l = cases.length, colors = new Array(), ligne = this;
		
		for(j = 0 ; j < l ; j++)
			colors.push(cases[j].get_color());

		timer = setInterval(function() {
			if(i++ == 4)
			{
				clearInterval(timer); // Stop
				ligne.remove(); // Mettre le score et supprimer la ligne
				return;
			}

			for(var j = 0 ; j < l ; j++)
			{
				if(i % 2 == 0)
					cases[j].reset(tetris);
				else
					cases[j].colorier(colors[j], tetris);
			}
		}, 100);
	}

	this.remove = function()
	{
		tetris.update_score();
	}

	this.update_y = function(i)
	{
		cases.forEach(function(c) {
			c.update_y(i);
		});
	}
}