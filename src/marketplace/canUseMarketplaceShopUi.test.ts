import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { isMarketplaceVisible } from '@/marketplace/serviceAccessMode';

import {
  canOrderFromOffering,
  canUseMarketplaceShopUi,
} from './canUseMarketplaceShopUi';

vi.mock('@/features/connect', () => ({
  isFeatureVisible: vi.fn(),
}));

vi.mock('@/marketplace/serviceAccessMode', () => ({
  isMarketplaceVisible: vi.fn(),
}));

const endUser = { is_staff: false };
const staff = { is_staff: true };
const shared = { shared: true };
const privateOffering = { shared: false };

describe('canOrderFromOffering', () => {
  beforeEach(() => {
    vi.mocked(isFeatureVisible).mockReturnValue(false);
    vi.mocked(isMarketplaceVisible).mockReturnValue(true);
  });

  it('allows both kinds of offering where the marketplace is shown', () => {
    expect(canOrderFromOffering(endUser, shared)).toBe(true);
    expect(canOrderFromOffering(endUser, privateOffering)).toBe(true);
  });

  describe('calls-only mode', () => {
    beforeEach(() => {
      vi.mocked(isMarketplaceVisible).mockReturnValue(false);
    });

    it('closes shared offerings to end users but not to staff', () => {
      expect(canOrderFromOffering(endUser, shared)).toBe(false);
      expect(canOrderFromOffering(null, shared)).toBe(false);
      expect(canOrderFromOffering(staff, shared)).toBe(true);
    });

    // e.g. an OpenStack tenant's instance and volume offerings
    it('keeps private offerings open', () => {
      expect(canOrderFromOffering(endUser, privateOffering)).toBe(true);
    });

    // A sparse offering without the flag is not known to be private.
    it('treats an offering without the shared flag as shared', () => {
      expect(canOrderFromOffering(endUser, {})).toBe(false);
    });
  });

  it('closes private offerings to end users under hide_marketplace_from_end_users', () => {
    vi.mocked(isFeatureVisible).mockImplementation(
      (feature) =>
        feature === MarketplaceFeatures.hide_marketplace_from_end_users,
    );

    expect(canOrderFromOffering(endUser, privateOffering)).toBe(false);
    expect(canOrderFromOffering(staff, privateOffering)).toBe(true);
  });
});

const hideOn = () =>
  vi
    .mocked(isFeatureVisible)
    .mockImplementation(
      (key) => key === MarketplaceFeatures.hide_marketplace_from_end_users,
    );

describe('canUseMarketplaceShopUi', () => {
  // The marketplace is shown: calls-only mode is canOrderFromOffering's case.
  beforeEach(() => {
    vi.mocked(isMarketplaceVisible).mockReturnValue(true);
  });

  afterEach(() => {
    vi.mocked(isFeatureVisible).mockReset();
  });

  it('allows everyone when the feature is off', () => {
    vi.mocked(isFeatureVisible).mockReturnValue(false);
    expect(
      canUseMarketplaceShopUi({ is_staff: false, is_support: false }),
    ).toBe(true);
    expect(canUseMarketplaceShopUi(null)).toBe(true);
  });

  it('allows staff and support when the feature is on', () => {
    hideOn();
    expect(canUseMarketplaceShopUi({ is_staff: true, is_support: false })).toBe(
      true,
    );
    expect(canUseMarketplaceShopUi({ is_staff: false, is_support: true })).toBe(
      true,
    );
  });

  it('blocks a provider member and a project member when the feature is on', () => {
    hideOn();
    expect(
      canUseMarketplaceShopUi({ is_staff: false, is_support: false }),
    ).toBe(false);
    expect(canUseMarketplaceShopUi(undefined)).toBe(false);
  });
});
