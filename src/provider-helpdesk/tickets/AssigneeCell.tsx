import { FC } from 'react';
import { ProviderTicket } from 'waldur-js-client';

import { AssigneeSelect } from './AssigneeSelect';

interface AssigneeCellProps {
  row: ProviderTicket;
  refetch: () => void;
  helpdeskUuid?: string;
}

/** Tickets-table cell wrapper around the shared assignee picker. */
export const AssigneeCell: FC<AssigneeCellProps> = ({
  row,
  refetch,
  helpdeskUuid,
}) => (
  <AssigneeSelect
    ticketUuid={row.uuid}
    status={row.status}
    assignee={row.provider_assignee}
    assigneeName={row.provider_assignee_name}
    helpdeskUuid={helpdeskUuid}
    refetch={refetch}
  />
);
