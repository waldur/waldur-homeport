import { translate } from '@waldur/i18n';
import { connectSidebarCounters } from '@waldur/navigation/sidebar/utils';

import { getDefaultItems, getBackToOrganization } from './utils';

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
  SidebarExtensionService,
) {
  $scope.titleService = titleService;
  $scope.items = [];
  $scope.counters = {};

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

  function getCounters(fields, project) {
    return projectsService.getCounters({
      UUID: project.uuid,
      ...fields,
      ...eventsService.defaultFilter,
    });
  }

  function getCountersError(error) {
    if (error.status === 404) {
      projectsService.getFirst().then(project => {
        $state.go('project.details', { uuid: project.uuid });
      });
    }
  }

  async function getNavItems() {
    const customer = await currentStateService.getCustomer();
    const currentUser = await usersService.getCurrentUser();
    if (currentStateService.getOwnerOrStaff() || currentUser.is_support) {
      return [getBackToOrganization(customer.uuid)];
    }
    return [];
  }

  async function refreshSidebar(project) {
    const navItems = await getNavItems();
    const defaultItems = getDefaultItems(project);
    const customItems = await SidebarExtensionService.getItems('project');
    $scope.items = SidebarExtensionService.mergeItems(
      [...navItems, ...defaultItems],
      customItems,
    );
    const fields = SidebarExtensionService.getCounters($scope.items);
    connectSidebarCounters({
      $scope,
      getCounters: () => getCounters(fields, project),
      getCountersError,
      getCountersSuccess: counters => {
        $scope.counters = counters;
      },
    });
  }

  async function refreshProject() {
    const project = await currentStateService.getProject();
    if (!project) {
      return;
    }
    $scope.currentProject = project;
    refreshSidebar(project);
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
