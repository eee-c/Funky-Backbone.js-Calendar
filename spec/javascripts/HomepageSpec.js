jasmine.getFixtures().preload('homepage.html');

describe("Home", function() {
  beforeEach(function() {
    var server = sinon.fakeServer.create();
    server.respondWith(
      '/appointments',
      [200,
      { "Content-Type": "application/json" },
      '{"total_rows":1,"offset":0,"rows":[' +
        '{"id":"42","key":"42","value":{"rev":"1-2345"},' +
        '"doc":{"_id":"42","_rev":"1-2345","title":"Funk","description":"asdf","startDate":"2011-09-15"}}' +
        ']}']
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
