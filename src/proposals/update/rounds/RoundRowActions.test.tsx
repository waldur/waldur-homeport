import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { RoundRowActions } from './RoundRowActions';

const call = { uuid: 'call-uuid', state: 'active' } as any;
const row = {
  uuid: 'round-uuid',
  name: 'Round 1',
  status: 'ended',
  lifecycle_state: 'deciding',
  proposals: [],
  has_proposals: false,
} as any;

const renderMenu = (canUpdate: boolean, canCloseRounds: boolean) =>
  renderWithProviders(
    <RoundRowActions
      row={row}
      call={call}
      refetch={() => undefined}
      canUpdate={canUpdate}
      canCloseRounds={canCloseRounds}
    />,
  );

const openMenu = async () => {
  const { default: userEvent } = await import('@testing-library/user-event');
  await userEvent.setup().click(screen.getByRole('button'));
};

describe('RoundRowActions', () => {
  it('offers the lifecycle but no edits with CALL.CLOSE_ROUNDS alone', async () => {
    renderMenu(false, true);
    await openMenu();
    expect(await screen.findByText('Publish results')).toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('offers the edits but no lifecycle with CALL.UPDATE alone', async () => {
    renderMenu(true, false);
    await openMenu();
    expect(await screen.findByText('Delete')).toBeInTheDocument();
    expect(screen.queryByText('Publish results')).not.toBeInTheDocument();
  });
});
