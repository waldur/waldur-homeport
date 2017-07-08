import wizardStepsConfig from './customer-create-config';

export default class CustomerCreateService {
  // @ngInject
  constructor($q, features, customersService, customerUtils, expertsService) {
    this.$q = $q;
    this.features = features;
    this.customersService = customersService;
    this.customerUtils = customerUtils;
    this.expertsService = expertsService;
  }

  getSteps() {
    let steps = angular.copy(wizardStepsConfig);
    return steps.filter(step => !step.feature || this.features.isVisible(step.feature));
  }

  createCustomer(model) {
    let customer = this.customersService.$create();
    angular.extend(customer, this.composeCustomerModel(model));
    return customer.$save().then(customer => {
      let promises = [
        this.customerUtils.saveLimit(customer, model.threshold.priceEstimate.limit),
        this.customerUtils.saveThreshold(customer, model.threshold.priceEstimate.threshold),
      ];

      if (model.agree_with_policy) {
        promises.push(this.expertsService.register(customer));
      }

      return this.$q.all(promises).then(() => customer);
    });
  }

  composeCustomerModel(formModel) {
    const fields = [
      'name',
      'email',
      'phone_number',
      'registration_code',
      'country',
      'contact_details',
      'vat_code',
    ];

    let model = {};
    this.copyFields(formModel, model, fields);
    if (formModel.vat_code) {
      model.is_company = true;
    }
    if (formModel.country) {
      model.country = formModel.country.value;
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
