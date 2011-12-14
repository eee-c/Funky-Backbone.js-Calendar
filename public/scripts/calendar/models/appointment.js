define(['backbone', 'underscore'], function(Backbone, _) {
  return Backbone.Model.extend({
    urlRoot : '/appointments',
    initialize: function(attributes) {
      if (!this.id)
        this.id = attributes['_id'];
    },
    save: function(attributes, options) {
      options || (options = {});
      options['headers'] = {'If-Match': this.get("rev")};
      Backbone.Model.prototype.save.call(this, attributes, options);
    },
    destroy: function() {
      Backbone.Model.prototype.destroy.call(this, {
        headers: {'If-Match': this.get("rev")}
      });
    },
    get: function(attribute) {
      return Backbone.Model.prototype.get.call(this, "_" + attribute) ||
             Backbone.Model.prototype.get.call(this, attribute);
    }
  });
});
