import { Resource, User } from 'waldur-js-client';

import { PermissionEnum } from '@/permissions/enums';
import { checkScope, hasAllPermissions } from '@/permissions/hasPermission';

type OptionsResource = Pick<
  Resource,
  'project_uuid' | 'customer_uuid' | 'provider_uuid' | 'offering_plugin_options'
>;

/**
 * May the user change this resource's options? Mirrors Mastermind's
 * `update_options`, which accepts RESOURCE.UPDATE_OPTIONS on the consumer's
 * project or organization and on the provider organization (the offering's
 * customer).
 *
 * The provider side is the organization itself only: Mastermind checks the
 * offering's customer, not its ServiceProvider, so a role granted on the
 * ServiceProvider would see the button and be refused.
 *
 * Some offerings apply option changes through a marketplace order, and a
 * formula option is always ordered (`forceOrder`). The consumer then also
 * needs ORDER.CREATE, but the provider does not: creating orders is a
 * consumer-side right a provider never holds in the consumer's project, so
 * Mastermind exempts the provider from it.
 */
export const canUpdateResourceOptions = (
  user: Pick<User, 'is_staff' | 'permissions'>,
  resource: OptionsResource,
  { forceOrder = false }: { forceOrder?: boolean } = {},
): boolean => {
  if (
    resource.provider_uuid &&
    checkScope(
      user,
      'customer',
      resource.provider_uuid,
      PermissionEnum.UPDATE_RESOURCE_OPTIONS,
    )
  ) {
    return true;
  }
  const createsOrder =
    forceOrder ||
    Boolean(
      (resource.offering_plugin_options as any)
        ?.create_orders_on_resource_option_change,
    );
  return hasAllPermissions(
    user,
    createsOrder
      ? [PermissionEnum.UPDATE_RESOURCE_OPTIONS, PermissionEnum.CREATE_ORDER]
      : [PermissionEnum.UPDATE_RESOURCE_OPTIONS],
    {
      projectId: resource.project_uuid,
      customerId: resource.customer_uuid,
    },
  );
};
