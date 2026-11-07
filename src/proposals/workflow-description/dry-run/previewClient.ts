import { hashKey, QueryClient, QueryKey } from '@tanstack/react-query';
import { DryRunRead, DryRunViewAsResult } from 'waldur-js-client';

import { publicCallKey } from '@/proposals/callQueries';
import { proposalContributionsKey } from '@/proposals/proposal/contributions/queries';
import {
  releasedReportsKey,
  stepInputsKey,
} from '@/proposals/proposal/inputs/queries';
import {
  myReviewerSuggestionsKey,
  suggestedReviewersKey,
} from '@/proposals/proposal/reviewer-suggestions/queries';
import { stepChecklistKey } from '@/proposals/proposal/StepChecklistSection';
import {
  MY_PROPOSAL_ROLE_ASSIGNMENTS_KEY,
  proposalRoleAssignmentsKey,
} from '@/proposals/proposal-roles/queries';
import { proposalResourceRowsKey } from '@/proposals/useProposalResourceRows';
import {
  latestInstanceOfEachStep,
  proposalWorkflowStatesKey,
} from '@/proposals/workflow/queries';

/** Tables whose rows are a query of the page held in memory, not a
 * request: they keep their own function, which fetches nothing. */
const IN_MEMORY_TABLES = [
  /^MyReviewerSuggestions-/,
  /^SuggestedReviewers-/,
  /^ProposalEvaluators-/,
];

/** The page of rows a table's query asks for, as its key spells it --
 * `['table', name, page, pageSize, query, field, mode, filter, ...]` --
 * narrowed to the event types its filter names, as the events API does. */
const tablePage = (rows: any[], queryKey: QueryKey) => {
  const [, , page = 1, pageSize = rows.length || 1, , , , filter] =
    queryKey as any[];
  const types: string[] | undefined = filter?.event_type;
  const matching = types?.length
    ? rows.filter((row) => types.includes(row?.event_type))
    : rows;
  const start = (Number(page) - 1) * Number(pageSize);
  const shown = matching.slice(start, start + Number(pageSize));
  return { resultCount: matching.length, rows: shown };
};

/** A query the preview has no answer for: it is reported, never fetched. */
class NotPreviewed extends Error {
  constructor(readonly queryKey: QueryKey) {
    super('Not part of the preview');
  }
}

/** A read the backend refused or failed, as the SDK would have thrown it. */
class PreviewedFailure extends Error {
  readonly status: number;
  readonly response: { status: number; data: unknown };

  constructor(read: DryRunRead) {
    super((read.data as any)?.detail || `HTTP ${read.status}`);
    this.status = read.status;
    this.response = { status: read.status, data: read.data };
  }
}

type Answer = { data: unknown } | { failure: DryRunRead };

/**
 * A query client that never fetches. Every query's function is replaced by
 * one that answers from the dry run's own responses, whatever the component
 * asking passes: what was read for the preview is all that is ever shown, so
 * the preview can neither drift from the real components nor fetch real
 * data with the call manager's own token. A query nobody read an answer for
 * is reported and fails.
 */
class PreviewQueryClient extends QueryClient {
  readonly failures = new Map<string, DryRunRead>();
  /** A table's rows by its name: a table's query is keyed by its page,
   * filter and columns as well, so it is answered by name alone. */
  readonly tables = new Map<string, unknown[] | DryRunRead>();

  /** A table's rows: by its name, or by a name ending in `*` that it
   * starts with -- one table per tab, say. */
  tableOf(name: unknown) {
    if (typeof name !== 'string') return undefined;
    if (this.tables.has(name)) return this.tables.get(name);
    const prefix = [...this.tables.keys()].find(
      (key) => key.endsWith('*') && name.startsWith(key.slice(0, -1)),
    );
    return prefix ? this.tables.get(prefix) : undefined;
  }

  constructor(private readonly onMissing: (key: QueryKey) => void) {
    super();
  }

