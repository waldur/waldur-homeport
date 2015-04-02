var auth = require('../helpers/auth.js'),
  testData = [
    {
      user: auth.getUser('Walter'),
      auth_url: 'http://keystone.example.com:5000/v2.0',
      name: 'Service test 1 ' + Math.random()
    },
  ];

for(var i = 0; i < testData.length; i++) {
  var data = testData[i],
    user = data.user;

  (function(user, data) {
    describe('Service creation test for administrator(' + user.username + '):', function() {

      it('I should be able to login', function() {
        auth.login(user);
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/dashboard/');
      });

      it('I should be able to go to "service add" page', function() {
        element(by.cssContainingText('ul.nav li a', 'Services')).click();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/services/');

        element(by.cssContainingText('a.crud-controls', 'Add service')).click();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/services/add/');
      });

      it('I should be able to add new resource', function() {
        // fill name
        element(by.model('ServiceAdd.service.name')).sendKeys(data.name);
        // fill auth_url
        element(by.model('ServiceAdd.service.auth_url')).sendKeys(data.auth_url);

        element(by.cssContainingText('a.btn', 'Add service')).click();

        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/services/');
      });

      it('I should be able to logout', function() {
        auth.logout();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/');
      });
    });

  })(user, data);
}