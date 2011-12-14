define(function(require) {
 var Backbone = require('backbone')
   , _ = require('underscore')
   , CalendarMonthWeek = require('Calendar/Views.CalendarMonthWeek')
   , to_iso8601 = require('Calendar/Helpers.to_iso8601');

  function weekAfter(date) {
    var plus7 = new Date(date.getTime() + 7*24*60*60*1000);

    // Effing daylight savings time
    if (plus7.getHours() === 23)
      return new Date(plus7.getTime() + 60*60*1000);

    if (plus7.getHours() === 1)
      return new Date(plus7.getTime() - 60*60*1000);

    return plus7;
  };

  function firstOfTheMonth(date) {
    var parts = date.split(/\D/),
        year = parseInt(parts[0], 10),
        month = parseInt(parts[1], 10) - 1;

    return new Date(year, month, 1);
  };

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
