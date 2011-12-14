define(function(require) {
  var Backbone = require('backbone')
    , _ = require('underscore')
    , Appointment = require('Calendar/Models.Appointment');

  return Backbone.Collection.extend({
    model: Appointment,
    url: '/appointments',
    initialize: function(models, options) {
      options || (options = {});
      this.date = options.date;
    },
    fetch: function(options) {
      options || (options = {});

      var data = (options.data || {});
      options.data = {date: this.date};

      var collection = this;
      var success = options.success;
      options.success = function (resp, status, xhr) {
        collection.trigger('calendar:change:date');
        if (success) success(collection, resp);
      };
      options.error = function () {
        console.log("[fetch] Dang");
        console.log(arguments);
      };

      return Backbone.Collection.prototype.fetch.call(this, options);
    },
    setDate: function(date) {
      this.date = date;
      this.fetch();
    },
    getDate: function() {
      return this.date;
    },
    parse: function(response) {
      return _(response.rows).map(function(row) { return row.value ;});
    }
  });
});
