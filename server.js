
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
require('./Class/Cadena.js');

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

var socket = io.listen(app, { log: false });

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});










//-------------SERVIDOR CHAT Y JUEGO-------------//

var partidas = [];

socket.sockets.on('connection', function (socket) {
 
  socket.emit('id', { hello: 'world' });

  socket.on('id', function (data) {
    
    var miPartida = getPartida(data.game);
    var playerInfo = new Player();

    if(miPartida != null){
      //Comprobar si esta completo
      if(miPartida.GameFull()){
        //Si está completo comprobar si eres uno de ellos
        if(miPartida.PlayerExists(data.user))
        {
            miPartida.SetPlayerSocket(data.user, socket);
            //Si está completo y eres uno de ellos, recuperar la lista de piedras
            EnviarPartida(miPartida, socket);
        }
        else
        {
            //Si está completo y no eres uno de ellos, añadirlo como viewer y recuperar la partida
            playerInfo.customId = data.user;
            playerInfo.playerId = socket.id;
            playerInfo.gameId = data.game;
            playerInfo.socket = socket;
            playerInfo.color = 'v';
            playerInfo.turno = 2;      

            miPartida.setPlayer2(playerInfo);
            EnviarPartida(miPartida, socket);
        }
      }
      else{
        //Si la partida no esta completa pero eres uno de los jugadores
        playerInfo.customId = data.user;
        playerInfo.playerId = socket.id;
        playerInfo.gameId = data.game;
        playerInfo.socket = socket;
        playerInfo.color = 'w';
        playerInfo.turno = 0;      

        miPartida.setPlayer2(playerInfo);
      }
    }
    else{
      var partida = new Partida();
      partida.gameId = data.game;

      playerInfo.customId = data.user;
      playerInfo.playerId = socket.id;
      playerInfo.gameId = data.game;
      playerInfo.socket = socket;
      playerInfo.color = 'b';
      playerInfo.turno = 1;

      partida.players.push(playerInfo);
      partidas.push(partida);
    }

    socket.emit('color', { color: playerInfo.color });

    console.log("\n-----------Nuevo jugador-----------\n"+"Usuario: "+data.user+"\nPartida: "+data.game+"\n---------------------------------\n\n");
  });

  socket.on('mensaje', function (data) {
    //socket.broadcast.emit('mensaje', { mensaje: data });

    var miPartida = getPartida(data.game);

    for(j=0; j<miPartida.players.length; j++){
      if(miPartida.players[j].playerId != socket.id)
      {
        miPartida.players[j].socket.emit('mensaje', { mensaje: data });
      }
    }

  });

  socket.on('disconnect', function (data) {

    for(i=0; i<partidas.length; i++){
      for(j=0; j<partidas[i].players.length; j++){
        if(partidas[i].players[j].playerId == socket.id){
          console.log("\n-----------Jugador desconectado-----------\n"+"Usuario: "+partidas[i].players[j].customId+"\nPartida: "+partidas[i].gameId+"\n---------------------------------\n\n");
          //partidas[i].players.splice(j,1);
          break;
        }
      }
    }
      
  });


  socket.on('movimiento', function (data) {

    var miPartida = getPartida(data.game);

    //Comprobar si es el turno del jugador
    if(miPartida.Turno(socket.id)){
      //Comprobar si la casilla esta ocupada
      if(!miPartida.CasillaOcupada(data)){
        //Creamos el objeto a enviar
        var color = miPartida.PlayerColor(socket.id)
        var piedra = new Piedra();
        piedra.posX = data.pos.X;
        piedra.posY = data.pos.Y;
        piedra.Fila = data.pos.Fila;
        piedra.Columna = data.pos.Columna;
        piedra.color = color;


        //Añadimos el nuevo movimiento a la lista de movimientos de la partida si se permite
        if(miPartida.nuevoMovimiento(piedra)){
          for(j=0; j<miPartida.players.length; j++){
              //console.log("Enviado a: "+miPartida.players[j].customId);
              miPartida.players[j].socket.emit('movimiento', { mensaje: miPartida.tablero });
          }

          //Cambiamos el turno
          miPartida.CambiaTurno();
        }
      }
    }

  });

});


//----------AUXILIARES----------//

function getPartida(gameId){

  var partida;
  for(i=0; i<partidas.length; i++){
    if(partidas[i].gameId == gameId){
      partida = partidas[i];
    }
    break;
  }

  return partida;   
}

function EnviarPartida(partida, socket){

    /*for(var i=0; i<partida.listaPiedras.length; i++)
    {
        socket.emit('movimiento', { mensaje: partida.listaPiedras[i] });
    }*/

}