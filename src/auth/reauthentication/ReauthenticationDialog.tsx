import { FingerprintIcon, ShieldCheckIcon } from '@phosphor-icons/react';
import { FC, FormEvent, useCallback, useEffect, useRef, useState } from 'react';

import type { ReauthenticationChallenge } from 'waldur-auth-core';
import {
  AlertItem,
  BaseButton,
  FormField,
  FormLabel,
  FormText,
  SecretInput,
} from 'waldur-ui';

import { format, getErrorBody } from '@/core/ErrorMessageFormatter';
import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import {
  completeReauthentication,
  describePasskeyError,
  isPasskeySupported,
  prepareReauthentication,
  PreparedCeremony,
} from '@/user/passkeys/api';

import { reauthenticateWithPassword } from './api';
import { canConfirmHere } from './methods';

const getDescription = (challenge: ReauthenticationChallenge) => {
  switch (challenge.action) {
    case 'token_lifetime':
      return translate("To change the API token lifetime, confirm it's you.");
    case 'change_email':
      return translate("To change the email address, confirm it's you.");
    case 'register_passkey':
      return translate("To add a passkey, confirm it's you.");
    case 'revoke_passkey':
      return translate("To revoke a passkey, confirm it's you.");
    case 'change_password':
      return translate("To change the password, confirm it's you.");
    case 'create_personal_access_token':
      return translate(
        "To create or rotate a personal access token, confirm it's you.",
      );
    default:
      return (
        challenge.detail ?? translate("To make this change, confirm it's you.")
      );
  }
};

// How long the lockout lasts, in seconds: the body's `retry_after` first,
// which a page on another origin than the API can always read; then the
// Retry-After header, which it reads only if the API exposes it. Failing both,
// the API's own message gives the wait as well.
const getRetryAfterSeconds = (error): number | null => {
  for (const value of [
    getErrorBody(error)?.retry_after,
    error?.response?.headers?.get?.('Retry-After'),
  ]) {
    const seconds = Math.ceil(Number(value));
    if (seconds > 0) {
      return seconds;
    }
  }
  return null;
};

const describeLockout = (error) => {
  const seconds = getRetryAfterSeconds(error);
  if (seconds === null) {
    return (
      getErrorBody(error)?.detail ??
      translate('Too many attempts. Try again later.')
    );
  }
  return seconds <= 60
    ? translate('Too many attempts. Try again in {count} seconds.', {
        count: seconds,
      })
    : translate('Too many attempts. Try again in {count} minutes.', {
        count: Math.ceil(seconds / 60),
      });
};

// A 429 is a lockout after wrong passwords or the grant endpoints' rate
// limit; either way the user can only wait.
const describeError = (error) => {
  if (error?.status === 429) {
    return describeLockout(error);
  }
  const password = getErrorBody(error)?.password;
  if (Array.isArray(password) && password.length) {
    return password.join(' ');
  }
  return format(error);
};

interface ReauthenticationDialogProps {
  challenge: ReauthenticationChallenge;
  onConfirm: (grant: string) => void;
}

/**
 * "Confirm it's you", before a change the API refused without fresh proof:
 * the password, a passkey, or, for an account that has neither, a pointer to
 * support. Closing it (Cancel, Escape, the backdrop) is the shell's onHide,
 * which fails the waiting request.
 */
