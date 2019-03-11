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
  AppStoreUtilsService,
  BreadcrumbsService,
  titleService,
  SidebarExtensionService) {

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
            uuid: $scope.currentProject.uuid
          }
        },
      ];
      if ($state.current.name.includes('resources')) {
        items.push({
          label: gettext('Resources')
        });
      }
      BreadcrumbsService.items = items;
    }
  }

  function setItems(customItems) {
    $scope.items = [
      {
        key: 'dashboard',
        icon: 'fa-th-large',
        label: gettext('Dashboard'),
        link: 'project.details({uuid: $ctrl.context.project.uuid})',
        index: 100,
      },
      {
        key: 'appstore',
        icon: 'fa-shopping-cart',
        label: gettext('Service store'),
        feature: 'appstore',
        action: function() {
          return AppStoreUtilsService.openDialog();
        },
        state: 'appstore',
        index: 200,
      },
      {
        label: gettext('Resources'),
        icon: 'fa-files-o',
        link: 'project.resources',
        key: 'resources',
        feature: 'resources.legacy',
        index: 300,
        orderByLabel: true,
        children: [
          {
            key: 'vms',
            link: 'project.resources.vms({uuid: $ctrl.context.project.uuid})',
            icon: 'fa-desktop',
            label: gettext('Virtual machines'),
            feature: 'vms',
            countFieldKey: 'vms',
            index: 100,
          },
          {
            key: 'private_clouds',
            link: 'project.resources.clouds({uuid: $ctrl.context.project.uuid})',
            icon: 'fa-cloud',
            label: gettext('Private clouds'),
            feature: 'private_clouds',
            countFieldKey: 'private_clouds',
            index: 200,
          },
          {
            key: 'storages',
            link: 'project.resources.storage.tabs({uuid: $ctrl.context.project.uuid})',
            icon: 'fa-hdd-o',
            label: gettext('Storage'),
            feature: 'storage',
            countFieldKey: 'storages',
            index: 400,
          },
        ]
      },
      {
        key: 'eventlog',
        link: 'project.events({uuid: $ctrl.context.project.uuid})',
        icon: 'fa-bell-o',
        label: gettext('Audit logs'),
        feature: 'eventlog',
        index: 500,
      },
      {
        key: 'support',
        link: 'project.issues({uuid: $ctrl.context.project.uuid})',
        icon: 'fa-question-circle',
        label: gettext('Issues'),
        feature: 'support',
        index: 600,
      },
      {
        label: gettext('Team'),
        icon: 'fa-group',
        link: 'project.team({uuid: $ctrl.context.project.uuid})',
        feature: 'team',
        key: 'team',
        countFieldKey: 'users',
        index: 800,
      },
      {
        key: 'cost-planning',
        label: gettext('Cost planning'),
        icon: 'fa-calculator',
        link: 'project.cost-planning({uuid: $ctrl.context.project.uuid})',
        feature: 'cost-planning',
        index: 900,
      }
    ];
    $scope.items = SidebarExtensionService.mergeItems($scope.items, customItems);
    addBackToOrganizationItemIfAllowed($scope.items);
    $scope.items = filterItemsByProjectType($scope.items);
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

  function filterItemsByProjectType(items) {
    const fn = getFilterFunction();
    if (!fn) {
      return items;
    }
    return fn(items).map(parent => {
      if (parent.children) {
        return {...parent, children: fn(parent.children)};
      } else {
        return parent;
      }
    });
  }

  function getFilterFunction() {
    const conf = ENV.sidebarItemsByProjectType;
    const sidebarItems = conf && conf[$scope.currentProject.type_name];
    if (!sidebarItems) {
      return;
    }
    const itemsMap = sidebarItems.reduce((map, item) => ({...map, [item]: true}), {});
    const filterItems = items => items.filter(item => itemsMap[item.key]);
    return filterItems;
  }

  function refreshProject() {
    currentStateService.getProject().then(function(project) {
      if (!project) {
        return;
      }
      $scope.currentProject = project;
      $scope.context = {project: project};
      SidebarExtensionService.getItems('project').then(customItems => {
        setItems(customItems);
        tabCounterService.connect({
          $scope: $scope,
          tabs: $scope.items,
          getCounters: getCounters.bind(null, project),
          getCountersError: getCountersError
        });
      });
      refreshBreadcrumbs();
    });
  }

  function getCounters(project) {
    const fields = SidebarExtensionService.getCounters($scope.items);
    let query = angular.extend(
      {UUID: project.uuid, fields},
      eventsService.defaultFilter
    );
    return projectsService.getCounters(query);
  }

  function getCountersError(error) {
    if (error.status === 404) {
      projectsService.getFirst().then(function(project) {
        $state.go('project.details', {uuid: project.uuid});
      });
    }
  }

  function getBackToOrganization(customerUuid) {
    return {
      label: gettext('Back to organization'),
      icon: 'fa-arrow-left',
      action: () => $state.go('organization.dashboard', {uuid: customerUuid}),
    };
  }
}
