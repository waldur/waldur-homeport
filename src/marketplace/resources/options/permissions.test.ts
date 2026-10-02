import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ENV } from '@/core/config';
import { PermissionEnum } from '@/permissions/enums';

import { canUpdateResourceOptions } from './permissions';

describe('canUpdateResourceOptions', () => {
  const OPERATOR = 'CUSTOMER.SERVICE_PROVIDER_OPERATOR';
  const CONSUMER_EDITOR = 'PROJECT.OPTIONS_EDITOR';
  let originalRoles;

  beforeEach(() => {
    originalRoles = ENV.roles;
    ENV.roles = [
      ...originalRoles,
      {
        name: OPERATOR,
        permissions: [PermissionEnum.UPDATE_RESOURCE_OPTIONS],
      },
      {
        name: CONSUMER_EDITOR,
        permissions: [PermissionEnum.UPDATE_RESOURCE_OPTIONS],
      },
    ] as any;
  });

  afterEach(() => {
    ENV.roles = originalRoles;
  });

  const resource = (createsOrder = false) =>
    ({
      project_uuid: 'consumer_project',
      customer_uuid: 'consumer_org',
      provider_uuid: 'provider_a',
      offering_plugin_options: {
        create_orders_on_resource_option_change: createsOrder,
      },
    }) as any;

  const user = (role_name, scope_type, scope_uuid) =>
    ({
      is_staff: false,
      permissions: [{ role_name, scope_type, scope_uuid }],
    }) as any;

  const operator = user(OPERATOR, 'customer', 'provider_a');
  const consumer = user(CONSUMER_EDITOR, 'project', 'consumer_project');

  it('lets the provider organization edit options', () => {
    expect(canUpdateResourceOptions(operator, resource())).toBe(true);
  });

  it('does not ask the provider for order creation rights', () => {
    expect(canUpdateResourceOptions(operator, resource(true))).toBe(true);
  });

  it('does not extend to another provider', () => {
    expect(
      canUpdateResourceOptions(
        user(OPERATOR, 'customer', 'provider_b'),
        resource(),
      ),
    ).toBe(false);
  });

  it('still lets the consumer edit options', () => {
    expect(canUpdateResourceOptions(consumer, resource())).toBe(true);
  });

  it('asks the consumer for order creation rights when an order is made', () => {
    expect(canUpdateResourceOptions(consumer, resource(true))).toBe(false);
  });

  it('asks the consumer for order creation rights on a formula option', () => {
    expect(
      canUpdateResourceOptions(consumer, resource(), { forceOrder: true }),
    ).toBe(false);
  });

  it('does not ask the provider for order creation rights on a formula option', () => {
    expect(
      canUpdateResourceOptions(operator, resource(), { forceOrder: true }),
    ).toBe(true);
  });

  it('does not accept a role held on the ServiceProvider', () => {
    // Mastermind checks the offering's customer only.
    const serviceProviderRole = {
      is_staff: false,
      permissions: [
        {
          role_name: OPERATOR,
          scope_type: 'service_provider',
          scope_uuid: 'service_provider_a',
          customer_uuid: 'provider_a',
        },
      ],
    } as any;
    expect(canUpdateResourceOptions(serviceProviderRole, resource())).toBe(
      false,
    );
  });
});
