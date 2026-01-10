import { CheckIcon, XIcon } from '@phosphor-icons/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import {
  CallReviewerPool,
  callReviewerPoolsAccept,
  callReviewerPoolsDecline,
  callReviewerPoolsList,
} from 'waldur-js-client';

import { formatDate, formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { createFetcher } from '@waldur/table/api';
import { CompactActionButton } from '@waldur/table/CompactActionButton';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

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
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const acceptMutation = useMutation({
    mutationFn: async () => {
      await callReviewerPoolsAccept({
        path: { uuid: row.uuid },
        body: [], // Empty array for no COI declarations
      });
    },
    onSuccess: () => {
      dispatch(showSuccess(translate('Invitation accepted.')));
      queryClient.invalidateQueries({
        queryKey: ['table', 'MyInvitationsTable'],
      });
      queryClient.invalidateQueries({
        queryKey: ['invitations-pending-count-tabs'],
      });
    },
    onError: (error: any) => {
      dispatch(
        showErrorResponse(error, translate('Unable to accept invitation.')),
      );
    },
  });

  const declineMutation = useMutation({
    mutationFn: async () => {
      await callReviewerPoolsDecline({
        path: { uuid: row.uuid },
        body: { reason: translate('User declined') },
      });
    },
    onSuccess: () => {
      dispatch(showSuccess(translate('Invitation declined.')));
      queryClient.invalidateQueries({
        queryKey: ['table', 'MyInvitationsTable'],
      });
      queryClient.invalidateQueries({
        queryKey: ['invitations-pending-count-tabs'],
      });
    },
    onError: (error: any) => {
      dispatch(
        showErrorResponse(error, translate('Unable to decline invitation.')),
      );
    },
  });

  const handleAccept = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Accept invitation'),
        translate(
          'By accepting this invitation to review proposals for "{call}", you agree to:\n\n• Review assigned proposals within the specified deadlines\n• Maintain confidentiality of proposal contents\n• Declare any conflicts of interest',
          { call: row.call_name },
        ),
        {
          positiveButton: translate('Accept'),
          positiveButtonVariant: 'primary',
        },
      );
    } catch {
      return;
    }
    acceptMutation.mutate();
  };

  const handleDecline = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Decline invitation'),
        translate(
          'Are you sure you want to decline this invitation to review proposals for "{call}"?\n\nBy declining, you will not receive proposal assignments for this call. You can be re-invited later if needed.',
          { call: row.call_name },
        ),
        {
          positiveButton: translate('Decline'),
          positiveButtonVariant: 'danger',
        },
      );
    } catch {
      return;
    }
    declineMutation.mutate();
  };

  const isPending = row.invitation_status === 'pending';

  // Only show actions for pending invitations
  if (!isPending) {
    return null;
  }

  return (
    <div className="d-flex gap-2">
      <CompactActionButton
        action={handleAccept}
        title={translate('Accept')}
        iconNode={<CheckIcon weight="bold" />}
        variant="success"
        pending={acceptMutation.isPending}
      />
      <CompactActionButton
        action={handleDecline}
        title={translate('Decline')}
        iconNode={<XIcon weight="bold" />}
        variant="outline-danger"
        pending={declineMutation.isPending}
      />
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
