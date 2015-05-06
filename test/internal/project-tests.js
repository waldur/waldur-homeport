var auth = require('../helpers/auth.js'),
  helpers = require('../helpers/helpers.js'),
  testData = [
    {
      user: auth.getUser('Charlie'),
      projects: ['bells.org'],
      customer: 'Ministry of Bells'
    },
    {
      user: auth.getUser('Bob'),
      projects: ['bells.org'],
      customer: 'Ministry of Bells'
    }
  ];

for(var i = 0; i < testData.length; i++) {
  var data = testData[i];

  (function(user, projects, customer) {
    describe('Project list test for user ' + user.username + ':', function() {

      it('I should be able to login', function() {
        auth.login(user);
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/dashboard/');
      });

      it('I should be able to go to projects list', function() {
        element(by.cssContainingText('ul.nav-list.views li a', 'Projects')).click();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/projects/');
        helpers.chooseCustomer(customer);
      });


      for(var j = 0; j < data.projects.length; j++) {
        (function(project) {
          it('I should be able to see ' + project + ' at projects list page', function() {
            element(by.model('ProjectList.searchInput')).sendKeys(project);
            expect(element(by.cssContainingText('h3.item-title a', project)).isPresent()).toBe(true);
          });
        })(data.projects[j]);
      }

      it('I should be able to logout', function() {
        auth.logout();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/');
      });

    });
  })(data.user, data.projects, data.customer);

}

var addProjectTestData = [
  {
    user: auth.getUser('Walter'),
    customer: 'Alice'
  },
  {
    user: auth.getUser('Alice'),
    customer: 'Ministry of Bells'
  }
];

for(var i = 0; i < addProjectTestData.length; i++) {
  var data = addProjectTestData[i],
    user = data.user,
    projectName = helpers.getUUID();

  (function(data, user, projectName) {
    describe('Project creation test for customer owner(' + user.username + '):', function() {
      it('I should be able to login', function() {
        auth.login(user);
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/dashboard/');
      });

      it('I should be able to go to "project add" page', function() {
        element(by.cssContainingText('ul.nav-list.views li a', 'Project')).click();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/projects/');

        element(by.css('li.add-something > a')).click();
        element(by.cssContainingText('li.add-something li a.project', 'Add project')).click();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/projects/add/');
      });

      it('I should be able to add new project', function() {
        helpers.chooseCustomer(data.customer);
        // fill name
        element(by.model('ProjectAdd.project.name')).sendKeys(projectName);

        element(by.cssContainingText('a.button-apply', 'Create project')).click();

        expect(element(by.cssContainingText('h2.app-title', projectName)).isPresent()).toBe(true);
      });

      it('I should be able to see ' + projectName + ' at projects list page', function() {
        element(by.cssContainingText('ul.nav-list.views li a', 'Project')).click();
        element(by.model('ProjectList.searchInput')).sendKeys(projectName);
      });

      it('I should be able to logout', function() {
        auth.logout();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/');
      });
    });
  })(data, user, projectName);
}

var addUserToProjectTestData = [
  {
    user: auth.getUser('Walter'),
    userEmail: 'alice@example.com',
    userNotExistEmail: 'notexist@example.com',
    customer: 'Alice'
  }
];

for(var i = 0; i < addUserToProjectTestData.length; i++) {
  var data = addUserToProjectTestData[i],
    user = data.user,
    projectUrl;

  (function(data, user) {
    describe('Customer owner(' + user.username + ') should be able to add user to project:', function() {
      it('I should be able to login', function() {
        auth.login(user);
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/dashboard/');
      });

      it('I should be able to go to "users add project" page for project "' + projectName + '"', function() {
        helpers.chooseCustomer(data.customer);
        element(by.cssContainingText('ul.nav-list.views li a', 'Projects')).click();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/projects/');
        element(by.model('ProjectList.searchInput')).sendKeys(projectName);
        element(by.cssContainingText('h3.item-title', projectName)).click();
        projectUrl = browser.getCurrentUrl();

        element(by.cssContainingText('.actions-button a.button', 'actions')).click();
        element(by.cssContainingText('.actions-button a.button-simple', 'Add user')).click();

        expect(element(by.cssContainingText('h2.app-title', 'Add users to project ' + projectName)).isPresent()).toBe(true);
      });

      it('I should be able to add user to project', function() {
        element(by.model('searchStr')).sendKeys(data.userNotExistEmail);
        element(by.cssContainingText('a.button', 'Add user')).click();
        expect(element(by.cssContainingText('.error.error-standard', data.userNotExistEmail + ' does not exist')).isPresent()).toBe(true);

        element(by.model('searchStr')).sendKeys(data.userEmail);
        element(by.cssContainingText('a.button', 'Add user')).click();
        element(by.cssContainingText('a.button-apply', 'Add to project')).click();

      });

      it('I should be able to logout', function() {
        auth.logout();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/');
      });
    });
  })(data, user);
}
