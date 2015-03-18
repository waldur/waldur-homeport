var auth = require('../helpers/auth.js'),
  testData = [
    {
      user: auth.getUser('Charlie'),
      projects: ['bells.org'],
    },
    {
      user: auth.getUser('Bob'),
      projects: ['bells.org'],
    }
  ];

for(var i = 0; i < testData.length; i++) {
  var data = testData[i];

  (function(user, projects) {
    describe('Project list test for user ' + user.username + ':', function() {

      it('I should be able to login', function() {
        auth.login(user);
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/dashboard/');
      });

      it('I should be able to go to projects list', function() {
        element(by.cssContainingText('ul.nav li a', 'Projects')).click();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/projects/');
      });

      for(var j = 0; j < data.projects.length; j++) {
        (function(project) {
          it('I should be able to see ' + project + ' at projects list page', function() {
            element(by.model('ProjectList.searchInput')).sendKeys(project);
            expect(element(by.cssContainingText('h2.item-title', project)).isPresent()).toBe(true);
          });
        })(data.projects[j]);
      }

      it('I should be able to logout', function() {
        auth.logout();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/');
      });

    });
  })(data.user, data.projects);

}
