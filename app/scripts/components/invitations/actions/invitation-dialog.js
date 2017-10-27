import template from './invitation-dialog.html';

const invitationDialog = {
  template,
  bindings: {
    dismiss: '&',
    close: '&',
    resolve: '<'
  },
  controllerAs: 'DialogCtrl',
  controller: class InvitationDialogController {
    // @ngInject
    constructor(InvitationDialogService) {
      this.service = InvitationDialogService;
    }

    $onInit() {
      this.customer = this.resolve.context.customer;
      this.roles = this.service.getRoles(this.resolve.context);
      this.role = this.roles[0];
    }

    submitForm() {
      if (this.DialogForm.$invalid) {
        return;
      }

      this.submitting = true;
      return this.service.createInvite(
        this.customer,
        this.project,
        this.email,
        this.civil_number,
        this.role
      )
      .then(() => this.close())
      .catch(errors => this.errors = errors)
      .finally(() => this.submitting = false);
    }
  }
};

export default invitationDialog;
