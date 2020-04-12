import { translate } from '@waldur/i18n';

import { WOKSPACE_NAMES } from '../navigation/workspace/constants';

import template from './project-base.html';

// @ngInject
function ProjectWorkspaceController(
  $scope,
  $stateParams,
  $state,
  currentStateService,
  projectsService,
  projectPermissionsService,
  customersService,
  WorkspaceService,
  usersService,
  BreadcrumbsService,
  titleService,
) {
  $scope.titleService = titleService;

  function refreshBreadcrumbs() {
    if ($state.current.data && $state.current.data) {
      BreadcrumbsService.activeItem = $state.current.data.pageTitle;
    }

    if ($scope.currentProject) {
      if (!BreadcrumbsService.activeItem) {
        BreadcrumbsService.activeItem = $scope.currentProject.name;
      }
      const items = [
        {
          label: translate('Project workspace'),
          state: 'project.details',
          params: {
            uuid: $scope.currentProject.uuid,
          },
        },
      ];
      if ($state.current.name.includes('resources')) {
        items.push({
          label: translate('Resources'),
        });
      }
      BreadcrumbsService.items = items;
    }
  }

  async function refreshProject() {
    const project = await currentStateService.getProject();
    if (!project) {
      return;
    }
    $scope.currentProject = project;
    refreshBreadcrumbs();
  }

  async function loadData() {
    try {
      const user = await usersService.getCurrentUser();
      const project = await projectsService.$get($stateParams.uuid);
      const customer = await customersService.$get(project.customer_uuid);
      const permissions = await projectPermissionsService.getList({
        user: user.uuid,
        project: project.uuid,
      });
      project.permissions = permissions;
      currentStateService.setCustomer(customer);
      currentStateService.setProject(project);
      WorkspaceService.setWorkspace({
        customer,
        project,
        hasCustomer: true,
        workspace: WOKSPACE_NAMES.project,
      });
      const status = customersService.checkCustomerUser(customer, user);
      currentStateService.setOwnerOrStaff(status);
      $scope.currentProject = project;
    } catch (response) {
      if (response.status === 404) {
        $state.go('errorPage.notFound');
      }
    }
  }

  function activate() {
    if (!$stateParams.uuid) {
      $state.go('errorPage.notFound');
      return;
    }

    loadData();

    $scope.$on('WORKSPACE_CHANGED', () => refreshProject());
    refreshProject();

    $scope.$on('$stateChangeSuccess', () => refreshBreadcrumbs());
    refreshBreadcrumbs();
  }

  activate();
}

export default () => ({
  template,
  controller: ProjectWorkspaceController,
});
