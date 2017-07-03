var express = require('express');
var app = express();
var exphbs  = require('express-handlebars');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

app.use('/public', express.static(path.join(__dirname + '/public')));
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.get('/chat/:id', function(req, res){	
	res.render('index', {
		id: req.params.id
	});
});

io.on('connection', function(socket){
	socket.on('message', function(data){						
		socket.broadcast.to(data.room).emit('message', data);		
	});
	socket.on('login', function(room){				
		socket.join(room);				
		io.sockets.in(room).emit('user:on', {room: room, length: io.sockets.adapter.rooms[room].length});
	});
	socket.on('idle', function(){				
		Object.keys(io.sockets.adapter.rooms).forEach(function(room) {		
			if(io.sockets.adapter.rooms[room].length > 1){
				socket.broadcast.to(room).emit('user:away', room);
			}
		});
	});
	socket.on('active', function(){

		Object.keys(io.sockets.adapter.rooms).forEach(function(room) {					
			socket.broadcast.to(room).emit('user:on', {room: room, length: io.sockets.adapter.rooms[room].length});
		});
	});
	socket.on('disconnect', function(){				
		Object.keys(io.sockets.adapter.rooms).forEach(function(room) {					
			socket.broadcast.to(room).emit('user:off', room);
		});
	});

});

/*
/*.forEach(function(room){
			io.in(room).emit('user:off', {id: socket.id});
		});


io.sockets.once('connection', function(socket){
	socket.on('login', function(room){ 
		socket.join(room);
		io.sockets.in(room).emit('message', {
			type: 'status',
			text: 'Is now connected',
			created: Date.now(),
			username: socket.request.user.username
		});

		socket.on('message', function(data){				
			io.sockets.in(data.room).emit('message', data);		
		});

		socket.on('disconnect', function () { 
			io.sockets.in(room).emit({ 
				type: 'status',
				text: 'disconnected',
				created: Date.now(),
				username: socket.request.user.username
			});  
		});
	});
});*/


http.listen(3000, function(){
	console.log('listening on *:3000');
});
