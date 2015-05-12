var auth = require('../helpers/auth.js'),
  helpers = require('../helpers/helpers.js'),
  user = auth.getUser('Walter'),
  checkUser = 'Harry Lebowski',
  project = 'bells.org',
  customer = 'Ministry of Bells';

describe('Test ' + user.username + ' can add and remove user ' + checkUser + ' from project ' + project + ':', function() {

  it('I should be able to login', function() {
    auth.login(user);
    expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/dashboard/');
  });

  it('I should be able to go to user list', function() {
    helpers.chooseCustomer(customer);
    element(by.cssContainingText('ul.nav-list.views li a', 'Users')).click();
    expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/users/');
  });

  it('I should be able to find user ' + checkUser, function() {
    element(by.model('UserList.searchInput')).sendKeys(checkUser);
    expect(element(by.cssContainingText('h3.item-title a', checkUser)).isPresent()).toBe(true);
  });

  it('I should be able to add and remove user from project' + project, function() {
    // add
    element(by.css('.object-list .list-item .actions-button a.button')).click();
    element(by.cssContainingText('.object-list .list-item .actions-button a', 'Add to project')).click();
    expect(element(by.cssContainingText('.app-title', 'Add to project')).isPresent()).toBe(true);
    expect(element(by.cssContainingText('.gray-box .item-title a', checkUser)).isPresent()).toBe(true);
    // choose project
    element(by.cssContainingText('option', project)).click();
    element(by.cssContainingText('.button-apply', 'Add to project')).click();
    expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/users/');

    // remove
    element(by.model('UserList.searchInput')).sendKeys(checkUser);
    expect(element(by.cssContainingText('h3.item-title a', checkUser)).isPresent()).toBe(true);
    element(by.css('.object-list .list-item .actions-button a.button')).click();
    element(by.cssContainingText('.object-list .list-item .actions-button a', 'Remove from project')).click();
    expect(element(by.cssContainingText('.app-title', 'Remove from project')).isPresent()).toBe(true);
    expect(element(by.cssContainingText('.gray-box .item-title a', checkUser)).isPresent()).toBe(true);
    // choose project
    element(by.cssContainingText('option', project)).click();
    element(by.cssContainingText('.button-apply', 'Remove from project')).click();
    expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/users/');
  });

  it('I should be able to logout', function() {
    auth.logout();
    expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/');
  });

});
