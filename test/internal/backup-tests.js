var auth = require('../helpers/auth.js'),
  helpers = require('../helpers/helpers.js');

/*jshint camelcase: false */
var testData = [
  {
    user: auth.getUser('Walter'),
    description: 'backup ' + helpers.getUUID(),
    sourceName: 'resource#0',
    customer: 'Ministry of Bells'
  },
  {
    user: auth.getUser('Walter'),
    description: 'backup ' + helpers.getUUID(),
    sourceName: 'resource#1',
    customer: 'Ministry of Bells'
  }
];

for(var i = 0; i < testData.length; i++) {
  var data = testData[i],
    user = data.user;

  (function(user, data, customer) {
    describe('Key add test for customer owner(' + user.username + '):', function() {

      it('I should be able to login', function() {
        auth.login(user);
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/dashboard/');
        helpers.chooseCustomer(customer);
      });

      it('I should be able go to backups list page', function() {
        browser.get('/#/backups/');
        expect(element(by.cssContainingText('h2.app-title', 'Backups')).isPresent()).toBe(true);
      });

      it('I should be able to create backup', function() {
        browser.get('/#/backups/add/');
        expect(element(by.cssContainingText('h2.app-title', 'Add backup')).isPresent()).toBe(true);
        // fill name
        element(by.model('BackupAdd.instance.description')).sendKeys(data.description);

        element(by.model('searchStr')).sendKeys(data.sourceName);
        element(by.cssContainingText('.angucomplete-row .angucomplete-title', data.sourceName)).click();

        element(by.cssContainingText('a.button-apply', 'Add backup')).click();

        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/backups/');
      });

      it('I should be able to find added backup in backups list', function() {
        element(by.model('BackupList.searchInput')).sendKeys(data.description);
        expect(element(by.cssContainingText('h3.item-title a', data.description)).isPresent()).toBe(true);
      });

      it('I should be able to logout', function() {
        auth.logout();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/');
      });

    });

  })(user, data, data.customer);
}
