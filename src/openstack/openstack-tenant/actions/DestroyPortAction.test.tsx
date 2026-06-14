import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';

import { DestroyPortAction } from './DestroyPortAction';

const renderAction = (deviceOwner: string | null) =>
  renderWithProviders(
    <DestroyPortAction
      resource={
        {
          uuid: 'port-uuid',
          name: 'test-port',
          state: 'OK',
          resource_type: 'OpenStack.Port',
          device_owner: deviceOwner,
        } as any
      }
      refetch={vi.fn()}
    />,
  );

const getConfirmationBody = () => {
  const confirm = vi.mocked(useModal().confirm);
  expect(confirm).toHaveBeenCalled();
  return render(<>{confirm.mock.calls[0][1]}</>);
};

describe('DestroyPortAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a warning when destroying a network:distributed port', async () => {
    renderAction('network:distributed');
    await userEvent.click(screen.getByText('Destroy'));

    await waitFor(() => expect(useModal().confirm).toHaveBeenCalled());
    getConfirmationBody();
    expect(
      screen.getByText(/metadata service \(169\.254\.169\.254\)/),
    ).toBeDefined();
  });

  it('shows a warning when destroying a router port', async () => {
    renderAction('network:router_gateway');
    await userEvent.click(screen.getByText('Destroy'));

    await waitFor(() => expect(useModal().confirm).toHaveBeenCalled());
    getConfirmationBody();
    expect(screen.getByText(/This port belongs to a router/)).toBeDefined();
  });

  it('shows no warning when destroying an instance port', async () => {
    renderAction('compute:nova');
    await userEvent.click(screen.getByText('Destroy'));

    await waitFor(() => expect(useModal().confirm).toHaveBeenCalled());
    getConfirmationBody();
    expect(screen.getByText(/Are you sure you want to delete/)).toBeDefined();
    expect(screen.queryByText(/Deleting it may/)).toBeNull();
  });

  it('shows no warning when device owner is empty', async () => {
    renderAction(null);
    await userEvent.click(screen.getByText('Destroy'));

    await waitFor(() => expect(useModal().confirm).toHaveBeenCalled());
    getConfirmationBody();
    expect(screen.getByText(/Are you sure you want to delete/)).toBeDefined();
    expect(screen.queryByText(/Deleting it may/)).toBeNull();
  });
});
