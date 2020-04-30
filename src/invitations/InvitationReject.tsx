import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import useEffectOnce from 'react-use/lib/useEffectOnce';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { ngInjector } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { showSuccess, showError } from '@waldur/store/coreSaga';

export const InvitationReject = () => {
  const router = useRouter();
  const {
    params: { token },
  } = useCurrentStateAndParams();

  const dispatch = useDispatch();

  useEffectOnce(() => {
    async function processToken() {
      try {
        await ngInjector.get('invitationUtilsService').reject(token);
        dispatch(showSuccess(translate('Invitation has been rejected.')));
        router.stateService.go('login');
      } catch (e) {
        dispatch(showError(translate('Unable to reject invitation.')));
      }
    }
    processToken();
  });

  return (
    <div className="middle-box text-center">
      <LoadingSpinner />
      <h3 className="app-title centered">
        {translate('Invitation rejection')}
      </h3>
    </div>
  );
};
