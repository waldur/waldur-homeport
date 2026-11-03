import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { useUser } from '@/workspace/hooks';

import { OpenPublicOffering } from './OpenPublicOffering';

vi.mock('@/features/connect', () => ({
  isFeatureVisible: vi.fn(),
}));

const row = { uuid: 'offering-uuid' } as any;

describe('OpenPublicOffering', () => {
  beforeEach(() => {
    vi.mocked(useUser).mockReturnValue({
      is_staff: false,
      is_support: false,
    } as any);
  });

  afterEach(() => {
    vi.mocked(isFeatureVisible).mockReset();
  });

  it('is omitted for a provider member when the shop is hidden', () => {
    vi.mocked(isFeatureVisible).mockImplementation(
      (key) => key === MarketplaceFeatures.hide_marketplace_from_end_users,
    );
    const { container } = render(<OpenPublicOffering row={row} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('is offered to support when the shop is hidden from end users', () => {
    vi.mocked(isFeatureVisible).mockImplementation(
      (key) => key === MarketplaceFeatures.hide_marketplace_from_end_users,
    );
    vi.mocked(useUser).mockReturnValue({
      is_staff: false,
      is_support: true,
    } as any);
    render(<OpenPublicOffering row={row} />);
    expect(screen.getByText('Open public page')).toBeInTheDocument();
  });
});
