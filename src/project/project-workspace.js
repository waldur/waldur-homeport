/* eslint-disable */
// @ngInject
export default function ProjectWorkspaceController(
  $scope,
  ENV,
  usersService,
  currentStateService,
  tabCounterService,
  eventsService,
  projectsService,
  $state,
  BreadcrumbsService,
  titleService,
  SidebarExtensionService,
) {
  activate();

  $scope.titleService = titleService;

  function activate() {
    $scope.$on('WORKSPACE_CHANGED', () => refreshProject());
    refreshProject();

    $scope.$on('$stateChangeSuccess', () => refreshBreadcrumbs());
    refreshBreadcrumbs();
  }

  function refreshBreadcrumbs() {
    if ($state.current.data && $state.current.data) {
      BreadcrumbsService.activeItem = $state.current.data.pageTitle;
    }

    if ($scope.currentProject) {
      if (!BreadcrumbsService.activeItem) {
        BreadcrumbsService.activeItem = $scope.currentProject.name;
      }
      let items = [
        {
          label: gettext('Project workspace'),
          state: 'project.details',
          params: {
            uuid: $scope.currentProject.uuid,
          },
        },
      ];
      if ($state.current.name.includes('resources')) {
        items.push({
          label: gettext('Resources'),
        });
      }
      BreadcrumbsService.items = items;
    }
  }

  function setItems(project, customItems) {
    $scope.items = [
      {
        key: 'dashboard',
        icon: 'fa-th-large',
        label: gettext('Dashboard'),
        state: 'project.details',
        params: {
          uuid: project.uuid,
        },
        index: 100,
      },
      {
        key: 'eventlog',
        state: 'project.events',
        params: {
          uuid: project.uuid,
        },
        icon: 'fa-bell-o',
        label: gettext('Audit logs'),
        feature: 'eventlog',
        index: 500,
      },
      {
        key: 'support',
        state: 'project.issues',
        params: {
          uuid: project.uuid,
        },
        icon: 'fa-question-circle',
        label: gettext('Issues'),
        feature: 'support',
        index: 600,
      },
      {
        label: gettext('Team'),
        icon: 'fa-group',
        state: 'project.team',
        params: {
          uuid: project.uuid,
        },
        feature: 'team',
        key: 'team',
        countFieldKey: 'users',
        index: 800,
      },
    ];
    $scope.items = SidebarExtensionService.mergeItems(
      $scope.items,
      customItems,
    );
    addBackToOrganizationItemIfAllowed($scope.items);
  }

  function addBackToOrganizationItemIfAllowed(items) {
    currentStateService.getCustomer().then(customer => {
      usersService.getCurrentUser().then(currentUser => {
        if (currentStateService.getOwnerOrStaff() || currentUser.is_support) {
          items.unshift(getBackToOrganization(customer.uuid));
        }
      });
    });
  }

  function refreshProject() {
    currentStateService.getProject().then(function(project) {
      if (!project) {
        return;
      }
      $scope.currentProject = project;
      SidebarExtensionService.getItems('project').then(customItems => {
        setItems(project, customItems);
        tabCounterService.connect({
          $scope: $scope,
          tabs: $scope.items,
          getCounters: getCounters.bind(null, project),
          getCountersError: getCountersError,
        });
      });
      refreshBreadcrumbs();
    });
  }

  function getCounters(project) {
    const fields = SidebarExtensionService.getCounters($scope.items);
    let query = angular.extend(
      { UUID: project.uuid, fields },
      eventsService.defaultFilter,
    );
    return projectsService.getCounters(query);
  }

  function getCountersError(error) {
    if (error.status === 404) {
      projectsService.getFirst().then(function(project) {
        $state.go('project.details', { uuid: project.uuid });
      });
    }
  }

  function getBackToOrganization(customerUuid) {
    return {
      label: gettext('Back to organization'),
      icon: 'fa-arrow-left',
      state: 'organization.dashboard',
      params: { uuid: customerUuid },
    };
  }
}
