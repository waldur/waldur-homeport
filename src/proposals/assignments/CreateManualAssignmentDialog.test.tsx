import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  callReviewerPoolsList,
  proposalProposalsList,
  proposalProtectedCallsCreateManualAssignment,
} from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';

import { CreateManualAssignmentDialog } from './CreateManualAssignmentDialog';

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
      );
    });
  });

  it('surfaces backend errors via the error notification', async () => {
    const user = userEvent.setup();
    // NOTE: the component's onSubmit returns `mutateAsync(values)` without a
    // `.catch`, so a failed mutation rejects the react-final-form submit
    // promise. `useManagedMutation` already reports the error via
    // `showErrorResponse`, but the rejection still escapes as "unhandled".
    // We swallow it here so this expected-error path doesn't fail the run.
    const onUnhandled = () => {};
    process.on('unhandledRejection', onUnhandled);

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

    process.off('unhandledRejection', onUnhandled);
  });
});
