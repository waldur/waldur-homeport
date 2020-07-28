import Axios from 'axios';

import { get, getById } from '@waldur/core/api';
import { $q, ENV } from '@waldur/core/services';
import store from '@waldur/store/store';
import { UsersService } from '@waldur/user/UsersService';
import { setCurrentCustomer } from '@waldur/workspace/actions';
import { getCustomer } from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

class CustomersServiceClass {
  public filterByCustomer = false;
  public countryChoices = [];

  getUsers(customerUuid) {
    return $q.when(
      get(`/customers/${customerUuid}/users/`).then(
        (response) => response.data,
      ),
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

  loadCountries() {
    if (this.countryChoices.length !== 0) {
      return $q.when(this.countryChoices);
    } else {
      return Axios.request({
        method: 'OPTIONS',
        url: ENV.apiEndpoint + 'api/customers/',
      }).then((response) => {
        this.countryChoices = response.data.actions.POST.country.choices;
        return this.countryChoices;
      });
    }
  }

  countCustomers() {
    return Axios.head(ENV.apiEndpoint + 'api/customers/').then((response) => {
      return parseInt(response.headers['x-result-count']);
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
