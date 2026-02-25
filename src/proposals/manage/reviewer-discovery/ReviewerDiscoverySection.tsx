import { InfoIcon, UserIcon } from '@phosphor-icons/react';
import { FC, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  reviewerSuggestionsList,
  ReviewerSuggestion,
  reviewerSuggestionsConfirm,
  reviewerSuggestionsReject,
  reviewerSuggestionsDestroy,
} from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { formatDate } from '@waldur/core/dateUtils';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { Call } from '@waldur/proposals/types';
import { PoolSummaryButton } from '@waldur/proposals/update/reviewer-pool/PoolSummaryButton';
import { useReviewerPoolTabs } from '@waldur/proposals/update/reviewer-pool/tabs';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { createFetcher } from '@waldur/table/api';
import {
  SuggestionsTableFilter,
  selectSuggestionsTableFilter,
  ReviewerSuggestionStatusEnumChoices,
} from '@waldur/table/generated/ReviewerSuggestionsFilter';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { ReviewerDiscoveryActions } from './ReviewerDiscoveryActions';
import { SuggestionExpandableRow } from './SuggestionExpandableRow';
import { SuggestionRowActions } from './SuggestionRowActions';

const ReviewerProfileDialog = lazyComponent(() =>
  import('./ReviewerProfileDialog').then((m) => ({
    default: m.ReviewerProfileDialog,
  })),
);

interface ReviewerDiscoverySectionProps {
  call: Call;
  refetch: () => void;
}

const StatusBadge: FC<{ status: string; statusDisplay: string }> = ({
  status,
  statusDisplay,
}) => {
  const variant = useMemo(() => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'danger';
      case 'invited':
        return 'primary';
      default:
        return 'secondary';
    }
  }, [status]);

  return (
    <Badge variant={variant} pill outline>
      {statusDisplay}
    </Badge>
  );
};

const formatScore = (score: number | undefined | null) => {
  if (score === undefined || score === null) return '-';
  return `${Math.round(score * 100)}%`;
};

// Affinity score with tooltip breakdown
const AffinityScoreWithTooltip: FC<{ row: ReviewerSuggestion }> = ({ row }) => {
  const tooltipContent = (
    <div className="text-start">
      <div className="mb-1">
        <strong>{translate('Score breakdown:')}</strong>
      </div>
      <div>
        {translate('Keyword match')}: {formatScore(row.keyword_score)}
      </div>
      <div>
        {translate('Text similarity')}: {formatScore(row.text_score)}
      </div>
      <div className="mt-1 pt-1 border-top">
        <strong>
          {translate('Combined')}: {formatScore(row.affinity_score)}
        </strong>
      </div>
    </div>
  );

  return (
    <Tip
      id={`affinity-${row.uuid}`}
      label={tooltipContent}
      placement="top"
      autoWidth
    >
      <div className="fw-bold text-success cursor-pointer">
        {formatScore(row.affinity_score)}
        <InfoIcon className="ms-1" size={14} weight="bold" />
      </div>
    </Tip>
  );
};

// Bulk actions component for multi-select
interface BulkActionsProps {
  rows: ReviewerSuggestion[];
  refetch: () => void;
}

const BulkActions: FC<BulkActionsProps> = ({ rows, refetch }) => {
  const dispatch = useDispatch();

  const pendingRows = rows.filter((r) => r.status === 'pending');

  const handleBulkConfirm = useCallback(async () => {
    try {
      await Promise.all(
        pendingRows.map((row) =>
          reviewerSuggestionsConfirm({
            path: { uuid: row.uuid },
          }),
        ),
      );
      dispatch(
        showSuccess(
          translate('Confirmed {count} suggestions.', {
            count: pendingRows.length,
          }),
        ),
      );
      refetch();
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to confirm suggestions.')),
      );
    }
  }, [pendingRows, dispatch, refetch]);

  const handleBulkReject = useCallback(async () => {
    try {
      await Promise.all(
        pendingRows.map((row) =>
          reviewerSuggestionsReject({
            path: { uuid: row.uuid },
            body: { reason: translate('Bulk rejected') },
          }),
        ),
      );
      dispatch(
        showSuccess(
          translate('Rejected {count} suggestions.', {
            count: pendingRows.length,
          }),
        ),
      );
      refetch();
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to reject suggestions.')),
      );
    }
  }, [pendingRows, dispatch, refetch]);

  const handleBulkDelete = useCallback(async () => {
    try {
      await Promise.all(
        rows.map((row) =>
          reviewerSuggestionsDestroy({
            path: { uuid: row.uuid },
          }),
        ),
      );
      dispatch(
        showSuccess(
          translate('Deleted {count} suggestions.', {
            count: rows.length,
          }),
        ),
      );
      refetch();
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to delete suggestions.')),
      );
    }
  }, [rows, dispatch, refetch]);

  if (rows.length === 0) {
    return (
      <span className="text-muted">{translate('No suggestions selected')}</span>
    );
  }

  return (
    <div className="d-flex gap-2 align-items-center">
      <span className="text-muted me-2">
        {translate('{count} selected', { count: rows.length })}
      </span>
      {pendingRows.length > 0 && (
        <>
          <button
            className="btn btn-sm btn-success"
            onClick={handleBulkConfirm}
          >
            {translate('Confirm all')} ({pendingRows.length})
          </button>
          <button className="btn btn-sm btn-danger" onClick={handleBulkReject}>
            {translate('Reject all')} ({pendingRows.length})
          </button>
        </>
      )}
      <button className="btn btn-sm btn-danger" onClick={handleBulkDelete}>
        {translate('Delete all')} ({rows.length})
      </button>
    </div>
  );
};

