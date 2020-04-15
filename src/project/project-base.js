import { translate } from '@waldur/i18n';

import template from './project-base.html';

// @ngInject
function ProjectWorkspaceController(
  $scope,
  $state,
  currentStateService,
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

  function activate() {
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
