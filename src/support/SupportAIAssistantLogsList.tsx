import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import {
  chatThreadsList,
  ChatThreadsListData,
  ThreadSession,
} from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { SupportAIAssistantLogsExpandableRow } from '@waldur/support/SupportAIAssistantLogsExpandableRow';
import { SupportAIAssistantLogsFilter } from '@waldur/support/SupportAIAssistantLogsFilter';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

export const SupportAIAssistantLogsList: FunctionComponent = () => {
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
      if (filterValues?.created) {
        result.created = filterValues.created;
      }
      if (filterValues?.modified) {
        result.modified = filterValues.modified;
      }
      return result;
    },
  );

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
