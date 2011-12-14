define(function(require) {
 var Backbone = require('backbone')
   , $ = require('jquery')
   , CalendarMonthHeader = require('Calendar/Views.CalendarMonthHeader')
   , CalendarMonthBody = require('Calendar/Views.CalendarMonthBody');

  return Backbone.View.extend({
    tagName: 'table',
    initialize: function(options) {
      this.date = options.date;
    },
    render: function() {
      var header = new CalendarMonthHeader();
      header.render();
      $(this.el).append(header.el);

      var body = new CalendarMonthBody({
        date: this.date,
        collection: this.collection
      }).render();

      $(this.el).append(body.el);

      return this;
    }
  });
});
