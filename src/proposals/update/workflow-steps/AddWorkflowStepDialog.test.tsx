import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  proposalProtectedCallsStepChecklistsList,
  proposalProtectedCallsWorkflowStepKindsList,
  proposalProtectedCallsWorkflowStepsSet,
} from 'waldur-js-client';

import { STEP_KINDS } from '@/proposals/workflow/stepKinds.fixture';
import { renderWithProviders } from '@/test/harness';

import { AddWorkflowStepDialog } from './AddWorkflowStepDialog';

const renderDialog = (refetch = vi.fn()) =>
  renderWithProviders(
    <AddWorkflowStepDialog
      resolve={{ call: { uuid: 'call-uuid' } as any, refetch }}
    />,
  );

const pickKind = async (user, label: string) => {
  await user.click(await screen.findByLabelText(/Kind/));
  await user.click(await screen.findByText(label));
};

// Opens a page of the dialog from the indicator along its top.
const goToPage = (user, name: string) =>
  user.click(screen.getByRole('button', { name: new RegExp(`^${name}`) }));

const create = async (user) => {
  await goToPage(user, 'Timing');
  await user.click(screen.getByRole('button', { name: /Create/i }));
};

describe('AddWorkflowStepDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(proposalProtectedCallsWorkflowStepKindsList).mockResolvedValue({
      data: STEP_KINDS,
    } as any);
    vi.mocked(proposalProtectedCallsStepChecklistsList).mockResolvedValue({
      data: [],
    } as any);
  });

  it('asks for a kind before anything else', async () => {
    renderDialog();

    expect(await screen.findByLabelText(/Kind/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Next/i })).toBeDisabled();
    expect(screen.queryByRole('button', { name: /Create/i })).toBeNull();
    expect(screen.queryByLabelText(/^Name/)).not.toBeInTheDocument();
  });

  it("shows an assessment's review settings and no allocation fields", async () => {
    const user = userEvent.setup();
    renderDialog();

    await pickKind(user, 'Assessment');

    expect(await screen.findByLabelText(/^Name/)).toBeVisible();
    expect(screen.getByLabelText(/Blind review/)).not.toBeVisible();

    await goToPage(user, 'Outcome and review');

    expect(screen.getByText('Criteria')).toBeVisible();
    expect(screen.getByLabelText(/Blind review/)).toBeVisible();
    expect(screen.queryByLabelText(/Allocation decision/)).toBeNull();
    expect(screen.queryByText('Allocation timing')).toBeNull();
  });

  it('offers allocation timing only once a decision is the allocation decision', async () => {
    const user = userEvent.setup();
    renderDialog();

    await pickKind(user, 'Decision');

    const flag = await screen.findByLabelText(/Allocation decision/);
    expect(screen.queryByText('Criteria')).toBeNull();
    expect(screen.queryByText('Allocation timing')).toBeNull();

    await user.click(flag);
    await goToPage(user, 'Timing');

    expect(await screen.findByText('Allocation timing')).toBeVisible();
  });

  it('moves between the pages with Next, Back and the indicator', async () => {
    const user = userEvent.setup();
    renderDialog();

    await pickKind(user, 'Assessment');
    const name = await screen.findByLabelText(/^Name/);
    expect(name).toBeVisible();
    expect(screen.queryByRole('button', { name: /Back/i })).toBeNull();

    await user.click(screen.getByRole('button', { name: /Next/i }));
    expect(name).not.toBeVisible();
    expect(screen.getByLabelText(/Responsible role/)).toBeVisible();

    await user.click(screen.getByRole('button', { name: /Back/i }));
    expect(name).toBeVisible();

    await goToPage(user, 'Inputs and visibility');
    expect(screen.getByLabelText(/Input steps/)).toBeVisible();
    // The step is created from the last page.
    expect(screen.queryByRole('button', { name: /Create/i })).toBeNull();
    await goToPage(user, 'Timing');
    expect(screen.queryByRole('button', { name: /Next/i })).toBeNull();
    expect(screen.getByRole('button', { name: /Create/i })).toBeEnabled();
  });

  it('opens the page with a missing field when creating fails on it', async () => {
    const user = userEvent.setup();
    renderDialog();

    await pickKind(user, 'Assessment');
    await create(user);

    const name = await screen.findByLabelText(/^Name/);
    await waitFor(() => expect(name).toBeVisible());
    expect(
      screen.getByRole('button', { name: /^Basics.*has errors/ }),
    ).toBeInTheDocument();
    expect(proposalProtectedCallsWorkflowStepsSet).not.toHaveBeenCalled();

    await user.type(name, 'Second opinion');
    expect(
      screen.queryByRole('button', { name: /has errors/ }),
    ).not.toBeInTheDocument();
  });

  // A kind may run more than once: nothing about the call's existing steps
  // limits what can be added.
  it('adds a further step of a kind with its own name', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(proposalProtectedCallsWorkflowStepsSet).mockResolvedValue(
      {} as any,
    );
    renderDialog(refetch);

    await pickKind(user, 'Assessment');
    await user.type(await screen.findByLabelText(/^Name/), 'Second opinion');
    await create(user);

    await waitFor(() =>
      expect(proposalProtectedCallsWorkflowStepsSet).toHaveBeenCalledWith({
        path: { uuid: 'call-uuid' },
        body: expect.objectContaining({
          kind: 'assessment',
          name: 'Second opinion',
          // The kind's defaults.
          outcome_set: 'reviewed',
          completer: 'reviewer',
          is_enabled: true,
          criteria: [],
        }),
      }),
    );
    const { body } = vi.mocked(proposalProtectedCallsWorkflowStepsSet).mock
      .calls[0][0];
    // The backend derives the key from the name, and appends the step.
    expect(body).not.toHaveProperty('key');
    expect(body).not.toHaveProperty('order');
    // Fields another kind owns are never sent.
    expect(body).not.toHaveProperty('is_allocation_decision');
    expect(body).not.toHaveProperty('allocation_time');
    expect(refetch).toHaveBeenCalled();
  });

  // The award response is an ordinary applicant step answering accept or
  // decline, not a flag on the decision.
  it('adds an award response as an applicant step', async () => {
    const user = userEvent.setup();
    vi.mocked(proposalProtectedCallsWorkflowStepsSet).mockResolvedValue(
      {} as any,
    );
    renderDialog();

    await pickKind(user, 'Applicant action');
    await user.type(await screen.findByLabelText(/^Name/), 'Award response');
    await goToPage(user, 'Outcome and review');
    await user.click(screen.getByLabelText(/^Outcomes/));
    await user.click(await screen.findByText('Accepted / declined'));
    await user.click(await screen.findByLabelText('Cancel the proposal'));
    await create(user);

    await waitFor(() =>
      expect(proposalProtectedCallsWorkflowStepsSet).toHaveBeenCalledWith({
        path: { uuid: 'call-uuid' },
        body: expect.objectContaining({
          kind: 'applicant_action',
          name: 'Award response',
          outcome_set: 'acceptance',
          on_negative: 'cancel',
          completer: 'applicant',
        }),
      }),
    );
  });

  it("keeps the dialog open with the backend's reason when it refuses", async () => {
    const user = userEvent.setup();
    vi.mocked(proposalProtectedCallsWorkflowStepsSet).mockRejectedValue({
      is_allocation_decision: [
        'The call already has an allocation decision step.',
      ],
      status: 400,
      response: { status: 400 },
    });
    renderDialog();

    await pickKind(user, 'Decision');
    await user.type(await screen.findByLabelText(/^Name/), 'Board decision');
    await user.click(screen.getByLabelText(/Allocation decision/));
    await create(user);

    expect(
      await screen.findAllByText(
        'The call already has an allocation decision step.',
      ),
    ).not.toHaveLength(0);
    // Back on the page with the refused flag.
    await waitFor(() =>
      expect(screen.getByLabelText(/Allocation decision/)).toBeVisible(),
    );
  });
});
