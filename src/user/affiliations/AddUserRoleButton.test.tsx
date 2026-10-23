import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { AddUserRoleButton } from './AddUserRoleButton';

const target = { uuid: 'target-uuid', full_name: 'Ada', username: 'ada' };

describe('AddUserRoleButton', () => {
  it('is hidden for a non-staff user', () => {
    vi.mocked(useUser).mockReturnValue({ is_staff: false } as any);
    renderWithProviders(<AddUserRoleButton user={target} refetch={vi.fn()} />);
    expect(
      screen.queryByRole('button', { name: 'Add' }),
    ).not.toBeInTheDocument();
  });

  it('opens the add-role dialog for staff', async () => {
    const user = userEvent.setup();
    vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);
    renderWithProviders(<AddUserRoleButton user={target} refetch={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(vi.mocked(useModal)().openDialog).toHaveBeenCalled();
  });
});
