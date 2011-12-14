define(function(require) {
  var Backbone = require('backbone')
    , $ = require('jquery');

  return Backbone.View.extend({
    tagName: 'span',
    initialize: function(options) {
      options.collection.bind('calendar:change:date', this.render, this);

      $('span.year-and-month', 'h1').
        replaceWith(this.el);
    },
    render: function() {
      $(this.el).html(' (' + this.collection.getDate() + ') ');
    }
  });
});
