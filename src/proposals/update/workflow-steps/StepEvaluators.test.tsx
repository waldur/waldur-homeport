import { screen } from '@testing-library/react';
import { FC, PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalProtectedCallsProposalRolesList } from 'waldur-js-client';

import { DrawerProvider } from '@/drawer/DrawerContext';
import { renderWithProviders } from '@/test/harness';
import * as workspaceHooks from '@/workspace/hooks';

import { StepEvaluators } from './StepEvaluators';

// The shared table registers itself in the app's store.
const StoreWrapper: FC<PropsWithChildren> = ({ children }) => (
  <DrawerProvider>
    <Provider store={configureStore()({ tables: {} })}>{children}</Provider>
  </DrawerProvider>
);

const call = {
  uuid: 'call-1',
  url: '/api/proposal-protected-calls/call-1/',
  state: 'active',
  customer_uuid: 'customer-1',
  manager_uuid: 'manager-1',
} as any;

const person = (uuid: string, overrides: Record<string, unknown> = {}) => ({
  uuid,
  username: uuid,
  full_name: `Person ${uuid}`,
  email: `${uuid}@example.org`,
  is_panel_chair: false,
  is_panel_vice_chair: false,
  offerings: [],
  ...overrides,
});

const step = (overrides: Record<string, unknown>) =>
  ({
    uuid: 'step-1',
    key: 'step_1',
    name: 'Step one',
    completer: 'call_manager',
    contributor_source: 'none',
    responsible_users: [],
    contributing_users: [],
    assigns_roles: [],
    ...overrides,
  }) as any;

const staff = { is_staff: true, permissions: [] };
const nobody = { is_staff: false, permissions: [] };

const renderEvaluators = (
  row: any,
  props: Record<string, unknown> = {},
  user: any = staff,
) => {
  vi.mocked(workspaceHooks.useUser).mockReturnValue(user);
  return renderWithProviders(
    <StepEvaluators
      step={row}
      call={call}
      steps={[row]}
      refetch={vi.fn()}
      {...props}
    />,
    { wrapper: StoreWrapper },
  );
};

beforeEach(() => {
  vi.mocked(proposalProtectedCallsProposalRolesList).mockResolvedValue({
    data: [],
  } as any);
});

afterEach(() => vi.restoreAllMocks());

