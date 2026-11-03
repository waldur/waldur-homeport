import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { useUser } from '@/workspace/hooks';

import { AvailableOfferingCard } from './AvailableOfferingCard';

vi.mock('@/features/connect', () => ({
  isFeatureVisible: vi.fn(),
}));

const offering = {
  uuid: 'offering-uuid',
  name: 'HPC',
  customer_name: 'Provider',
  description: 'A cluster',
};

const renderCard = () =>
  render(<AvailableOfferingCard availableOffering={offering} />);

describe('AvailableOfferingCard', () => {
  beforeEach(() => {
    vi.mocked(useUser).mockReturnValue({ is_staff: false } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('links the card and View offering when shop UI is available', () => {
    vi.mocked(isFeatureVisible).mockReturnValue(false);
    renderCard();
    expect(
      screen.getByRole('link', { name: (name) => name === 'View offering' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Apply to call' }),
    ).toBeInTheDocument();
  });

  it('keeps Apply to call and drops offering links when the shop is hidden from non-staff', () => {
    vi.mocked(isFeatureVisible).mockImplementation(
      (key) => key === MarketplaceFeatures.hide_marketplace_from_end_users,
    );
    renderCard();
    expect(screen.getByText('HPC')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Apply to call' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: (name) => name === 'View offering' }),
    ).toBeNull();
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });

  it('links when hide_marketplace_from_end_users is on for staff', () => {
    vi.mocked(isFeatureVisible).mockImplementation(
      (key) => key === MarketplaceFeatures.hide_marketplace_from_end_users,
    );
    vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);
    renderCard();
    expect(
      screen.getByRole('link', { name: (name) => name === 'View offering' }),
    ).toBeInTheDocument();
  });
});
