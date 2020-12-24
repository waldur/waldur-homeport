import { useRouter } from '@uirouter/react';
import Qs from 'qs';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { useEffectOnce } from 'react-use';

import { post } from '@waldur/core/api';
import { getQueryString } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { showError, showSuccess } from '@waldur/store/notify';

const approvePayment = (payload) => post('/paypal-payments/approve/', payload);

export const PaymentApprove: FunctionComponent = () => {
  useTitle(translate('Approve payment'));
  const dispatch = useDispatch();
  const router = useRouter();
  useEffectOnce(() => {
    (async () => {
      const qs = Qs.parse(getQueryString());
      if (!qs.paymentId || !qs.PayerID || !qs.token) {
        dispatch(
          showError(translate('Invalid URL. Unable to parse payment details.')),
        );
        return;
      }
      try {
        await approvePayment({
          payment_id: qs.paymentId,
          payer_id: qs.PayerID,
          token: qs.token,
        });
        dispatch(
          showSuccess(translate('Payment has been processed successfully.')),
        );
        router.stateService.go('profile.details');
      } catch (error) {
        dispatch(showError(translate('Unable to process payment.')));
      }
    })();
  });
  return (
    <div className="invitation-vertical-center">
      <div className="container">
        {translate('Payment is being processed, please wait.')}
      </div>
    </div>
  );
};
