var auth = require('../helpers/auth.js'),
  expectedPlans = ['Default', 'Small', 'Medium', 'Large'],
  user = auth.getUser('Alice'),
  customer = {'name': 'Ministry of Bells'};


describe('Test plans ordering for ' + user.username + ':', function() {

  it('I should be able to login', function() {
    auth.login(user);
    expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/dashboard/');
  });

  it('I should be able to go to customers manage page', function() {
    element(by.cssContainingText('a.customer-context.drop-active span.active-context', 'Active organization')).click();

    element(by.cssContainingText('li.dropdown.customers > ul > li > a', 'Manage customers')).click();
    expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/customers/');
  });

  it('I should be able to see customer plans', function() {
    element(by.cssContainingText('div.list-item div h3.item-title a.ng-binding', customer.name)).click();
    element(by.cssContainingText('a.button', 'actions')).click();
    element(by.cssContainingText('a.button-simple', 'Plans')).click();
    for (var i = 0; i < expectedPlans.length; i++) {
      expect(element(by.cssContainingText('span.plan-name.ng-binding', expectedPlans[i])).isPresent()).toBe(true);
    }
  });

  it('I should be able to select non-active plan', function() {
    var plan = element(by.css('.plan-item:not(.active)'));
    plan.click();
    plan.getText().then(function(text) {
      element(by.cssContainingText('a', 'Confirm change your Plan')).click();
      expect(element(by.css('.plan-item.active')).getText()).toBe(text);
    });
  });

  it('I should not be able to select active plan', function() {
    element(by.css('.plan-item.active')).click();
    expect(element(by.cssContainingText('a.disabled', 'Confirm change your Plan')).isPresent()).toBe(true);
  });

  it('I should be able to logout', function() {
    auth.logout();
    expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/');
  });

});
