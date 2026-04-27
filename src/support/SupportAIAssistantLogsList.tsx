import { ShieldWarningIcon } from '@phosphor-icons/react';
import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  chatThreadsList,
  InjectionSeverityEnum,
  ThreadSession,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { formatDateTime } from '@/core/dateUtils';
import { formatUsageValue } from '@/core/formatNumber';
import { translate } from '@/i18n';
import { SupportAIAssistantLogsExpandableRow } from '@/support/SupportAIAssistantLogsExpandableRow';
import { createFetcher } from '@/table/api';
import { BooleanField } from '@/table/BooleanField';
import {
  ChatThreadsFilter as SupportAIAssistantLogsFilter,
  selectChatThreadsFilter as selectSupportAIAssistantLogsFilter,
} from '@/table/generated/ChatThreadsFilter';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

export const severityLabels: Record<InjectionSeverityEnum, string> = {
  critical: translate('Critical'),
  high: translate('High'),
  medium: translate('Medium'),
  low: translate('Low'),
  none: translate('None'),
};

export const getSeverityBadgeVariant = (
  severity: InjectionSeverityEnum,
): 'danger' | 'orange' | 'warning' | 'secondary' | 'success' => {
  switch (severity) {
    case 'critical':
      return 'danger';
    case 'high':
      return 'orange';
    case 'medium':
      return 'warning';
    case 'low':
      return 'secondary';
    case 'none':
      return 'success';
  }
};

export const SupportAIAssistantLogsList: FunctionComponent = () => {
  const filter = useSelector(selectSupportAIAssistantLogsFilter);

  const fetcher = useMemo(() => createFetcher(chatThreadsList), []);

  const tableProps = useTable({
    table: 'SupportAIAssistantLogsList',
    fetchData: fetcher,
    filter,
    queryField: 'query',
    mandatoryFields: ['title_gen_input_tokens', 'title_gen_output_tokens'],
  });

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
      {
        title: translate('Flagged'),
        render: ({ row }) =>
          row.is_flagged ? (
            <Badge
              variant="danger"
              size="sm"
              leftIcon={<ShieldWarningIcon weight="bold" />}
              outline
            >
              {translate('Yes')}
            </Badge>
          ) : (
            <Badge variant="success" size="sm" outline>
              {translate('Clean')}
            </Badge>
          ),
        export: (row) => (row.is_flagged ? translate('Yes') : translate('No')),
        filter: 'is_flagged',
        id: 'flagged',
        keys: ['is_flagged'],
      },
      {
        title: translate('Feedback'),
        render: ({ row }) => <BooleanField value={row.has_feedback} />,
        export: (row) =>
          row.has_feedback ? translate('Yes') : translate('No'),
        filter: 'has_feedback',
        id: 'feedback',
        keys: ['has_feedback'],
      },
      {
        title: translate('Max severity'),
        render: ({ row }) => {
          if (!row.is_flagged) return renderFieldOrDash(undefined);
          const severity = row.max_severity;
          return (
            <Badge
              variant={getSeverityBadgeVariant(severity)}
              size="sm"
              outline
            >
              {severityLabels[severity]}
            </Badge>
          );
        },
        export: (row) => (row.is_flagged ? row.max_severity : ''),
        filter: 'max_severity',
        id: 'max_severity',
        keys: ['max_severity'],
        optional: true,
      },
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
        title: translate('Created'),
        render: ({ row }) => formatDateTime(row.created),
        orderField: 'created',
        export: (row) => formatDateTime(row.created),
        id: 'created',
        keys: ['created'],
      },
      {
        title: translate('Modified'),
        render: ({ row }) => formatDateTime(row.modified),
        orderField: 'modified',
        export: (row) => formatDateTime(row.modified),
        id: 'modified',
        keys: ['modified'],
      },
    ],
    [],
  );

  return (
    <Table<ThreadSession>
      {...tableProps}
      columns={columns}
      verboseName={translate('AI assistant logs')}
      filters={<SupportAIAssistantLogsFilter />}
      hasQuery
      hasOptionalColumns
      enableExport
      expandableRow={SupportAIAssistantLogsExpandableRow}
    />
  );
};
