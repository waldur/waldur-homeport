import { BillingUnit, OrderDetails, User } from 'waldur-js-client';

import { BadgeVariant } from 'waldur-ui';

import { translate } from '@/i18n';
import { PermissionEnum } from '@/permissions/enums';
import { checkScope } from '@/permissions/hasPermission';
import { checkCanAccessServiceProvider } from '@/workspace/selectors';

interface OrderType {
  label: string;
  type:
    | 'create'
    | 'renew'
    | 'limits_update'
    | 'options_update'
    | 'switch_plan'
    | 'terminate'
    | 'restore';
  variant: BadgeVariant;
}

export const getOrderType = (order: OrderDetails): OrderType => {
  const attributes = order.attributes as Record<string, any>;
  switch (order.type) {
    case 'Create':
      return {
        label: translate('Provision new resource'),
        type: 'create',
        variant: 'success',
      };
    case 'Update':
      // Match the processor logic for determining update type
      if (attributes.action === 'renew') {
        return {
          label: translate('Renew prepaid resource'),
          type: 'renew',
          variant: 'neutral',
        };
      } else if (attributes.old_limits) {
        return {
          label: translate('Update resource limits'),
          type: 'limits_update',
          variant: 'purple',
        };
      } else if (attributes.new_options) {
        return {
          label: translate('Update resource options'),
          type: 'options_update',
          variant: 'blue',
        };
      } else {
        return {
          label: translate('Switch resource plan'),
          type: 'switch_plan',
          variant: 'success',
        };
      }
    case 'Terminate':
      return {
        label: translate('Terminate an existing resource'),
        type: 'terminate',
        variant: 'danger',
      };
    case 'Restore':
      return {
        label: translate('Restore a terminated resource'),
        type: 'restore',
        variant: 'success',
      };
    default:
      return { label: 'N/A', type: null, variant: 'neutral' };
  }
};

interface MessagingOrder {
  consumer_message?: string | null;
  consumer_message_attachment?: string | null;
  provider_message_updated_at?: string | null;
  consumer_message_updated_at?: string | null;
}

export const hasFreshConsumerResponse = (order: MessagingOrder): boolean => {
  if (!order.consumer_message && !order.consumer_message_attachment) {
    return false;
  }
  const providerTs = order.provider_message_updated_at;
  const consumerTs = order.consumer_message_updated_at;
  if (providerTs && consumerTs) {
    return consumerTs >= providerTs;
  }
  // Orders predating the timestamps: a provider-side timestamp alone means the
  // provider wrote after the consumer's untimestamped response.
  return !providerTs;
};

export const getPlanUnitAbbr = (planUnit: BillingUnit) =>
  planUnit === 'hour'
    ? translate('/hr')
    : planUnit === 'day'
      ? translate('/day')
      : planUnit === 'half_month'
        ? translate('/half month')
        : planUnit === 'month'
          ? translate('/mo')
          : planUnit === 'quarter'
            ? translate('/quarter')
            : '/' + planUnit;

/**
 * Can the user read a resource through the consumer endpoints? They serve
 * staff and support, RESOURCE.LIST on the resource's organization or project,
 * and a role on the resource itself; a role held only on the provider side
 * does not count.
 */
export const canViewConsumerResource = (
  user: Pick<User, 'is_staff' | 'is_support' | 'permissions'> | undefined,
  {
    customerUuid,
    projectUuid,
    resourceUuid,
  }: { customerUuid?: string; projectUuid?: string; resourceUuid?: string },
): boolean => {
  if (!user) return false;
  if (user.is_staff || user.is_support) return true;
  if (
    checkScope(user, 'customer', customerUuid, PermissionEnum.LIST_RESOURCES) ||
    checkScope(user, 'project', projectUuid, PermissionEnum.LIST_RESOURCES)
  ) {
    return true;
  }
  return (user.permissions ?? []).some(
    ({ scope_type, scope_uuid }) =>
      scope_type === 'resource' &&
      !!resourceUuid &&
      scope_uuid === resourceUuid,
  );
};

/**
 * Should links to the order's resource open the provider's view of it? Only
 * when the user cannot read it through the consumer endpoints, which answer
 * them with 404, but can open the provider workspace.
 */
export const shouldLinkProviderResource = (
  user: User | undefined,
  order: Pick<
    OrderDetails,
    | 'customer_uuid'
    | 'project_uuid'
    | 'marketplace_resource_uuid'
    | 'provider_uuid'
  >,
): boolean =>
  !!user &&
  !!order &&
  !canViewConsumerResource(user, {
    customerUuid: order.customer_uuid,
    projectUuid: order.project_uuid,
    resourceUuid: order.marketplace_resource_uuid,
  }) &&
  checkCanAccessServiceProvider({ uuid: order.provider_uuid }, user);
