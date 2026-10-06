import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { inActionsMenu, renderWithProviders } from '@/test/harness';

import { RoundDeleteAction } from './RoundDeleteAction';

const call = { uuid: 'call-uuid', state: 'active' } as any;

const renderDelete = (round: Record<string, unknown>) =>
  renderWithProviders(
    inActionsMenu(
      <RoundDeleteAction
        row={{ uuid: 'round-uuid', name: 'Round 1', ...round } as any}
        call={call}
        refetch={() => undefined}
      />,
    ),
  );

const deleteItem = () => screen.getByRole('menuitem', { name: 'Delete' });

describe('RoundDeleteAction', () => {
  it('offers to delete a round without proposals', () => {
    renderDelete({ proposals: [], has_proposals: false });
    expect(deleteItem()).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('refuses a round that has proposals', () => {
    renderDelete({ proposals: [{ uuid: 'p1' }], has_proposals: true });
    expect(deleteItem()).toHaveAttribute('aria-disabled', 'true');
  });

  // The proposals list leaves out what the viewer is not shown; the flag
  // counts every proposal, so it decides when the two disagree.
  it('refuses a round whose proposals the viewer is not shown', () => {
    renderDelete({ proposals: [], has_proposals: true });
    expect(deleteItem()).toHaveAttribute('aria-disabled', 'true');
  });

  it('falls back to the proposals list when the flag is absent', () => {
    renderDelete({ proposals: [{ uuid: 'p1' }] });
    expect(deleteItem()).toHaveAttribute('aria-disabled', 'true');
  });
});
