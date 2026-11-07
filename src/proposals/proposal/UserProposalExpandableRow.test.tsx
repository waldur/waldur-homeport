import { screen, waitFor } from '@testing-library/react';
import { DateTime } from 'luxon';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalProposalsRetrieve } from 'waldur-js-client';

import { showsWorkflowSteps } from '@/proposals/presentation';
import { fetchProposalWorkflowStates } from '@/proposals/workflow/queries';
import { renderWithProviders } from '@/test/harness';

import { UserProposalExpandableRow } from './UserProposalExpandableRow';

vi.mock('@/proposals/workflow/queries', () => ({
  proposalWorkflowStatesKey: (uuid: string) => ['proposalWorkflowStates', uuid],
  fetchProposalWorkflowStates: vi.fn(),
}));
vi.mock('@/proposals/presentation', () => ({
  showsWorkflowSteps: vi.fn(),
}));

const base = {
  uuid: 'proposal-1',
  name: 'Climate model',
  state: 'draft',
  round: null,
  project_summary: '',
  can_submit: { can_submit: true, error: null },
  compliance_status: null,
  open_change_requests: [],
  workflow_step: null,
  status_labels: [],
  panel_name: null,
  requested_duration_months: null,
  awarded_duration_months: null,
  project: null,
  project_name: '',
  post_award_status: null,
  open_run_uuid: null,
  open_run_phase: null,
  extension_requestable_until: null,
  final_report_openable: false,
  completed_at: null,
  allocation_comment: null,
} as any;

/**
 * The list row carries its columns' fields only; the rest comes from the
 * proposal, fetched when the row opens.
 */
const renderRow = async (overrides: Record<string, unknown>) => {
  const proposal = { ...base, ...overrides };
  vi.mocked(proposalProposalsRetrieve).mockResolvedValue({
    data: proposal,
  } as any);
  const row = {
    uuid: proposal.uuid,
    name: proposal.name,
    state: proposal.state,
    round: proposal.round,
  } as any;
  const result = renderWithProviders(<UserProposalExpandableRow row={row} />);
  // Loaded once the spinner is gone: an in-review row has no heading to
  // wait for.
  await waitFor(() =>
    expect(screen.queryByTestId('SpinnerIcon')).not.toBeInTheDocument(),
  );
  return result;
};

