import { describe, expect, it, vi } from 'vitest';

import { clearAuthCache } from '@/auth/authNavigation';
import { RedirectStorage } from '@/core/StorageManager';

import { reloadToLogin } from './reload';

vi.mock('@/auth/authNavigation', () => ({ clearAuthCache: vi.fn() }));

describe('reloadToLogin', () => {
  // The load deleted every account. The old session's 401s remembered the
  // admin page it was on, and a demo user signing in next was sent there and
  // got a 403.
  it('drops the old session and the page it would return to', () => {
    const assign = vi.spyOn(window.location, 'assign');
    RedirectStorage.set({ toState: 'admin-demo-presets', toParams: {} });

    reloadToLogin();

    expect(clearAuthCache).toHaveBeenCalled();
    expect(RedirectStorage.get()).toBeFalsy();
    expect(assign).toHaveBeenCalled();
  });
});
