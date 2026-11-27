import { describe, expect, it } from 'vitest';

import { RoleEnum } from '@/permissions/enums';

import { canManageProvider } from './ManageProviderLink';

const user = (overrides = {}) =>
  ({
    uuid: 'user-uuid',
    is_staff: false,
    is_support: false,
    permissions: [],
    ...overrides,
  }) as any;

const ownerOf = (customerUuid: string) =>
  user({
    permissions: [
      {
        scope_type: 'customer',
        scope_uuid: customerUuid,
        role_name: RoleEnum.CUSTOMER_OWNER,
      },
    ],
  });

describe('canManageProvider', () => {
  it('lets the organization owner into the workspace', () => {
    expect(canManageProvider(ownerOf('provider'), 'provider')).toBe(true);
  });

  it('keeps out the owner of another organization', () => {
    expect(canManageProvider(ownerOf('other'), 'provider')).toBe(false);
  });

  it('keeps out a user without a role', () => {
    expect(canManageProvider(user(), 'provider')).toBe(false);
    expect(canManageProvider(undefined, 'provider')).toBe(false);
  });

  it('lets staff and support in', () => {
    expect(canManageProvider(user({ is_staff: true }), 'provider')).toBe(true);
    expect(canManageProvider(user({ is_support: true }), 'provider')).toBe(
      true,
    );
  });
});
