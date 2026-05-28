import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { marketplaceResourcesUpdateOptions } from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';

import { UpdateResourceOptionDialog } from './UpdateResourceOptionDialog';

const renderDialog = (props) => {
  return renderWithProviders(<UpdateResourceOptionDialog {...props} />);
};

describe('UpdateResourceOptionDialog', () => {
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
      expect(useNotify().showSuccess).toHaveBeenCalledWith(
        'Options have been updated',
      );
      expect(useModal().closeDialog).toHaveBeenCalled();
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
      expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
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
