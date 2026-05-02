import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRouter } from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usersDestroy } from 'waldur-js-client';

import { useNotify } from '@/store/notify';

import { UserDelete } from './UserDelete';

const mockConfirm = vi.fn();

vi.mock('@uirouter/react', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@uirouter/react')>();
  return {
    ...mod,
    useRouter: vi.fn(),
  };
});
vi.mock('@tanstack/react-query', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...mod,
    useQueryClient: vi.fn(),
  };
});
vi.mock('@/modal/hooks', () => ({
  useModal: () => ({
    confirm: mockConfirm,
    closeDialog: vi.fn(),
  }),
}));
vi.mock('@/navigation/useTabs', () => ({
  isDescendantOf: vi.fn(),
}));
vi.mock('@/store/notify');
vi.mock('waldur-js-client');

describe('UserDelete', () => {
  let user;
  let router;
  let queryClient;
  let notify;

  beforeEach(() => {
    user = {
      uuid: 'test-uuid',
      full_name: 'Test User',
    };

    router = {
      stateService: {
        go: vi.fn(),
      },
      globals: {
        current: 'admin-user-users',
      },
    };
    vi.mocked(useRouter).mockReturnValue(router);

    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.spyOn(queryClient, 'setQueryData');
    vi.mocked(useQueryClient).mockReturnValue(queryClient);

    notify = {
      showErrorResponse: vi.fn(),
      showSuccess: vi.fn(),
    };
    vi.mocked(useNotify).mockReturnValue(notify);
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <UserDelete user={user} />
      </QueryClientProvider>,
    );
  };

  it('handles user deletion successfully', async () => {
    mockConfirm.mockResolvedValueOnce(null);
    vi.mocked(usersDestroy).mockResolvedValueOnce(null);

    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalled();
      expect(usersDestroy).toHaveBeenCalledWith({
        path: { uuid: 'test-uuid' },
      });
      expect(queryClient.setQueryData).toHaveBeenCalledWith(
        ['User', 'test-uuid'],
        undefined,
      );
      expect(notify.showSuccess).toHaveBeenCalledWith('User has been deleted.');
      expect(router.stateService.go).toHaveBeenCalledWith('admin-user-users');
    });
  });

  it('proceeds only with confirmation', async () => {
    mockConfirm.mockRejectedValueOnce(null);

    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalled();
      expect(notify.showSuccess).not.toHaveBeenCalled();
      expect(router.stateService.go).not.toHaveBeenCalled();
    });
  });

  it('handles user deletion failure', async () => {
    mockConfirm.mockResolvedValueOnce(null);
    vi.mocked(usersDestroy).mockRejectedValueOnce(new Error('Test error'));

    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalled();
      expect(usersDestroy).toHaveBeenCalledWith({
        path: { uuid: 'test-uuid' },
      });
      expect(notify.showErrorResponse).toHaveBeenCalledWith(
        new Error('Test error'),
        'Unable to delete user.',
      );
    });
  });
});