describe('StepEvaluators: call managers', () => {
  it('lists the call managers and offers to add one', async () => {
    renderEvaluators(step({ responsible_users: [person('ada')] }));
    expect(await screen.findByText('Person ada')).toBeInTheDocument();
    expect(screen.getByText('ada@example.org')).toBeInTheDocument();
    expect(screen.getByText('Call manager')).toBeInTheDocument();
    expect(
      screen.getByText("The call's managers, managed in its Team tab."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add call manager' }),
    ).toBeEnabled();
  });

  it('says the call has no managers instead of an empty table', () => {
    renderEvaluators(step({}));
    expect(
      screen.getByText('The call has no managers yet.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});

describe('StepEvaluators: panel', () => {
  it('offers to add a panel member for a panel member step', async () => {
    renderEvaluators(
      step({ completer: 'panel_member', responsible_users: [person('p1')] }),
    );
    expect(
      screen.getByRole('button', { name: 'Add panel member' }),
    ).toBeInTheDocument();
    expect(await screen.findByText('Panel member')).toBeInTheDocument();
  });

  it('marks the chair and vice-chair of a panel chair step', async () => {
    renderEvaluators(
      step({
        completer: 'panel_chair',
        contributor_source: 'call_role:panel_chair',
        responsible_users: [
          person('chair', { is_panel_chair: true }),
          person('vice', { is_panel_vice_chair: true }),
        ],
      }),
    );
    expect(await screen.findByText('Chair')).toBeInTheDocument();
    expect(screen.getByText('Vice-chair')).toBeInTheDocument();
    expect(
      screen.getByText(
        "The call's panel chair and vice-chair, picked among its panel members in the Team tab.",
      ),
    ).toBeInTheDocument();
    // The contributor source names the same people: one group, one action.
    expect(screen.queryByText(/Contributes/)).not.toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: 'Add panel member' }),
    ).toHaveLength(1);
  });
});

describe('StepEvaluators: reviewer pool', () => {
  const reviewerStep = step({
    completer: 'reviewer',
    contributor_source: 'assigned_reviewers',
    responsible_users: [person('rev')],
  });

  it('offers to invite a reviewer to whoever manages the reviews', async () => {
    renderEvaluators(reviewerStep);
    expect(
      screen.getByRole('button', { name: 'Invite reviewer' }),
    ).toBeInTheDocument();
    expect(await screen.findByText('Reviewer pool')).toBeInTheDocument();
  });

  it('hides the invitation from anyone else', () => {
    renderEvaluators(reviewerStep, {}, nobody);
    expect(
      screen.queryByRole('button', { name: 'Invite reviewer' }),
    ).not.toBeInTheDocument();
  });
});

describe('StepEvaluators: offering team', () => {
  const offeringStep = step({
    completer: 'offering_manager',
    contributor_source: 'requested_offering_team',
    per_requested_offering: true,
    responsible_users: [
      person('om', {
        offerings: [
          { uuid: 'off-1', name: 'Cluster partition', customer_uuid: 'prov-1' },
        ],
      }),
    ],
  });

  it('names the offering, links its team for its manager, and offers no action', async () => {
    renderEvaluators(offeringStep);
    expect(
      await screen.findByRole('link', { name: 'Cluster partition' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/provider manages its team in the marketplace/),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Add|Invite/ }),
    ).not.toBeInTheDocument();
  });

  it('names the offering without a link for someone who cannot manage it', async () => {
    renderEvaluators(offeringStep, {}, nobody);
    expect(await screen.findByText('Cluster partition')).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Cluster partition' }),
    ).not.toBeInTheDocument();
  });
});

describe('StepEvaluators: evaluator role', () => {
  it('names the step that assigns the role and lists nobody', () => {
    const assigning = step({
      uuid: 'step-0',
      name: 'Rapporteur assignment',
      completer: 'panel_chair',
      assigns_roles: ['role-1'],
    });
    const row = step({
      completer: 'proposal_role',
      completer_proposal_role: 'role-1',
      completer_proposal_role_name: 'Rapporteur',
    });
    renderEvaluators(row, { steps: [assigning, row] });
    expect(
      screen.getByText(
        'Whoever holds the role “Rapporteur” on each proposal, assigned there by the step “Rapporteur assignment”. Nobody is invited at the call level.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('says the call managers assign a role no step assigns', () => {
    renderEvaluators(
      step({
        completer: 'proposal_role',
        completer_proposal_role: 'role-1',
        completer_proposal_role_name: 'Rapporteur',
      }),
    );
    expect(
      screen.getByText(/No step of the call assigns it/),
    ).toBeInTheDocument();
  });
});

describe('StepEvaluators: applicant', () => {
  // The step's Responsible role already names the applicant.
  it('shows nothing for a step the applicant holds', () => {
    renderEvaluators(step({ completer: 'applicant' }));
    expect(screen.queryByTestId('step-evaluators')).not.toBeInTheDocument();
  });
});

describe('StepEvaluators: completer and contributors', () => {
  it('lists both groups under their headings with an action for each', async () => {
    renderEvaluators(
      step({
        contributor_source: 'assigned_reviewers',
        responsible_users: [person('mgr')],
        contributing_users: [person('rev')],
      }),
    );
    const headers = await screen.findAllByTestId('table-group-header');
    expect(headers.map((header) => header.textContent)).toEqual([
      'Completes the step',
      'Contributes',
    ]);
    expect(screen.getByText('Person mgr')).toBeInTheDocument();
    expect(screen.getByText('Person rev')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add call manager' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Invite reviewer' }),
    ).toBeInTheDocument();
  });
});

describe('StepEvaluators: read-only', () => {
  it('disables the actions of an archived call', () => {
    renderEvaluators(
      step({
        contributor_source: 'assigned_reviewers',
        responsible_users: [person('mgr')],
      }),
      { call: { ...call, state: 'archived' }, isReadOnly: true },
    );
    expect(
      screen.getByRole('button', { name: 'Add call manager' }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Invite reviewer' }),
    ).toBeDisabled();
  });

  it('leaves the actions out of a view-only list', async () => {
    renderEvaluators(step({ responsible_users: [person('mgr')] }), {
      viewOnly: true,
    });
    expect(await screen.findByText('Person mgr')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Add call manager' }),
    ).not.toBeInTheDocument();
  });
});
