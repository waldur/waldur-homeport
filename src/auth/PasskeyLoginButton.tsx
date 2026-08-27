import { FingerprintIcon } from '@phosphor-icons/react';
import { FunctionComponent, useEffect, useState } from 'react';

import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';
import {
  completeSignin,
  describePasskeyError,
  isPasskeySupported,
  prepareSignin,
  PreparedCeremony,
} from '@/user/passkeys/api';

import { redirectOnSuccess } from './authNavigation';
import * as AuthService from './AuthService';
import { LoginButton } from './LoginButton';

export const PasskeyLoginButton: FunctionComponent = () => {
  const { showErrorResponse, showError } = useNotify();
  const [busy, setBusy] = useState(false);
  const [prepared, setPrepared] = useState<PreparedCeremony | null>(null);
  const supported = isPasskeySupported();

  // The challenge is fetched up front so the click can call WebAuthn with
  // nothing awaited in between — awaiting a request first consumes the user
  // activation and the browser refuses the call. See ./../user/passkeys/api.ts.
  useEffect(() => {
    if (!supported) return;
    let cancelled = false;
    prepareSignin()
      .then((value) => {
        if (!cancelled) setPrepared(value);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [supported]);

  // Hidden rather than disabled: on a browser without WebAuthn there is
  // nothing the user can do to make it work, and a permanently dead button is
  // worse than no button.
  if (!supported) {
    return null;
  }

  const signin = async () => {
    if (busy || !prepared) return;
    setBusy(true);
    try {
      const token = await completeSignin(prepared);
      await AuthService.loginUser(token, 'passkey');
      await redirectOnSuccess();
    } catch (error: any) {
      const described = describePasskeyError(error);
      if (error?.name === 'NotAllowedError') {
        // By far the most common cause here is not a fault: this device has
        // no passkey for this site yet, so the browser offers only a phone or
        // a security key and the user backs out. Say that, rather than the
        // generic "dismissed or refused".
        showError(
          translate(
            'No passkey was used. If you have not set one up on this device yet, sign in with your password first and add a passkey from your profile.',
          ),
        );
      } else if (described) {
        showError(described);
      } else if (error?.name !== 'AbortError') {
        showErrorResponse(
          error,
          translate('Unable to sign in with a passkey.'),
        );
      }
      // The challenge is spent either way; fetch a fresh one so a second
      // attempt is not silently doomed.
      setPrepared(null);
      prepareSignin()
        .then(setPrepared)
        .catch(() => undefined);
    } finally {
      setBusy(false);
    }
  };

  return (
    <LoginButton
      label={translate('a passkey')}
      icon={<FingerprintIcon weight="bold" />}
      onClick={signin}
    />
  );
};
