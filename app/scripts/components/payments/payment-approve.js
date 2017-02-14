import template from './payment-approve.html';

const paymentApprove = {
  template,
  controller: function PaymentApproveController(
    ncUtils, ncUtilsFlash, paymentsService, $state, $rootScope, currentStateService) {
    // @ngInject
    let qs = ncUtils.parseQueryString(ncUtils.getQueryString());
    if (!qs.paymentId || !qs.PayerID || !qs.token) {
      ncUtilsFlash.error('Invalid URL. Unable to parse payment details.');
      return;
    }
    paymentsService.approve({
      payment_id: qs.paymentId,
      payer_id: qs.PayerID,
      token: qs.token
    }).then(() => {
      ncUtilsFlash.success('Payment has been processed successfully.');
      currentStateService.reloadCurrentCustomer(function() {
        $rootScope.$broadcast('customerBalance:refresh');
      });
      $state.go('profile.details');
    });
  }
};

export default paymentApprove;
