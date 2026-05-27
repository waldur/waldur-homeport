import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceResourcesUpdateOptions } from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';

import { UpdateResourceOptionDialog } from './UpdateResourceOptionDialog';

vi.mock('waldur-js-client');
vi.mock('@/store/notify');

vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderDialog = (props) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <UpdateResourceOptionDialog {...props} />
    </QueryClientProvider>,
  );
};

describe('UpdateResourceOptionDialog', () => {
  const mockCloseDialog = vi.fn();
  const mockShowSuccess = vi.fn();
  const mockShowErrorResponse = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNotify).mockReturnValue({
      showSuccess: mockShowSuccess,
      showErrorResponse: mockShowErrorResponse,
    } as any);
    vi.mocked(useModal).mockReturnValue({
      closeDialog: mockCloseDialog,
    } as any);
  });

  it('renders dialog correctly and displays option field with initial value', () => {
    const resolve = {
      resource: { uuid: 'res-1', options: { storage: 100 } } as any,
      offering: { uuid: 'off-1' } as any,
      option: {
        name: 'storage',
        label: 'Storage capacity',
        type: 'integer',
      } as any,
      refetch: vi.fn(),
    };

    renderDialog({ resolve });

    expect(screen.getByText('Update option')).toBeInTheDocument();
    expect(screen.getByText('Storage capacity')).toBeInTheDocument();
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
  });

  it('handles successful option update submission', async () => {
    const user = userEvent.setup();
    const mockRefetch = vi.fn();
    const resolve = {
      resource: { uuid: 'res-1', options: { storage: 100 } } as any,
      offering: { uuid: 'off-1' } as any,
      option: {
        name: 'storage',
        label: 'Storage capacity',
        type: 'integer',
      } as any,
      refetch: mockRefetch,
    };

    vi.mocked(marketplaceResourcesUpdateOptions).mockResolvedValue({} as any);

    renderDialog({ resolve });

    const input = screen.getByDisplayValue('100');
    await user.clear(input);
    await user.type(input, '250');

    await user.click(screen.getByRole('button', { name: 'Update' }));

    await waitFor(() => {
      expect(marketplaceResourcesUpdateOptions).toHaveBeenCalledWith({
        path: { uuid: 'res-1' },
        body: { options: { storage: 250 } },
      });
      expect(mockShowSuccess).toHaveBeenCalledWith('Options have been updated');
      expect(mockCloseDialog).toHaveBeenCalled();
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('handles error during submission', async () => {
    const user = userEvent.setup();
    const resolve = {
      resource: { uuid: 'res-1', options: { storage: 100 } } as any,
      offering: { uuid: 'off-1' } as any,
      option: {
        name: 'storage',
        label: 'Storage capacity',
        type: 'integer',
      } as any,
      refetch: vi.fn(),
    };

    const errorObj = new Error('Update failed');
    vi.mocked(marketplaceResourcesUpdateOptions).mockRejectedValue(errorObj);

    renderDialog({ resolve });

    await user.click(screen.getByRole('button', { name: 'Update' }));

    await waitFor(() => {
      expect(mockShowErrorResponse).toHaveBeenCalledWith(
        errorObj,
        'Unable to update options.',
      );
    });
  });

  it('renders fallback message when option name is not provided', () => {
    const resolve = {
      resource: { uuid: 'res-1', options: {} } as any,
      offering: { uuid: 'off-1' } as any,
      option: { name: '' } as any,
      refetch: vi.fn(),
    };

    renderDialog({ resolve });

    expect(
      screen.getByText(
        'There are no resource options defined in the offering.',
      ),
    ).toBeInTheDocument();
  });
});
