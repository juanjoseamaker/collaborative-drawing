const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const host = '192.168.1.12'
const port = 3000

var serverLines = []

app.use(express.static(__dirname + '/public'));

io.on('connection', (socket) => {
	console.log('[SERVER] a user connected');
	socket.emit('update', serverLines);
	
	socket.on('disconnect', () => {
		console.log('[SERVER] user disconnected');
	});

	socket.on('drawLine', (line) => {
		console.log(`[USER] draw line color:${line.color} x1:${line.p1.x} y1:${line.p1.y} x2:${line.p2.x} y2:${line.p2.y}`);
		socket.broadcast.emit('drawLine', line);
		serverLines.push(line);
	});

	socket.on('undo', (index) => {
		socket.broadcast.emit('undo', index);
		serverLines.splice(index, 1);
		console.log(`[USER] undo line, new amount of lines ${serverLines.length}`);
	});
});

server.listen(3000, host, () => {
	console.log(`listening on ${host}:${port}`);
});
