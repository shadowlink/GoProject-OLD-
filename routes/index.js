
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Indice' })
};

exports.about = function(req, res){
  res.render('about', { title: 'About' })
};