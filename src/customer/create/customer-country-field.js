import template from './customer-country-field.html';

const customerCountryField = {
  template: template,
  bindings: {
    field: '<',
    model: '=',
    form: '=',
  },
  controller: class CustomerCountryFieldController {
    // @ngInject
    constructor(customersService) {
      this.customersService = customersService;
    }

    $onInit() {
      this.loadCountries();
    }

    loadCountries() {
      return this.customersService.loadCountries().then(countryChoices => {
        this.countryChoices = countryChoices;
      });
    }
  },
};

export default customerCountryField;
