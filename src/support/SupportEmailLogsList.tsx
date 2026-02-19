import { useSelector } from 'react-redux';
import { emailLogsList } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import {
  selectSupportEmailLogsFilter,
  SupportEmailLogsFilter,
} from '@waldur/table/generated/EmailLogsFilter';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

export const SupportEmailLogsList = () => {
  const filter = useSelector(selectSupportEmailLogsFilter);

  const tableProps = useTable({
    table: `supportEmailLogs`,
    fetchData: createFetcher(emailLogsList),
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
