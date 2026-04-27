import { render, screen } from '@testing-library/react';
import { useDispatch, useSelector } from 'react-redux';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { versionRetrieve } from 'waldur-js-client';

import { AppFooter } from './AppFooter';

vi.mock('react-redux');
vi.mock('waldur-js-client');
vi.mock('@/core/config', () => ({
  ENV: {
    buildId: '1.2.3',
  },
}));
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
  const dispatch = vi.fn();

  beforeEach(() => {
    vi.mocked(useDispatch).mockReturnValue(dispatch);
    vi.mocked(useSelector).mockReturnValue(false);
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<AppFooter />);
    expect(screen.getByText(/Version/)).toBeInTheDocument();
    expect(screen.getByTestId('health-indicator')).toBeInTheDocument();
    expect(screen.getByTestId('footer-links')).toBeInTheDocument();
    expect(screen.getByTestId('disclaimer')).toBeInTheDocument();
  });

  it('checks version for staff', async () => {
    vi.mocked(useSelector).mockReturnValue(true); // isStaffOrSupport = true
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
