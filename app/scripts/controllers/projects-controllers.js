'use strict';

(function() {
  angular.module('ncsaas')
    .controller('ProjectListController',
      ['$rootScope', 'projectsService', 'projectPermissionsService', 'resourcesService', ProjectListController]);

  function ProjectListController($rootScope, projectsService, projectPermissionsService, resourcesService) {
    var vm = this;

    vm.list = {};
    vm.deleteProject = deleteProject;
    vm.service = projectsService;

    // search
    vm.searchInput = '';
    vm.search = search;

    vm.showMore = showMore;

    $rootScope.$on('currentCustomerUpdated', function() {
      projectsService.page = 1;
      activate();
    });

    function showMore(project) {
      if (!project.users) {
        projectPermissionsService.filterByCustomer = false;
        projectPermissionsService.getList({project:project.uuid}).then(function(reponse) {
          project.users = reponse;
        });
      }
      if (!project.resources) {
        resourcesService.filterByCustomer = false;
        resourcesService.getList({project:project.uuid}).then(function(reponse) {
          project.resources = reponse;
        });
      }
    }

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
      projectsService.getList({name: vm.searchInput}).then(function(response) {
        vm.list = response;
      });
    }

    function activate() {
      initList();
    }

    function initList() {
      projectsService.getList().then(function(response) {
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
    .controller('ProjectAddController', ['$state', 'projectsService',
      'currentStateService', 'servicesService', 'projectCloudMembershipsService', ProjectAddController]);

  function ProjectAddController(
    $state, projectsService, currentStateService, servicesService, projectCloudMembershipsService) {
    var vm = this;

    vm.project = projectsService.$create();
    vm.save = save;

    function save() {
      // TODO: refactor this function to use named urls and uuid field instead - SAAS-108
      currentStateService.getCustomer().then(function(customer) {
        vm.project.customer = customer.url;

        vm.project.$save(function() {
          var url = vm.project.url,
            array = url.split ('/').filter(function(el) {
              return el.length !== 0;
            }),
            uuidNew = array[4];
          servicesService.filterByCustomer = false;
          servicesService.getList().then(function(response) {
            for (var i = 0; response.length > i; i++) {
              projectCloudMembershipsService.addRow(vm.project.url, response[i].url);
            }
          });
          $state.go('projects.details', {uuid:uuidNew});
        }, function(response) {
          vm.errors = response.data;
        });
      });
    }

  }

  angular.module('ncsaas')
    .controller('ProjectDetailUpdateController', [
      '$stateParams',
      'projectsService',
      'projectPermissionsService',
      'USERPROJECTROLE',
      'usersService',
      ProjectDetailUpdateController
    ]);

  function ProjectDetailUpdateController(
    $stateParams, projectsService, projectPermissionsService, USERPROJECTROLE, usersService) {
    var vm = this;

    vm.activeTab = 'eventlog';
    vm.project = null;
    projectsService.$get($stateParams.uuid).then(function(response) {
      vm.project = response;
    });
    vm.update = update;

    // users tab
    vm.adminRole = USERPROJECTROLE.admin;
    vm.managerRole = USERPROJECTROLE.manager;
    vm.users = {};
    vm.users[vm.adminRole] = [];
    vm.users[vm.managerRole] = [];
    vm.activateUserTab = activateUserTab;
    vm.usersList = [];
    vm.userSearchInputChanged = userSearchInputChanged;
    vm.selectedUsersCallback = selectedUsersCallback;
    vm.user = null;
    vm.userProjectRemove = userProjectRemove;

    function getUserList(filter) {
      usersService.getList(filter).then(function(response) {
        vm.usersList = response;
      });
    }

    function activateUserTab() {
      if (vm.users[vm.adminRole].length === 0) {
        getUsers(vm.adminRole);
      }
      if (vm.users[vm.managerRole].length === 0) {
        getUsers(vm.managerRole);
      }
      getUserList();
    }

    function getUsers(role) {
      var filter = {
        role: role,
        project: $stateParams.uuid
      };
      projectPermissionsService.getList(filter).then(function(response) {
        vm.users[role] = response;
      });
    }

    function userSearchInputChanged(searchText) {
      getUserList({full_name: searchText});
    }

    function selectedUsersCallback(selected) {
      if (selected) {
        vm.user = selected.originalObject;
        addUser(this.id);
        getUserList();
      }
    }

    function addUser(role) {
      var instance = projectPermissionsService.$create();
      instance.user = vm.user.url;
      instance.project = vm.project.url;
      instance.role = role;
      instance.$save(
        function() {
          getUsers(role);
        },
        function(response) {
          alert(response.data.non_field_errors);
        }
      );
    }

    function userProjectRemove(userProject) {
      var role = userProject.role;
      var index = vm.users[role].indexOf(userProject);
      var confirmDelete = confirm('Confirm user deletion?');
      if (confirmDelete) {
        projectPermissionsService.$delete(userProject.pk).then(
          function() {
            vm.users[role].splice(index, 1);
          },
          function(response) {
            alert(response.data.detail);
          }
        );
      } else {
        alert('User was not deleted.');
      }
    }

    function update() {
      vm.project.$update();
    }

  }

})();
