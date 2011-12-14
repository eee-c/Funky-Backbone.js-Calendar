define(function(require) {
  var Backbone = require('backbone')
    , _ = require('underscore')
    , mustache_templater = require('calendar/helpers/template')
    , html_template = require('text!calendar/views/Appointment.html')
    , template = mustache_templater(html_template)
    , AppointmentEdit = require('calendar/views/AppointmentEdit');

  return Backbone.View.extend({
    template: template,
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
    handleEdit: function(e) {
      console.log("editClick");

      AppointmentEdit.reset({model: this.model});
      return false;
    },
    deleteError: function(model, error) {
      // TODO: blame the user instead of the programmer...
      if (error.status == 409) {
        alert("This site does not understand CouchDB revisions.");
      }
      else {
        alert("This site was made by an idiot.");
      }
    },
    remove: function() {
      $(this.el).remove();
    }
  });
});
