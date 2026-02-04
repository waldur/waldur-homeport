import { FC, useMemo } from 'react';

import { SelectField, StringField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { getResourceActionOptions } from '@waldur/marketplace/resources/actions/utils';
import { SITE_AGENT_PLUGIN } from '@waldur/site-agent/constants';

import {
  DefaultOfferingEditPanel,
  OfferingEditField,
} from '../DefaultOfferingEditPanel';

import { OfferingEditPanelProps } from './types';
import { useUpdateOfferingIntegration } from './utils';

export const ResourceDisplayOptionsSection: FC<OfferingEditPanelProps> = (
  props,
) => {
  const { update } = useUpdateOfferingIntegration(
    props.offering,
    props.refetch,
  );

  const fields: OfferingEditField[] = useMemo(() => {
    const baseFields: OfferingEditField[] = [
      {
        label: translate('Highlight backend ID display'),
        key: 'plugin_options.highlight_backend_id_display',
        component: AwesomeCheckboxField,
      },
      {
        label: translate('Backend ID display label'),
        key: 'plugin_options.backend_id_display_label',
        component: StringField,
      },
      {
        label: translate('Disable resource actions'),
        key: 'plugin_options.disabled_resource_actions',
        component: SelectField,
        fieldProps: {
          options: getResourceActionOptions(),
          isMulti: true,
          simpleValue: true,
        },
      },
    ];

    if (props.offering.type === SITE_AGENT_PLUGIN) {
      baseFields.push({
        label: translate(
          'Enable display of order actions for service provider',
        ),
        key: 'plugin_options.enable_display_of_order_actions_for_service_provider',
        component: AwesomeCheckboxField,
      });
    }

    return baseFields;
  }, [props.offering.type]);

  return (
    <FormTable.Card
      title={translate('Resource display options')}
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
