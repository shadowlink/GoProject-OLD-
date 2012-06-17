var cradle = require('cradle');

BetaProvider = function(host, port) {
  this.connection= new(cradle.Connection)({
    host: 'http://nodejitsudb303329721299.iriscouch.com',
    port: 5984,
    cache: true,
    raw: false
  });
  this.db = this.connection.database('beta');
};

BetaProvider.prototype.findAll = function(callback) {
    this.db.view('beta/all',function(error, result) {
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

BetaProvider.prototype.findById = function(id, callback) {
    this.db.get(id, function(error, result) {
        if( error ) callback(error)
        else callback(null, result)
      });
};

BetaProvider.prototype.save = function(beta, callback) {
    this.db.save(beta, function(error, result) {
      if( error ) callback(error)
      else callback(null, beta);
    });
};

exports.BetaProvider = BetaProvider;