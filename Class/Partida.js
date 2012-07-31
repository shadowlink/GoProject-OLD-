require('./Cadena.js');
Partida = function(){
    this.nombre = "Default";
    this.gameId;
    this.autor;
    this.pass = 0;
    this.endGame = false;
	this.players = [];
    this.ListaCadenas = [];
    this.tablero = createArray(19, 19);

	this.GameFull = function(){

        var full = false;

        if(this.players.length == 2){
            full = true;
        }

        return full;
	}

    this.Turno = function(socket){
        var suTurno = false;
        for(j=0; j<this.players.length; j++){
            if(this.players[j].playerId == socket){
                if(this.players[j].turno == 1){
                    suTurno = true;
                }
            }
        }

        return suTurno;
    }

    this.CasillaOcupada = function(data){
        var ocupada = false;

        if(this.tablero[data.pos.Columna][data.pos.Fila]!=null)
        {
            ocupada = true;
        }

        return ocupada;
    }

    this.PlayerColor = function(socket){
        var color;

        for(j=0; j<this.players.length; j++){
            if(this.players[j].playerId == socket){
                color = this.players[j].color;
            }
        }

        return color;         
    }

    this.CambiaTurno = function()
    {
        for(j=0; j<this.players.length; j++){
            this.players[j].CambiaTurno();
        } 
    }

    this.PlayerExists = function(user){
        var exists = false;

        for(j=0; j<this.players.length; j++){
            if(this.players[j].customId == user){
                exists = true;
                break;
            }
        }

        return exists;
    }

    this.setPlayer2 = function(player){
        this.players.push(player);
    }

    this.SetPlayerSocket = function(user, socket){
        for(j=0; j<this.players.length; j++){
            if(this.players[j].customId == user){
                this.players[j].socket = socket;
                this.players[j].playerId = socket.id;
                break;
            }
        } 
    }

    this.getPlayer = function(user){
        var player = null;

        for(j=0; j<this.players.length; j++){
            if(this.players[j].customId == user){
                player = this.players[j];
                break;
            }
        }

        return player;        
    }

    this.getPlayerBySocket = function(socket){
        var player = null;

        for(j=0; j<this.players.length; j++){
            if(this.players[j].socket == socket){
                player = this.players[j];
                break;
            }
        }

        return player;               
    }

    this.nuevoMovimiento = function(piedra, socket){
        var TableroState = this.tablero.clone(true); //Guardamos el estado actual del tablero
        var ListaCadenasState = this.ListaCadenas.slice(0); //Guardamos el estado actual de la lista de cadenas
        var movimientoValido = false;
        this.tablero[piedra.Columna][piedra.Fila]=piedra.color;

        //Crear una nueva Cadena o agregar la piedra a Una Cadena existente
        if(!this.piedraAdjunta(piedra)){
            //Crear nueva cadena
            var c = new Cadena();
            c.agregarPiedra(piedra);
            this.ListaCadenas.push(c);
        }

        //Obtener la cadena en la que esta la piedra, esta deberemos comprobarla la última de todas
        var cadenaPiedra = null;
        for(var i=0; i<this.ListaCadenas.length; i++){
            if(this.ListaCadenas[i].existePiedra(piedra)){
                cadenaPiedra = this.ListaCadenas[i];
            }
        }

        //Eliminar las cadenas que no tienen libertades y que no sean la cadena donde hemos insertado la piedra
        //Con esto prevenimos que la cadena objetivo se suicide si el grupo que la rodeaba ha muerto.
        for(var i=0; i<this.ListaCadenas.length; i++){
            if(this.ListaCadenas[i] != cadenaPiedra){
                if(this.ListaCadenas[i].EliminarCadenasMuertas(this.tablero)){
                    var p = this.getPlayerBySocket(socket);
                    p.ptos += this.ListaCadenas[i].numPiedras();
                    this.ListaCadenas.splice(i, 1);
                    i--;
                }
            }
        }

        //Ahora si, comprobamos la cadena objetivo
        if(cadenaPiedra.EliminarCadenasMuertas(this.tablero)){
            //Suicidio, no podemos permitirlo, restuaramos el tablero
            this.tablero = TableroState.clone(true);
            this.ListaCadenas = ListaCadenasState.slice(0);
            movimientoValido = false;
            console.log("MOVIMIENTO NO VALIDO");
        }
        else{
            //O el movimiento es valido
            //O con el intento de suicidio has matado el grupo que te rodeaba
            movimientoValido = true;
            console.log("MOVIMIENTO VALIDO");
        }

        //DEBUG Formacion de cadenas
        console.log("Numero de cadenas: "+this.ListaCadenas.length);
        for(var i=0; i<this.ListaCadenas.length; i++){
            console.log("CADENA\n")
            for(var j=0; j<this.ListaCadenas[i].Piedras.length; j++){
                console.log("("+this.ListaCadenas[i].Piedras[j].Columna+", "+this.ListaCadenas[i].Piedras[j].Fila+"), ");
            }
            console.log("Libertad: "+this.ListaCadenas[i].Libertades);
        }

        for (var i=0; i<19; i++){
            for(var j=0; j<19; j++){
                if(this.tablero[i][j]==null){
                    process.stdout.write("· ");
                }
                else{
                    process.stdout.write(this.tablero[i][j]+" ");
                }
            }
            process.stdout.write("\n");
        }

        return movimientoValido;
    }

    //Combina cadenas
    this.piedraAdjunta = function(piedra){
        var CadenaFinal = new Cadena();
        var adjunta = false;

        if(piedra.Columna-1>=0){
            if(this.tablero[piedra.Columna-1][piedra.Fila]!=null){
                if(this.tablero[piedra.Columna-1][piedra.Fila]==piedra.color){
                    //Arriba 
                    var pos = this.buscarCadena(piedra.Columna-1, piedra.Fila);

                    if(pos!=-1){
                        CadenaFinal.agregarCadena(this.ListaCadenas[pos])
                        this.ListaCadenas.splice(pos, 1)
                        adjunta = true;
                        console.log("Union Arriba");
                    }
                }
            }
        }
        
        if(piedra.Fila+1<=18){
            if(this.tablero[piedra.Columna][piedra.Fila+1]!=null){
                if(this.tablero[piedra.Columna][piedra.Fila+1]==piedra.color){
                    //Derecha
                    var pos = this.buscarCadena(piedra.Columna, piedra.Fila+1);
                    if(pos!=-1){
                        CadenaFinal.agregarCadena(this.ListaCadenas[pos])
                        this.ListaCadenas.splice(pos, 1)
                        adjunta = true;
                        console.log("Union Derecha");
                    }
                }
            }
        }
        
        if(piedra.Columna+1<=18){
            if(this.tablero[piedra.Columna+1][piedra.Fila]!=null){
                if(this.tablero[piedra.Columna+1][piedra.Fila]==piedra.color){
                    //Abajo
                    var pos = this.buscarCadena(piedra.Columna+1, piedra.Fila);

                    if(pos!=-1){
                        CadenaFinal.agregarCadena(this.ListaCadenas[pos])
                        this.ListaCadenas.splice(pos, 1)
                        adjunta = true;
                        console.log("Union Abajo");
                    }
                }
            }
        }
        
        if(piedra.Fila-1>=0){
            if(this.tablero[piedra.Columna][piedra.Fila-1]!=null){
                if(this.tablero[piedra.Columna][piedra.Fila-1]==piedra.color){
                    //Izquierda
                    var pos = this.buscarCadena(piedra.Columna, piedra.Fila-1);

                    if(pos!=-1){
                        CadenaFinal.agregarCadena(this.ListaCadenas[pos])
                        this.ListaCadenas.splice(pos, 1)
                        adjunta = true;
                        console.log("Union Izquierda");
                    }
                }
            }
        }

        if(adjunta){
            CadenaFinal.agregarPiedra(piedra);
            this.ListaCadenas.push(CadenaFinal);
        }

        return adjunta;
    }

    //Busca en que cadena se encuentra una piedra
    this.buscarCadena = function(Columna, Fila){
        var c = -1;
        for(var i=0; i<this.ListaCadenas.length; i++){
            for(var j=0; j<this.ListaCadenas[i].Piedras.length; j++){
                if(this.ListaCadenas[i].Piedras[j].Columna==Columna 
                    && this.ListaCadenas[i].Piedras[j].Fila==Fila){
                    c = i;
                    break;
                }
            }
        }        

        return c;
    }

    this.getPlayersInfo = function(){
        var listPlayersInfo = []; 

        for(var i=0; i<this.players.length; i++){
            var playerinfo = {};
            playerinfo.customId = this.players[i].customId;
            playerinfo.playerId = this.players[i].playerId;
            playerinfo.gameId = this.players[i].gameId;
            playerinfo.color = this.players[i].color;
            playerinfo.turno = this.players[i].turno;
            playerinfo.ptos = this.players[i].ptos;
            listPlayersInfo.push(playerinfo);
        }

        return listPlayersInfo;
    }

    //Funciones auxiliares
    function createArray(length) {
        var a = new Array(length || 0);

        if (arguments.length > 1) {
            var args = Array.prototype.slice.call(arguments, 1);
            for (var i = 0; i < length; i++) {
                a[i] = createArray.apply(this, args);
            }
        }

        return a;
    }


    //Funcion para clonar arrays
    Array.prototype.clone = function(doDeepCopy) {
        if(doDeepCopy) {
            var encountered = [{
                a : this,
                b : []
            }];

            var item,
                levels = [{a:this, b:encountered[0].b, i:0}],
                level = 0,
                i = 0,
                len = this.length;

            while(i < len) {
                item = levels[level].a[i];
                if(Object.prototype.toString.call(item) === "[object Array]") {
                    for(var j = encountered.length - 1; j >= 0; j--) {
                        if(encountered[j].a === item) {
                            levels[level].b.push(encountered[j].b);
                            break;
                        }
                    }
                    if(j < 0) {
                        encountered.push(j = {
                            a : item,
                            b : []
                        });
                        levels[level].b.push(j.b);
                        levels[level].i = i + 1;
                        levels[++level] = {a:item, b:j.b, i:0};
                        i = -1;
                        len = item.length;
                    }
                }
                else {
                    levels[level].b.push(item);
                }

                if(++i == len && level > 0) {
                    levels.pop();
                    i = levels[--level].i;
                    len = levels[level].a.length;
                }
            }

            return encountered[0].b;
        }
        else {
            return this.slice(0);
        }
    }
}