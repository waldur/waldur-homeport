/*jshint camelcase: false */
var auth = require('../helpers/auth.js'),
  testData = [
    {
      user: auth.getUser('Charlie'),
      full_name: 'Charlie Lebowski'
    },
    {
      user: auth.getUser('Bob'),
      full_name: 'Bob Lebowski'
    }
  ];


for(var i = 0; i < testData.length; i++) {
  var data = testData[i];

  // This test will work only with working events on backend. It will not work with mocked events.
  (function(data) {
    describe('Test ' + data.full_name + ' can see events log:', function() {
      it('I should be able to login', function() {
        auth.login(data.user);
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/dashboard/');
      });

      it('I should be able to see my authorisation log', function() {
        var eventMessage = 'has signed in with a username/password';
        expect(element(by.cssContainingText('.list-item .event', eventMessage)).isPresent()).toBe(true);
        expect(element(by.cssContainingText('.list-item .event .name', data.full_name)).isPresent()).toBe(true);
      });

      it('I should be able to logout', function() {
        auth.logout();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/');
      });
    });
  })(data);
}
