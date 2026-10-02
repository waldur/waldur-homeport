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
import { TENANT_TYPE } from '@/openstack/constants';
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
          <BooleanEditField
            name="plugin_options.hide_api_keys_tab"
            label={translate('Hide API keys tab')}
          />
          {props.offering.type === SITE_AGENT_PLUGIN && (
            // A claim about the agent's backend, not a preference: one that
            // cannot govern keys fails every such command.
            <BooleanEditField
              name="plugin_options.enable_api_key_provisioning"
              label={translate('Manage API keys one by one')}
              description={translate(
                'Lets users request API keys, assign them, limit their usage and their models, and pause or delete them. Turn on only if the backend behind the site agent supports it, such as the Envoy AI Gateway; others, such as Ceph S3, fail those actions. Without it, keys can only be revealed and rotated.',
              )}
            />
          )}
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
          {props.offering.type === TENANT_TYPE && (
            <BooleanEditField
              name="plugin_options.show_ssh_key_loss_warning"
              label={translate('Show SSH key loss warning')}
              description={translate(
                'Show a warning about unrecoverable loss of the SSH private key on the VM order forms of this cloud.',
              )}
            />
          )}
        </EditFieldProvider>
      </FormTable>
    </FormTable.Card>
  );
};
