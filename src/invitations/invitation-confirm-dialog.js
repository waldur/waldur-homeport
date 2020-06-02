import template from './invitation-confirm-dialog.html';
import { InvitationService } from './InvitationService';

const invitationConfirmDialog = {
  template,
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&',
  },
  controller: class InvitationConfirmController {
    // @ngInject
    constructor(usersService, $timeout, ENV) {
      this.usersService = usersService;
      this.$timeout = $timeout;
      this.invitationCheckInterval = ENV.invitationCheckInterval;
      this.validateInvitationEmail =
        ENV.plugins.WALDUR_CORE.VALIDATE_INVITATION_EMAIL;
    }

    $onInit() {
      const token = this.resolve.token;
      this.invitationCheck(token);
    }

    invitationCheck(token) {
      InvitationService.check(token)
        .then(response => {
          this.usersService.getCurrentUser().then(user => {
            const invitation = response.data;
            if (!user.email || user.email === invitation.email) {
              this.closeDecliningNewEmail();
            }

            if (
              this.validateInvitationEmail &&
              user.email &&
              user.email !== invitation.email
            ) {
              this.dismiss();
            }

            this.invitation = invitation;
            this.user = user;
          });
        })
        .catch(response => {
          if (response.status === -1 || response.status >= 500) {
            this.$timeout(
              this.invitationCheck.bind(this),
              this.invitationCheckInterval,
              true,
              token,
            );
          } else {
            this.dismiss();
          }
        });
    }

    invitationChecked() {
      return this.invitation && this.invitation.email;
    }

    closeAcceptingNewEmail() {
      this.close({ $value: this.resolve.acceptNewEmail });
    }

    closeDecliningNewEmail() {
      this.close({ $value: this.resolve.rejectNewEmail });
    }
  },
};

export default invitationConfirmDialog;
