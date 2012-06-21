var NUMBER_OF_COLS = 19,
	NUMBER_OF_ROWS = 19,
	BLOCK_SIZE = 100;

var BLOCK_COLOUR_1 = '#debf83',
	BLOCK_COLOUR_2 = '#debf83',
	HIGHLIGHT_COLOUR = '#000000';
        
var color = 1;

function draw()
{
	// Main entry point got the HTML5 chess board example
	canvas = document.getElementById('canvas');
	contentBox = document.getElementById('gameContentBox');

	// Canvas supported?
	if(canvas.getContext)
	{
		ctx = canvas.getContext('2d');
		canvas.addEventListener("click", halmaOnClick, false);

		// Calculdate the precise block size
		BLOCK_SIZE = canvas.height / NUMBER_OF_ROWS;
		
		// Draw the background
		drawBoard();
		drawLines();
		defaultPositions();
		
		// Draw pieces
		pieces = new Image();
		pieces.src = 'pieces.png';
		pieces.onload = drawPieces;

		canvas.addEventListener('click', board_click, false);
	}
	else
	{
		alert("Canvas not supported!");
	}
}

function drawBoard()
{	
	for(iRowCounter = 0; iRowCounter < NUMBER_OF_ROWS; iRowCounter++)
	{
		drawRow(iRowCounter);
	}	
	
	// Draw outline
	ctx.lineWidth = 1;
    ctx.strokeStyle = '#848484';
	ctx.strokeRect(0, 0, NUMBER_OF_ROWS * BLOCK_SIZE, NUMBER_OF_COLS * BLOCK_SIZE);	
}

function drawRow(iRowCounter)
{
	// Draw 8 block left to right
	for(iBlockCounter = 0; iBlockCounter < NUMBER_OF_ROWS; iBlockCounter++)
	{
		drawBlock(iRowCounter, iBlockCounter);
	}
}

function drawBlock(iRowCounter, iBlockCounter)
{	
	// Set the background

	ctx.fillStyle = getBlockColour(iRowCounter, iBlockCounter);
	
	// Draw rectangle for the background
	ctx.fillRect(iRowCounter * BLOCK_SIZE, iBlockCounter * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
	ctx.strokeStyle = '#FFFFFF';
	//ctx.strokeRect(iRowCounter * BLOCK_SIZE, iBlockCounter * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
	ctx.stroke();	
}

function getBlockColour(iRowCounter, iBlockCounter)
{
	var cStartColour;
	
	// Alternate the block colour
	if(iRowCounter % 2)
		cStartColour = (iBlockCounter % 2?BLOCK_COLOUR_1:BLOCK_COLOUR_2);
	else
		cStartColour = (iBlockCounter % 2?BLOCK_COLOUR_2:BLOCK_COLOUR_1);
		
	return cStartColour;
}

function drawLines()
{

	//Pintamos las lineas horizontales
	for(iRowCounter = 0; iRowCounter < NUMBER_OF_ROWS; iRowCounter++)
	{

		ctx.fillStyle = "black";
 	 	ctx.font = "bold 10px Arial";
		ctx.fillText(iRowCounter+1, 0, (iRowCounter*BLOCK_SIZE)+(BLOCK_SIZE/2)+5);

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
	ctx.arc(275, 275, 5, 0, 2 * Math.PI, true);
	ctx.arc((3*BLOCK_SIZE)+BLOCK_SIZE/2, 275, 5, 0, 2 * Math.PI, true);
	ctx.arc((15*BLOCK_SIZE)+BLOCK_SIZE/2, 275, 5, 0, 2 * Math.PI, true);
	ctx.arc((3*BLOCK_SIZE)+BLOCK_SIZE/2, (3*BLOCK_SIZE)+BLOCK_SIZE/2, 5, 0, 2 * Math.PI, true);
	ctx.arc((15*BLOCK_SIZE)+BLOCK_SIZE/2, (3*BLOCK_SIZE)+BLOCK_SIZE/2, 5, 0, 2 * Math.PI, true);
	ctx.arc((9*BLOCK_SIZE)+BLOCK_SIZE/2, (3*BLOCK_SIZE)+BLOCK_SIZE/2, 5, 0, 2 * Math.PI, true);
	ctx.arc((3*BLOCK_SIZE)+BLOCK_SIZE/2, (15*BLOCK_SIZE)+BLOCK_SIZE/2, 5, 0, 2 * Math.PI, true);
	ctx.arc((15*BLOCK_SIZE)+BLOCK_SIZE/2, (15*BLOCK_SIZE)+BLOCK_SIZE/2, 5, 0, 2 * Math.PI, true);
	ctx.arc((9*BLOCK_SIZE)+BLOCK_SIZE/2, (15*BLOCK_SIZE)+BLOCK_SIZE/2, 5, 0, 2 * Math.PI, true);
	ctx.fill();		
}

function halmaOnClick(e) {
    var cell = getCursorPosition(e);


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

	ctx.beginPath();
	if(color%2!=0){
		ctx.fillStyle = '#000000';
	}
	else
	{
		ctx.fillStyle = '#FFFFFF';
	}
	color++;
	ctx.arc(posX, posY, 14, 0, 2 * Math.PI, true);
	ctx.fill();	

	//alert(x+', '+y);
}