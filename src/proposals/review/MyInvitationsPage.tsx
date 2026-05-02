import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import { CallReviewerPool, callReviewerPoolsList } from 'waldur-js-client';

import { formatDate, formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { AcceptInvitationAction } from './AcceptInvitationAction';
import { DeclineInvitationAction } from './DeclineInvitationAction';
import {
  MyInvitationsFilter,
  MY_INVITATIONS_FILTER_FORM_ID,
} from './MyInvitationsFilter';
import { ReviewerProfileSummaryCard } from './ReviewerProfileSummaryCard';
import { ReviewStatsWidgets } from './ReviewStatsWidgets';
import { useMyReviewsTabs } from './tabs';

// Extended type to include invitation_expires_at which may be returned by backend
type CallReviewerPoolExtended = CallReviewerPool & {
  invitation_expires_at?: string;
};

const InvitationActions: FC<{ row: CallReviewerPoolExtended }> = ({ row }) => {
  const isPending = row.invitation_status === 'pending';

  // Only show actions for pending invitations
  if (!isPending) {
    return null;
  }

  return (
    <div className="d-flex gap-2">
      <AcceptInvitationAction row={row} />
      <DeclineInvitationAction row={row} />
    </div>
  );
};

const mandatoryFields = ['uuid', 'invitation_expires_at'];

// Filter selector to get form values
const filtersSelector = createSelector(
  getFormValues(MY_INVITATIONS_FILTER_FORM_ID),
  (filters: any) => {
    const result: Record<string, any> = {};
    if (filters?.invitation_status) {
      result.invitation_status = [filters.invitation_status.value];
    }
    return result;
  },
);

export const MyInvitationsPage: FC = () => {
  const tabs = useMyReviewsTabs();
  const formFilters = useSelector(filtersSelector);

  const filter = useMemo(
    () => ({
      my_invitations: true,
      ...formFilters,
    }),
    [formFilters],
  );

  const tableProps = useTable({
    table: 'MyInvitationsTable',
    fetchData: createFetcher(callReviewerPoolsList),
    filter,
    queryField: 'call_name',
    mandatoryFields,
  });

  return (
    <div className="d-flex flex-column gap-6">
      {/* Reviewer profile summary */}
      <ReviewerProfileSummaryCard />

      {/* Stats widgets */}
      <ReviewStatsWidgets />

      {/* Invitations table */}
      <Table<CallReviewerPoolExtended>
        {...tableProps}
        title={translate('My reviews')}
        tabs={tabs}
        columns={[
          {
            title: translate('Call'),
            render: ({ row }) => (
              <span className="fw-bold">{row.call_name}</span>
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
                <>{formatDateTime(row.invitation_expires_at)}</>
              ) : (
                <span className="text-muted">-</span>
              ),
            keys: ['invitation_expires_at'] as any,
            id: 'expires',
            optional: true,
          },
          {
            title: translate('Status'),
            render: ({ row }) => <>{row.invitation_status_display}</>,
            keys: ['invitation_status_display'],
            id: 'status',
          },
        ]}
        verboseName={translate('invitations')}
        rowActions={InvitationActions}
        filters={<MyInvitationsFilter />}
        hasOptionalColumns
        hasQuery
      />
    </div>
  );
};
