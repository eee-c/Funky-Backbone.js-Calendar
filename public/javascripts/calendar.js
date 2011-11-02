window.Cal = function(root_el) {
  var Models = (function() {
    var Appointment = Backbone.Model.extend({
      urlRoot : '/appointments',
      initialize: function(attributes) {
        if (!this.id)
          this.id = attributes['_id'];
      },
      save: function(attributes, options) {
        options || (options = {});
        options['headers'] = {'If-Match': this.get("rev")};
        Backbone.Model.prototype.save.call(this, attributes, options);
      },
      destroy: function() {
        Backbone.Model.prototype.destroy.call(this, {
          headers: {'If-Match': this.get("rev")}
        });
      },
      get: function(attribute) {
        return Backbone.Model.prototype.get.call(this, "_" + attribute) ||
               Backbone.Model.prototype.get.call(this, attribute);
      }
    });

    return {Appointment: Appointment};
  })();

  var Collections = (function() {
    var Appointments = Backbone.Collection.extend({
      model: Models.Appointment,
      url: '/appointments',
      initialize: function(options) {
        options || (options = {});
        this.date = options.date;
      },
      fetch: function(options) {
        options || (options = {});

        var data = (options.data || {});
        options.data = {date: this.date};

        var collection = this;
        var success = options.success;
        options.success = function (resp, status, xhr) {
          collection.trigger('calendar:change:date');
          if (success) success(collection, resp);
        };

        return Backbone.Collection.prototype.fetch.call(this, options);
      },
      setDate: function(date) {
        this.date = date;
        this.fetch();
      },
      getDate: function() {
        return this.date;
      },
      parse: function(response) {
        return _(response.rows).map(function(row) { return row.value ;});
      }
    });

    return {Appointments: Appointments};
  })();

  var Views = (function() {
    var Appointment = Backbone.View.extend({
      template: template(
        '<span class="appointment" title="{{ description }}">' +
        '  {{title}}' +
        '  <span class="delete">X</span>' +
        '</span>'
      ),
      initialize: function(options) {
        this.container = $('#' + this.model.get('startDate'));
        options.model.bind('destroy', this.remove, this);
        options.model.bind('error', this.deleteError, this);
        options.model.bind('change', this.render, this);
        options.model.bind('all', this.filter, this);
      },
      render: function() {
        $(this.el).html(this.template(this.model.toJSON()));
        this.container.append($(this.el));
        return this;
      },
      events: {
        'click': 'handleClick'
      },
      handleClick: function(e) {
        if ($(e.target).hasClass('delete'))
          return this.handleDelete(e);

        return this.handleEdit(e);
      },
      handleDelete: function(e) {
        console.log("deleteClick");

        e.stopPropagation();
        this.model.destroy();
      },
      handleEdit: function(e) {
        console.log("editClick");
        e.stopPropagation();

        AppointmentEdit.reset({model: this.model});
      },
      filter: function(evt, str) {
        if (evt.indexOf("calendar:filter") == -1) return;

        var regexp = new RegExp(str, "i");
        if (this.model.get("title").toString().match(regexp)) {
          $(this.el).addClass("highlight");
        }
        else {
          $(this.el).removeClass("highlight");
        }
      },
      deleteError: function(model, error) {
        // TODO: blame the user instead of the programmer...
        if (error.status == 409) {
          alert("This site does not understand CouchDB revisions.");
        }
        else {
          alert("This site was made by an idiot.");
        }
      },
      remove: function() {
        $(this.el).remove();
      }
    });

    var CalendarMonth = Backbone.View.extend({
      tagName: 'table',
      initialize: function(options) {
        this.date = options.date;
      },
      render: function() {
        // TODO:
        // $('span.year-and-month', 'h1').html(' (' + this.date + ')');

        var header = new CalendarMonthHeader();
        header.render();
        $(this.el).append(header.el);

        var body = new CalendarMonthBody({date: this.date});
        body.render();
        $(this.el).append(body.el);

        return this;
      }
    });

    var CalendarMonthHeader = Backbone.View.extend({
      tagName: 'tr',
      render: function() {
        $(this.el).html('<th>S</th><th>M</th><th>T</th><th>W</th><th>T</th><th>F</th><th>S</th>');
      }
    });

    var CalendarMonthBody = Backbone.View.extend({
      initialize: function(options) {
        this.date = options.date;
        this.el = [];
      },
      render: function() {
        var firstOfTheMonth = Helpers.firstOfTheMonth(this.date),
            month = firstOfTheMonth.getMonth(),
            firstSunday = new Date(firstOfTheMonth.getTime() -
                            firstOfTheMonth.getDay()*24*60*60*1000);

        var date = firstSunday;
        while (Helpers.to_iso8601(date).substr(0,7) <= this.date) {
          var week = new CalendarMonthWeek({date: date});
          week.render();
          this.el.push(week.el);

          date = Helpers.weekAfter(date);
        }
      }
    });

    var CalendarMonthWeek = Backbone.View.extend({
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

          date = Helpers.dayAfter(date);
        }
      }
    });

    var CalendarMonthDay = Backbone.View.extend({
      tagName: 'td',
      initialize: function(options) {
        this.date = options.date;
      },
      render: function() {
        this.el.id = Helpers.to_iso8601(this.date);
        var html = '<span class="day-of-month">' + this.date.getDate() + '</span>';
        $(this.el).html(html);

        return this;
      },
      events : {
        'click': 'addClick'
      },
      addClick: function(e) {
        console.log("addClick");

        AppointmentAdd.reset({startDate: this.el.id});
      }
    });

    var AppointmentEdit = new (Backbone.View.extend({
      el: $('#edit-dialog').parent(),
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
        var options = {
          title: $('.title', '#edit-dialog').val(),
          description: $('.description', '#edit-dialog').val()
        };
        this.model.save(options);
      }
    }));

    var AppointmentAdd = new (Backbone.View.extend({
      el: $("#add-dialog").parent(),
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
      }
    }));

    var CalendarNavigation = Backbone.View.extend({
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
          previous_date: Helpers.previousMonth(date),
          next_date: Helpers.nextMonth(date)
        }));

        return this;
      }
    });

    var CalendarFilter = Backbone.View.extend({
      template: template(
        '<input type="text" name="filter">' +
        '<input type="button" class="filter" value="Filter">'
      ),
      render: function() {
        $(this.el).html(this.template());
        return this;
      },
      events: {
        'click .filter':  'filter',
        'keyup input[type=text]': 'filter'
      },
      filter: function(e) {
        var filter = $('input[type=text]', this.el).val();
        console.log('calendar:filter:' + filter);
        this.collection.each(function(model) {
          model.trigger('calendar:filter', filter);
        });
      }
    });


    function template(str) {
      var orig_settings = _.templateSettings;
      _.templateSettings = {
        interpolate : /\{\{([\s\S]+?)\}\}/g
      };

      var t = _.template(str);

      _.templateSettings = orig_settings;

      return t;
    }

    var TitleView = Backbone.View.extend({
      tagName: 'span',
      initialize: function(options) {
        options.collection.bind('calendar:change:date', this.render, this);

        $('span.year-and-month', 'h1').
          replaceWith(this.el);
      },
      render: function() {
        $(this.el).html(' (' + this.collection.getDate() + ') ');
      }
    });

    var Application = Backbone.View.extend({
      initialize: function(options) {
        this.collection = appointment_collection = options.collection;

        this.render();

        this.initialize_appointment_views();
        this.initialize_navigation();
        this.initialize_filter();
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
      initialize_filter: function() {
        $(this.el).after('<div id="calendar-filter">');

        var filter = new CalendarFilter({
          el: $('#calendar-filter'),
          collection: this.collection
        });
        filter.render();
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
      window.location = '/#month/' + month;
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

    function from_iso8601(date) {
      var parts = date.split(/\D+/),
          year = parseInt(parts[0]),
          month = parseInt(parts[1], 10),
          day = parseInt(parts[2] || 1, 10);

      return new Date(year, month-1, day);
    }

    function firstOfTheMonth(date) {
      var parts = date.split(/\D/),
          year = parseInt(parts[0], 10),
          month = parseInt(parts[1], 10) - 1;

      return new Date(year, month, 1);
    }

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

    function dayAfter(date) {
      var plus1 = new Date(date.getTime() + 24*60*60*1000);

      // Effing daylight savings time
      if (plus1.getHours() === 23)
        return new Date(plus1.getTime() + 60*60*1000);

      if (plus1.getHours() === 1)
        return new Date(plus1.getTime() - 60*60*1000);

      return plus1;
    }

    function weekAfter(date) {
      var plus7 = new Date(date.getTime() + 7*24*60*60*1000);

      // Effing daylight savings time
      if (plus7.getHours() === 23)
        return new Date(plus7.getTime() + 60*60*1000);

      if (plus7.getHours() === 1)
        return new Date(plus7.getTime() - 60*60*1000);

      return plus7;
    }

    return {
      to_iso8601: to_iso8601,
      previousMonth: previousMonth,
      nextMonth: nextMonth,
      dayAfter: dayAfter,
      weekAfter: weekAfter,
      firstOfTheMonth: firstOfTheMonth
    };
  })();


  // Initialize the app
  var year_and_month = Helpers.to_iso8601(new Date()).substr(0,7),
      appointments = new Collections.Appointments({date: year_and_month}),
      application = new Views.Application({
        collection: appointments,
        el: root_el
      });

  new Routes({application: application});
  Backbone.history.start();

  return {
    Models: Models,
    Collections: Collections,
    Views: Views,
    Helpers: Helpers,
    appointments: appointments
  };
};
