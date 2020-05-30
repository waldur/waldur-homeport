import Axios from 'axios';

import { get, getById } from '@waldur/core/api';
import { $q, ngInjector, ENV } from '@waldur/core/services';
import { UsersService } from '@waldur/user/UsersService';

class CustomersServiceClass {
  public filterByCustomer = false;
  public countryChoices = [];

  getUsers(customerUuid) {
    return $q.when(
      get(`/customers/${customerUuid}/users/`).then(response => response.data),
    );
  }

  get(customerUuid) {
    return $q.when(getById('/customers/', customerUuid));
  }

  isOwnerOrStaff() {
    return $q
      .all([
        ngInjector.get('currentStateService').getCustomer(),
        UsersService.getCurrentUser(),
      ])
      .then(result => {
        // eslint-disable-next-line prefer-spread
        return this.checkCustomerUser.apply(this, result);
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
      }).then(response => {
        this.countryChoices = response.data.actions.POST.country.choices;
        return this.countryChoices;
      });
    }
  }

  countCustomers() {
    return Axios.head(ENV.apiEndpoint + 'api/customers/').then(response => {
      return parseInt(response.headers['x-result-count']);
    });
  }

  refreshCurrentCustomer(customerUuid) {
    return this.get(customerUuid).then(customer => {
      ngInjector.get('currentStateService').setCustomer(customer);
      return customer;
    });
  }
}
export const CustomersService = new CustomersServiceClass();
