var auth = require('../helpers/auth.js'),
  helpers = require('../helpers/helpers.js'),
  users = [auth.getUser('Alice'), auth.getUser('Walter')];

for(var i=0; i < users.length; i++) {
  var user = users[i],
    newEmail = helpers.getUUID();

  (function(user, newEmail) {
    describe('Test ' + user.username + ' can go to "profile" page:', function() {

      xit('I should be able to login', function() {
        auth.login(user);
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/dashboard/');
      });

      xit('I should be able to go to profile', function() {
        element(by.css('.user-dropdown .user-name')).click();
        element(by.cssContainingText('ul.nav-sublist.user-area li a', 'Profile')).click();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/profile/');
        expect(element(by.css('.user-about .user-name span')).getText()).toContain(user.username);
      });

      // XXX: This test changes user email, ideally we have to create new user and change his email.
      xit('I should be able to edit profile', function() {
        function setEmail(email) {
          element(by.css('.user-email .icon')).click();
          element(by.css('.editable-input')).clear();
          element(by.css('.editable-input')).sendKeys(email, protractor.Key.ENTER);
        }
        setEmail(newEmail);
        expect(element(by.css('.user-email span')).getText()).toContain(newEmail);
      });

      xit('I should be able to logout', function() {
        auth.logout();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/');
      });
    });
  })(user, newEmail);

}

var users = [
  auth.getUser('Walter')
];

for(var i=0; i < users.length; i++) {
  var user = users[i];

  (function(user) {
    describe('Test ' + user.username + ' can go to delete account:', function() {
      xit('I should be able to login', function() {
        auth.login(user);
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/dashboard/');
      });

      // TODO this test can be run when functionality of adding new user will be available.
      xit('I should be able to delete my account', function() {
        element(by.css('li.dropdown.user-box a')).click();
        element(by.cssContainingText('li.dropdown.user-box ul li:nth-child(1) a', 'Profile')).click();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/profile/');
        expect(element(by.css('.profile-name')).getText()).toContain(user.username);

        element(by.css('ul.controls.pull-right > li:nth-child(3) > a')).click();
        browser.switchTo().alert().accept();
        expect(element(by.css('.tour-box .take-a-tour')).getText()).toEqual('Sign me up!');
      });

      xit('I should be able to logout', function() {
        auth.logout();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/');
      });
    });
  })(user);
}
