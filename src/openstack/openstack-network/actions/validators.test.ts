import { describe, expect, it } from 'vitest';

import { validateNetworkOwnerAction } from './validators';

const user = { is_staff: false, is_support: false, permissions: [] } as any;

const policy = (direction: 'inbound' | 'outbound') => ({ direction }) as any;

const check = (network) =>
  validateNetworkOwnerAction({ resource: network, user });

describe('validateNetworkOwnerAction', () => {
  it('allows the owner to act on its own network', () => {
    expect(
      check({
        tenant_is_managed: true,
        tenant_name: 'Owner',
        rbac_policies: [],
      }),
    ).toBeUndefined();
  });

  it('allows a user who manages the network it shares', () => {
    expect(
      check({
        tenant_is_managed: true,
        tenant_name: 'Owner',
        rbac_policies: [policy('outbound')],
      }),
    ).toBeUndefined();
  });

  it('explains a network the provider shares from a project Waldur does not manage', () => {
    expect(
      check({
        tenant_is_managed: false,
        tenant_name: 'admin',
        rbac_policies: [policy('inbound')],
      }),
    ).toBe(
      'This network is shared by your cloud provider. Only the provider can change it.',
    );
  });

  it('refuses the unmanaged owner even to staff', () => {
    expect(
      validateNetworkOwnerAction({
        resource: { tenant_is_managed: false, tenant_name: 'admin' } as any,
        user: { ...user, is_staff: true },
      }),
    ).toBe(
      'This network is shared by your cloud provider. Only the provider can change it.',
    );
  });

  it('keeps the actions for a member of the owning project', () => {
    expect(
      validateNetworkOwnerAction({
        resource: {
          tenant_is_managed: true,
          tenant_name: 'Owner',
          project_uuid: 'owner-project',
          customer_uuid: 'owner-org',
          rbac_policies: [policy('inbound')],
        } as any,
        user: {
          ...user,
          permissions: [
            { scope_uuid: 'owner-project', role_name: 'PROJECT.MEMBER' },
          ],
        },
      }),
    ).toBeUndefined();
  });

  it('keeps the actions for any role on the owning organization', () => {
    expect(
      validateNetworkOwnerAction({
        resource: {
          tenant_is_managed: true,
          tenant_name: 'Owner',
          project_uuid: 'owner-project',
          customer_uuid: 'owner-org',
          rbac_policies: [policy('inbound')],
        } as any,
        user: { ...user, permissions: [{ scope_uuid: 'owner-org' }] },
      }),
    ).toBeUndefined();
  });

  it('does not disable on a guess when the roles are not loaded', () => {
    expect(
      validateNetworkOwnerAction({
        resource: {
          tenant_is_managed: true,
          tenant_name: 'Owner',
          rbac_policies: [policy('inbound')],
        } as any,
        user: { is_staff: false } as any,
      }),
    ).toBeUndefined();
  });

  it('names the tenant a network was shared by', () => {
    expect(
      check({
        tenant_is_managed: true,
        tenant_name: 'Research LAN',
        rbac_policies: [policy('inbound')],
      }),
    ).toBe(
      'This network is shared with you by Research LAN. Only its owner can change it.',
    );
  });

  it('leaves networks loaded without these fields alone', () => {
    expect(check({ name: 'net' })).toBeUndefined();
  });
});
