var auth = require('../helpers/auth.js'),
  constants = require('../helpers/constants.js'),
  expectedPlans = ['Default', 'Small', 'Medium', 'Large'],
  user = auth.getUser('Alice'),
  customer = {'name': 'Alice Lebowski'};


describe('Test plans ordering for ' + user.username + ':', function() {

  xit('I should be able to login', function() {
    auth.login(user);
    expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/dashboard/');
  });

  xit('I should be able to go to customers manage page', function() {
    element(by.css('.dropdown.customers .customer-name')).click();

    element(by.cssContainingText('li.dropdown.customers > ul > li > a', 'Manage organizations')).click();
    expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/organizations/');
  });

  xit('I should be able to see customer plans', function() {
    element(by.cssContainingText('h3.item-title a', customer.name)).click();
    browser.wait(function() {
      return element(by.cssContainingText('a.button', 'Plans')).isPresent();
    }, constants.WATING_TIME);
    element(by.cssContainingText('a.button', 'Plans')).click();
    browser.wait(function() {
      return element(by.cssContainingText('h4.app-title', 'Choose new plan')).isPresent();
    }, constants.WATING_TIME);
    for (var i = 0; i < expectedPlans.length; i++) {
      expect(element(by.cssContainingText('span.plan-name.ng-binding', expectedPlans[i])).isPresent()).toBe(true);
    }
  });

  xit('I should be able to select not current plan', function() {
    var plan = element(by.css('.plan-item:not(.current-plan) .plan-name'));
    plan.click();
    plan.getText().then(function(text) {
      expect(element(by.css('.plan-item.selected .plan-name')).getText()).toBe(text);
    });
  });

  xit('I should be able to logout', function() {
    auth.logout();
    expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/');
  });

});
