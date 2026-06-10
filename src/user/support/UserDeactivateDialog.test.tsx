import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { usersPartialUpdate } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { UserDeactivateDialog } from './UserDeactivateDialog';

describe('UserDeactivateDialog', () => {
  const user = userEvent.setup();
  const mockUser = {
    uuid: 'abc123',
    full_name: 'John Doe',
    is_active: true,
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requires a reason before the user can be deactivated', async () => {
    renderWithProviders(<UserDeactivateDialog resolve={{ user: mockUser }} />);

    const submit = screen.getByRole('button', { name: 'Deactivate' });
    expect(submit).toBeDisabled();

    await user.click(submit);
    expect(usersPartialUpdate).not.toHaveBeenCalled();
  });

  it('deactivates the user with the provided reason', async () => {
    vi.mocked(usersPartialUpdate).mockResolvedValue({} as any);
    const onDeactivated = vi.fn();
    renderWithProviders(
      <UserDeactivateDialog resolve={{ user: mockUser, onDeactivated }} />,
    );

    await user.type(screen.getByRole('textbox'), 'Left the organization');
    await user.click(screen.getByRole('button', { name: 'Deactivate' }));

    await waitFor(() => {
      expect(usersPartialUpdate).toHaveBeenCalledWith({
        path: { uuid: 'abc123' },
        body: {
          is_active: false,
          deactivation_reason: 'Left the organization',
        },
      });
      expect(onDeactivated).toHaveBeenCalled();
    });
  });
});
