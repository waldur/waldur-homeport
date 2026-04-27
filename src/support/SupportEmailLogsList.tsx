import { useSelector } from 'react-redux';
import { emailLogsList } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { FormattedHtml } from '@/core/FormattedHtml';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import {
  selectEmailLogsFilter as selectSupportEmailLogsFilter,
  EmailLogsFilter as SupportEmailLogsFilter,
} from '@/table/generated/EmailLogsFilter';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

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
          export: (row) => renderFieldOrDash(row.subject),
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
