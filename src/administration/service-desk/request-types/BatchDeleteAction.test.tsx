import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supportRequestTypesAdminDestroy } from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';

import { BatchDeleteAction } from './BatchDeleteAction';

describe('BatchDeleteAction', () => {
  const mockRefetch = vi.fn();

  const rows = [
    { uuid: '1', name: 'Type 1', is_synced: false },
    { uuid: '2', name: 'Type 2', is_synced: true },
  ] as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('performs batch deletion for all selected rows', async () => {
    vi.mocked(useModal().confirm).mockResolvedValue(undefined);
    vi.mocked(supportRequestTypesAdminDestroy).mockResolvedValue({} as any);

    const user = userEvent.setup();
    renderWithProviders(
      <BatchDeleteAction rows={rows} refetch={mockRefetch} />,
    );

    await user.click(screen.getByText('Delete'));

    await waitFor(() => expect(useModal().confirm).toHaveBeenCalled());
    await waitFor(() => {
      expect(supportRequestTypesAdminDestroy).toHaveBeenCalledTimes(2);
    });
    await waitFor(() =>
      expect(useNotify().showSuccess).toHaveBeenCalledWith(
        'Request types have been deleted successfully.',
      ),
    );
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('is disabled when no rows are selected', () => {
    renderWithProviders(<BatchDeleteAction rows={[]} refetch={mockRefetch} />);

    const button = screen.getByText('Delete');
    expect(button).toBeDisabled();
  });

  it('handles partial success', async () => {
    const multiRows = [
      { uuid: '1', name: 'Type 1', is_synced: false },
      { uuid: '2', name: 'Type 2', is_synced: false },
    ] as any;
    vi.mocked(useModal().confirm).mockResolvedValue(undefined);
    vi.mocked(supportRequestTypesAdminDestroy).mockImplementation(
      ({ path }) => {
        if (path.uuid === '1') return Promise.resolve({} as any);
        return Promise.reject(new Error('API Error'));
      },
    );

    const user = userEvent.setup();
    renderWithProviders(
      <BatchDeleteAction rows={multiRows} refetch={mockRefetch} />,
    );

    await user.click(screen.getByText('Delete'));

    await waitFor(() => expect(useModal().confirm).toHaveBeenCalled());
    await waitFor(() => expect(mockRefetch).toHaveBeenCalled());
  });
});
