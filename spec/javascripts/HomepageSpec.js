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
    server.respondWith('GET', '/appointments', JSON.stringify(doc_list));
    server.respond();
  });

  afterEach(function() {
    // allow normal XHR requests to work again
    server.restore();
  });

  it("populates the calendar with appointments", function() {
    expect($('#2011-09-15')).toHaveText(/Get Funky/);
  });

  it("binds \"X\" click events to remove records from the data store and UI", function() {
    jasmine.Clock.useMock();

    $('.delete', '#2011-09-15').click();

    server.respondWith('DELETE', '/appointments/42', '{"id":"42"}');
    server.respond();

    jasmine.Clock.tick(5000);
    expect($('#2011-09-15')).not.toHaveText(/Funky/);
  });
});
