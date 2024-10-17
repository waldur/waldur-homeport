import { FC, useMemo } from 'react';

import { CheckOrX } from '@waldur/core/CheckOrX';
import { NumberField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { DateField } from '@waldur/form/DateField';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { getPluginOptionsForm } from '@waldur/marketplace/common/registry';

import { FieldEditButton } from './FieldEditButton';
import { OfferingEditPanelProps } from './types';
import { useUpdateOfferingIntegration } from './utils';

const TITLE = translate('Lifecycle policy');

export const LifecyclePolicySection: FC<OfferingEditPanelProps> = (props) => {
  const { update } = useUpdateOfferingIntegration(
    props.offering,
    props.refetch,
  );
  const PluginOptionsForm = getPluginOptionsForm(props.offering.type);

  const fields = useMemo(
    () => [
      {
        label: translate('Auto approve in service provider projects'),
        key: 'plugin_options.auto_approve_in_service_provider_projects',
        value: (
          <CheckOrX
            value={
              props.offering.plugin_options
                ?.auto_approve_in_service_provider_projects
            }
          />
        ),
        component: AwesomeCheckboxField,
      },
      {
        label: translate('Resource termination date is required'),
        key: 'plugin_options.is_resource_termination_date_required',
        value: (
          <CheckOrX
            value={
              props.offering.plugin_options
                ?.is_resource_termination_date_required
            }
          />
        ),
        component: AwesomeCheckboxField,
      },
      {
        label: translate('Default resource termination offset in days'),
        key: 'plugin_options.default_resource_termination_offset_in_days',
        value:
          props.offering.plugin_options
            ?.default_resource_termination_offset_in_days,
        component: NumberField,
      },
      {
        label: translate('Maximal resource termination offset in days'),
        key: 'plugin_options.max_resource_termination_offset_in_days',
        value:
          props.offering.plugin_options
            ?.max_resource_termination_offset_in_days,
        component: NumberField,
      },
      {
        label: translate('Latest date for resource termination'),
        key: 'plugin_options.latest_date_for_resource_termination',
        value:
          props.offering.plugin_options?.latest_date_for_resource_termination,
        component: DateField,
      },
    ],
    [props],
  );

  return (
    <FormTable.Card title={TITLE} className="card-bordered mb-7">
      <FormTable>
        {PluginOptionsForm &&
          fields.map((field) => (
            <FormTable.Item
              key={field.key}
              label={field.label}
              value={field.value || 'N/A'}
              actions={
                <FieldEditButton
                  title={TITLE}
                  scope={props.offering}
                  name={field.key}
                  callback={update}
                  fieldComponent={field.component}
                  hideLabel={field.component === AwesomeCheckboxField}
                />
              }
            />
          ))}
      </FormTable>
    </FormTable.Card>
  );
};
