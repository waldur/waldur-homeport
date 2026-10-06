import { OpenStackSubNet } from 'waldur-js-client';

import { translate } from '@/i18n';
import { hasRoleOnOwner } from '@/openstack/openstack-network/actions/validators';
import { ActionContext } from '@/resource/actions/types';

type SubnetOwner = Pick<
  OpenStackSubNet,
  'tenant_name' | 'tenant_is_managed' | 'project_uuid' | 'customer_uuid'
>;

/**
 * Disables the actions only a subnet's owner can take: editing, connecting or
 * disconnecting it, synchronising and deleting it.
 *
 * The subnet of a network shared over RBAC is listed in the tenant it was
 * shared with. If the owner is an OpenStack project Waldur does not manage, the
 * backend refuses these for everyone. Otherwise a user with no role at all on
 * the subnet's project or organization can only be seeing it through the
 * share. Unlike networks, a subnet carries no per-user share direction, so the
 * role check stands alone; staff and support keep the actions, as they do on
 * networks.
 */
export const validateSubnetOwnerAction = (
  ctx: ActionContext<SubnetOwner>,
): string => {
  const subnet = ctx.resource;
  if (subnet.tenant_is_managed === false) {
    return translate(
      'This subnet is shared by your cloud provider. Only the provider can change it.',
    );
  }
  if (
    !ctx.user?.is_staff &&
    !ctx.user?.is_support &&
    subnet.project_uuid &&
    !hasRoleOnOwner(ctx.user, subnet)
  ) {
    return translate(
      'This subnet is shared with you by {tenant}. Only its owner can change it.',
      { tenant: subnet.tenant_name },
    );
  }
};
