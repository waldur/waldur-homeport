import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { describe, expect, it, vi } from 'vitest';

import { DrawerProvider } from '@/drawer/DrawerContext';
import { useModal } from '@/modal/actions';
import { rootReducer } from '@/store/reducers';
import { renderWithProviders } from '@/test/harness';

import { DESCRIPTION } from '../description.fixture';

import { DryRunPanel } from './DryRunPanel';

const stepState = (key: string, name: string, status: string) => ({
  key,
  name,
  order: 0,
  stage: 0,
  phase: 'evaluation',
  run: null,
  round_scoped: false,
  status,
  outcome: status === 'completed' ? 'eligible' : null,
  skipped_reason: null,
  condition: null,
  started_day: status === 'pending' ? null : 0,
  deadline_day: null,
  ended_day: null,
  automatic: false,
  contributions: [],
  extra: {},
});

const nextStep = (step: string, name: string, outcomes: string[]) => ({
  step,
  name,
  outcomes,
  contribution_outcomes: [],
  open_slots: [],
  can_reject: true,
  can_expire: false,
  can_request_changes: false,
  can_cancel_changes: false,
  can_delegate: false,
  can_reopen: [],
  can_release: false,
  round_step: false,
});

const NONE = {
  can_submit_changes: false,
  can_advance: false,
  can_publish: false,
  can_extend: false,
  can_open_final_report: false,
  can_exhaust_budget: false,
};

/** The run of each path: before any action, and after the check passed. */
const RUNS = [
  {
    proposal_state: 'in_review',
    day: 0,
    requested_offerings: [],
    steps: [
      stepState('administrative_check', 'Administrative check', 'active'),
      stepState('technical_assessment', 'Technical assessment', 'pending'),
    ],
    next: {
      ...NONE,
      steps: [
        nextStep('administrative_check', 'Administrative check', [
          'eligible',
          'ineligible',
        ]),
      ],
    },
    log: [
      { index: 0, action: null, kind: 'submitted', step: null, day: 0 },
    ].map((entry) => ({ ...entry, text: 'The proposal is submitted.' })),
    messages: [
      {
        index: 0,
        day: 0,
        subject: 'Proposal received',
        text: 'We have your proposal.',
        html: '<p>We have your proposal.</p>',
        audience: { label: 'Applicant', count: 1 },
        step_name: null,
        enabled: false,
      },
    ],
    coverage: {
      steps: ['administrative_check', 'technical_assessment'],
      exercised: [],
      outcomes: {},
      contribution_outcomes: {},
    },
    view_as: null,
  },
  {
    proposal_state: 'in_review',
    day: 0,
    requested_offerings: [],
    steps: [
      stepState('administrative_check', 'Administrative check', 'completed'),
      stepState('technical_assessment', 'Technical assessment', 'active'),
    ],
    next: {
      ...NONE,
      steps: [
        nextStep('technical_assessment', 'Technical assessment', ['feasible']),
      ],
    },
    log: [
      {
        index: 0,
        action: null,
        kind: 'submitted',
        step: null,
        day: 0,
        text: 'The proposal is submitted.',
      },
      {
        index: 1,
        action: 0,
        kind: 'completed',
        step: 'administrative_check',
        day: 0,
        text: 'Administrative check is completed: eligible.',
      },
    ],
    messages: [],
    coverage: {
      steps: ['administrative_check', 'technical_assessment'],
      exercised: ['administrative_check'],
      outcomes: {},
      contribution_outcomes: {},
    },
    view_as: null,
  },
];

vi.mock('./queries', () => ({
  useWorkflowDryRun: (_call: string, request: { actions: unknown[] }) => ({
    data: RUNS[Math.min(request.actions.length, RUNS.length - 1)],
    error: null,
    isFetching: false,
  }),
}));

const Wrapper = ({ children }: { children: ReactNode }) => (
  // The real reducers: a table keeps which rows are open in the store.
  <Provider store={createStore(rootReducer)}>
    <DrawerProvider>{children}</DrawerProvider>
  </Provider>
);

const renderPanel = () =>
  renderWithProviders(
    <DryRunPanel
      call={{ uuid: 'call', offerings: [] } as any}
      description={DESCRIPTION as any}
    />,
    { wrapper: Wrapper },
  );

describe('DryRunPanel accessibility', () => {
  it('says what this visit has covered', () => {
    renderPanel();
    expect(
      screen.getByText('Covered this session: 0/2 steps, 0/0 outcomes'),
    ).toBeInTheDocument();
  });

  it('ties each label to its control', () => {
    renderPanel();
    ['Requested offerings', 'View as'].forEach((name) => {
      const control = screen.getByRole('combobox', { name });
      expect(screen.getByText(name, { selector: 'label' })).toHaveAttribute(
        'for',
        control.id,
      );
    });
  });

  it('moves focus to the next step and says what happened', async () => {
    const user = userEvent.setup();
    renderPanel();
    // The outcome dialog answers at once with the step's first outcome.
    vi.mocked(useModal().openDialog).mockImplementation(
      (_dialog, { resolve }: any) => resolve.onSubmit(resolve.outcomes[0]),
    );
    const complete = screen.getByRole('button', { name: 'Complete step' });
    complete.focus();
    await user.keyboard('{Enter}');
    // The step's section is laid out anew: a lone step, or a tab of its
    // stage, so look it up once the run has moved on.
    await waitFor(() =>
      expect(
        screen.getByTestId('dry-run-next-technical_assessment'),
      ).toBeInTheDocument(),
    );
    expect(screen.getByTestId('dry-run-now')).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Administrative check is completed: eligible.',
    );
  });

  it('offers to reset the coverage', () => {
    renderPanel();
    expect(
      screen.getByRole('button', { name: 'Reset coverage' }),
    ).toBeInTheDocument();
  });

  it('opens a message in the mail view without repeating its subject', async () => {
    const user = userEvent.setup();
    renderPanel();
    await user.click(screen.getByRole('tab', { name: /Emails/ }));
    expect(await screen.findByText('Proposal received')).toBeInTheDocument();
    expect(screen.getAllByText('No').length).toBeGreaterThan(0);
    await user.click(screen.getByTestId('row-expander'));
    expect(await screen.findByTestId('mail-view')).toBeInTheDocument();
    expect(screen.queryByTestId('mail-subject')).toBeNull();
    expect(screen.getAllByText('No').length).toBeGreaterThan(0);
  });
});
