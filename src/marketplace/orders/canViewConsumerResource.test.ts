import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';
import { PermissionEnum } from '@/permissions/enums';

import { canViewConsumerResource, shouldLinkProviderResource } from './utils';

const scope = {
  customerUuid: 'consumer-uuid',
  projectUuid: 'project-uuid',
  resourceUuid: 'resource-uuid',
};

const userWith = (permissions) =>
  ({ is_staff: false, is_support: false, permissions }) as any;

describe('canViewConsumerResource', () => {
  beforeEach(() => {
    vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
      { name: 'LISTER', permissions: [PermissionEnum.LIST_RESOURCES] },
      { name: 'OTHER', permissions: [PermissionEnum.UPDATE_CUSTOMER] },
    ] as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('is false without a user', () => {
    expect(canViewConsumerResource(undefined, scope)).toBe(false);
  });

  it('is true for staff and support', () => {
    expect(
      canViewConsumerResource({ ...userWith([]), is_staff: true }, scope),
    ).toBe(true);
    expect(
      canViewConsumerResource({ ...userWith([]), is_support: true }, scope),
    ).toBe(true);
  });

  it.each([
    ['customer', 'consumer-uuid'],
    ['project', 'project-uuid'],
  ])(
    'is true for RESOURCE.LIST on the consumer %s',
    (scope_type, scope_uuid) => {
      expect(
        canViewConsumerResource(
          userWith([{ scope_type, scope_uuid, role_name: 'LISTER' }]),
          scope,
        ),
      ).toBe(true);
    },
  );

  it('is false for a consumer role without RESOURCE.LIST', () => {
    expect(
      canViewConsumerResource(
        userWith([
          {
            scope_type: 'customer',
            scope_uuid: 'consumer-uuid',
            role_name: 'OTHER',
          },
        ]),
        scope,
      ),
    ).toBe(false);
  });

  it('is true for a role on the resource itself', () => {
    expect(
      canViewConsumerResource(
        userWith([
          {
            scope_type: 'resource',
            scope_uuid: 'resource-uuid',
            role_name: 'OTHER',
          },
        ]),
        scope,
      ),
    ).toBe(true);
  });

  it('is false for a role held only on the provider organization', () => {
    expect(
      canViewConsumerResource(
        userWith([
          {
            scope_type: 'customer',
            scope_uuid: 'provider-uuid',
            role_name: 'LISTER',
          },
          {
            scope_type: 'service_provider',
            scope_uuid: 'sp-uuid',
            customer_uuid: 'provider-uuid',
            role_name: 'LISTER',
          },
        ]),
        scope,
      ),
    ).toBe(false);
  });
});

describe('shouldLinkProviderResource', () => {
  const order = {
    customer_uuid: 'consumer',
    project_uuid: 'project',
    marketplace_resource_uuid: 'resource',
    provider_uuid: 'provider',
    offering_uuid: 'offering-a',
  };
  const offeringManager = (offering: string) =>
    ({
      is_staff: false,
      is_support: false,
      permissions: [
        {
          scope_type: 'offering',
          scope_uuid: offering,
          customer_uuid: 'provider',
          role_name: 'OFFERING.MANAGER',
        },
      ],
    }) as any;

  it('sends the offering manager to the provider view of the resource', () => {
    expect(
      shouldLinkProviderResource(offeringManager('offering-a'), order),
    ).toBe(true);
  });

  it('does not for the manager of another offering', () => {
    expect(
      shouldLinkProviderResource(offeringManager('offering-b'), order),
    ).toBe(false);
  });
});
