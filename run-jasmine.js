/**
 * Wait until the test condition is true or a timeout occurs. Useful for waiting
 * on a server response or for a ui change (fadeIn, etc.) to occur.
 *
 * @param testFx javascript condition that evaluates to a boolean,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param onReady what to do when testFx condition is fulfilled,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param timeOutMillis the max amount of time to wait. If not specified, 3 sec is used.
 */
function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3001, //< Default Max Timeout is 3s
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function() {
            if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if(!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    console.log("'waitFor()' timeout");
                    phantom.exit(1);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 100); //< repeat check every 250ms
};


if (phantom.args.length === 0 || phantom.args.length > 2) {
    console.log('Usage: run-jasmine.js URL');
    phantom.exit();
}

var page = new WebPage();

// Route "console.log()" calls from within the Page context to the main Phantom context (i.e. current "this")
page.onConsoleMessage = function(msg) {
    console.log(msg);
};

page.open(phantom.args[0], function(status){
  if (status !== "success") {
        console.log("Unable to access network");
        phantom.exit();
    }
  else {
    waitFor(
      function(){
        return page.evaluate(function(){
          if (document.body.querySelector('.finished-at')) {
            return true;
          }
          return false;
        });
      },
      function(){
        var passed = page.evaluate(function(){
          var passed = jasmineEnv.currentRunner().results().passed();

          console.log('');
          if (passed) {
            console.log('Succeeded.');
          }
          else {
            console.log('Failed: ' + jasmineEnv.currentRunner().results().failedCount);
          }
          console.log('');

          function has_message(el) {
            var yes = false;
            for (var i=0; i < el.children.length; i++) {
              if (el.children[i].className == 'spec failed') yes = true;
            }
            return yes;
          }

          function failed_children(el) {
            var failed = [];
            for (var i=0; i < el.children.length; i++) {
              if (el.children[i].className == 'suite failed') failed.push(el.children[i]);
            }
            return failed;
          }

          function log_failure(failure_el, indent) {
            if (typeof(indent) == 'undefined') indent = '';

            console.log(indent + failure_el.querySelector('.description').innerText);

            if (has_message(failure_el)) {
              console.log(indent + '  ' + failure_el.querySelector('.messages > .fail').innerText);
            }
            else {
              failed_children(failure_el).forEach(function (failed_child) {
                log_failure(failed_child, indent + '  ');
              });
            }
          }

          if (!passed) {
            log_failure(document.body.querySelectorAll('div.jasmine_reporter > div.suite.failed')[0]);
          }

          return passed;
        });
        console.log('');
        phantom.exit(passed ? 0 : 1);
      }
    );
  }
});
