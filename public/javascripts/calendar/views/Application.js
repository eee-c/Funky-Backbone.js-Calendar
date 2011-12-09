define(['backbone',
        'jquery',
        'underscore',
        'calendar/views/TitleView',
        'calendar/views/CalendarNavigation',
        'calendar/views/CalendarMonth',
        'calendar/views/Appointment'],
function(Backbone, $, _, TitleView, CalendarNavigation, CalendarMonth, Appointment) {
  return Backbone.View.extend({
    initialize: function(options) {
      this.render();

      this.initialize_appointment_views();
      this.initialize_navigation();
      this.initialize_title();
    },
    setDate: function(date) {
      this.collection.setDate(date);
      this.render();
    },
    render: function() {
      var date = this.collection.getDate();

      var month = new CalendarMonth({date: date});

      $(this.el).html(month.render().el);
    },
    initialize_appointment_views: function() {
      this.collection.
        bind('add', _.bind(this.render_appointment, this));
      this.collection.
        bind('reset', _.bind(this.render_appointment_list, this));
    },
    initialize_navigation : function() {
      $(this.el).after('<div id="calendar-navigation">');

      var nav = new CalendarNavigation({
        el: $('#calendar-navigation'),
        collection: this.collection
      });
      nav.render();
    },
    initialize_title: function() {
      new TitleView({collection: this.collection});
    },
    render_appointment: function(appointment) {
      var view = new Appointment({model: appointment});
      view.render();
    },
    render_appointment_list: function(list) {
      list.each(this.render_appointment);
    }
  });
});
