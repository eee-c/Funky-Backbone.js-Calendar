define(['backbone',
        'underscore',
        'calendar/views/CalendarMonthDay',
        'calendar/helpers/dayAfter'],
function(Backbone, _, CalendarMonthDay, dayAfter) {
  return Backbone.View.extend({
    tagName: 'tr',
    initialize: function(options) {
      this.date = options.date;
    },
    render: function() {
      var date = this.date;
      for (var i=0; i<7; i++) {
        var day = new CalendarMonthDay({date: date});
        day.render();
        $(this.el).append(day.el);

        date = dayAfter(date);
      }
    }
  });
});
