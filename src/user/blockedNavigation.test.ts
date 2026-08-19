import { beforeEach, describe, expect, it, vi } from 'vitest';

import { router } from '@/router';

const store: Record<string, any> = {};
const states: Record<string, any> = {};

vi.mock('@/core/StorageManager', () => ({
  BlockedNavigationStorage: {
    set: (value) => {
      store.value = value;
    },
    get: () => store.value ?? null,
    remove: () => {
      delete store.value;
    },
  },
}));

import {
  clearBlockedNavigation,
  getBlockedNavigation,
  getStateLabel,
  isResumableState,
  rememberBlockedNavigation,
} from './blockedNavigation';

describe('rememberBlockedNavigation', () => {
  beforeEach(clearBlockedNavigation);

  it('stores the destination and its params', () => {
    rememberBlockedNavigation('marketplace-landing', { category_uuid: 'abc' });
    expect(getBlockedNavigation()).toEqual({
      toState: 'marketplace-landing',
      toParams: { category_uuid: 'abc' },
    });
  });

  it.each(['profile-manage', 'profile.details', 'errorPage.notFound', 'login'])(
    'does not store %s, which would make the resume a loop or a no-op',
    (name) => {
      expect(isResumableState(name)).toBe(false);
      rememberBlockedNavigation('marketplace-landing', {});
      rememberBlockedNavigation(name, {});
      expect(getBlockedNavigation()).toBeNull();
    },
  );
});

describe('getStateLabel', () => {
  beforeEach(() => {
    Object.keys(states).forEach((key) => delete states[key]);
    vi.mocked(router.stateRegistry.get).mockImplementation(
      (name: string) => states[name] || null,
    );
  });

  it('falls back to the nearest ancestor that declares a breadcrumb', () => {
    states['child'] = { parent: 'parent' };
    states['parent'] = { data: { breadcrumb: () => 'Organizations' } };
    expect(getStateLabel('child')).toBe('Organizations');
  });

  it('returns undefined when no ancestor declares one', () => {
    expect(getStateLabel('unknown-state')).toBeUndefined();
  });
});
