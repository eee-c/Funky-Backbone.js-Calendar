define(['backbone'], function(Backbone) {
  return Backbone.View.extend({
    tagName: 'tr',
    render: function() {
      $(this.el).html('<th>S</th><th>M</th><th>T</th><th>W</th><th>T</th><th>F</th><th>S</th>');
    }
  });
});
