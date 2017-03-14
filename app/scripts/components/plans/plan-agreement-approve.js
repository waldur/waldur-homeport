import template from './plan-agreement-approve.html';

const planAgreementApprove = {
  template,
  controller: AgreementApproveController,
};

export default planAgreementApprove;

// @ngInject
function AgreementApproveController(
  ncUtils, ncUtilsFlash, agreementsService, $state, currentStateService) {
  var qs = ncUtils.parseQueryString(ncUtils.getQueryString());
  if (!qs.token) {
    ncUtilsFlash.error(gettext('Invalid URL. Unable to parse billing plan agreement details.'));
    return;
  }
  agreementsService.approve({token: qs.token}).then(function() {
    ncUtilsFlash.success(gettext('Billing plan agreement has been processed successfully.'));
    currentStateService.reloadCurrentCustomer();
    $state.go('profile.details');
  }, function(error) {
    if (error.data) {
      ncUtilsFlash.error(error.data.detail);
    } else {
      ncUtilsFlash.error(gettext('Unable to approve billing plan'));
    }
  });
}
