import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceServiceProviderProjectGroupsSetGid } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { ChangeProjectGroupGidDialog } from './ChangeProjectGroupGidDialog';

const group = { uuid: 'group-uuid', name: 'my-project', gid: 20003 } as any;

const renderDialog = (row = group) =>
  renderWithProviders(
    <ChangeProjectGroupGidDialog resolve={{ group: row, refetch: vi.fn() }} />,
  );

describe('ChangeProjectGroupGidDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('warns that files keep the old GID, which stays reserved', () => {
    renderDialog();

    expect(
      screen.getByText('The group currently has GID 20003.'),
    ).toBeInTheDocument();
    expect(screen.getByText(/keep the old GID until/)).toBeInTheDocument();
    expect(screen.getByText(/old GID stays reserved/)).toBeInTheDocument();
  });

  it('sends the new GID and the outside-range flag', async () => {
    vi.mocked(marketplaceServiceProviderProjectGroupsSetGid).mockResolvedValue({
      data: { ...group, gid: 20010 },
    } as any);
    const user = userEvent.setup();
    renderDialog();

    await user.type(screen.getByLabelText(/New GID/), '20010');
    await user.click(
      screen.getByLabelText('Allow a GID outside the project group range'),
    );
    await user.click(screen.getByRole('button', { name: 'Change GID' }));

    await waitFor(() =>
      expect(
        marketplaceServiceProviderProjectGroupsSetGid,
      ).toHaveBeenCalledWith({
        path: { uuid: 'group-uuid' },
        body: { gid: 20010, allow_outside_range: true },
      }),
    );
  });

  it('shows why the backend refused the GID', async () => {
    vi.mocked(marketplaceServiceProviderProjectGroupsSetGid).mockRejectedValue({
      response: { status: 400 },
      gid: ['GID 20010 is held by another consumer.'],
    });
    const user = userEvent.setup();
    renderDialog();

    await user.type(screen.getByLabelText(/New GID/), '20010');
    await user.click(screen.getByRole('button', { name: 'Change GID' }));

    expect(
      await screen.findByText('GID 20010 is held by another consumer.'),
    ).toBeInTheDocument();
  });

  it('has no renumbering warnings for a group without a GID', () => {
    renderDialog({ ...group, gid: null });

    expect(screen.getByText(/has no GID yet/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Set GID' })).toBeInTheDocument();
    expect(screen.queryByText(/chgrp/)).not.toBeInTheDocument();
    expect(screen.queryByText(/stays reserved/)).not.toBeInTheDocument();
  });

  it('lets the user correct the GID after a refusal', async () => {
    vi.mocked(marketplaceServiceProviderProjectGroupsSetGid).mockRejectedValue({
      response: { status: 400 },
      status: 400,
      statusText: 'Bad Request',
      url: 'http://localhost/api/',
      gid: ['GID 20010 is held by another consumer.'],
    });
    const user = userEvent.setup();
    renderDialog();

    const input = screen.getByLabelText(/New GID/);
    await user.type(input, '20010');
    await user.click(screen.getByRole('button', { name: 'Change GID' }));
    expect(
      await screen.findByText('GID 20010 is held by another consumer.'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Bad Request/)).not.toBeInTheDocument();

    await user.clear(input);
    await user.type(input, '20011');

    expect(
      screen.queryByText('GID 20010 is held by another consumer.'),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Change GID' })).toBeEnabled();
  });
});
