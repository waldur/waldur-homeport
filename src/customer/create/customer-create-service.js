import wizardStepsConfig from './customer-create-config';
import * as constants from './constants';

import { sendForm } from '@waldur/core/api';

export default class CustomerCreateService {
  // @ngInject
  constructor(customerPermissionsService, usersService, providersService, ENV) {
    this.customerPermissionsService = customerPermissionsService;
    this.usersService = usersService;
    this.providersService = providersService;
    this.ENV = ENV;
  }

  getSteps() {
    return wizardStepsConfig(this.ENV).filter(step => !step.hidden);
  }

  createCustomer(model) {
    const customer = {};
    angular.extend(customer, this.composeCustomerModel(model));
    return sendForm('POST', `${this.ENV.apiEndpoint}api/customers/`, {...customer})
      .then(response => response.data)
      .then(customer => {
        if (model.role === constants.ROLES.provider) {
          return this.providersService.register(customer).then(() => customer);
        }

        return customer;
      });
  }

  createCustomerPermission(customer) {
    return this.usersService.getCurrentUser().then(user => {
      let instance = this.customerPermissionsService.$create();
      instance.role = 'owner';
      instance.customer = customer.url;
      instance.user = user.url;
      return instance.$save();
    });
  }

  composeCustomerModel(formModel) {
    const fields = [
      'name',
      'native_name',
      'domain',
      'email',
      'phone_number',
      'registration_code',
      'country',
      'address',
      'vat_code',
      'type',
      'postal',
      'bank_name',
      'bank_account',
      'image'
    ];

    let model = {};
    this.copyFields(formModel, model, fields);
    if (formModel.vat_code) {
      model.is_company = true;
    }
    if (formModel.country) {
      model.country = formModel.country.value;
    }
    if (formModel.type) {
      model.type = formModel.type.value;
    }
    return model;
  }

  copyFields(src, dest, names) {
    angular.forEach(names, function(name) {
      if (src[name]) {
        dest[name] = src[name];
      }
    });
  }
}
