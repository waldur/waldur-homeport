import { renderHook, screen, waitFor } from '@testing-library/react';
import { act, ReactNode } from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  callReviewerPoolsList,
  myAssignmentBatchesList,
  proposalMyTasksSummaryRetrieve,
  proposalReviewsList,
  proposalRoleAssignmentsList,
} from 'waldur-js-client';

import { createTestWrapper, renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import {
  getTaskTarget,
  MyTasksPage,
  scrollToSectionWhenReady,
} from './MyTasksPage';
import { useMyReviewsTabs } from './tabs';

const { rows, tableProps } = vi.hoisted(() => ({
  rows: [
    {
      key: 'contribution:1',
      needed: 'contribute',
      needed_label: 'Submit your contribution',
      detail: 'North partition',
      proposal_uuid: 'p1',
      proposal_name: 'Galaxy formation',
      proposal_slug: 'r1-001',
      call_uuid: 'c1',
      call_name: 'Extreme scale',
      round_uuid: 'r1',
      round_name: 'Spring round',
      step_uuid: 's1',
      call_step_uuid: 'cs1',
      step_name: 'Technical assessment',
      step_kind: 'assessment',
      due_at: '2026-10-01T00:00:00Z',
      is_overdue: true,
      target: 'proposal',
      target_section: 'step-contributions-cs1',
      target_uuid: null,
    },
    {
      key: 'invitation:2',
      needed: 'answer_invitation',
      needed_label: 'Accept or decline the invitation',
      detail: '',
      proposal_uuid: null,
      proposal_name: null,
      proposal_slug: null,
      call_uuid: 'c2',
      call_name: 'Small call',
      round_uuid: null,
      round_name: null,
      step_uuid: null,
      call_step_uuid: null,
      step_name: null,
      step_kind: null,
      due_at: null,
      is_overdue: false,
      target: 'invitations',
      target_section: null,
      target_uuid: 'i2',
    },
  ] as any[],
  tableProps: { value: null as any },
}));

vi.mock('@/table/useTable', () => ({
  useTable: (options) => {
    tableProps.value = options;
    return { fetch: vi.fn() };
  },
}));

vi.mock('@/table/Table', () => ({
  default: (props) => {
    tableProps.value = { ...tableProps.value, ...props };
    return (
      <>
        {rows.map((row) => (
          <div
            key={row.key}
            data-testid={`row-${row.key}`}
            className={props.rowClass({ row })}
          >
            {props.columns.map((column, index) => (
              <span key={index}>{column.render({ row })}</span>
            ))}
          </div>
        ))}
      </>
    );
  },
}));

vi.mock('@/core/Link', () => ({
  Link: ({ label, state, params, onClick }) => (
    <a
      href="#task"
      data-state={state}
      data-params={JSON.stringify(params ?? {})}
      onClick={(event) => {
        event.preventDefault();
        onClick?.();
      }}
    >
      {label}
    </a>
  ),
}));

const renderPage = (tables = {}) =>
  renderWithProviders(<MyTasksPage />, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <Provider store={configureStore()({ tables })}>{children}</Provider>
    ),
  });

const countResponse = (count: number) =>
  ({
    data: [],
    response: { headers: new Headers({ 'x-result-count': String(count) }) },
  }) as any;

beforeEach(() => {
  vi.mocked(useUser).mockReturnValue({ uuid: 'u1' } as any);
  vi.mocked(proposalMyTasksSummaryRetrieve).mockResolvedValue({
    data: { total: 4, overdue: 1, due_soon: 0, due_soon_days: 7 },
  } as any);
  vi.mocked(proposalReviewsList).mockResolvedValue(countResponse(0));
  vi.mocked(callReviewerPoolsList).mockResolvedValue(countResponse(0));
  vi.mocked(proposalRoleAssignmentsList).mockResolvedValue(countResponse(0));
  vi.mocked(myAssignmentBatchesList).mockResolvedValue({ data: [] } as any);
});

describe('MyTasksPage', () => {
  it('links each task to where the work is done', () => {
    renderPage();
    const contribute = screen.getByText('Submit your contribution');
    expect(contribute.dataset.state).toBe('proposals.manage-proposal');
    expect(JSON.parse(contribute.dataset.params)).toEqual({
      proposal_uuid: 'p1',
      '#': 'step-contributions-cs1',
    });
    const invitation = screen.getByText('Accept or decline the invitation');
    expect(invitation.dataset.state).toBe('reviews-invitations');
  });

  it('shows the proposal, call, round, step and what the slot is about', () => {
    renderPage();
    for (const text of [
      'Galaxy formation',
      'Extreme scale',
      'Spring round',
      'Technical assessment',
      'North partition',
    ]) {
      expect(screen.getByText(text)).toBeInTheDocument();
    }
  });

  it('highlights an overdue task', () => {
    renderPage();
    expect(screen.getByText('Overdue')).toBeInTheDocument();
    expect(screen.getByTestId('row-contribution:1')).toHaveClass(
      'table-danger',
    );
    expect(screen.getByTestId('row-invitation:2')).not.toHaveClass(
      'table-danger',
    );
  });

  it('says so when nothing is waiting', () => {
    renderPage();
    expect(tableProps.value.emptyMessage).toBe('Nothing waiting for you.');
    expect(tableProps.value.table).toBe('MyTasks');
  });

  it('asks for the tasks the Due filter holds, and says when none match', () => {
    renderPage({
      MyTasks: {
        filtersStorage: [
          { name: 'due', value: { value: 'overdue', label: 'Overdue' } },
        ],
      },
    });
    expect(tableProps.value.filter).toEqual({ due: 'overdue' });
    expect(tableProps.value.emptyMessage).toBe(
      'No task waiting for you matches this deadline.',
    );
  });

  it('scrolls to the section once the proposal page renders it', async () => {
    const scrollIntoView = vi.fn();
    scrollToSectionWhenReady('step-evaluators');
    const section = document.createElement('div');
    section.id = 'step-evaluators';
    section.scrollIntoView = scrollIntoView;
    act(() => {
      document.body.appendChild(section);
    });
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalled());
    section.remove();
  });
});

