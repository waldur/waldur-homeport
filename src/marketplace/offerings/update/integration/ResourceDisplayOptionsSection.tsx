import { FC } from 'react';

import {
  BooleanEditField,
  EditFieldProvider,
  SelectEditField,
  StringEditField,
} from '@/form/editFields';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { getResourceActionOptions } from '@/marketplace/resources/actions/utils';
import { SITE_AGENT_PLUGIN } from '@/site-agent/constants';

import { OfferingEditPanelProps } from './types';
import { useUpdateOfferingIntegration } from './utils';

export const ResourceDisplayOptionsSection: FC<OfferingEditPanelProps> = (
  props,
) => {
  const { update } = useUpdateOfferingIntegration(
    props.offering,
    props.refetch,
  );

  return (
    <FormTable.Card
      title={translate('Resource display options')}
      className="card-bordered mb-7"
    >
      <FormTable>
        <EditFieldProvider scope={props.offering} callback={update}>
          <BooleanEditField
            name="plugin_options.highlight_backend_id_display"
            label={translate('Highlight backend ID display')}
          />
          <StringEditField
            name="plugin_options.backend_id_display_label"
            label={translate('Backend ID display label')}
          />
          <BooleanEditField
            name="plugin_options.require_effective_id_for_highlighted_display"
            label={translate('Require effective ID for highlighted display')}
            description={translate(
              'When enabled, highlighted backend ID display is only shown when the resource has an effective_id.',
            )}
          />
          <BooleanEditField
            name="plugin_options.expose_inference_playground"
            label={translate('Enable inference service view')}
          />
          <SelectEditField
            name="plugin_options.disabled_resource_actions"
            label={translate('Disabled resource actions')}
            isStaffOnly
            options={getResourceActionOptions()}
            isMulti
            simpleValue
          />
          {props.offering.type === SITE_AGENT_PLUGIN && (
            <BooleanEditField
              name="plugin_options.enable_display_of_order_actions_for_service_provider"
              label={translate(
                'Enable display of order actions for service provider',
              )}
            />
          )}
        </EditFieldProvider>
      </FormTable>
    </FormTable.Card>
  );
};
