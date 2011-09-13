// Force test environment
process.env.NODE_ENV = 'test';

var app = require('../app'),
    assert = require('assert'),
    fs = require('fs');

module.exports = {
  'is a backbone.js app': function() {
    assert.response(app,
      { url: '/', timeout: 500 },
      { body: /backbone.js/ });
  },

  'generate fixture': function() {
    assert.response(app,
      { url: '/' },
      function(res) {
        fs.mkdir('spec/javascripts/fixtures', 0775, function() {
          fs.writeFile('spec/javascripts/fixtures/homepage.html', res.body);
        });
      });
  }
};
