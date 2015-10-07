var auth = require('../helpers/auth.js'),
  helpers = require('../helpers/helpers.js');


/*jshint camelcase: false */
var testData = [
    {
      user: auth.getUser('Alice'),
      testVal: 'test',
      service: 'OpenStack',
      name: helpers.getUUID()
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
        element(by.css('.dropdown.customers .active-context')).click();
        element(by.cssContainingText('.tabs-links li', 'Providers')).click();
        browser.wait(function() {
          return element(by.cssContainingText('.right-sort .button', 'Create provider')).isPresent();
        }, 10000);
        element(by.cssContainingText('.right-sort .button', 'Create provider')).click();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/services/add/');
      });

      it('I should be able to add new service', function() {
        // choose service
        element(by.cssContainingText('h3', data.service)).click();
        // fill name
        element(by.model('ServiceAdd.model.serviceName')).clear();
        element(by.model('ServiceAdd.model.serviceName')).sendKeys(data.name);
        // fill auth_url
        element(by.css('#OpenStack_username')).sendKeys(data.testVal);
        element(by.css('#OpenStack_password')).sendKeys(data.testVal);
        element(by.css('#OpenStack_tenant_name')).sendKeys(data.testVal);
        element(by.css('#OpenStack_external_network_id')).sendKeys(data.testVal);
        element(by.css('#OpenStack_availability_zone')).sendKeys(data.testVal);
        element(by.css('#OpenStack_dummy')).click();

        element(by.cssContainingText('a.button-apply', 'Add provider')).click();

        expect(element(by.cssContainingText('.tabs-links li', 'Providers')).isPresent()).toBe(true);
        browser.wait(function() {
          return element(by.cssContainingText('.right-sort .button', 'Create provider')).isPresent();
        }, 10000);
      });

      it('I should be able to find added service "' + data.name + '" in service list', function() {
        element(by.model('generalSearch')).sendKeys(data.name);
        browser.wait(function() {
          return element(by.cssContainingText('span', data.service)).isPresent();
        }, 20000);
        expect(element(by.cssContainingText('.object-list .name span', data.name)).isPresent()).toBe(true);
      });

      it('I should be able to delete service', function() {
        element(by.css('.object-list .list-item .actions-button a.button')).click();
        element(by.cssContainingText('.object-list .list-item .actions-dropdown li a', 'Remove')).click();
        browser.switchTo().alert().accept();
        expect(element(by.cssContainingText('.object-list .name span', data.name)).isPresent()).toBe(false);
      });

      it('I should be able to logout', function() {
        auth.logout();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/');
      });

    });

  })(user, data);
}
