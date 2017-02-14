import template from './payment-approve.html';

const paymentCancel = {
  template,
  controller: function PaymentCancelController(ncUtils, ncUtilsFlash, paymentsService, $state) {
    // @ngInject
    let qs = ncUtils.parseQueryString(ncUtils.getQueryString());
    if (!qs.token) {
      ncUtilsFlash.error('Invalid URL. Unable to parse payment details.');
      return;
    }
    paymentsService.cancel({token: qs.token}).then(() => {
      ncUtilsFlash.success('Payment has been processed successfully.');
      $state.go('profile.details');
    });
  }
};

export default paymentCancel;
