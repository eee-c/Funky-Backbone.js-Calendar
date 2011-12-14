define(function(require) {
 var Backbone = require('backbone')
   , _ = require('underscore')
   , CalendarMonthWeek = require('Calendar/Views.CalendarMonthWeek')
   , firstOfTheMonth = require('Calendar/Helpers.firstOfTheMonth')
   , to_iso8601 = require('Calendar/Helpers.to_iso8601')
   , weekAfter = require('Calendar/Helpers.weekAfter');

  return Backbone.View.extend({
    initialize: function(options) {
      this.date = options.date;
      this.el = [];
    },
    render: function() {
      var first = firstOfTheMonth(this.date),
          month = first.getMonth(),
          firstSunday = new Date(first.getTime() -
                          first.getDay()*24*60*60*1000);

      var date = firstSunday;
      while (to_iso8601(date).substr(0,7) <= this.date) {
        var week = new CalendarMonthWeek({
          date: date,
          collection: this.collection
        }).render();

        this.el.push(week.el);

        date = weekAfter(date);
      }

      return this;
    }
  });
});
