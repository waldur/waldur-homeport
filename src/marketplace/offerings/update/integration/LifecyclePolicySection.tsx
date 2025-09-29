import { FC } from 'react';

import { NumberField, StringField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { DateField } from '@waldur/form/DateField';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';

import {
  DefaultOfferingEditPanel,
  OfferingEditField,
} from '../DefaultOfferingEditPanel';

import { OfferingEditPanelProps } from './types';
import { useUpdateOfferingIntegration } from './utils';

const fields: OfferingEditField[] = [
  {
    label: translate('Auto approve in service provider projects'),
    key: 'plugin_options.auto_approve_in_service_provider_projects',
    component: AwesomeCheckboxField,
  },
  {
    label: translate('Resource termination date is required'),
    key: 'plugin_options.is_resource_termination_date_required',
    component: AwesomeCheckboxField,
  },
  {
    label: translate('Default resource termination offset in days'),
    key: 'plugin_options.default_resource_termination_offset_in_days',
    component: NumberField,
  },
  {
    label: translate('Maximal resource termination offset in days'),
    key: 'plugin_options.max_resource_termination_offset_in_days',
    component: NumberField,
  },
  {
    label: translate('Latest date for resource termination'),
    key: 'plugin_options.latest_date_for_resource_termination',
    component: DateField,
  },
  {
    label: translate('Supports downscaling'),
    key: 'plugin_options.supports_downscaling',
    component: AwesomeCheckboxField,
  },
  {
    label: translate('Supports pausing'),
    key: 'plugin_options.supports_pausing',
    component: AwesomeCheckboxField,
  },
  {
    label: translate('Minimal team count for resource provisioning'),
    key: 'plugin_options.minimal_team_count_for_provisioning',
    component: NumberField,
  },
  {
    label: translate('Required team role for resource provisioning'),
    key: 'plugin_options.required_team_role_for_provisioning',
    component: StringField,
  },
  {
    label: translate('Order supports comments and metadata'),
    key: 'plugin_options.order_supports_comments_and_metadata',
    component: AwesomeCheckboxField,
  },
  {
    label: translate(
      'If set to True, pricing and components tab would be concealed',
    ),
    key: 'plugin_options.conceal_billing_data',
    component: AwesomeCheckboxField,
  },
  {
    label: translate(
      'Maximal number of offering resources allowed per project',
    ),
    key: 'plugin_options.maximal_resource_count_per_project',
    component: NumberField,
  },
];

export const LifecyclePolicySection: FC<OfferingEditPanelProps> = (props) => {
  const { update } = useUpdateOfferingIntegration(
    props.offering,
    props.refetch,
  );

  return (
    <FormTable.Card
      title={translate('Lifecycle policy')}
      className="card-bordered mb-7"
    >
      <FormTable>
        <DefaultOfferingEditPanel
          {...props}
          fields={fields}
          callback={update}
        />
      </FormTable>
    </FormTable.Card>
  );
};
