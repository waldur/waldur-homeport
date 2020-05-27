import actionsModule from './actions/module';
import invitationConfirmDialog from './invitation-confirm-dialog';
import { InvitationService } from './InvitationService';
import invitationRoutes from './routes';
import { invitationUtilsService, attachInvitationUtils } from './utils';

export default module => {
  actionsModule(module);
  module.constant('invitationService', InvitationService);
  module.component('invitationConfirmDialog', invitationConfirmDialog);
  module.service('invitationUtilsService', invitationUtilsService);
  module.run(attachInvitationUtils);
  module.config(invitationRoutes);
};
