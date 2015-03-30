var auth = require('../helpers/auth.js'),
  users = [auth.getUser('Charlie'), auth.getUser('Dave')];

for(var i=0; i < users.length; i++) {
  var user = users[i];

  (function(user) {
    describe('Test ' + user.username + ' can not go to "service add" page:', function() {

      it('I should be able to login', function() {
        auth.login(user);
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/dashboard/');
      });

      it('I should be able to go to services list', function() {
        element(by.cssContainingText('ul.nav li a', 'Services')).click();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/services/');
      });

      it('I should not see "Add service" button', function() {
        expect(element(by.cssContainingText('a.disabled', 'Add service')).isPresent()).toBe(true);
      });

      it('I should be able to logout', function() {
        auth.logout();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/');
      });

    });
  })(user);

}

// XXX: Positive tests will be implemented with complete "resource add" tests
