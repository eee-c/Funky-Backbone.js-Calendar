define(['backbone',
        'calendar/helpers/to_iso8601',
        'calendar/helpers/from_iso8601',
        'calendar/helpers/template'],
function(Backbone, to_iso8601, from_iso8601, template) {
  function previousMonth(month) {
    var date = from_iso8601(month),
        msInDay = 24*60*60*1000,
        msThisMonth = date.getDate()*msInDay,
        dateInPreviousMonth = new Date(date - msThisMonth - msInDay);

    return to_iso8601(dateInPreviousMonth).substr(0,7);
  }

  function nextMonth(month) {
    var date = from_iso8601(month),
        msInDay = 24*60*60*1000,
        msThisMonth = date.getDate()*msInDay,
        dateInNextMonth = new Date(date - msThisMonth + 32*msInDay);

    return to_iso8601(dateInNextMonth).substr(0,7);
  }

  return Backbone.View.extend({
    initialize: function(options) {
      options.collection.bind('calendar:change:date', this.render, this);
    },
    template: template(
      '<div class="previous">' +
        '<a href="#month/{{ previous_date }}">previous</a>' +
      '</div>' +
      '<div class="next">' +
        '<a href="#month/{{ next_date }}">next</a>' +
      '</div>'
    ),
    render: function() {
      var date = this.collection.getDate();
      $(this.el).html(this.template({
        previous_date: previousMonth(date),
        next_date: nextMonth(date)
      }));

      return this;
    }
  });
});
