import { useRouter } from '@uirouter/react';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import useEffectOnce from 'react-use/lib/useEffectOnce';

import { post } from '@waldur/core/api';
import { parseQueryString, getQueryString } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { showError, showSuccess } from '@waldur/store/coreSaga';

const cancelPayment = payload => post('/paypal-payments/cancel/', payload);

export const PaymentCancel = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  useEffectOnce(() => {
    (async () => {
      const qs = parseQueryString(getQueryString());
      if (!qs.token) {
        dispatch(
          showError(translate('Invalid URL. Unable to parse payment details.')),
        );
        return;
      }
      try {
        await cancelPayment({ token: qs.token });
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
