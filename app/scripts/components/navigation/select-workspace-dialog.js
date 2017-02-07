import template from './select-workspace-dialog.html';
import './select-workspace-dialog.scss';

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
    $uibModal,
    $state,
    $q,
    customersService,
    currentStateService,
    usersService,
    ncUtils
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
    var promise = $state.go('organization.dashboard', {uuid: organization.uuid}, {reload: true});
    return blockAndClose(promise);
  };

  ctrl.gotoProject = function(project) {
    var promise = $state.go('project.details', {uuid: project.uuid}, {reload: true});
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
    var promise = $state.go('organization.createProject', {
      uuid: ctrl.selectedOrganization.uuid
    });
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
        if (organization) {
          ctrl.organizations.unshift(organization);
        }
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
        field: ['name', 'uuid', 'projects', 'owners', 'quotas', 'abbreviation'],
        o: 'name'
      }).then(function(organizations) {
        if (ctrl.selectedOrganization) {
          organizations = organizations.filter(function(organization) {
            return organization.uuid !== ctrl.selectedOrganization.uuid;
          });
        }
        ctrl.organizations = ctrl.organizations.concat(organizations);

        angular.forEach(ctrl.organizations, organization => {
          organization.ownerOrStaff = customersService.checkCustomerUser(organization, ctrl.currentUser);
          organization.canGotoDashboard = organization.ownerOrStaff || ctrl.currentUser.is_support;
          organization.projects = ncUtils.sortArrayOfObjects(organization.projects, 'name', 0);
        });
      })
    ]);
  }

  ctrl.loadingOrganizations = true;
  loadInitial().finally(function() {
    ctrl.loadingOrganizations = false;
  });
}
