define(function(require) {
  var Backbone = require('backbone')
    , _ = require('underscore')
    , to_iso8601 = require('calendar/helpers/to_iso8601')
    , AppointmentAdd = require('calendar/views/AppointmentAdd');

  return Backbone.View.extend({
    tagName: 'td',
    initialize: function(options) {
      this.date = options.date;
    },
    render: function() {
      this.el.id = to_iso8601(this.date);
      var html = '<span class="day-of-month">' + this.date.getDate() + '</span>';
      $(this.el).html(html);

      return this;
    },
    events : {
      'click': 'addClick'
    },
    addClick: function(e) {
      console.log("addClick");

      AppointmentAdd.reset({startDate: this.el.id});
    }
  });
});
