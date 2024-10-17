import { get } from 'lodash';
import { FunctionComponent, useMemo } from 'react';

import { NumberField, SelectField } from '@waldur/form';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { FieldEditButton } from '@waldur/marketplace/offerings/update/integration/FieldEditButton';
import { OfferingEditPanelFormProps } from '@waldur/marketplace/offerings/update/integration/types';

import { DYNAMIC_STORAGE_MODE, FIXED_STORAGE_MODE } from './constants';

const STORAGE_MODE_OPTIONS = [
  {
    label: translate('Fixed — use common storage quota'),
    value: FIXED_STORAGE_MODE,
  },
  {
    label: translate(
      'Dynamic — use separate volume types for tracking pricing',
    ),
    value: DYNAMIC_STORAGE_MODE,
  },
];

export const OpenStackPluginOptionsForm: FunctionComponent<
  OfferingEditPanelFormProps
> = (props) => {
  const fields = useMemo(
    () =>
      [
        {
          label: translate('Storage mode'),
          key: 'plugin_options.storage_mode',
          component: SelectField,
          value: STORAGE_MODE_OPTIONS.find(
            (op) => op.value === props.offering.plugin_options?.storage_mode,
          )?.label,
          fieldProps: {
            options: STORAGE_MODE_OPTIONS,
            simpleValue: true,
            required: true,
            isClearable: false,
          },
        },
        {
          label: translate('Default internal network MTU'),
          key: 'plugin_options.default_internal_network_mtu',
          component: NumberField,
        },
        props.offering.plugin_options?.storage_mode == 'dynamic' && {
          label: translate('Snapshot size limit'),
          key: 'plugin_options.snapshot_size_limit_gb',
          component: NumberField,
          description: translate(
            'Additional space to apply to storage quota to be used by snapshots.',
          ),
          fieldProps: { unit: 'GB' },
        },
      ].filter(Boolean),
    [props],
  );

  return fields.map((field) => (
    <FormTable.Item
      key={field.key}
      label={field.label}
      description={field.description}
      value={field.value || get(props.offering, field.key, 'N/A')}
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
