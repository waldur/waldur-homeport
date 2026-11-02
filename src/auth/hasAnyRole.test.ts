import { describe, expect, it } from 'vitest';

import { hasAnyRole } from './hasAnyRole';

const userWith = (...scopeTypes: string[]) => ({
  permissions: scopeTypes.map((scope_type) => ({ scope_type })),
});

describe('hasAnyRole', () => {
  it.each([
    'customer',
    'project',
    'resource',
    'resource_project',
    'service_provider',
    'offering',
    'call',
    'call_organizer',
    'proposal',
  ])('counts a role on a %s scope', (scopeType) => {
    expect(hasAnyRole(userWith(scopeType))).toBe(true);
  });

  it('counts a scope type it has not seen before', () => {
    expect(hasAnyRole(userWith('some_future_scope'))).toBe(true);
  });

  it('counts a user holding only call roles', () => {
    expect(hasAnyRole(userWith('call', 'call'))).toBe(true);
  });

  it('is false for a user with no roles', () => {
    expect(hasAnyRole(userWith())).toBe(false);
  });

  it('is false when permissions are missing', () => {
    expect(hasAnyRole({})).toBe(false);
    expect(hasAnyRole({ permissions: null })).toBe(false);
    expect(hasAnyRole(undefined)).toBe(false);
    expect(hasAnyRole(null)).toBe(false);
  });
});
