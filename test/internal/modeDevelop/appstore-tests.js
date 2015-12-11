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
    addedResource = endpointMocks["/add/api/resources/"];

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

        //TODO: handle with mock on resource detail page when redirecting

        element(by.cssContainingText('span', "Details")).click();
        element(by.cssContainingText('li', "VMs")).click();

        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/projects/'+ addedResource.project_uuid +'/vms');
      });

      it('I should be able to find added resource in resource list', function() {
        element(by.model('generalSearch')).sendKeys(resourceName);
        expect(element(by.cssContainingText('h3.item-title a', resourceName)).isPresent()).toBe(true);
      });

      it('I should be able to logout', function() {
        auth.logout();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/');
      });

    });
  })(user, data, resourceName, addedResource);

}
