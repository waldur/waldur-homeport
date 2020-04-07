import { connectSidebarCounters } from '@waldur/navigation/sidebar/utils';

import template from './customer-workspace.html';
import { getDefaultItems } from './utils';

// @ngInject
export function CustomerWorkspaceController(
  $scope,
  eventsService,
  customersService,
  $state,
  WorkspaceService,
  BillingUtils,
  BreadcrumbsService,
  titleService,
  SidebarExtensionService,
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

  function getCounters(fields, customer) {
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
      SidebarExtensionService.getItems('customer').then(customItems => {
        const defaultItems = getDefaultItems(options.customer);
        $scope.items = SidebarExtensionService.mergeItems(
          defaultItems,
          customItems,
        );
        const fields = SidebarExtensionService.getCounters($scope.items);
        connectSidebarCounters({
          $scope,
          getCounters: () => getCounters(fields, options.customer),
          getCountersError,
          getCountersSuccess: counters => {
            $scope.counters = counters;
          },
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
