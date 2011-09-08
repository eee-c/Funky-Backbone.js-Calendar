// Force test environment
process.env.NODE_ENV = 'test';

var app = require('../app'),
    assert = require('assert');

module.exports = {
  'is a backbone.js app': function() {
    assert.response(app,
      { url: '/', timeout: 500 },
      { body: /backbone.js/ });
  }
};
