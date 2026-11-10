import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceResourcesTerminate } from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { inActionsMenu, renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { MultiTerminateAction } from './MultiTerminateAction';

// Avoid pulling the lazy-loaded dialog (and its heavy deps) into the test.
vi.mock('./MultiTerminateDialog', () => ({
  MultiTerminateDialog: () => null,
}));

const row = (uuid: string, resource_type: string) => ({
  uuid,
  name: uuid,
  state: 'OK',
  resource_type,
  project_uuid: 'p1',
  customer_uuid: 'c1',
});

const renderAction = (rows, refetch = vi.fn()) =>
  renderWithProviders(
    inActionsMenu(<MultiTerminateAction rows={rows} refetch={refetch} />),
  );

describe('MultiTerminateAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);
    vi.mocked(marketplaceResourcesTerminate).mockResolvedValue({
      data: { order_uuid: 'order-uuid' },
    } as any);
  });

  it('opens the terminate dialog when the selection holds an OpenStack instance', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    const rows = [
      row('i1', 'OpenStack.Instance'),
      row('v1', 'OpenStack.Volume'),
    ];
    renderAction(rows, refetch);

    await user.click(screen.getByText('Terminate'));

    const openDialog = vi.mocked(useModal().openDialog);
    expect(openDialog).toHaveBeenCalledTimes(1);
    expect(openDialog.mock.calls[0][1]).toEqual({
      resolve: { rows, refetch },
    });
    expect(useModal().confirm).not.toHaveBeenCalled();
    expect(marketplaceResourcesTerminate).not.toHaveBeenCalled();
  });

  it('includes erred instances, whose marketplace state is spelled Erred', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    const rows = [
      row('i1', 'OpenStack.Instance'),
      { ...row('i2', 'OpenStack.Instance'), state: 'Erred' },
    ];
    renderAction(rows, refetch);

    await user.click(screen.getByText('Terminate'));

    expect(
      vi.mocked(useModal().openDialog).mock.calls[0][1].resolve.rows,
    ).toEqual(rows);
  });

  it('keeps the plain confirmation, with no attributes, when there are no instances', async () => {
    const user = userEvent.setup();
    renderAction([
      row('v1', 'OpenStack.Volume'),
      row('t1', 'OpenStack.Tenant'),
    ]);

    await user.click(screen.getByText('Terminate'));

    expect(useModal().openDialog).not.toHaveBeenCalled();
    expect(useModal().confirm).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(marketplaceResourcesTerminate).toHaveBeenCalledTimes(2);
    });
    expect(marketplaceResourcesTerminate).toHaveBeenCalledWith({
      path: { uuid: 'v1' },
    });
    expect(marketplaceResourcesTerminate).toHaveBeenCalledWith({
      path: { uuid: 't1' },
    });
  });
});
