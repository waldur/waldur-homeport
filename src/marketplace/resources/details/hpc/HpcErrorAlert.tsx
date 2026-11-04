import { FC, ReactNode } from 'react';

import { AlertItem, BaseButton } from 'waldur-ui';

import { signInAgainHere } from '@/auth/authNavigation';
import { getErrorBody } from '@/core/ErrorMessageFormatter';
import { translate } from '@/i18n';

import { getHpcErrorMessage } from './utils';

/** The provider a failed HPC request says to sign in through again, if any. */
export const getSignInProvider = (error: unknown): string | undefined => {
  const body = getErrorBody(error);
  return body?.code === 'identity_provider_sign_in_required' &&
    typeof body.identity_provider === 'string'
    ? body.identity_provider
    : undefined;
};

/**
 * A failed HPC request, with the backend's reason: a missing identity
 * provider sign-in, an unreachable FirecREST, a path the user cannot read.
 * When signing in again is the remedy, the alert offers it and comes back here.
 */
export const HpcErrorAlert: FC<{
  error?: unknown;
  message?: string | null;
  /** From the workspace overview, which reports its error as a message. */
  signInProvider?: string | null;
  title?: ReactNode;
  className?: string;
}> = ({ error, message, signInProvider, title, className }) => {
  if (!error && !message) return null;
  const provider = signInProvider || getSignInProvider(error);
  return (
    <AlertItem
      variant="error"
      type="floating"
      className={className ?? 'mb-6'}
      title={title ?? translate('HPC service unavailable')}
      body={message || getHpcErrorMessage(error)}
      actions={
        provider ? (
          <BaseButton
            variant="secondary"
            size="sm"
            label={translate('Sign in again')}
            onClick={() => signInAgainHere(provider)}
          />
        ) : undefined
      }
    />
  );
};
