'use strict';

(function() {
  angular.module('ncsaas')
    .controller('ProjectListController', ['$rootScope', '$location', 'projectsService', ProjectListController]);

  function ProjectListController($rootScope, $location, projectsService) {
    var vm = this;

    vm.list = {};
    vm.deleteProject = deleteProject;
    vm.service = projectsService;

    // search
    vm.searchInput = '';
    vm.search = search;

    $rootScope.$on('currentCustomerUpdated', function() {
      projectsService.page = 1;
      activate();
    });

    function deleteProject(project) {
      var index = vm.list.indexOf(project);
      var confirmDelete = confirm('Confirm project deletion?');
      if (confirmDelete) {
        projectsService.$delete(project.uuid).then(
          function(response) {
            vm.list.splice(index, 1);
          },
          handleProjectDeletionException
        );
      } else {
        alert('Project was not deleted.');
      }
    }

    function handleProjectDeletionException(response) {
      var message = response.data.status || response.data.detail;
      alert(message);
    }

    function search() {
      projectsService.getList({name: vm.searchInput}, true, true).then(function(response) {
        vm.list = response;
      });
    }

    function activate() {
      initList();
    }

    function initList() {
      projectsService.getList(null, true, true).then(function(response) {
        vm.pages = projectsService.pages;
        vm.list = response;
      });
    }

    $rootScope.$on('currentCustomerUpdated', function () {
      initList();
    });

    activate();

  }

  angular.module('ncsaas')
    .controller('ProjectAddController', ['$state', 'projectsService', 'customersService', ProjectAddController]);

  function ProjectAddController($state, projectsService, customersService) {
    var vm = this;

    vm.project = projectsService.$create();
    vm.customersList = customersService.getCustomersList();
    vm.save = save;

    function save() {
      // TODO: refactor this function to use named urls and uuid field instead - SAAS-108
      vm.project.$save(function() {
        var url = vm.project.url,
          array = url.split ('/').filter(function(el) {
            return el.length !== 0;
          }),
          uuidNew = array[4];
        $state.go('project', {uuid:uuidNew});
      });
    }

  }

  angular.module('ncsaas')
    .controller('ProjectDetailUpdateController', [
      '$stateParams',
      '$rootScope',
      'projectsService',
      ProjectDetailUpdateController
    ]);

  function ProjectDetailUpdateController($stateParams, $rootScope, projectsService) {
    var vm = this;

    vm.activeTab = 'eventlog';
    vm.project = null;
    projectsService.$get($stateParams.uuid).then(function(response) {
      vm.project = response;
    });
    vm.update = update;

    function update() {
      vm.project.$update();
    }

  }

})();
