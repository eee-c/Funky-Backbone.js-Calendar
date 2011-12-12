define(['backbone',
        'underscore',
        'calendar/views/CalendarMonthWeek',
        'calendar/helpers/firstOfTheMonth',
        'calendar/helpers/to_iso8601',
        'calendar/helpers/weekAfter'],
function(Backbone, _, CalendarMonthWeek, firstOfTheMonth, to_iso8601, weekAfter) {
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
