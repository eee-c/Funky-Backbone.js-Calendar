define([], function() {
  return function(date) {
    var parts = date.split(/\D/),
        year = parseInt(parts[0], 10),
        month = parseInt(parts[1], 10) - 1;

    return new Date(year, month, 1);
  };
});
