import * as React from 'react';
import { useDispatch } from 'react-redux';

import { post, getFirst } from '@waldur/core/api';
import { format } from '@waldur/core/ErrorMessageFormatter';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { $state, ngInjector } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { showError, showSuccess, stateGo } from '@waldur/store/coreSaga';

function delay(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export const UserEmailChangeCallback = () => {
  const dispatch = useDispatch();

  React.useEffect(() => {
    async function load() {
      try {
        await post('/users/confirm_email/', { code: $state.params.token });
        dispatch(showSuccess(translate('Email has been updated.')));
      } catch (error) {
        const errorMessage = `${translate('Unable to confirm email.')} ${format(
          error,
        )}`;
        dispatch(showError(errorMessage));
      }

      if (!ngInjector.get('$auth').isAuthenticated()) {
        dispatch(stateGo('login'));
        return;
      }

      let currentUser;
      try {
        currentUser = await getFirst('/users/', { current: true });
      } catch (error) {
        const errorMessage = `${translate(
          'Unable to fetch current user.',
        )} ${format(error)}`;
        dispatch(showError(errorMessage));
      }

      if (currentUser) {
        ngInjector.get('usersService').setCurrentUser(currentUser);
        await delay(1000);
      }
      dispatch(stateGo('profile.manage'));
    }
    load();
  }, []);

  return (
    <div className="middle-box text-center">
      <LoadingSpinner />
      <h3 className="app-title centered">
        {translate('Verifying email change')}
      </h3>
    </div>
  );
};
