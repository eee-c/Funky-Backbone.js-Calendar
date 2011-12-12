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
      this.collection = options.collection;
      this.startDate = options.startDate;
      this.render();
    },
    render: function () {
      $('.ui-dialog-content', this.el).dialog('open');
      $('.startDate', this.el).html(this.startDate);
      $('.title', this.el).val("");
      $('.description', this.el).val("");
    },
    events: {
      'click .ok':  'create',
      'keypress input[type=text]': 'createOnEnter'
    },
    createOnEnter: function(e) {
      if (e.keyCode != 13) return;
      $('.ok', this.el).click();
    },
    create: function() {
      this.collection.create({
        title: this.el.find('input.title').val(),
        description: this.el.find('input.description').val(),
        startDate: this.el.find('.startDate').html()
      });
    },
    ensureDom: function() {
      if ($('#calendar-add-appointment').length > 0) return;

      $(this.el).attr('id', 'calendar-add-appointment');
      $(this.el).attr('title', 'Add calendar appointment');

      $(this.el).append(this.make('h2', {'class': 'startDate'}));
      $(this.el).append(this.make('p', {}, 'Title'));
      $(this.el).append(this.make('p', {},
        this.make('input', {'type': "text", 'name': "title", 'class': "title"})
      ));

      $(this.el).append(this.make('p', {}, 'Description'));
      $(this.el).append(this.make('p', {},
        this.make('input', {'type': "text", 'name': "description", 'class': "description"})
      ));
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
