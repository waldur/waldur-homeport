import { connectAngularComponent } from '@waldur/store/connect';

import actionsModule from './actions/module';
import invitationAccept from './invitation-accept';
import invitationApprove from './invitation-approve';
import invitationConfirmDialog from './invitation-confirm-dialog';
import invitationReject from './invitation-reject';
import invitationService from './invitation-service';
import { InvitationsList } from './InvitationsList';
import invitationRoutes from './routes';
import { invitationUtilsService, attachInvitationUtils } from './utils';

export default module => {
  actionsModule(module);
  module.service('invitationService', invitationService);
  module.component('invitationConfirmDialog', invitationConfirmDialog);
  module.directive('invitationAccept', invitationAccept);
  module.component('invitationsList', connectAngularComponent(InvitationsList));
  module.component('invitationApprove', invitationApprove);
  module.component('invitationReject', invitationReject);
  module.service('invitationUtilsService', invitationUtilsService);
  module.run(attachInvitationUtils);
  module.config(invitationRoutes);
};
