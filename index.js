const express = require('express');
const engine  = require('express-handlebars');
const http = require('http');
const path = require('path');
const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use('/public', express.static(path.join(__dirname + '/public')));

app.get('/chat/:id', function(req, res){	
	res.render('index', {
		id: req.params.id
	});
});

io.on('connection', (socket) => {
	socket.on('message', (data) => {
		socket.broadcast.to(data.room).emit('message', data);				
	});	
	socket.on('login', (room) => {				
		socket.join(room);					
		io.sockets.in(room).emit('user:on', {room: room, length: io.sockets.adapter.rooms.get(room).size});		
	});  
	socket.on('idle', () => {						
		io.sockets.adapter.rooms.forEach((room, key) => {			
			if(room.size > 1){
				socket.broadcast.to(key).emit('user:away', key);				
			}
		});
	});	
	socket.on('active', () => {
		io.sockets.adapter.rooms.forEach((room, key) => {			
			socket.broadcast.to(key).emit('user:on', {room: key, length: io.sockets.adapter.rooms.get(key).size});
		});
	});
	socket.on('disconnect', () => {						
		io.sockets.adapter.rooms.forEach((room, key) => {			
			socket.broadcast.to(key).emit('user:off', key);
		});
	});
});

server.listen(3000, () => {
	console.log('server is running on port', server.address().port);
})