import { get } from '@waldur/core/api';
import { getCustomer } from '@waldur/project/api';
import store from '@waldur/store/store';
import { setCurrentCustomer } from '@waldur/workspace/actions';
import { User } from '@waldur/workspace/types';

class CustomersServiceClass {
  getUsers(customerUuid) {
    return get<User[]>(`/customers/${customerUuid}/users/`).then(
      (response) => response.data,
    );
  }

  refreshCurrentCustomer(customerUuid) {
    return getCustomer(customerUuid).then((customer) => {
      store.dispatch(setCurrentCustomer(customer));
      return customer;
    });
  }
}
export const CustomersService = new CustomersServiceClass();
