define(function(require) {
 var Backbone = require('backbone')
   , _ = require('underscore')
   , CalendarMonthDay = require('Calendar/Views.CalendarMonthDay')
   , dayAfter = require('Calendar/Helpers.dayAfter');

  return Backbone.View.extend({
    tagName: 'tr',
    initialize: function(options) {
      this.date = options.date;
    },
    render: function() {
      var date = this.date;
      for (var i=0; i<7; i++) {
        var day = new CalendarMonthDay({
          date: date,
          collection: this.collection
        }).render();

        $(this.el).append(day.el);

        date = dayAfter(date);
      }

      return this;
    }
  });
});
