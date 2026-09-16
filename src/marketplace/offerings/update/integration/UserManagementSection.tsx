import { FC } from 'react';
import { AccountSetting, OfferingAccountSettings } from 'waldur-js-client';

import { CheckOrX } from '@/core/CheckOrX';
import { Link } from '@/core/Link';
import { required } from '@/core/validators';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import {
  BooleanEditField,
  EditFieldProvider,
  SelectEditField,
  StringEditField,
} from '@/form/editFields';
import FormTable from '@/form/FormTable';
import { TabbedSection } from '@/form/TabbedSection';
import { translate } from '@/i18n';
import {
  ACCOUNT_SCOPE_OPTIONS,
  getOptionLabel,
  USERNAME_GENERATION_POLICY_OPTIONS,
} from '@/marketplace/service-providers/accountSettings';
import { SITE_AGENT_PLUGIN } from '@/site-agent/constants';

import { AccountSettingValue } from './AccountSettingValue';
import { GLAuthConfigButton } from './GLAuthConfigButton';
import {
  PosixIdPoolSummary,
  SharedAccountsValue,
} from './OfferingAccountsOverview';
import { OfferingEditPanelProps } from './types';
import { useOfferingAccountContext } from './useOfferingAccountContext';
import {
  canSeeOfferingSecretOptions,
  SECRET_OPTIONS_HIDDEN_REASON,
  useUpdateOfferingIntegration,
} from './utils';

const ACCOUNT_NAME_GENERATION_POLICY_OPTIONS = [
  {
    label: translate('Project slug'),
    value: 'project_slug',
  },
];

// POSIX UID / primary GID sourcing (backend: GLAuthPluginOptionsSerializer,
// waldur-mastermind MR !5813). 'pool' allocates from the offering's POSIX ID
// pool; 'user_attribute' takes the value from the Waldur user's
// uid_number / primary_gid identity attribute (e.g. an OIDC claim).
const POSIX_ID_SOURCE_OPTIONS = [
  {
    label: translate('POSIX ID pool'),
    value: 'pool',
  },
  {
    label: translate('User attribute (identity provider)'),
    value: 'user_attribute',
  },
];

// An unset source allocates from the pool; say so rather than show a dash.
const renderIdSource = (value: string) =>
  value ? (
    getOptionLabel(POSIX_ID_SOURCE_OPTIONS, value)
  ) : (
    <div className="d-flex flex-column align-items-start">
      <span>{translate('POSIX ID pool')}</span>
      <small className="text-muted">{translate('Default')}</small>
    </div>
  );

type AccountSettingKey = keyof OfferingAccountSettings;

type Options = { label: string; value: string }[];

// Names the value that removing the offering's own setting leads to, which
// the backend reports as the setting's inherited value.
const getResetLabel = (setting: AccountSetting, options?: Options) => {
  const inherited = setting.inherited;
  if (!inherited) {
    return undefined;
  }
  const value =
    (options && getOptionLabel(options, inherited.value)) || inherited.value;
  return inherited.source === 'provider'
    ? translate('Use provider setting ({value})', { value })
    : translate('Use default ({value})', { value });
};

