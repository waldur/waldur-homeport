import { translate } from '@waldur/i18n';

import template from './invitation-dialog.html';

const invitationDialog = {
  template,
  bindings: {
    dismiss: '&',
    close: '&',
    resolve: '<',
  },
  controllerAs: 'DialogCtrl',
  controller: class InvitationDialogController {
    // @ngInject
    constructor(InvitationDialogService, ncUtilsFlash, ENV) {
      this.service = InvitationDialogService;
      this.ncUtilsFlash = ncUtilsFlash;
      this.ENV = ENV;
    }

    $onInit() {
      this.customer = this.resolve.context.customer;
      this.roles = this.service.getRoles(this.resolve.context);
      this.role = this.roles[0];
      this.civilNumberLabel =
        this.ENV.invitationCivilNumberLabel || translate('Civil number');
      this.taxNumberLabel =
        this.ENV.invitationTaxNumberLabel || translate('Tax number');
      this.showTaxNumber = this.ENV.invitationShowTaxNumber;
      this.civilNumberRequired = this.ENV.invitationCivilNumberRequired;
      this.taxNumberRequired = this.ENV.invitationTaxNumberRequired;
      this.requireUserDetails = this.ENV.invitationRequireUserDetails;

      this.civilCodeHelpText = this.ENV.invitationCivilCodeHelpText;
    }

    submitForm() {
      if (this.DialogForm.$invalid) {
        return;
      }

      this.submitting = true;
      return this.service
        .createInvite(
          this.customer,
          this.project,
          this.email,
          this.civil_number,
          this.tax_number,
          this.userDetails,
          this.role,
        )
        .then(() => this.close())
        .catch(errors => (this.errors = errors))
        .finally(() => (this.submitting = false));
    }

    get roleDisabled() {
      return this.requireUserDetails && !this.fetchedUserDetails;
    }

    fetchUserDetails() {
      this.fetchingUserDetails = true;
      this.service
        .fetchUserDetails(this.civil_number, this.tax_number)
        .then(response => {
          this.ncUtilsFlash.success(
            translate('User details have been fetched successfully.'),
          );
          this.fetchedUserDetails = true;
          this.userDetails = response.data;
        })
        .catch(() => {
          this.ncUtilsFlash.error(translate('Unable to fetch user details.'));
          this.fetchedUserDetails = false;
        })
        .finally(() => {
          this.fetchingUserDetails = false;
        });
    }
  },
};

export default invitationDialog;
