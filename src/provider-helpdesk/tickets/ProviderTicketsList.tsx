import { FC, useMemo } from 'react';
import { ProviderTicket, providerTicketsList } from 'waldur-js-client';

import { formatRelative } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import {
  ProviderTicketsFilter,
  ProviderTicketsFilterFormId,
  selectProviderTicketsFilter,
} from '@/table/generated/ProviderTicketsFilter';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useCustomer } from '@/workspace/hooks';

import { TicketPriorityBadge, TicketStatusBadge } from '../common/badges';
import { SlaIndicator } from '../common/SlaIndicator';
import { useProviderHelpdesk } from '../common/useProviderHelpdesk';

import { AssigneeCell } from './AssigneeCell';
import { ProviderTicketsRowActions } from './ProviderTicketsRowActions';
import { TicketStatsWidgets } from './TicketStatsWidgets';

export const ProviderTicketsList: FC = () => {
  const customer = useCustomer();
  const { helpdesk } = useProviderHelpdesk(customer?.service_provider_uuid);
  const values = useFilterValues('provider-tickets');
  const filter = useMemo(() => selectProviderTicketsFilter(values), [values]);

  const tableProps = useTable({
    table: 'provider-tickets',
    fetchData: createFetcher(providerTicketsList),
    queryField: 'summary',
    filter,
  });

  const columns = useMemo<Array<Column<ProviderTicket>>>(
    () => [
      {
        title: translate('Key'),
        orderField: 'key',
        render: ({ row }) => (
          <Link
            state="provider-helpdesk-ticket-detail"
            params={{ issue_uuid: row.uuid }}
            label={renderFieldOrDash(row.key)}
          />
        ),
      },
      {
        title: translate('Status'),
        orderField: 'status',
        render: ({ row }) => <TicketStatusBadge status={row.status} />,
      },
      {
        title: translate('Priority'),
        orderField: 'priority',
        render: ({ row }) => <TicketPriorityBadge priority={row.priority} />,
      },
      {
        title: translate('Subject'),
        orderField: 'summary',
        render: ({ row }) => renderFieldOrDash(row.summary),
      },
      {
        title: translate('Organization'),
        render: ({ row }) => renderFieldOrDash(row.customer_name),
      },
      {
        title: translate('SLA'),
        render: ({ row }) => (
          <SlaIndicator
            slaBreached={row.sla_breached}
            resolutionDeadline={row.resolution_deadline}
            created={row.created}
          />
        ),
      },
      {
        title: translate('Assignee'),
        render: ({ row }) => (
          <AssigneeCell
            row={row}
            refetch={tableProps.fetch}
            helpdeskUuid={helpdesk?.uuid}
          />
        ),
      },
      {
        title: translate('Created'),
        render: ({ row }) => <>{formatRelative(row.created)}</>,
      },
    ],
    [helpdesk?.uuid, tableProps.fetch],
  );

  return (
    <>
      <TicketStatsWidgets />
      <Table
        {...tableProps}
        columns={columns}
        verboseName={translate('Tickets')}
        formId={ProviderTicketsFilterFormId}
        filters={<ProviderTicketsFilter />}
        hasQuery={true}
        showPageSizeSelector={true}
        rowActions={ProviderTicketsRowActions}
      />
    </>
  );
};
