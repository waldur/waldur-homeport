import { ShieldWarningIcon } from '@phosphor-icons/react';
import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import {
  chatThreadsList,
  ChatThreadsListData,
  InjectionSeverityEnum,
  ThreadSession,
} from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { SupportAIAssistantLogsExpandableRow } from '@waldur/support/SupportAIAssistantLogsExpandableRow';
import { SupportAIAssistantLogsFilter } from '@waldur/support/SupportAIAssistantLogsFilter';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

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

const mapStateToFilter = createSelector(
  getFormValues('SupportAIAssistantLogsFilter'),
  (filterValues: any) => {
    const result: ChatThreadsListData['query'] = {};
    if (filterValues?.user) {
      result.user = filterValues.user.uuid;
    }
    if (filterValues?.is_archived) {
      result.is_archived = filterValues.is_archived.value;
    }
    if (filterValues?.is_flagged) {
      result.is_flagged = filterValues.is_flagged.value;
    }
    if (filterValues?.max_severity) {
      result.max_severity = filterValues.max_severity.value;
    }
    if (filterValues?.created) {
      result.created = filterValues.created;
    }
    if (filterValues?.modified) {
      result.modified = filterValues.modified;
    }
    return result;
  },
);

export const SupportAIAssistantLogsList: FunctionComponent = () => {
  const filter = useSelector(mapStateToFilter);

  const fetcher = useMemo(() => createFetcher(chatThreadsList), []);

  const tableProps = useTable({
    table: 'SupportAIAssistantLogsList',
    fetchData: fetcher,
    filter,
    queryField: 'query',
  });

  const columns = useMemo(
    () => [
      {
        title: translate('User'),
        render: ({ row }) =>
          renderFieldOrDash(row.user_full_name || row.user_username),
        export: (row) => row.user_full_name || row.user_username,
        filter: 'user',
      },
      {
        title: translate('Thread name'),
        render: ({ row }) => renderFieldOrDash(row.name),
        export: (row) => row.name || '',
      },
      {
        title: translate('Messages'),
        render: ({ row }) => row.message_count || 0,
        export: (row) => row.message_count || 0,
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
              {severity.charAt(0).toUpperCase() + severity.slice(1)}
            </Badge>
          );
        },
        export: (row) => (row.is_flagged ? row.max_severity : ''),
        filter: 'max_severity',
      },
      {
        title: translate('Archived'),
        render: ({ row }) =>
          row.is_archived ? translate('Yes') : translate('No'),
        export: (row) => (row.is_archived ? translate('Yes') : translate('No')),
      },
      {
        title: translate('Created'),
        render: ({ row }) => formatDateTime(row.created),
        orderField: 'created',
        export: (row) => formatDateTime(row.created),
      },
      {
        title: translate('Modified'),
        render: ({ row }) => formatDateTime(row.modified),
        orderField: 'modified',
        export: (row) => formatDateTime(row.modified),
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
      enableExport
      expandableRow={SupportAIAssistantLogsExpandableRow}
    />
  );
};
