import invitationDialog from './invitation-dialog';
import InvitationDialogService from './invitation-dialog-service';
import InvitationPolicyService from './invitation-policy-service';
import InvitationCreateAction from './create';
import InvitationSendAction from './send';
import InvitationCancelAction from './cancel';

export default module => {
  module.component('invitationDialog', invitationDialog);
  module.service('InvitationPolicyService', InvitationPolicyService);
  module.service('InvitationDialogService', InvitationDialogService);
  module.service('InvitationCreateAction', InvitationCreateAction);
  module.service('InvitationSendAction', InvitationSendAction);
  module.service('InvitationCancelAction', InvitationCancelAction);
};
