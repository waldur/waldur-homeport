import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';

import {
  getServiceAccessMode,
  isCallsSectionVisible,
  isMarketplaceVisible,
  isProposalRequestEnabled,
} from './serviceAccessMode';

const setMode = (mode?: string) => {
  (ENV as any).plugins = {
    ...(ENV as any).plugins,
    WALDUR_CORE: {
      ...(ENV as any).plugins?.WALDUR_CORE,
      SERVICE_ACCESS_MODE: mode,
    },
  };
};

describe('service access mode', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // Matches the backend default, so a deployment that has not been migrated
  // keeps showing everything rather than silently hiding a section.
  it('falls back to both when the deployment has not set one', () => {
    setMode(undefined);
    expect(getServiceAccessMode()).toBe('both');
    expect(isMarketplaceVisible()).toBe(true);
    expect(isCallsSectionVisible()).toBe(true);
    expect(isProposalRequestEnabled()).toBe(true);
  });

  it('shows both sections in both mode', () => {
    setMode('both');
    expect(isMarketplaceVisible()).toBe(true);
    expect(isCallsSectionVisible()).toBe(true);
    expect(isProposalRequestEnabled()).toBe(true);
  });

  // The marketplace is the single entry point; calls are reached through an
  // offering, so they get no section of their own.
  it('hides the calls section in marketplace mode', () => {
    setMode('marketplace');
    expect(isMarketplaceVisible()).toBe(true);
    expect(isCallsSectionVisible()).toBe(false);
    expect(isProposalRequestEnabled()).toBe(true);
  });

  // No offering page to request from, so the apply route cannot be reached.
  it('hides the marketplace and the apply route in calls mode', () => {
    setMode('calls');
    expect(isMarketplaceVisible()).toBe(false);
    expect(isCallsSectionVisible()).toBe(true);
    expect(isProposalRequestEnabled()).toBe(false);
  });

  it('never hides both sections at once', () => {
    for (const mode of ['calls', 'marketplace', 'both', undefined]) {
      setMode(mode);
      expect(isMarketplaceVisible() || isCallsSectionVisible()).toBe(true);
    }
  });
});
