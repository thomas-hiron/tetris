function Case(x, y, middle, color, ligne)
{
	var x = x;
	var y = y;
	var is_middle = middle;
	var color = color;
	var default_color = color;
	var touched = false;
	var ligne_parent = ligne;

	this.getX = function()
	{
		return x;
	}

	this.getY = function()
	{
		return y;
	}

	this.colorier = function(c, t) // C : color, t : tetris
	{
		color = c;
		var cw = t.case_w,
			s = t.space,
			ctx = t.context;

		ctx.fillStyle = color;
		ctx.clearRect(x*cw + x*s, y*cw + y*s, cw, cw); // Suppression de la case dans le canvas
		ctx.fillRect(x*(cw+s), y*(cw+s), cw, cw);
	}

	this.reset = function(t) // Effacer la case du canvas
	{
		this.colorier(default_color, t);
	}

	this.is_middle_case = function()
	{
		return is_middle;
	}

	this.set_touched = function(bool)
	{
		touched = bool;
		ligne_parent.set_touched();
	}

	this.is_touched = function()
	{
		return touched;
	}

	this.get_color = function()
	{
		return color;
	}

	this.update_y = function(i)
	{
		y = i;
	}
}