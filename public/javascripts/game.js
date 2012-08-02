var NUMBER_OF_COLS = 19,
	NUMBER_OF_ROWS = 19,
	BLOCK_SIZE = 100;

var BLOCK_COLOUR_1 = '#debf83',
	BLOCK_COLOUR_2 = '#debf83',
	HIGHLIGHT_COLOUR = '#000000';
        
var color = null;
var turno = false;
var tablero = [];
var socket;
var img_black = new Image();
img_black.src = "../images/pieces_black.png";
var img_white = new Image();
img_white.src = "../images/pieces_white.png";


socket = io.connect('http://localhost');


//-------------SOCKET CHAT-----------------//

socket.on('id', function (data) {
  console.log(data);
  socket.emit('id', { user: usuario, game: gameId });
});

socket.on('mensaje', function (data) {
  console.log(data);
  $("#chatBox").append('<p><b>'+data.mensaje.user+': </b>'+data.mensaje.msg+'</p>')
});

$("#botonChat").click(function(){
    var mensaje = $("#textChat").val();
    if(mensaje!=''){
        socket.emit('mensaje', { game: gameId, user: usuario, msg: mensaje });
        $("#chatBox").append('<p><b>'+usuario+': </b>'+mensaje+'</p>')
        $("#textChat").val('');
        $('#textChat').focus();
        $("#chatBox").each( function() {
            var scrollHeight = Math.max(this.scrollHeight, this.clientHeight);
            this.scrollTop = scrollHeight - this.clientHeight;
        });
    }
});

$("#textChat").keypress(function(e) {
    var mensaje = $("#textChat").val();
    if(e.which == 13 && mensaje!=''){
        socket.emit('mensaje', { game: gameId, user: usuario, msg: mensaje });
        $("#chatBox").append('<p><b>'+usuario+': </b>'+mensaje+'</p>')
        $("#textChat").val('');
        $("#chatBox").each( function(){
           var scrollHeight = Math.max(this.scrollHeight, this.clientHeight);
           this.scrollTop = scrollHeight - this.clientHeight;
        });
    }
});

//-------------SOCKET JUEGO-----------------//

socket.on('color', function (data) {
  color = data.color;
  if(color == 'b'){
  	turno = true;
  }
});

socket.on('listaplayers', function (data) {
		$('#players').empty();
		for(var i=0; i < data.lista.length; i++){
		  $('#players').append($('<div class="player" id ='+data.lista[i].customId+'><h1>'+data.lista[i].customId+'</h1><img src = "../images/nyancat.png"><div class="points">0</div></div>'));
		}
	
});

$("#botonPass").click(function(){
	//turno = false;
    socket.emit('pass', { game: gameId });
});

$("#botonAbandon").click(function(){
	//turno = false;
    socket.emit('abandonar', { game: gameId, user: usuario });
});

$("#botonExit").click(function(){
	//turno = false;
    socket.emit('salir', { game: gameId, user: usuario });
});

function sendMov(cell){
	socket.emit('movimiento', { pos: cell, game: gameId });
}

socket.on('movimiento', function (data) {
	//var snd = new Audio("../sound/stone.wav");
	canvas.width = canvas.width;
	tablero = data.mensaje;
	drawBoard();
	drawLines();
	drawPiedras();	
	//snd.play();
	if(turno == false){
		turno = true;
	}
	else{
		turno = false;
	}

	//Actualizamos las puntuaciones
	for(var i=0; i<data.players.length; i++){
		$('#'+data.players[i].customId+' .points').html(data.players[i].ptos);
	}
});

//-------------PINTADO JUEGO-----------------//
draw();
function draw(){
	// Main entry point got the HTML5 chess board example
	canvas = document.getElementById('canvas');
	contentBox = document.getElementById('gameContentBox');

	// Canvas supported?
	if(canvas.getContext)
	{
		ctx = canvas.getContext('2d');
		canvas.addEventListener("click", halmaOnClick, false);
		canvas.addEventListener('mousemove', mouseMove, false);
		canvas.addEventListener('mouseout', mouseLeave, false);

		// Calculate the precise block size
		BLOCK_SIZE = canvas.height / NUMBER_OF_ROWS;
		
		// Draw the background
		drawBoard();
		drawLines();	
		// Draw pieces
		//pieces = new Image();
		//pieces.src = 'pieces.png';
		//pieces.onload = drawPieces;
	}
	else
	{
		alert("Canvas not supported!");
	}
}

function drawBoard(){	
	/*for(iRowCounter = 0; iRowCounter < NUMBER_OF_ROWS; iRowCounter++)
	{
		drawRow(iRowCounter);
	}	
	
	// Draw outline
	ctx.lineWidth = 1;
    ctx.strokeStyle = '#848484';
	ctx.strokeRect(0, 0, NUMBER_OF_ROWS * BLOCK_SIZE, NUMBER_OF_COLS * BLOCK_SIZE);	*/
}

