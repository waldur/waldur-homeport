import { FC, useMemo } from 'react';
import { MyTask, proposalMyTasksList } from 'waldur-js-client';

import { Badge } from 'waldur-ui';

import { formatDate } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { OFFERING_TEAM_PROPOSAL_STATE } from '@/proposals/proposal/proposalView';
import { requestSection } from '@/proposals/proposal/requestedSection';
import { createFetcher } from '@/table/api';
import {
  ProposalMyTasksFilter,
  selectProposalMyTasksFilter,
} from '@/table/generated/ProposalMyTasksFilter';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { DelegatedTaskActions } from './DelegatedTaskActions';
import { MY_TASKS_TABLE } from './myTasksTable';
import { useMyWorkTitle } from './myWorkTitle';
import { useMyReviewsTabs } from './tabs';

const SCROLL_TIMEOUT_MS = 10000;
// How long the page keeps the section in view while what is above it loads.
const SETTLE_MS = 4000;

/**
 * Scrolls to a section of the page being opened once it renders, and keeps
 * it in view while the page settles. The proposal page lays its sections out
 * after its data loads, so a plain hash would find nothing to scroll to, and
 * what loads above the section afterwards (the timeline, the step's actions)
 * would push it back down. The user scrolling themselves ends it.
 */
