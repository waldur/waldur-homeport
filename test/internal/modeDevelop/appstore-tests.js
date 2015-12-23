var auth = require('../../helpers/auth.js'),
  helpers = require('../../helpers/helpers.js'),
  constants = require('../../helpers/constants.js'),
  endpointMocks = require('../../mocks.json'),
  testData = [
    {
      user: auth.getUser('Alice'),
      customer: 'Alice Lebowski',
      project: 'OpenStack Alice project',
      category: 'VMs',
      service: 'Shared Azure',
      image: '"Oracle WebLogic Server 11g Enterprise Edition on Windows Server 2008 R2"',
      flavor: 'Extra Small Instance'
    }
  ];

for(var i = 0; i < testData.length; i++) {
  var data = testData[i],
    user = data.user,
    resourceName = helpers.getUUID(),
    osName = helpers.getUUID(),
    osPassword = helpers.getUUID(),
    addedResource = endpointMocks["/add/api/azure-virtualmachines/"];

  (function(user, data, resourceName, addedResource) {
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
        // choose category
        element(by.cssContainingText('h3', data.category)).click();
        // choose service
        element(by.cssContainingText('h3', data.service)).click();
        browser.wait(function() {
          return element(by.cssContainingText('h2', 'Image')).isPresent();
        }, constants.WATING_TIME);
        !// set os username
        element(by.id('username')).sendKeys(osName);
        // set os password
        element(by.id('password')).sendKeys(osPassword);
        // set repeat password
        element(by.id('repeat_password')).sendKeys(osPassword);
        // set resource name
        element(by.id('name')).sendKeys(resourceName);

        // choose image
        element(by.cssContainingText('p', data.image)).click();
        // choose flavor
        element(by.cssContainingText('span', data.flavor)).click();

        element(by.css('.appstore-purchase button')).click();

        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/resources/'+ addedResource.resource_type +'/'+ addedResource.uuid + '/');

      });

      it('I should be able to check added resource on its details page', function() {
        expect(element(by.cssContainingText('span.name', resourceName)).isPresent()).toBe(true);
      });

      it('I should be able to logout', function() {
        auth.logout();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/');
      });

    });
  })(user, data, resourceName, addedResource);

}
