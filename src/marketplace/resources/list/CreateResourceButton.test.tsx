import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { hasPermissionOnAnyScope } from '@/permissions/hasPermission';
import { useUser } from '@/workspace/hooks';

import { CreateResourceButton } from './CreateResourceButton';

vi.mock('@/features/connect', () => ({
  isFeatureVisible: vi.fn(),
}));

vi.mock('@/permissions/hasPermission', () => ({
  hasPermissionOnAnyScope: vi.fn(),
}));

vi.mock('@/navigation/sidebar/marketplace-popup/MarketplacePopup', () => ({
  MarketplacePopup: () => null,
}));

describe('CreateResourceButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hasPermissionOnAnyScope).mockReturnValue(true);
    vi.mocked(useUser).mockReturnValue({ is_staff: false } as any);
  });

  it('is not rendered when hide_marketplace_from_end_users is on for non-staff', () => {
    vi.mocked(isFeatureVisible).mockImplementation(
      (key) => key === MarketplaceFeatures.hide_marketplace_from_end_users,
    );
    const { container } = render(<CreateResourceButton />);
    expect(container).toBeEmptyDOMElement();
  });

  it('is rendered when hide_marketplace_from_end_users is on for staff', () => {
    vi.mocked(isFeatureVisible).mockImplementation(
      (key) => key === MarketplaceFeatures.hide_marketplace_from_end_users,
    );
    vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);
    render(<CreateResourceButton />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
