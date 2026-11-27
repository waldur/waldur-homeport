import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  proposalProtectedCallsStepChecklistsList,
  proposalProtectedCallsWorkflowStepKindsList,
  proposalProtectedCallsWorkflowStepsPartialUpdate,
} from 'waldur-js-client';

import { STEP_KINDS } from '@/proposals/workflow/stepKinds.fixture';
import { renderWithProviders } from '@/test/harness';

import { WorkflowStepConfigDialog } from './WorkflowStepConfigDialog';

// Matrix chat is disabled throughout: a step may still keep a discussion,
// switched on before chat was, or copied with its call.
vi.mock('@/matrix/utils', () => ({
  isMatrixChatEnabled: () => false,
}));

const DISCUSSION_FIELDS = [
  'has_discussion',
  'discussion_call_managers',
  'discussion_panel_members',
];

const assessment = {
  uuid: 'report-uuid',
  key: 'individual-report',
  kind: 'assessment',
  name: 'Individual report',
  description: '',
  outcome_set: 'reviewed',
  completer: 'reviewer',
  on_negative: 'reject',
  is_enabled: true,
  is_mandatory: false,
  is_allocation_decision: false,
  transition_mode: 'automatic_on_completion',
  criteria: [{ name: 'Impact', order: 0 }],
  has_discussion: false,
  discussion_call_managers: true,
  discussion_panel_members: false,
} as any;

const renderDialog = (step) =>
  renderWithProviders(
    <WorkflowStepConfigDialog
      resolve={{
        call: { uuid: 'call-uuid' } as any,
        step,
        refetch: vi.fn(),
      }}
    />,
  );

const goToPage = (user, name: string) =>
  user.click(screen.getByRole('button', { name: new RegExp(`^${name}`) }));

const savedBody = async (user) => {
  await user.click(screen.getByRole('button', { name: /Save/i }));
  await waitFor(() =>
    expect(proposalProtectedCallsWorkflowStepsPartialUpdate).toHaveBeenCalled(),
  );
  return vi.mocked(proposalProtectedCallsWorkflowStepsPartialUpdate).mock
    .calls[0][0].body;
};

const DORMANT_NOTE =
  'Matrix chat is disabled, so the discussion is dormant and can only be switched off.';

describe('a step discussion while Matrix chat is disabled', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(proposalProtectedCallsWorkflowStepKindsList).mockResolvedValue({
      data: STEP_KINDS.map((kind) =>
        kind.id === 'applicant_action'
          ? kind
          : {
              ...kind,
              config_fields: [...kind.config_fields, ...DISCUSSION_FIELDS],
            },
      ),
    } as any);
    vi.mocked(proposalProtectedCallsStepChecklistsList).mockResolvedValue({
      data: [],
    } as any);
    vi.mocked(
      proposalProtectedCallsWorkflowStepsPartialUpdate,
    ).mockResolvedValue({} as any);
  });

  it('lets a dormant discussion be switched off, and saves that', async () => {
    const user = userEvent.setup();
    renderDialog({ ...assessment, has_discussion: true });

    await screen.findByLabelText(/^Name/);
    await goToPage(user, 'Outcome and review');
    const discussion = await screen.findByLabelText(/^Discussion/);
    expect(discussion).toBeEnabled();
    expect(discussion).toBeChecked();
    expect(screen.getByText(DORMANT_NOTE)).toBeVisible();
    // Who joins is a setting of a discussion that can be had.
    expect(screen.queryByLabelText(/Call managers join/)).toBeNull();
    expect(screen.queryByLabelText(/Panel members join/)).toBeNull();

    // Left on, it is not sent, and the check page does not list it.
    await goToPage(user, 'Check');
    expect(
      within(await screen.findByTestId('step-check-evaluation')).queryByText(
        'Discussion',
      ),
    ).toBeNull();

    await goToPage(user, 'Outcome and review');
    await user.click(await screen.findByLabelText(/^Discussion/));
    await goToPage(user, 'Check');
    const evaluation = await screen.findByTestId('step-check-evaluation');
    expect(within(evaluation).getByText('Discussion:')).toBeInTheDocument();

    const body = await savedBody(user);
    expect(body.has_discussion).toBe(false);
    expect(body).not.toHaveProperty('discussion_call_managers');
    expect(body).not.toHaveProperty('discussion_panel_members');
  });

  it('sends nothing about a dormant discussion left on', async () => {
    const user = userEvent.setup();
    renderDialog({ ...assessment, has_discussion: true });

    const name = await screen.findByLabelText(/^Name/);
    await user.type(name, ' 2');
    const body = await savedBody(user);
    expect(body).not.toHaveProperty('has_discussion');
  });

  it('offers no discussion on a step without one', async () => {
    const user = userEvent.setup();
    renderDialog(assessment);

    const name = await screen.findByLabelText(/^Name/);
    await user.type(name, ' 2');
    await goToPage(user, 'Outcome and review');
    await screen.findByLabelText(/Blind review/);
    expect(screen.queryByLabelText(/^Discussion/)).toBeNull();
    expect(screen.queryByText(DORMANT_NOTE)).toBeNull();

    const body = await savedBody(user);
    expect(body).not.toHaveProperty('has_discussion');
  });
});
