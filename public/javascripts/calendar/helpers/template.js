define(['underscore'], function(_) {
  return function(str) {
    var orig_settings = _.templateSettings;
    _.templateSettings = {
      interpolate : /\{\{([\s\S]+?)\}\}/g
    };

    var t = _.template(str);

    _.templateSettings = orig_settings;

    return t;
  };
});
