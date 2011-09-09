describe("Home", function() {
  // beforeEach(function() {
  //   loadFixtures('homepage.html');
  // });

  it("uses the /appointments url-space", function () {
    loadFixtures('homepage.html');

    var it = new window.Appointment;
    expect(it.urlRoot).toEqual("/appointments");
  });
});
