import { translate } from '@waldur/i18n';

import template from './invitation-reject.html';

export default {
  controller: InvitationRejectController,
  template,
};

// @ngInject
function InvitationRejectController($state, $stateParams, invitationService, ncUtilsFlash) {
  invitationService.reject($stateParams.token).then(function() {
    ncUtilsFlash.info(translate('Invitation has been rejectd.'));
    $state.go('login');
  }, function() {
    ncUtilsFlash.error(translate('Unable to reject invitation.'));
  });
}
