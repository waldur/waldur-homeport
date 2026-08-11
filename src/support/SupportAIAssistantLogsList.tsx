import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FunctionComponent, useCallback, useMemo } from 'react';
import {
  chatThreadsList,
  chatThreadsStatsRetrieve,
  ThreadSession,
} from 'waldur-js-client';

import { formatUsageValue } from '@/core/formatNumber';
import { SummaryWidget } from '@/core/SummaryWidget';
import { translate } from '@/i18n';
import {
  feedbackColumn,
  flaggedColumn,
  maxSeverityColumn,
  timestampColumn,
} from '@/support/ai-assistant/chatLogsColumns';
import {
  asPercent,
  toQueryKey,
  SatisfactionLabel,
} from '@/support/ai-assistant/chatLogsShared';
import { SupportAIAssistantLogsExpandableRow } from '@/support/SupportAIAssistantLogsExpandableRow';
import { createFetcher } from '@/table/api';
import {
  ChatThreadsFilter as SupportAIAssistantLogsFilter,
  selectChatThreadsFilter as selectSupportAIAssistantLogsFilter,
  ChatThreadsFilterFormId,
} from '@/table/generated/ChatThreadsFilter';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

export const TABLE_KEY = 'SupportAIAssistantLogsList';

export const SupportAIAssistantLogsList: FunctionComponent = () => {
  const queryClient = useQueryClient();
  const values = useFilterValues(TABLE_KEY);

  const filter = useMemo(
    () => selectSupportAIAssistantLogsFilter(values),
    [values],
  );

  const fetcher = useMemo(() => createFetcher(chatThreadsList), []);

  const tableProps = useTable({
    table: TABLE_KEY,
    syncFiltersToURL: true,
    fetchData: fetcher,
    filter,
    queryField: 'query',
    mandatoryFields: ['title_gen_input_tokens', 'title_gen_output_tokens'],
  });

  // The table is narrowed by `filter` AND by the free-text term, which useTable
  // threads separately from it. The summary has to carry both or it contradicts
  // the rows beneath it — same combination the export performs in
  // useTableExport.
  const statsFilter = useMemo(
    () => (tableProps.query ? { ...filter, query: tableProps.query } : filter),
    [filter, tableProps.query],
  );

  const { data: threadStats, refetch: refetchStats } = useQuery({
    // statsFilter belongs in the key: otherwise react-query serves the first
    // scope's numbers for every later scope.
    queryKey: ['chat-threads-stats', toQueryKey(statsFilter)],
    queryFn: () =>
      chatThreadsStatsRetrieve({ query: statsFilter }).then((r) => r.data),
  });

  // Handed to Table in place of useTable's own fetch, so the toolbar's refresh
  // button drives all three surfaces — same wiring as the anonymous panel.
  // Table also calls this on paging and sorting, so the stats reload more often
  // than strictly needed; the alternative was mounting a custom button through
  // tableActions, which lands it after the column-settings gear.
  const { fetch: reloadTable } = tableProps;
  const handleRefresh = useCallback(() => {
    void reloadTable();
    void refetchStats();
    // Each expanded row owns a per-thread transcript query this component has no
    // handle on. Its key carries `modified`, but submitting feedback saves the
    // message with an explicit update_fields list that never touches the thread
    // — so the key does not change and an open row keeps showing the feedback it
    // held when it was expanded.
    void queryClient.invalidateQueries({ queryKey: ['chatMessages'] });
  }, [reloadTable, refetchStats, queryClient]);

  // No click-through here: offering-click attribution exists only on the
  // anonymous path, so these slots carry token spend — the cost signal this
  // channel does track. Sessions is deliberately absent: a ChatSession is a
  // long-lived per-user container, so it just restates Users (2 against 320
  // threads), unlike the anonymous side where a session is one conversation.
  const stats = useMemo(
    () =>
      threadStats
        ? [
            {
              label: translate('Threads'),
              value: threadStats.threads_total.toLocaleString(),
            },
            {
              label: translate('Users'),
              value: threadStats.users_total.toLocaleString(),
            },
            {
              label: <SatisfactionLabel id="auth-chat-satisfaction" />,
              value: asPercent(threadStats.satisfaction_rate),
            },
            {
              label: translate('Input tokens'),
              value: formatUsageValue(threadStats.input_tokens_total),
            },
            {
              label: translate('Output tokens'),
              value: formatUsageValue(threadStats.output_tokens_total),
            },
          ]
        : [],
    [threadStats],
  );

  const columns = useMemo<Column<ThreadSession>[]>(
    () => [
      {
        title: translate('User'),
        render: ({ row }) =>
          renderFieldOrDash(row.user_full_name || row.user_username),
        export: (row) => row.user_full_name || row.user_username,
        filter: 'user',
        id: 'user',
        keys: ['user_full_name', 'user_username'],
      },
      {
        title: translate('Thread name'),
        render: ({ row }) => renderFieldOrDash(row.name),
        export: (row) => row.name || '',
        id: 'thread_name',
        keys: ['name'],
      },
      {
        title: translate('Messages'),
        render: ({ row }) => row.message_count || 0,
        export: (row) => row.message_count || 0,
        id: 'messages',
        keys: ['message_count'],
      },
      {
        title: translate('Input tokens'),
        render: ({ row }) =>
          renderFieldOrDash(formatUsageValue(row.input_tokens)),
        orderField: 'input_tokens',
        export: (row) => row.input_tokens ?? '',
        id: 'input_tokens',
        keys: ['input_tokens'],
        optional: true,
      },
      {
        title: translate('Output tokens'),
        render: ({ row }) =>
          renderFieldOrDash(formatUsageValue(row.output_tokens)),
        orderField: 'output_tokens',
        export: (row) => row.output_tokens ?? '',
        id: 'output_tokens',
        keys: ['output_tokens'],
        optional: true,
      },
      {
        title: translate('Total tokens'),
        render: ({ row }) =>
          renderFieldOrDash(formatUsageValue(row.total_tokens)),
        orderField: 'total_tokens',
        export: (row) => row.total_tokens ?? '',
        id: 'total_tokens',
        keys: ['total_tokens'],
      },
      // ids differ from the anonymous table's on purpose — they key the user's
      // saved column config, so renaming them for symmetry would reset it.
      flaggedColumn<ThreadSession>({ id: 'flagged', filter: 'is_flagged' }),
      feedbackColumn<ThreadSession>({ id: 'feedback', filter: 'has_feedback' }),
      maxSeverityColumn<ThreadSession>({
        id: 'max_severity',
        filter: 'max_severity',
      }),
      {
        title: translate('Archived'),
        render: ({ row }) =>
          row.is_archived ? translate('Yes') : translate('No'),
        export: (row) => (row.is_archived ? translate('Yes') : translate('No')),
        id: 'archived',
        keys: ['is_archived'],
        optional: true,
      },
      {
        title: translate('Model'),
        // Blank means the thread predates model tracking, so a dash is accurate
        // rather than a missing-data placeholder. Two values means an admin
        // switched AI_ASSISTANT_MODEL partway through the thread.
        render: ({ row }) => renderFieldOrDash(row.models_used),
        export: (row) => row.models_used || '',
        id: 'model',
        orderField: 'models_used',
        keys: ['models_used'],
        optional: true,
      },
      timestampColumn<ThreadSession>(translate('Created'), 'created', {
        id: 'created',
      }),
      timestampColumn<ThreadSession>(translate('Modified'), 'modified', {
        id: 'modified',
      }),
    ],
    [],
  );

  return (
    <div className="pt-5">
      {threadStats && <SummaryWidget stats={stats} className="mx-0" />}
      <Table<ThreadSession>
        {...tableProps}
        fetch={handleRefresh}
        columns={columns}
        verboseName={translate('AI assistant logs')}
        filters={<SupportAIAssistantLogsFilter />}
        // Same reason as the anonymous panel: the card header already says it.
        hideTitle
        hasQuery
        hasOptionalColumns
        enableExport
        expandableRow={SupportAIAssistantLogsExpandableRow}
        formId={ChatThreadsFilterFormId}
      />
    </div>
  );
};
