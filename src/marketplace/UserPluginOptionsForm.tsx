import { FunctionComponent, useMemo } from 'react';
import { UsernameGenerationPolicyEnum } from 'waldur-js-client';

import { required } from '@waldur/core/validators';
import { SelectField, NumberField, StringField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { SITE_AGENT_PLUGIN } from '@waldur/slurm/constants';

import { DefaultOfferingEditPanel } from './offerings/update/DefaultOfferingEditPanel';
import { OfferingEditPanelFormProps } from './offerings/update/integration/types';

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

export const UserPluginOptionsForm: FunctionComponent<
  OfferingEditPanelFormProps
> = (props) => {
  const pluginOptions = props.offering.plugin_options;
  const canCreateUser =
    pluginOptions?.service_provider_can_create_offering_user;

  const fields = useMemo(
    () =>
      [
        {
          label: translate('Enable automatic creation of offering users'),
          key: 'plugin_options.service_provider_can_create_offering_user',
          component: AwesomeCheckboxField,
          description: translate(
            'If true, offering users are created automatically when a user is added to the project with active offering resources or when a new offering resource is created.',
          ),
        },
        props.offering.type === SITE_AGENT_PLUGIN && {
          label: translate('Account name generation policy'),
          key: 'plugin_options.account_name_generation_policy',
          component: SelectField,
          fieldProps: {
            options: ACCOUNT_NAME_GENERATION_POLICY_OPTIONS,
            simpleValue: true,
            isClearable: true,
          },
          disabled: !canCreateUser,
          value: (value) =>
            ACCOUNT_NAME_GENERATION_POLICY_OPTIONS.find(
              (op) => op.value === value,
            )?.label,
        },
        {
          label: translate('Username generation policy'),
          key: 'plugin_options.username_generation_policy',
          component: SelectField,
          fieldProps: {
            options: USERNAME_GENERATION_POLICY_OPTIONS,
            simpleValue: true,
            validate: required,
            isClearable: false,
          },
          warnTooltip:
            getTooltip(
              pluginOptions?.username_generation_policy,
              translate('Service provider'),
            ) ||
            (pluginOptions.username_generation_policy === 'service_provider' &&
              translate(
                'Warning: Service provider option will clear all usernames of the existing offering users',
              )),
          disabled: !canCreateUser,
          value: (value) =>
            USERNAME_GENERATION_POLICY_OPTIONS.find((op) => op.value === value)
              ?.label,
        },
        pluginOptions?.username_generation_policy == 'anonymized' && {
          label: translate('Username anonymized prefix'),
          key: 'plugin_options.username_anonymized_prefix',
          component: StringField,
          warnTooltip: getTooltip(
            pluginOptions?.username_anonymized_prefix,
            'walduruser_',
          ),
          disabled: !canCreateUser,
        },
        {
          label: translate('Initial UID number'),
          key: 'plugin_options.initial_uidnumber',
          component: NumberField,
          warnTooltip: getTooltip(pluginOptions?.initial_uidnumber, 100000),
          disabled: !canCreateUser,
        },
        {
          label: translate('Initial primary group number'),
          key: 'plugin_options.initial_primarygroup_number',
          component: NumberField,
          warnTooltip: getTooltip(
            pluginOptions?.initial_primarygroup_number,
            10000,
          ),
          disabled: !canCreateUser,
        },
        {
          label: translate('Home directory prefix'),
          key: 'plugin_options.homedir_prefix',
          component: StringField,
          warnTooltip: getTooltip(pluginOptions?.homedir_prefix, '/home/'),
          disabled: !canCreateUser,
        },
      ].filter(Boolean),
    [props.offering.type, pluginOptions, canCreateUser],
  );

  return <DefaultOfferingEditPanel fields={fields} {...props} />;
};
