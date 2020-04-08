import { translate } from '@waldur/i18n';

// @ngInject
export default function ProjectWorkspaceController(
  $scope,
  ENV,
  usersService,
  currentStateService,
  eventsService,
  projectsService,
  $state,
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
