
/**
 * Module dependencies.
 */

var express = require('express-unstable'),
    http = require('http');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'Funky Calendar'
  });
});

app.get('/events', function(req, res){
  var options = {
    host: 'localhost',
    port: 5984,
    path: '/calendar/_all_docs?include_docs=true'
  };

  http.get(options, function(couch_response) {
    console.log("Got response: %s %s:%d%s", couch_response.statusCode, options.host, options.port, options.path);

    couch_response.pipe(res);
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });
});


app.get('/events/:id', function(req, res){
  var options = {
    host: 'localhost',
    port: 5984,
    path: '/calendar/' + req.params.id
  };

  http.get(options, function(couch_response) {
    console.log("Got response: %s %s:%d%s", couch_response.statusCode, options.host, options.port, options.path);

    couch_response.pipe(res);
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
