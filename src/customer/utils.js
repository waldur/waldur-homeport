import { WOKSPACE_NAMES } from '../navigation/workspace/constants';

// @ngInject
export function loadCustomer(
  $q,
  $stateParams,
  $state,
  customersService,
  currentStateService,
  WorkspaceService,
) {
  if (!$stateParams.uuid) {
    return $q.reject();
  }
  return customersService
    .$get($stateParams.uuid)
    .then(customer => {
      currentStateService.setCustomer(customer);
      return customer;
    })
    .then(customer => {
      WorkspaceService.setWorkspace({
        customer: customer,
        project: null,
        hasCustomer: true,
        workspace: WOKSPACE_NAMES.organization,
      });
      return customer;
    })
    .catch(error => {
      if (error.status === 404) {
        $state.go('errorPage.notFound');
      }
    });
}

// @ngInject
export function CustomerController(
  $scope,
  $state,
  usersService,
  currentStateService,
  customersService,
) {
  usersService.getCurrentUser().then(currentUser => {
    currentStateService.getCustomer().then(currentCustomer => {
      $scope.currentCustomer = currentCustomer;
      $scope.currentUser = currentUser;

      if (
        customersService.checkCustomerUser(currentCustomer, currentUser) ||
        currentUser.is_support
      ) {
        currentStateService.setOwnerOrStaff(true);
      } else {
        currentStateService.setOwnerOrStaff(false);
        $state.go('profile.details');
      }
    });
  });
}
