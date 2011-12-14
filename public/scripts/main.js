require.config({
  paths: {
    'jquery': 'jquery.min',
    'jquery-ui': 'jquery-ui.min'
  }
});

require(['Calendar'], function(Calendar){
  var calendar = new Calendar($('#calendar'));
});
