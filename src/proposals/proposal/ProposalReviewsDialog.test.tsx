import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  assignmentBatchesList,
  assignmentItemsList,
  proposalProtectedCallsWorkflowStepsList,
  proposalReviewsList,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { ProposalReviewsDialog } from './ProposalReviewsDialog';
import { reviewStage } from './reviewStage';

vi.mock('@/table/Table', () => ({
  default: ({ verboseName, rows, columns }) => (
    <div data-testid="table" aria-label={verboseName}>
      {(rows ?? []).map((row, index) => (
        <div key={index}>
          {columns.filter(Boolean).map((column, i) => (
            <span key={i} aria-label={column.title}>
              {column.render({ row })}
            </span>
          ))}
        </div>
      ))}
    </div>
  ),
}));
vi.mock('waldur-table/src/useTable', async () => {
  const { useEffect, useState } = await import('react');
  return {
    useTable: ({ fetchData, filter }) => {
      const [rows, setRows] = useState([]);
      useEffect(() => {
        fetchData().then((result) => setRows(result.rows));
      }, [fetchData, filter]);
      return { rows };
    },
  };
});

const proposal = {
  uuid: 'proposal-1',
  call_uuid: 'call-1',
  name: 'Lattice QCD',
} as any;

const step = (overrides) => ({
  uuid: `state-${overrides.step}`,
  call_step_uuid: `cs-${overrides.step}`,
  contributor_source: 'none',
  outcome_set: 'done',
  status: 'completed',
  ...overrides,
});

const submission = step({
  step: 'submission',
  step_name: 'Submission',
  order: 1,
});
const questions = step({
  step: 'questions',
  step_name: "Rapporteurs' questions",
  order: 2,
  status: 'active',
});
const review = (status: string) =>
  step({
    step: 'scientific_review',
    step_name: 'Scientific review',
    order: 3,
    status,
    contributor_source: 'assigned_reviewers',
    outcome_set: 'reviewed',
  });

// No `response`: getAllPages stops after a result without one.
const page = (data) => ({ data }) as any;

const renderDialog = (workflowStates) =>
  renderWithProviders(
    <ProposalReviewsDialog
      proposal={proposal}
      workflowStates={workflowStates as any}
    />,
  );

describe('ProposalReviewsDialog without reviews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(proposalReviewsList).mockResolvedValue(page([]));
    vi.mocked(assignmentItemsList).mockResolvedValue(page([]));
    vi.mocked(assignmentBatchesList).mockResolvedValue(page([]));
  });

  it('says when the workflow has no review step', async () => {
    renderDialog([submission, questions]);
    expect(
      await screen.findByText("This call's workflow has no review step."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Search again/)).not.toBeInTheDocument();
  });

  it('says when the review step was skipped', async () => {
    renderDialog([submission, questions, review('skipped')]);
    expect(
      await screen.findByText(
        'The Scientific review step was skipped for this proposal.',
      ),
    ).toBeInTheDocument();
  });

  it('says when the reviews start', async () => {
    renderDialog([submission, questions, review('pending')]);
    expect(
      await screen.findByText(
        "Reviews start at Scientific review, after Rapporteurs' questions.",
      ),
    ).toBeInTheDocument();
    expect(assignmentItemsList).not.toHaveBeenCalled();
  });

  it('lists the reviewers asked while none has reviewed', async () => {
    vi.mocked(assignmentItemsList).mockResolvedValue(
      page([
        {
          uuid: 'item-1',
          batch: 'batch-url-1',
          status: 'pending',
          status_display: 'Pending',
          responded_at: null,
        },
        {
          uuid: 'item-2',
          batch: 'batch-url-2',
          status: 'declined',
          status_display: 'Declined',
          responded_at: '2026-10-01T10:00:00Z',
        },
      ]),
    );
    vi.mocked(assignmentBatchesList).mockResolvedValue(
      page([
        { url: 'batch-url-1', reviewer_name: 'Marie Curie' },
        { url: 'batch-url-2', reviewer_name: 'Enrico Fermi' },
      ]),
    );
    renderDialog([submission, review('active')]);
    expect(await screen.findByText('Marie Curie')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Enrico Fermi')).toBeInTheDocument();
    expect(screen.getByText('Declined')).toBeInTheDocument();
    expect(assignmentItemsList).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({ proposal_uuid: 'proposal-1' }),
      }),
    );
  });

  it('says when no reviewer has been assigned', async () => {
    renderDialog([submission, review('active')]);
    expect(
      await screen.findByText('No reviewer has been assigned yet.'),
    ).toBeInTheDocument();
  });

  it('says so too when the assignments may not be read', async () => {
    vi.mocked(assignmentItemsList).mockRejectedValue({
      response: { status: 403 },
    });
    renderDialog([submission, review('active')]);
    expect(
      await screen.findByText('No reviewer has been assigned yet.'),
    ).toBeInTheDocument();
  });
});

describe('ProposalReviewsDialog with reviews', () => {
  it('says where the review step stands above the reviews', async () => {
    vi.mocked(proposalReviewsList).mockResolvedValue(
      page([
        { uuid: 'r-1', state: 'submitted', reviewer_full_name: 'Marie Curie' },
        { uuid: 'r-2', state: 'submitted', reviewer_full_name: 'Enrico Fermi' },
        { uuid: 'r-3', state: 'in_review', reviewer_full_name: 'Lise Meitner' },
        { uuid: 'r-4', state: 'rejected', reviewer_full_name: 'Niels Bohr' },
      ]),
    );
    vi.mocked(proposalProtectedCallsWorkflowStepsList).mockResolvedValue({
      data: [{ uuid: 'cs-scientific_review', min_reviewers: 3 }],
    } as any);
    renderDialog([submission, review('active')]);

    expect(
      await screen.findByText(
        'Scientific review · In progress · 2 of 3 reviews submitted · minimum 3',
      ),
    ).toBeInTheDocument();
    expect(await screen.findByText('Lise Meitner')).toBeInTheDocument();
  });
});

describe('ProposalReviewsDialog for the applicant', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderForApplicant = () =>
    renderWithProviders(
      <ProposalReviewsDialog
        proposal={proposal}
        workflowStates={[submission, review('completed')] as any}
        forApplicant
      />,
    );

  it('lists the shared reviews without how the review step is run', async () => {
    vi.mocked(proposalReviewsList).mockResolvedValue(
      page([
        {
          uuid: 'r-1',
          state: 'submitted',
          anonymous_reviewer_name: 'Reviewer 1',
          summary_score: 4,
          review_end_date: '2026-10-01',
        },
      ]),
    );
    renderForApplicant();

    expect(await screen.findByText('Reviewer 1')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.queryByTestId('review-status-line')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Review due')).not.toBeInTheDocument();
    expect(proposalProtectedCallsWorkflowStepsList).not.toHaveBeenCalled();
  });

  it('never asks for the assignments', async () => {
    vi.mocked(proposalReviewsList).mockResolvedValue(page([]));
    renderForApplicant();

    expect(
      await screen.findByText('No review has been shared with you yet.'),
    ).toBeInTheDocument();
    expect(assignmentItemsList).not.toHaveBeenCalled();
  });
});

describe('reviewStage', () => {
  it('prefers the review step running over one skipped', () => {
    const skipped = { ...review('skipped'), uuid: 'a', order: 3 };
    const running = { ...review('active'), uuid: 'b', order: 4 };
    expect(reviewStage([skipped, running])).toEqual({
      kind: 'started',
      step: running,
    });
  });
});
