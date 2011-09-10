jasmine.getFixtures().preload('homepage.html');

var couch_doc = '{"_id":"42",' +
                 '"_rev":"1-2345",' +
                 '"title":"Funk",' +
                 '"description":"asdf",' +
                 '"startDate":"2011-09-15"}';

describe("Home", function() {
  beforeEach(function() {
    var server = sinon.fakeServer.create();
    server.respondWith(
      '{"total_rows":1,"rows":[{"doc":' + couch_doc + '}]}'
    );

    loadFixtures('homepage.html');

    server.respond();
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
