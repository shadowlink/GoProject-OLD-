var vows = require('vows'),
    assert = require('assert'),
    partida = require('../Class/Partida.js');
    player = require('../Class/Player.js');


var pla1 = new Player();
pla1.customId = "ShadowLink";

var pla2 = new Player();

var pla3 = new Player();

var p1 = new Partida();
p1.gameId = 'dsfdsfdsfdsfdsfdsfdsf';
p1.autor = "ShadowLink";
p1.nombre = "Partida Z";

var p2 = new Partida();
p2.gameId = 'dsfdsfdsfdsfdsfdsfdsf';
p2.autor = "ShadowLink";
p2.nombre = "Partida Z";
p2.players.push(pla1);

var p3 = new Partida();
p3.gameId = 'dsfdsfdsfdsfdsfdsfdsf';
p3.autor = "ShadowLink";
p3.nombre = "Partida Z";
p3.players.push(pla3);
p3.players.push(pla2);


vows.describe("partida").addBatch({
    "Comprobar si la partida esta llena": {
    	"Con 0 jugadores": {
	    	topic: p1.GameFull(),
	    	'Deberia devolver falso': function(topic) {
	    		assert.equal(topic, false);
	    	}
	    },
	    "Con 1 jugador": {
	    	topic: p2.GameFull(),
	    	'Deberia devolver falso': function(topic) {
	    		assert.equal(topic, false);
	    	}
	    },
	    "Con 2 jugadores": {
	    	topic: p3.GameFull(),
	    	'Deberia devolver true': function(topic) {
	    		assert.equal(topic, true);
	    	}
	    }
    }
  }).addBatch({
	"Comprobar si un jugador existe en la partida indicando su Nick": {
		"Con 0 jugadores": {
			topic: p1.PlayerExists("ShadowLink"),
			'Deberia devolver false': function(topic){
				assert.equal(topic, false);
			}
		},
		"Con 1 jugador y existe": {
			topic: p2.PlayerExists("ShadowLink"),
			'Deberia devolver true': function(topic){
				assert.equal(topic, true);
			}
		},
		"Con 2 jugadores y no existe": {
			topic: p3.PlayerExists("ShadowLink"),
			'Deberia devolver false': function(topic){
				assert.equal(topic, false);
			}
		}
	}
}).export(module);