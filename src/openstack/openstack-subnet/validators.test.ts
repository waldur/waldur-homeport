import { describe, expect, it } from 'vitest';

import { validateSubnetOwnerAction } from './validators';

const consumer = {
  is_staff: false,
  is_support: false,
  permissions: [{ scope_uuid: 'consumer-project' }],
} as any;

const subnet = (extra = {}) =>
  ({
    tenant_name: 'Owner',
    tenant_is_managed: true,
    project_uuid: 'owner-project',
    customer_uuid: 'owner-org',
    ...extra,
  }) as any;

describe('validateSubnetOwnerAction', () => {
  it('refuses everyone on a subnet the provider shares', () => {
    expect(
      validateSubnetOwnerAction({
        resource: subnet({ tenant_is_managed: false }),
        user: { is_staff: true } as any,
      }),
    ).toBe(
      'This subnet is shared by your cloud provider. Only the provider can change it.',
    );
  });

  it('names the tenant a subnet was shared by for a user without a role there', () => {
    expect(
      validateSubnetOwnerAction({ resource: subnet(), user: consumer }),
    ).toBe(
      'This subnet is shared with you by Owner. Only its owner can change it.',
    );
  });

  it('keeps the actions for a user with a role on the owning project', () => {
    expect(
      validateSubnetOwnerAction({
        resource: subnet(),
        user: { ...consumer, permissions: [{ scope_uuid: 'owner-project' }] },
      }),
    ).toBeUndefined();
  });

  it('keeps the actions for a role on the owning organization', () => {
    expect(
      validateSubnetOwnerAction({
        resource: subnet(),
        user: { ...consumer, permissions: [{ scope_uuid: 'owner-org' }] },
      }),
    ).toBeUndefined();
  });

  it('keeps the actions for staff and support on a managed owner', () => {
    expect(
      validateSubnetOwnerAction({
        resource: subnet(),
        user: { is_staff: true, permissions: [] } as any,
      }),
    ).toBeUndefined();
    expect(
      validateSubnetOwnerAction({
        resource: subnet(),
        user: { is_support: true, permissions: [] } as any,
      }),
    ).toBeUndefined();
  });

  it('does not disable on a guess when the roles are not loaded', () => {
    expect(
      validateSubnetOwnerAction({
        resource: subnet(),
        user: { is_staff: false } as any,
      }),
    ).toBeUndefined();
  });
});
