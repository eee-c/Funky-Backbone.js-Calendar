library funky_calendar_test;

import 'package:unittest/unittest.dart';
import 'package:plummbur_kruk/kruk.dart';
import 'package:intl/intl.dart';
import 'package:js/js.dart' as js;
// import 'package:scheduled_test/scheduled_test.dart';

import 'dart:html';
import 'dart:async';

final String URL_ROOT = '${Kruk.SERVER_ROOT}/widgets';
final iso8601 = new DateFormat('yyyy-MM-dd');

final today = new DateTime.now();

final _fourteenth = new DateTime(today.year, today.month, 14);
final fourteenth = iso8601.format(_fourteenth);

final _fifteenth = new DateTime(today.year, today.month, 15);
final fifteenth = iso8601.format(_fifteenth);

main() {
  group("the initial view", (){
    var el;

    setUp((){
      document.head.append(new BaseElement()..href = Kruk.SERVER_ROOT);;

      el = document.body.append(new Element.html('<div id=calendar-${currentTestCase.id}>'));

       var doc = '''
         {
           "title": "Get Funky",
           "description": "asdf",
           "startDate": "${fifteenth}"
         }''';

      return Future.wait([
        Kruk.create(doc),
        Kruk.alias('/widgets', as: '/appointments')
      ]);
    });

    tearDown((){
      js.context.Backbone.history.navigate('');

      el.remove();
      queryAll('#calendar-navigation').forEach((el)=> el.remove());
      // return Kruk.deleteAll();
    });

    test("populates the calendar with appointments", (){
      new js.Proxy(js.context.Cal, el);
      js.context.Backbone.history.loadUrl();

      var cell = queryAll('td').
        where((el)=> el.id == fifteenth).
        first;

      new Timer(
        new Duration(milliseconds: 100),
        expectAsync0((){
          expect(cell.text, matches("Get Funky"));
        })
      );
    });

    solo_test("can create new appointments", (){
      new js.Proxy(js.context.Cal, el);
      js.context.Backbone.history.loadUrl();

      var cell = queryAll('td').
        where((el)=> el.id == fourteenth).
        first
          ..click();

      query('#calendar-add-appointment')
        ..query('input.title').
          value = 'Test Appointment'
        ..query('input.description').
          value = 'asdf';

      var ok = query('.ui-dialog-buttonset').
        query('button').
        query('span');

      print(ok.text);

      // query('.ui-dialog-buttonset').
      //   query('button').
      //   query('span').
      //   click();

      js.context.jQuery('.ui-dialog-buttonset button').click();

      new Timer(
        new Duration(milliseconds: 100),
        expectAsync0((){
          expect(cell.text, matches("Test Appointment"));
        })
      );
    });

  });

  pollForDone(testCases);
}

pollForDone(List tests) {
  if (tests.every((t)=> t.isComplete)) {
    window.postMessage('done', window.location.href);
    return;
  }

  var wait = new Duration(milliseconds: 100);
  new Timer(wait, ()=> pollForDone(tests));
}
