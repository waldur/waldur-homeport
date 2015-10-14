var auth = require('../helpers/auth.js'),
  helpers = require('../helpers/helpers.js');

/*jshint camelcase: false */
var testData = [
  {
    user: auth.getUser('Alice'),
    public_key: "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDgT5PABOUDgqI3XgfZubMP5m8rSfFjrxO05l+fRcUzY4fahHCcsPinnYCWR9w6u5Q0S0FcNr1pSOeh+turenndwvTQECUrqRnXTRVFNegQiLVxzHxi4ymTVvTmfq9uAGgkH5YgbADqNv64NRwZRbC6b1PB1Wm5mkoF31Uzy76pq3pf++rfh/s+Wg+vAyLy+WaSqeqvFxmeP7np/ByCv8zDAJClX9Cbhj3+IRm2TvESUOXz8kj1g7/dcFBSDjb098EeFmzpywreSjgjRFwbkfu7bU0Jo0+CT/zWgEDZstl9Hk0ln8fepYAdGYty565XosxwbWruVIfIJm/4kNo9enp1 erin@example.com",
    name: 'key ' + helpers.getUUID()
  },
  {
    user: auth.getUser('Walter'),
    public_key: "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDgT5PABOUDgqI3XgfZubMP5m8rSfFjrxO05l+fRcUzY4fahHCcsPinnYCWR9w6u5Q0S0FcNr1pSOeh+turenndwvTQECUrqRnXTRVFNegQiLVxzHxi4ymTVvTmfq9uAGgkH5YgbADqNv64NRwZRbC6b1PB1Wm5mkoF31Uzy76pq3pf++rfh/s+Wg+vAyLy+WaSqeqvFxmeP7np/ByCv8zDAJClX9Cbhj3+IRm2TvESUOXz8kj1g7/dcFBSDjb098EeFmzpywreSjgjRFwbkfu7bU0Jo0+CT/zWgEDZstl9Hk0ln8fepYAdGYty565XosxwbWruVIfIJm/4kNo9enp2 erin@example.com",
    name: 'key ' + helpers.getUUID()
  }
];

for(var i = 0; i < testData.length; i++) {
  var data = testData[i],
    user = data.user;

  (function(user, data) {
    describe('Key add test for customer owner(' + user.username + '):', function() {

      it('I should be able to login', function() {
        auth.login(user);
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/dashboard/');
      });

      it('I should be able to go to "key add" page', function() {
        element(by.css('.user-dropdown .user-name')).click();
        element(by.cssContainingText('ul.nav-sublist.user-area li a', 'Profile')).click();
        element(by.cssContainingText('.button', 'Add SSH Key')).click();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/keys/add/');
      });

      it('I should be able to add new key', function() {
        // fill name
        element(by.model('KeyAdd.instance.name')).sendKeys(data.name);
        element(by.model('KeyAdd.instance.public_key')).sendKeys(data.public_key);

        element(by.cssContainingText('a.button-apply', 'Add key')).click();

        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/profile/keys');
      });

      it('I should be able to find added key', function() {
        element(by.model('UserDetailUpdate.searchInput')).sendKeys(data.name);
        expect(element(by.cssContainingText('span', data.name)).isPresent()).toBe(true);
      });

      it('I should be able to remove added key', function() {
        element(by.cssContainingText('.one-action-button li a', 'Remove')).click();
        browser.switchTo().alert().accept();
      });

      it('I should be able to logout', function() {
        auth.logout();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/');
      });

    });

  })(user, data);
}
