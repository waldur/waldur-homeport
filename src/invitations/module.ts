import actionsModule from './actions/module';
import invitationConfirmDialog from './invitation-confirm-dialog';
import invitationService from './invitation-service';
import invitationRoutes from './routes';
import { invitationUtilsService, attachInvitationUtils } from './utils';

export default module => {
  actionsModule(module);
  module.service('invitationService', invitationService);
  module.component('invitationConfirmDialog', invitationConfirmDialog);
  module.service('invitationUtilsService', invitationUtilsService);
  module.run(attachInvitationUtils);
  module.config(invitationRoutes);
};