  defaultQueryOptions(options: any): any {
    const defaulted = super.defaultQueryOptions(options);
    const { queryKey } = defaulted;
    return {
      ...defaulted,
      queryFn: (context: any) => {
        const table = queryKey[0] === 'table' && this.tableOf(queryKey[1]);
        if (table) {
          if (!Array.isArray(table)) {
            return Promise.reject(new PreviewedFailure(table));
          }
          return Promise.resolve(tablePage(table, queryKey));
        }
        if (
          queryKey[0] === 'table' &&
          IN_MEMORY_TABLES.some((name) => name.test(queryKey[1] as string))
        ) {
          return (defaulted.queryFn as (context: unknown) => unknown)(context);
        }
        const failure = this.failures.get(hashKey(queryKey));
        if (failure) return Promise.reject(new PreviewedFailure(failure));
        this.onMissing(queryKey);
        return Promise.reject(new NotPreviewed(queryKey));
      },
      retry: false,
      staleTime: Infinity,
      gcTime: Infinity,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchInterval: false,
    };
  }
}

const ok = (read: DryRunRead | undefined) =>
  read !== undefined && read.status >= 200 && read.status < 300;

const refused = (read: DryRunRead | undefined) => read?.status === 403;

/** What the query's own function makes of a response: its data, or a
 * failure it lets through. Each mirrors the function in the query's module. */
const answer = (
  read: DryRunRead,
  onOk: (data: any) => unknown,
  onError: ((read: DryRunRead) => unknown) | 'throw',
): Answer => {
  if (ok(read)) return { data: onOk(read.data) };
  if (onError === 'throw') return { failure: read };
  return { data: onError(read) };
};

const same = (data: any) => data;
const list = (data: any) => data ?? [];
const nothingOnRefusal = (empty: unknown) => (read: DryRunRead) =>
  refused(read) ? { data: empty } : { failure: read };

/** The answer to each query of the preview's components, keyed as each
 * query is, from the dry run's responses. A response no query reads is
 * left out; a query no response answers is not in the result. */
const previewAnswers = (
  view: DryRunViewAsResult,
): Array<[QueryKey, Answer]> => {
  const uuid = view.proposal_uuid;
  const responses = view.responses;
  const contributions = proposalContributionsKey(uuid);
  const answers: Array<[QueryKey, Answer]> = [];
  const add = (key: QueryKey, value: Answer | undefined) => {
    if (value) answers.push([key, value]);
  };
  const read = (key: string) => responses[key] as DryRunRead | undefined;

  const states = read('workflow_states');
  if (states) {
    add(
      proposalWorkflowStatesKey(uuid),
      answer(states, (data) => latestInstanceOfEachStep(data ?? []), 'throw'),
    );
  }
  // The contribution queries swallow every failure into nothing to show.
  const contributionRows = read('contributions');
  if (contributionRows) {
    add(
      contributions,
      answer(contributionRows, list, () => []),
    );
  }
  const assessments = read('offering_assessments');
  if (assessments) {
    add(
      [...contributions, 'offerings'],
      answer(assessments, list, () => []),
    );
  }
  const changeRequests = read('change_requests');
  if (changeRequests) {
    add(
      [...contributions, 'reopenings'],
      answer(
        changeRequests,
        (data: any[] | null) =>
          Object.fromEntries(
            (data ?? [])
              .filter((row) => row.contribution_uuid && row.is_open)
              .map((row) => [row.contribution_uuid, row]),
          ),
        () => ({}),
      ),
    );
  }
  // What each offering team was asked for, on its contribution card. A run
  // recorded before the dry run read it shows no request lines.
  const resources = read('resources');
  add(
    proposalResourceRowsKey(uuid),
    resources ? answer(resources, list, () => []) : { data: [] },
  );
  const released = read('released_reports');
  if (released) {
    add(
      releasedReportsKey(uuid),
      ok(released)
        ? { data: list(released.data) }
        : nothingOnRefusal([])(released),
    );
  }
  Object.entries(responses).forEach(([key, value]) => {
    const [kind, stepUuid] = key.split(':');
    if (!stepUuid) return;
    if (kind === 'step_inputs') {
      add(
        stepInputsKey(uuid, stepUuid),
        ok(value) ? { data: list(value.data) } : nothingOnRefusal(null)(value),
      );
    } else if (kind === 'step_answers') {
      add(
        [...contributions, 'answers', stepUuid],
        answer(
          value,
          (data: any[] | null) =>
            Object.fromEntries((data ?? []).map((row) => [row.uuid, row])),
          () => ({}),
        ),
      );
    } else if (kind === 'step_checklist') {
      add(
        stepChecklistKey(uuid, stepUuid, undefined),
        answer(value, same, 'throw'),
      );
    }
  });
  answers.push(...pageAnswers(view));
  return answers;
};

