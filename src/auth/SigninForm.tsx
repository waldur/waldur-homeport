import { FingerprintIcon } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { Field, Form } from 'react-final-form';

import { AlertItem } from '@/core/AlertItem';
import { BaseButton } from '@/core/buttons/BaseButton';
import { ENV } from '@/core/config';
import { format } from '@/core/ErrorMessageFormatter';
import { SubmitButton, StringGroup } from '@/form';
import { translate } from '@/i18n';
import {
  completeMfa,
  describePasskeyError,
  prepareMfa,
  PreparedCeremony,
} from '@/user/passkeys/api';

import { redirectOnSuccess } from './authNavigation';
import * as AuthService from './AuthService';
import { PasswordGroup } from './PasswordGroup';

interface FormData {
  signin_by: 'username' | 'token';
  username: string;
  password: string;
  token: string;
}

const renderError = (error) => {
  let renderedError;
  try {
    // Check multiple possible error structures
    if (error?.response?.data?.detail) {
      renderedError = error.response.data.detail;
    } else if (error?.data?.detail) {
      renderedError = error.data.detail;
    } else if (error?.detail) {
      renderedError = error.detail;
    } else if (error?.message) {
      renderedError = error.message;
    } else {
      const formatted = format(error);
      renderedError =
        typeof formatted === 'string'
          ? formatted
          : formatted?.message || translate('Unknown error');
    }
  } catch {
    renderedError = translate('Unknown error');
  }
  return renderedError;
};

const initialValues = { signin_by: 'username' };

/**
 * The second-factor step.
 *
 * Rendered in place of the credentials form once a password has been
 * accepted. `ceremony` is the pending handle: it is not a token and grants
 * nothing on its own, so holding it in component state is not holding a
 * session.
 */
const PasskeyStep = ({ ceremony, onCancel }) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [prepared, setPrepared] = useState<PreparedCeremony | null>(null);

  // Fetched as the step renders, so the confirm click calls WebAuthn with
  // nothing awaited in between. Awaiting a request first consumes the user
  // activation and the browser refuses the call outright — see
  // @/user/passkeys/api.
  useEffect(() => {
    let cancelled = false;
    prepareMfa(ceremony)
      .then((value) => {
        if (!cancelled) setPrepared(value);
      })
      .catch((e) => {
        if (!cancelled) setError(renderError(e));
      });
    return () => {
      cancelled = true;
    };
  }, [ceremony]);

  const verify = async () => {
    if (!prepared) return;
    setBusy(true);
    setError(null);
    try {
      const token = await completeMfa(prepared);
      await AuthService.loginUser(token, 'passkey');
      await redirectOnSuccess();
    } catch (e: any) {
      if (e?.name === 'AbortError') {
        return;
      }
      setError(describePasskeyError(e) ?? renderError(e));
      // The challenge is spent; get a fresh one so retrying is not futile.
      setPrepared(null);
      prepareMfa(ceremony)
        .then(setPrepared)
        .catch(() => undefined);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mb-2 text-center">
      <div className="mb-5">
        <span className="svg-icon svg-icon-2x text-primary">
          <FingerprintIcon weight="bold" />
        </span>
      </div>
      <p className="text-muted mb-5">
        {translate(
          'Your password was accepted. Confirm with your passkey to finish signing in.',
        )}
      </p>
      <SubmitButton
        submitting={busy}
        onClick={verify}
        invalid={!prepared}
        disabledReason={
          !prepared ? translate('Preparing the passkey challenge.') : undefined
        }
        type="button"
        label={translate('Confirm with passkey')}
        className="w-100 mb-3"
        data-testid="passkey-mfa-confirm"
      />
      <BaseButton
        label={translate('Cancel')}
        onClick={onCancel}
        disabled={busy}
        disabledReason={translate('Waiting for your device to respond.')}
        variant="text-primary"
        size="lg"
        type="button"
      />
      {error && (
        <AlertItem
          variant="error"
          title={translate('Passkey verification failed')}
          body={error}
          className="mt-3"
        />
      )}
    </div>
  );
};

export const SigninForm = () => {
  const [pendingCeremony, setPendingCeremony] = useState<string | null>(null);

  const signin = async (values: FormData) => {
    // See also: https://github.com/facebook/react/issues/1159#issuecomment-506584346
    if (
      values.signin_by === 'username' &&
      (!values.password || !values.username)
    ) {
      return translate('Please enter username and password.');
    }
    if (values.signin_by === 'token' && !values.token) {
      return translate('Please enter access token.');
    }
    try {
      if (values.signin_by === 'username') {
        const result = await AuthService.signin(
          values.username,
          values.password,
        );
        if (result.status === 'passkey-required') {
          setPendingCeremony(result.ceremony);
          return;
        }
      } else {
        await AuthService.signinByToken(values.token);
      }
      await redirectOnSuccess();
    } catch (error) {
      return { _error: renderError(error) };
    }
  };

  if (pendingCeremony) {
    return (
      <PasskeyStep
        ceremony={pendingCeremony}
        onCancel={() => setPendingCeremony(null)}
      />
    );
  }

  return (
    <Form
      onSubmit={signin}
      initialValues={initialValues}
      render={({
        handleSubmit,
        submitting,
        submitError,
        submitErrors,
        values,
      }) => {
        const formError = submitErrors?._error || submitError;
        return (
          <form className="mb-2" onSubmit={handleSubmit}>
            <Field
              name="signin_by"
              render={({ input }) => (
                <ToggleButtonGroup
                  {...input}
                  type="radio"
                  className="w-100 mb-5"
                >
                  <ToggleButton
                    id="tbg-username"
                    value="username"
                    variant="tertiary"
                    className="w-50"
                  >
                    {translate('Username')}
                  </ToggleButton>
                  <ToggleButton
                    id="tbg-token"
                    value="token"
                    variant="tertiary"
                    className="w-50"
                  >
                    {translate('Access token')}
                  </ToggleButton>
                </ToggleButtonGroup>
              )}
            />

            {values.signin_by === 'username' ? (
              <>
                <StringGroup
                  name="username"
                  label={translate('Username')}
                  placeholder={translate('Enter your username')}
                  className="text-start"
                  spaceless
                  autoFocus
                />
                <PasswordGroup
                  name="password"
                  label={translate('Password')}
                  placeholder={translate('Enter your password')}
                  className="text-start"
                  space={8}
                />
              </>
            ) : (
              <PasswordGroup
                name="token"
                label={translate('Access token')}
                description={translate(
                  'Use a personal access token issued by {siteName}',
                  { siteName: ENV.plugins.WALDUR_CORE.SITE_NAME },
                )}
                placeholder={translate('Paste here your token')}
                className="text-start"
                space={8}
                autoFocus
              />
            )}

            <SubmitButton
              submitting={submitting}
              label={translate('Login')}
              className="login-submit-button"
              data-testid="login-submit"
            />

            {formError && (
              <div
                className="alert alert-danger mt-3 ellipsis-lines-1"
                role="alert"
                style={{ maxWidth: '100vh' }}
              >
                {formError}
              </div>
            )}
          </form>
        );
      }}
    />
  );
};
