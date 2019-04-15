import { translate } from '@waldur/i18n';

import template from './invitation-approve.html';

export default {
  controller: InvitationApproveController,
  template,
};

// @ngInject
function InvitationApproveController($state, $stateParams, invitationService, ncUtilsFlash) {
  invitationService.approve($stateParams.token).then(function() {
    ncUtilsFlash.info(translate('Invitation has been approved.'));
    $state.go('login');
  }, function() {
    ncUtilsFlash.error(translate('Unable to approve invitation.'));
  });
}
