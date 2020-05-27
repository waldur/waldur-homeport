import { sendForm } from '@waldur/core/api';
import { createServiceProvider } from '@waldur/marketplace/common/api';

import * as constants from './constants';
import wizardStepsConfig from './customer-create-config';

export default class CustomerCreateService {
  // @ngInject
  constructor(customerPermissionsService, usersService, ENV) {
    this.customerPermissionsService = customerPermissionsService;
    this.usersService = usersService;
    this.ENV = ENV;
  }

  getSteps() {
    return wizardStepsConfig(this.ENV).filter(step => !step.hidden);
  }

  createCustomer(model) {
    const customer = {};
    angular.extend(customer, this.composeCustomerModel(model));
    return sendForm('POST', `${this.ENV.apiEndpoint}api/customers/`, {
      ...customer,
    })
      .then(response => response.data)
      .then(customer => {
        if (model.role === constants.ROLES.provider) {
          return createServiceProvider({
            customer: customer.url,
            enable_notifications: false,
          }).then(() => customer);
        }

        return customer;
      });
  }

  createCustomerPermission(customer) {
    return this.usersService.getCurrentUser().then(user => {
      return this.customerPermissionsService.create({
        role: 'owner',
        customer: customer.url,
        user: user.url,
      });
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
      'image',
    ];

    const model = {};
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
