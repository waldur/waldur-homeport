import { describe, expect, it } from 'vitest';

import { states } from './routes';

describe('issues/routes', () => {
  it('declares support-users (the staff users list)', () => {
    const route = states.find((s) => s.name === 'support-users');
    expect(route).toBeDefined();
    expect(route?.url).toBe('users/?role');
    expect(route?.parent).toBe('support-user-management');
  });

  it('declares support-user-manage (the per-user detail page)', () => {
    const route = states.find((s) => s.name === 'support-user-manage');
    expect(route).toBeDefined();
    expect(route?.url).toBe('users/:user_uuid/?tab');
    expect(route?.parent).toBe('support-user-manage-container');
  });

  it('keeps support-user-management abstract and gated under support', () => {
    const parent = states.find((s) => s.name === 'support-user-management');
    expect(parent).toBeDefined();
    expect(parent?.abstract).toBe(true);
    expect(parent?.parent).toBe('support');
  });

  const asUser = (user) => ({ workspace: { user } }) as any;
  // ui-router inherits `data` prototypally, so the nearest own `permissions`
  // up the parent chain is the one the router checks.
  const permissionsOf = (name: string) => {
    let route = states.find((s) => s.name === name);
    while (route) {
      if (route.data?.permissions) return route.data.permissions;
      route = states.find((s) => s.name === route.parent);
    }
    return [];
  };
  const allows = (name: string, state) =>
    permissionsOf(name).every((permission) => permission(state));
  const support = asUser({ is_staff: false, is_support: true });
  const staff = asUser({ is_staff: true, is_support: false });

  // auth-tokens and notification-messages answer 403 to support users.
  it.each(['support-active-sessions', 'support-notification-messages'])(
    'shows %s to staff only',
    (name) => {
      expect(allows(name, staff)).toBe(true);
      expect(allows(name, support)).toBe(false);
    },
  );

  it('redirects support-user-management to a page support users can open', () => {
    const parent = states.find((s) => s.name === 'support-user-management');
    const target = states.find((s) => s.name === parent?.redirectTo);
    expect(target).toBeDefined();
    expect(allows(target.name, support)).toBe(true);
  });
});