function drawLines(){

	//Pintamos las lineas horizontales
	for(iRowCounter = 0; iRowCounter < NUMBER_OF_ROWS; iRowCounter++)
	{

		ctx.fillStyle = "black";
 	 	ctx.font = "bold 10px Arial";
		//ctx.fillText(iRowCounter+1, 0, (iRowCounter*BLOCK_SIZE)+(BLOCK_SIZE/2)+5);

		ctx.strokeStyle = '#000000';
		ctx.beginPath();
		ctx.moveTo(BLOCK_SIZE/2,(iRowCounter*BLOCK_SIZE)+(BLOCK_SIZE/2));
		ctx.lineTo((NUMBER_OF_COLS*BLOCK_SIZE)-(BLOCK_SIZE/2), (iRowCounter*BLOCK_SIZE)+(BLOCK_SIZE/2));
		ctx.stroke();
	}	


	//Pintamos las lineas verticlaes
	for(iColCounter = 0; iColCounter < NUMBER_OF_COLS; iColCounter++)
	{
		ctx.strokeStyle = '#000000';
		ctx.beginPath();
		ctx.moveTo((iColCounter*BLOCK_SIZE)+(BLOCK_SIZE/2), BLOCK_SIZE/2);
		ctx.lineTo((iColCounter*BLOCK_SIZE)+(BLOCK_SIZE/2), (NUMBER_OF_ROWS*BLOCK_SIZE)-(BLOCK_SIZE/2));
		ctx.stroke();
	}	

	//Pintamos los Hoshi y el Tengen
	ctx.beginPath();
	ctx.fillStyle = '#000000';
	ctx.arc((9*BLOCK_SIZE)+BLOCK_SIZE/2, (9*BLOCK_SIZE)+BLOCK_SIZE/2, 5, 0, 2 * Math.PI, true);
	ctx.fill();
	ctx.beginPath();
	ctx.arc((3*BLOCK_SIZE)+BLOCK_SIZE/2, (9*BLOCK_SIZE)+BLOCK_SIZE/2, 5, 0, 2 * Math.PI, true);
	ctx.fill();
	ctx.beginPath();
	ctx.arc((15*BLOCK_SIZE)+BLOCK_SIZE/2, (9*BLOCK_SIZE)+BLOCK_SIZE/2, 5, 0, 2 * Math.PI, true);
	ctx.fill();
	ctx.beginPath();
	ctx.arc((3*BLOCK_SIZE)+BLOCK_SIZE/2, (3*BLOCK_SIZE)+BLOCK_SIZE/2, 5, 0, 2 * Math.PI, true);
	ctx.fill();
	ctx.beginPath();
	ctx.arc((15*BLOCK_SIZE)+BLOCK_SIZE/2, (3*BLOCK_SIZE)+BLOCK_SIZE/2, 5, 0, 2 * Math.PI, true);
	ctx.fill();
	ctx.beginPath();
	ctx.arc((9*BLOCK_SIZE)+BLOCK_SIZE/2, (3*BLOCK_SIZE)+BLOCK_SIZE/2, 5, 0, 2 * Math.PI, true);
	ctx.fill();
	ctx.beginPath();
	ctx.arc((3*BLOCK_SIZE)+BLOCK_SIZE/2, (15*BLOCK_SIZE)+BLOCK_SIZE/2, 5, 0, 2 * Math.PI, true);
	ctx.fill();
	ctx.beginPath();
	ctx.arc((15*BLOCK_SIZE)+BLOCK_SIZE/2, (15*BLOCK_SIZE)+BLOCK_SIZE/2, 5, 0, 2 * Math.PI, true);
	ctx.fill();
	ctx.beginPath();
	ctx.arc((9*BLOCK_SIZE)+BLOCK_SIZE/2, (15*BLOCK_SIZE)+BLOCK_SIZE/2, 5, 0, 2 * Math.PI, true);
	ctx.fill();
}

function drawPiedras(){
	for(var i=0; i<tablero.length; i++){
		for(var j=0; j<tablero.length; j++){
			if(tablero[i][j] == 'b'){
				if(tablero[i][j]!=null){
			   		ctx.drawImage(img_black, j*BLOCK_SIZE, i*BLOCK_SIZE);
				}
			}
			else if(tablero[i][j] == 'w')
			{
				if(tablero[i][j]!=null){
			   		ctx.drawImage(img_white, j*BLOCK_SIZE, i*BLOCK_SIZE);
				}
			}
		}
	}
}

function halmaOnClick(e) {
    var cell = getCursorPosition(e);
    sendMov(cell);
}

function mouseLeave(e){
	canvas.width = canvas.width;
	drawBoard();
	drawLines();
	drawPiedras();
}

function mouseMove(e){
	if(turno){
		canvas.width = canvas.width;
		drawBoard();
		drawLines();
		drawPiedras();
	    var x;
	    var y;
	    offset = $('#canvas').offset();
		x = e.pageX - offset.left;
		y = e.pageY - offset.top;

		var fila, columna, posX, posY;
		fila = Math.floor(x/BLOCK_SIZE);
		columna = Math.floor(y/BLOCK_SIZE);
		posX = (fila*BLOCK_SIZE)+(BLOCK_SIZE/2);
		posY = (columna*BLOCK_SIZE)+(BLOCK_SIZE/2);

		ctx.beginPath();
		if(color=='b'){
			ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
		}
		else if(color=='w'){
			ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
		}
		ctx.arc(posX, posY, 14, 0, 2 * Math.PI, true);
		ctx.fill();	
	}
}

function getCursorPosition(e) {
    
    var x;
    var y;
    offset = $('#canvas').offset();
	x = e.pageX - offset.left;
	y = e.pageY - offset.top;
	
	//obtener la posicion de dibujado de la piedra
	var fila, columna, posX, posY;
	fila = Math.floor(x/BLOCK_SIZE);
	columna = Math.floor(y/BLOCK_SIZE);
	posX = (fila*BLOCK_SIZE)+(BLOCK_SIZE/2);
	posY = (columna*BLOCK_SIZE)+(BLOCK_SIZE/2);

	var cell = new Object();
	cell.X = posX;
	cell.Y = posY;

	cell.Fila = fila;
	cell.Columna = columna;

	return cell;
}

