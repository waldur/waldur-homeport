import { OrderFlowSource } from 'waldur-js-client';

/** Where in the offering's edit view a setting is changed: the page tab
 * and, inside it, the section's own tab. */
export interface SettingLocation {
  tab: string;
  section?: string;
}

const OPERATIONS = 'lifecycle-policy';

// The Operations tab each plugin option is edited on. An option missing
// here is still named in the drawing, only not linked.
const PLUGIN_OPTION_SECTIONS: Record<string, string> = {
  restricted_to_roles: 'orders',
  auto_approve_for_roles: 'orders',
  auto_approve_marketplace_script: 'orders',
  auto_approve_in_service_provider_projects: 'orders',
  disable_autoapprove: 'orders',
  enable_purchase_order_upload: 'orders',
  require_purchase_order_upload: 'orders',
  enable_provider_consumer_messaging: 'orders',
  is_resource_termination_date_required: 'lifecycle',
  default_resource_termination_offset_in_days: 'lifecycle',
  max_resource_termination_offset_in_days: 'lifecycle',
  latest_date_for_resource_termination: 'lifecycle',
  can_restore_resource: 'lifecycle',
  create_orders_on_resource_option_change: 'lifecycle',
  minimal_team_count_for_provisioning: 'provisioning',
  required_team_role_for_provisioning: 'provisioning',
  maximal_resource_count_per_project: 'provisioning',
};

export const settingLocation = (
  source: OrderFlowSource,
): SettingLocation | undefined => {
  if (!source.editable) return undefined;
  if (source.kind === 'plugin_option') {
    const section = PLUGIN_OPTION_SECTIONS[source.field];
    return section ? { tab: OPERATIONS, section } : undefined;
  }
  if (source.field.startsWith('secret_options.')) {
    return { tab: 'provisioning-configuration' };
  }
  if (source.field.startsWith('components.')) {
    return { tab: 'components' };
  }
  return undefined;
};
