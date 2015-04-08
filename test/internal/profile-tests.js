var auth = require('../helpers/auth.js'),
  users = [auth.getUser('Charlie'), auth.getUser('Walter')];

for(var i=0; i < users.length; i++) {
  var user = users[i];

  (function(user) {
    describe('Test ' + user.username + ' can go to "profile" page:', function() {

      it('I should be able to login', function() {
        auth.login(user);
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/dashboard/');
      });

      it('I should be able to go to profile', function() {
        element(by.css('li.dropdown.user-box a')).click();
        element(by.cssContainingText('li.dropdown.user-box ul li:nth-child(1) a', 'Profile')).click();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/profile/');
        expect(element(by.css('.profile-name')).getText()).toContain(user.username);
      });

      it('I should be able to logout', function() {
        auth.logout();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/');
      });
    });
  })(user);

}
