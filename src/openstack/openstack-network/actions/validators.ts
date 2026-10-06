import { OpenStackNetwork } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ActionContext } from '@/resource/actions/types';

/** Mirrors the backend's check for these actions: any role on the network's
 * project or organization, whatever it is. Unknown permissions count as a role,
 * so an action is never disabled on a guess. */
export const hasRoleOnOwner = (
  user: ActionContext['user'],
  network: Pick<OpenStackNetwork, 'project_uuid' | 'customer_uuid'>,
): boolean =>
  !user?.permissions ||
  user.permissions.some(
    (permission) =>
      permission.scope_uuid === network.project_uuid ||
      permission.scope_uuid === network.customer_uuid,
  );

/**
 * Disables the actions only a network's owner can take: changing, sharing,
 * synchronising or deleting it, and adding subnets to it.
 *
 * A network can be listed in a tenant it was only shared with over RBAC. Its
 * owner may be an OpenStack project Waldur does not manage -- the backend then
 * refuses every change -- or another tenant. For the latter the backend lets
 * through anyone with a role on the network's project or organization, so the
 * actions are disabled only for a user with neither, on a share the backend
 * reports to them as `inbound`. `inbound` alone is not enough: it is also what
 * a plain member of the owning project sees.
 */
export const validateNetworkOwnerAction = (
  ctx: ActionContext<
    Pick<
      OpenStackNetwork,
      | 'tenant_is_managed'
      | 'tenant_name'
      | 'rbac_policies'
      | 'project_uuid'
      | 'customer_uuid'
    >
  >,
): string => {
  const network = ctx.resource;
  if (network.tenant_is_managed === false) {
    return translate(
      'This network is shared by your cloud provider. Only the provider can change it.',
    );
  }
  const sharedInbound = network.rbac_policies?.some(
    (policy) => policy.direction === 'inbound',
  );
  if (sharedInbound && !hasRoleOnOwner(ctx.user, network)) {
    return translate(
      'This network is shared with you by {tenant}. Only its owner can change it.',
      { tenant: network.tenant_name },
    );
  }
};
