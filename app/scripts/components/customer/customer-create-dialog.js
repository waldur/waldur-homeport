import template from './customer-create-dialog.html';

const customerCreateDialog = {
  template,
  bindings: {
    dismiss: '&',
    close: '&',
    resolve: '<',
  },
  controller: class CustomerCreateDialogController {
    // @ngInject
    constructor(CustomerCreateService, ncUtilsFlash, $state, $filter) {
      this.CustomerCreateService = CustomerCreateService;
      this.ncUtilsFlash = ncUtilsFlash;
      this.$state = $state;
      this.$filter = $filter;
    }

    $onInit() {
      this.model = {};
      this.steps = this.CustomerCreateService.getSteps();
    }

    submit() {
      return this.CustomerCreateService.createCustomer(this.model).then(customer => {
        const message = gettext('Organization has been created.');
        this.ncUtilsFlash.success(this.$filter('translate')(message));
        this.$state.go('organization.details', {uuid: customer.uuid});
      }).catch(response => {
        this.model.errors = response.data;
      });
    }
  }
};

export default customerCreateDialog;
