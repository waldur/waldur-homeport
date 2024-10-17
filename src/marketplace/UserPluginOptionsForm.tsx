import { get } from 'lodash';
import { FunctionComponent, useMemo } from 'react';

import { required } from '@waldur/core/validators';
import { SelectField, NumberField, StringField } from '@waldur/form';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { SLURM_REMOTE_PLUGIN } from '@waldur/slurm/constants';

import { FieldEditButton } from './offerings/update/integration/FieldEditButton';
import { OfferingEditPanelFormProps } from './offerings/update/integration/types';

const USERNAME_GENERATION_POLICY_OPTIONS = [
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
    props.offering.secret_options?.service_provider_can_create_offering_user;

  const fields = useMemo(
    () =>
      [
        props.offering.type === SLURM_REMOTE_PLUGIN && {
          label: translate('Account name generation policy'),
          key: 'plugin_options.account_name_generation_policy',
          component: SelectField,
          value: ACCOUNT_NAME_GENERATION_POLICY_OPTIONS.find(
            (op) => op.value === pluginOptions?.account_name_generation_policy,
          )?.label,
          fieldProps: {
            options: ACCOUNT_NAME_GENERATION_POLICY_OPTIONS,
            simpleValue: true,
            isClearable: true,
          },
        },
        {
          label: translate('Username generation policy'),
          key: 'plugin_options.username_generation_policy',
          component: SelectField,
          value: USERNAME_GENERATION_POLICY_OPTIONS.find(
            (op) => op.value === pluginOptions?.username_generation_policy,
          )?.label,
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
        },
        pluginOptions?.username_generation_policy == 'anonymized' && {
          label: translate('Username anonymized prefix'),
          key: 'plugin_options.username_anonymized_prefix',
          component: StringField,
          warnTooltip: getTooltip(
            pluginOptions?.username_anonymized_prefix,
            'walduruser_',
          ),
        },
        {
          label: translate('Initial UID number'),
          key: 'plugin_options.initial_uidnumber',
          component: NumberField,
          warnTooltip: getTooltip(pluginOptions?.initial_uidnumber, 100000),
        },
        {
          label: translate('Initial primary group number'),
          key: 'plugin_options.initial_primarygroup_number',
          component: NumberField,
          warnTooltip: getTooltip(
            pluginOptions?.initial_primarygroup_number,
            10000,
          ),
        },
        {
          label: translate('Home directory prefix'),
          key: 'plugin_options.homedir_prefix',
          component: StringField,
          warnTooltip: getTooltip(pluginOptions?.homedir_prefix, '/home/'),
        },
      ].filter(Boolean),
    [props],
  );

  return fields.map((field) => (
    <FormTable.Item
      key={field.key}
      label={field.label}
      value={field.value || get(props.offering, field.key, 'N/A')}
      warnTooltip={field.warnTooltip}
      disabled={!canCreateUser}
      actions={
        <FieldEditButton
          title={props.title}
          scope={props.offering}
          name={field.key}
          callback={props.callback}
          fieldComponent={field.component}
          fieldProps={field.fieldProps}
        />
      }
    />
  ));
};
