var auth = require('../helpers/auth.js'),
  helpers = require('../helpers/helpers.js'),
  testData = [
    {
      user: auth.getUser('Charlie'),
      project: 'bells.org',
      service: 'Stratus',
      template: 'CentOS 7 64-bit',
      flavor: 'RAM: 0.5 GB',
      customer: 'Ministry of Bells'
    },
    {
      user: auth.getUser('Dave'),
      project: 'whistles.org',
      service: 'Cumulus',
      template: 'Windows 3.11 jWxL',
      flavor: 'RAM: 4 GB',
      customer: 'Ministry of Whistles'
    }
  ];

for(var i = 0; i < testData.length; i++) {
  var data = testData[i],
    user = data.user,
    resourceName = helpers.getUUID();

  (function(user, data, resourceName) {
    describe('App store creation test for administrator(' + user.username + '):', function() {

      it('I should be able to login', function() {
        auth.login(user);
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/dashboard/');
      });

      it('I should be able to go to "Appstore" page', function() {
        helpers.chooseCustomer(data.customer);
        element(by.cssContainingText('ul.nav-list.views li a', 'Appstore')).click();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/appstore/');
      });

      it('I should be able to add new resource', function() {
        element(by.model('AppStore.instance.name')).sendKeys(resourceName);
        // choose project
        element(by.cssContainingText('option', data.project)).click();
        // choose service
        element(by.cssContainingText('h3', data.service)).click();
        // choose template
        element(by.cssContainingText('option', data.template)).click();
        // choose flavor
        element(by.cssContainingText('li', data.flavor)).click();

        element(by.cssContainingText('a.button-apply', 'Checkout')).click();

        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/resources/');
      });

      it('I should be able to find added resource in resource list', function() {
        element(by.model('ResourceList.searchInput')).sendKeys(resourceName);
        expect(element(by.cssContainingText('h3.item-title', resourceName)).isPresent()).toBe(true);
      });

      it('I should be able to logout', function() {
        auth.logout();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/');
      });

    });
  })(user, data, resourceName);

}
