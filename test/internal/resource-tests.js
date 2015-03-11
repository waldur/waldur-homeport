var auth = require('../helpers/auth.js'),
  helpers = require('../helpers/helpers.js'),
  testData = [
    {
      user: auth.getUser('Charlie'),
      project: 'bells.org',
      service: 'Stratus',
      template: 'CentOS 7 minimal jmHCYir',
      flavor: 'RAM: 512',
      key: 'charlie@example.com'
    }
    // we can not execute tests for Dave, because customer selection does not work
    // {
    //   user: auth.getUser('Dave'),
    //   project: '',
    //   service: '',
    //   template: '',
    //   flavor: ''
    // },
  ];

for(var i = 0; i < testData.length; i++) {
  var data = testData[i],
    user = data.user,
    resourceName = helpers.getUUID();

  describe('Resource creation test for administrator(' + user.username + '):', function() {

    it('I should be able to login', function() {
      auth.login(user);
      expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/dashboard/');
    });

    it('I should be able to go to "resource add" page', function() {
      element(by.css('ul.nav li a[ui-sref=resources]')).click();
      expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/resources/');

      element(by.css('a.crud-controls[ui-sref="resource-add"]')).click();
      expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/resources/add/');
    });

    it('I should be able to add new resource', function() {
      element(by.model('ResourceAdd.resource.hostname')).sendKeys(resourceName);
      // choose project
      element(by.cssContainingText('option', data.project)).click();
      // choose key
      element(by.cssContainingText('option', user.key)).click();
      // choose service
      element(by.cssContainingText('h3', data.service)).click();
      // choose template
      element(by.cssContainingText('h3', data.template)).click();
      // choose flavor
      element(by.cssContainingText('li', data.flavor)).click();

      element(by.cssContainingText('a.btn', 'Add resource')).click();

      expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/resources/');
    });

    it('I should be able to find added resource in resource list', function() {
      element(by.model('ResourceList.searchInput')).sendKeys(resourceName);
      expect(element(by.cssContainingText('h2.item-title', resourceName)).isPresent()).toBe(true);
    });

    it('I should be able to logout', function() {
      auth.logout();
      expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#');
    });

  });

}