export const DefaultUserManagementSection: FC<OfferingEditPanelProps> = (
  props,
) => {
  const { update } = useUpdateOfferingIntegration(
    props.offering,
    props.refetch,
  );
  const context = useOfferingAccountContext(props.offering);

  const pluginOptions = props.offering.plugin_options;
  const canCreateUser =
    pluginOptions?.service_provider_can_create_offering_user;
  // enable_posix_account defaults to true; only an explicit false disables it.
  const posixEnabled = pluginOptions?.enable_posix_account !== false;

  const uidSource = pluginOptions?.uid_source;
  const gidSource = pluginOptions?.gid_source;

  // The shared password lives in secret_options, which the backend omits from
  // the payload of anyone who may not change the offering's integration
  // settings. Editing it from an empty render would clear the password in place.
  const secretOptionsHidden = !canSeeOfferingSecretOptions(props.offering);

  // Account settings an offering does not set itself are inherited from its
  // service provider, then from a built-in default. The backend resolves them.
  const getAccountSetting = (
    key: AccountSettingKey,
  ): AccountSetting | undefined => props.offering.account_settings?.[key];

  const renderAccountSetting =
    (key: AccountSettingKey, canEdit: boolean, options?: Options) => () => {
      const setting = getAccountSetting(key);
      if (!setting) {
        return null;
      }
      return (
        <AccountSettingValue
          setting={setting}
          label={options ? getOptionLabel(options, setting.value) : undefined}
          // A blank value removes the offering's own setting, so it inherits
          // again; omitting the key would keep it, as plugin options merge.
          onReset={
            canEdit
              ? () => update({ plugin_options: { [key]: '' } })
              : undefined
          }
          resetLabel={getResetLabel(setting, options)}
        />
      );
    };

  const usernamePolicy = getAccountSetting('username_generation_policy')?.value;
  const sharedAccounts =
    getAccountSetting('account_scope')?.value === 'provider';

  return (
    <EditFieldProvider scope={props.offering} callback={update}>
      <TabbedSection
        title={translate('User management')}
        actions={
          posixEnabled ? (
            <GLAuthConfigButton offering={props.offering} />
          ) : undefined
        }
        enableSearch
      >
        <TabbedSection.Tab
          id="offering-users"
          title={translate('Offering users')}
        >
          <StringEditField
            name="secret_options.shared_user_password"
            label={translate('Shared user password')}
            description={translate(
              'If defined, will be set as a password for all offering users',
            )}
            disabled={!canCreateUser || secretOptionsHidden}
            tooltip={
              secretOptionsHidden ? SECRET_OPTIONS_HIDDEN_REASON : undefined
            }
          />
          <BooleanEditField
            name="plugin_options.service_provider_can_create_offering_user"
            label={translate('Enable automatic creation of offering users')}
            description={translate(
              'If true, offering users are created automatically when a user is added to the project with active offering resources or when a new offering resource is created.',
            )}
          />
          {canCreateUser && (
            <BooleanEditField
              name="plugin_options.offering_user_auto_deletion"
              label={translate('Enable automatic deletion of offering users')}
              description={translate(
                'If enabled, offering users will be automatically marked for deletion when users lose project access. If disabled, deletion must be triggered manually by the service provider.',
              )}
            />
          )}
          {props.offering.type === SITE_AGENT_PLUGIN && (
            <SelectEditField
              name="plugin_options.account_name_generation_policy"
              label={translate('Account name generation policy')}
              options={ACCOUNT_NAME_GENERATION_POLICY_OPTIONS}
              simpleValue
              isClearable
              disabled={!canCreateUser}
              warnTooltip={
                pluginOptions?.account_name_generation_policy ===
                  'project_slug' && pluginOptions?.resource_slug_template
                  ? translate(
                      'Warning: this policy makes the site agent derive the backend account name from the project slug and append its own counter, ignoring the configured resource slug template ("{template}"). Leave it unset to use the unique resource slug directly.',
                      {
                        template: pluginOptions.resource_slug_template,
                      },
                    )
                  : null
              }
              renderValue={(value) =>
                ACCOUNT_NAME_GENERATION_POLICY_OPTIONS.find(
                  (op) => op.value === value,
                )?.label
              }
            />
          )}
        </TabbedSection.Tab>

        <TabbedSection.Tab id="accounts" title={translate('Accounts')}>
          <SelectEditField
            name="plugin_options.account_scope"
            label={translate('Account scope')}
            description={translate(
              'Per offering: this offering holds its own account for a person. Per service provider: the account is shared with the other offerings of this service provider. A value set on this offering overrides the service provider setting.',
            )}
            options={ACCOUNT_SCOPE_OPTIONS}
            simpleValue
            validate={required}
            isClearable={false}
            renderValue={renderAccountSetting(
              'account_scope',
              true,
              ACCOUNT_SCOPE_OPTIONS,
            )}
          />
          {context.sharingOfferings !== undefined && (
            <FormTable.Item
              label={translate('Shared with')}
              description={translate(
                'Other offerings of this service provider where a person has the same account: username, POSIX UID and home directory.',
              )}
              value={
                <SharedAccountsValue
                  offeringUuid={props.offering.uuid}
                  shared={sharedAccounts}
                  sharingOfferings={context.sharingOfferings}
                />
              }
              actions={
                <Link
                  state="marketplace-provider-account-settings"
                  params={{ uuid: props.offering.customer_uuid }}
                  label={translate('Provider account settings')}
                />
              }
            />
          )}
          <SelectEditField
            name="plugin_options.username_generation_policy"
            label={translate('Username generation policy')}
            options={USERNAME_GENERATION_POLICY_OPTIONS}
            simpleValue
            validate={required}
            isClearable={false}
            warnTooltip={
              usernamePolicy === 'service_provider'
                ? translate(
                    'Warning: Service provider option will clear all usernames of the existing offering users',
                  )
                : null
            }
            disabled={!canCreateUser}
            renderValue={renderAccountSetting(
              'username_generation_policy',
              canCreateUser,
              USERNAME_GENERATION_POLICY_OPTIONS,
            )}
          />
          {usernamePolicy === 'anonymized' && (
            <StringEditField
              name="plugin_options.username_anonymized_prefix"
              label={translate('Username anonymized prefix')}
              placeholder={
                getAccountSetting('username_anonymized_prefix')?.value
              }
              disabled={!canCreateUser}
              renderValue={renderAccountSetting(
                'username_anonymized_prefix',
                canCreateUser,
              )}
            />
          )}
        </TabbedSection.Tab>

        <TabbedSection.Tab id="posix" title={translate('POSIX')}>
          <BooleanEditField
            name="plugin_options.enable_posix_account"
            label={translate('Manage POSIX/LDAP account')}
            description={translate(
              'If enabled, this offering manages a POSIX/LDAP account (UID, GID, home directory, login shell and GLAuth exposure) for its users. Disable for offerings that only need a username.',
            )}
            disabled={!canCreateUser}
            // Unset defaults to enabled (matches posixEnabled and the backend
            // default), so the read-only display must not render null as "off".
            renderValue={(value) => <CheckOrX value={value !== false} />}
          />
          {posixEnabled && context.pool !== undefined && (
            <FormTable.Item
              label={translate('POSIX ID pool')}
              description={translate(
                'Where UIDs and GIDs are allocated from when their source is the POSIX ID pool.',
              )}
              value={
                <PosixIdPoolSummary
                  pool={context.pool}
                  offeringUuid={props.offering.uuid}
                />
              }
              actions={
                // The pools page is gated by the same flag. Its route checks it
                // as a permission, which Link does not see, so it would
                // otherwise lead to a not-found page.
                isFeatureVisible(MarketplaceFeatures.show_posix_id_pools) && (
                  <Link
                    state="marketplace-provider-posix-id-pools"
                    params={{ uuid: props.offering.customer_uuid }}
                    label={translate('Manage pools')}
                  />
                )
              }
            />
          )}
          {posixEnabled && (
            <SelectEditField
              name="plugin_options.uid_source"
              label={translate('UID source')}
              description={translate(
                'Where each offering user’s UID comes from: allocated from the offering’s POSIX ID pool (default), or taken from the user’s uid_number identity attribute (e.g. an OIDC claim). Pair "User attribute" with a GID-only pool to avoid UID collisions.',
              )}
              options={POSIX_ID_SOURCE_OPTIONS}
              simpleValue
              isClearable={false}
              disabled={!canCreateUser}
              warnTooltip={
                uidSource === 'user_attribute'
                  ? translate(
                      'UIDs are read from each user’s uid_number attribute; users without it are left without a UID. The pool’s UID range is not used for this offering.',
                    )
                  : null
              }
              renderValue={renderIdSource}
            />
          )}
          {posixEnabled && (
            <SelectEditField
              name="plugin_options.gid_source"
              label={translate('Primary GID source')}
              description={translate(
                'Where each offering user’s primary GID comes from: allocated from the offering’s POSIX ID pool (default), or taken from the user’s primary_gid identity attribute.',
              )}
              options={POSIX_ID_SOURCE_OPTIONS}
              simpleValue
              isClearable={false}
              disabled={!canCreateUser}
              warnTooltip={
                gidSource === 'user_attribute'
                  ? translate(
                      'Primary GIDs are read from each user’s primary_gid attribute; users without it are left without a primary GID. The pool’s GID range is not used for this offering.',
                    )
                  : null
              }
              renderValue={renderIdSource}
            />
          )}
          {posixEnabled && (
            <StringEditField
              name="plugin_options.homedir_prefix"
              label={translate('Home directory prefix')}
              placeholder={getAccountSetting('homedir_prefix')?.value}
              disabled={!canCreateUser}
              renderValue={renderAccountSetting(
                'homedir_prefix',
                canCreateUser,
              )}
            />
          )}
          {posixEnabled && (
            <StringEditField
              name="plugin_options.login_shell"
              label={translate('Login shell')}
              placeholder={getAccountSetting('login_shell')?.value}
              disabled={!canCreateUser}
              renderValue={renderAccountSetting('login_shell', canCreateUser)}
            />
          )}
        </TabbedSection.Tab>

        {posixEnabled && (
          <TabbedSection.Tab id="glauth" title={translate('GLAuth')}>
            <BooleanEditField
              name="plugin_options.emit_display_name"
              label={translate('Expose display name in GLAuth')}
              description={translate(
                "If enabled, the user's full name is emitted as a displayName attribute (LDAP displayName) in the GLAuth configuration.",
              )}
              disabled={!canCreateUser}
            />
            <BooleanEditField
              name="plugin_options.emit_waldur_username"
              label={translate('Expose Waldur username in GLAuth')}
              description={translate(
                'If enabled, the Waldur username is emitted as a waldurUsername attribute in the GLAuth configuration, alongside the generated POSIX login name.',
              )}
              disabled={!canCreateUser}
            />
          </TabbedSection.Tab>
        )}
      </TabbedSection>
    </EditFieldProvider>
  );
};
