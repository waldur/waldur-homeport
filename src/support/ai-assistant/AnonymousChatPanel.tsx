import { QuestionIcon } from '@phosphor-icons/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FunctionComponent, useCallback, useMemo } from 'react';
import {
  AnonymousChatConversation,
  anonymousChatInteractionsConversationsList,
  anonymousChatInteractionsKpiRetrieve,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { formatUsageValue } from '@/core/formatNumber';
import { SummaryWidget } from '@/core/SummaryWidget';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { createClientPaginatedFetcher } from '@/table/api';
import { BooleanField } from '@/table/BooleanField';
import {
  AnonymousChatInteractionsConversationsFilter,
  AnonymousChatInteractionsConversationsFilterFormId,
  selectAnonymousChatInteractionsConversationsFilter,
} from '@/table/generated/AnonymousChatInteractionsConversationsFilter';
import Table from '@/table/Table';
import { Column, TableRequest } from '@/table/types';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { AnonymousChatTranscriptRow } from './AnonymousChatTranscriptRow';
import {
  feedbackColumn,
  flaggedColumn,
  maxSeverityColumn,
  timestampColumn,
} from './chatLogsColumns';
import { asPercent, toQueryKey, SatisfactionLabel } from './chatLogsShared';

// Persisted per-user column config lives under this key, so it must not change.
export const TABLE_KEY = 'AnonymousChatConversations';

// The slug is an opaque salted hash with no readable structure, so a prefix is
// enough to tell visitors apart at a glance. Full value stays in the title so
// it can still be read and copied; search matches on the untruncated value.
const VISITOR_SLUG_PREFIX = 10;

const renderVisitor = (slug?: string | null) =>
  slug ? (
    <span title={slug}>{slug.slice(0, VISITOR_SLUG_PREFIX)}…</span>
  ) : (
    renderFieldOrDash(slug)
  );

export const AnonymousChatPanel: FunctionComponent = () => {
  const queryClient = useQueryClient();

  const values = useFilterValues(TABLE_KEY);
  const filter = useMemo(
    () => selectAnonymousChatInteractionsConversationsFilter(values),
    [values],
  );

  // Narrowing happens server-side, slicing client-side. The search in
  // particular has to: it runs full-text over the transcript, and the row
  // payload carries no message text to match against — only a salted visitor
  // hash. The response is unpaginated, so paging and sorting stay in memory.
  const fetchData = useCallback(async (request: TableRequest) => {
    const params = request.filter ?? {};
    const { data } = await anonymousChatInteractionsConversationsList({
      query: {
        created_after: params.created_after,
        created_before: params.created_before,
        last_active_after: params.last_active_after,
        last_active_before: params.last_active_before,
        user_slug: params.user_slug,
        is_flagged: params.is_flagged,
        severity: params.severity,
        has_feedback: params.has_feedback,
        is_reviewed: params.is_reviewed,
        // Conversation-level bounds: the backend applies these after grouping,
        // so a matching conversation comes back whole rather than trimmed to
        // its qualifying turns.
        input_tokens_min: params.input_tokens_min,
        input_tokens_max: params.input_tokens_max,
        output_tokens_min: params.output_tokens_min,
        output_tokens_max: params.output_tokens_max,
        total_tokens_min: params.total_tokens_min,
        total_tokens_max: params.total_tokens_max,
        query: params.query,
      },
    });
    return createClientPaginatedFetcher(data ?? [])(request);
  }, []);

  const tableProps = useTable({
    table: TABLE_KEY,
    syncFiltersToURL: true,
    fetchData,
    filter,
    // The server searches transcript content and the visitor hash together, so
    // the term goes over the wire rather than being matched against the row.
    queryField: 'query',
  });

  // The KPI roll-up must be scoped exactly like the table, search included —
  // useTable threads the term separately from `filter`, so passing `filter`
  // alone would leave the widget contradicting the rows.
  const statsFilter = useMemo(
    () => (tableProps.query ? { ...filter, query: tableProps.query } : filter),
    [filter, tableProps.query],
  );

  const { data: kpi, refetch: refetchKpi } = useQuery({
    // statsFilter belongs in the key or react-query serves the first scope's
    // numbers for every later scope.
    queryKey: ['anonymous-chat-kpi', toQueryKey(statsFilter)],
    queryFn: () =>
      anonymousChatInteractionsKpiRetrieve({ query: statsFilter }).then(
        (r) => r.data,
      ),
  });

  const stats = useMemo(
    () =>
      kpi
        ? [
            {
              // An anonymous session is one conversation, which is what the
              // authenticated tab calls a thread — the vocabulary is unified on
              // screen even though the API keeps saying session_id.
              label: translate('Threads'),
              value: kpi.sessions_total.toLocaleString(),
            },
            {
              label: translate('Unique visitors'),
              value: kpi.unique_users.toLocaleString(),
            },
            {
              label: <SatisfactionLabel id="anon-chat-satisfaction" />,
              value: asPercent(kpi.satisfaction_rate),
            },
            {
              label: (
                <>
                  {translate('Click-through')}{' '}
                  <Tip
                    id="anon-chat-click-through"
                    label={translate(
                      'Offering links opened ÷ interactions. Repeat clicks on the same offering count separately, so this can exceed 100%. Only links the assistant is recorded as having shown are counted.',
                    )}
                  >
                    <QuestionIcon weight="bold" />
                  </Tip>
                </>
              ),
              value: asPercent(kpi.click_through_rate),
            },
            {
              // Combined rather than split across two tiles like the
              // authenticated tab: a sixth tile drops SummaryWidget out of its
              // five-stat auto-width case into a wrapping row. The split is
              // still one hover away.
              label: (
                <>
                  {translate('Tokens')}{' '}
                  <Tip
                    id="anon-chat-tokens"
                    label={translate('{input} input / {output} output', {
                      input: formatUsageValue(kpi.input_tokens_total),
                      output: formatUsageValue(kpi.output_tokens_total),
                    })}
                  >
                    <QuestionIcon weight="bold" />
                  </Tip>
                </>
              ),
              value: formatUsageValue(
                kpi.input_tokens_total + kpi.output_tokens_total,
              ),
            },
          ]
        : [],
    [kpi],
  );

  // Second row: the nightly LLM judge. Kept apart from the row above because
  // every figure here has a different denominator — judged threads, not all of
  // them — and because the judge bills to its own token budget.
  const reviewStats = useMemo(() => {
    if (!kpi) return [];
    const intents = Object.entries(kpi.llm_intent_distribution ?? {});
    const topIntent = intents.length
      ? intents.reduce((top, entry) => (entry[1] > top[1] ? entry : top))
      : null;

    return [
      {
        label: (
          <>
            {translate('Reviewed')}{' '}
            <Tip
              id="anon-chat-reviewed"
              label={translate(
                'Threads carrying an LLM judge verdict ({coverage} of all threads). The nightly pass only picks up threads idle for 6+ hours, so the newest ones are always unjudged — but a count stuck at zero means review is switched off or failing.',
                { coverage: asPercent(kpi.review_coverage) },
              )}
            >
              <QuestionIcon weight="bold" />
            </Tip>
          </>
        ),
        value: kpi.reviewed_total.toLocaleString(),
      },
      {
        label: (
          <>
            {translate('Avg resolution')}{' '}
            <Tip
              id="anon-chat-resolution"
              label={translate(
                "The judge's 1–5 rating of how well the assistant resolved the visitor's request, averaged over judged threads only.",
              )}
            >
              <QuestionIcon weight="bold" />
            </Tip>
          </>
        ),
        value:
          kpi.avg_llm_resolution_score == null
            ? translate('N/A')
            : `${kpi.avg_llm_resolution_score.toFixed(1)} / 5`,
      },
      {
        label: (
          <>
            {translate('Hallucinations')}{' '}
            <Tip
              id="anon-chat-hallucinations"
              label={translate(
                'Share of judged threads where the judge flagged a claim the tool results did not support. Expand a thread to read what it caught.',
              )}
            >
              <QuestionIcon weight="bold" />
            </Tip>
          </>
        ),
        value: asPercent(kpi.hallucination_rate),
      },
      {
        label: (
          <>
            {translate('Top intent')}{' '}
            <Tip
              id="anon-chat-top-intent"
              label={
                topIntent
                  ? translate(
                      '{count} of {reviewed} judged threads. Categories are derived from the marketplace catalog, so the set differs between deployments.',
                      {
                        count: topIntent[1].toLocaleString(),
                        reviewed: kpi.reviewed_total.toLocaleString(),
                      },
                    )
                  : translate('No threads have been judged yet.')
              }
            >
              <QuestionIcon weight="bold" />
            </Tip>
          </>
        ),
        value: topIntent ? topIntent[0] : translate('N/A'),
      },
      {
        label: (
          <>
            {translate('Review tokens')}{' '}
            <Tip
              id="anon-chat-review-tokens"
              label={translate('{input} input / {output} output', {
                input: formatUsageValue(kpi.review_input_tokens_total),
                output: formatUsageValue(kpi.review_output_tokens_total),
              })}
            >
              <QuestionIcon weight="bold" />
            </Tip>
          </>
        ),
        value: formatUsageValue(
          kpi.review_input_tokens_total + kpi.review_output_tokens_total,
        ),
      },
    ];
  }, [kpi]);

  // Handed to Table in place of useTable's own fetch so the toolbar's built-in
  // refresh button drives it — mounting a custom button through tableActions
  // would land it after the column-settings gear instead of beside the search
  // box. Table also calls this on paging and sorting, so the stats reload more
  // often than strictly needed; the alternative was a misplaced button.
  const { fetch: reloadTable } = tableProps;
  const handleRefresh = useCallback(() => {
    void reloadTable();
    void refetchKpi();
    // Each expanded row owns a per-session transcript query this component has
    // no handle on. Without invalidating the prefix, an open row keeps showing
    // the feedback and click counts it fetched when it was expanded.
    void queryClient.invalidateQueries({
      queryKey: ['anonymous-chat-transcript'],
    });
  }, [reloadTable, refetchKpi, queryClient]);

  const columns = useMemo<Column<AnonymousChatConversation>[]>(
    () => [
      {
        title: translate('Visitor'),
        render: ({ row }) => renderVisitor(row.user_slug),
        // The cell truncates to keep the column narrow; an export is read
        // elsewhere, where a cut-off hash joins to nothing.
        export: (row) => row.user_slug || '',
        orderField: 'user_slug',
        id: 'user_slug',
        keys: ['user_slug'],
      },
      {
        title: translate('Messages'),
        render: ({ row }) => row.message_count,
        export: (row) => row.message_count ?? 0,
        orderField: 'message_count',
        id: 'message_count',
        keys: ['message_count'],
      },
      {
        title: translate('Offerings shown'),
        render: ({ row }) => (
          <div className="d-flex align-items-center gap-2">
            <span>{row.offerings_shown ?? 0}</span>
            {Boolean(row.offerings_clicked) && (
              <Badge variant="success" size="sm" outline>
                {translate('{count} clicks', {
                  count: row.offerings_clicked,
                })}
              </Badge>
            )}
          </div>
        ),
        // Both halves of the cell, since a spreadsheet has no badge to carry
        // the click count.
        export: (row) =>
          `${row.offerings_shown ?? 0} / ${row.offerings_clicked ?? 0}`,
        exportTitle: translate('Offerings shown / clicks'),
        orderField: 'offerings_shown',
        id: 'offerings_shown',
        keys: ['offerings_shown', 'offerings_clicked'],
      },
      {
        title: translate('Input tokens'),
        render: ({ row }) =>
          renderFieldOrDash(formatUsageValue(row.input_tokens)),
        export: (row) => row.input_tokens ?? '',
        orderField: 'input_tokens',
        id: 'input_tokens',
        keys: ['input_tokens'],
        optional: true,
      },
      {
        title: translate('Output tokens'),
        render: ({ row }) =>
          renderFieldOrDash(formatUsageValue(row.output_tokens)),
        export: (row) => row.output_tokens ?? '',
        orderField: 'output_tokens',
        id: 'output_tokens',
        keys: ['output_tokens'],
        optional: true,
      },
      {
        title: translate('Total tokens'),
        // Visitor spend only — the LLM judge runs on a separate budget and is
        // reported apart in the KPI.
        render: ({ row }) =>
          renderFieldOrDash(formatUsageValue(row.total_tokens)),
        export: (row) => row.total_tokens ?? '',
        orderField: 'total_tokens',
        id: 'total_tokens',
        keys: ['total_tokens'],
      },
      flaggedColumn<AnonymousChatConversation>({
        id: 'is_flagged',
        orderField: 'is_flagged',
      }),
      feedbackColumn<AnonymousChatConversation>({
        id: 'has_feedback',
        orderField: 'has_feedback',
      }),
      maxSeverityColumn<AnonymousChatConversation>({
        id: 'max_severity',
        // Numeric ordinal serialized by the backend (0=none … 4=critical) —
        // sorting the label alphabetically would put low above medium.
        orderField: 'max_severity_rank',
      }),
      {
        title: translate('Reviewed'),
        // The judge scores a conversation once and never revisits it, so this
        // is a fact about the conversation rather than a coverage fraction.
        render: ({ row }) => <BooleanField value={row.is_reviewed} />,
        export: (row) => (row.is_reviewed ? translate('Yes') : translate('No')),
        orderField: 'is_reviewed',
        filter: 'is_reviewed',
        id: 'reviewed',
        keys: ['is_reviewed'],
        optional: true,
      },
      {
        title: translate('Model'),
        // Blank means the conversation predates model tracking; two values
        // means AI_ASSISTANT_MODEL was switched partway through it.
        render: ({ row }) => renderFieldOrDash(row.models_used),
        export: (row) => row.models_used || '',
        id: 'model',
        orderField: 'models_used',
        keys: ['models_used'],
        optional: true,
      },
      // The anonymous row names its timestamps after the conversation rather
      // than the record: it starts and stays active, it is not modified.
      timestampColumn<AnonymousChatConversation>(
        translate('Created'),
        'started',
        { id: 'started' },
      ),
      timestampColumn<AnonymousChatConversation>(
        translate('Modified'),
        'last_active',
        { id: 'last_active' },
      ),
    ],
    [],
  );

  return (
    <div className="pt-5">
      {kpi && (
        <>
          <SummaryWidget stats={stats} className="mx-0" />
          {/* Scope stated once: the judge row is narrowed by the same query, so
              repeating the caption would just be noise. */}
          <SummaryWidget stats={reviewStats} className="mx-0" />
        </>
      )}
      <Table<AnonymousChatConversation>
        {...tableProps}
        fetch={handleRefresh}
        columns={columns}
        verboseName={translate('Anonymous threads')}
        expandableRow={AnonymousChatTranscriptRow}
        filters={<AnonymousChatInteractionsConversationsFilter />}
        formId={AnonymousChatInteractionsConversationsFilterFormId}
        // The card header already reads "AI assistant"; the table's own title
        // falls back to the page breadcrumb and would just repeat it.
        hideTitle
        hasQuery
        hasOptionalColumns
        enableExport
      />
    </div>
  );
};
