import invitationConfirmDialog from './invitation-confirm-dialog';
import { InvitationUtilsService, attachInvitationUtils } from './utils';

export default (module) => {
  module.component('invitationConfirmDialog', invitationConfirmDialog);
  module.service('invitationUtilsService', InvitationUtilsService);
  module.run(attachInvitationUtils);
};
