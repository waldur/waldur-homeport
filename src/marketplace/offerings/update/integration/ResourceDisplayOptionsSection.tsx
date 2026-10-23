import { FC, useMemo } from 'react';

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
  const pluginOptions = props.offering.plugin_options;
  const keyManagement =
    props.offering.type === SITE_AGENT_PLUGIN &&
    Boolean(pluginOptions?.enable_api_key_provisioning);
  // The key options read as the backend applies them when unset: key limits
  // on, per-key daily usage off.
  const keyOptionsScope = useMemo(
    () => ({
      ...props.offering,
      plugin_options: {
        ...pluginOptions,
        api_key_limits: pluginOptions?.api_key_limits !== false,
        api_key_daily_usage: pluginOptions?.api_key_daily_usage === true,
      },
    }),
    [props.offering, pluginOptions],
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
                'Lets users request API keys, assign them, limit their usage and their models, and pause or delete them. New resources start without keys instead of with two shared ones; existing resources keep theirs. Turn on only if the backend behind the site agent supports it, such as the Envoy AI Gateway; others, such as Ceph S3, fail those actions. Without it, keys can only be revealed and rotated.',
              )}
            />
          )}
          {keyManagement && (
            <EditFieldProvider scope={keyOptionsScope} callback={update}>
              <BooleanEditField
                name="plugin_options.api_key_limits"
                label={translate('Let users limit API keys')}
                description={translate(
                  'Lets users set spending limits on each API key, within the resource’s own limits. Turned off, no new key limit is accepted; limits keys already hold stay until cleared.',
                )}
              />
              {/* A claim about the agent, as above: nothing checks it. */}
              <BooleanEditField
                name="plugin_options.api_key_daily_usage"
                label={translate('Site agent reports API key usage per day')}
                description={translate(
                  'Only then can keys be limited per day, week, quarter or year, where a component offers those periods; otherwise keys are limited per month, and all-time where a component offers it. Turn on only if the site agent reports each key’s usage per day, or those limits are never reached.',
                )}
              />
            </EditFieldProvider>
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