/** The call settings the page reads, each through its own query: one
 * answer per field set any part of the page asks for. */
const CALL_FIELD_SETS = [
  ['fixed_duration_in_days'],
  ['proposal_field_config'],
  ['allowed_duration_months'],
];

/** The rest of the proposal page, read for a preview of the whole page. */
const pageAnswers = (view: DryRunViewAsResult): Array<[QueryKey, Answer]> => {
  const uuid = view.proposal_uuid;
  const responses = view.responses;
  const read = (key: string) => responses[key] as DryRunRead | undefined;
  const proposal = read('proposal');
  const callUuid = ok(proposal) ? (proposal.data as any)?.call_uuid : undefined;
  const answers: Array<[QueryKey, Answer]> = [];
  const add = (key: QueryKey, value: Answer) => answers.push([key, value]);

  const call = read('call');
  if (call && callUuid) {
    CALL_FIELD_SETS.forEach((fields) =>
      add(publicCallKey(callUuid, fields), answer(call, same, 'throw')),
    );
  }
  // Not configured, or not the viewer's to read: the section is left out.
  const compliance = read('compliance');
  if (compliance) {
    add(
      ['ProposalChecklistSummary', uuid],
      ok(compliance) || [400, 401, 403].includes(compliance.status)
        ? { data: ok(compliance) ? compliance.data : null }
        : { failure: compliance },
    );
  }
  const team = read('team');
  if (team) {
    // A refusal is how the page learns the team is not the viewer's.
    add(
      ['ProposalTeamReadable', uuid],
      answer(team, () => true, 'throw'),
    );
    add(
      ['ProposalManagerCount', uuid],
      answer(
        team,
        (rows: any[] | null) =>
          Math.min(
            (rows ?? []).filter((row) => row.role_name === 'PROPOSAL.MANAGER')
              .length,
            2,
          ),
        'throw',
      ),
    );
  }
  if (callUuid) {
    const roles = read('call_proposal_roles');
    if (roles) {
      add(['callProposalRoles', callUuid], answer(roles, list, 'throw'));
    }
    const steps = read('call_workflow_steps');
    if (steps) {
      add(['callWorkflowSteps', callUuid], answer(steps, list, 'throw'));
    }
  }
  const assignments = read('role_assignments');
  if (assignments) {
    add(proposalRoleAssignmentsKey(uuid), answer(assignments, list, 'throw'));
  }
  const suggested = read('my_reviewer_suggestions');
  if (suggested) {
    add(myReviewerSuggestionsKey(uuid), answer(suggested, list, 'throw'));
  }
  const allSuggested = read('suggested_reviewers');
  if (allSuggested) {
    add(suggestedReviewersKey(uuid), answer(allSuggested, list, 'throw'));
  }
  const mine = read('my_role_assignments');
  if (mine) {
    add(
      [MY_PROPOSAL_ROLE_ASSIGNMENTS_KEY, uuid, view.viewer.uuid],
      answer(mine, list, 'throw'),
    );
  }
  return answers;
};

/** The tables of the page, by name, from the same responses. */
const previewTables = (view: DryRunViewAsResult) => {
  const tables: Array<[string, unknown[] | DryRunRead]> = [];
  const add = (name: string, read: DryRunRead | undefined) => {
    if (read) tables.push([name, ok(read) ? list(read.data) : read]);
  };
  add('ProposalResourcesSummary', view.responses.resources);
  add('ProposalUsersList', view.responses.team);
  // The proposal's activity, one table per category.
  add(`proposal-activity-${view.proposal_uuid}-*`, view.responses.events);
  return tables;
};

/**
 * The isolated client, seeded as each query's own function would have
 * filled it from the same responses. A failure the function would have let
 * through fails the query the same way; anything else unanswered is
 * reported through `onMissing` and fails closed.
 */
export const createPreviewClient = (
  view: DryRunViewAsResult,
  onMissing: (key: QueryKey) => void,
) => {
  const client = new PreviewQueryClient(onMissing);
  previewTables(view).forEach(([name, rows]) => client.tables.set(name, rows));
  previewAnswers(view).forEach(([key, value]) => {
    if ('data' in value) client.setQueryData(key, value.data);
    else client.failures.set(hashKey(key), value.failure);
  });
  return client;
};
