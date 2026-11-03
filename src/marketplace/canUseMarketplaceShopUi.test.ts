import { afterEach, describe, expect, it, vi } from 'vitest';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';

import { canUseMarketplaceShopUi } from './canUseMarketplaceShopUi';

vi.mock('@/features/connect', () => ({
  isFeatureVisible: vi.fn(),
}));

const hideOn = () =>
  vi
    .mocked(isFeatureVisible)
    .mockImplementation(
      (key) => key === MarketplaceFeatures.hide_marketplace_from_end_users,
    );

describe('canUseMarketplaceShopUi', () => {
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
