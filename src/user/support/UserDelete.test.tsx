import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usersDestroy } from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { router as globalRouter } from '@/router';
import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';

import { UserDelete } from './UserDelete';
vi.mock('@/navigation/useTabs', () => ({
  isDescendantOf: vi.fn(),
}));

describe('UserDelete', () => {
  const user = userEvent.setup();

  let mockUser;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = {
      uuid: 'test-uuid',
      full_name: 'Test User',
    };

    vi.mocked(useRouter).mockReturnValue(globalRouter as any);
  });

  const renderComponent = () => {
    return renderWithProviders(<UserDelete user={mockUser} />);
  };

  it('handles user deletion successfully', async () => {
    vi.mocked(useModal().confirm).mockResolvedValueOnce(null);
    vi.mocked(usersDestroy).mockResolvedValueOnce(null);

    renderComponent();
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(useModal().confirm).toHaveBeenCalled();
      expect(usersDestroy).toHaveBeenCalledWith({
        path: { uuid: 'test-uuid' },
      });
      expect(useNotify().showSuccess).toHaveBeenCalledWith(
        'User has been deleted.',
      );
      expect(globalRouter.stateService.go).toHaveBeenCalledWith(
        'support-users',
      );
    });
  });

  it('proceeds only with confirmation', async () => {
    vi.mocked(useModal().confirm).mockRejectedValueOnce(null);

    renderComponent();
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(useModal().confirm).toHaveBeenCalled();
      expect(useNotify().showSuccess).not.toHaveBeenCalled();
      expect(globalRouter.stateService.go).not.toHaveBeenCalled();
    });
  });

  it('handles user deletion failure', async () => {
    vi.mocked(useModal().confirm).mockResolvedValueOnce(null);
    vi.mocked(usersDestroy).mockRejectedValueOnce(new Error('Test error'));

    renderComponent();
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(useModal().confirm).toHaveBeenCalled();
      expect(usersDestroy).toHaveBeenCalledWith({
        path: { uuid: 'test-uuid' },
      });
      expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
        new Error('Test error'),
        'Unable to delete user.',
      );
    });
  });
});
