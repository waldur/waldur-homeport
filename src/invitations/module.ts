import { InvitationUtilsService, attachInvitationUtils } from './utils';

export default (module) => {
  module.service('invitationUtilsService', InvitationUtilsService);
  module.run(attachInvitationUtils);
};
