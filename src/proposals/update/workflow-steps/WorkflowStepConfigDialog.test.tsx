import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  proposalProtectedCallsStepChecklistsList,
  proposalProtectedCallsWorkflowStepKindsList,
  proposalProtectedCallsWorkflowStepsList,
  proposalProtectedCallsWorkflowStepsPartialUpdate,
} from 'waldur-js-client';

import { STEP_KINDS } from '@/proposals/workflow/stepKinds.fixture';
import { renderWithProviders } from '@/test/harness';

import { WorkflowStepConfigDialog } from './WorkflowStepConfigDialog';

const call = { uuid: 'call-uuid' } as any;

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
} as any;

const allocationDecision = {
  uuid: 'decision-uuid',
  key: 'allocation_decision',
  kind: 'decision',
  name: 'Allocation decision',
  outcome_set: 'approval',
  completer: 'call_manager',
  on_negative: 'reject',
  is_enabled: true,
  is_mandatory: true,
  is_allocation_decision: true,
  allocation_time: 'fixed_date',
  transition_mode: 'automatic_on_completion',
} as any;

const panelDecision = {
  ...allocationDecision,
  uuid: 'panel-uuid',
  key: 'panel_review',
  name: 'Panel review',
  completer: 'panel_member',
  is_mandatory: false,
  is_allocation_decision: false,
  allocation_time: 'on_decision',
};

const awardResponse = {
  uuid: 'award-uuid',
  key: 'award_response',
  kind: 'applicant_action',
  name: 'Award response',
  outcome_set: 'acceptance',
  completer: 'applicant',
  on_negative: 'cancel',
  is_enabled: true,
  is_mandatory: false,
  is_allocation_decision: false,
  transition_mode: 'automatic_on_completion',
} as any;

const responseToReviews = {
  ...awardResponse,
  uuid: 'response-uuid',
  key: 'response_to_reviews',
  name: 'Response to reviews',
  outcome_set: 'submitted',
  order: 5,
  input_steps: ['report-uuid'],
} as any;

const renderDialog = (step, refetch = vi.fn(), forCall = call) =>
  renderWithProviders(
    <WorkflowStepConfigDialog resolve={{ call: forCall, step, refetch }} />,
  );

const save = (user) =>
  user.click(screen.getByRole('button', { name: /Save/i }));

// Opens a page of the dialog from the indicator along its top.
const goToPage = (user, name: string) =>
  user.click(screen.getByRole('button', { name: new RegExp(`^${name}`) }));

