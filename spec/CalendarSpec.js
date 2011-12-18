describe("Calendar", function() {
  var server
    , year = (new Date).getFullYear()
    , m = (new Date).getMonth() + 1
    , month = m<10 ? '0'+m : m
    , fourteenth = year + '-' + month + "-14"
    , fifteenth = year + '-' + month + "-15"
    , doc = {
        "id": "42",
        "title": "Get Funky",
        "description": "asdf",
        "startDate": fifteenth
      }
    , doc_list = [doc];

  beforeEach(function() {
    // stub XHR requests with sinon.js
    server = sinon.fakeServer.create();

    $('body').append('<h1>Funky Calendar<span class="year-and-month"/></h1>');
    $('body').append('<div id="calendar"/>');
  });

  afterEach(function() {
    $('h1').remove();
    $('#calendar').remove();
    $('#calendar-navigation').remove();
  });

  afterEach(function() {
    Backbone.history.navigate('');
  });

  afterEach(function() {
    // allow normal XHR requests to work again
    server.restore();
  });

  afterEach(function() {
    $('#calendar-add-appointment').dialog('close');
    // $('#calendar-add-appointment').remove();

    $('#calendar-edit-appointment').dialog('close');
    // $('#calendar-edit-appointment').remove();
  });

  describe("routing", function() {
    beforeEach(function() {
      window.calendar = new Cal($('#calendar'));
      Backbone.history.loadUrl();

      // populate appointments for this month
      server.respondWith('GET', /\/appointments/,
        [200, { "Content-Type": "application/json" }, JSON.stringify(doc_list)]);
      server.respond();

      var appointments = window.calendar.appointments;
    });

    it("defaults to the current month", function() {
      var today = new Date()
        , year = today.getFullYear()
        , m = today.getMonth() + 1
        , month = m<10 ? '0'+m : m;

      expect(Backbone.history.getFragment())
        .toEqual("month/" + year + "-" + month);
    });

    it("sets the date of the appointment collection", function() {
      var appointments = window.calendar.appointments;
      expect(appointments.getDate())
         .toEqual(year + '-' + month);
    });
  });

  describe("the initial view", function() {
    beforeEach(function() {
      window.calendar = new Cal($('#calendar'));
      Backbone.history.loadUrl();

      // populate appointments for this month
      server.respondWith('GET', /\/appointments/,
        [200, { "Content-Type": "application/json" }, JSON.stringify(doc_list)]);
      server.respond();
    });


    describe("the page title", function() {
      it("contains the current month", function() {
        expect($('h1')).toHaveText(new RegExp(year + '-' + month));
      });
    });

    describe("a collection of appointments", function() {
      it("populates the calendar with appointments", function() {
        expect($('#' + fifteenth)).toHaveText(/Get Funky/);
      });
    });

    describe("adding an appointment", function() {
      it("sends clicks on day to an add dialog", function() {
        $('#' + fourteenth).click();

        var dialog = $('#calendar-add-appointment').parent();
        expect(dialog).toBeVisible();
        expect(dialog).toHaveText(/Add/);
      });

      it("displays the date clicked in the add dialog", function() {
        $('#' + fourteenth).click();
        expect($('#calendar-add-appointment')).toHaveText(new RegExp(fourteenth));
      });

      it("adds a new appointment to the UI when saved", function() {
        $('#' + fourteenth).click();
        $('.ok:visible').click();

        var appointment = {
          "id": "42",
          "rev": "1-2345",
          "startDate": fourteenth,
          "title": "Groovy meeting",
          "description": "asdf"
        };

        server.respondWith('POST', '/appointments', JSON.stringify(appointment));
        server.respond();

        expect($('#' + fourteenth)).toHaveText(/Groovy/);
      });
    });

    describe("deleting an appointment", function() {
      it("clicking the \"X\" removes records from the data store and UI", function() {
        jasmine.Clock.useMock();

        $('.delete', '#' + fifteenth).click();

        server.respondWith('DELETE', '/appointments/42', '{"id":"42"}');
        server.respond();

        jasmine.Clock.tick(5000);
        expect($('#' + fifteenth)).not.toHaveText(/Funky/);
      });
    });

    describe("updating an appointment", function (){
      it("binds click events on the appointment to an edit dialog", function() {
        $('.title', '#' + fifteenth).click();
        expect($('#calendar-edit-appointment')).toBeVisible();
      });

      it("displays model updates", function () {
        var appointment = calendar.appointments.at(0);
        appointment.save({title: "Changed"});

        server.respondWith('PUT', '/appointments/42', '{"title":"Changed!!!"}');
        server.respond();

        expect($('#' + fifteenth)).toHaveText(/Changed/);
      });

      it("can edit appointments through an edit dialog", function() {
        $('.title', '#' + fifteenth).click();
        $('.ok:visible').click();

        server.respondWith('PUT', '/appointments/42', '{"title":"Changed!!!"}');
        server.respond();

        expect($('#' + fifteenth)).toHaveText(/Changed/);
      });
    });
  });

  describe("navigated view", function() {
    beforeEach(function() {
      window.calendar = new Cal($('#calendar'));
      Backbone.history.navigate('#month/1999-12', true);

      doc['startDate'] = "1999-12-31";
      doc['title'] = "Party";

      // populate appointments for this month
      server.respondWith('GET', /\/appointments/,
        [200, { "Content-Type": "application/json" }, JSON.stringify(doc_list)]);
      server.respond();
    });

    it("should have an appointment", function() {
       expect($('#calendar')).toHaveText(/Party/);
    });
  });
});
