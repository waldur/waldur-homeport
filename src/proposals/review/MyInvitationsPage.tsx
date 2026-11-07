import { FC, useMemo } from 'react';
import { CallReviewerPool, callReviewerPoolsList } from 'waldur-js-client';

import { formatDate, formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { InvitationStatusBadge } from '@/proposals/update/reviewer-pool/InvitationStatusBadge';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';

import { AcceptInvitationAction } from './AcceptInvitationAction';
import { DeclineInvitationAction } from './DeclineInvitationAction';
import {
  MyInvitationsFilter,
  MY_INVITATIONS_FILTER_FORM_ID,
} from './MyInvitationsFilter';
import { useMyWorkTitle } from './myWorkTitle';
import { ExpiredResponseNotice, ResponseTimeLeft } from './ResponseDeadline';
import { ReviewerProfileSummaryCard } from './ReviewerProfileSummaryCard';
import { ReviewStatsWidgets } from './ReviewStatsWidgets';
import { useMyReviewsTabs } from './tabs';

// The API reports an invitation past its deadline as expired even before the
// periodic expiry task has stored that. Accept and Decline are offered only
// while the invitation can still be answered: an expired one gets a note in
// their place, and a settled one has nothing to act on.
export const InvitationActions: FC<{ row: CallReviewerPool }> = ({ row }) => {
  if (row.is_expired || row.invitation_status === 'expired') {
    return <ExpiredResponseNotice expiresAt={row.invitation_expires_at} />;
  }
  if (row.invitation_status !== 'pending') {
    return null;
  }

  return (
    <ActionsDropdown row={row}>
      <AcceptInvitationAction row={row} />
      <DeclineInvitationAction row={row} />
    </ActionsDropdown>
  );
};

// The row actions read invitation_status even when the Status column is
// hidden, so the sparse-field request always asks for it.
const mandatoryFields = [
  'uuid',
  'invitation_expires_at',
  'invitation_status',
  'is_expired',
];

export const MyInvitationsPage: FC = () => {
  const myWorkTitle = useMyWorkTitle();
  const tabs = useMyReviewsTabs();
  const values = useFilterValues('MyInvitationsTable');

  const formFilters = useMemo(() => {
    const filters = values;
    const result: Record<string, any> = {};
    if (filters?.invitation_status) {
      result.invitation_status = [filters.invitation_status.value];
    }
    return result;
  }, [values]);

  const filter = useMemo(
    () => ({
      my_invitations: true,
      ...formFilters,
    }),
    [formFilters],
  );

  const tableProps = useTable({
    table: 'MyInvitationsTable',
    syncFiltersToURL: true,
    fetchData: createFetcher(callReviewerPoolsList),
    filter,
    initialFilters: {
      invitation_status: { value: 'pending', label: translate('Pending') },
    },
    queryField: 'call_name',
    mandatoryFields,
  });

  return (
    <div className="flex flex-col" style={{ gap: 16 }}>
      {/* Reviewer profile summary */}
      <ReviewerProfileSummaryCard />
      {/* Stats widgets */}
      <ReviewStatsWidgets />
      {/* Invitations table */}
      <Table<CallReviewerPool>
        {...tableProps}
        title={myWorkTitle}
        tabs={tabs}
        columns={[
          {
            title: translate('Call'),
            render: ({ row }) => (
              <span className="font-medium text-primary">{row.call_name}</span>
            ),
            keys: ['call_name'],
            id: 'call',
          },
          {
            title: translate('Invited'),
            render: ({ row }) => <>{formatDate(row.invited_at)}</>,
            keys: ['invited_at'],
            id: 'invited_at',
          },
          {
            title: translate('Expires'),
            render: ({ row }) =>
              row.invitation_expires_at ? (
                <div className="flex flex-col gap-1 items-start">
                  <span>{formatDateTime(row.invitation_expires_at)}</span>
                  {row.invitation_status === 'pending' && !row.is_expired && (
                    <ResponseTimeLeft expiresAt={row.invitation_expires_at} />
                  )}
                </div>
              ) : (
                <span className="text-quaternary">-</span>
              ),
            keys: ['invitation_expires_at', 'invitation_status', 'is_expired'],
            id: 'expires',
            optional: true,
          },
          {
            title: translate('Status'),
            render: ({ row }) => (
              <InvitationStatusBadge
                status={row.invitation_status}
                statusDisplay={row.invitation_status_display}
              />
            ),
            keys: ['invitation_status', 'invitation_status_display'],
            id: 'status',
          },
        ]}
        verboseName={translate('invitations')}
        rowActions={InvitationActions}
        filters={<MyInvitationsFilter />}
        hasOptionalColumns
        hasQuery
        formId={MY_INVITATIONS_FILTER_FORM_ID}
      />
    </div>
  );
};
