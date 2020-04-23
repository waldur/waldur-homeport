import { parseQueryString, getQueryString } from '@waldur/core/utils';

import template from './payment-approve.html';

// @ngInject
function PaymentCancelController(ncUtilsFlash, paymentsService, $state) {
  const qs = parseQueryString(getQueryString());
  if (!qs.token) {
    ncUtilsFlash.error(
      gettext('Invalid URL. Unable to parse payment details.'),
    );
    return;
  }
  paymentsService.cancel({ token: qs.token }).then(() => {
    ncUtilsFlash.success(gettext('Payment has been processed successfully.'));
    $state.go('profile.details');
  });
}

const paymentCancel = {
  template,
  controller: PaymentCancelController,
};

export default paymentCancel;
