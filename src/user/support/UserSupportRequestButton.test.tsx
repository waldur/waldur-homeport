import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';
import { useModal } from '@/modal/actions';
import { inActionsMenu, renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { UserSupportRequestButton } from './UserSupportRequestButton';

const mockOpenDialog = vi.fn();

const row = {
  uuid: 'user-2',
  url: 'http://example.com/api/users/user-2/',
  full_name: 'Jane Doe',
  is_active: true,
};

const renderButton = (rowOverrides = {}) =>
  renderWithProviders(
    inActionsMenu(
      <UserSupportRequestButton row={{ ...row, ...rowOverrides }} />,
    ),
  );

describe('UserSupportRequestButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ENV.plugins.WALDUR_SUPPORT = { ENABLED: true } as any;
    vi.mocked(useUser).mockReturnValue({
      uuid: 'user-1',
      is_staff: true,
    } as any);
    vi.mocked(useModal).mockReturnValue({
      openDialog: mockOpenDialog,
      closeDialog: vi.fn(),
      confirm: vi.fn(),
    } as any);
  });

  it('opens the dialog addressed to the row user', async () => {
    const user = userEvent.setup();
    renderButton();

    await user.click(screen.getByText('Open support request'));

    expect(mockOpenDialog).toHaveBeenCalledTimes(1);
    expect(mockOpenDialog.mock.calls[0][1].resolve.recipient).toMatchObject({
      uuid: 'user-2',
      url: row.url,
    });
  });

  it('is hidden from support users', () => {
    vi.mocked(useUser).mockReturnValue({
      uuid: 'user-1',
      is_staff: false,
      is_support: true,
    } as any);
    renderButton();

    expect(screen.queryByText('Open support request')).not.toBeInTheDocument();
  });

  it('is hidden on the staff member’s own row', () => {
    renderButton({ uuid: 'user-1' });

    expect(screen.queryByText('Open support request')).not.toBeInTheDocument();
  });

  it('is hidden when support is disabled', () => {
    ENV.plugins.WALDUR_SUPPORT = { ENABLED: false } as any;
    renderButton();

    expect(screen.queryByText('Open support request')).not.toBeInTheDocument();
  });

  it('is disabled for a deactivated user', () => {
    renderButton({ is_active: false });

    expect(
      screen.getByRole('menuitem', { name: /Open support request/ }),
    ).toHaveAttribute('aria-disabled', 'true');
  });
});
