
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

app.listen(9062, function(){
  //console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});










//-------------LOGICA DEL SERVIDOR-------------//

var partidas = [];

socket.sockets.on('connection', function (socket) {
 
  //-----------------MENSAJE DE BIENVENIDA---------------------------//

  socket.emit('id', { hello: 'world' });

  //------------------------------------------------------------------//




  //-----------------CARGA DE PARTIDAS----------------------------------//

  socket.on('listapartidas', function (data) {
    var listapartidas = getPartidasInfo();
    console.log(listapartidas);
    socket.emit('listapartidas', { lista: listapartidas});
  });

  socket.on('nuevapartida', function (data) {
    var p = new Partida;
    p.gameId = generateUUID();
    p.nombre = "Partida Zeta";
    p.autor = data.user;
    partidas.push(p);
  });

  //--------------------------------------------------------------------//





  //-----------------GESTION DE LA CONEXION AL JUEGO---------------------//

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
            playerInfo = miPartida.getPlayer(data.user);
            EnviarPartida(miPartida, socket);
        }
        else
        {
            //Si está completo y no eres uno de ellos, añadirlo como viewer y recuperar la partida
            /*playerInfo.customId = data.user;
            playerInfo.playerId = socket.id;
            playerInfo.gameId = data.game;
            playerInfo.socket = socket;
            playerInfo.color = 'v';
            playerInfo.turno = 2;      

            miPartida.setPlayer2(playerInfo);
            EnviarPartida(miPartida, socket);*/
        }
      }
      else{
        //Si la partida no esta completa
        if(miPartida.players.length == 0){
          playerInfo.customId = data.user;
          playerInfo.playerId = socket.id;
          playerInfo.gameId = data.game;
          playerInfo.socket = socket;
          playerInfo.color = 'b';
          playerInfo.turno = 1;
          miPartida.players.push(playerInfo);
        }
        else if(miPartida.players.length == 1){
          playerInfo.customId = data.user;
          playerInfo.playerId = socket.id;
          playerInfo.gameId = data.game;
          playerInfo.socket = socket;
          playerInfo.color = 'w';
          playerInfo.turno = 0;  
          miPartida.setPlayer2(playerInfo); 
        }   
      }

      socket.emit('color', { color: playerInfo.color });

      //Enviar los datos de los jugadores a ambos jugadores
      for(j=0; j<miPartida.players.length; j++){
        var listaPlayers = miPartida.getPlayersInfo();
        miPartida.players[j].socket.emit('listaplayers', { lista: listaPlayers });
      }

      console.log("\n-----------Nuevo jugador-----------\n"+"Usuario: "+data.user+"\nPartida: "+data.game+"\n---------------------------------\n\n");
    }
  });

  socket.on('disconnect', function (data) {

    for(i=0; i<partidas.length; i++){
      for(j=0; j<partidas[i].players.length; j++){
        if(partidas[i].players[j].playerId == socket.id){
          console.log("\n-----------Jugador desconectado-----------\n"+"Usuario: "+partidas[i].players[j].customId+"\nPartida: "+partidas[i].gameId+"\n---------------------------------\n\n");
          var playernick = partidas[i].players[j].customId;
          partidas[i].players.splice(j,1);
          for(k=0; k<partidas[i].players.length; k++){
            var listaPlayers = partidas[i].getPlayersInfo();
            partidas[i].players[k].socket.emit('listaplayers', { lista: listaPlayers });            
            partidas[i].players[k].socket.emit('mensaje', { mensaje: {user: 'Sistema', msg: 'Partida finalizada, '+playernick+ ' se ha salido.' }});
          }
          partidas[i].endGame = true;
          if(partidas[i].players.length == 0){
            partidas.splice(i, 1);
          }
          break;
        }
      }
    }
    console.log("Numero de partidas: "+partidas.length);
      
  });

  //-------------------------------------------------------------------//







  //-----------------------CHAT------------------------------------------//
  socket.on('mensaje', function (data) {

    var miPartida = getPartida(data.game);

    for(j=0; j<miPartida.players.length; j++){
      if(miPartida.players[j].playerId != socket.id)
      {
        miPartida.players[j].socket.emit('mensaje', { mensaje: data });
      }
    }

  });
  //-------------------------------------------------------------------//










  //-------------------------LOGICA DEL JUEGO--------------------------//
  socket.on('pass', function (data) {
    
    var miPartida = getPartida(data.game);
    if(miPartida.Turno(socket.id)){
      if(miPartida.pass == 0){
        miPartida.CambiaTurno();
        miPartida.pass++;
        for(j=0; j<miPartida.players.length; j++){
          miPartida.players[j].socket.emit('movimiento', { mensaje: miPartida.tablero });
        }
      }
      else{
        //Los dos jugadores pasan, fin de la partida
        miPartida.endGame = true;
        for(j=0; j<miPartida.players.length; j++){
          miPartida.players[j].socket.emit('mensaje', { mensaje: {user: 'Sistema', msg: 'Partida finalizada.' }});
        }
      }
    }
     
  });

  socket.on('abandonar', function (data) {
    
    var miPartida = getPartida(data.game);
    if(miPartida.Turno(socket.id)){
      miPartida.endGame = true;
      for(j=0; j<miPartida.players.length; j++){
        miPartida.players[j].socket.emit('mensaje', { mensaje: {user: 'Sistema', msg: 'Partida finalizada, '+data.user+ ' se ha rendido.' }});
      }
    }
     
  });

    socket.on('salir', function (data) {
    
    var miPartida = getPartida(data.game);
    if(miPartida.Turno(socket.id)){
      miPartida.endGame = true;
      for(j=0; j<miPartida.players.length; j++){
        miPartida.players[j].socket.emit('mensaje', { mensaje: {user: 'Sistema', msg: 'Partida finalizada, '+data.user+ ' se ha salido.' }});
      }
    }
     
  });


  socket.on('movimiento', function (data) {

    var miPartida = getPartida(data.game);

    //Comprobar si es el turno del jugador
    if(miPartida.Turno(socket.id) && !miPartida.endGame){
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
        if(miPartida.nuevoMovimiento(piedra, socket.id)){
          for(j=0; j<miPartida.players.length; j++){
              //Enviamos los datos del tablero y puntuaciones a los jugadores
              miPartida.players[j].socket.emit('movimiento', { mensaje: miPartida.tablero, players: miPartida.getPlayersInfo() });
          }

          //Cambiamos el turno
          miPartida.CambiaTurno();
          miPartida.pass = 0;
          //Paramos el crono
        }
      }
    }
  });
});


//-------------------------------------------------------------------------//









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
    socket.emit('movimiento', { mensaje: partida.tablero });
}

function generateUUID(){
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
};

function getPartidasInfo(){
    var listPartidasInfo = []; 

    for(var i=0; i<partidas.length; i++){
        var partidasinfo = {};
        partidasinfo.gameId = partidas[i].gameId;
        partidasinfo.nombre = partidas[i].nombre;
        partidasinfo.autor = partidas[i].autor;
        listPartidasInfo.push(partidasinfo);
    }

    return listPartidasInfo;
}