describe("Home", function() {
  var server
    , year = (new Date).getFullYear()
    , m = (new Date).getMonth() + 1
    , month = m<10 ? '0'+m : m
    , fourteenth = year + '-' + month + "-14"
    , fifteenth = year + '-' + month + "-15"
    , couch_doc = {
        "_id": "42",
        "_rev": "1-2345",
        "title": "Get Funky",
        "description": "asdf",
        "startDate": fifteenth
      }
    , doc_list = {
        "total_rows": 1,
        "rows":[{"value": couch_doc}]
      };

  beforeEach(function() {
    // stub XHR requests with sinon.js
    server = sinon.fakeServer.create();

    $('body').append('<div id="calendar"/>');
    window.calendar = new Cal($('#calendar'));

    Backbone.history.loadUrl();

    // populate appointments for this month
    server.respondWith('GET', /\/appointments\?/,
      [200, { "Content-Type": "application/json" }, JSON.stringify(doc_list)]);
    server.respond();
  });

  afterEach(function() {
    $('#calendar').remove();
    $('#calendar-navigation').remove();
  });


  afterEach(function() {
    // allow normal XHR requests to work again
    server.restore();
  });

  afterEach(function() {
    $('#calendar-add-appointment').dialog('close');
    $('#calendar-add-appointment').remove();

    $('#calendar-edit-appointment').dialog('close');
    $('#calendar-edit-appointment').remove();
  });

  describe("appointments", function() {
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
    it("sets CouchDB revision headers", function() {
      var spy = spyOn(Backbone.Model.prototype, 'save').andCallThrough();
      var appointment = calendar.appointments.at(0);

      appointment.save({title: "Changed"});

      expect(spy.mostRecentCall.args[1].headers)
        .toEqual({ 'If-Match': '1-2345' });
    });

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
