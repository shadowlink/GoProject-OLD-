Partida = function(){

    this.gameId;
	this.players = [];
    this.listaPiedras = [];

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

        for(j=0; j<this.listaPiedras.length; j++){
            if(this.listaPiedras[j].posX == data.pos.X && this.listaPiedras[j].posY == data.pos.Y){
                ocupada = true;
                break;
            }
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
}