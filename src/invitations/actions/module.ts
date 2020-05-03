import invitationDialog from './invitation-dialog';
import InvitationDialogService from './invitation-dialog-service';
import InvitationPolicyService from './invitation-policy-service';

export default module => {
  module.component('invitationDialog', invitationDialog);
  module.service('InvitationPolicyService', InvitationPolicyService);
  module.service('InvitationDialogService', InvitationDialogService);
};
