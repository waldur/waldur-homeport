var auth = require('../../helpers/auth.js'),
  helpers = require('../../helpers/helpers.js'),
  constants = require('../../helpers/constants.js'),
  addCustomerTestData = [
    {
      user: auth.getUser('Alice'),
      customer: 'Alice Lebowski',
      country: 'United Kingdom',
      address: '10 Downing St, London SW1A 2AA'
    }
  ];

for(var i = 0; i < addCustomerTestData.length; i++) {
  var data = addCustomerTestData[i],
    user = data.user,
    customer = helpers.getUUID();

  (function(data, user, customerName) {
    describe('Customer creation test for customer owner(' + user.username + '):', function() {
      it('I should be able to login', function() {
        auth.login(user);
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/dashboard/');
      });

      it('I should be able to go to "customer add" page', function() {
        element(by.css('.dropdown.customers .customer-name')).click();
        element(by.cssContainingText('.dropdown.customers .nav-sublist a', 'Manage organizations')).click();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/organizations/');
        element(by.cssContainingText('.table-action a span', 'Add organization')).click();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/organizations/add/');
      });

      it('I should be able to add new customer', function() {
        // fill name
        element(by.model('CustomerAdd.instance.name')).sendKeys(customerName);
        element(by.model('CustomerAdd.instance.country')).sendKeys(data.country);
        element(by.model('CustomerAdd.instance.contact_details')).sendKeys(data.address);
        element(by.cssContainingText('a.button-apply', 'Add organization')).click();
      });

      it('I should be able to see ' + customerName + ' at customers list page', function() {
        element(by.css('.dropdown.customers .customer-name')).click();
        element(by.cssContainingText('.dropdown.customers .nav-sublist a', 'Manage organizations')).click();
        element(by.model('entityList.searchInput')).sendKeys(customerName);
        expect(element(by.cssContainingText('h3.item-title a', customerName)).isPresent()).toBe(true);
      });

      it('I should be able to logout', function() {
        auth.logout();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/');
      });
    });
  })(data, user, customer);
}