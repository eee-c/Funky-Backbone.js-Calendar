define([], function() {
  return function(date) {
    var plus1 = new Date(date.getTime() + 24*60*60*1000);

    // Effing daylight savings time
    if (plus1.getHours() === 23)
      return new Date(plus1.getTime() + 60*60*1000);

    if (plus1.getHours() === 1)
      return new Date(plus1.getTime() - 60*60*1000);

    return plus1;
  };
});