export const scrollToSectionWhenReady = (sectionId: string) => {
  let found = false;
  let stopped = false;
  const stop = () => {
    stopped = true;
    observer.disconnect();
    for (const event of USER_SCROLL_EVENTS) {
      window.removeEventListener(event, stop);
    }
  };
  const scroll = (behavior: ScrollBehavior) => {
    const element = document.getElementById(sectionId);
    if (!element) {
      return;
    }
    element.scrollIntoView({ behavior, block: 'start' });
    if (!found) {
      found = true;
      setTimeout(stop, SETTLE_MS);
    }
  };
  const observer = new MutationObserver(() => {
    if (!stopped) {
      scroll(found ? 'auto' : 'smooth');
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  for (const event of USER_SCROLL_EVENTS) {
    window.addEventListener(event, stop, { once: true, passive: true });
  }
  setTimeout(() => {
    if (!found) {
      stop();
    }
  }, SCROLL_TIMEOUT_MS);
  scroll('smooth');
};

const USER_SCROLL_EVENTS = ['wheel', 'touchstart', 'keydown'] as const;

/** The page a task opens on, as a router state and its params. */
export const getTaskTarget = (
  task: MyTask,
): { state: string; params?: Record<string, string> } | null => {
  switch (task.target) {
    case 'proposal': {
      if (!task.proposal_uuid) {
        return null;
      }
      const params = {
        proposal_uuid: task.proposal_uuid,
        ...(task.target_section ? { '#': task.target_section } : {}),
      };
      // The view of the role that gave the user the task: the call team
      // acts from the call manager's view, an offering team from the
      // provider's, with that chain back.
      if (task.view === 'call_team' && task.view_customer_uuid) {
        return {
          state: 'call-management.proposal-details',
          params: { uuid: task.view_customer_uuid, ...params },
        };
      }
      if (task.view === 'offering_team' && task.view_customer_uuid) {
        return {
          state: OFFERING_TEAM_PROPOSAL_STATE,
          params: { ...params, uuid: task.view_customer_uuid },
        };
      }
      return { state: 'proposals.manage-proposal', params };
    }
    case 'review':
      return task.target_uuid
        ? {
            state: 'proposal-review',
            params: { review_uuid: task.target_uuid },
          }
        : null;
    case 'assignments':
      return { state: 'reviews-assignments' };
    case 'invitations':
      return { state: 'reviews-invitations' };
    case 'evaluator_roles':
      return { state: 'reviews-evaluator-roles' };
    case 'round_report':
      return task.target_uuid
        ? { state: 'round-report', params: { report_uuid: task.target_uuid } }
        : null;
    case 'round':
      return task.call_uuid
        ? {
            state: 'protected-call.main',
            params: { call_uuid: task.call_uuid, tab: 'rounds' },
          }
        : null;
    case 'offering_requests':
      return task.target_uuid
        ? {
            state: 'marketplace-provider-offering-requests',
            params: { uuid: task.target_uuid },
          }
        : null;
    default:
      return null;
  }
};

export const TaskLink: FC<{ task: MyTask }> = ({ task }) => {
  const target = getTaskTarget(task);
  const label = task.needed_label;
  // A contribution handed to the user is answered from here: the proposal
  // may not open to them before they accept it.
  if (!target || task.needed === 'accept_delegation') {
    return <span className="font-medium text-primary">{label}</span>;
  }
  return (
    <Link
      state={target.state}
      params={target.params}
      label={label}
      onClick={() => {
        if (task.target === 'proposal' && task.target_section) {
          if (task.proposal_uuid) {
            requestSection(task.proposal_uuid, task.target_section);
          }
          scrollToSectionWhenReady(task.target_section);
        }
      }}
    />
  );
};

export const DueDate: FC<{ task: MyTask }> = ({ task }) => {
  if (!task.due_at) {
    return <>{renderFieldOrDash(null)}</>;
  }
  return (
    <span className="flex items-center gap-1.5">
      {/* Plain: the Overdue badge says it, not the date's colour. */}
      <span>{formatDate(task.due_at)}</span>
      {task.is_overdue && (
        <Badge variant="danger" size="sm" shape="pill" tone="outline">
          {translate('Overdue')}
        </Badge>
      )}
    </span>
  );
};

/**
 * Everything waiting for the current user across calls: contributions to
 * fill, steps to complete, reviews to write, assignments and invitations to
 * answer, applicant responses and awards. Each row opens the page, and the
 * section of it, where the work is done.
 */
export const MyTasksPage: FC = () => {
  const myWorkTitle = useMyWorkTitle();
  const tabs = useMyReviewsTabs();

  const values = useFilterValues(MY_TASKS_TABLE);
  const filter = useMemo(() => selectProposalMyTasksFilter(values), [values]);
  const tableProps = useTable({
    table: MY_TASKS_TABLE,
    fetchData: createFetcher(proposalMyTasksList),
    filter,
    syncFiltersToURL: true,
  });

  const columns: Column<MyTask>[] = [
    {
      title: translate('What is needed'),
      render: ({ row }) => (
        // One line a row: the detail (the role to assign) beside the task.
        <div className="flex items-center gap-1.5">
          <TaskLink task={row} />
          {row.detail ? (
            <span className="text-quaternary">{row.detail}</span>
          ) : null}
        </div>
      ),
    },
    // One value a cell, as the app's lists have it: the round is a column
    // of its own, not a second line under the call.
    {
      title: translate('Proposal'),
      render: ({ row }) => <>{renderFieldOrDash(row.proposal_name)}</>,
    },
    {
      title: translate('Call'),
      render: ({ row }) => <>{renderFieldOrDash(row.call_name)}</>,
    },
    {
      title: translate('Round'),
      render: ({ row }) => <>{renderFieldOrDash(row.round_name)}</>,
    },
    {
      title: translate('Step'),
      render: ({ row }) => <span>{renderFieldOrDash(row.step_name)}</span>,
    },
    {
      title: translate('Due'),
      render: ({ row }) => <DueDate task={row} />,
    },
  ];

  return (
    <Table<MyTask>
      {...tableProps}
      columns={columns}
      title={myWorkTitle}
      // The page's own title above the card, as My proposals has it.
      standalone
      // A strip of one tab says nothing: shown only with a second one.
      tabs={tabs.length > 1 ? tabs : undefined}
      filters={<ProposalMyTasksFilter />}
      verboseName={translate('tasks')}
      emptyMessage={
        filter.due
          ? translate('No task waiting for you matches this deadline.')
          : translate('Nothing waiting for you.')
      }
      rowClass={({ row }) => (row.is_overdue ? 'table-danger' : '')}
      hasQuery={false}
      // Only a delegated task has actions; with none on the page there is
      // no Actions column, rather than an empty one.
      rowActions={
        tableProps.rows?.some((task) => task.needed === 'accept_delegation')
          ? ({ row }) =>
              row.needed === 'accept_delegation' ? (
                <DelegatedTaskActions task={row} refetch={tableProps.fetch} />
              ) : null
          : undefined
      }
    />
  );
};
