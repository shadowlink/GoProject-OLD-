
/**
 * Module dependencies.
 */

var express = require('express')
  , cradle = require('cradle')
  , util = require('util')
  , routes = require('./routes')
  , login = require('./routes/login.js')
  , main = require('./routes/main.js');

var app = module.exports = express.createServer();
//var nano = require('nano')('http://nodejitsudb303329721299.iriscouch.com:5984');

var conn = new(cradle.Connection)({
  host: 'http://nodejitsudb303329721299.iriscouch.com',
  port: 5984,
  cache: true,
  raw: false
});

var db = conn.database('users');

db.save({_id: "Lizerg" ,nick: 'Lizerg', pass: 'lizerg2005'}, function (err, res) {
    util.puts(res);
    util.puts('Usuario introducido');
});

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.cookieParser('nhispano'))
  app.use(express.session({ secret: "nyancat", nick: "" }));
  app.use(express.methodOverride());
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.logger());
  app.use(express.static(__dirname + '/public'));
});


app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});


// Routes
app.get('/', routes.index);
app.get('/main', main.main);
app.get('/registro', routes.registro);
app.post('/login', login.login);
app.post('/beta', login.beta);
app.get('/about', function(req,res){

})

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
