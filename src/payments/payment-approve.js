import template from './payment-approve.html';

// @ngInject
function PaymentApproveController(
  ncUtils,
  ncUtilsFlash,
  paymentsService,
  $state,
) {
  const qs = ncUtils.parseQueryString(ncUtils.getQueryString());
  if (!qs.paymentId || !qs.PayerID || !qs.token) {
    ncUtilsFlash.error(
      gettext('Invalid URL. Unable to parse payment details.'),
    );
    return;
  }
  paymentsService
    .approve({
      payment_id: qs.paymentId,
      payer_id: qs.PayerID,
      token: qs.token,
    })
    .then(() => {
      ncUtilsFlash.success(gettext('Payment has been processed successfully.'));
      $state.go('profile.details');
    });
}

const paymentApprove = {
  template,
  controller: PaymentApproveController,
};

export default paymentApprove;
