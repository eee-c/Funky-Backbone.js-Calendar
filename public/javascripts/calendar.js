define(['jquery',
        'underscore',
        'backbone',
        'calendar/collections/appointments',
        'calendar/views/Application',
        'calendar/helpers/to_iso8601',
        'jquery-ui'],
function($, _, Backbone, Appointments, Application, to_iso8601) {
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
        var month = to_iso8601(new Date).substr(0,7);
        Backbone.history.navigate('#month/' + month, true);
      },

      setMonth: function(date) {
        console.log("[setMonth] %s", date);
        this.application.setDate(date);
      }
    });

    // Initialize the app
    var year_and_month = to_iso8601(new Date()).substr(0,7),
        appointments = new Appointments([], {date: year_and_month}),
        application = new Application({
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
      appointments: appointments
    };
  };
});
