var auth = require('../helpers/auth.js'),
  expectedPlans = ['Default', 'Small', 'Medium', 'Large'],
  user = auth.getUser('Alice'),
  customer = {'name': 'Ministry of Bells'};

describe('Plans list visibility positive test for user ' + user.username + ':', function() {

  it('I should be able to login', function() {
    auth.login(user);
    expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/dashboard/');
  });

  it('I should be able to go to customers manage page', function() {
    element(by.cssContainingText('a.customer-head span.customer-expl', 'active for context')).click();

    element(by.cssContainingText(
      'ul.nav.navbar-nav.navbar-right.nav-user-area.hidden-md.hidden-sm > li:nth-child(2) > ul > li > a',
      'Manage customers')).click();
    expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/customers/');
  });

  it('I should be able to see customer plans', function() {
    element(by.cssContainingText('tr.ng-scope td.name h2.item-title a.ng-binding', customer.name)).click();
    element(by.cssContainingText(
      'div.col-xs-11.profile-info > div.row > div > ul > li:nth-child(2) > a', 'Plans')).click();
    for (var i = 0; i < expectedPlans.length; i++) {
      expect(element(by.cssContainingText('span.plan-name.ng-binding', expectedPlans[i])).isPresent()).toBe(true);
    }
  });

  it('I should be able to logout', function() {
    auth.logout();
    expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/');
  });

});
