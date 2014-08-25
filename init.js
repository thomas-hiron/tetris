window.addEventListener("load", init, false);

var canvas;

function init()
{
	canvas = document.getElementsByTagName("canvas")[0];	
	if(!canvas || !canvas.getContext)
		return;
	
	context = canvas.getContext("2d");	
	if(!context) return;

	// On continue	
	document.getElementsByClassName("jouer")[0].addEventListener("click", demarrer, false);
}

function demarrer()
{
	document.getElementsByClassName("jouer")[0].style.visibility = "hidden";
	var tetris = new Tetris(canvas);

	canvas = document.getElementsByTagName("canvas")[0];	
	context = canvas.getContext("2d");
	context.clearRect(0, 0, canvas.width, canvas.height);
	
	tetris.draw_grid();
	tetris.draw_score();
	tetris.draw_next();
	tetris.draw_next();
}

!function(){window.log=Function.prototype.bind.call(console.log,console);}()
function bind(scope, fn) { return function() { return fn.apply(scope, arguments); } }
