import { get, getById } from '@waldur/core/api';
import store from '@waldur/store/store';
import { UsersService } from '@waldur/user/UsersService';
import { setCurrentCustomer } from '@waldur/workspace/actions';
import { getCustomer } from '@waldur/workspace/selectors';
import { Customer, User } from '@waldur/workspace/types';

class CustomersServiceClass {
  getUsers(customerUuid) {
    return get<User[]>(`/customers/${customerUuid}/users/`).then(
      (response) => response.data,
    );
  }

  get(customerUuid) {
    return getById<Customer>('/customers/', customerUuid);
  }

  isOwnerOrStaff() {
    const customer = getCustomer(store.getState());
    return UsersService.getCurrentUser().then((user) => {
      return this.checkCustomerUser(customer, user);
    });
  }

  checkCustomerUser(customer, user) {
    if (user && user.is_staff) {
      return true;
    }
    return customer && this.isOwner(customer, user);
  }

  isOwner(customer, user) {
    for (let i = 0; i < customer.owners.length; i++) {
      if (user && user.uuid === customer.owners[i].uuid) {
        return true;
      }
    }
    return false;
  }

  refreshCurrentCustomer(customerUuid) {
    return this.get(customerUuid).then((customer) => {
      store.dispatch(setCurrentCustomer(customer));
      return customer;
    });
  }
}
export const CustomersService = new CustomersServiceClass();
