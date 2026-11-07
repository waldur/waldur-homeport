import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  callReviewerPoolsList,
  proposalProposalsList,
  proposalProtectedCallsCreateManualAssignment,
  proposalProtectedCallsWorkflowStepsList,
} from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';

import {
  CreateManualAssignmentDialog,
  getAssignmentRefusals,
} from './CreateManualAssignmentDialog';

const fakeCall = { uuid: 'call-uuid-1', name: 'Test Call' };

const fakeReviewer = {
  uuid: 'reviewer-pool-uuid-1',
  reviewer_name: 'Alice Reviewer',
  reviewer_email: 'alice@example.com',
  current_assignments: 1,
  max_assignments: 5,
};

const fakeProposal = {
  uuid: 'proposal-uuid-1234abcd',
  slug: 'PROP-1',
  name: 'First Proposal',
};

const renderDialog = (props: any = {}) => {
  return renderWithProviders(
    <CreateManualAssignmentDialog
      resolve={{ call: fakeCall, refetch: vi.fn(), ...props }}
    />,
  );
};

// The reviewer field is the first react-select combobox in the form
// (proposals is second). react-select exposes its text input as `combobox`.
const getReviewerCombobox = () => screen.getAllByRole('combobox')[0];

describe('CreateManualAssignmentDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(callReviewerPoolsList).mockResolvedValue({
      data: [fakeReviewer],
    } as any);
    vi.mocked(proposalProposalsList).mockResolvedValue({
      data: [fakeProposal],
    } as any);
    vi.mocked(proposalProtectedCallsCreateManualAssignment).mockResolvedValue({
      data: { items_created: 1, skipped_proposals: [] },
    } as any);
  });

  it('renders the dialog title, subtitle and form fields', async () => {
    renderDialog();

    expect(await screen.findByText('Manual assignment')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Manually assign proposals to a reviewer. A draft batch will be created which can then be sent.',
      ),
    ).toBeInTheDocument();

    // Required field labels
    expect(screen.getByText('Reviewer')).toBeInTheDocument();
    expect(screen.getByText('Proposals')).toBeInTheDocument();
    expect(screen.getByText('Notes')).toBeInTheDocument();

    // Submit button
    expect(
      screen.getByRole('button', { name: 'Create assignment' }),
    ).toBeInTheDocument();
  });

  it('queries reviewers and proposals scoped to the call', async () => {
    renderDialog();

    await waitFor(() => {
      expect(callReviewerPoolsList).toHaveBeenCalledWith({
        query: {
          call_uuid: 'call-uuid-1',
          invitation_status: ['accepted'],
          page_size: 200,
        },
      });
      expect(proposalProposalsList).toHaveBeenCalledWith({
        query: {
          call_uuid: 'call-uuid-1',
          state: ['submitted', 'in_review'],
          page_size: 200,
        },
      });
    });
  });

  it('loads and displays the reviewer option from the SDK list call', async () => {
    const user = userEvent.setup();
    renderDialog();

    await screen.findByText('Manual assignment');

    await user.click(getReviewerCombobox());

    // Reviewer option is rendered via formatOptionLabel (name + email + counts)
    expect(await screen.findByText('Alice Reviewer')).toBeInTheDocument();
    expect(
      screen.getByText(/alice@example\.com \(1\/5 assigned\)/),
    ).toBeInTheDocument();
  });

  it('shows a warning when no accepted reviewers are found', async () => {
    vi.mocked(callReviewerPoolsList).mockResolvedValue({ data: [] } as any);
    renderDialog();

    expect(
      await screen.findByText(
        'No accepted reviewers found. Invite reviewers to the pool first.',
      ),
    ).toBeInTheDocument();
  });

  it('keeps submit disabled until required fields are filled', async () => {
    renderDialog();

    await screen.findByText('Manual assignment');

    // Both reviewer and proposals are required => invalid form => disabled
    expect(
      screen.getByRole('button', { name: 'Create assignment' }),
    ).toBeDisabled();
  });

  it('keeps the proposals input mounted when the first proposal is picked', async () => {
    const user = userEvent.setup();
    renderDialog();

    await screen.findByText('Manual assignment');
    const proposals = screen.getAllByRole('combobox')[1];
    await user.click(proposals);
    await user.click(await screen.findByText('PROP-1: First Proposal'));

    expect(screen.getAllByRole('combobox')[1]).toBe(proposals);
  });

  it('pre-populates and locks the proposals field when initialProposal is given', async () => {
    renderDialog({ initialProposal: fakeProposal });

    await screen.findByText('Manual assignment');

    // The pre-selected proposal label is shown
    expect(
      await screen.findByText('PROP-1: First Proposal'),
    ).toBeInTheDocument();

    // The "no assignable proposals" warning must NOT appear with initialProposal
    expect(
      screen.queryByText(
        'No assignable proposals found. Proposals must be in submitted or in_review state.',
      ),
    ).not.toBeInTheDocument();
  });

  it('starts from the selected proposals at a review step, leaving out the rest', async () => {
    const user = userEvent.setup();
    const second = {
      uuid: 'proposal-uuid-5678efgh',
      slug: 'PROP-2',
      name: 'Second Proposal',
      state: 'in_review',
      workflow_step: 'scientific_review',
    };
    vi.mocked(proposalProtectedCallsWorkflowStepsList).mockResolvedValue({
      data: [
        { key: 'scientific_review', completer: 'reviewer' },
        { key: 'eligibility_check', completer: 'call_manager' },
      ],
    } as any);
    vi.mocked(proposalProposalsList).mockResolvedValue({
      data: [fakeProposal, second],
    } as any);
    renderDialog({
      initialProposals: [
        { ...fakeProposal, state: 'submitted' },
        second,
        { uuid: 'draft-uuid', slug: 'PROP-3', name: 'Draft', state: 'draft' },
        {
          uuid: 'eligibility-uuid',
          slug: 'PROP-4',
          name: 'At the eligibility check',
          state: 'in_review',
          workflow_step: 'eligibility_check',
        },
      ],
    });

    expect(
      await screen.findByText('Not at a review step, so left out: 2'),
    ).toBeInTheDocument();

    await user.click(getReviewerCombobox());
    await user.click(await screen.findByText('Alice Reviewer'));
    const submitBtn = screen.getByRole('button', { name: 'Create assignment' });
    await waitFor(() => expect(submitBtn).toBeEnabled());
    await user.click(submitBtn);

    await waitFor(() =>
      expect(proposalProtectedCallsCreateManualAssignment).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            proposal_uuids: [
              'proposal-uuid-1234abcd',
              'proposal-uuid-5678efgh',
            ],
          }),
        }),
      ),
    );
  });

  it("starts from every selected proposal under evaluation when no step is the reviewers'", async () => {
    vi.mocked(proposalProtectedCallsWorkflowStepsList).mockResolvedValue({
      data: [
        { key: 'administrative_check', completer: 'call_manager' },
        { key: 'individual_reports', completer: 'proposal_role' },
      ],
    } as any);
    renderDialog({
      initialProposals: [
        {
          ...fakeProposal,
          state: 'in_review',
          workflow_step: 'administrative_check',
        },
        { uuid: 'draft-uuid', slug: 'PROP-3', name: 'Draft', state: 'draft' },
      ],
    });

    expect(
      await screen.findByText('Not at a review step, so left out: 1'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`${fakeProposal.slug}: ${fakeProposal.name}`),
    ).toBeInTheDocument();
  });

  it('submits the correct path/body and reports success', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(proposalProtectedCallsCreateManualAssignment).mockResolvedValue({
      data: { items_created: 1, skipped_proposals: [] },
    } as any);

    // Pre-lock the proposal so we only need to drive the reviewer select.
    renderDialog({ refetch, initialProposal: fakeProposal });

    await screen.findByText('Manual assignment');

    await user.click(getReviewerCombobox());
    const reviewerOption = await screen.findByText('Alice Reviewer');
    await user.click(reviewerOption);

    const submitBtn = await screen.findByRole('button', {
      name: 'Create assignment',
    });
    await waitFor(() => expect(submitBtn).toBeEnabled());
    await user.click(submitBtn);

    await waitFor(() => {
      expect(proposalProtectedCallsCreateManualAssignment).toHaveBeenCalledWith(
        {
          path: { uuid: 'call-uuid-1' },
          body: {
            reviewer_pool_entry_uuid: 'reviewer-pool-uuid-1',
            proposal_uuids: ['proposal-uuid-1234abcd'],
            manager_notes: '',
          },
        },
      );
    });

    // refetch + close + success notification
    const { showSuccess } = useNotify();
    const { closeDialog } = useModal();
    await waitFor(() => {
      expect(refetch).toHaveBeenCalled();
      expect(closeDialog).toHaveBeenCalled();
      expect(showSuccess).toHaveBeenCalledWith(
        'Created assignment batch with 1 items.',
        // The batch is a draft, sent from another tab: the toast says
        // where, and links there.
        'Added to a draft assignment batch — send it from Reviewer pool › Assignment batches.',
        {
          actions: [
            expect.objectContaining({ label: 'Open assignment batches' }),
          ],
        },
      );
    });
  });

  it('reports skipped proposals in the success message', async () => {
    const user = userEvent.setup();
    vi.mocked(proposalProtectedCallsCreateManualAssignment).mockResolvedValue({
      data: { items_created: 2, skipped_proposals: ['x', 'y'] },
    } as any);

    renderDialog({ initialProposal: fakeProposal });

    await screen.findByText('Manual assignment');

    await user.click(getReviewerCombobox());
    await user.click(await screen.findByText('Alice Reviewer'));

    const submitBtn = await screen.findByRole('button', {
      name: 'Create assignment',
    });
    await waitFor(() => expect(submitBtn).toBeEnabled());
    await user.click(submitBtn);

    const { showSuccess } = useNotify();
    await waitFor(() => {
      expect(showSuccess).toHaveBeenCalledWith(
        'Created assignment batch with 2 items. 2 proposals were skipped.',
        // The batch is a draft, sent from another tab: the toast says
        // where, and links there.
        'Added to a draft assignment batch — send it from Reviewer pool › Assignment batches.',
        {
          actions: [
            expect.objectContaining({ label: 'Open assignment batches' }),
          ],
        },
      );
    });
  });

  it('does not point to a draft batch when nothing was added', async () => {
    const user = userEvent.setup();
    vi.mocked(proposalProtectedCallsCreateManualAssignment).mockResolvedValue({
      data: { items_created: 0, skipped_proposals: ['x'] },
    } as any);

    renderDialog({ initialProposal: fakeProposal });

    await screen.findByText('Manual assignment');

    await user.click(getReviewerCombobox());
    await user.click(await screen.findByText('Alice Reviewer'));

    const submitBtn = await screen.findByRole('button', {
      name: 'Create assignment',
    });
    await waitFor(() => expect(submitBtn).toBeEnabled());
    await user.click(submitBtn);

    const { showSuccess } = useNotify();
    await waitFor(() => {
      expect(showSuccess).toHaveBeenCalledWith(
        'Created assignment batch with 0 items. 1 proposals were skipped.',
      );
    });
  });

  it('surfaces backend errors via the error notification', async () => {
    const user = userEvent.setup();
    vi.mocked(proposalProtectedCallsCreateManualAssignment).mockRejectedValue({
      response: { status: 400, data: { detail: 'Bad request' } },
    } as any);

    renderDialog({ initialProposal: fakeProposal });

    await screen.findByText('Manual assignment');

    await user.click(getReviewerCombobox());
    await user.click(await screen.findByText('Alice Reviewer'));

    const submitBtn = await screen.findByRole('button', {
      name: 'Create assignment',
    });
    await waitFor(() => expect(submitBtn).toBeEnabled());
    await user.click(submitBtn);

    const { showErrorResponse } = useNotify();
    const { closeDialog } = useModal();
    await waitFor(() => {
      expect(showErrorResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          response: expect.objectContaining({ status: 400 }),
        }),
        'Failed to create manual assignment.',
      );
    });
    // Dialog must stay open on error
    expect(closeDialog).not.toHaveBeenCalled();
  });

  it('offers to assign anyway when the workload limit refuses, and retries with the override', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    // DRF's non-field error list, spread onto the error by the auth-core
    // interceptor.
    const refusal = {
      status: 400,
      0: 'Reviewer Alice Reviewer has 5 open assignments and a limit of 5, so 1 more would exceed it. Set override_workload_limit to assign anyway.',
    };
    vi.mocked(proposalProtectedCallsCreateManualAssignment)
      .mockRejectedValueOnce(refusal)
      .mockResolvedValueOnce({
        data: { items_created: 1, skipped_proposals: [] },
      } as any);

    renderDialog({ refetch, initialProposal: fakeProposal });
    await screen.findByText('Manual assignment');
    await user.click(getReviewerCombobox());
    await user.click(await screen.findByText('Alice Reviewer'));

    const submitBtn = await screen.findByRole('button', {
      name: 'Create assignment',
    });
    await waitFor(() => expect(submitBtn).toBeEnabled());
    await user.click(submitBtn);

    // The backend's reason is shown, without the API flag it names.
    expect(
      await screen.findByText(
        /Reviewer Alice Reviewer has 5 open assignments and a limit of 5, so 1 more would exceed it\./,
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/override_workload_limit/),
    ).not.toBeInTheDocument();
    const { showErrorResponse } = useNotify();
    expect(showErrorResponse).not.toHaveBeenCalled();
    const { closeDialog } = useModal();
    expect(closeDialog).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Assign anyway' }));

    await waitFor(() => {
      expect(
        proposalProtectedCallsCreateManualAssignment,
      ).toHaveBeenLastCalledWith({
        path: { uuid: 'call-uuid-1' },
        body: {
          reviewer_pool_entry_uuid: 'reviewer-pool-uuid-1',
          proposal_uuids: ['proposal-uuid-1234abcd'],
          manager_notes: '',
          override_workload_limit: true,
        },
      });
      expect(refetch).toHaveBeenCalled();
      expect(closeDialog).toHaveBeenCalled();
    });
  });

  it('does not offer the override for other refusals', async () => {
    const user = userEvent.setup();
    const refusal = { status: 400, 0: 'Proposal is not assignable.' };
    vi.mocked(proposalProtectedCallsCreateManualAssignment).mockRejectedValue(
      refusal,
    );

    renderDialog({ initialProposal: fakeProposal });
    await screen.findByText('Manual assignment');
    await user.click(getReviewerCombobox());
    await user.click(await screen.findByText('Alice Reviewer'));
    const submitBtn = await screen.findByRole('button', {
      name: 'Create assignment',
    });
    await waitFor(() => expect(submitBtn).toBeEnabled());
    await user.click(submitBtn);

    const { showErrorResponse } = useNotify();
    await waitFor(() =>
      expect(showErrorResponse).toHaveBeenCalledWith(
        refusal,
        'Failed to create manual assignment.',
      ),
    );
    expect(
      screen.queryByRole('button', { name: 'Assign anyway' }),
    ).not.toBeInTheDocument();
  });
});

describe('getAssignmentRefusals', () => {
  it("returns the backend's reasons for the reviewer and the proposals", () => {
    const error = {
      response: {
        status: 400,
        data: {
          proposal_uuids: [
            'Nothing to assign: Cryo-EM: Assignment already exists for this reviewer',
          ],
          skipped_proposals: [{ proposal_uuid: 'p1', reason: 'already' }],
        },
      },
    };
    expect(getAssignmentRefusals(error)).toEqual([
      'Nothing to assign: Cryo-EM: Assignment already exists for this reviewer',
    ]);
    expect(
      getAssignmentRefusals({
        response: {
          status: 400,
          data: {
            reviewer_pool_entry_uuid:
              'Reviewer not found in pool or not accepted.',
          },
        },
      }),
    ).toEqual(['Reviewer not found in pool or not accepted.']);
  });

  it('leaves any other error to the generic report', () => {
    expect(
      getAssignmentRefusals({ response: { status: 500, data: {} } }),
    ).toEqual([]);
    expect(getAssignmentRefusals(new Error('network'))).toEqual([]);
  });
});
