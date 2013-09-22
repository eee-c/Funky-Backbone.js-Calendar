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
final fifteenth = new DateTime(today.year, today.month, 15);

main() {
  group("the initial view", (){
    var el;

    setUp((){
      document.head.append(new BaseElement()..href = Kruk.SERVER_ROOT);;

      el = document.body.append(new Element.html('<div id=calendar>'));

       var doc = '''
            {
              "title": "Get Funky",
              "description": "asdf",
              "startDate": "${iso8601.format(fifteenth)}"
            }''';

      return Future.wait([
        Kruk.create(doc),
        Kruk.alias('/widgets', as: '/appointments')
      ]);

    });

    tearDown((){
      el.remove();
      return Kruk.deleteAll();
    });

    test("populates the calendar with appointments", (){
      // js.context.Backbone.history.loadUrl();
      new js.Proxy(js.context.Cal, query('#calendar'));

      var _id = iso8601.format(fifteenth);
      var cell = queryAll('td').
        where((el)=> el.id == _id).
        first;

      print('Contents (${_id}): ${cell.text}');

      new Timer(
        new Duration(milliseconds: 10),
        expectAsync0((){
          expect(cell.text, matches("Get Funky"));
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
