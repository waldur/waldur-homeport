import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usersDestroy } from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { inActionsMenu, renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { UserDeleteButton } from './UserDeleteButton';

describe('UserDeleteButton', () => {
  const user = userEvent.setup();
  const row = { uuid: 'row-uuid', full_name: 'Jane Doe' } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUser).mockReturnValue({
      uuid: 'staff-uuid',
      is_staff: true,
    } as any);
  });

  it('deletes the user after confirmation and refreshes the table', async () => {
    const refetch = vi.fn();
    vi.mocked(useModal().confirm).mockResolvedValueOnce(null);
    vi.mocked(usersDestroy).mockResolvedValueOnce(null);

    renderWithProviders(
      inActionsMenu(<UserDeleteButton row={row} refetch={refetch} />),
    );
    await user.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(useModal().confirm).toHaveBeenCalled();
      expect(usersDestroy).toHaveBeenCalledWith({
        path: { uuid: 'row-uuid' },
      });
      expect(useNotify().showSuccess).toHaveBeenCalledWith(
        'User has been deleted.',
      );
      expect(refetch).toHaveBeenCalled();
    });
  });

  it('does nothing when the confirmation is dismissed', async () => {
    vi.mocked(useModal().confirm).mockRejectedValueOnce(null);

    renderWithProviders(inActionsMenu(<UserDeleteButton row={row} />));
    await user.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(useModal().confirm).toHaveBeenCalled();
    });
    expect(usersDestroy).not.toHaveBeenCalled();
  });

  it('is hidden for non-staff users', () => {
    vi.mocked(useUser).mockReturnValue({
      uuid: 'owner-uuid',
      is_staff: false,
    } as any);

    renderWithProviders(inActionsMenu(<UserDeleteButton row={row} />));
    expect(screen.queryByText('Delete')).toBeNull();
  });

  it("is hidden on the current user's own row", () => {
    vi.mocked(useUser).mockReturnValue({
      uuid: 'row-uuid',
      is_staff: true,
    } as any);

    renderWithProviders(inActionsMenu(<UserDeleteButton row={row} />));
    expect(screen.queryByText('Delete')).toBeNull();
  });
});
