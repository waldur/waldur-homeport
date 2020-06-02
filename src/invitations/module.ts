import invitationConfirmDialog from './invitation-confirm-dialog';
import invitationRoutes from './routes';
import { invitationUtilsService, attachInvitationUtils } from './utils';

export default module => {
  module.component('invitationConfirmDialog', invitationConfirmDialog);
  module.service('invitationUtilsService', invitationUtilsService);
  module.run(attachInvitationUtils);
  module.config(invitationRoutes);
};
