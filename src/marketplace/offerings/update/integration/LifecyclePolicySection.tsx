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
    description: translate(
      'Automatically approves orders in service provider projects without manual approval',
    ),
  },
  {
    label: translate('Resource termination date is required'),
    key: 'plugin_options.is_resource_termination_date_required',
    component: AwesomeCheckboxField,
    description: translate(
      'When enabled, uses default and maximal offset settings below to control date selection',
    ),
  },
  {
    label: translate('Default resource termination offset in days'),
    key: 'plugin_options.default_resource_termination_offset_in_days',
    component: NumberField,
    description: translate(
      'Used when termination date is required - sets default date selection',
    ),
  },
  {
    label: translate('Maximal resource termination offset in days'),
    key: 'plugin_options.max_resource_termination_offset_in_days',
    component: NumberField,
    description: translate(
      'Used when termination date is required - limits maximum selectable date',
    ),
  },
  {
    label: translate('Latest date for resource termination'),
    key: 'plugin_options.latest_date_for_resource_termination',
    component: DateField,
    description: translate(
      'Absolute latest date allowed for resource termination regardless of offset settings',
    ),
  },
  {
    label: translate('Supports downscaling'),
    key: 'plugin_options.supports_downscaling',
    component: AwesomeCheckboxField,
    description: translate(
      'Enables downscaling operations for resources created from this offering',
    ),
  },
  {
    label: translate('Supports pausing'),
    key: 'plugin_options.supports_pausing',
    component: AwesomeCheckboxField,
    description: translate(
      'Enables pausing/unpausing operations for resources created from this offering',
    ),
  },
  {
    label: translate('Minimal team count for resource provisioning'),
    key: 'plugin_options.minimal_team_count_for_provisioning',
    component: NumberField,
    description: translate(
      'Minimum number of team members required in project to provision resources',
    ),
  },
  {
    label: translate('Required team role for resource provisioning'),
    key: 'plugin_options.required_team_role_for_provisioning',
    component: StringField,
    description: translate(
      'Specific team role required for users to provision resources from this offering',
    ),
  },
  {
    label: translate('Enable purchase order upload'),
    key: 'plugin_options.enable_purchase_order_upload',
    component: AwesomeCheckboxField,
    description: translate(
      'Shows purchase order upload dialog during order approval process',
    ),
  },
  {
    label: translate('Require purchase order upload'),
    key: 'plugin_options.require_purchase_order_upload',
    component: AwesomeCheckboxField,
    description: translate(
      'Makes purchase order upload mandatory when "Enable purchase order upload" is active',
    ),
  },

  {
    label: translate('Conceal billing data'),
    key: 'plugin_options.conceal_billing_data',
    component: AwesomeCheckboxField,
    description: translate(
      'Hides pricing and components tabs in offering details to conceal billing information',
    ),
  },
  {
    label: translate('Maximal resource count per project'),
    key: 'plugin_options.maximal_resource_count_per_project',
    component: NumberField,
    description: translate(
      'Limits the maximum number of resources from this offering allowed per project',
    ),
  },
  {
    label: translate('Create orders on resource option change'),
    key: 'plugin_options.create_orders_on_resource_option_change',
    component: AwesomeCheckboxField,
    description: translate(
      'Automatically creates new orders when configuration options of related resources are modified',
    ),
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
