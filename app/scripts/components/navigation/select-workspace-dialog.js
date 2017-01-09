import template from './select-workspace-dialog.html';

export default function selectWorkspaceDialog() {
  return {
    restrict: 'E',
    template: template,
    controller: SelectWorkspaceDialogController,
    controllerAs: 'Ctrl',
    scope: {},
    bindToController: {
      dismiss: '&',
      close: '&'
    }
  };
}

// @ngInject
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

  ctrl.selectOrganization = function(organization) {
    ctrl.selectedOrganization = organization;
    if (organization.projects.length > 0) {
      ctrl.selectProject(organization.projects[0]);
    }
  };

  ctrl.selectProject = function(project) {
    ctrl.selectedProject = project;
  };

  ctrl.gotoOrganization = function(organization) {
    $rootScope.$broadcast('adjustCurrentCustomer', organization);
    var promise = $state.go('dashboard.index');
    return blockAndClose(promise);
  };

  ctrl.gotoProject = function(project) {
    var promise = $state.go('project.details', {uuid: project.uuid});
    return blockAndClose(promise);
  };

  ctrl.gotoProfile = function() {
    var promise = $state.go('profile.details');
    return blockAndClose(promise);
  };

  ctrl.createOrganization = function() {
    var promise = $uibModal.open({
      component: 'customerCreateDialog',
    }).opened;
    return blockAndClose(promise);
  };

  ctrl.createProject = function() {
    $rootScope.$broadcast('adjustCurrentCustomer', ctrl.selectedOrganization);
    var promise = $state.go('project-create');
    return blockAndClose(promise);
  };

  function blockAndClose(promise) {
    ctrl.loadingState = true;
    return promise.finally(function() {
      ctrl.loadingState = false;
      ctrl.close();
    });
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
        field: ['name', 'uuid', 'projects', 'owners', 'quotas', 'abbreviation']
      }).then(function(organizations) {
        ctrl.organizations = ctrl.organizations.concat(organizations.filter(function(organization) {
          return organization.uuid !== ctrl.selectedOrganization.uuid;
        }));

        angular.forEach(ctrl.organizations, organization => {
          organization.ownerOrStaff = customersService.checkCustomerUser(organization, ctrl.currentUser);
        });
      })
    ]);
  }

  ctrl.loadingOrganizations = true;
  loadInitial().finally(function() {
    ctrl.loadingOrganizations = false;
  });
}
