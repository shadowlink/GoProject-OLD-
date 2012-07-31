Player = function(){

	this.customId;
    this.playerId;
    this.gameId;
    this.socket;
    this.color;
    this.turno;
    this.ptos = 0;

	this.CambiaTurno = function(){
		if(this.turno == 1){
          this.turno = 0;
        }
        else{
          this.turno = 1;
        }
	}
}