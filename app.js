/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , db = require('dirty')('appointments.db')
  , dirtyUuid = require('dirty-uuid');

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

// TODO: honor the date parameter
app.get('/appointments', function(req, res){
  console.log("[get /appointments]");

  var list = [];
  db.forEach(function(id, appointment) {
    if (appointment) list.push(appointment);
  });

  res.send(JSON.stringify(list));
});

app.delete('/appointments/:id', function(req, res){
  console.log("[delete /appointments] " +  req.params.id);
  db.rm(req.params.id);
  res.send('{}');
});

app.put('/appointments/:id', function(req, res){
  console.log("[put /appointments] " +  req.params.id);

  db.set(req.params.id, req.body);

  res.statusCode = 201;
  res.send(JSON.stringify(req.body));
});

app.post('/appointments', function(req, res){
  console.log("[post /appointments]");

  var appointment = req.body;
  appointment['id'] = dirtyUuid();

  db.set(appointment['id'], appointment);

  res.statusCode = 201;
  res.send(JSON.stringify(appointment));
});

if (app.settings.env != 'test') {
  app.listen(3000);
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
}
