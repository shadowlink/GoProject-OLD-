exports.game = function(req, res){
  res.render('game', { title: "Game", user: req.session.nick, gameId: req.params.id })
};