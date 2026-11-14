import { FunctionComponent, useEffect, useState } from 'react';
import { Form } from 'react-final-form';

import { AlertItem, BaseButton } from 'waldur-ui';

import { format } from '@/core/ErrorMessageFormatter';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { required } from '@/core/validators';
import { StringGroup } from '@/form';
import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/notify';

import {
  completeRegistration,
  describePasskeyError,
  isPasskeySupported,
  isPlatformAuthenticatorAvailable,
  prepareRegistration,
  PreparedCeremony,
} from './api';

interface PasskeyRegisterDialogProps {
  resolve: {
    refetch?: () => void;
  };
}

export const PasskeyRegisterDialog: FunctionComponent<
  PasskeyRegisterDialogProps
> = ({ resolve }) => {
  const { closeDialog } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prepared, setPrepared] = useState<PreparedCeremony | null>(null);
  const [preparing, setPreparing] = useState(true);
  const [hasPlatform, setHasPlatform] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    isPlatformAuthenticatorAvailable().then((value) => {
      if (!cancelled) setHasPlatform(value);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch the challenge as the dialog opens, so the submit click can call
  // WebAuthn with nothing awaited in between. See the note in ./api.ts:
  // awaiting a request first consumes the user activation and the browser
  // refuses the call.
  useEffect(() => {
    let cancelled = false;
    prepareRegistration()
      .then((value) => {
        if (!cancelled) setPrepared(value);
      })
      .catch((e) => {
        if (!cancelled) {
          showErrorResponse(
            e,
            translate('Unable to start passkey enrollment.'),
          );
          closeDialog();
        }
      })
      .finally(() => {
        if (!cancelled) setPreparing(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Starting a registration is a change that asks the user to confirm it is
  // them, so a fresh challenge is fetched only when they ask for one: doing it
  // by itself after a dismissed prompt would open "Confirm it's you" unasked.
  const prepareAgain = async () => {
    setPreparing(true);
    setError(null);
    try {
      setPrepared(await prepareRegistration());
    } catch (e) {
      setError(format(e));
    } finally {
      setPreparing(false);
    }
  };

  const submit = async (values: { name: string }) => {
    if (!prepared) return;
    setBusy(true);
    setError(null);
    try {
      await completeRegistration(prepared, values.name);
      showSuccess(translate('Passkey has been registered.'));
      resolve.refetch?.();
      closeDialog();
    } catch (e: any) {
      const described = describePasskeyError(e);
      if (described === null && e?.name === 'AbortError') {
        closeDialog();
        return;
      }
      // A refused ceremony burns its challenge, so the user needs a fresh one
      // rather than a second try at the same prompt: "Try again" gets it.
      setError(described ?? null);
      if (!described) {
        showErrorResponse(e, translate('Unable to register passkey.'));
      }
      setPrepared(null);
    } finally {
      setBusy(false);
    }
  };

  if (!isPasskeySupported()) {
    return (
      <ModalDialog title={translate('Add passkey')} footer={null}>
        <p>
          {translate(
            'This browser does not support passkeys. Try a recent version of Chrome, Safari, Edge or Firefox.',
          )}
        </p>
      </ModalDialog>
    );
  }

  return (
    <Form
      onSubmit={submit}
      render={({ handleSubmit, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Add passkey')}
            footer={
              prepared || preparing ? (
                <SubmitButton
                  submitting={busy}
                  invalid={invalid || !prepared}
                  disabledReason={
                    !prepared
                      ? translate('Preparing the passkey challenge.')
                      : undefined
                  }
                  label={translate('Continue')}
                  data-testid="passkey-register-submit"
                />
              ) : (
                <BaseButton
                  label={translate('Try again')}
                  onClick={prepareAgain}
                  variant="primary"
                  size="lg"
                  type="button"
                  className="min-w-dialog-action"
                  data-testid="passkey-register-retry"
                />
              )
            }
          >
            <p className="text-quaternary">
              {translate(
                'Give this passkey a name you will recognize later, then follow your device prompt. Nothing secret leaves your device.',
              )}
            </p>
            <StringGroup
              name="name"
              label={translate('Name')}
              placeholder={translate('e.g. MacBook Touch ID')}
              validate={required}
              required
              autoFocus
            />
            {hasPlatform === false && (
              <AlertItem
                variant="info"
                title={translate('No built-in authenticator on this device')}
                body={translate(
                  'Your browser reports no built-in authenticator (Touch ID, Windows Hello). You can still enroll using a phone or a security key from the next prompt.',
                )}
                className="mt-2.5"
              />
            )}
            {preparing && <LoadingSpinner />}
            {error && (
              <AlertItem
                variant="error"
                title={translate('Passkey enrollment failed')}
                body={error}
                className="mt-2.5"
              />
            )}
          </ModalDialog>
        </form>
      )}
    />
  );
};
