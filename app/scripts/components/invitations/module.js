import invitationService from './invitation-service';
import invitationConfirmDialog from './invitation-confirm-dialog';
import invitationCheckDialog from './invitation-check-dialog';
import invitationAccept from './invitation-accept';
import invitationsList from './invitations-list';
import { invitationUtilsService, attachInvitationUtils } from './utils';
import invitationRoutes from './routes';
import actionsModule from './actions/module';

export default module => {
  actionsModule(module);
  module.service('invitationService', invitationService);
  module.component('invitationConfirmDialog', invitationConfirmDialog);
  module.component('invitationCheckDialog', invitationCheckDialog);
  module.directive('invitationAccept', invitationAccept);
  module.component('invitationsList', invitationsList);
  module.service('invitationUtilsService', invitationUtilsService);
  module.run(attachInvitationUtils);
  module.config(invitationRoutes);
};
