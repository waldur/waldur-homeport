import {
  ClockIcon,
  CopyIcon,
  EnvelopeSimpleIcon,
  QuestionIcon,
  ShieldWarningIcon,
  UserCheckIcon,
  WarningIcon,
} from '@phosphor-icons/react';
import { FC, useCallback, useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';
import {
  callReviewerPoolsList,
  callReviewerPoolsForceAccept,
  CallReviewerPool,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { formatDate, formatRelative } from '@/core/dateUtils';
import { lazyComponent } from '@/core/lazyComponent';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { Call } from '@/proposals/types';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useNotify } from '@/store/notify';
import { ActionButton } from '@/table/ActionButton';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import {
  CallReviewerPoolsFilter,
  selectCallReviewerPoolsFilter,
  InvitationStatusOptions,
  CallReviewerPoolsFilterFormId,
} from '@/table/generated/CallReviewerPoolsFilter';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { PoolSummaryButton } from './PoolSummaryButton';
import { ReviewerPoolExpandableRow } from './ReviewerPoolExpandableRow';
import { useReviewerPoolTabs } from './tabs';

const DirectEmailInviteDialog = lazyComponent(() =>
  import('@/proposals/manage/reviewer-discovery/DirectEmailInviteDialog').then(
    (m) => ({
      default: m.DirectEmailInviteDialog,
    }),
  ),
);

const StaffOverrideDialog = lazyComponent(() =>
  import('@/proposals/StaffOverrideDialog').then((m) => ({
    default: m.StaffOverrideDialog,
  })),
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
  override_reason?: string;
  overridden_by_name?: string;
  invitation_link?: string | null;
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
    <Badge
      variant={variant}
      rightIcon={
        status === 'pending' ? (
          <Tip
            id={`pending-info-${statusDisplay}`}
            label={translate(
              'This reviewer has not yet accepted the invitation or created a profile.',
            )}
          >
            <QuestionIcon size={14} weight="bold" />
          </Tip>
        ) : undefined
      }
      pill
      outline
    >
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

const FORCE_ACCEPT_STATUSES = ['pending', 'declined', 'expired'];

const ReviewerPoolSectionTable: FC<ReviewerPoolSectionProps> = ({ call }) => {
  const { showSuccess } = useNotify();

  const { openDialog } = useModal();

  const { values } = useFormState();

  const formFilters = useMemo(
    () => selectCallReviewerPoolsFilter(values),
    [values],
  );

  const tabs = useReviewerPoolTabs();

  const filter = useMemo(
    () => ({
      call_uuid: call.uuid,
      ...formFilters,
    }),
    [formFilters],
  );

  const tableProps = useTable({
    table: 'CallReviewerPoolTable',
    fetchData: createFetcher(callReviewerPoolsList),
    filter,
  });

  const handleInviteByEmail = useCallback(() => {
    openDialog(DirectEmailInviteDialog, {
      resolve: { call, refetch: tableProps.fetch },
      size: 'lg',
    });
  }, [call, tableProps.fetch]);

  const handleForceAccept = useCallback(
    (row: CallReviewerPoolExtended) => {
      openDialog(StaffOverrideDialog, {
        resolve: {
          onSubmit: (reason: string) =>
            callReviewerPoolsForceAccept({
              path: { uuid: row.uuid },
              body: { override_reason: reason },
            }),
          title: translate('Force accept invitation'),
          description: translate(
            'This will force-accept the invitation for reviewer "{reviewer}", bypassing the normal invitation flow. A reason is required for audit purposes.',
            {
              reviewer:
                row.reviewer_name || row.invited_email || row.reviewer_email,
            },
          ),
          successMessage: translate('Invitation force-accepted.'),
          errorMessage: translate('Failed to force-accept invitation.'),
          submitLabel: translate('Force accept'),
          fetch: tableProps.fetch,
        },
        size: 'lg',
      });
    },
    [call, tableProps.fetch],
  );

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
        render: ({ row }: { row: CallReviewerPoolExtended }) => (
          <div
            className="d-flex align-items-center gap-2"
            style={{ minWidth: 220 }}
          >
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
            {row.override_reason && (
              <Tip
                id={`override-${row.uuid}`}
                label={
                  row.overridden_by_name
                    ? translate('Overridden by {user}: {reason}', {
                        user: row.overridden_by_name,
                        reason: row.override_reason,
                      })
                    : translate('Override reason: {reason}', {
                        reason: row.override_reason,
                      })
                }
              >
                <Badge
                  variant="warning"
                  leftIcon={<ShieldWarningIcon size={14} weight="bold" />}
                  outline
                >
                  {translate('Overridden')}
                </Badge>
              </Tip>
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
      rowActions={({ row }: { row: CallReviewerPoolExtended }) => {
        const showCopyLink = !!row.invitation_link;
        const showForceAccept =
          FORCE_ACCEPT_STATUSES.includes(row.invitation_status) &&
          row.reviewer_uuid;

        if (!showCopyLink && !showForceAccept) {
          return (
            <ActionsDropdownComponent size="sm" disabled tooltip>
              {null}
            </ActionsDropdownComponent>
          );
        }

        return (
          <ActionsDropdownComponent size="sm">
            {showCopyLink && (
              <ActionItem
                title={translate('Copy invitation link')}
                action={() => {
                  const link = `${location.origin}${row.invitation_link}`;
                  navigator.clipboard.writeText(link).then(() => {
                    showSuccess(translate('Invitation link has been copied'));
                  });
                }}
                iconNode={<CopyIcon weight="bold" />}
              />
            )}
            {showForceAccept && (
              <ActionItem
                title={translate('Force accept')}
                action={() => handleForceAccept(row)}
                iconNode={<UserCheckIcon weight="bold" />}
                iconColor="warning"
                className="text-warning"
              />
            )}
          </ActionsDropdownComponent>
        );
      }}
      tableActions={
        <>
          <PoolSummaryButton />
          <ActionButton
            action={handleInviteByEmail}
            title={translate('Invite by email')}
            iconNode={<EnvelopeSimpleIcon weight="bold" />}
            variant="primary"
          />
        </>
      }
      formId={CallReviewerPoolsFilterFormId}
    />
  );
};

export const ReviewerPoolSection: FC<any> = (props) => (
  <Form
    id={CallReviewerPoolsFilterFormId}
    onSubmit={() => {}}
    subscription={{
      values: true,
    }}
  >
    {() => <ReviewerPoolSectionTable {...props} />}
  </Form>
);
