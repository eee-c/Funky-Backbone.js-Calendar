define(['jquery',
        'underscore',
        'backbone',
        'calendar/collections/appointments',
        'calendar/views/Appointment',
        'calendar/views/CalendarMonth',
        'calendar/views/CalendarNavigation',
        'calendar/views/TitleView',
        'jquery-ui'],
  function($, _, Backbone, Appointments, Appointment, CalendarMonth, CalendarNavigation, TitleView) {
    return function(root_el) {

  var Views = (function() {
    var AppointmentEdit = new (Backbone.View.extend({
      initialize: function() {
        this.ensureDom();
        this.activateDialog();
        this.el = $(this.el).parent();
        this.delegateEvents();
      },
      reset: function(options) {
        this.model = options.model;
        this.render();
      },
      render: function () {
        $('.ui-dialog-content', this.el).dialog('open');

        $('.startDate', this.el).
          html(this.model.get("startDate"));
        $('.title', this.el).
          val(this.model.get("title"));
        $('.description', this.el).
          val(this.model.get("description"));
      },
      events : {
        'click .ok': 'update',
        'keypress input[type=text]': 'updateOnEnter'
      },
      updateOnEnter: function(e) {
        if (e.keyCode != 13) return;
        $('.ok', this.el).click();
      },
      update: function() {
        if (!this.model) return;

        var options = {
          title: $('.title', '#calendar-edit-appointment').val(),
          description: $('.description', '#calendar-edit-appointment').val()
        };
        this.model.save(options);
      },
      ensureDom: function() {
        if ($('#calendar-edit-appointment').length > 0) return;

        $(this.el).attr('id', 'calendar-edit-appointment');
        $(this.el).attr('title', 'Edit calendar appointment');

        $(this.el).append(
          '<h2 class="startDate"></h2>' +
          '<p>Title</p>' +
          '<p>' +
            '<input class="title" type="text" name="title"/>' +
          '</p>' +
          '<p>Description</p>' +
          '<p>' +
            '<input class="description" type="text" name="description"/>' +
          '</p>'
        );
      },
      activateDialog: function() {
        $(this.el).dialog({
          autoOpen: false,
          modal: true,
          buttons: [
            { text: "OK",
              class: "ok",
              click: function() { $(this).dialog("close"); } },
            { text: "Cancel",
              click: function() { $(this).dialog("close"); } } ]
        });
      }
    }));

    var AppointmentAdd = new (Backbone.View.extend({
      initialize: function() {
        this.ensureDom();
        this.activateDialog();
        this.el = $(this.el).parent();
        this.delegateEvents();
      },
      reset: function(options) {
        this.startDate = options.startDate;
        this.render();
      },
      render: function () {
        $('.ui-dialog-content', this.el).dialog('open');
        $('.startDate', this.el).html(this.startDate);
        $('.title', this.el).val("");
        $('.description', this.el).val("");
      },
      events: {
        'click .ok':  'create',
        'keypress input[type=text]': 'createOnEnter'
      },
      createOnEnter: function(e) {
        if (e.keyCode != 13) return;
        $('.ok', this.el).click();
      },
      create: function() {
        appointment_collection.create({
          title: this.el.find('input.title').val(),
          description: this.el.find('input.description').val(),
          startDate: this.el.find('.startDate').html()
        });
      },
      ensureDom: function() {
        if ($('#calendar-add-appointment').length > 0) return;

        $(this.el).attr('id', 'calendar-add-appointment');
        $(this.el).attr('title', 'Add calendar appointment');

        $(this.el).append(this.make('h2', {'class': 'startDate'}));
        $(this.el).append(this.make('p', {}, 'Title'));
        $(this.el).append(this.make('p', {},
          this.make('input', {'type': "text", 'name': "title", 'class': "title"})
        ));

        $(this.el).append(this.make('p', {}, 'Description'));
        $(this.el).append(this.make('p', {},
          this.make('input', {'type': "text", 'name': "description", 'class': "description"})
        ));
      },
      activateDialog: function() {
        $(this.el).dialog({
          autoOpen: false,
          modal: true,
          buttons: [
            { text: "OK",
              class: "ok",
              click: function() { $(this).dialog("close"); } },
            { text: "Cancel",
              click: function() { $(this).dialog("close"); } } ]
        });
      }
    }));

    function template(str) {
      var orig_settings = _.templateSettings;
      _.templateSettings = {
        interpolate : /\{\{([\s\S]+?)\}\}/g
      };

      var t = _.template(str);

      _.templateSettings = orig_settings;

      return t;
    }

    var Application = Backbone.View.extend({
      initialize: function(options) {
        this.collection = appointment_collection = options.collection;

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

    return {
      Application: Application
    };
  })();

  var Routes = Backbone.Router.extend({
    initialize: function(options) {
      this.application = options.application;
    },

    routes: {
      "": "setDefault",
      "month/:date": "setMonth"
    },

    setDefault: function() {
      console.log("[setDefault]");
      var month = Helpers.to_iso8601(new Date).substr(0,7);
      Backbone.history.navigate('#month/' + month, true);
    },

    setMonth: function(date) {
      console.log("[setMonth] %s", date);
      this.application.setDate(date);
    }
  });

  var Helpers = (function() {
    function pad(n) {return n<10 ? '0'+n : n}

    function to_iso8601(date) {
      var year = date.getFullYear(),
          month = date.getMonth() + 1,
          day = date.getDate();

      return year + '-' + pad(month) + '-' + pad(day);
    }

    return {
      to_iso8601: to_iso8601
    };
  })();


  // Initialize the app
  var year_and_month = Helpers.to_iso8601(new Date()).substr(0,7),
      appointments = new Appointments([], {date: year_and_month}),
      application = new Views.Application({
        collection: appointments,
        el: root_el
      });

  new Routes({application: application});
  try {
    Backbone.history.start();
  } catch (x) {
    console.log(x);
  }

  return {
    Views: Views,
    Helpers: Helpers,
    appointments: appointments
  };
};
  }
);
