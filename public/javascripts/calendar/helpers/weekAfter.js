define([], function() {
  return function(date) {
    var plus7 = new Date(date.getTime() + 7*24*60*60*1000);

    // Effing daylight savings time
    if (plus7.getHours() === 23)
      return new Date(plus7.getTime() + 60*60*1000);

    if (plus7.getHours() === 1)
      return new Date(plus7.getTime() - 60*60*1000);

    return plus7;
  };
});
