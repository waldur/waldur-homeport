import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { versionRetrieve } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { useUser } from '@/workspace/hooks';

import { AppFooter } from './AppFooter';

ENV.buildId = '1.2.3';

vi.mock('@/core/Tooltip', () => ({
  Tip: ({ children, label }: any) => <div title={label}>{children}</div>,
}));
vi.mock('./DisclaimerArea', () => ({
  DisclaimerArea: () => <div data-testid="disclaimer">Disclaimer</div>,
}));
vi.mock('./FooterLinks', () => ({
  FooterLinks: () => <div data-testid="footer-links">Footer Links</div>,
}));
vi.mock('./BackendHealthStatusIndicator', () => ({
  BackendHealthStatusIndicator: () => (
    <div data-testid="health-indicator">Health</div>
  ),
}));

describe('AppFooter', () => {
  beforeEach(() => {
    ENV.buildId = '1.2.3';
    vi.mocked(useUser).mockReturnValue({
      is_staff: false,
      is_support: false,
    } as any);
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<AppFooter />);
    expect(screen.getByText(/Version/)).toBeInTheDocument();
    expect(screen.getByTestId('health-indicator')).toBeInTheDocument();
    expect(screen.getByTestId('footer-links')).toBeInTheDocument();
    expect(screen.getByTestId('disclaimer')).toBeInTheDocument();
  });

  it('hides the version string for anonymous visitors', () => {
    vi.mocked(useUser).mockReturnValue(null);

    render(<AppFooter />);

    expect(screen.queryByText(/Version/)).not.toBeInTheDocument();
    expect(screen.getByTestId('health-indicator')).toBeInTheDocument();
    expect(screen.getByTestId('footer-links')).toBeInTheDocument();
    expect(screen.getByTestId('disclaimer')).toBeInTheDocument();
  });

  it('checks version for staff', async () => {
    vi.mocked(useUser).mockReturnValue({
      is_staff: true,
      is_support: false,
    } as any);
    vi.mocked(versionRetrieve).mockResolvedValue({
      data: { latest_version: '1.2.4' },
    } as any);

    render(<AppFooter />);

    expect(versionRetrieve).toHaveBeenCalled();
    // After re-render with versionInfo, it should show upgrade available
    const tip = await screen.findByTitle('Update available');
    expect(tip).toBeInTheDocument();
  });
});
