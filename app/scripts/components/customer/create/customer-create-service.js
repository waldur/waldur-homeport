import wizardStepsConfig from './customer-create-config';

export default class CustomerCreateService {
  // @ngInject
  constructor(features, customersService, expertsService, ENV) {
    this.features = features;
    this.customersService = customersService;
    this.expertsService = expertsService;
    this.ENV = ENV;
  }

  getSteps() {
    const steps = wizardStepsConfig(this.ENV);
    return steps.filter(step => !step.feature || this.features.isVisible(step.feature));
  }

  createCustomer(model) {
    const customer = this.customersService.$create();
    angular.extend(customer, this.composeCustomerModel(model));
    return customer.$save().then(customer => {
      if (!model.agree_with_policy) {
        return customer;
      }
      return this.expertsService.register(customer).then(() => customer);
    });
  }

  composeCustomerModel(formModel) {
    const fields = [
      'name',
      'native_name',
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
