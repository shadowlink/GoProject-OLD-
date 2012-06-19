exports.main = function(req, res){
  res.render('main', {
        locals: {
          title: 'GoProject',
          user: req.session.nick
        }
      });
};