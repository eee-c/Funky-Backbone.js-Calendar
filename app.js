/**
 * Module dependencies.
 */

var express = require('express-unstable'),
    http = require('http'),
    faye = require('faye');

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

app.get('/appointments', function(req, res){
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


app.get('/appointments/:id', function(req, res){
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

app.delete('/appointments/:id', function(req, res){
  var options = {
    method: 'DELETE',
    host: 'localhost',
    port: 5984,
    path: '/calendar/' + req.params.id,
    headers: req.headers
  };

  var couch_req = http.request(options, function(couch_response) {
    console.log("Got response: %s %s:%d%s", couch_response.statusCode, options.host, options.port, options.path);

    // TODO: apply this everywhere
    res.statusCode = couch_response.statusCode;
    couch_response.pipe(res);
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });

  couch_req.end();
});

app.put('/appointments/:id', function(req, res){
  var options = {
    method: 'PUT',
    host: 'localhost',
    port: 5984,
    path: '/calendar/' + req.params.id,
    headers: req.headers
  };

  var couch_req = http.request(options, function(couch_response) {
    console.log("Got response: %s %s:%d%s", couch_response.statusCode, options.host, options.port, options.path);

    res.statusCode = couch_response.statusCode;
    couch_response.pipe(res);
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });

  couch_req.write(JSON.stringify(req.body));
  couch_req.end();
});

app.post('/appointments', function(req, res){
  var options = {
    method: 'POST',
    host: 'localhost',
    port: 5984,
    path: '/calendar',
    headers: req.headers
  };

  var couch_req = http.request(options, function(couch_response) {
    console.log("Got response: %s %s:%d%s", couch_response.statusCode, options.host, options.port, options.path);

    couch_response.pipe(res);
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });

  couch_req.write(JSON.stringify(req.body));
  couch_req.end();
});

// Faye server
var bayeux = new faye.NodeAdapter({mount: '/faye', timeout: 45});
bayeux.attach(app);

// Faye clients
var client = bayeux.getClient();

client.subscribe('/calendars/read', function() {
  //  CouchDB connection options
  var options = {
    host: 'localhost',
    port: 5984,
    path: '/calendar/_all_docs?include_docs=true'
  };

  // Send a GET request to CouchDB
  var req = http.get(options, function(couch_response) {
    console.log("Got response: %s %s:%d%s", couch_response.statusCode, options.host, options.port, options.path);

    // Accumulate the response and publish when done
    var data = '';
    couch_response.on('data', function(chunk) { data += chunk; });
    couch_response.on('end', function() {
      var all_docs = JSON.parse(data);
      client.publish('/calendars/reset', all_docs);
    });
  });

  // If anything goes wrong, log it (TODO: publish to the /errors ?)
  req.on('error', function(e) {
    console.log("Got error: " + e.message);
  });
});

if (app.settings.env != 'test') {
  app.listen(3000);
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
}
