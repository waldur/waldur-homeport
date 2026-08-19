import { MergedPluginOptions, OrderDetails } from 'waldur-js-client';

import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { SITE_AGENT_PLUGIN } from '@/site-agent/constants';

export const checkOrderCanBeApproved = (user, customer, project) =>
  hasPermission(user, {
    permission: PermissionEnum.APPROVE_ORDER,
    customerId: customer?.uuid,
    projectId: project?.uuid,
  });

/**
 * Site agent offerings expect the agent to review orders, so provider actions
 * stay hidden unless the offering opts in.
 *
 * Every surface offering approve/reject must apply this identically — showing
 * the actions in a table but not on the order the row links to leaves a
 * provider unable to act where they verified the order. Callers holding a
 * fetched offering pass its `plugin_options`; the order tables rely on the
 * `offering_plugin_options` carried on the row itself.
 */
export const shouldHideProviderActions = (
  order: Pick<OrderDetails, 'offering_type' | 'offering_plugin_options'>,
  pluginOptions?: MergedPluginOptions | null,
) =>
  order.offering_type === SITE_AGENT_PLUGIN &&
  !(pluginOptions ?? order.offering_plugin_options)
    ?.enable_display_of_order_actions_for_service_provider;
