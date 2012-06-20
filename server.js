
/**
 * Module dependencies.
 */

var express = require('express')
  , io = require('socket.io')
  , cradle = require('cradle')
  , util = require('util')
  , routes = require('./routes')
  , login = require('./routes/login.js')
  , main = require('./routes/main.js')
  , gameList = require('./routes/gameList.js')
  , game = require('./routes/game.js');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.cookieParser('nhispano'))
  app.use(express.session({ secret: "nyancat", nick: "" }));
  app.use(express.methodOverride());
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.logger());
  app.use(express.static(__dirname + '/public'));
});


app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});


// Routes
app.get('/', routes.index);
app.get('/main', main.main);
app.get('/registro', routes.registro);
app.post('/login', login.login);
app.post('/beta', login.beta);
app.get('/gamelist', gameList.all);
app.get('/game/:id', game.game);
app.get('/about', function(req,res){

})

var socket = io.listen(app);

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

//#######---ZONA SOCKET.IO---#########//
socket.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('mensaje', function (data) {
    socket.broadcast.emit('mensaje', { mensaje: data });
  });
});
