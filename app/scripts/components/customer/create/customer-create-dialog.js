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
    constructor(CustomerCreateService, ncUtilsFlash, $state, $filter, usersService) {
      this.CustomerCreateService = CustomerCreateService;
      this.ncUtilsFlash = ncUtilsFlash;
      this.$state = $state;
      this.$filter = $filter;
      this.usersService = usersService;
    }

    $onInit() {
      this.model = {
        role: this.resolve.role,
      };
      this.steps = this.CustomerCreateService.getSteps();
    }

    submit() {
      return this.CustomerCreateService.createCustomer(this.model).then(customer => {
        const message = gettext('Organization has been created.');
        this.ncUtilsFlash.success(this.$filter('translate')(message));
        this.usersService.resetCurrentUser();
        this.usersService.getCurrentUser();
        this.$state.go('organization.dashboard', {uuid: customer.uuid});
      }).catch(response => {
        if (response.status === 400) {
          this.model.errors = response.data;
        } else {
          this.ncUtilsFlash.errorFromResponse(response, gettext('Could not create organization'));
        }
      });
    }
  }
};

export default customerCreateDialog;
