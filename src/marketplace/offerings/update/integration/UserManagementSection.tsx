import { FC } from 'react';
import { UsernameGenerationPolicyEnum } from 'waldur-js-client';

import { CheckOrX } from '@/core/CheckOrX';
import { required } from '@/core/validators';
import {
  BooleanEditField,
  EditFieldProvider,
  SelectEditField,
  StringEditField,
} from '@/form/editFields';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { SITE_AGENT_PLUGIN } from '@/site-agent/constants';

import { GLAuthConfigButton } from './GLAuthConfigButton';
import { OfferingEditPanelProps } from './types';
import {
  canSeeOfferingSecretOptions,
  SECRET_OPTIONS_HIDDEN_REASON,
  useUpdateOfferingIntegration,
} from './utils';

type UsernameGenerationPolicyOption = {
  label: string;
  value: UsernameGenerationPolicyEnum;
};

const USERNAME_GENERATION_POLICY_OPTIONS: UsernameGenerationPolicyOption[] = [
  {
    label: translate('Service provider'),
    value: 'service_provider',
  },
  {
    label: translate('Anonymized'),
    value: 'anonymized',
  },
  {
    label: translate('Full name'),
    value: 'full_name',
  },
  {
    label: translate('Waldur username'),
    value: 'waldur_username',
  },
  {
    label: translate('FreeIPA'),
    value: 'freeipa',
  },
  {
    label: translate('Identity claim'),
    value: 'identity_claim',
  },
];

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

const getTooltip = (currentValue, defaultValue) =>
  !currentValue
    ? translate('Could be "{value}"', {
        value: defaultValue,
      })
    : null;

export const DefaultUserManagementSection: FC<OfferingEditPanelProps> = (
  props,
) => {
  const { update } = useUpdateOfferingIntegration(
    props.offering,
    props.refetch,
  );

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

  return (
    <FormTable.Card
      title={translate('User management')}
      className="card-bordered mb-7"
      actions={
        posixEnabled ? (
          <GLAuthConfigButton offering={props.offering} />
        ) : undefined
      }
    >
      <FormTable>
        <EditFieldProvider scope={props.offering} callback={update}>
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
          <SelectEditField
            name="plugin_options.username_generation_policy"
            label={translate('Username generation policy')}
            options={USERNAME_GENERATION_POLICY_OPTIONS}
            simpleValue
            validate={required}
            isClearable={false}
            warnTooltip={
              getTooltip(
                pluginOptions?.username_generation_policy,
                translate('Service provider'),
              ) ||
              (pluginOptions?.username_generation_policy ===
                'service_provider' &&
                translate(
                  'Warning: Service provider option will clear all usernames of the existing offering users',
                ))
            }
            disabled={!canCreateUser}
            renderValue={(value) =>
              USERNAME_GENERATION_POLICY_OPTIONS.find(
                (op) => op.value === value,
              )?.label
            }
          />
          {pluginOptions?.username_generation_policy === 'anonymized' && (
            <StringEditField
              name="plugin_options.username_anonymized_prefix"
              label={translate('Username anonymized prefix')}
              warnTooltip={getTooltip(
                pluginOptions?.username_anonymized_prefix,
                'walduruser_',
              )}
              disabled={!canCreateUser}
            />
          )}
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
          {posixEnabled && (
            <>
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
                    : getTooltip(uidSource, translate('POSIX ID pool'))
                }
                renderValue={(value) =>
                  POSIX_ID_SOURCE_OPTIONS.find((op) => op.value === value)
                    ?.label
                }
              />
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
                    : getTooltip(gidSource, translate('POSIX ID pool'))
                }
                renderValue={(value) =>
                  POSIX_ID_SOURCE_OPTIONS.find((op) => op.value === value)
                    ?.label
                }
              />
              <StringEditField
                name="plugin_options.homedir_prefix"
                label={translate('Home directory prefix')}
                warnTooltip={getTooltip(
                  pluginOptions?.homedir_prefix,
                  '/home/',
                )}
                disabled={!canCreateUser}
              />
              <StringEditField
                name="plugin_options.login_shell"
                label={translate('Login shell')}
                warnTooltip={getTooltip(
                  pluginOptions?.login_shell,
                  '/bin/bash',
                )}
                disabled={!canCreateUser}
              />
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
            </>
          )}
        </EditFieldProvider>
      </FormTable>
    </FormTable.Card>
  );
};
