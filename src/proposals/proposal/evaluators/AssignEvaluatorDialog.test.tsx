import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  proposalProposalsRoleAssignmentCandidatesList,
  proposalProposalsRoleAssignmentsSet,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { getSelectByLabel, openAndSelectOption } from '@/test/select';

import { AssignEvaluatorDialog } from './AssignEvaluatorDialog';

const proposal = { uuid: 'proposal-uuid' } as any;

const lead = {
  uuid: 'lead-role',
  name: 'Lead rapporteur',
  eligible_from: 'call_role:panel_member',
  allows_lead: true,
} as any;

const second = {
  uuid: 'second-role',
  name: 'Second rapporteur',
  eligible_from: 'call_role:panel_member',
  allows_lead: false,
} as any;

const anyone = {
  uuid: 'external-role',
  name: 'External expert',
  eligible_from: 'any_user',
  allows_lead: false,
} as any;

const candidate = (values: any) => ({
  email: null,
  username: values.full_name.toLowerCase(),
  holds_role: false,
  holds_other_role: false,
  held_role_name: null,
  has_recorded_conflict: false,
  has_reviewer_profile: true,
  ...values,
});

const renderDialog = (roles = [lead], refetch = vi.fn()) =>
  renderWithProviders(
    <AssignEvaluatorDialog resolve={{ proposal, roles, refetch }} />,
  );

describe('AssignEvaluatorDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(proposalProposalsRoleAssignmentCandidatesList).mockResolvedValue({
      data: [
        candidate({ uuid: 'alice', full_name: 'Alice' }),
        // Outside the call team a conflict is unknown, not absent.
        candidate({
          uuid: 'erin',
          full_name: 'Erin',
          has_recorded_conflict: null,
        }),
        candidate({
          uuid: 'bob',
          full_name: 'Bob',
          has_recorded_conflict: true,
        }),
        candidate({ uuid: 'carol', full_name: 'Carol', holds_role: true }),
        candidate({
          uuid: 'dave',
          full_name: 'Dave',
          holds_other_role: true,
          held_role_name: 'Second rapporteur',
        }),
      ],
    } as any);
  });

  it('picks the only role and lists who may hold it, with a recorded conflict named', async () => {
    const user = userEvent.setup();
    renderDialog();

    expect(
      screen.getByText(
        'Eligible: panel members of the call. Search by name, username or full email address.',
      ),
    ).toBeInTheDocument();

    await user.click(
      within(getSelectByLabel('Evaluator')).getByRole('combobox'),
    );
    await waitFor(() =>
      expect(
        proposalProposalsRoleAssignmentCandidatesList,
      ).toHaveBeenCalledWith({
        path: { uuid: 'proposal-uuid' },
        query: { role_uuid: 'lead-role', query: undefined },
      }),
    );
    // A recorded conflict is named, and the backend would refuse it.
    expect(
      await screen.findByRole('option', {
        name: /Bob — conflict of interest recorded/,
      }),
    ).toHaveAttribute('aria-disabled', 'true');
    // An unknown conflict is no reason to refuse.
    expect(screen.getByRole('option', { name: 'Erin' })).not.toHaveAttribute(
      'aria-disabled',
      'true',
    );
    // A current holder cannot be picked again.
    expect(
      screen.getByRole('option', { name: /Carol — already holds the role/ }),
    ).toHaveAttribute('aria-disabled', 'true');
    // One person holds one evaluator role on a proposal.
    expect(
      screen.getByRole('option', {
        name: /Dave — already Second rapporteur on this proposal/,
      }),
    ).toHaveAttribute('aria-disabled', 'true');
  });

  it('searches the candidates as the user types', async () => {
    const user = userEvent.setup();
    renderDialog([anyone]);

    expect(
      screen.getByText(
        'Anyone may hold this role: search by name, username or full email address.',
      ),
    ).toBeInTheDocument();
    await user.type(
      within(getSelectByLabel('Evaluator')).getByRole('combobox'),
      'ali',
    );
    await waitFor(() =>
      expect(
        proposalProposalsRoleAssignmentCandidatesList,
      ).toHaveBeenCalledWith({
        path: { uuid: 'proposal-uuid' },
        query: { role_uuid: 'external-role', query: 'ali' },
      }),
    );
  });

  it('assigns the holder as the lead', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(proposalProposalsRoleAssignmentsSet).mockResolvedValue({
      data: {},
    } as any);
    renderDialog([lead], refetch);

    await openAndSelectOption(user, 'Evaluator', 'Alice');
    await user.click(screen.getByLabelText(/Lead/));
    await user.click(screen.getByRole('button', { name: 'Assign' }));

    await waitFor(() =>
      expect(proposalProposalsRoleAssignmentsSet).toHaveBeenCalledWith({
        path: { uuid: 'proposal-uuid' },
        body: { role_uuid: 'lead-role', user_uuid: 'alice', is_lead: true },
      }),
    );
    await waitFor(() => expect(refetch).toHaveBeenCalled());
  });

  it('offers the lead only for a role that has one', async () => {
    const user = userEvent.setup();
    renderDialog([lead, second]);

    // Two roles: none is preselected, so no candidates are asked for yet.
    expect(
      proposalProposalsRoleAssignmentCandidatesList,
    ).not.toHaveBeenCalled();

    await openAndSelectOption(user, 'Role', 'Second rapporteur');
    await user.click(
      within(getSelectByLabel('Evaluator')).getByRole('combobox'),
    );
    await waitFor(() =>
      expect(
        proposalProposalsRoleAssignmentCandidatesList,
      ).toHaveBeenCalledWith({
        path: { uuid: 'proposal-uuid' },
        query: { role_uuid: 'second-role', query: undefined },
      }),
    );
    expect(screen.queryByLabelText(/Lead/)).not.toBeInTheDocument();
  });

  it('keeps a peer from making the new holder the lead of a role with one', () => {
    renderWithProviders(
      <AssignEvaluatorDialog
        resolve={{
          proposal,
          roles: [lead],
          refetch: vi.fn(),
          leadRefusal: () => 'The role has a lead.',
        }}
      />,
    );

    expect(screen.getByLabelText(/^Lead/)).toBeDisabled();
    expect(screen.getByText('The role has a lead.')).toBeInTheDocument();
  });
});
