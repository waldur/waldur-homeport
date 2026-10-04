import { FORM_ERROR } from 'final-form';
import { FC } from 'react';
import { Form } from 'react-final-form';
import {
  marketplaceServiceProvidersAdoptProviderAccounts,
  ProviderUsernameConflict,
  ServiceProvider,
} from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { required } from '@/core/validators';
import { SelectGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { candidateEvidence } from './candidateEvidence';

interface AdoptProviderAccountsDialogProps {
  resolve: {
    provider: ServiceProvider;
    conflicts: ProviderUsernameConflict[];
    refetch: () => void;
    /** Opened from a switch to per service provider accounts, applied after. */
    pendingSwitch?: boolean;
  };
}

interface FormValues {
  resolutions?: Record<string, string>;
}

const candidateLabel = (
  candidate: ProviderUsernameConflict['candidates'][number],
) => [candidate.username, ...candidateEvidence(candidate)].join(' · ');

/**
 * Choose the username each conflicted person keeps. The backend then backs
 * every offering account with one provider account per person, so all
 * conflicts are resolved in one go.
 */
export const AdoptProviderAccountsDialog: FC<
  AdoptProviderAccountsDialogProps
> = ({ resolve: { provider, conflicts, refetch, pendingSwitch } }) => {
  const mutation = useManagedMutation<any, any, Record<string, string>>({
    mutationFn: (resolutions) =>
      marketplaceServiceProvidersAdoptProviderAccounts({
        path: { uuid: provider.uuid },
        body: { resolutions },
      }),
    successMessage: translate('Username conflicts have been resolved.'),
    refetch,
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await mutation.mutateAsync(values.resolutions ?? {});
    } catch (e: any) {
      const { response: _response, ...data } = e ?? {};
      return {
        [FORM_ERROR]:
          data.detail ||
          data.usernames?.join(', ') ||
          translate('Unable to resolve username conflicts.'),
      };
    }
  };

  return (
    <Form<FormValues>
      onSubmit={onSubmit}
      render={({ handleSubmit, submitting, invalid, submitError }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Resolve username conflicts')}
            footer={
              <SubmitButton
                disabled={invalid}
                submitting={submitting}
                label={translate('Resolve')}
              />
            }
          >
            {submitError && (
              <AlertItem variant="error" title={submitError} className="mb-4" />
            )}
            {pendingSwitch && (
              <AlertItem
                variant="info"
                className="mb-4"
                data-testid="pending-switch"
                title={translate(
                  '{count} person(s) have different usernames on different offerings. Switching to per service provider accounts is applied once every conflict is resolved.',
                  { count: conflicts.length },
                )}
              />
            )}
            <p className="text-muted">
              {translate(
                'Choose the username to keep for each person. Their accounts on the other offerings are renamed to it and take over its POSIX UID and home directory.',
              )}
            </p>
            <AlertItem
              variant="warning"
              className="mb-5"
              title={translate(
                'Renaming a live account changes who owns its files on your systems. Move or re-own the files of the renamed accounts afterwards.',
              )}
            />
            {conflicts.map((conflict) => (
              <SelectGroup
                key={conflict.user_uuid}
                name={`resolutions.${conflict.user_uuid}`}
                label={conflict.user_full_name || conflict.user_username}
                options={conflict.candidates.map((candidate) => ({
                  label: candidateLabel(candidate),
                  value: candidate.username,
                }))}
                simpleValue
                isClearable={false}
                required
                validate={required}
                disabled={submitting}
              />
            ))}
          </ModalDialog>
        </form>
      )}
    />
  );
};
