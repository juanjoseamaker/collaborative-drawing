var socket = io();

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var userColor = '#000000';
var userID = function () {
	var letters = '0123456789ABCDEF';
	var id = '';
	
  	for (var i = 0; i < 6; i++) {
		id += letters[Math.floor(Math.random() * 16)];
	}
	
	return id;
}();

var drawingLines = [];

var drawPos = {
	x: 0,
	y: 0
};

// ---------------------------------------------------------------------

canvas.addEventListener('mousedown', (e) => {
	drawPos = {
		x: e.clientX - canvas.offsetLeft,
		y: e.clientY - canvas.offsetTop
	};
});

canvas.addEventListener('mouseup', (e) => {
	const pos = {
		x: e.clientX - canvas.offsetLeft,
		y: e.clientY - canvas.offsetTop
	};

	socket.emit('drawLine', { p1: drawPos, p2: pos, color: userColor, id: userID });

	drawingLines.push({ p1: drawPos, p2: pos, color: userColor, id: userID });
	drawLines();
});

canvas.addEventListener('mousemove', (e) => {
	drawLines();
});

// ---------------------------------------------------------------------

function drawLines() {
	ctx.fillStyle = '#FFFFFF';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	drawingLines.forEach((line) => {
		ctx.strokeStyle = line.color;
		
		ctx.beginPath();
		ctx.moveTo(line.p1.x, line.p1.y);
		ctx.lineTo(line.p2.x, line.p2.y);
		ctx.stroke(); 
	});
}

function undoLastLine() {
	var lastLineIndex = drawingLines.lenght - 1;
	
	drawingLines.forEach((line, index) => {
		if (line.id == userID) {
			lastLineIndex = index;
		}
	});

	socket.emit('undo', lastLineIndex);

	drawingLines.splice(lastLineIndex, 1);
	
	drawLines();
}

// ---------------------------------------------------------------------

function KeyPress(e) {
	var evtobj = window.event? event : e;
	
	if (evtobj.keyCode == 90 && evtobj.ctrlKey) {
		undoLastLine();
	}
}

document.onkeydown = KeyPress;

// ---------------------------------------------------------------------

var inputColor = document.getElementById('input-color');

inputColor.addEventListener("change", () => {
	userColor = inputColor.value;
});

// ---------------------------------------------------------------------

var undoButton = document.getElementById('undo-button');

undoButton.addEventListener('click', undoLastLine);

// ---------------------------------------------------------------------

socket.on('drawLine', function(line) {
	console.log('drawing another user line');
	drawingLines.push(line);
	drawLines();
});

socket.on('undo', function(index) {
	console.log('removing another user line');
	drawingLines.splice(index, 1);
	drawLines();
});

socket.on('update', function(lines) {
	console.log('updating lines from server');
	drawingLines = lines;
	drawLines();
});
