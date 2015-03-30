var auth = require('../helpers/auth.js'),
  helpers = require('../helpers/helpers.js'),
  testData = [
    {
      user: auth.getUser('Charlie'),
      project: 'bells.org',
      service: 'Stratus',
      template: 'CentOS 7 64-bit',
      flavor: 'RAM: 512',
      key: 'charlie@example.com'
    },
    {
      user: auth.getUser('Dave'),
      project: 'whistles.org',
      service: 'Cumulus',
      template: 'Windows 3.11 jWxL',
      flavor: 'RAM: 4096',
      key: 'dave@example.com',
      customer: 'Ministry of Whistles'
    },
  ];

for(var i = 0; i < testData.length; i++) {
  var data = testData[i],
    user = data.user,
    resourceName = helpers.getUUID();

  (function(user, data, resourceName) {
    describe('Resource creation test for administrator(' + user.username + '):', function() {

      it('I should be able to login', function() {
        auth.login(user);
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/dashboard/');
      });

      it('I should be able to go to "resource add" page', function() {
        if ('customer' in data) {
          helpers.chooseCustomer(data.customer);
        }
        element(by.cssContainingText('ul.nav li a', 'Resources')).click();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/resources/');

        element(by.cssContainingText('a.crud-controls', 'Add resource')).click();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/resources/add/');
      });

      it('I should be able to add new resource', function() {
        element(by.model('ResourceAdd.resource.hostname')).sendKeys(resourceName);
        // choose project
        element(by.cssContainingText('option', data.project)).click();
        // choose key
        element(by.cssContainingText('option', data.key)).click();
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
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/');
      });

    });
  })(user, data, resourceName);

}


describe('Resource pagination test for Alice :', function() {

  var user = auth.getUser('Alice');

  it('I should be able to login', function() {
    auth.login(user);
    expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/dashboard/');
  });

  it('I should see 10 elements on page by default', function() {
    // Go to resources list
    element(by.cssContainingText('ul.nav li a', 'Resources')).click();
    expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/resources/');
    // checks elements count on page
    var elements = element.all(by.css('td.name h2.item-title'));
    expect(elements.count()).toEqual(10);
  });

  it('After click on pagination size 5 I should see 5 elements on page', function() {
    // choose pagination size: 5
    element(by.cssContainingText('ul.sort li a', '5')).click();
    // check elements count on page
    var elements = element.all(by.css('td.name h2.item-title'));
    expect(elements.count()).toEqual(5);
  });

  it('When I go to next page I need to see another 5 elements', function() {
    // Go to next page
    element(by.cssContainingText('div.pagination a', '2')).click();
    // check elements count on page
    var elements = element.all(by.css('td.name h2.item-title'));
    expect(elements.count()).toEqual(5);
  });

  it('I should be able to logout', function() {
    auth.logout();
    expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/');
  });


});
