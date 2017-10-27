import template from './payment-approve.html';

// @ngInject
function PaymentCancelController(ncUtils, ncUtilsFlash, paymentsService, $state) {
  let qs = ncUtils.parseQueryString(ncUtils.getQueryString());
  if (!qs.token) {
    ncUtilsFlash.error(gettext('Invalid URL. Unable to parse payment details.'));
    return;
  }
  paymentsService.cancel({token: qs.token}).then(() => {
    ncUtilsFlash.success(gettext('Payment has been processed successfully.'));
    $state.go('profile.details');
  });
}

const paymentCancel = {
  template,
  controller: PaymentCancelController
};

export default paymentCancel;
