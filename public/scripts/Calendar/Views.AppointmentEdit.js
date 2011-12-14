define(function(require) {
  var $ = require('jquery')
    , Backbone = require('backbone');

  return new (Backbone.View.extend({
    initialize: function() {
      this.ensureDom();
      this.activateDialog();
      this.el = $(this.el).parent();
      this.delegateEvents();
    },
    reset: function(options) {
      this.model = options.model;
      this.render();
    },
    render: function () {
      $('.ui-dialog-content', this.el).dialog('open');

      $('.startDate', this.el).
        html(this.model.get("startDate"));
      $('.title', this.el).
        val(this.model.get("title"));
      $('.description', this.el).
        val(this.model.get("description"));
    },
    events : {
      'click .ok': 'update',
      'keypress input[type=text]': 'updateOnEnter'
    },
    updateOnEnter: function(e) {
      if (e.keyCode != 13) return;
      $('.ok', this.el).click();
    },
    update: function() {
      if (!this.model) return;

      var options = {
        title: $('.title', '#calendar-edit-appointment').val(),
        description: $('.description', '#calendar-edit-appointment').val()
      };
      this.model.save(options);
    },
    ensureDom: function() {
      if ($('#calendar-edit-appointment').length > 0) return;

      $(this.el).attr('id', 'calendar-edit-appointment');
      $(this.el).attr('title', 'Edit calendar appointment');

      $(this.el).append(
        '<h2 class="startDate"></h2>' +
        '<p>Title</p>' +
        '<p>' +
          '<input class="title" type="text" name="title"/>' +
        '</p>' +
        '<p>Description</p>' +
        '<p>' +
          '<input class="description" type="text" name="description"/>' +
        '</p>'
      );
    },
    activateDialog: function() {
      $(this.el).dialog({
        autoOpen: false,
        modal: true,
        buttons: [
          { text: "OK",
            class: "ok",
            click: function() { $(this).dialog("close"); } },
          { text: "Cancel",
            click: function() { $(this).dialog("close"); } } ]
      });
    }
  }));
});
