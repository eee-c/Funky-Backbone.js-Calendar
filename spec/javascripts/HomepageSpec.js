jasmine.getFixtures().preload('homepage.html');

describe("Home", function() {
  var server,
      couch_doc = '{"_id":"42",' +
                   '"_rev":"1-2345",' +
                   '"title":"Funk",' +
                   '"description":"asdf",' +
                   '"startDate":"2011-09-15"}',
      doc_list = '{"total_rows":1,"rows":[{"doc":' + couch_doc + '}]}';

  beforeEach(function() {
    server = sinon.fakeServer.create();

    server.respondWith(doc_list);
    loadFixtures('homepage.html');
    server.respond();
  });

  afterEach(function() {
    server.restore();
  });

  it("uses the /appointments url-space", function () {
    var it = new window.Appointment;
    expect(it.urlRoot).toEqual("/appointments");
  });

  it("populates the calendar with appointments", function() {
    expect($('#2011-09-15')).toHaveText(/Funk/);
  });
});
