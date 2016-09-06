var auth = require('../../helpers/auth.js'),
  helpers = require('../../helpers/helpers.js'),
  constants = require('../../helpers/constants.js'),
  testData = [
    {
      user: auth.getUser('Alice'),
      customer: 'Alice Lebowski',
      project: 'OpenStack Alice project',
      category: 'VMs',
      service: 'Shared Azure',
      image: '"Oracle WebLogic Server 11g Enterprise Edition on Windows Server 2008 R2"',
      flavor: 'Extra Small Instance'
    }
  ];

for (var i = 0; i < testData.length; i++) {
  var data = testData[i],
    user = data.user;

  (function(user) {
    describe('App store creation test for administrator(' + user.username + '):', function() {

      xit('I should be able to login', function() {
        auth.login(user);
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/dashboard/');
      });

      xit('I should be able to logout', function() {
        auth.logout();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/');
      });

    });
  })(user);
}
