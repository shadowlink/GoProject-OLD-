exports.start = function(socket){
    socket.sockets.on('connection', function (socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('mensaje', function (data) {
      socket.broadcast.emit('mensaje', { mensaje: data });
    });
  });
})
  