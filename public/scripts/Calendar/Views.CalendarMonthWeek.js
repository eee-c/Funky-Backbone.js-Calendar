define(function(require) {
 var Backbone = require('backbone')
   , _ = require('underscore')
   , CalendarMonthDay = require('Calendar/Views.CalendarMonthDay');

  function dayAfter(date) {
    var plus1 = new Date(date.getTime() + 24*60*60*1000);

    // Effing daylight savings time
    if (plus1.getHours() === 23)
      return new Date(plus1.getTime() + 60*60*1000);

    if (plus1.getHours() === 1)
      return new Date(plus1.getTime() - 60*60*1000);

    return plus1;
  };

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
