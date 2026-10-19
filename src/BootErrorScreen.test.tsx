import { render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SPLASH_BRANDING_KEY } from 'waldur-boot-splash';

import { BootErrorScreen } from './BootErrorScreen';

vi.mock('./theme/ThemeProvider', () => ({
  ThemeProvider: ({ children }: { children: ReactNode }) => children,
}));

describe('BootErrorScreen', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML =
      '<div id="boot-splash" role="status" aria-label="Starting Waldur"></div>';
  });

  it('names the deployment and the cause when boot fails', () => {
    localStorage.setItem(
      SPLASH_BRANDING_KEY,
      JSON.stringify({
        name: 'Campus Cloud',
        color: '#7a3fcf',
        logo: '/icons/mark.svg',
      }),
    );
    render(
      <BootErrorScreen
        error={new Error('Unable to fetch server configuration.')}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      "Couldn't start Campus Cloud",
    );
    expect(screen.getByRole('presentation')).toHaveAttribute(
      'src',
      '/icons/mark.svg',
    );
    expect(
      screen.getByText('Unable to fetch server configuration.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Show error trace' }),
    ).toBeInTheDocument();
  });

  it('renders the default mark when no logo is cached', () => {
    render(<BootErrorScreen error={new Error('Configuration error')} />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      "Couldn't start Waldur",
    );
    expect(screen.queryByRole('presentation')).toBeNull();
  });

  it('takes the boot splash down so the error is visible', () => {
    render(<BootErrorScreen error={new Error('boom')} />);
    expect(screen.queryByRole('status', { name: /^Starting/ })).toBeNull();
  });
});
