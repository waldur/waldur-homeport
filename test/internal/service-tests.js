var auth = require('../helpers/auth.js'),
  helpers = require('../helpers/helpers.js');


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

      it('I should be able to go to "service add" page', function() {
        element(by.css('li.add-something > a')).click();
        element(by.cssContainingText('li.add-something li a.service', 'Add service')).click();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/services/add/');
      });

      it('I should be able to add new service', function() {
        // fill name
        element(by.model('ServiceAdd.instance.name')).sendKeys(data.name);
        // fill auth_url
        element(by.model('ServiceAdd.instance.auth_url')).sendKeys(data.auth_url);

        element(by.cssContainingText('a.button-apply', 'Add service')).click();

        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/services/');
      });

      it('I should be able to find added service "' + data.name + '" in service list', function() {
        element(by.model('ServiceList.searchInput')).sendKeys(data.name);
        expect(element(by.cssContainingText('h3.item-title a', data.name)).isPresent()).toBe(true);
      });

      // TODO this test can be run when deletion service functionality will be available at backend
      xit('I should be able to delete service', function() {
        element(by.css('.object-list .list-item .actions-button a.button')).click();
        element(by.css('.object-list .list-item .remove')).click();
        browser.switchTo().alert().accept();
        expect(element(by.cssContainingText('h3.item-title a', data.name)).isPresent()).toBe(false);
      });

      it('I should be able to logout', function() {
        auth.logout();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/');
      });

    });

  })(user, data);
}
