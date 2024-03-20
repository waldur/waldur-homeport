import { getCustomer } from '@waldur/project/api';
import store from '@waldur/store/store';
import { setCurrentCustomer } from '@waldur/workspace/actions';

export const refreshCurrentCustomer = (customerUuid) =>
  getCustomer(customerUuid).then((customer) => {
    store.dispatch(setCurrentCustomer(customer));
    return customer;
  });
