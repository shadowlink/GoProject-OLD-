
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
  app.use(express.cookieParser('GoProject'))
  app.use(express.session({ secret: "nyancat", nick: "" }));
  app.use(express.methodOverride());
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  //app.use(express.logger());
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

//-------------SERVIDOR CHAT Y JUEGO-------------//

var players = [];

socket.sockets.on('connection', function (socket) {
 
  socket.emit('id', { hello: 'world' });

  socket.on('id', function (data) {
    
    var color;
    var turno;

    if(gameExists(data.game)){
      color = 'w';
      turno = 0;
    }
    else{
      color ='b';
      turno = 1;
    }

    var playerInfo = new Object();
    playerInfo.customId = data.user;
    playerInfo.playerId = socket.id;
    playerInfo.gameId = data.game;
    playerInfo.socket = socket;
    playerInfo.color = color;
    playerInfo.turno = turno;
    players.push(playerInfo);

    console.log("\n-----------Nuevo jugador-----------\n"+"Usuario: "+data.user+"\nPartida: "+data.game+"\n---------------------------------\n\n");
  });

  socket.on('mensaje', function (data) {
    //socket.broadcast.emit('mensaje', { mensaje: data });

    var gameId;
    for( var i=0, len=players.length; i<len; ++i ){
        var c = players[i];
        if(c.playerId == socket.id){
            gameId=c.gameId;
            break;
        }
    }

    for( var i=0, len=players.length; i<len; ++i ){
        var c = players[i];
        if(c.gameId == gameId && c.playerId!=socket.id){
            c.socket.emit('mensaje', { mensaje: data });
        }
    }


  });

  socket.on('disconnect', function (data) {

    for( var i=0, len=players.length; i<len; ++i ){
        var c = players[i];

        if(c.playerId == socket.id){
            players.splice(i,1);
            console.log("\n-----------Jugador desconectado-----------\n"+"Usuario: "+c.customId+"\nPartida: "+c.gameId+"\n---------------------------------\n\n");
            break;
        }
    }
  });


  socket.on('movimiento', function (data) {

    if(suTurno(socket.id)){
      var color = playerColor(socket.id)
      //Comprobar si la casilla esta ocupada

      //Creamos el objeto a enviar
      var mov = new Object();
      mov.posX = data.pos.X;
      mov.posY = data.pos.Y;
      mov.color = color;

      console.log(data.pos.X);
      console.log(data.pos.Y);

      var gameId;
      for( var i=0, len=players.length; i<len; ++i ){
          var c = players[i];
          if(c.playerId == socket.id){
              gameId=c.gameId;
              break;
          }
      }

      for( var i=0, len=players.length; i<len; ++i ){
          var c = players[i];
          if(c.gameId == gameId){
              c.socket.emit('movimiento', { mensaje: mov });
          }
      }

      //Cambiamos el turno
      cambiaTurno(gameId);

    }

  });

});


//----------AUXILIARES----------//

function gameExists(gameId){

  var exists = false;

  for( var i=0, len=players.length; i<len; ++i ){
      var c = players[i];
      if(c.gameId == gameId){
          exists = true;
          break;
      }
  }

  return exists; 
}

function playerColor(socket){

    var color;

    for( var i=0, len=players.length; i<len; ++i ){
      var c = players[i];
      if(c.playerId == socket){
          color = c.color;
          break;
      }
    } 

    return color; 
}

function suTurno(socket){

  var suTurno = false;

  for( var i=0, len=players.length; i<len; ++i ){
    var c = players[i];
    if(c.playerId == socket){
        if(c.turno == 1){
          suTurno = true;
        }
        break;
    }
  }  

  return suTurno;

}

function cambiaTurno(gameId){

  for( var i=0, len=players.length; i<len; ++i ){
    var c = players[i];
    if(c.gameId == gameId){
        if(c.turno == 1){
          c.turno = 0;
        }
        else{
          c.turno = 1;
        }
    }
  }

}