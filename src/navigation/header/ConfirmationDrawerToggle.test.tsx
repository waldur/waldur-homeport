import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceProjectUpdateRequestsCount } from 'waldur-js-client';

import { useDrawer, useIsDrawerOpenWith } from '@/drawer/actions';
import { DrawerExpandToolbar } from '@/drawer/DrawerExpandToolbar';
import { DRAWER_SHELL_CLASS } from '@/drawer/shellClasses';

import { ConfirmationDrawerToggle } from './ConfirmationDrawerToggle';

vi.mock('@/drawer/actions', () => ({
  useDrawer: vi.fn(),
  useIsDrawerOpenWith: vi.fn(),
}));

vi.mock('@/drawer/utils', () => ({
  isDrawerOpenWithClass: vi.fn(),
}));

vi.mock('@/features/connect', () => ({
  isFeatureVisible: vi.fn(() => false),
}));

vi.mock('@/marketplace/common/api', () => ({
  countOrders: vi.fn().mockResolvedValue(2),
}));

describe('ConfirmationDrawerToggle', () => {
  let openDrawerMock: ReturnType<typeof vi.fn>;
  let closeDrawerMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(marketplaceProjectUpdateRequestsCount).mockReturnValue(
      Promise.resolve({
        headers: { 'x-result-count': '0' },
        data: [],
      }) as any,
    );
    openDrawerMock = vi.fn();
    closeDrawerMock = vi.fn();
    vi.mocked(useDrawer).mockReturnValue({
      openDrawer: openDrawerMock,
      closeDrawer: closeDrawerMock,
      renderDrawer: vi.fn(),
      isOpen: false,
    } as any);
    vi.mocked(useIsDrawerOpenWith).mockReturnValue(false);
  });

  const renderComponent = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    return render(
      <QueryClientProvider client={queryClient}>
        <ConfirmationDrawerToggle />
      </QueryClientProvider>,
    );
  };

  it('renders pending confirmations toggle button', () => {
    renderComponent();
    const button = screen.getByRole('button', { name: 'Pending tasks' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('id', 'pending-confirmations-toggle');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens confirmation drawer with correct title and shellClass on click', async () => {
    const user = userEvent.setup();
    renderComponent();

    const button = screen.getByRole('button', { name: 'Pending tasks' });
    await user.click(button);

    expect(openDrawerMock).toHaveBeenCalledTimes(1);
    expect(openDrawerMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        title: 'Pending confirmations',
        toolbar: DrawerExpandToolbar,
        shellClass: DRAWER_SHELL_CLASS.confirmation,
      }),
    );
  });
});
