exports.all = function(req, res){
  
  var GameProvider = require('../Controllers/GameProvider').GameProvider;
  var gameProvider= new GameProvider();
  
  gameProvider.findAll(function(error, result){
    res.json(result);
  })
};
