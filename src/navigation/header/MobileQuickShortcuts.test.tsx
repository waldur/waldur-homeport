import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { externalLinksList } from 'waldur-js-client';

import { SidebarProvider } from 'waldur-ui';

import { renderWithProviders } from '@/test/harness';

import { MobileQuickShortcuts } from './MobileQuickShortcuts';

const matchMediaReturning = (matches: boolean) =>
  vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));

const renderAt = (mobile: boolean) => {
  vi.stubGlobal('matchMedia', matchMediaReturning(mobile));
  return renderWithProviders(
    <SidebarProvider mobileBreakpoint="lg">
      <MobileQuickShortcuts />
    </SidebarProvider>,
  );
};

describe('MobileQuickShortcuts', () => {
  beforeEach(() => {
    vi.mocked(externalLinksList).mockResolvedValue({
      data: [
        {
          uuid: 'l1',
          name: 'Status page',
          link: 'https://status.example.org/',
        },
      ],
    } as any);
  });

  afterEach(() => vi.unstubAllGlobals());

  it('offers the menu in the header while the sidebar is a drawer', async () => {
    const user = userEvent.setup();
    renderAt(true);
    await user.click(
      await screen.findByRole('button', { name: 'Quick shortcuts' }),
    );
    expect(
      screen.getByRole('menuitem', { name: /Status page/ }),
    ).toHaveAttribute('href', 'https://status.example.org/');
  });

  it('leaves the menu to the sidebar on wider screens', async () => {
    renderAt(false);
    await vi.waitFor(() => expect(externalLinksList).toHaveBeenCalled());
    expect(
      screen.queryByRole('button', { name: 'Quick shortcuts' }),
    ).not.toBeInTheDocument();
  });
});
