define([], function() {
  function pad(n) {return n<10 ? '0'+n : n;};

  return function(date) {
    var year = date.getFullYear(),
        month = date.getMonth() + 1,
        day = date.getDate();

    return year + '-' + pad(month) + '-' + pad(day);
  };
});
