import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceCategoriesRetrieve } from 'waldur-js-client';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { OfferingDetailsDialog } from './OfferingDetailsDialog';

vi.mock('@/features/connect', () => ({
  isFeatureVisible: vi.fn(),
}));

const offering = {
  uuid: 'offering-uuid',
  name: 'HPC',
  customer_name: 'Provider',
  category_uuid: 'category-uuid',
  attributes: {},
  screenshots: [],
  plans: [],
};

const renderDialog = () =>
  renderWithProviders(
    <OfferingDetailsDialog resolve={{ offering: offering as any }} />,
  );

describe('OfferingDetailsDialog', () => {
  beforeEach(() => {
    vi.mocked(useUser).mockReturnValue({ is_staff: false } as any);
    vi.mocked(marketplaceCategoriesRetrieve).mockResolvedValue({
      data: { sections: [] },
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('links to the public offering page when shop UI is available', () => {
    vi.mocked(isFeatureVisible).mockReturnValue(false);
    renderDialog();
    expect(
      screen.getByRole('heading', { name: /Offering name:\s*HPC/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /More details/ }),
    ).toBeInTheDocument();
  });

  it('hides More details when hide_marketplace_from_end_users is on for non-staff', () => {
    vi.mocked(isFeatureVisible).mockImplementation(
      (key) => key === MarketplaceFeatures.hide_marketplace_from_end_users,
    );
    renderDialog();
    expect(
      screen.getByRole('heading', { name: /Offering name:\s*HPC/ }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /More details/ })).toBeNull();
  });

  it('links when hide_marketplace_from_end_users is on for staff', () => {
    vi.mocked(isFeatureVisible).mockImplementation(
      (key) => key === MarketplaceFeatures.hide_marketplace_from_end_users,
    );
    vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);
    renderDialog();
    expect(
      screen.getByRole('link', { name: /More details/ }),
    ).toBeInTheDocument();
  });
});
