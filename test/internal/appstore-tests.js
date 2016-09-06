var auth = require('../helpers/auth.js'),
  helpers = require('../helpers/helpers.js'),
  constants = require('../helpers/constants.js'),
  testData = [
    {
      user: auth.getUser('Walter'),
      customer: 'Ministry of Bells',
      project: 'bells.org',
      category: 'VMs',
      service: 'Oman DC',
      image: 'sugarcrm-bitnami',
      flavor: 'm1.medium'
    }
  ];

for(var i = 0; i < testData.length; i++) {
  var data = testData[i],
    user = data.user,
    resourceName = helpers.getUUID();

  (function(user, data, resourceName) {
    describe('App store creation test for administrator(' + user.username + '):', function() {

      xit('I should be able to login', function() {
        auth.login(user);
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/dashboard/');
      });

      xit('I should be able to go to "Appstore" page', function() {
        helpers.chooseCustomer(data.customer);
        element(by.cssContainingText('ul.nav-list.views li a', 'Appstore')).click();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/appstore/');
      });

      xit('I should be able to add new resource', function() {
        // choose category
        element(by.cssContainingText('h3', data.category)).click();
        // choose service
        element(by.cssContainingText('h3', data.service)).click();
        browser.wait(function() {
          return element(by.cssContainingText('h2', 'Image')).isPresent();
        }, constants.WATING_TIME);
        // set name
        element(by.model('AppStore.instance[field.name]')).sendKeys(resourceName);
        // choose image
        element(by.cssContainingText('p', data.image)).click();
        // choose flavor
        element(by.cssContainingText('p', data.flavor)).click();

        element(by.css('.appstore-purchase button')).click();

        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/resources/VMs');
      });

      xit('I should be able to find added resource in resource list', function() {
        element(by.model('generalSearch')).sendKeys(resourceName);
        expect(element(by.cssContainingText('h3.item-title a', resourceName)).isPresent()).toBe(true);
      });

      xit('I should be able to logout', function() {
        auth.logout();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/');
      });

    });
  })(user, data, resourceName);

}
