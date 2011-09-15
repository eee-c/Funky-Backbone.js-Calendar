// Load before fiddling with XHR for stubbing responses
jasmine.getFixtures().preload('homepage.html');

describe("Home", function() {
  var server,
      couch_doc = {
        "_id": "42",
        "_rev": "1-2345",
        "title": "Get Funky",
        "description": "asdf",
        "startDate": "2011-09-15"
      },
      doc_list = {
        "total_rows": 1,
        "rows":[{"doc": couch_doc}]
      };

  beforeEach(function() {
    // stub XHR requests with sinon.js
    server = sinon.fakeServer.create();

    // load fixutre into memory (already preloaded before sinon.js)
    loadFixtures('homepage.html');

    // populate appointments for this month
    server.respondWith('GET', '/appointments',
      [200, { "Content-Type": "application/json" }, JSON.stringify(doc_list)]);
    server.respond();
  });

  afterEach(function() {
    // allow normal XHR requests to work again
    server.restore();
  });

  afterEach(function() {
    $('#dialog').dialog('close');
  });

  describe("appointments", function() {
    it("populates the calendar with appointments", function() {
      expect($('#2011-09-15')).toHaveText(/Get Funky/);
    });
  });

  describe("adding an appointment", function() {
    it("sends clicks on day to an add dialog", function() {
      $('#2011-09-14').click();

      var dialog = $('#dialog').parent();
      expect(dialog).toBeVisible();
      expect(dialog).toHaveText(/Add/);
    });

    it("displays the date clicked in the add dialog", function() {
      $('#2011-09-14').click();
      expect($('#dialog')).toHaveText(/2011-09-14/);
    });

    it("adds a new appointment to the UI when saved", function() {
      $('#2011-09-14').click();
      $('.ok').click();

      var appointment = {
        "id": "42",
        "rev": "1-2345",
        "startDate": "2011-09-14",
        "title": "Groovy meeting",
        "description": "asdf"
      };

      server.respondWith('POST', '/appointments', JSON.stringify(appointment));
      server.respond();

      expect($('#2011-09-14')).toHaveText(/Groovy/);
    });
  });

  describe("deleting an appointment", function() {
    it("clicking the \"X\" removes records from the data store and UI", function() {
      jasmine.Clock.useMock();

      $('.delete', '#2011-09-15').click();

      server.respondWith('DELETE', '/appointments/42', '{"id":"42"}');
      server.respond();

      jasmine.Clock.tick(5000);
      expect($('#2011-09-15')).not.toHaveText(/Funky/);
    });
  });

  describe("updating an appointment", function (){
    it("binds click events on the appointment to an edit dialog", function() {
      $('.appointment', '#2011-09-15').click();
      expect($('#dialog')).toBeVisible();
    });

    it("displays model updates", function () {
      var appointment = Appointments.at(0);
      appointment.save({title: "Changed"});

      server.respondWith('PUT', '/appointments/42', '{"title":"Changed!!!"}');
      server.respond();

      expect($('#2011-09-15')).toHaveText(/Changed/);
    });

    it("can edit appointments through an edit dialog", function() {
      $('.appointment', '#2011-09-15').click();
      $('.ok').click();

      server.respondWith('PUT', '/appointments/42', '{"title":"Changed!!!"}');
      server.respond();

      expect($('#2011-09-15')).toHaveText(/Changed/);
    });
  });
});
