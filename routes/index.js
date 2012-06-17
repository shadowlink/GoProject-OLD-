
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { mailOk: "", user: req.session.nick, title: "GoProject" })
};

exports.about = function(req, res){
  res.render('about', { title: 'About' })
};

exports.registro = function(req, res){
  res.render('registro', { title: 'Registro' })
};
