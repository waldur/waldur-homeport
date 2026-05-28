import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { ENV } from '@/core/config';
import * as features from '@/features/connect';
import { DeploymentFeatures } from '@/FeaturesEnums';

vi.mock('@/features/connect');

const mockGetIconUrl = vi.fn(
  (name: string) => `https://api.example.com/api/icons/${name}/`,
);
vi.mock('@/core/api', () => ({
  getIconUrl: (name: string) => mockGetIconUrl(name),
}));

import { DisclaimerArea } from './DisclaimerArea';

describe('DisclaimerArea', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ENV.plugins.WALDUR_CORE.DISCLAIMER_AREA_LOGO = '';
    ENV.plugins.WALDUR_CORE.DISCLAIMER_AREA_TEXT = '';
    ENV.apiEndpoint = 'https://api.example.com/';
  });

  it('renders nothing when feature is disabled', () => {
    vi.mocked(features.isFeatureVisible).mockReturnValue(false);
    ENV.plugins.WALDUR_CORE.DISCLAIMER_AREA_TEXT = 'Some text';

    const { container } = render(<DisclaimerArea />);

    expect(container.innerHTML).toBe('');
    expect(features.isFeatureVisible).toHaveBeenCalledWith(
      DeploymentFeatures.enable_disclaimer_area,
    );
  });

  it('renders nothing when feature is enabled but no logo or text configured', () => {
    vi.mocked(features.isFeatureVisible).mockReturnValue(true);

    const { container } = render(<DisclaimerArea />);

    expect(container.innerHTML).toBe('');
  });

  it('renders text when feature is enabled and text is configured', () => {
    vi.mocked(features.isFeatureVisible).mockReturnValue(true);
    ENV.plugins.WALDUR_CORE.DISCLAIMER_AREA_TEXT = 'Disclaimer text content';

    render(<DisclaimerArea />);

    expect(screen.getByText('Disclaimer text content')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders logo when feature is enabled and logo is configured', () => {
    vi.mocked(features.isFeatureVisible).mockReturnValue(true);
    ENV.plugins.WALDUR_CORE.DISCLAIMER_AREA_LOGO =
      'https://example.com/logo.png';

    render(<DisclaimerArea />);

    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute(
      'src',
      'https://api.example.com/api/icons/disclaimer_area_logo/',
    );
    expect(img).toHaveAttribute('alt', 'Disclaimer');
  });

  it('renders both logo and text when both are configured', () => {
    vi.mocked(features.isFeatureVisible).mockReturnValue(true);
    ENV.plugins.WALDUR_CORE.DISCLAIMER_AREA_LOGO =
      'https://example.com/logo.png';
    ENV.plugins.WALDUR_CORE.DISCLAIMER_AREA_TEXT = 'Disclaimer text content';

    render(<DisclaimerArea />);

    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.getByText('Disclaimer text content')).toBeInTheDocument();
  });

  it('uses getIconUrl for logo src instead of raw config value', () => {
    vi.mocked(features.isFeatureVisible).mockReturnValue(true);
    ENV.plugins.WALDUR_CORE.DISCLAIMER_AREA_LOGO = '/media/uploaded_logo.png';

    render(<DisclaimerArea />);

    expect(mockGetIconUrl).toHaveBeenCalledWith('disclaimer_area_logo');
    const img = screen.getByRole('img');
    expect(img).not.toHaveAttribute('src', '/media/uploaded_logo.png');
    expect(img).toHaveAttribute(
      'src',
      'https://api.example.com/api/icons/disclaimer_area_logo/',
    );
  });
});
