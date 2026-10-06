import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { useUser } from '@/workspace/hooks';

import { OrderTablePlaceholderActions } from './OrderTablePlaceholderActions';

vi.mock('@/features/connect', () => ({
  isFeatureVisible: vi.fn(),
}));

describe('OrderTablePlaceholderActions', () => {
  it('is hidden for non-staff when hide_marketplace_from_end_users is on', () => {
    vi.mocked(isFeatureVisible).mockImplementation(
      (key) => key === MarketplaceFeatures.hide_marketplace_from_end_users,
    );
    vi.mocked(useUser).mockReturnValue({ is_staff: false } as any);
    const { container } = render(<OrderTablePlaceholderActions />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows Go to marketplace for staff when the feature is on', () => {
    vi.mocked(isFeatureVisible).mockImplementation(
      (key) => key === MarketplaceFeatures.hide_marketplace_from_end_users,
    );
    vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);
    render(<OrderTablePlaceholderActions />);
    expect(
      screen.getByRole('link', { name: /go to marketplace/i }),
    ).toBeInTheDocument();
  });
});
