import { describe, expect, it } from 'vitest';

import { toCurrentUser } from './useCurrentUser';

const me = (overrides = {}) =>
  ({
    uuid: 'u1',
    full_name: 'Sam Support',
    first_name: 'Sam',
    email: 'sam@example.org',
    is_staff: false,
    is_support: true,
    image: null,
    token: null,
    ip_address: '127.0.0.1',
    permissions: [
      { role_name: 'OFFERING.MANAGER', is_active: true },
      { role_name: 'CUSTOMER.OWNER', is_active: false },
    ],
    ...overrides,
  }) as any;

describe('toCurrentUser', () => {
  it('keeps support apart from staff, as the portal does', () => {
    expect(toCurrentUser(me())).toMatchObject({
      isStaff: false,
      isSupport: true,
    });
    expect(toCurrentUser(me({ is_support: undefined })).isSupport).toBe(false);
  });

  it('lists only the active roles', () => {
    expect(toCurrentUser(me()).roleNames).toEqual(['OFFERING.MANAGER']);
  });
});
