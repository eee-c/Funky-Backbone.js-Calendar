define(function(require) {
  var Backbone = require('backbone')
    , _ = require('underscore')
    , template = require('Calendar/Helpers.template')
    , AppointmentEdit = require('Calendar/Views.AppointmentEdit');

  return Backbone.View.extend({
    template: template(
      '<span class="appointment" title="{{ description }}">' +
      '  <span class="title">{{title}}</span>' +
      '  <span class="delete">X</span>' +
      '</span>'
    ),
    initialize: function(options) {
      this.container = $('#' + this.model.get('startDate'));
      options.model.bind('destroy', this.remove, this);
      options.model.bind('error', this.deleteError, this);
      options.model.bind('change', this.render, this);
    },
    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      this.container.append($(this.el));
      return this;
    },
    events: {
      'click .title': 'handleEdit',
      'click .delete': 'handleDelete'
    },
    handleDelete: function(e) {
      console.log("deleteClick");

      this.model.destroy();
      return false;
    },
    makeActive: function() {
      $(this.el).addClass('active');
    },
    handleEdit: function(e) {
      console.log("editClick");
      this.makeActive();
      AppointmentEdit.reset({model: this.model});
      return false;
    },
    deleteError: function(model, error) {
      alert("This site was made by an idiot.");
      console.log(error);
    },
    remove: function() {
      $(this.el).remove();
    }
  });
});
