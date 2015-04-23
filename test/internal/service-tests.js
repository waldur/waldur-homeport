var auth = require('../helpers/auth.js'),
  helpers = require('../helpers/helpers.js'),
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
        element(by.cssContainingText('ul.nav-list.views li a', 'Services')).click();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/services/');
      });

      // TODO no button "Add service" on page list
      xit('"Add service" should be disabled', function() {
        expect(element(by.cssContainingText('div.disabled', 'Add service')).isPresent()).toBe(true);
      });

      it('I should be able to logout', function() {
        auth.logout();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/');
      });
    });
  })(user);

}

/*jshint camelcase: false */
var testData = [
    {
      user: auth.getUser('Bob'),
      auth_url: 'http://keystone.example.com:5000/v2.0',
      name: 'Service test 1 ' + helpers.getUUID()
    },
  ];

for(var i = 0; i < testData.length; i++) {
  var data = testData[i],
    user = data.user;

  (function(user, data) {
    describe('Service creation test for customer owner(' + user.username + '):', function() {

      it('I should be able to login', function() {
        auth.login(user);
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/dashboard/');
      });

      it('I should be able to go to services list', function() {
        element(by.cssContainingText('ul.nav-list.views li a', 'Services')).click();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/services/');
      });

      it('I should be able to go to "service add" page', function() {
        element(by.cssContainingText('ul.nav-list.views li a', 'Services')).click();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/services/');

        element(by.css('li.add-something > a')).click();
        element(by.cssContainingText('li.add-something li a.service', 'Add service')).click();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/services/add/');
      });

      it('I should be able to add new resource', function() {
        // fill name
        element(by.model('ServiceAdd.service.name')).sendKeys(data.name);
        // fill auth_url
        element(by.model('ServiceAdd.service.auth_url')).sendKeys(data.auth_url);

        element(by.cssContainingText('a.button-apply', 'Add service')).click();

        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/services/');
      });

      it('I should be able to find added service "' + data.name + '" in service list', function() {
        element(by.model('serviceList.searchInput')).sendKeys(data.name);
        expect(element(by.cssContainingText('h3.item-title a', data.name)).isPresent()).toBe(true);
      });

      it('I should be able to logout', function() {
        auth.logout();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/');
      });

    });

  })(user, data);
}
