Cadena = function(){

	this.Piedras = [];
	this.Libertades = 0;

	this.agregarPiedra = function(piedra){
		this.Piedras.push(piedra);
	}

	this.agregarCadena = function(cadena){
		for(var i=0; i<cadena.Piedras.length; i++){
			this.Piedras.push(cadena.Piedras[i]);
		}
	}

	this.EliminarCadenasMuertas = function(tablero){

		var eliminar=false;
		this.Libertades=0;
		for(var i=0; i<this.Piedras.length; i++){

	        if(this.Piedras[i].Columna-1>=0){
	            if(tablero[this.Piedras[i].Columna-1][this.Piedras[i].Fila]==null){
	                    //Arriba 	                
	                    this.Libertades++;
	            }
	        }
	        
	        if(this.Piedras[i].Fila+1<=18){
	            if(tablero[this.Piedras[i].Columna][this.Piedras[i].Fila+1]==null){
	                    //Derecha
	                    this.Libertades++;
	            }
	        }
	        
	        if(this.Piedras[i].Columna+1<=18){
	            if(tablero[this.Piedras[i].Columna+1][this.Piedras[i].Fila]==null){
	                	//Abajo
	                	this.Libertades++;
	            }
	        }
	        
	        if(this.Piedras[i].Fila-1>=0){
	            if(tablero[this.Piedras[i].Columna][this.Piedras[i].Fila-1]==null){
	                    //Izquierda
	                    this.Libertades++;
	            }
	        }			
		}

		//Si la cadena no tiene ninguna libertad la eliminamos
		if(this.Libertades == 0){
			for(var i=0; i<this.Piedras.length; i++){
				tablero[this.Piedras[i].Columna][this.Piedras[i].Fila]=null;
			}
			eliminar=true;
		}

		return eliminar;

	}

	this.esVacia = function(){
		var vacia=false;
		if(this.Piedras.length==0)
		{
			vacia=true;
		}
		return vacia;
	}

	this.existePiedra = function(piedra){
		var existe = false;
		for(var i = 0; i < this.Piedras.length; i++){
			if(this.Piedras[i] == piedra){
				existe = true;
				break;
			}
		}

		return existe;
	}

}