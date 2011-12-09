define([], function() {
  return function(date) {
    var parts = date.split(/\D+/),
        year = parseInt(parts[0]),
        month = parseInt(parts[1], 10),
        day = parseInt(parts[2] || 1, 10);

    return new Date(year, month-1, day);
  };
});
