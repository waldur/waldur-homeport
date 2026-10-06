import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  proposalProposalsReopenDecision,
  proposalProposalsWorkflowStatesList,
} from 'waldur-js-client';

import { ENV } from '@/core/config';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { ReopenDecisionDialog } from '../workflow/ReopenDecisionDialog';

import { WorkflowStepActions } from './WorkflowStepActions';

const proposal = {
  uuid: 'proposal-uuid',
  call_uuid: 'call-uuid',
  call_managing_organisation_uuid: 'org-uuid',
  created_by_uuid: 'applicant-uuid',
  awaiting_manual_advance: false,
  decision_held: true,
} as any;

const onCall = (role_name: string) => ({
  role_name,
  scope_type: 'call',
  scope_uuid: 'call-uuid',
  customer_uuid: 'customer-uuid',
});

const callManager = {
  uuid: 'manager-uuid',
  permissions: [onCall('CALL.MANAGER')],
};

const renderActions = (props: Partial<typeof proposal> = {}) =>
  renderWithProviders(
    <WorkflowStepActions
      proposal={{ ...proposal, ...props }}
      refetch={vi.fn()}
    />,
  );

const reopenButton = () =>
  screen.queryByRole('button', { name: /Reopen decision/ });

describe('WorkflowStepActions reopen decision', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
      {
        name: 'CALL.MANAGER',
        permissions: [
          PermissionEnum.UPDATE_CALL,
          PermissionEnum.APPROVE_AND_REJECT_PROPOSALS,
        ],
      },
      {
        name: 'CALL.REVIEWER',
        permissions: [PermissionEnum.APPROVE_AND_REJECT_PROPOSALS],
      },
    ] as any);
    vi.mocked(proposalProposalsWorkflowStatesList).mockResolvedValue({
      data: [],
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.mocked(useUser).mockReturnValue({} as any);
  });

  it('is offered to a call manager while the decision is held', () => {
    vi.mocked(useUser).mockReturnValue(callManager as any);
    renderActions();
    expect(reopenButton()).toBeInTheDocument();
  });

  it('is offered to staff', () => {
    vi.mocked(useUser).mockReturnValue({
      uuid: 'staff',
      is_staff: true,
    } as any);
    renderActions();
    expect(reopenButton()).toBeInTheDocument();
  });

  it('is not offered when no decision is held', () => {
    vi.mocked(useUser).mockReturnValue(callManager as any);
    renderActions({ decision_held: false });
    expect(reopenButton()).not.toBeInTheDocument();
    renderActions({ decision_held: null });
    expect(reopenButton()).not.toBeInTheDocument();
  });

  it.each(['results_published', 'closed'])(
    'is not offered once the round is %s',
    (lifecycle_state) => {
      vi.mocked(useUser).mockReturnValue(callManager as any);
      renderActions({ round: { lifecycle_state } });
      expect(reopenButton()).not.toBeInTheDocument();
    },
  );

  it.each(['evaluating', 'deciding'])(
    'is offered while the round is %s',
    (lifecycle_state) => {
      vi.mocked(useUser).mockReturnValue(callManager as any);
      renderActions({ round: { lifecycle_state } });
      expect(reopenButton()).toBeInTheDocument();
    },
  );

  it('is not offered to support, who may only read the held decision', () => {
    vi.mocked(useUser).mockReturnValue({
      uuid: 'support',
      is_support: true,
      permissions: [],
    } as any);
    renderActions();
    expect(reopenButton()).not.toBeInTheDocument();
  });

  it('is not offered to a role without CALL.UPDATE', () => {
    vi.mocked(useUser).mockReturnValue({
      uuid: 'reviewer',
      permissions: [onCall('CALL.REVIEWER')],
    } as any);
    renderActions();
    expect(reopenButton()).not.toBeInTheDocument();
  });

  it('is not offered to an applicant who also manages the call', () => {
    vi.mocked(useUser).mockReturnValue({
      ...callManager,
      uuid: 'applicant-uuid',
    } as any);
    renderActions();
    expect(reopenButton()).not.toBeInTheDocument();
  });

  it('opens the reopen dialog', async () => {
    const user = userEvent.setup();
    vi.mocked(useUser).mockReturnValue(callManager as any);
    renderActions();

    await user.click(reopenButton()!);

    const [component, dialogProps] = vi.mocked(useModal().openDialog).mock
      .lastCall as any;
    expect(component).toBe(ReopenDecisionDialog);
    expect(dialogProps.resolve.proposal.uuid).toBe('proposal-uuid');
  });
});

describe('ReopenDecisionDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requires a reason', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReopenDecisionDialog resolve={{ proposal }} />);

    expect(
      screen.getByRole('button', { name: 'Reopen decision' }),
    ).toBeDisabled();
    await user.type(
      screen.getByRole('textbox', { name: /Reason/ }),
      'Board changed it',
    );
    expect(
      screen.getByRole('button', { name: 'Reopen decision' }),
    ).toBeEnabled();
  });

  it('refuses a reason of spaces alone', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReopenDecisionDialog resolve={{ proposal }} />);

    await user.type(screen.getByRole('textbox', { name: /Reason/ }), '   ');
    expect(
      screen.getByRole('button', { name: 'Reopen decision' }),
    ).toBeDisabled();
  });

  it('tells the manager that the applicant team sees the reopening only after publication', () => {
    renderWithProviders(<ReopenDecisionDialog resolve={{ proposal }} />);
    expect(
      screen.getByText(/sees that entry only once the round publishes/),
    ).toBeInTheDocument();
  });

  it('sends the reason without a deadline and refreshes the workflow', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(proposalProposalsReopenDecision).mockResolvedValue({
      data: {},
    } as any);
    const { queryClient } = renderWithProviders(
      <ReopenDecisionDialog resolve={{ proposal, refetch }} />,
    );
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

    await user.type(
      screen.getByRole('textbox', { name: /Reason/ }),
      '  Board changed it ',
    );
    await user.click(screen.getByRole('button', { name: 'Reopen decision' }));

    await waitFor(() =>
      expect(proposalProposalsReopenDecision).toHaveBeenCalledWith({
        path: { uuid: 'proposal-uuid' },
        body: { reason: 'Board changed it', deadline: null },
      }),
    );
    await waitFor(() => expect(refetch).toHaveBeenCalled());
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['proposalWorkflowStates', 'proposal-uuid'],
    });
  });
});
