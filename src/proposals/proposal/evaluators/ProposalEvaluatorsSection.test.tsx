import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect, useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  proposalProposalsRoleAssignmentCandidatesList,
  proposalProposalsRoleAssignmentsList,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import {
  groupByRole,
  ProposalEvaluatorsSection,
} from './ProposalEvaluatorsSection';

// Render each table's rows, read through its fetchData as useTable would;
// the table chrome is not under test here.
vi.mock('waldur-table/src/useTable', () => ({
  useTable: (options) => ({
    fetch: vi.fn(),
    fetchData: options.fetchData,
    filter: options.filter,
  }),
}));

vi.mock('@/table/Table', () => ({
  default: ({ fetchData, filter, columns, rowActions }) => {
    const [rows, setRows] = useState([]);
    useEffect(() => {
      fetchData().then((result) => setRows(result.rows));
    }, [fetchData, filter]);
    return (
      <div data-testid="holders">
        {rows.map((row) => (
          <div key={row.uuid} data-testid="holder">
            {columns.map((column, index) => (
              <span key={index}>{column.render({ row })}</span>
            ))}
            {rowActions ? <span data-testid="row-actions" /> : null}
          </div>
        ))}
      </div>
    );
  },
}));

const proposal = { uuid: 'proposal-uuid', state: 'in_review' } as any;

const lead = {
  uuid: 'lead-role',
  name: 'Lead rapporteur',
  min_holders: 1,
  max_holders: 1,
  allows_lead: true,
} as any;

const second = {
  uuid: 'second-role',
  name: 'Second rapporteur',
  min_holders: 2,
  max_holders: 2,
  allows_lead: false,
} as any;

const assignment = (values: any) => ({
  is_lead: false,
  user_email: null,
  coi_confirmation_required: false,
  coi_confirmed_at: null,
  coi_declaration_only: false,
  awaits_coi_confirmation: false,
  assigned_in_step_name: 'Rapporteur assignment',
  assigned_by_full_name: 'Manager',
  ...values,
});

const alice = assignment({
  uuid: 'a1',
  role_uuid: 'lead-role',
  role_name: 'Lead rapporteur',
  user_full_name: 'Alice',
  user_email: 'alice@example.com',
  is_lead: true,
});

// Another holder as a fellow holder sees them: no email, no conflict state.
const bob = assignment({
  uuid: 'b1',
  role_uuid: 'second-role',
  role_name: 'Second rapporteur',
  user_full_name: 'Bob',
  coi_confirmation_required: null,
  coi_declaration_only: null,
  awaits_coi_confirmation: null,
});

const section = (roleUuid: string) =>
  screen.findByTestId(`evaluator-role-${roleUuid}`);

