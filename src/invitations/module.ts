import invitationConfirmDialog from './invitation-confirm-dialog';
import invitationRoutes from './routes';
import { InvitationUtilsService, attachInvitationUtils } from './utils';

export default module => {
  module.component('invitationConfirmDialog', invitationConfirmDialog);
  module.service('invitationUtilsService', InvitationUtilsService);
  module.run(attachInvitationUtils);
  module.config(invitationRoutes);
};
