exports.login = function(req, res){
  
  var UserProvider = require('../Controllers/UserProvider').UserProvider;
  var userProvider= new UserProvider();
  
  userProvider.findById(req.body.user, function(error, result){
    if(result && result.pass==req.body.pass){
      req.session.nick=req.body.user;
      res.redirect('/main');
    }
    else
    {
      res.redirect('/');
    }
  })
  
  
};

exports.beta = function(req, res){
  
  var UserProvider = require('../Controllers/BetaProvider').UserProvider;
  var betaProvider= new BetaProvider();
  
  var beta = {
    _id: req.body.mail
  };
  betaProvider.save(beta, function(vacio, beta){
    res.render('index', {
      locals: {
        title: 'GoProject',
        user: req.session.nick,
        mailOk: req.body.mail
      }
    }); 
  });
  
};