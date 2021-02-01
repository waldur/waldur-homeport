import { get } from '@waldur/core/api';
import { getCustomer } from '@waldur/project/api';
import store from '@waldur/store/store';
import { UsersService } from '@waldur/user/UsersService';
import { setCurrentCustomer } from '@waldur/workspace/actions';
import {
  checkCustomerUser,
  getCustomer as getCustomerSelector,
} from '@waldur/workspace/selectors';
import { User } from '@waldur/workspace/types';

class CustomersServiceClass {
  getUsers(customerUuid) {
    return get<User[]>(`/customers/${customerUuid}/users/`).then(
      (response) => response.data,
    );
  }

  get(customerUuid) {
    return getCustomer(customerUuid);
  }

  isOwnerOrStaff() {
    const customer = getCustomerSelector(store.getState());
    return UsersService.getCurrentUser().then((user) => {
      return checkCustomerUser(customer, user);
    });
  }

  refreshCurrentCustomer(customerUuid) {
    return this.get(customerUuid).then((customer) => {
      store.dispatch(setCurrentCustomer(customer));
      return customer;
    });
  }
}
export const CustomersService = new CustomersServiceClass();
