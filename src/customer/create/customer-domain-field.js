import template from './customer-domain-field.html';

const customerDomainField = {
  template: template,
  bindings: {
    field: '<',
    model: '=',
    form: '=',
  },
  controller: class CustomerDomainFieldController {
    // @ngInject
    constructor(usersService) {
      this.usersService = usersService;
    }

    $onInit() {
      this.usersService.getCurrentUser().then(user => {
        this.user = user;
      });
    }
  },
};

export default customerDomainField;