export const ReviewerDiscoverySection: FC<ReviewerDiscoverySectionProps> = ({
  call,
}) => {
  const dispatch = useDispatch();
  const formFilters = useSelector(selectSuggestionsTableFilter);
  const tabs = useReviewerPoolTabs();

  const filter = useMemo(
    () => ({
      call_uuid: call?.uuid,
      ...formFilters,
    }),
    [call?.uuid, formFilters],
  );

  const tableProps = useTable({
    table: 'ReviewerSuggestionsTable',
    fetchData: createFetcher(reviewerSuggestionsList),
    filter,
  });

  const handleViewProfile = useCallback(
    (row: ReviewerSuggestion) => {
      dispatch(
        openModalDialog(ReviewerProfileDialog, {
          resolve: { suggestion: row },
          size: 'lg',
        }),
      );
    },
    [dispatch],
  );

  const columns = useMemo(
    () => [
      {
        id: 'reviewer',
        title: translate('Reviewer'),
        render: ({ row }: { row: ReviewerSuggestion }) => (
          <div>
            <div className="d-flex align-items-center gap-2">
              <span className="fw-bold">{row.reviewer_name}</span>
              <button
                className="btn btn-sm btn-icon btn-light-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewProfile(row);
                }}
                title={translate('View profile')}
              >
                <UserIcon size={14} weight="bold" />
              </button>
            </div>
            {row.reviewer_biography && (
              <div
                className="text-muted small mt-1"
                style={{
                  maxWidth: '300px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {row.reviewer_biography}
              </div>
            )}
          </div>
        ),
        keys: ['reviewer_name', 'reviewer_biography'],
      },
      {
        id: 'affinity',
        title: translate('Affinity'),
        render: ({ row }: { row: ReviewerSuggestion }) => (
          <AffinityScoreWithTooltip row={row} />
        ),
        keys: ['affinity_score', 'keyword_score', 'text_score'],
      },
      {
        id: 'keywords',
        title: translate('Keywords'),
        render: ({ row }: { row: ReviewerSuggestion }) => (
          <span>{formatScore(row.keyword_score)}</span>
        ),
        keys: ['keyword_score'],
        optional: true,
      },
      {
        id: 'text',
        title: translate('Text'),
        render: ({ row }: { row: ReviewerSuggestion }) => (
          <span>{formatScore(row.text_score)}</span>
        ),
        keys: ['text_score'],
        optional: true,
      },
      {
        id: 'match_reason',
        title: translate('Match reason'),
        render: ({ row }: { row: ReviewerSuggestion }) => {
          const matchedKeywords = (row.matched_keywords as string[]) || [];
          const topProposals =
            (row.top_matching_proposals as {
              uuid: string;
              name: string;
              affinity: number;
            }[]) || [];

          if (matchedKeywords.length === 0 && topProposals.length === 0) {
            return <span className="text-muted">-</span>;
          }

          return (
            <div className="d-flex flex-column gap-1">
              {matchedKeywords.length > 0 && (
                <div>
                  <small className="text-muted">{translate('Keywords')}:</small>{' '}
                  <span className="small">
                    {matchedKeywords.slice(0, 3).join(', ')}
                    {matchedKeywords.length > 3 && '...'}
                  </span>
                </div>
              )}
              {topProposals.length > 0 && (
                <div>
                  <small className="text-muted">{translate('Best for')}:</small>{' '}
                  <span className="small">
                    {topProposals
                      .slice(0, 2)
                      .map((p) => p.name)
                      .join(', ')}
                    {topProposals.length > 2 && '...'}
                  </span>
                </div>
              )}
            </div>
          );
        },
        keys: ['matched_keywords', 'top_matching_proposals'],
        optional: true,
      },
      {
        id: 'status',
        title: translate('Status'),
        render: ({ row }: { row: ReviewerSuggestion }) => (
          <StatusBadge status={row.status} statusDisplay={row.status_display} />
        ),
        keys: ['status', 'status_display'],
        filter: 'status',
        inlineFilter: (row: ReviewerSuggestion) =>
          ReviewerSuggestionStatusEnumChoices.find(
            (opt) => opt.value === row.status,
          ),
      },
      {
        id: 'reviewed_by',
        title: translate('Reviewed by'),
        render: ({ row }: { row: ReviewerSuggestion }) => (
          <div>
            {row.reviewed_by_name && (
              <>
                <div>{row.reviewed_by_name}</div>
                {row.reviewed_at && (
                  <small className="text-muted">
                    {formatDate(row.reviewed_at)}
                  </small>
                )}
              </>
            )}
            {row.rejection_reason && (
              <div className="text-danger small mt-1">
                {row.rejection_reason}
              </div>
            )}
          </div>
        ),
        keys: ['reviewed_by_name', 'reviewed_at', 'rejection_reason'],
      },
    ],
    [handleViewProfile],
  );

  const toolbarActions = (
    <>
      <PoolSummaryButton />
      {call && (
        <ReviewerDiscoveryActions call={call} refetch={tableProps.fetch} />
      )}
    </>
  );

  return (
    <Table
      {...tableProps}
      columns={columns}
      title={translate('Reviewer pool')}
      tabs={tabs}
      verboseName={translate('reviewer suggestions')}
      tableActions={toolbarActions}
      showPageSizeSelector
      hasQuery
      filters={<SuggestionsTableFilter />}
      rowActions={SuggestionRowActions}
      rowClass={({ row }) =>
        row.status === 'rejected' ? 'bg-light-danger' : ''
      }
      enableMultiSelect
      multiSelectActions={BulkActions}
      hasOptionalColumns
      expandableRow={SuggestionExpandableRow}
    />
  );
};
