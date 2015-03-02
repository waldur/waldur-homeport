'use strict';

(function() {
  angular.module('ncsaas')
    .service('projectsService', ['RawProject', 'RawUser', 'RawCustomer', 'RawService', projectsService]);

  function projectsService(RawProject, RawUser, RawCustomer, RawService) {
    /*jshint validthis: true */
    var vm = this;
    /*jshint validthis: false */

    vm.getProject = getProject;
    vm.getProjectsList = getProjectsList;
    vm.createProject = createProject;
    vm.getRawProjectsList = getRawProjectsList;

    function createProject() {
      return new RawProject();
    }

    function getProject(uuid) {
      var project = RawProject.get({projectUUID: uuid}, init);

      function init(project) {
        initProjectUsers(project);
        initProjectCustomer(project);
        initProjectService(project);
      }

      return project;
    }

    function getRawProjectsList() {
      return RawProject.query();
    }

    function getProjectsList() {
      var projects = RawProject.query(init);

      function init(projects) {
        for (var i = 0; i < projects.length; i++) {
          initProjectUsers(projects[i]);
        }
      }

      return projects;
    }

    function initProjectUsers(project) {
      RawUser.query({project: project.name}, init);

      function init(users) {
        project.users = users;
      }
    }

    function initProjectCustomer(project) {
      /*jshint camelcase: false */
      RawCustomer.query({name: project.customer_name}, init);

      function init(customers) {
        project.customer = customers[0];
      }
    }

    function initProjectService(project) {
      RawService.query({project: project.uuid}, init);

      function init(services) {
        project.services = services;
      }
    }

  }

})();

(function() {
  angular.module('ncsaas')
    .factory('RawProject', ['ENV', '$resource', RawProject]);

    function RawProject(ENV, $resource) {
      return $resource(
        ENV.apiEndpoint + 'api/projects/:projectUUID/', {projectUUID: '@uuid'},
        {
          update: {
            method: 'PUT'
          }
        }

      );
    }

})();
