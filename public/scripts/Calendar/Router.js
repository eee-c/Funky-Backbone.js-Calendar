define(function(require) {
  var Backbone = require('backbone')
    , to_iso8601 = require('Calendar/Helpers.to_iso8601');

  return Backbone.Router.extend({
    initialize: function(options) {
      this.application = options.application;
    },

    routes: {
      "": "setDefault",
      "month/:date": "setMonth"
    },

    setDefault: function() {
      console.log("[setDefault]");
      var month = to_iso8601(new Date).substr(0,7);
      Backbone.history.navigate('#month/' + month, true);
    },

    setMonth: function(date) {
      console.log("[setMonth] %s", date);
      this.application.setDate(date);
    }
  });
});
