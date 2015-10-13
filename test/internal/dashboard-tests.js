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

  (function(data) {
    describe('Test ' + data.full_name + ' can see events log:', function() {
      it('I should be able to login', function() {
        auth.login(data.user);
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/dashboard/');
      });

      it('I should be able to see my authorisation log', function() {
        expect(element(by.cssContainingText('.container h1', 'Dashboard')).isPresent()).toBe(true);
        expect(element(by.cssContainingText('.half-block h3', 'Projects')).isPresent()).toBe(true);
        expect(element(by.cssContainingText('.alerts-list h3', 'Alerts')).isPresent()).toBe(true);
        expect(element(by.cssContainingText('.alerts-list h3', 'Recent events')).isPresent()).toBe(true);
      });

      it('I should be able to logout', function() {
        auth.logout();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/');
      });
    });
  })(data);
}