describe('ProposalEvaluatorsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(proposalProposalsRoleAssignmentsList).mockResolvedValue({
      data: [alice, bob],
    } as any);
  });

  it('shows one section per role, with what each still needs', async () => {
    renderWithProviders(
      <ProposalEvaluatorsSection
        proposal={proposal}
        roles={[lead, second]}
        canManage
        changesAnyHolder
      />,
    );
    const leadSection = await section('lead-role');
    expect(
      within(leadSection).getByText('Lead rapporteur'),
    ).toBeInTheDocument();
    expect(await within(leadSection).findByText('Alice')).toBeInTheDocument();
    expect(
      within(leadSection).getByText('alice@example.com'),
    ).toBeInTheDocument();
    expect(within(leadSection).getByText('Complete')).toBeInTheDocument();

    const secondSection = await section('second-role');
    expect(await within(secondSection).findByText('Bob')).toBeInTheDocument();
    expect(
      within(secondSection).getByText('1 of 2 required'),
    ).toBeInTheDocument();
    expect(within(leadSection).queryByText('Bob')).not.toBeInTheDocument();

    // A manager acts on holders in each section, and assigns from the
    // header: one "Assign" menu naming each role.
    expect(within(secondSection).getAllByTestId('row-actions')).toHaveLength(1);
    const header = screen.getByTestId('evaluators-header');
    expect(within(header).queryByText(/required/)).not.toBeInTheDocument();
    await userEvent.click(
      within(header).getByRole('button', { name: /Assign/ }),
    );
    expect(
      await screen.findByText('Assign Lead rapporteur'),
    ).toBeInTheDocument();
    expect(screen.getByText('Assign Second rapporteur')).toBeInTheDocument();
  });

  it('assigns a single role from the header, folded or not, and counts it under its own heading', async () => {
    vi.mocked(proposalProposalsRoleAssignmentsList).mockResolvedValue({
      data: [],
    } as any);
    const consensus = {
      uuid: 'consensus-role',
      name: 'Consensus expert',
      min_holders: 1,
      max_holders: 1,
      allows_lead: false,
    } as any;
    renderWithProviders(
      <ProposalEvaluatorsSection
        proposal={proposal}
        roles={[consensus]}
        canManage
        changesAnyHolder
      />,
    );
    const header = await screen.findByTestId('evaluators-header');
    await userEvent.click(screen.getByRole('button', { name: /^Evaluators/ }));
    expect(screen.getByRole('button', { name: /^Evaluators/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(
      within(header).getByRole('button', { name: /Assign Consensus expert/ }),
    ).toBeVisible();
    // Said once, under the role's own heading.
    expect(within(header).queryByText(/required/)).not.toBeInTheDocument();
    expect(screen.getAllByText('0 of 1 required')).toHaveLength(1);
  });

  it('does not offer a role nobody on the proposal can hold yet, and says why', async () => {
    vi.mocked(proposalProposalsRoleAssignmentsList).mockResolvedValue({
      data: [],
    } as any);
    // Held by the proposal's own reviewers: none before it is reviewed.
    vi.mocked(proposalProposalsRoleAssignmentCandidatesList).mockResolvedValue({
      data: [],
    } as any);
    renderWithProviders(
      <ProposalEvaluatorsSection
        proposal={proposal}
        roles={[
          {
            uuid: 'consensus-role',
            name: 'Consensus expert',
            eligible_from: 'proposal_reviewers',
            min_holders: 1,
            max_holders: 1,
            allows_lead: false,
          } as any,
        ]}
        canManage
        changesAnyHolder
      />,
    );
    // Disabled, its tooltip saying why.
    await vi.waitFor(() =>
      expect(
        within(screen.getByTestId('evaluators-header')).getByRole('button', {
          name: /Assign Consensus expert/,
        }),
      ).toBeDisabled(),
    );
  });

  it('assigns nobody once the proposal is decided, and says why', async () => {
    vi.mocked(proposalProposalsRoleAssignmentsList).mockResolvedValue({
      data: [],
    } as any);
    renderWithProviders(
      <ProposalEvaluatorsSection
        proposal={{ ...proposal, state: 'accepted' }}
        roles={[
          {
            uuid: 'rapporteur',
            name: 'Rapporteur',
            eligible_from: 'panel:member',
            min_holders: 1,
            max_holders: 2,
            allows_lead: true,
          } as any,
        ]}
        canManage
        changesAnyHolder
      />,
    );
    const assign = await within(
      await screen.findByTestId('evaluators-header'),
    ).findByRole('button', { name: /Assign Rapporteur/ });
    expect(assign).toBeDisabled();
    expect(assign).toHaveAccessibleDescription(
      'The proposal is no longer being evaluated.',
    );
    expect(
      proposalProposalsRoleAssignmentCandidatesList,
    ).not.toHaveBeenCalled();
  });

  it('shows a holder the roles they can see held, read only', async () => {
    renderWithProviders(
      <ProposalEvaluatorsSection
        proposal={proposal}
        roles={[]}
        canManage={false}
        changesAnyHolder={false}
      />,
    );
    const secondSection = await section('second-role');
    expect(await within(secondSection).findByText('Bob')).toBeInTheDocument();
    expect(within(secondSection).queryByText('1 of 2 required')).toBeNull();
    expect(screen.queryByTestId('evaluators-header')).toBeNull();
    expect(screen.queryByRole('button', { name: /Assign/ })).toBeNull();
    expect(screen.queryByTestId('row-actions')).toBeNull();
  });

  it('says so in place when the viewer may not see the evaluators', async () => {
    vi.mocked(proposalProposalsRoleAssignmentsList).mockRejectedValue({
      response: { status: 403 },
    });
    renderWithProviders(
      <ProposalEvaluatorsSection
        proposal={proposal}
        roles={[lead]}
        canManage={false}
        changesAnyHolder={false}
      />,
    );
    expect(
      await screen.findByText('You cannot see who evaluates this proposal.'),
    ).toBeInTheDocument();
  });
});

describe('ProposalEvaluatorsSection panel', () => {
  it('folds when its header is clicked', async () => {
    vi.mocked(proposalProposalsRoleAssignmentsList).mockResolvedValue({
      data: [],
    } as any);
    renderWithProviders(
      <ProposalEvaluatorsSection
        proposal={proposal}
        roles={[lead]}
        canManage={false}
        changesAnyHolder={false}
      />,
    );
    const header = screen.getByRole('button', { name: /^Evaluators/ });
    expect(header).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('groupByRole', () => {
  it('keeps the call roles in order, empty ones included, and adds roles only seen held', () => {
    const sections = groupByRole([lead], [bob, alice]);
    expect(sections.map((s) => [s.uuid, s.rows.map((r) => r.uuid)])).toEqual([
      ['lead-role', ['a1']],
      ['second-role', ['b1']],
    ]);
    expect(groupByRole([lead, second], [])[1].rows).toEqual([]);
  });
});
