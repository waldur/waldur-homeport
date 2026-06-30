import { FC } from 'react';
import { UsernameGenerationPolicyEnum } from 'waldur-js-client';

import { required } from '@/core/validators';
import {
  BooleanEditField,
  EditFieldProvider,
  NumberEditField,
  SelectEditField,
  StringEditField,
} from '@/form/editFields';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { SITE_AGENT_PLUGIN } from '@/site-agent/constants';

import { GLAuthConfigButton } from './GLAuthConfigButton';
import { OfferingEditPanelProps } from './types';
import { useUpdateOfferingIntegration } from './utils';

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

  return (
    <FormTable.Card
      title={translate('User management')}
      className="card-bordered mb-7"
      actions={<GLAuthConfigButton offering={props.offering} />}
    >
      <FormTable>
        <EditFieldProvider scope={props.offering} callback={update}>
          <StringEditField
            name="secret_options.shared_user_password"
            label={translate('Shared user password')}
            description={translate(
              'If defined, will be set as a password for all offering users',
            )}
            disabled={!canCreateUser}
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
          <NumberEditField
            name="plugin_options.initial_uidnumber"
            label={translate('Initial UID number')}
            warnTooltip={getTooltip(pluginOptions?.initial_uidnumber, 100000)}
            disabled={!canCreateUser}
          />
          <NumberEditField
            name="plugin_options.initial_primarygroup_number"
            label={translate('Initial primary group number')}
            warnTooltip={getTooltip(
              pluginOptions?.initial_primarygroup_number,
              10000,
            )}
            disabled={!canCreateUser}
          />
          <StringEditField
            name="plugin_options.homedir_prefix"
            label={translate('Home directory prefix')}
            warnTooltip={getTooltip(pluginOptions?.homedir_prefix, '/home/')}
            disabled={!canCreateUser}
          />
        </EditFieldProvider>
      </FormTable>
    </FormTable.Card>
  );
};
