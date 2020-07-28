import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import useEffectOnce from 'react-use/lib/useEffectOnce';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { showSuccess, showError } from '@waldur/store/coreSaga';

import { AuthService } from './AuthService';

export const AuthActivation = () => {
  const {
    params: { user_uuid, token },
  } = useCurrentStateAndParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const activateAccount = React.useCallback(async () => {
    try {
      await AuthService.activate({
        user_uuid,
        token,
      });
      dispatch(showSuccess(translate('Account has been activated.')));
      router.stateService.go('initialdata');
    } catch (e) {
      dispatch(showError(translate('Unable to activate account.')));
    }
  }, [user_uuid, token, router.stateService, dispatch]);

  useEffectOnce(() => {
    activateAccount();
  });

  return (
    <div className="middle-box text-center">
      <LoadingSpinner />
      <h3 className="app-title centered">{translate('Account activation')}</h3>
    </div>
  );
};
