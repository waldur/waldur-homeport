import { triggerTransition } from '@uirouter/redux';
import { useEffect, FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { AuthService } from '@waldur/auth/AuthService';
import { post, getFirst } from '@waldur/core/api';
import { format } from '@waldur/core/ErrorMessageFormatter';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { wait } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { router } from '@waldur/router';
import { showError, showSuccess } from '@waldur/store/notify';
import { setCurrentUser } from '@waldur/workspace/actions';

export const UserEmailChangeCallback: FunctionComponent = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    async function load() {
      try {
        await post('/users/confirm_email/', {
          code: router.globals.params.token,
        });
        dispatch(showSuccess(translate('Email has been updated.')));
      } catch (error) {
        const errorMessage = `${translate('Unable to confirm email.')} ${format(
          error,
        )}`;
        dispatch(showError(errorMessage));
      }

      if (!AuthService.isAuthenticated()) {
        dispatch(triggerTransition('login', {}));
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
        dispatch(setCurrentUser(currentUser));
        await wait(1000);
      }
      dispatch(triggerTransition('profile.manage', {}));
    }
    load();
  }, [dispatch]);

  return (
    <div className="middle-box text-center">
      <LoadingSpinner />
      <h3 className="app-title centered">
        {translate('Verifying email change')}
      </h3>
    </div>
  );
};
