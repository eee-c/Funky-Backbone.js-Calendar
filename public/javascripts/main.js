require.config({
  paths: {
    'jquery': 'jquery.min',
    'jquery-ui': 'jquery-ui.min'
  }
});

require(['calendar'], function(Calendar){
  var calendar = new Calendar($('#calendar'));
});
