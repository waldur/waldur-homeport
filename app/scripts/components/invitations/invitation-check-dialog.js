import template from './invitation-check-dialog.html';

const invitationCheckDialog = {
  template,
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&',
  },
  controller: class InvitationCheckController {
    // ngInject
    constructor(invitationService, $timeout, ENV) {
      this.invitationService = invitationService;
      this.$timeout = $timeout;
      this.invitationCheckInterval = ENV.invitationCheckInterval;
    }

    $onInit() {
      let token = this.resolve.token;
      this.invitationCheck(token);
    }

    invitationCheck(token) {
      this.invitationService.check(token).then(() => {
        this.close();
      }).catch(response => {
        if (response.status === -1 || response.status >= 500) {
          this.$timeout(this.invitationCheck.bind(this), this.invitationCheckInterval, true, token);
        } else {
          this.cancel();
        }
      });
    }

    cancel() {
      this.invitationService.clearInvitationToken();
      this.dismiss();
    }
  }
};

export default invitationCheckDialog;