describe('getTaskTarget', () => {
  const task = (values) => ({ ...rows[0], ...values });

  it('opens a review on its own page', () => {
    expect(
      getTaskTarget(task({ target: 'review', target_uuid: 'r9' })),
    ).toEqual({ state: 'proposal-review', params: { review_uuid: 'r9' } });
  });

  it("opens a round report on its page and a round step on the call's rounds", () => {
    expect(
      getTaskTarget(task({ target: 'round_report', target_uuid: 'n1' })),
    ).toEqual({ state: 'round-report', params: { report_uuid: 'n1' } });
    expect(getTaskTarget(task({ target: 'round', call_uuid: 'c7' }))).toEqual({
      state: 'protected-call.main',
      params: { call_uuid: 'c7', tab: 'rounds' },
    });
  });

  it('opens assignments and evaluator roles on their tabs', () => {
    expect(getTaskTarget(task({ target: 'assignments' }))?.state).toBe(
      'reviews-assignments',
    );
    expect(getTaskTarget(task({ target: 'evaluator_roles' }))?.state).toBe(
      'reviews-evaluator-roles',
    );
  });

  // The applicant's view of a proposal has no step actions for a call
  // manager; the call manager's view does. Organisers hold the call through
  // their organisation, which the backend knows and says.
  it("opens a call team's task in the call manager's view", () => {
    expect(
      getTaskTarget(
        task({
          target: 'proposal',
          target_section: 's1',
          view: 'call_team',
          view_customer_uuid: 'org-1',
        }),
      ),
    ).toEqual({
      state: 'call-management.proposal-details',
      params: { uuid: 'org-1', proposal_uuid: 'p1', '#': 's1' },
    });
  });

  it("opens an evaluator's task on the plain page", () => {
    expect(
      getTaskTarget(
        task({
          target: 'proposal',
          target_section: null,
          view: 'participant',
          provider_uuid: 'prov-1',
        }),
      ),
    ).toEqual({
      state: 'proposals.manage-proposal',
      params: { proposal_uuid: 'p1' },
    });
  });

  it("opens the applicant's form for changes requested of them", () => {
    expect(
      getTaskTarget(
        task({
          needed: 'submit_changes',
          target: 'proposal',
          target_section: null,
        }),
      ),
    ).toEqual({
      state: 'proposals.manage-proposal',
      params: { proposal_uuid: 'p1' },
    });
  });

  it("opens an offering team's task in the provider's view", () => {
    expect(
      getTaskTarget(
        task({
          target: 'proposal',
          target_section: null,
          view: 'offering_team',
          view_customer_uuid: 'prov-1',
        }),
      ),
    ).toEqual({
      state: 'provider-call-proposal',
      params: { proposal_uuid: 'p1', uuid: 'prov-1' },
    });
  });

  it('opens a proposal at its top when no section is named', () => {
    expect(
      getTaskTarget(task({ target: 'proposal', target_section: null })),
    ).toEqual({
      state: 'proposals.manage-proposal',
      params: { proposal_uuid: 'p1' },
    });
  });
});

describe('useMyReviewsTabs', () => {
  it('puts Tasks first, with its count', async () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useMyReviewsTabs(), { wrapper });
    expect(result.current[0].key).toBe('tasks');
    expect(result.current[0].state).toBe('reviews-tasks');
    await waitFor(() => expect(result.current[0].count).toBe(4));
    expect(result.current[0].title).toBe('Tasks');
    expect(result.current[0].countVariant).toBeUndefined();
  });
});

describe('useMyReviewsTabs, by what the user does', () => {
  const keys = (result) => result.current.map((tab) => tab.key);

  it('gives an applicant Tasks alone', async () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useMyReviewsTabs(), { wrapper });
    await waitFor(() => expect(result.current[0].count).toBe(4));
    expect(keys(result)).toEqual(['tasks']);
  });

  it('gives a reviewer the reviewer tabs', () => {
    vi.mocked(useUser).mockReturnValue({
      uuid: 'u1',
      permissions: [{ scope_type: 'call', role_name: 'CALL.REVIEWER' }],
    } as any);
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useMyReviewsTabs(), { wrapper });
    expect(keys(result)).toEqual([
      'tasks',
      'reviews',
      'assignments',
      'invitations',
      'calls',
    ]);
  });

  it('adds Evaluator roles for someone holding one', async () => {
    vi.mocked(proposalRoleAssignmentsList).mockResolvedValue(countResponse(1));
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useMyReviewsTabs(), { wrapper });
    await waitFor(() => expect(keys(result)).toContain('evaluator-roles'));
  });
});
