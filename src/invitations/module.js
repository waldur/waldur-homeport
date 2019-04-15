import invitationService from './invitation-service';
import invitationConfirmDialog from './invitation-confirm-dialog';
import invitationAccept from './invitation-accept';
import invitationApprove from './invitation-approve';
import invitationReject from './invitation-reject';
import invitationsList from './invitations-list';
import { invitationUtilsService, attachInvitationUtils } from './utils';
import invitationRoutes from './routes';
import actionsModule from './actions/module';

export default module => {
  actionsModule(module);
  module.service('invitationService', invitationService);
  module.component('invitationConfirmDialog', invitationConfirmDialog);
  module.directive('invitationAccept', invitationAccept);
  module.component('invitationsList', invitationsList);
  module.component('invitationApprove', invitationApprove);
  module.component('invitationReject', invitationReject);
  module.service('invitationUtilsService', invitationUtilsService);
  module.run(attachInvitationUtils);
  module.config(invitationRoutes);
};
