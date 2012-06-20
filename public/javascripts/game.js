var NUMBER_OF_COLS = 19,
	NUMBER_OF_ROWS = 19,
	BLOCK_SIZE = 100;

var BLOCK_COLOUR_1 = '#debf83',
	BLOCK_COLOUR_2 = '#debf83',
	HIGHLIGHT_COLOUR = '#000000';
        
function draw()
{
	// Main entry point got the HTML5 chess board example
	canvas = document.getElementById('canvas');

	// Canvas supported?
	if(canvas.getContext)
	{
		ctx = canvas.getContext('2d');

		// Calculdate the precise block size
		BLOCK_SIZE = canvas.height / NUMBER_OF_ROWS;
		
		// Draw the background
		drawBoard();

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
	ctx.lineWidth = 3;
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