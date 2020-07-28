import store from '@waldur/store/store';
import { UsersService } from '@waldur/user/UsersService';
import {
  setCurrentCustomer,
  setCurrentProject,
  setCurrentWorkspace,
} from '@waldur/workspace/actions';
import { getCustomer } from '@waldur/workspace/selectors';
import { ORGANIZATION_WORKSPACE } from '@waldur/workspace/types';

import { CustomersService } from './services/CustomersService';

// @ngInject
export function loadCustomer($q, $stateParams, $state) {
  if (!$stateParams.uuid) {
    return $q.reject();
  }
  return CustomersService.get($stateParams.uuid)
    .then((customer) => {
      store.dispatch(setCurrentCustomer(customer));
      store.dispatch(setCurrentProject(null));
      store.dispatch(setCurrentWorkspace(ORGANIZATION_WORKSPACE));
      return customer;
    })
    .catch((error) => {
      if (error.status === 404) {
        $state.go('errorPage.notFound');
      }
    });
}

// @ngInject
export function CustomerController($scope, $state) {
  UsersService.getCurrentUser().then((currentUser) => {
    const currentCustomer = getCustomer(store.getState());
    $scope.currentCustomer = currentCustomer;
    $scope.currentUser = currentUser;

    if (
      !CustomersService.checkCustomerUser(currentCustomer, currentUser) &&
      !currentUser.is_support
    ) {
      $state.go('profile.details');
    }
  });
}
