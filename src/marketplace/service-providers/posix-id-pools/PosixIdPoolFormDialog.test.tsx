import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplacePosixIdPoolsPartialUpdate } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { PosixIdPoolFormDialog } from './PosixIdPoolFormDialog';

const providerPool = {
  uuid: 'pool-uuid',
  customer_uuid: 'customer',
  scope: 'service_provider',
  min_uid: 10000,
  max_uid: 10999,
  min_gid: 10000,
  max_gid: 10999,
  min_group_gid: 20001,
  max_group_gid: 20200,
  next_group_gid: 20004,
  uid_used: 0,
  gid_used: 0,
  group_gid_used: 3,
} as any;

const renderDialog = (pool = providerPool) =>
  renderWithProviders(
    <PosixIdPoolFormDialog resolve={{ pool, pools: [], refetch: vi.fn() }} />,
  );

describe('PosixIdPoolFormDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(marketplacePosixIdPoolsPartialUpdate).mockResolvedValue({
      data: providerPool,
    } as any);
  });

  it('shows the project group range of a service provider pool', () => {
    renderDialog();

    expect(screen.getByLabelText(/Minimum project group GID/)).toHaveValue(
      20001,
    );
    expect(screen.getByLabelText(/Maximum project group GID/)).toHaveValue(
      20200,
    );
    expect(screen.getByTestId('next-group-gid')).toHaveTextContent('20004');
  });

  it('leaves the project group range out of an offering pool', () => {
    renderDialog({
      ...providerPool,
      scope: 'offering',
      min_group_gid: null,
      max_group_gid: null,
      next_group_gid: null,
    });

    expect(
      screen.queryByLabelText(/Minimum project group GID/),
    ).not.toBeInTheDocument();
  });

  it('sends the project group range on save', async () => {
    const user = userEvent.setup();
    renderDialog();

    const max = screen.getByLabelText(/Maximum project group GID/);
    await user.clear(max);
    await user.type(max, '20300');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(marketplacePosixIdPoolsPartialUpdate).toHaveBeenCalledWith({
        path: { uuid: 'pool-uuid' },
        body: expect.objectContaining({
          min_group_gid: 20001,
          max_group_gid: 20300,
        }),
      }),
    );
  });
});