describe('WorkflowStepConfigDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(proposalProtectedCallsWorkflowStepKindsList).mockResolvedValue({
      data: STEP_KINDS,
    } as any);
    vi.mocked(proposalProtectedCallsStepChecklistsList).mockResolvedValue({
      data: [],
    } as any);
    vi.mocked(
      proposalProtectedCallsWorkflowStepsPartialUpdate,
    ).mockResolvedValue({} as any);
  });

  it('renames the step', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    renderDialog(assessment, refetch);

    const name = await screen.findByLabelText(/^Name/);
    await user.clear(name);
    await user.type(name, 'Reviewer report');
    await save(user);

    await waitFor(() =>
      expect(
        proposalProtectedCallsWorkflowStepsPartialUpdate,
      ).toHaveBeenCalledWith({
        path: { uuid: 'call-uuid', obj_uuid: 'report-uuid' },
        body: expect.objectContaining({ name: 'Reviewer report' }),
      }),
    );
    const { body } = vi.mocked(proposalProtectedCallsWorkflowStepsPartialUpdate)
      .mock.calls[0][0];
    // The kind is fixed once the step exists, and the switch was untouched.
    expect(body).not.toHaveProperty('kind');
    expect(body).not.toHaveProperty('is_enabled');
    expect(refetch).toHaveBeenCalled();
  });

  it("shows an assessment's review settings and criteria only", async () => {
    const user = userEvent.setup();
    renderDialog(assessment);

    expect(
      await screen.findByText('Configure step: Individual report'),
    ).toBeInTheDocument();
    await screen.findByLabelText(/^Name/);
    await goToPage(user, 'Participants');
    expect(await screen.findByLabelText(/Minimum contributions/)).toBeVisible();
    expect(screen.getByLabelText(/Maximum contributions/)).toBeVisible();
    expect(
      screen.getByLabelText(/One contribution per requested offering/),
    ).toBeVisible();
    await goToPage(user, 'Outcome and review');
    expect(screen.getByText('Criteria')).toBeVisible();
    expect(screen.getByLabelText(/Blind review/)).toBeVisible();
    expect(screen.queryByLabelText(/Allocation decision/)).toBeNull();
    expect(screen.queryByText('Allocation timing')).toBeNull();
  });

  it('offers allocation timing on the allocation decision, with no switch to turn it off', async () => {
    const user = userEvent.setup();
    renderDialog(allocationDecision);

    await screen.findByLabelText(/^Name/);
    await goToPage(user, 'Timing');
    expect(await screen.findByText('Allocation timing')).toBeVisible();
    expect(screen.queryByText('Criteria')).toBeNull();
    expect(screen.queryByLabelText(/Step enabled/)).toBeNull();
  });

  it('offers no allocation timing on any other decision', async () => {
    renderDialog(panelDecision);

    expect(
      await screen.findByLabelText(/Allocation decision/),
    ).toBeInTheDocument();
    expect(screen.queryByText('Allocation timing')).toBeNull();
    expect(screen.getByLabelText(/Step enabled/)).toBeInTheDocument();
  });

  // The award toggle is gone: the award response is an applicant step like
  // any other, switched and configured on its own row.
  it('configures the award response as an ordinary applicant step', async () => {
    const user = userEvent.setup();
    renderDialog(awardResponse);

    const enabled = await screen.findByLabelText(/Step enabled/);
    expect(screen.queryByText(/Include award response/i)).toBeNull();
    expect(screen.queryByText('Criteria')).toBeNull();

    await user.click(enabled);
    await save(user);

    await waitFor(() =>
      expect(
        proposalProtectedCallsWorkflowStepsPartialUpdate,
      ).toHaveBeenCalledWith({
        path: { uuid: 'call-uuid', obj_uuid: 'award-uuid' },
        body: expect.objectContaining({
          is_enabled: false,
          outcome_set: 'acceptance',
          on_negative: 'cancel',
        }),
      }),
    );
  });

  // An applicant step reads its inputs whatever the call says about
  // showing reviews, so the editor says so when it takes hidden reviews.
  describe('on an applicant step taking reviews as input', () => {
    const hiddenReviewsWarning =
      'Applicants will see these reviews while they respond, even though this call hides reviews.';

    beforeEach(() => {
      vi.mocked(proposalProtectedCallsWorkflowStepsList).mockResolvedValue({
        data: [{ ...assessment, order: 3 }, responseToReviews],
      } as any);
    });

    it('warns when the call hides reviews from applicants', async () => {
      renderDialog(responseToReviews, vi.fn(), {
        uuid: 'call-uuid',
        reviews_visible_to_submitters: false,
      });

      const user = userEvent.setup();
      await screen.findByLabelText(/^Name/);
      await goToPage(user, 'Inputs and visibility');
      expect(await screen.findByText(hiddenReviewsWarning)).toBeVisible();
    });

    it('says nothing when the call shows reviews to applicants', async () => {
      renderDialog(responseToReviews, vi.fn(), {
        uuid: 'call-uuid',
        reviews_visible_to_submitters: true,
      });

      await screen.findByLabelText(/Input steps/);
      await waitFor(() =>
        expect(proposalProtectedCallsWorkflowStepsList).toHaveBeenCalled(),
      );
      expect(screen.queryByText(hiddenReviewsWarning)).toBeNull();
    });
  });

  // The backend refuses to move the allocation decision on an active call.
  it('keeps the allocation decision flag fixed on an active call', async () => {
    renderDialog(panelDecision, vi.fn(), {
      uuid: 'call-uuid',
      state: 'active',
    });

    const flag = await screen.findByLabelText(/Allocation decision/);
    expect(flag).toBeDisabled();
    expect(
      screen.getByText(
        'The call is active, so its allocation decision stays on the step it is on.',
      ),
    ).toBeInTheDocument();
  });

  it('refuses a second allocation decision with the reason inside the dialog', async () => {
    const user = userEvent.setup();
    vi.mocked(
      proposalProtectedCallsWorkflowStepsPartialUpdate,
    ).mockRejectedValue({
      is_allocation_decision: [
        'The call already has an allocation decision step.',
      ],
      status: 400,
      response: { status: 400 },
    });
    renderDialog(panelDecision);

    await user.click(await screen.findByLabelText(/Allocation decision/));
    await save(user);

    // In the banner at the top, and under the flag itself.
    expect(
      await screen.findAllByText(
        'The call already has an allocation decision step.',
      ),
    ).toHaveLength(2);
  });

  it("offers the forms of the call's organisation only", async () => {
    renderDialog(assessment, vi.fn(), {
      uuid: 'call-uuid',
      customer_uuid: 'customer-uuid',
    });

    expect(await screen.findByText('Checklist')).toBeInTheDocument();
    await waitFor(() =>
      expect(proposalProtectedCallsStepChecklistsList).toHaveBeenCalledWith({
        query: { customer_uuid: 'customer-uuid' },
      }),
    );
  });

  it('shows a refused form under the checklist field', async () => {
    const user = userEvent.setup();
    vi.mocked(
      proposalProtectedCallsWorkflowStepsPartialUpdate,
    ).mockRejectedValue({
      checklist: ['This form belongs to another organisation.'],
      status: 400,
      response: { status: 400 },
    });
    renderDialog(assessment);

    const name = await screen.findByLabelText(/^Name/);
    await user.type(name, ' 2');
    await save(user);

    // In the banner at the top, and under the checklist field, whose page
    // the dialog opens and flags.
    expect(
      await screen.findAllByText('This form belongs to another organisation.'),
    ).toHaveLength(2);
    await waitFor(() =>
      expect(screen.getByLabelText(/^Checklist$/)).toBeVisible(),
    );
    expect(name).not.toBeVisible();
    expect(
      screen.getByRole('button', { name: /^Outcome and review.*has errors/ }),
    ).toBeInTheDocument();
  });

  it('saves from any page', async () => {
    const user = userEvent.setup();
    renderDialog(assessment);

    await screen.findByLabelText(/^Name/);
    await goToPage(user, 'Timing');
    await user.type(screen.getByLabelText(/Estimated duration/), '14');
    await save(user);

    await waitFor(() =>
      expect(
        proposalProtectedCallsWorkflowStepsPartialUpdate,
      ).toHaveBeenCalled(),
    );
    const { body } = vi.mocked(proposalProtectedCallsWorkflowStepsPartialUpdate)
      .mock.calls[0][0];
    expect(Number(body.duration_in_days)).toBe(14);
  });
  it('ends on a Check page reading back the unsaved values', async () => {
    const user = userEvent.setup();
    renderDialog(assessment);

    const name = await screen.findByLabelText(/^Name/);
    await user.clear(name);
    await user.type(name, 'Reviewer report');
    await goToPage(user, 'Timing');
    await user.type(screen.getByLabelText(/Estimated duration/), '21');
    await goToPage(user, 'Check');

    const summary = await screen.findByTestId('step-check-summary');
    expect(summary).toHaveTextContent('Reviewer report');
    expect(summary).toHaveTextContent('due 21 days after it starts');
    expect(screen.getByTestId('step-check-basics')).toHaveTextContent(
      'Reviewer report',
    );
    // Empty optional values say so.
    expect(screen.getByTestId('step-check-basics')).toHaveTextContent(
      'Not set',
    );
  });

  it('goes back to the Check page from a page opened from it', async () => {
    const user = userEvent.setup();
    renderDialog(assessment);

    await screen.findByLabelText(/^Name/);
    await goToPage(user, 'Check');
    const basics = await screen.findByTestId('step-check-basics');
    await user.click(within(basics).getByRole('button', { name: 'Change' }));
    expect(screen.getByLabelText(/^Name/)).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Back to check' }));
    expect(await screen.findByTestId('step-check-page')).toBeInTheDocument();
  });

  it('saves from the Check page', async () => {
    const user = userEvent.setup();
    renderDialog(assessment);

    const name = await screen.findByLabelText(/^Name/);
    await user.type(name, ' 2');
    await goToPage(user, 'Check');
    await screen.findByTestId('step-check-page');
    await save(user);

    await waitFor(() =>
      expect(
        proposalProtectedCallsWorkflowStepsPartialUpdate,
      ).toHaveBeenCalled(),
    );
  });

  it('opens on the page it is asked for', async () => {
    renderWithProviders(
      <WorkflowStepConfigDialog
        resolve={{ call, step: assessment, initialPage: 'timing' }}
      />,
    );
    expect(await screen.findByLabelText(/Estimated duration/)).toBeVisible();
  });
});
