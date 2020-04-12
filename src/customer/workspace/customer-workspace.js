import template from './customer-workspace.html';

// @ngInject
function CustomerWorkspaceController(
  $scope,
  eventsService,
  customersService,
  $state,
  WorkspaceService,
  BillingUtils,
  BreadcrumbsService,
  titleService,
) {
  $scope.titleService = titleService;

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

  function refreshWorkspace() {
    const options = WorkspaceService.getWorkspace();
    $scope.currentCustomer = options.customer;
    refreshBreadcrumbs();
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
