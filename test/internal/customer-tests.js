var auth = require('../helpers/auth.js'),
  helpers = require('../helpers/helpers.js'),
  addCustomerTestData = [
    {
      user: auth.getUser('Walter'),
      customer: 'Ministry of Whistles'
    },
    {
      user: auth.getUser('Walter'),
      customer: 'Ministry of Bells'
    }
  ];

for(var i = 0; i < addCustomerTestData.length; i++) {
  var data = addCustomerTestData[i],
    user = data.user,
    customerName = helpers.getUUID();

  (function(data, user, customerName) {
    describe('Customer creation test for customer owner(' + user.username + '):', function() {
      it('I should be able to login', function() {
        auth.login(user);
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/dashboard/');
        helpers.chooseCustomer(data.customer);
      });

      it('I should be able to go to "customer add" page', function() {
        element(by.css('.dropdown.customers .active-context')).click();
        element(by.cssContainingText('.dropdown.customers .nav-sublist li a', 'Manage organizations')).click();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/organizations/');

        element(by.css('.right-sort a')).click();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/organizations/add/');
      });

      it('I should be able to add new customer', function() {
        // fill name
        element(by.model('CustomerAdd.instance.name')).sendKeys(customerName);

        element(by.cssContainingText('a.button-apply', 'Create organization')).click();

        expect(element(by.cssContainingText('h2.app-title', customerName)).isPresent()).toBe(true);
      });

      it('I should be able to see ' + customerName + ' at customers list page', function() {
        element(by.css('.dropdown.customers .active-context')).click();
        element(by.cssContainingText('.dropdown.customers .nav-sublist li a', 'Manage organizations')).click();
        element(by.model('CustomerList.searchInput')).sendKeys(customerName);
        expect(element(by.cssContainingText('h3.item-title a', customerName)).isPresent()).toBe(true);
      });

      it('I should be able to edit customer' + customerName, function() {
        element(by.cssContainingText('h3.item-title a', customerName)).click();
        element(by.cssContainingText('a.button', 'actions')).click();
        element(by.cssContainingText('a.button-simple', 'Edit profile')).click();

        element(by.model('CustomerUpdate.model.name')).sendKeys('NEW NAME');
        element(by.cssContainingText('a.button-apply', 'Save')).click();
        expect(element(by.cssContainingText('h2.app-title', 'NEW NAME')).isPresent()).toBe(true);
      });

      it('I should be able to logout', function() {
        auth.logout();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/');
      });
    });
  })(data, user, customerName);
}