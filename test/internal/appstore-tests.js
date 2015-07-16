var auth = require('../helpers/auth.js'),
  helpers = require('../helpers/helpers.js'),
  testData = [
    {
      user: auth.getUser('Charlie'),
      project: 'bells.org',
      service: 'DigitalOcean',
      image: '',
      region: '',
      project: '',
      size: '',
      key: '',
      customer: 'Ministry of Bells'
    },
    {
      user: auth.getUser('Dave'),
      service: 'DigitalOcean',
      image: '',
      region: '',
      project: '',
      size: '',
      key: '',
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
        // choose service
        element(by.cssContainingText('h3', data.service)).click();
        // set name
        element(by.model('AppStore.instance.name')).sendKeys(resourceName);

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
