import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as sdk from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { DryRunPreview } from './DryRunPreview';

// The SDK is mocked for every test (test/setupTests.js): a call would be
// recorded on its functions.

vi.mock('@/proposals/presentation', () => ({
  usesCallVocabulary: () => true,
  showsWorkflowSteps: () => true,
}));

const PROPOSAL = 'f00000000000000000000000000000aa';

const state = (overrides: Record<string, any>) => ({
  uuid: `${overrides.step}-uuid`,
  call_step_uuid: `${overrides.step}-call-step`,
  status: 'completed',
  applicant_visible: true,
  rejection_reason: null,
  responsible_role: null,
  outcome: null,
  deadline: null,
  completed_at: null,
  input_step_uuids: [],
  ...overrides,
});

const view = (overrides: Record<string, any> = {}) =>
  ({
    role: 'applicant',
    offering: null,
    at: null,
    viewer: {
      uuid: 'viewer',
      username: 'dry-run-1',
      full_name: 'Example applicant',
      is_staff: false,
      is_support: false,
      permissions: [],
    },
    described_as: 'the applicant',
    proposal_uuid: PROPOSAL,
    responses: {
      me: { status: 200, data: { uuid: 'viewer', permissions: [] } },
      proposal: {
        status: 200,
        data: {
          uuid: PROPOSAL,
          name: 'Example proposal',
          state: 'in_review',
          created_by_uuid: 'viewer',
        },
      },
      workflow_states: {
        status: 200,
        data: [
          state({
            step: 'administrative_check',
            step_name: 'Administrative check',
            outcome: null,
          }),
          state({
            step: 'technical_assessment',
            step_name: 'Technical assessment',
            status: 'active',
            applicant_visible: false,
          }),
        ],
      },
      contributions: { status: 200, data: [] },
      offering_assessments: { status: 403, data: { detail: '' } },
      change_requests: { status: 200, data: [] },
      released_reports: { status: 403, data: { detail: '' } },
      ...overrides,
    },
  }) as any;

const Wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={createStore(() => ({ workspace: { user: null } }))}>
    {children}
  </Provider>
);

describe('DryRunPreview', () => {
  const fetchSpy = vi.fn();
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = fetchSpy as any;
  });
  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.clearAllMocks();
  });

  it('renders the real components from the seeded responses without fetching', async () => {
    renderWithProviders(
      <DryRunPreview
        view={view()}
        roleLabel="Example applicant (the applicant)"
        pointLabel="Administrative check is completed: eligible."
      />,
      { wrapper: Wrapper },
    );
    expect(
      await screen.findByTestId('dry-run-preview-page'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Preview as Example applicant \(the applicant\)/),
    ).toBeInTheDocument();
    await userEvent.hover(
      screen.getByRole('button', { name: 'Different from your view' }),
    );
    expect(
      await screen.findByText('Outcome hidden on the only completed step.'),
    ).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
    [
      sdk.proposalProposalsWorkflowStatesList,
      sdk.proposalProposalsContributionsList,
      sdk.proposalProposalsStepInputsList,
      sdk.proposalProposalsReleasedReportsList,
      sdk.proposalProposalsOfferingAssessmentsList,
      sdk.proposalProposalsChangeRequestsList,
      sdk.proposalProposalsStepChecklistResponsesList,
    ].forEach((fn) => expect(fn).not.toHaveBeenCalled());
  });

  it('says so when the role does not see the proposal', () => {
    renderWithProviders(
      <DryRunPreview
        view={view({
          proposal: { status: 404, data: { detail: 'Not found.' } },
        })}
        roleLabel="Example reviewer 1 (an assigned reviewer)"
        pointLabel="the submission"
      />,
      { wrapper: Wrapper },
    );
    expect(
      screen.getByText('This role does not see the proposal at all.'),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('dry-run-preview-page')).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('reads a new preview through a client of its own', async () => {
    const { rerender } = renderWithProviders(
      <DryRunPreview view={view()} roleLabel="someone" pointLabel="before" />,
      { wrapper: Wrapper },
    );
    expect(
      await screen.findByTestId('dry-run-preview-page'),
    ).toBeInTheDocument();
    // The next run's synthetic proposal: another uuid, another client.
    const next = view();
    next.proposal_uuid = 'f00000000000000000000000000000bb';
    next.responses.proposal.data.uuid = next.proposal_uuid;
    next.responses.proposal.data.name = 'Next proposal';
    rerender(
      <DryRunPreview view={next} roleLabel="someone" pointLabel="after" />,
    );
    expect(
      await screen.findByTestId('dry-run-preview-page'),
    ).toBeInTheDocument();
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(
      screen.queryByText('Could not load workflow progress.'),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('dry-run-not-previewed')).toBeNull();
  });

  it('names a query it was not given in development', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderWithProviders(
      <DryRunPreview
        view={view({ workflow_states: undefined })}
        roleLabel="someone"
        pointLabel="a point"
      />,
      { wrapper: Wrapper },
    );
    const note = await screen.findByTestId('dry-run-not-previewed');
    expect(note).toHaveTextContent(
      'Workflow progress: not part of the preview.',
    );
    expect(note).toHaveTextContent(`["proposalWorkflowStates","${PROPOSAL}"]`);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(`["proposalWorkflowStates","${PROPOSAL}"]`),
    );
    expect(
      screen.queryByText('Could not load workflow progress.'),
    ).not.toBeInTheDocument();
    warn.mockRestore();
  });

  it('shows only a neutral note for it in production', async () => {
    vi.stubEnv('DEV', false);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      renderWithProviders(
        <DryRunPreview
          view={view({ workflow_states: undefined })}
          roleLabel="someone"
          pointLabel="a point"
        />,
        { wrapper: Wrapper },
      );
      const note = await screen.findByTestId('dry-run-not-previewed');
      expect(note).toHaveTextContent(
        /^Workflow progress: not part of the preview\.$/,
      );
      expect(warn).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllEnvs();
      warn.mockRestore();
    }
  });

  it('fails closed on a query it was not given', async () => {
    const { createPreviewClient } = await import('./previewClient');
    const missing: unknown[] = [];
    const client = createPreviewClient(view(), (key) => missing.push(key));
    const queryFn = vi.fn();
    await expect(
      client.fetchQuery({ queryKey: ['somethingElse', PROPOSAL], queryFn }),
    ).rejects.toThrow('Not part of the preview');
    expect(queryFn).not.toHaveBeenCalled();
    expect(missing).toEqual([['somethingElse', PROPOSAL]]);
    expect(
      client.getQueryData(['proposalWorkflowStates', PROPOSAL]),
    ).toHaveLength(2);
    // A refused read seeds what the real query makes of a refusal.
    expect(client.getQueryData(['ProposalReleasedReports', PROPOSAL])).toEqual(
      [],
    );
  });
});
