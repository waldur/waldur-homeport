import { FC } from 'react';

import { NumberField } from '@waldur/form';
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
