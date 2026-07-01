import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalProtectedCallsWorkflowStepsPartialUpdate } from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';

import { WorkflowStepToggleAction } from './WorkflowStepToggleAction';

// The modal mock (test/mocks/modal.js) makes confirm() resolve by default,
// i.e. the user accepts the cascade warning.
const confirmMock = vi.mocked(useModal().confirm);

const call = { uuid: 'call-uuid' } as any;

const makeStep = (step: string, is_enabled: boolean) =>
  ({
    uuid: `${step}-uuid`,
    step,
    is_enabled,
    responsible_role: null,
    transition_mode: 'automatic_on_completion',
  }) as any;

const renderToggle = (row: any, steps: any[], refetch = vi.fn()) =>
  renderWithProviders(
    <WorkflowStepToggleAction
      row={row}
      call={call}
      steps={steps}
      refetch={refetch}
    />,
  );

describe('WorkflowStepToggleAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(
      proposalProtectedCallsWorkflowStepsPartialUpdate,
    ).mockResolvedValue({} as any);
  });

  it('cascades the disable to enabled dependents', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    const expert = makeStep('expert_review', true);
    const panel = makeStep('panel_review', true);
    renderToggle(expert, [expert, panel], refetch);

    await user.click(screen.getByText('Disable'));

    await waitFor(() =>
      expect(
        proposalProtectedCallsWorkflowStepsPartialUpdate,
      ).toHaveBeenCalledTimes(2),
    );
    expect(
      proposalProtectedCallsWorkflowStepsPartialUpdate,
    ).toHaveBeenCalledWith({
      path: { uuid: 'call-uuid', obj_uuid: 'expert_review-uuid' },
      body: { is_enabled: false },
    });
    expect(
      proposalProtectedCallsWorkflowStepsPartialUpdate,
    ).toHaveBeenCalledWith({
      path: { uuid: 'call-uuid', obj_uuid: 'panel_review-uuid' },
      body: { is_enabled: false },
    });
    expect(refetch).toHaveBeenCalled();
    // The user is warned before the dependent is silently disabled.
    expect(confirmMock).toHaveBeenCalledTimes(1);
  });

  it('does not warn or cascade when no dependents are enabled', async () => {
    const user = userEvent.setup();
    const expert = makeStep('expert_review', true);
    const panel = makeStep('panel_review', false);
    renderToggle(expert, [expert, panel]);

    await user.click(screen.getByText('Disable'));

    await waitFor(() =>
      expect(
        proposalProtectedCallsWorkflowStepsPartialUpdate,
      ).toHaveBeenCalledTimes(1),
    );
    // A plain disable (no dependents affected) stays a one-click action.
    expect(confirmMock).not.toHaveBeenCalled();
  });

  it('does not disable anything when the cascade warning is cancelled', async () => {
    const user = userEvent.setup();
    const expert = makeStep('expert_review', true);
    const panel = makeStep('panel_review', true);
    confirmMock.mockRejectedValueOnce(new Error('cancelled'));
    renderToggle(expert, [expert, panel]);

    await user.click(screen.getByText('Disable'));

    await waitFor(() => expect(confirmMock).toHaveBeenCalledTimes(1));
    expect(
      proposalProtectedCallsWorkflowStepsPartialUpdate,
    ).not.toHaveBeenCalled();
  });

  it('blocks enabling a dependent while its dependency is disabled', async () => {
    const user = userEvent.setup();
    const expert = makeStep('expert_review', false);
    const panel = makeStep('panel_review', false);
    renderToggle(panel, [expert, panel]);

    await user.click(screen.getByText('Enable'));

    // The action is disabled — clicking it must not hit the backend, which
    // would otherwise reject with "requires Expert review to be enabled".
    expect(
      proposalProtectedCallsWorkflowStepsPartialUpdate,
    ).not.toHaveBeenCalled();
    expect(screen.getByTestId('action-item-content')).toHaveClass('opacity-50');
  });

  it('allows enabling a dependent once its dependency is enabled', async () => {
    const user = userEvent.setup();
    const expert = makeStep('expert_review', true);
    const panel = makeStep('panel_review', false);
    renderToggle(panel, [expert, panel]);

    await user.click(screen.getByText('Enable'));

    await waitFor(() =>
      expect(
        proposalProtectedCallsWorkflowStepsPartialUpdate,
      ).toHaveBeenCalledWith({
        path: { uuid: 'call-uuid', obj_uuid: 'panel_review-uuid' },
        body: { is_enabled: true },
      }),
    );
  });

  it('still reconciles the table when a cascaded update fails', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    const expert = makeStep('expert_review', true);
    const panel = makeStep('panel_review', true);
    // The cascade fires two PATCHes; one rejects. The table must still
    // refetch so it never diverges from the (partially-updated) backend.
    vi.mocked(proposalProtectedCallsWorkflowStepsPartialUpdate)
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValue({} as any);
    renderToggle(expert, [expert, panel], refetch);

    await user.click(screen.getByText('Disable'));

    await waitFor(() => expect(refetch).toHaveBeenCalled());
  });
});
