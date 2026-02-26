import { ClockIcon, EnvelopeSimple, WarningIcon } from '@phosphor-icons/react';
import { FC, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { callReviewerPoolsList, CallReviewerPool } from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { formatDate, formatRelative } from '@waldur/core/dateUtils';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { Call } from '@waldur/proposals/types';
import { createFetcher } from '@waldur/table/api';
import {
  CallReviewerPoolsFilter,
  selectCallReviewerPoolsFilter,
  InvitationStatusOptions,
} from '@waldur/table/generated/CallReviewerPoolsFilter';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { PoolSummaryButton } from './PoolSummaryButton';
import { ReviewerPoolExpandableRow } from './ReviewerPoolExpandableRow';
import { useReviewerPoolTabs } from './tabs';

const DirectEmailInviteDialog = lazyComponent(() =>
  import('@waldur/proposals/manage/reviewer-discovery/DirectEmailInviteDialog').then(
    (m) => ({
      default: m.DirectEmailInviteDialog,
    }),
  ),
);

interface ReviewerPoolSectionProps {
  call: Call;
  refetch: () => void;
}

// Extended type to include COI and review stats from backend
type CallReviewerPoolExtended = CallReviewerPool & {
  coi_count?: number;
  coi_by_severity?: Record<string, number>;
  reviews_in_progress?: number;
  reviews_completed?: number;
};

const InvitationStatusBadge: FC<{ status: string; statusDisplay: string }> = ({
  status,
  statusDisplay,
}) => {
  const variant = useMemo(() => {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'pending':
        return 'warning';
      case 'declined':
        return 'danger';
      case 'expired':
        return 'secondary';
      default:
        return 'primary';
    }
  }, [status]);

  return (
    <Badge variant={variant} pill outline>
      {statusDisplay}
    </Badge>
  );
};

