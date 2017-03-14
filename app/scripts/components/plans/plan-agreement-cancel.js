import template from './plan-agreement-cancel.html';

const planAgreementCancel = {
  template,
  controller: AgreementCancelController,
};

export default planAgreementCancel;

// @ngInject
function AgreementCancelController(
  ncUtils, ncUtilsFlash, agreementsService, $state) {
  var qs = ncUtils.parseQueryString(ncUtils.getQueryString());
  if (!qs.token) {
    ncUtilsFlash.error(gettext('Invalid URL. Unable to parse billing plan agreement details.'));
    return;
  }
  agreementsService.cancel({token: qs.token}).then(function() {
    ncUtilsFlash.success(gettext('Billing plan agreement has been processed successfully.'));
    $state.go('profile.details');
  }, function(error) {
    if (error.data) {
      ncUtilsFlash.error(error.data.detail);
    } else {
      ncUtilsFlash.error(gettext('Unable to cancel billing plan'));
    }
  });
}
