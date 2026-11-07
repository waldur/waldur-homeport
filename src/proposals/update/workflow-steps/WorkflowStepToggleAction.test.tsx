import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalProtectedCallsWorkflowStepsPartialUpdate } from 'waldur-js-client';

import { inActionsMenu, renderWithProviders } from '@/test/harness';

import { WorkflowStepToggleAction } from './WorkflowStepToggleAction';

const call = { uuid: 'call-uuid' } as any;

const makeStep = (overrides = {}) =>
  ({
    uuid: 'step-uuid',
    key: 'individual-report',
    kind: 'assessment',
    is_enabled: true,
    is_mandatory: false,
    ...overrides,
  }) as any;

const renderToggle = (row: any, refetch = vi.fn()) =>
  renderWithProviders(
    inActionsMenu(
      <WorkflowStepToggleAction row={row} call={call} refetch={refetch} />,
    ),
  );

describe('WorkflowStepToggleAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(
      proposalProtectedCallsWorkflowStepsPartialUpdate,
    ).mockResolvedValue({} as any);
  });

  it('turns an enabled step off, and that step only', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    renderToggle(makeStep(), refetch);

    await user.click(screen.getByText('Disable'));

    await waitFor(() => expect(refetch).toHaveBeenCalled());
    expect(
      proposalProtectedCallsWorkflowStepsPartialUpdate,
    ).toHaveBeenCalledTimes(1);
    expect(
      proposalProtectedCallsWorkflowStepsPartialUpdate,
    ).toHaveBeenCalledWith({
      path: { uuid: 'call-uuid', obj_uuid: 'step-uuid' },
      body: { is_enabled: false },
    });
  });

  it('turns a disabled step on', async () => {
    const user = userEvent.setup();
    renderToggle(makeStep({ is_enabled: false }));

    await user.click(screen.getByText('Enable'));

    await waitFor(() =>
      expect(
        proposalProtectedCallsWorkflowStepsPartialUpdate,
      ).toHaveBeenCalledWith({
        path: { uuid: 'call-uuid', obj_uuid: 'step-uuid' },
        body: { is_enabled: true },
      }),
    );
  });

  // The backend refuses to disable the allocation decision.
  it('offers nothing on the allocation decision', () => {
    renderToggle(
      makeStep({ is_mandatory: true, is_allocation_decision: true }),
    );

    expect(screen.queryByText('Disable')).not.toBeInTheDocument();
  });
});
