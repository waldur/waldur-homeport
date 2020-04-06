import template from './customer-workspace.html';

// @ngInject
export function CustomerWorkspaceController(
  $scope,
  eventsService,
  customersService,
  $state,
  tabCounterService,
  WorkspaceService,
  BillingUtils,
  BreadcrumbsService,
  titleService,
  SidebarExtensionService,
) {
  $scope.titleService = titleService;

  function setItems(customItems) {
    $scope.items = [
      {
        label: gettext('Dashboard'),
        icon: 'fa-th-large',
        link: 'organization.dashboard({uuid: $ctrl.context.customer.uuid})',
        index: 100,
      },
      {
        label: gettext('Projects'),
        icon: 'fa-bookmark',
        link: 'organization.projects({uuid: $ctrl.context.customer.uuid})',
        feature: 'projects',
        countFieldKey: 'projects',
        index: 300,
      },
      {
        label: gettext('Audit logs'),
        icon: 'fa-bell-o',
        link: 'organization.details({uuid: $ctrl.context.customer.uuid})',
        feature: 'eventlog',
        index: 600,
      },
      {
        label: gettext('Issues'),
        icon: 'fa-question-circle',
        link: 'organization.issues({uuid: $ctrl.context.customer.uuid})',
        feature: 'support',
        index: 700,
      },
      {
        label: gettext('Team'),
        icon: 'fa-group',
        link: 'organization.team({uuid: $ctrl.context.customer.uuid})',
        feature: 'team',
        key: 'team',
        countFieldKey: 'users',
        index: 900,
      },
      {
        label: BillingUtils.getTabTitle(),
        icon: 'fa-file-text-o',
        link: 'organization.billing.tabs({uuid: $ctrl.context.customer.uuid})',
        feature: 'billing',
        index: 1000,
      },
      {
        label: gettext('Manage'),
        icon: 'fa-wrench',
        link: 'organization.manage({uuid: $ctrl.context.customer.uuid})',
        index: 9999,
      },
    ];
    $scope.items = SidebarExtensionService.mergeItems(
      $scope.items,
      customItems,
    );
  }

  function refreshBreadcrumbs() {
    BreadcrumbsService.activeItem = $scope.pageTitle;
    if (!$scope.currentCustomer) {
      return;
    }
    BreadcrumbsService.items = [
      {
        label: gettext('Organization workspace'),
        state: 'organization.dashboard',
        params: {
          uuid: $scope.currentCustomer.uuid,
        },
      },
    ];
  }

  function getCounters(customer) {
    const fields = SidebarExtensionService.getCounters($scope.items);
    const query = angular.extend(
      { UUID: customer.uuid, fields },
      eventsService.defaultFilter,
    );
    return customersService.getCounters(query);
  }

  function getCountersError(error) {
    if (error.status === 404) {
      $state.go('errorPage.notFound');
    }
  }

  function refreshWorkspace() {
    const options = WorkspaceService.getWorkspace();
    if (
      options &&
      options.customer &&
      !angular.equals($scope.currentCustomer, options.customer)
    ) {
      $scope.currentCustomer = options.customer;
      $scope.context = { customer: options.customer };
      SidebarExtensionService.getItems('customer').then(customItems => {
        setItems(customItems);
        tabCounterService.connect({
          $scope: $scope,
          tabs: $scope.items,
          getCounters: getCounters.bind(null, options.customer),
          getCountersError: getCountersError,
        });
      });
      refreshBreadcrumbs();
    }
  }

  function activate() {
    $scope.$on('WORKSPACE_CHANGED', refreshWorkspace);
    $scope.$on('$stateChangeSuccess', () => {
      if ($state.current.data && $state.current.data) {
        $scope.pageTitle = $state.current.data.pageTitle;
      }
      refreshBreadcrumbs();
    });
    refreshWorkspace();
  }

  activate();
}

export default function customerWorkspace() {
  return {
    restrict: 'E',
    template: template,
    controller: CustomerWorkspaceController,
    transclude: true,
  };
}
