import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supportRequestTypesAdminDeactivate } from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { createTestWrapper } from '@/test/harness';

import { BatchDeactivateAction } from './BatchDeactivateAction';

const createWrapper = () => createTestWrapper().wrapper;

describe('BatchDeactivateAction', () => {
  const mockRefetch = vi.fn();

  const rows = [
    { uuid: '1', name: 'Type 1', is_active: false },
    { uuid: '2', name: 'Type 2', is_active: true },
  ] as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('performs batch deactivation for active rows', async () => {
    vi.mocked(useModal().confirm).mockResolvedValue(undefined);
    vi.mocked(supportRequestTypesAdminDeactivate).mockResolvedValue({} as any);

    render(<BatchDeactivateAction rows={rows} refetch={mockRefetch} />, {
      wrapper: createWrapper(),
    });

    fireEvent.click(screen.getByText('Deactivate'));

    await waitFor(() => expect(useModal().confirm).toHaveBeenCalled());
    await waitFor(() => {
      expect(supportRequestTypesAdminDeactivate).toHaveBeenCalledWith(
        expect.objectContaining({ path: { uuid: '2' } }),
      );
    });
    expect(supportRequestTypesAdminDeactivate).not.toHaveBeenCalledWith(
      expect.objectContaining({ path: { uuid: '1' } }),
    );
    await waitFor(() =>
      expect(useNotify().showSuccess).toHaveBeenCalledWith(
        'Request types have been deactivated successfully.',
      ),
    );
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('is disabled when no active rows are selected', () => {
    const inactiveRows = [{ uuid: '1', is_active: false }] as any;
    render(
      <BatchDeactivateAction rows={inactiveRows} refetch={mockRefetch} />,
      {
        wrapper: createWrapper(),
      },
    );

    const button = screen.getByText('Deactivate');
    expect(button).toBeDisabled();
  });

  it('handles partial success', async () => {
    const multiRows = [
      { uuid: '1', name: 'Type 1', is_active: true },
      { uuid: '2', name: 'Type 2', is_active: true },
    ] as any;
    vi.mocked(useModal().confirm).mockResolvedValue(undefined);
    vi.mocked(supportRequestTypesAdminDeactivate).mockImplementation(
      ({ path }) => {
        if (path.uuid === '1') return Promise.resolve({} as any);
        return Promise.reject(new Error('API Error'));
      },
    );

    render(<BatchDeactivateAction rows={multiRows} refetch={mockRefetch} />, {
      wrapper: createWrapper(),
    });

    fireEvent.click(screen.getByText('Deactivate'));

    await waitFor(() => expect(useModal().confirm).toHaveBeenCalled());
    await waitFor(() => expect(mockRefetch).toHaveBeenCalled());
  });
});
