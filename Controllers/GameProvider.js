var cradle = require('cradle');

GameProvider = function(host, port) {
  this.connection= new(cradle.Connection)({
    host: 'http://nodejitsudb303329721299.iriscouch.com',
    port: 5984,
    cache: true,
    raw: false
  });
  this.db = this.connection.database('game');
};

GameProvider.prototype.findAll = function(callback) {
    this.db.view('game/all',function(error, result) {
      if( error ){
        callback(error)
      }else{
        var docs = [];
        result.forEach(function (row){
          docs.push(row);
        });
        callback(null, docs);
      } 
    });
};

GameProvider.prototype.findById = function(id, callback) {
    this.db.get(id, function(error, result) {
        if( error ) callback(error)
        else callback(null, result)
      });
};

GameProvider.prototype.save = function(articles, callback) {
    if( typeof(articles.length)=="undefined")
      articles = [articles];

    for( var i =0;i< articles.length;i++ ) {
      article = articles[i];
      article.created_at = new Date();
      if( article.comments === undefined ) article.comments = [];
      for(var j =0;j< article.comments.length; j++) {
        article.comments[j].created_at = new Date();
      }
    }

    this.db.save(articles, function(error, result) {
      if( error ) callback(error)
      else callback(null, articles);
    });
};

exports.GameProvider = GameProvider;