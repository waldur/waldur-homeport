import { FC, useState } from 'react';
import { Form } from 'react-final-form';
import {
  AccountOptions,
  AccountOptionsPreview,
  marketplaceServiceProvidersAccountOptionsPreview,
  marketplaceServiceProvidersPartialUpdate,
  ServiceProvider,
} from 'waldur-js-client';

import { AlertItem } from '@/core/AlertItem';
import { BaseButton } from '@/core/buttons/BaseButton';
import { SelectGroup, StringGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';

import {
  ACCOUNT_SCOPE_OPTIONS,
  USERNAME_GENERATION_POLICY_OPTIONS,
} from '../accountSettings';

import { AccountOptionsPreviewResult } from './AccountOptionsPreviewResult';

const ACCOUNT_OPTION_KEYS = [
  'account_scope',
  'username_generation_policy',
  'username_anonymized_prefix',
  'homedir_prefix',
  'login_shell',
] as const;

type Values = Partial<Record<(typeof ACCOUNT_OPTION_KEYS)[number], string>>;

// Every key is sent: an unchanged value merges as a no-op, and an emptied one
// is sent blank, which removes the provider's own setting.
const toChanges = (values: Values): AccountOptions =>
  Object.fromEntries(
    ACCOUNT_OPTION_KEYS.map((key) => [key, values[key] ?? '']),
  ) as AccountOptions;

interface AccountOptionsPreviewDialogProps {
  resolve: {
    serviceProvider: ServiceProvider;
    setServiceProvider(data: ServiceProvider): void;
  };
}

/** Edit the provider's account options, see what they do, then apply. */
export const AccountOptionsPreviewDialog: FC<
  AccountOptionsPreviewDialogProps
> = ({ resolve: { serviceProvider, setServiceProvider } }) => {
  const { showErrorResponse } = useNotify();
  const [preview, setPreview] = useState<AccountOptionsPreview>();
  const [previewed, setPreviewed] = useState<string>();
  const [previewing, setPreviewing] = useState(false);

  const apply = useManagedMutation<any, any, Values>({
    mutationFn: (values) =>
      marketplaceServiceProvidersPartialUpdate({
        path: { uuid: serviceProvider.uuid },
        body: { account_options: toChanges(values) },
      }),
    onSuccess: (response) => setServiceProvider(response.data),
    successMessage: translate('Account settings have been updated.'),
    errorMessage: translate('Unable to update account settings.'),
  });

  const runPreview = async (values: Values) => {
    // A click while a preview is running is ignored rather than disabling the
    // button for a moment.
    if (previewing) {
      return;
    }
    setPreviewing(true);
    try {
      const response = await marketplaceServiceProvidersAccountOptionsPreview({
        path: { uuid: serviceProvider.uuid },
        body: { account_options: toChanges(values) },
      });
      setPreview(response.data);
      setPreviewed(JSON.stringify(toChanges(values)));
    } catch (error) {
      showErrorResponse(error, translate('Unable to preview the change.'));
    } finally {
      setPreviewing(false);
    }
  };

  return (
    <Form<Values>
      onSubmit={(values) => apply.mutateAsync(values)}
      initialValues={serviceProvider.account_options ?? {}}
      render={({ handleSubmit, submitting, values }) => {
        // Applying is offered only for the values the preview was made for.
        const current = previewed === JSON.stringify(toChanges(values));
        return (
          <form onSubmit={handleSubmit}>
            <ModalDialog
              title={translate('Preview changes to account settings')}
              footer={
                <>
                  <BaseButton
                    label={translate('Preview')}
                    variant="tertiary"
                    onClick={() => runPreview(values)}
                  />
                  <SubmitButton
                    disabled={!current || previewing}
                    submitting={submitting}
                    label={translate('Apply')}
                  />
                </>
              }
            >
              <p className="text-muted">
                {translate(
                  'Change the settings and preview what they do before applying them. Nothing is saved until you apply.',
                )}
              </p>
              <div className="row">
                <div className="col-md-6">
                  <SelectGroup
                    name="account_scope"
                    label={translate('Account scope')}
                    options={ACCOUNT_SCOPE_OPTIONS}
                    simpleValue
                    isClearable
                    parse={(value) => value ?? ''}
                  />
                  <SelectGroup
                    name="username_generation_policy"
                    label={translate('Username generation policy')}
                    options={USERNAME_GENERATION_POLICY_OPTIONS}
                    simpleValue
                    isClearable
                    parse={(value) => value ?? ''}
                  />
                  <StringGroup
                    name="username_anonymized_prefix"
                    label={translate('Anonymized username prefix')}
                    required={false}
                  />
                </div>
                <div className="col-md-6">
                  <StringGroup
                    name="homedir_prefix"
                    label={translate('Home directory prefix')}
                    required={false}
                  />
                  <StringGroup
                    name="login_shell"
                    label={translate('Login shell')}
                    required={false}
                  />
                </div>
              </div>
              {preview && !current && (
                <AlertItem
                  variant="info"
                  className="mb-4"
                  title={translate(
                    'The settings changed since the preview. Preview again to apply them.',
                  )}
                />
              )}
              {preview && <AccountOptionsPreviewResult preview={preview} />}
            </ModalDialog>
          </form>
        );
      }}
    />
  );
};
