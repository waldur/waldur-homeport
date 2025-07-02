import { DateTime } from 'luxon';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usersRefreshToken } from 'waldur-js-client';

import { localLogout, setAuthHeader } from '@waldur/auth/AuthService';
import { formatJsx, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { useModal } from '@waldur/modal/hooks';
import { getCurrentUser } from '@waldur/user/UsersService';
import { setCurrentUser } from '@waldur/workspace/actions';
import { useUser } from '@waldur/workspace/hooks';
import { getImpersonatorUser } from '@waldur/workspace/selectors';

const getSecondsUntilExpiration = (expiresAt: DateTime) => {
  if (!expiresAt) {
    return null;
  }
  const now = DateTime.now();
  return Math.floor(expiresAt.diff(now, 'seconds').seconds);
};

const Countdown = ({ expiresAt }) => {
  const [seconds, setSeconds] = useState(getSecondsUntilExpiration(expiresAt));
  const { closeDialog } = useModal();

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(getSecondsUntilExpiration(expiresAt));
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  useEffect(() => {
    if (seconds <= 0) {
      localLogout();
      closeDialog('HIDE_CONFIRM');
    }
  }, [seconds]);

  return (
    <span className="text-warning">
      {translate('{number} seconds', { number: seconds })}
    </span>
  );
};

export const AuthTokenExpirationManager = () => {
  const dispatch = useDispatch();
  const { closeDialog } = useModal();

  const user = useUser();
  const impersonatorUser = useSelector(getImpersonatorUser);
  const expiresAt = useMemo(
    () =>
      user?.token_expires_at ? DateTime.fromISO(user.token_expires_at) : null,
    [user?.token_expires_at],
  );
  const showExpirationWarning = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate(
          'Your session will expire in: <Countdown></Countown>.',
          {
            Countdown: () => <Countdown expiresAt={expiresAt} />,
          },
          formatJsx,
        ),
        translate(
          `You've been on this page for a while without saving, which will cause your session to expire. When that happens, you won't be able to save this page and you could lose any saved work. Click "Continue working" below to renew the session`,
        ),
        {
          positiveButton: translate('Continue working'),
          negativeButton: translate('Sign out'),
        },
      );
      const newToken = await usersRefreshToken({ path: { uuid: user.uuid } });
      setAuthHeader(newToken.data.token);
      const newUser = await getCurrentUser();
      dispatch(setCurrentUser(newUser));
    } catch {
      localLogout();
      closeDialog('HIDE_CONFIRM');
      return;
    }
  };
  useEffect(() => {
    if (impersonatorUser) {
      return;
    }
    if (!expiresAt) {
      return;
    }
    const seconds = getSecondsUntilExpiration(expiresAt);
    if (seconds > 60) {
      const timeout = setTimeout(
        () => {
          showExpirationWarning();
        },
        (seconds - 60) * 1000,
      );
      return () => clearTimeout(timeout);
    } else {
      showExpirationWarning();
    }
  }, [expiresAt, impersonatorUser]);

  return null;
};
