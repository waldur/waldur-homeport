var auth = require('../helpers/auth.js'),
  helpers = require('../helpers/helpers.js'),
  testData = [
    {
      user: auth.getUser('Walter'),
      projects: ['bells.org'],
      customer: 'Ministry of Bells'
    }
  ];

for(var i = 0; i < testData.length; i++) {
  var data = testData[i];

  (function(user, projects, customer) {
    describe('Project list test for user ' + user.username + ':', function() {

      xit('I should be able to login', function() {
        auth.login(user);
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/dashboard/');
      });

      xit('I should be able to go to projects list', function() {
        helpers.chooseCustomer(customer);
        goToProjectList();
      });


      for(var j = 0; j < data.projects.length; j++) {
        (function(project) {
          xit('I should be able to see ' + project + ' at projects list page', function() {
            element(by.model('entityList.searchInput')).sendKeys(project);
            expect(element(by.cssContainingText('h3.item-title a', project)).isPresent()).toBe(true);
          });
        })(data.projects[j]);
      }

      xit('I should be able to logout', function() {
        auth.logout();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/');
      });

    });
  })(data.user, data.projects, data.customer);

}

var addProjectTestData = [
  {
    user: auth.getUser('Walter'),
    customer: 'Ministry of Bells'
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
      xit('I should be able to login', function() {
        auth.login(user);
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/dashboard/');
      });

      xit('I should be able to go to "project add" page', function() {
        helpers.chooseCustomer(data.customer);
        goToProjectList();

        element(by.cssContainingText('.button span', 'Add project')).click();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/projects/add/');
      });

      xit('I should be able to add new project', function() {
        // fill name
        element(by.model('ProjectAdd.project.name')).sendKeys(projectName);

        element(by.cssContainingText('a.button-apply', 'Add project')).click();

        expect(element(by.cssContainingText('.details-about .name', projectName)).isPresent()).toBe(true);
      });

      xit('I should be able to see ' + projectName + ' at projects list page', function() {
        goToProjectList();
        element(by.model('entityList.searchInput')).sendKeys(projectName);
        expect(element(by.cssContainingText('h3.item-title a', projectName)).isPresent()).toBe(true);
      });

      xit('I should be able to logout', function() {
        auth.logout();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/');
      });
    });
  })(data, user, projectName);
}

var addUserToProjectTestData = [
  {
    user: auth.getUser('Walter'),
    customer: 'Ministry of Bells',
    adminUser: 'Dave Lebowski',
    managerUser: 'Charlie Lebowski'
  }
];

for(var i = 0; i < addUserToProjectTestData.length; i++) {
  var data = addUserToProjectTestData[i],
    user = data.user;

  (function(data, user) {
    describe('Customer owner(' + user.username + ') should be able to add user to project:', function() {
      xit('I should be able to login', function() {
        auth.login(user);
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/dashboard/');
      });

      xit('I should be able to go to "users tab" at project "' + projectName + '"', function() {
        helpers.chooseCustomer(data.customer);
        goToProjectList();
        element(by.model('entityList.searchInput')).sendKeys(projectName);
        element(by.cssContainingText('h3.item-title', projectName)).click();

        element(by.cssContainingText('.tabs-links li', 'People')).click();
        expect(element(by.cssContainingText('.add-or-remove .app-title', 'Administrator')).isPresent()).toBe(true);
      });

      xit('I should be able to add user to project', function() {
        element(by.css('#admin input')).sendKeys(data.adminUser);
        element(by.cssContainingText('#admin .angucomplete-row .angucomplete-title', data.adminUser)).click();
        expect(element(by.cssContainingText('.add-or-remove .added', data.adminUser)).isPresent()).toBe(true);
        element(by.cssContainingText('.add-or-remove .added', data.adminUser)).click();
        browser.switchTo().alert().accept();
        expect(element(by.cssContainingText('.add-or-remove .added', data.adminUser)).isPresent()).toBe(false);

        element(by.css('#manager input')).sendKeys(data.managerUser);
        element(by.cssContainingText('#manager .angucomplete-row .angucomplete-title', data.managerUser)).click();
        expect(element(by.cssContainingText('.add-or-remove .added', data.managerUser)).isPresent()).toBe(true);
        element(by.cssContainingText('.add-or-remove .added', data.managerUser)).click();
        browser.switchTo().alert().accept();
        expect(element(by.cssContainingText('.add-or-remove .added', data.managerUser)).isPresent()).toBe(false);
      });

      xit('I should be able to logout', function() {
        auth.logout();
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/');
      });
    });
  })(data, user);
}

function goToProjectList() {
  element(by.css('.dropdown.project-dropdown .project-context')).click();
  element(by.cssContainingText('.dropdown.project-dropdown .nav-sublist li a', 'Manage projects')).click();
  expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/projects/');
}