export const ReauthenticationDialog: FC<ReauthenticationDialogProps> = ({
  challenge,
  onConfirm,
}) => {
  const { action, methods } = challenge;
  const offersPassword = methods.includes('password');
  const offersPasskey = methods.includes('passkey');
  const canUsePasskey = offersPasskey && isPasskeySupported();

  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [prepared, setPrepared] = useState<PreparedCeremony | null>(null);
  const [preparing, setPreparing] = useState(canUsePasskey);
  const [passkeyBusy, setPasskeyBusy] = useState(false);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // The passkey challenge is fetched ahead of the click, so the click calls
  // WebAuthn with nothing awaited in between: awaiting a request first uses
  // up the user activation and the browser refuses (see @/user/passkeys/api).
  // If it cannot be fetched (the rate limit, the network), the error shows and
  // the user can ask for another, or use the password meanwhile.
  const preparePasskey = useCallback(() => {
    setPreparing(true);
    setPrepared(null);
    prepareReauthentication(action)
      .then((value) => {
        if (mounted.current) setPrepared(value);
      })
      .catch((error) => {
        if (mounted.current) setPasskeyError(describeError(error));
      })
      .finally(() => {
        if (mounted.current) setPreparing(false);
      });
  }, [action]);

  useEffect(() => {
    if (canUsePasskey) preparePasskey();
  }, [canUsePasskey, preparePasskey]);

  const preparePasskeyAgain = () => {
    setPasskeyError(null);
    preparePasskey();
  };

  const submitPassword = async (event: FormEvent) => {
    event.preventDefault();
    if (!password || submitting) return;
    setSubmitting(true);
    setPasswordError(null);
    try {
      onConfirm(await reauthenticateWithPassword(action, password));
    } catch (error) {
      setPasswordError(describeError(error));
      setSubmitting(false);
    }
  };

  const confirmWithPasskey = async () => {
    if (!prepared || passkeyBusy) return;
    setPasskeyBusy(true);
    setPasskeyError(null);
    try {
      onConfirm(await completeReauthentication(action, prepared));
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        setPasskeyError(describePasskeyError(error) ?? describeError(error));
      }
      setPasskeyBusy(false);
      // The challenge is spent either way: get a fresh one for another try.
      // Unlike adding a passkey, this asks for nothing that needs a grant.
      preparePasskey();
    }
  };

  const hasMethod = canConfirmHere(challenge);

  return (
    <form onSubmit={submitPassword}>
      <ModalDialog
        title={translate("Confirm it's you")}
        subtitle={hasMethod ? getDescription(challenge) : undefined}
        iconNode={<ShieldCheckIcon weight="bold" />}
        footer={
          hasMethod ? (
            <>
              <CloseDialogButton />
              {offersPassword && (
                <SubmitButton
                  submitting={submitting}
                  invalid={!password}
                  disabledReason={
                    !password ? translate('Enter your password.') : undefined
                  }
                  label={translate('Confirm')}
                  data-testid="reauthentication-submit"
                />
              )}
            </>
          ) : (
            <CloseDialogButton label={translate('Close')} />
          )
        }
      >
        {!hasMethod && (
          <AlertItem
            variant="warning"
            title={translate('Your account cannot confirm it is you')}
            body={translate(
              'This change needs you to confirm your identity, and your account has no way to do that here. Please contact support.',
            )}
          />
        )}
        {offersPassword && (
          <FormField>
            <FormLabel>{translate('Password')}</FormLabel>
            <SecretInput
              name="password"
              autoComplete="current-password"
              autoFocus
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              invalid={Boolean(passwordError)}
              data-testid="reauthentication-password"
            />
            {passwordError && (
              <FormText variant="danger" role="alert">
                {passwordError}
              </FormText>
            )}
          </FormField>
        )}
        {offersPassword && offersPasskey && (
          <div className="my-4 flex items-center gap-3 text-quaternary">
            <span className="flex-1 border-t border-secondary" />
            {translate('or')}
            <span className="flex-1 border-t border-secondary" />
          </div>
        )}
        {offersPasskey &&
          (canUsePasskey ? (
            prepared || preparing ? (
              <BaseButton
                label={translate('Use passkey')}
                iconNode={<FingerprintIcon weight="bold" />}
                onClick={confirmWithPasskey}
                pending={passkeyBusy}
                disabled={!prepared}
                disabledReason={
                  !prepared
                    ? translate('Preparing the passkey challenge.')
                    : undefined
                }
                variant={offersPassword ? 'tertiary' : 'primary'}
                size="lg"
                type="button"
                className="w-full"
                data-testid="reauthentication-passkey"
              />
            ) : (
              <BaseButton
                label={translate('Try the passkey again')}
                iconNode={<FingerprintIcon weight="bold" />}
                onClick={preparePasskeyAgain}
                variant={offersPassword ? 'tertiary' : 'primary'}
                size="lg"
                type="button"
                className="w-full"
                data-testid="reauthentication-passkey-retry"
              />
            )
          ) : (
            <FormText variant="muted" as="p">
              {translate(
                'This browser does not support passkeys. Try a recent version of Chrome, Safari, Edge or Firefox.',
              )}
            </FormText>
          ))}
        {passkeyError && (
          <AlertItem
            variant="error"
            title={translate('Passkey verification failed')}
            body={passkeyError}
            className="mt-2.5"
          />
        )}
      </ModalDialog>
    </form>
  );
};
