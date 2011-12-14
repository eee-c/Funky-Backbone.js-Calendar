define(function(require) {
  var $ = require('jquery')
    , _ = require('underscore')
    , Backbone = require('backbone')
    , Router = require('Calendar/Router')
    , Appointments = require('Calendar/Collections.Appointments')
    , Application = require('Calendar/Views.Application')
    , to_iso8601 = require('Calendar/Helpers.to_iso8601');

  require('jquery-ui');

  return function(root_el) {
    var year_and_month = to_iso8601(new Date()).substr(0,7)
      , appointments = new Appointments([], {date: year_and_month})
      , application = new Application({
          collection: appointments,
          el: root_el
        });

    new Router({application: application});
    try {
      Backbone.history.start();
    }
    catch (x) {
      console.log(x);
    }

    return {
      application: application,
      appointments: appointments
    };
  };
});
