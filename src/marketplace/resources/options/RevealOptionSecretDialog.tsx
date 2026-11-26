import { FC, useEffect, useState } from 'react';
import {
  marketplaceProviderResourcesRevealOptionSecret,
  marketplaceResourcesRevealOptionSecret,
} from 'waldur-js-client';

import { FormField, FormLabel, FormText } from 'waldur-ui';

import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { getErrorBody } from '@/core/ErrorMessageFormatter';
import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { BaseSecretField } from '@/form';
import { translate } from '@/i18n';
import { flattenErrors } from '@/marketplace/common/ipsecVpn';
import { SecretTextarea } from '@/marketplace/common/SecretOptionField';
import { resolveSecretPolicy } from '@/marketplace/common/secretOptions';
import { ModalDialog } from '@/modal/ModalDialog';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';

import { OptionSecretDialogProps } from './SetOptionSecretDialog';

type RevealState =
  | { status: 'loading' }
  | { status: 'ready'; value: string }
  | { status: 'error'; message: string };

/** Why a reveal was refused, in the server's words where it has them. */
export const getRevealError = (error): string => {
  const body = getErrorBody(error);
  const detail = flattenErrors(body?.detail ?? body?.option_name)[0];
  if (error?.status === 409) {
    return detail || translate('The secret is not set yet.');
  }
  if (error?.status === 403) {
    return detail || translate('You may not read this secret back.');
  }
  return detail || translate('Unable to reveal the secret.');
};

/**
 * Shows the value of a secret option, masked, with show/hide and copy. Each
 * opening asks the server again, which audits it; the value lives in this
 * dialog's state only and is gone once it closes.
 */
export const RevealOptionSecretDialog: FC<OptionSecretDialogProps> = ({
  resolve: { resource, optionName, optionLabel, policy, asProvider },
}) => {
  const [state, setState] = useState<RevealState>({ status: 'loading' });
  const multiline = resolveSecretPolicy(policy).multiline;

  useEffect(() => {
    let active = true;
    const options = {
      path: { uuid: resource.uuid },
      body: { option_name: optionName },
    };
    (asProvider
      ? marketplaceProviderResourcesRevealOptionSecret(options)
      : marketplaceResourcesRevealOptionSecret(options)
    )
      .then(
        (response) =>
          active && setState({ status: 'ready', value: response.data.value }),
      )
      .catch(
        (error) =>
          active &&
          setState({ status: 'error', message: getRevealError(error) }),
      );
    return () => {
      active = false;
    };
  }, [resource.uuid, optionName, asProvider]);

  return (
    <ModalDialog
      title={translate('Secret')}
      subtitle={
        <ScopeSubtitle
          label={translate('Option')}
          name={`${optionLabel} · ${resource.name}`}
        />
      }
    >
      <FormField className="mb-1.5">
        <FormLabel>{optionLabel}</FormLabel>
        {state.status === 'ready' ? (
          <div className="flex items-start self-stretch gap-1.5">
            {multiline ? (
              <div className="grow">
                <SecretTextarea value={state.value} readOnly />
              </div>
            ) : (
              // readOnly, not disabled: a disabled input cannot be selected.
              <BaseSecretField value={state.value} readOnly className="grow" />
            )}
            <CopyToClipboardButton
              value={state.value}
              size={20}
              buttonVariant="text-secondary"
              onlyButton
            />
          </div>
        ) : state.status === 'error' ? (
          <div className="text-danger" role="alert">
            {state.message}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-quaternary">
            <LoadingSpinnerSimple /> {translate('Revealing…')}
          </div>
        )}
        <FormText variant="muted">
          {translate(
            'Keep it secret. Each reveal is recorded in the resource’s events.',
          )}
        </FormText>
      </FormField>
    </ModalDialog>
  );
};
