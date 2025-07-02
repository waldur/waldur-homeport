import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import { EmailLogsListData } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { SupportEmailLogsFilter } from './SupportEmailLogsFilter';

const mapStateToFilter = createSelector(
  getFormValues('SupportEmailLogsFilter'),
  (filterValues: any) => {
    const result: EmailLogsListData['query'] = {};
    if (filterValues?.subject) {
      result.subject = filterValues.subject;
    }
    if (filterValues?.emails) {
      result.emails = filterValues.emails;
    }
    if (filterValues?.sent_at) {
      result.sent_at = filterValues.sent_at;
    }
    return result;
  },
);

export const SupportEmailLogsList = () => {
  const filter = useSelector(mapStateToFilter);

  const tableProps = useTable({
    table: `supportEmailLogs`,
    fetchData: createFetcher('email-logs'),
    queryField: 'body',
    filter,
  });

  return (
    <Table
      {...tableProps}
      filters={<SupportEmailLogsFilter />}
      columns={[
        {
          title: translate('Subject'),
          orderField: 'subject',
          render: ({ row }) => <>{row.subject}</>,
          export: (row) => row.subject || 'N/A',
        },
        {
          title: translate('Sent at'),
          orderField: 'sent_at',
          render: ({ row }) => formatDateTime(row.sent_at),
          export: (row) => formatDateTime(row.sent_at),
        },
        {
          title: translate('Emails'),
          render: ({ row }) => <>{row.emails.join(', ')}</>,
          export: (row) => row.emails.join(', '),
        },
      ]}
      verboseName={translate('Outgoing emails')}
      hasQuery
      enableExport
      expandableRow={({ row }) => (
        <ExpandableContainer>
          <FormattedHtml html={row.body} />
        </ExpandableContainer>
      )}
    />
  );
};
