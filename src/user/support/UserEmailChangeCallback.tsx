import { useRouter } from '@uirouter/react';
import { useEffect, FunctionComponent } from 'react';
import { usersConfirmEmail } from 'waldur-js-client';

import * as AuthService from '@/auth/AuthService';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { wait } from '@/core/utils';
import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';
import { useSetUser } from '@/workspace/hooks';

import { getCurrentUser } from '../UsersService';

export const UserEmailChangeCallback: FunctionComponent = () => {
  const setCurrentUser = useSetUser();

  const { showErrorResponse, showSuccess } = useNotify();

  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        await usersConfirmEmail({
          body: {
            code: router.globals.params.token,
          },
        });
        showSuccess(translate('Email has been updated.'));
      } catch (error) {
        showErrorResponse(error, translate('Unable to confirm email.'));
      }

      if (!AuthService.isAuthenticated()) {
        router.stateService.go('login');
        return;
      }

      let currentUser;
      try {
        currentUser = await getCurrentUser();
      } catch (error) {
        showErrorResponse(error, translate('Unable to fetch current user.'));
      }

      if (currentUser) {
        setCurrentUser(currentUser);
        await wait(1000);
      }
      router.stateService.go('profile-manage');
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
