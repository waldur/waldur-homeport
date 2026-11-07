import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalProtectedCallsWorkflowStepsPartialUpdate } from 'waldur-js-client';

import { inActionsMenu, renderWithProviders } from '@/test/harness';

import {
  getMoveTarget,
  WorkflowStepMoveAction,
} from './WorkflowStepMoveAction';

// Orders need not be contiguous: steps removed or moved leave gaps.
const steps = [
  { uuid: 'check', order: 0 },
  { uuid: 'report', order: 3 },
  { uuid: 'panel', order: 4 },
  { uuid: 'decision', order: 7 },
] as any[];

describe('getMoveTarget', () => {
  // The backend moves the step at the requested order, and every later one,
  // one down to make room.
  it("moving up takes the previous step's place", () => {
    expect(getMoveTarget(steps[2], steps, 'up')).toBe(3);
  });

  it('moving down lands right after the next step', () => {
    expect(getMoveTarget(steps[1], steps, 'down')).toBe(5);
  });

  it('cannot move the first step up or the last one down', () => {
    expect(getMoveTarget(steps[0], steps, 'up')).toBeUndefined();
    expect(getMoveTarget(steps[3], steps, 'down')).toBeUndefined();
  });
});

describe('WorkflowStepMoveAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(
      proposalProtectedCallsWorkflowStepsPartialUpdate,
    ).mockResolvedValue({} as any);
  });

  const renderMove = (row, direction: 'up' | 'down', refetch = vi.fn()) =>
    renderWithProviders(
      inActionsMenu(
        <WorkflowStepMoveAction
          row={row}
          call={{ uuid: 'call-uuid' } as any}
          steps={steps}
          direction={direction}
          refetch={refetch}
        />,
      ),
    );

  it('persists the new position as the step order', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    renderMove(steps[2], 'up', refetch);

    await user.click(screen.getByText('Move up'));

    await waitFor(() => expect(refetch).toHaveBeenCalled());
    expect(
      proposalProtectedCallsWorkflowStepsPartialUpdate,
    ).toHaveBeenCalledWith({
      path: { uuid: 'call-uuid', obj_uuid: 'panel' },
      body: { order: 3 },
    });
  });

  it('does nothing past the end of the workflow', async () => {
    const user = userEvent.setup();
    renderMove(steps[3], 'down');

    await user.click(screen.getByText('Move down'));

    expect(
      proposalProtectedCallsWorkflowStepsPartialUpdate,
    ).not.toHaveBeenCalled();
  });
});
