import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { hasPermission } from '@/permissions/hasPermission';
import { useUser } from '@/workspace/hooks';

import { OfferingViewHero } from './OfferingViewHero';

vi.mock('@/features/connect', () => ({
  isFeatureVisible: vi.fn(),
}));

vi.mock('@/permissions/hasPermission', () => ({
  hasPermission: vi.fn(() => true),
}));

const offering = {
  uuid: 'offering-uuid',
  name: 'HPC',
  customer_name: 'Provider',
  customer_uuid: 'provider-uuid',
  state: 'Active',
  shared: true,
  type: 'Marketplace.Basic',
  parent_name: 'Parent offering',
  parent_uuid: 'parent-uuid',
  permissions: [],
} as any;

const hideOn = () =>
  vi
    .mocked(isFeatureVisible)
    .mockImplementation(
      (key) => key === MarketplaceFeatures.hide_marketplace_from_end_users,
    );

describe('OfferingViewHero shop links', () => {
  beforeEach(() => {
    vi.mocked(hasPermission).mockReturnValue(true);
    vi.mocked(useUser).mockReturnValue({
      is_staff: false,
      is_support: false,
      permissions: [],
    } as any);
  });

  afterEach(() => {
    vi.mocked(isFeatureVisible).mockReset();
  });

  it('hides the Public tab and the parent link for a provider member', () => {
    hideOn();
    render(<OfferingViewHero offering={offering} />);
    expect(screen.queryByTestId('offering-tab-public')).toBeNull();
    expect(screen.getByText(/Part of Parent offering/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Parent offering' })).toBeNull();
    expect(screen.getByTestId('offering-tab-manage')).toBeInTheDocument();
  });

  it('keeps the Public tab and the parent link for support', () => {
    hideOn();
    vi.mocked(useUser).mockReturnValue({
      is_staff: false,
      is_support: true,
      permissions: [],
    } as any);
    render(<OfferingViewHero offering={offering} />);
    expect(screen.getByTestId('offering-tab-public')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Parent offering' }),
    ).toBeInTheDocument();
  });
});
