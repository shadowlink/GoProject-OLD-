
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

require('./Class/Player.js');
require('./Class/Partida.js');
require('./Class/Piedra.js');

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

var partidas = [];

socket.sockets.on('connection', function (socket) {
 
  socket.emit('id', { hello: 'world' });

  socket.on('id', function (data) {
    
    if(gameExists(data.game)){
      
      var playerInfo = new Player();
      playerInfo.customId = data.user;
      playerInfo.playerId = socket.id;
      playerInfo.gameId = data.game;
      playerInfo.socket = socket;
      playerInfo.color = 'w';
      playerInfo.turno = 0;      

      setPlayer2(data.game, playerInfo);
    }
    else{
      var partida = new Partida();
      partida.gameId = data.game;

      var playerInfo = new Player();
      playerInfo.customId = data.user;
      playerInfo.playerId = socket.id;
      playerInfo.gameId = data.game;
      playerInfo.socket = socket;
      playerInfo.color = 'b';
      playerInfo.turno = 1;

      partida.players.push(playerInfo);
      partidas.push(partida);
    }

    console.log("\n-----------Nuevo jugador-----------\n"+"Usuario: "+data.user+"\nPartida: "+data.game+"\n---------------------------------\n\n");
  });

  socket.on('mensaje', function (data) {
    //socket.broadcast.emit('mensaje', { mensaje: data });

    for(i=0; i<partidas.length; i++){
      if(partidas[i].gameId == data.game){
        for(j=0; j<partidas[i].players.length; j++){
          if(partidas[i].players[j].playerId != socket.id)
          {
            partidas[i].players[j].socket.emit('mensaje', { mensaje: data });
          }
        }
      }
    }

  });

  socket.on('disconnect', function (data) {

    /*for( var i=0, len=players.length; i<len; ++i ){
        var c = players[i];

        if(c.playerId == socket.id){
            players.splice(i,1);
            console.log("\n-----------Jugador desconectado-----------\n"+"Usuario: "+c.customId+"\nPartida: "+c.gameId+"\n---------------------------------\n\n");
            break;
        }
    }*/
  });


  socket.on('movimiento', function (data) {

    console.log("NYAN");
    if(suTurno(data.game, socket.id)){
      //Comprobar si la casilla esta ocupada

      //Creamos el objeto a enviar
      var piedra = new Piedra();
      piedra.posX = data.pos.X;
      piedra.posY = data.pos.Y;
      piedra.color = color;

      for(i=0; i<partidas.length; i++){
        if(partidas[i].gameId == data.game){
          for(j=0; j<partidas[i].players.length; j++){
            partidas[i].players[j].socket.emit('movimiento', { mensaje: piedra });
          }
        }
      }
      //Cambiamos el turno
      cambiaTurno(data.game);

    }

  });

});


//----------AUXILIARES----------//

function gameExists(gameId){

  var exists = false;

  for(i=0; i<partidas.length; i++){
    if(partidas[i].gameId == gameId){
      exists = true;
      break;
    }
  }

  return exists; 
}

function setPlayer2(gameId, player){


  for(i=0; i<partidas.length; i++){
    if(partidas[i].gameId == gameId){
      partidas[i].players.push(player);
      break;
    }
  }  

}

function playerColor(gameId, socket){

  var color;

  for(i=0; i<partidas.length; i++){
    if(partidas[i].gameId == gameId){
      for(j=0; j<partidas[i].players.length; j++){
        if(partidas[i].players[j].playerId == socket){
          color = partidas[i].players[j].color;
        }
      }
    }
    break;
  }

  return color; 
}

function suTurno(gameId, socket){

  var suTurno = false;

  for(i=0; i<partidas.length; i++){
    if(partidas[i].gameId == gameId){
      for(j=0; j<partidas[i].players.length; j++){
        if(partidas[i].players[j].playerId == socket){
          if(partidas[i].players[j].turno == 1){
            suTurno = true;
          }
        }
      }
    }
    break;
  }

  return suTurno;

}

function cambiaTurno(gameId){

  for(i=0; i<partidas.length; i++){
    if(partidas[i].gameId == gameId){
      for(j=0; j<partidas[i].players.length; j++){
        partidas[i].players[j].CambiaTurno();
      }
    }
    break;
  }

}