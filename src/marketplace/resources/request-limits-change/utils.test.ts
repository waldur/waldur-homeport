import { describe, expect, it } from 'vitest';

import {
  needsPendingLimitChangeRequestsCount,
  shouldShowLimitChangeRequestsTab,
} from './utils';

const limitComponents = [{ type: 'storage', billing_type: 'limit' }];

const context = (overrides = {}) => ({
  canManage: true,
  offering: {
    components: limitComponents,
    plugin_options: { enable_resource_limit_change_requests: true },
  },
  plan: null,
  hasPlan: true,
  ...overrides,
});

const optedOut = {
  components: limitComponents,
  plugin_options: {},
};

describe('shouldShowLimitChangeRequestsTab', () => {
  it('shows the tab when the offering accepts requests', () => {
    expect(
      shouldShowLimitChangeRequestsTab({ ...context(), pendingCount: 0 }),
    ).toBe(true);
  });

  it('keeps the tab while requests are pending after the offering opts out', () => {
    expect(
      shouldShowLimitChangeRequestsTab({
        ...context({ offering: optedOut }),
        pendingCount: 2,
      }),
    ).toBe(true);
  });

  it('hides the tab once the offering opts out and nothing is pending', () => {
    expect(
      shouldShowLimitChangeRequestsTab({
        ...context({ offering: optedOut }),
        pendingCount: 0,
      }),
    ).toBe(false);
  });

  it('hides the tab from users who cannot decide requests', () => {
    expect(
      shouldShowLimitChangeRequestsTab({
        ...context({ canManage: false }),
        pendingCount: 1,
      }),
    ).toBe(false);
  });

  it('hides the tab when the resource has no plan', () => {
    expect(
      shouldShowLimitChangeRequestsTab({
        ...context({ hasPlan: false }),
        pendingCount: 1,
      }),
    ).toBe(false);
  });

  it('hides the tab when the offering has no editable limit components', () => {
    expect(
      shouldShowLimitChangeRequestsTab({
        ...context({
          offering: {
            components: [{ type: 'cpu', billing_type: 'usage' }],
            plugin_options: { enable_resource_limit_change_requests: true },
          },
        }),
        pendingCount: 1,
      }),
    ).toBe(false);
  });
});

describe('needsPendingLimitChangeRequestsCount', () => {
  it('is not needed while the offering accepts requests', () => {
    expect(needsPendingLimitChangeRequestsCount(context())).toBe(false);
  });

  it('is needed once the offering opts out', () => {
    expect(
      needsPendingLimitChangeRequestsCount(context({ offering: optedOut })),
    ).toBe(true);
  });

  it('is not needed for users who cannot see the tab', () => {
    expect(
      needsPendingLimitChangeRequestsCount(
        context({ offering: optedOut, canManage: false }),
      ),
    ).toBe(false);
  });
});