describe('UserProposalExpandableRow', () => {
  it('loads the proposal when the row opens, showing it is loading', () => {
    vi.mocked(proposalProposalsRetrieve).mockReturnValue(
      new Promise(() => undefined) as any,
    );
    renderWithProviders(
      <UserProposalExpandableRow
        row={{ uuid: 'proposal-1', state: 'draft' } as any}
      />,
    );
    expect(proposalProposalsRetrieve).toHaveBeenCalledWith({
      path: { uuid: 'proposal-1' },
    });
    expect(screen.queryByText('Before you submit')).toBeNull();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  beforeEach(() => {
    vi.mocked(showsWorkflowSteps).mockReturnValue(true);
    vi.mocked(fetchProposalWorkflowStates).mockReset();
    vi.mocked(proposalProposalsRetrieve).mockReset();
    vi.mocked(fetchProposalWorkflowStates).mockResolvedValue([]);
  });

  describe('a draft', () => {
    it('is ready to submit when nothing blocks it', async () => {
      await renderRow({ project_summary: 'Finer meshes over the Alps.' });
      expect(screen.getByText('Ready to submit')).toBeInTheDocument();
      expect(
        screen.getByText('Finer meshes over the Alps.'),
      ).toBeInTheDocument();
    });

    it('says what is missing, the checklist and the deadline', async () => {
      const cutoff = DateTime.now().plus({ days: 3 }).toISO();
      await renderRow({
        can_submit: { can_submit: false, error: 'Choose a duration.' },
        compliance_status: {
          has_checklist: true,
          is_completed: false,
          requires_review: false,
          completion_percentage: 40,
          unanswered_required_count: 2,
        },
        round: { uuid: 'r1', name: 'Autumn', cutoff_time: cutoff },
      });
      expect(screen.queryByText('Ready to submit')).toBeNull();
      expect(screen.getByText('Not ready yet')).toBeInTheDocument();
      expect(screen.getByText('Choose a duration.')).toBeInTheDocument();
      expect(screen.getByText(/40% complete/)).toBeInTheDocument();
      expect(
        screen.getByText('(2 required questions unanswered)'),
      ).toBeInTheDocument();
      expect(screen.getByText(/in [23] days/)).toBeInTheDocument();
    });

    it('is not called ready with required questions unanswered', async () => {
      await renderRow({
        compliance_status: {
          has_checklist: true,
          is_completed: false,
          requires_review: false,
          completion_percentage: 60,
          unanswered_required_count: 1,
        },
      });
      expect(screen.queryByText('Ready to submit')).toBeNull();
      expect(screen.getByText('Not ready yet')).toBeInTheDocument();
      expect(
        screen.getByText('(1 required question unanswered)'),
      ).toBeInTheDocument();
    });

    it('leaves out the summary and the checklist it does not have', async () => {
      await renderRow({});
      expect(screen.queryByText('Summary:')).toBeNull();
      expect(screen.queryByText('Compliance checklist:')).toBeNull();
      expect(screen.queryByText('Round deadline:')).toBeNull();
    });
  });

  describe('in review', () => {
    it('names the stage with the labels the call configured', async () => {
      await renderRow({
        state: 'in_review',
        workflow_step: 'admin_check',
        status_labels: [{ step: 'admin_check', label: 'Being checked' }],
        panel_name: 'Physics panel',
      });
      expect(screen.getByText('Being checked')).toBeInTheDocument();
      expect(screen.getByText('Physics panel')).toBeInTheDocument();
      expect(fetchProposalWorkflowStates).not.toHaveBeenCalled();
    });

    it('stands an internal step under the name of its stage', async () => {
      vi.mocked(fetchProposalWorkflowStates).mockResolvedValue([
        {
          step: 'internal_scoring',
          step_name: 'Internal scoring',
          status: 'active',
          applicant_visible: false,
          kind: 'review',
          stage: 1,
        },
      ] as any);
      await renderRow({
        state: 'in_review',
        workflow_step: 'internal_scoring',
      });
      expect(await screen.findByText('Internal check')).toBeInTheDocument();
      expect(screen.queryByText('Internal scoring')).toBeNull();
    });

    it('falls back to the state without a step', async () => {
      await renderRow({ state: 'submitted' });
      expect(screen.getByText(/^Submitted/)).toBeInTheDocument();
      expect(fetchProposalWorkflowStates).not.toHaveBeenCalled();
    });

    it('calls for the changes requested, with the way to the form', async () => {
      await renderRow({
        state: 'in_review',
        status_labels: [{ step: 's', label: 'Under review' }],
        open_change_requests: [
          {
            uuid: 'cr-1',
            step_uuid: 'step-1',
            step_name: 'Technical assessment',
            message: 'Describe the workload',
            unlocked_parts: ['resources'],
            due_at: null,
          },
        ],
      });
      expect(
        screen.getByText('Changes requested at Technical assessment'),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'Make the changes' }),
      ).toBeInTheDocument();
    });

    it('raises no call to action without changes requested', async () => {
      await renderRow({
        state: 'in_review',
        status_labels: [{ step: 's', label: 'Under review' }],
      });
      expect(screen.queryByTestId('changes-requested-callout')).toBeNull();
    });
  });

  describe('accepted', () => {
    it('flags an awarded duration that differs from the request', async () => {
      await renderRow({
        state: 'accepted',
        requested_duration_months: 12,
        awarded_duration_months: 6,
        project: 'https://example.com/api/projects/project-1/',
        project_name: 'Climate project',
      });
      expect(screen.getByText('6 months')).toBeInTheDocument();
      expect(screen.getByText('Requested: 12 months')).toBeInTheDocument();
      expect(screen.getByText('Changed')).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'Climate project' }),
      ).toBeInTheDocument();
    });

    it('awards as requested without a flag', async () => {
      await renderRow({
        state: 'accepted',
        requested_duration_months: 12,
        awarded_duration_months: 12,
      });
      expect(screen.getByText('12 months')).toBeInTheDocument();
      expect(screen.queryByText('Changed')).toBeNull();
      expect(screen.queryByTestId('proposal-row-post-award')).toBeNull();
    });

    it('shows the post-award work and where it is done', async () => {
      await renderRow({
        state: 'accepted',
        project: 'https://example.com/api/projects/project-1/',
        project_name: 'Climate project',
        extension_requestable_until: DateTime.now()
          .plus({ months: 2 })
          .toISODate(),
        final_report_openable: true,
      });
      expect(screen.getByText(/Can be requested until/)).toBeInTheDocument();
      expect(screen.getByText('Can be opened now')).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'Go to post-award work' }),
      ).toBeInTheDocument();
    });

    it('shows a run in progress', async () => {
      await renderRow({
        state: 'accepted',
        open_run_uuid: 'run-1',
        open_run_phase: 'extension',
        post_award_status: 'extension_in_assessment',
      });
      expect(screen.getByText('Extension request')).toBeInTheDocument();
      expect(
        screen.getByText('Pending extension request assessment'),
      ).toBeInTheDocument();
    });
  });

  describe('closed', () => {
    it('shows the comment released with the decision', async () => {
      await renderRow({
        state: 'rejected',
        allocation_comment: 'Insufficient technical detail',
      });
      expect(
        screen.getByText('Insufficient technical detail'),
      ).toBeInTheDocument();
    });

    it('says when no comment was shared', async () => {
      await renderRow({ state: 'canceled' });
      expect(
        screen.getByText('No comment was shared with the decision.'),
      ).toBeInTheDocument();
    });
  });

  describe('dates', () => {
    beforeEach(() => {
      vi.mocked(fetchProposalWorkflowStates).mockResolvedValue([]);
    });

    it('shows when a draft was created, and no submission yet', async () => {
      await renderRow({ created: '2026-11-02T09:15:00Z', submitted_at: null });
      expect(screen.getByText(/^Created/)).toBeInTheDocument();
      expect(screen.queryByText(/^Submitted/)).not.toBeInTheDocument();
    });

    it('shows when a proposal was submitted', async () => {
      await renderRow({
        state: 'submitted',
        created: '2026-11-02T09:15:00Z',
        submitted_at: '2026-11-04T16:40:00Z',
      });
      expect(screen.getByText(/^Created/)).toBeInTheDocument();
      // Once as its stage, once as the date's label.
      expect(screen.getAllByText(/^Submitted/)).toHaveLength(2);
    });
  });
});