// Check if invitation is about to expire (within 7 days)
const isExpiringS = (expiresAt: string | null): boolean => {
  if (!expiresAt) return false;
  const expiryDate = new Date(expiresAt);
  const now = new Date();
  const daysUntilExpiry =
    (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
};

const isExpired = (expiresAt: string | null): boolean => {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
};

export const ReviewerPoolSection: FC<ReviewerPoolSectionProps> = ({ call }) => {
  const dispatch = useDispatch();
  const formFilters = useSelector(selectCallReviewerPoolsFilter);
  const tabs = useReviewerPoolTabs();

  const filter = useMemo(
    () => ({
      call_uuid: call.uuid,
      ...formFilters,
    }),
    [call.uuid, formFilters],
  );

  const tableProps = useTable({
    table: 'CallReviewerPoolTable',
    fetchData: createFetcher(callReviewerPoolsList),
    filter,
  });

  const handleInviteByEmail = useCallback(() => {
    dispatch(
      openModalDialog(DirectEmailInviteDialog, {
        resolve: { call, refetch: tableProps.fetch },
        size: 'lg',
      }),
    );
  }, [call, tableProps.fetch, dispatch]);

  const columns = useMemo(
    () => [
      {
        id: 'reviewer',
        title: translate('Reviewer'),
        render: ({ row }: { row: CallReviewerPool }) => {
          // Handle nullable reviewer (email invitations before profile is created)
          const hasProfile = row.has_profile !== false && row.reviewer_uuid;

          if (hasProfile) {
            return (
              <div>
                <div className="fw-bold">{row.reviewer_name}</div>
                <small className="text-muted">{row.reviewer_email}</small>
              </div>
            );
          }

          // Email invitation without profile
          return (
            <div>
              <div className="fw-bold">
                {row.invited_email || row.reviewer_email}
              </div>
              <Badge variant="warning" outline className="mt-1">
                {translate('Awaiting profile')}
              </Badge>
              {row.invited_user_name && (
                <div className="text-muted small mt-1">
                  {translate('Matched user: {name}', {
                    name: row.invited_user_name,
                  })}
                </div>
              )}
            </div>
          );
        },
        keys: [
          'reviewer_name',
          'reviewer_email',
          'invited_email',
          'invited_user_name',
        ],
      },
      {
        id: 'status',
        title: translate('Status'),
        render: ({ row }: { row: CallReviewerPool }) => (
          <div className="d-flex align-items-center gap-2">
            <InvitationStatusBadge
              status={row.invitation_status}
              statusDisplay={row.invitation_status_display}
            />
            {row.invitation_status === 'pending' &&
              isExpiringS(row.invitation_expires_at) && (
                <Tip
                  id={`expiring-${row.uuid}`}
                  label={translate('Expires {date}', {
                    date: formatRelative(row.invitation_expires_at),
                  })}
                >
                  <WarningIcon
                    size={16}
                    className="text-warning"
                    weight="bold"
                  />
                </Tip>
              )}
            {isExpired(row.invitation_expires_at) &&
              row.invitation_status === 'pending' && (
                <Badge variant="danger" outline>
                  {translate('Expired')}
                </Badge>
              )}
          </div>
        ),
        filter: 'invitation_status',
        inlineFilter: (row) =>
          InvitationStatusOptions.filter(
            (op) => op.value === row.invitation_status,
          ),
        keys: [
          'invitation_status',
          'invitation_status_display',
          'invitation_expires_at',
        ],
      },
      {
        id: 'reviews',
        title: translate('Reviews'),
        render: ({ row }: { row: CallReviewerPoolExtended }) => {
          const inProgress = row.reviews_in_progress || 0;
          const completed = row.reviews_completed || 0;
          const total = inProgress + completed;
          if (total === 0) {
            return <span className="text-muted">-</span>;
          }
          return (
            <div className="d-flex gap-1">
              {inProgress > 0 && (
                <Tip
                  id={`in-progress-${row.uuid}`}
                  label={translate('In progress')}
                >
                  <Badge variant="warning" pill outline>
                    {inProgress}
                  </Badge>
                </Tip>
              )}
              {completed > 0 && (
                <Tip
                  id={`completed-${row.uuid}`}
                  label={translate('Completed')}
                >
                  <Badge variant="success" pill outline>
                    {completed}
                  </Badge>
                </Tip>
              )}
            </div>
          );
        },
        keys: ['reviews_in_progress', 'reviews_completed'],
      },
      {
        id: 'coi',
        title: translate('COI'),
        render: ({ row }: { row: CallReviewerPoolExtended }) => {
          const coiCount = row.coi_count || 0;
          if (coiCount === 0) {
            return <span className="text-muted">-</span>;
          }
          const bySeverity = row.coi_by_severity || {};
          return (
            <div className="d-flex gap-1">
              {bySeverity.real > 0 && (
                <Badge variant="danger" pill outline>
                  {bySeverity.real}
                </Badge>
              )}
              {bySeverity.apparent > 0 && (
                <Badge variant="warning" pill outline>
                  {bySeverity.apparent}
                </Badge>
              )}
              {bySeverity.potential > 0 && (
                <Badge variant="info" pill outline>
                  {bySeverity.potential}
                </Badge>
              )}
            </div>
          );
        },
        keys: ['coi_count', 'coi_by_severity'],
        optional: true,
      },
      {
        id: 'invited',
        title: translate('Invited'),
        render: ({ row }: { row: CallReviewerPool }) => (
          <div>
            <div>{row.invited_at ? formatDate(row.invited_at) : '-'}</div>
            {row.invitation_expires_at &&
              row.invitation_status === 'pending' && (
                <small className="text-muted">
                  <ClockIcon size={12} className="me-1" weight="bold" />
                  {translate('Expires')}:{' '}
                  {formatDate(row.invitation_expires_at)}
                </small>
              )}
          </div>
        ),
        keys: ['invited_at', 'invitation_expires_at'],
      },
      {
        id: 'assignments',
        title: translate('Assignments'),
        render: ({ row }: { row: CallReviewerPool }) => (
          <span>
            {row.current_assignments}
            {row.max_assignments ? ` / ${row.max_assignments}` : ''}
          </span>
        ),
        keys: ['current_assignments', 'max_assignments'],
      },
      {
        id: 'expertise',
        title: translate('Expertise match'),
        render: ({ row }: { row: CallReviewerPool }) => (
          <span>
            {row.expertise_match_score !== null &&
            row.expertise_match_score !== undefined
              ? `${Math.round(row.expertise_match_score * 100)}%`
              : '-'}
          </span>
        ),
        keys: ['expertise_match_score'],
        optional: true,
      },
    ],
    [],
  );

  return (
    <Table
      {...tableProps}
      columns={columns}
      title={translate('Reviewer pool')}
      tabs={tabs}
      verboseName={translate('reviewer pool members')}
      showPageSizeSelector
      hasQuery
      filters={<CallReviewerPoolsFilter />}
      hasOptionalColumns
      expandableRow={ReviewerPoolExpandableRow}
      tableActions={
        <>
          <PoolSummaryButton />
          <button
            className="btn btn-primary btn-sm"
            onClick={handleInviteByEmail}
          >
            <EnvelopeSimple size={16} weight="bold" className="me-1" />
            {translate('Invite by email')}
          </button>
        </>
      }
    />
  );
};
