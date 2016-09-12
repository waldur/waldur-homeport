'use strict';

(function() {
  angular.module('ncsaas')
    .controller('SelectWorkspaceDialogController', SelectWorkspaceDialogController);

  SelectWorkspaceDialogController.$inject = [
    '$scope',
    '$rootScope',
    '$uibModal',
    '$state',
    '$q',
    'customersService',
    'projectsService',
    'currentStateService',
    'usersService'
  ];

  function SelectWorkspaceDialogController(
    $scope,
    $rootScope,
    $uibModal,
    $state,
    $q,
    customersService,
    projectsService,
    currentStateService,
    usersService
  ) {
    var ctrl = this;
    ctrl.organizations = [];
    ctrl.projects = [];
    ctrl.selectedOrganization = {};
    ctrl.selectedProject = {};
    ctrl.currentUser = {};
    ctrl.canCreateOrganization = false;
    ctrl.canCreateProject = false;

    ctrl.selectOrganization = function(organization) {
      ctrl.selectedOrganization = organization;
      if (organization.projects.length > 0) {
        ctrl.selectProject(organization.projects[0]);
      }
      ctrl.canCreateProject = isOwnerOrStaff();
    };

    ctrl.selectProject = function(project) {
      ctrl.selectedProject = project;
    };

    ctrl.gotoOrganization = function(organization) {
      ctrl.$close();
      $rootScope.$broadcast('adjustCurrentCustomer', organization);
      $state.go('dashboard.index', {}, {reload: true});
    };

    ctrl.gotoProject = function(project) {
      ctrl.$close();
      $state.go('project.details', {
        uuid: project.uuid
      });
    };

    ctrl.createOrganization = function() {
      ctrl.$close();
      $uibModal.open({
        templateUrl: 'views/customer/edit-dialog.html',
        controller: 'CustomerEditDialogController'
      });
    }

    ctrl.createProject = function() {
      ctrl.$close();
      $state.go('project-create');
    }

    function isOwnerOrStaff() {
      if (!ctrl.selectedOrganization) {
        return false;
      }
      if (ctrl.currentUser.is_staff) {
        return true;
      }
      var users = ctrl.selectedOrganization.owners;
      for (var i = 0; i < users.length; i++) {
        if (ctrl.currentUser.uuid === users[i].uuid) {
          return true;
        }
      }
      return false;
    }

    function loadInitial() {
      return $q.all([
        currentStateService.getCustomer().then(function(organization) {
          ctrl.organizations.unshift(organization);
          ctrl.selectedOrganization = organization;
        }),

        currentStateService.getProject().then(function(project) {
          ctrl.selectedProject = project;
        }),

        usersService.getCurrentUser().then(function(user) {
          ctrl.currentUser = user;
          ctrl.canCreateOrganization = ctrl.currentUser.is_staff;
        }),

        customersService.getAll({
          field: ['name', 'uuid', 'projects']
        }).then(function(organizations) {
          ctrl.organizations = ctrl.organizations.concat(organizations.filter(function(organization) {
            return organization.uuid !== ctrl.selectedOrganization.uuid;
          }));
        })
      ]).then(function() {
        ctrl.canCreateProject = isOwnerOrStaff();
        return true;
      });
    }

    ctrl.loadingOrganizations = true;
      loadInitial().finally(function() {
      ctrl.loadingOrganizations = false;
    });
  }

})();
