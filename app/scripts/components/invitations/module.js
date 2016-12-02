import invitationService from './invitation-service';
import invitationAccept from './invitation-accept';
import invitationDialog from './invitation-dialog';
import invitationsList from './invitations-list';
import { invitationUtilsService, attachInvitationUtils } from './utils';
import invitationRoutes from './routes';

export default module => {
  module.service('invitationService', invitationService);
  module.directive('invitationAccept', invitationAccept);
  module.directive('invitationDialog', invitationDialog);
  module.directive('invitationsList', invitationsList);
  module.service('invitationUtilsService', invitationUtilsService);
  module.run(attachInvitationUtils);
  module.config(invitationRoutes);
}
