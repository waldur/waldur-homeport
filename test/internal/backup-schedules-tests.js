var auth = require('../helpers/auth.js'),
  helpers = require('../helpers/helpers.js');

/*jshint camelcase: false */
var testData = [
  {
    user: auth.getUser('Walter'),
    description: "desr1" + helpers.getUUID(),
    retention_time: 11,
    maximal_number_of_backups: 12,
    schedule: "1 1 1 1 1",
    backup_source_name: "resource#0",
    customer: 'Ministry of Bells'
  },
  {
    user: auth.getUser('Walter'),
    description: "desr2" + helpers.getUUID(),
    retention_time: 23,
    maximal_number_of_backups: 44,
    schedule: "1 1 1 1 2",
    backup_source_name: "resource#0",
    customer: 'Ministry of Bells'
  }
];

for(var i = 0; i < testData.length; i++) {
  var data = testData[i],
    user = data.user;

  (function(user, data, customer) {
    describe('Add backup-schedules test): ', function() {

      it('I should be able to login', function() {
        auth.login(user);
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/dashboard/');
        helpers.chooseCustomer(customer);
      });

      it('I should be able to create backup', function() {
        browser.get('/#/backup-schedules/add/');
        expect(element(by.cssContainingText('h2.app-title', 'Add backups schedules')).isPresent()).toBe(true);

        element(by.model('BackupSchedulesAdd.instance.description')).sendKeys(data.description);
        element(by.model('BackupSchedulesAdd.instance.retention_time')).sendKeys(data.retention_time);
        element(by.model('BackupSchedulesAdd.instance.maximal_number_of_backups')).sendKeys(data.maximal_number_of_backups);
        element(by.model('BackupSchedulesAdd.instance.schedule')).sendKeys(data.schedule);
        element(by.model('searchStr')).sendKeys(data.backup_source_name);
        element(by.cssContainingText('.angucomplete-row .angucomplete-title', data.backup_source_name)).click();

        element(by.cssContainingText('a.button-apply', 'Add schedule')).click();

        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/backups/');
      });

      it('I should be able to logout', function() {
        auth.logout();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/');
      });
    });
  })(user, data, data.customer);
}
