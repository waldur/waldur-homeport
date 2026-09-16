import { FC } from 'react';
import { ServiceProvider } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import {
  EditFieldProvider,
  SelectEditField,
  StringEditField,
} from '@/form/editFields';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';
import { useCustomer, useUser } from '@/workspace/hooks';
import { checkIsOwnerOrStaff } from '@/workspace/selectors';

import {
  ACCOUNT_SCOPE_OPTIONS,
  DEFAULT_ACCOUNT_SCOPE,
  DEFAULT_ANONYMIZED_PREFIX,
  DEFAULT_HOMEDIR_PREFIX,
  DEFAULT_LOGIN_SHELL,
  DEFAULT_USERNAME_GENERATION_POLICY,
  getOptionLabel,
  USERNAME_GENERATION_POLICY_OPTIONS,
} from './accountSettings';
import { useServiceProviderUpdate } from './useServiceProviderUpdate';

const AccountOptionsPreviewDialog = lazyComponent(() =>
  import('./accounts/AccountOptionsPreviewDialog').then((module) => ({
    default: module.AccountOptionsPreviewDialog,
  })),
);

interface ProviderAccountSettingsProps {
  serviceProvider: ServiceProvider;
  setServiceProvider(data: ServiceProvider): void;
}

// A setting the provider does not set is absent from its account options.
// Show what an offering without its own value falls back to instead, so an
// empty row is not read as "nothing happens".
const renderNotSet = (fallback: string) => (
  <span className="text-muted">
    {translate('Not set, offerings default to {value}', { value: fallback })}
  </span>
);

const renderOrFallback = (fallback: string) => (value: string) =>
  value || renderNotSet(fallback);

const renderOptionOrFallback =
  (options: { label: string; value: string }[], fallback: string) =>
  (value: string) =>
    value
      ? getOptionLabel(options, value)
      : renderNotSet(getOptionLabel(options, fallback));

// A cleared select yields null; the backend removes a setting sent blank.
const parseCleared = (value) => value ?? '';

// The full explanation opens in a dialog, as TruncatedMarkdown shows long
// text: one line on the card and a Show more link to the rest.
const AccountSettingsIntroDialog: FC = () => (
  <div className="modal-header-less">
    <div className="modal-body">
      <h5 className="modal-title mb-3">{translate('Account settings')}</h5>
      <p>
        {translate(
          'These settings decide how the accounts people get on your offerings are named and set up: the username, home directory and login shell that your systems, such as an LDAP directory, receive for each person.',
        )}
      </p>
      <p>
        {translate(
          'Each offering uses its own value where it sets one, then the value here, then the built-in default. The User management settings of an offering show which of the three applies.',
        )}
      </p>
      <p className="mb-0">
        {translate(
          'Choose per service provider when your offerings share one user directory: a person then has a single account, with the same username and POSIX UID, on all of them.',
        )}
      </p>
    </div>
  </div>
);

export const ProviderAccountSettings: FC<ProviderAccountSettingsProps> = ({
  serviceProvider,
  setServiceProvider,
}) => {
  const user = useUser();
  const customer = useCustomer();
  const update = useServiceProviderUpdate(serviceProvider, setServiceProvider);
  // The backend lets organization owners and staff update the provider.
  const canUpdate = checkIsOwnerOrStaff(customer, user);
  const { openDialog } = useModal();
  const options = serviceProvider.account_options ?? {};

  return (
    <FormTable.Card
      title={translate('Account settings')}
      className="card-bordered"
      actions={
        canUpdate && (
          <ActionButton
            title={translate('Preview changes')}
            action={() =>
              openDialog(AccountOptionsPreviewDialog, {
                resolve: { serviceProvider, setServiceProvider },
                size: 'xl',
              })
            }
          />
        )
      }
    >
      <p className="text-muted mb-6">
        {translate(
          'How the accounts people get on your offerings are named and set up.',
        )}{' '}
        <button
          type="button"
          className="text-anchor"
          onClick={() => openDialog(AccountSettingsIntroDialog, { size: 'lg' })}
        >
          {translate('Show more')}
        </button>
      </p>
      <EditFieldProvider scope={serviceProvider} callback={update}>
        <FormTable hideActions={!canUpdate}>
          <SelectEditField
            name="account_options.account_scope"
            label={translate('Account scope')}
            description={translate(
              'Per offering: each offering holds its own account for a person. Per service provider: one account per person, shared across all offerings of this service provider. Switching to per service provider links existing offering accounts and is refused while a person has different usernames on different offerings. Offerings can override this setting.',
            )}
            options={ACCOUNT_SCOPE_OPTIONS}
            simpleValue
            isClearable
            parse={parseCleared}
            renderValue={renderOptionOrFallback(
              ACCOUNT_SCOPE_OPTIONS,
              DEFAULT_ACCOUNT_SCOPE,
            )}
          />
          <SelectEditField
            name="account_options.username_generation_policy"
            label={translate('Username generation policy')}
            description={translate(
              'Default for offerings that do not set their own policy. Leave empty to let each offering decide.',
            )}
            options={USERNAME_GENERATION_POLICY_OPTIONS}
            simpleValue
            isClearable
            parse={parseCleared}
            renderValue={renderOptionOrFallback(
              USERNAME_GENERATION_POLICY_OPTIONS,
              DEFAULT_USERNAME_GENERATION_POLICY,
            )}
          />
          {options.username_generation_policy === 'anonymized' && (
            <StringEditField
              name="account_options.username_anonymized_prefix"
              label={translate('Anonymized username prefix')}
              description={translate(
                'Anonymized usernames are this prefix followed by the POSIX UID of the account. Leave empty to let each offering decide.',
              )}
              placeholder={DEFAULT_ANONYMIZED_PREFIX}
              renderValue={renderOrFallback(DEFAULT_ANONYMIZED_PREFIX)}
            />
          )}
          <StringEditField
            name="account_options.homedir_prefix"
            label={translate('Home directory prefix')}
            description={translate(
              'Default for offerings that do not set their own prefix. Leave empty to let each offering decide.',
            )}
            placeholder={DEFAULT_HOMEDIR_PREFIX}
            renderValue={renderOrFallback(DEFAULT_HOMEDIR_PREFIX)}
          />
          <StringEditField
            name="account_options.login_shell"
            label={translate('Login shell')}
            description={translate(
              'Default for offerings that do not set their own login shell. Leave empty to let each offering decide.',
            )}
            placeholder={DEFAULT_LOGIN_SHELL}
            renderValue={renderOrFallback(DEFAULT_LOGIN_SHELL)}
          />
        </FormTable>
      </EditFieldProvider>
    </FormTable.Card>
  );
};
