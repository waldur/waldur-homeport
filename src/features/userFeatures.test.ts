import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';
import { SET_CURRENT_USER } from '@/workspace/constants';

import {
  applyUserFeatures,
  getPublicFeatures,
  rememberPublicFeatures,
  resetUserFeatures,
  setPublicFeature,
  userFeaturesMiddleware,
} from './userFeatures';

const PUBLIC = {
  marketplace: { realtime_updates: false, call_only: false },
  deployment: { send_metrics: true },
};

const run = (action: any) => {
  const next = vi.fn((a) => a);
  userFeaturesMiddleware({} as any)(next)(action);
  return next;
};

describe('userFeatures', () => {
  beforeEach(() => {
    ENV.FEATURES = structuredClone(PUBLIC);
    rememberPublicFeatures();
  });

  it('applies the flags /users/me/ answers on sign-in', () => {
    run({
      type: SET_CURRENT_USER,
      payload: {
        user: {
          uuid: 'u1',
          features: { marketplace: { realtime_updates: true } },
        },
      },
    });
    expect(ENV.FEATURES.marketplace.realtime_updates).toBe(true);
    expect(ENV.FEATURES.marketplace.call_only).toBe(false);
  });

  it('keeps the public flags for staff to edit', () => {
    applyUserFeatures({ marketplace: { realtime_updates: true } });
    expect(getPublicFeatures().marketplace.realtime_updates).toBe(false);
  });

  it('resets to the public flags on sign-out', () => {
    applyUserFeatures({ marketplace: { realtime_updates: true } });
    run({ type: SET_CURRENT_USER, payload: { user: undefined } });
    expect(ENV.FEATURES).toEqual(PUBLIC);
  });

  it('does not keep the previous user’s values after a switch', () => {
    applyUserFeatures({ marketplace: { realtime_updates: true } });
    applyUserFeatures({ marketplace: { realtime_updates: false } });
    expect(ENV.FEATURES.marketplace.realtime_updates).toBe(false);
  });

  it('leaves the flags alone for a user object without features', () => {
    applyUserFeatures({ marketplace: { realtime_updates: true } });
    const next = run({
      type: SET_CURRENT_USER,
      payload: { user: { uuid: 'u1', full_name: 'Updated' } },
    });
    expect(ENV.FEATURES.marketplace.realtime_updates).toBe(true);
    expect(next).toHaveBeenCalled();
  });

  it('records a global value staff saved in both copies', () => {
    applyUserFeatures({ marketplace: { realtime_updates: true } });
    setPublicFeature('deployment', 'send_metrics', false);
    expect(getPublicFeatures().deployment.send_metrics).toBe(false);
    expect(ENV.FEATURES.deployment.send_metrics).toBe(false);
    // The user's own value survives the next /users/me/ too.
    applyUserFeatures({ marketplace: { realtime_updates: true } });
    expect(ENV.FEATURES.deployment.send_metrics).toBe(false);
    resetUserFeatures();
    expect(ENV.FEATURES.deployment.send_metrics).toBe(false);
  });
});
