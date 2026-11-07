import { FC, useCallback, useMemo } from 'react';
import { ReviewerReportRow } from 'waldur-js-client';

import { Badge, StatCardGrid } from 'waldur-ui';

import { ChartCard } from '@/core/ChartCard';
import { EChart } from '@/core/EChart';
import { useChartThemeColors } from '@/dashboard/chartColors';
import { translate } from '@/i18n';
import { Column } from '@/table/types';
import { renderFieldOrDash } from '@/table/utils';

import { barChartHeight, buildReviewerLoadOptions } from './charts';
import {
  formatDays,
  formatNumber,
  formatOptionalDate,
  formatScore,
} from './format';
import { ReportTable } from './ReportTable';
import { ReportViewProps } from './types';

/** The busiest reviewers the chart shows; the table lists them all. */
const CHART_LIMIT = 15;

type ReviewerRow = ReviewerReportRow & {
  uuid: string;
  /** The reviewer's name, or the address of an invitee with no account. */
  display_name: string;
};

/** Reviews closed without a review: declined, expired or withdrawn. */
const notReviewed = (row: {
  reviews_declined: number;
  reviews_expired: number;
  reviews_withdrawn: number;
}) => row.reviews_declined + row.reviews_expired + row.reviews_withdrawn;

type InvitationCounts = Pick<
  ReviewerReportRow,
  | 'invitations'
  | 'invitations_accepted'
  | 'invitations_declined'
  | 'invitations_expired'
  | 'invitations_pending'
  | 'invitations_withdrawn'
  | 'invitations_coi_blocked'
  | 'invitations_reassigned'
>;

/**
 * "3 sent: 1 accepted, 1 declined, 1 reassigned". Every invitation is in one
 * of the seven parts, so the parts add up to what was sent; only those that
 * hold any are named.
 */
const describeInvitations = (counts: InvitationCounts): string => {
  if (!counts.invitations) return '';
  const parts: Array<[number, (count: string) => string]> = [
    [
      counts.invitations_accepted,
      (count) => translate('{count} accepted', { count }),
    ],
    [
      counts.invitations_declined,
      (count) => translate('{count} declined', { count }),
    ],
    [
      counts.invitations_expired,
      (count) => translate('{count} expired', { count }),
    ],
    [
      counts.invitations_pending,
      (count) => translate('{count} unanswered', { count }),
    ],
    [
      counts.invitations_withdrawn,
      (count) => translate('{count} canceled before an answer', { count }),
    ],
    [
      counts.invitations_coi_blocked,
      (count) =>
        translate('{count} blocked by a conflict of interest', { count }),
    ],
    [
      counts.invitations_reassigned,
      (count) => translate('{count} reassigned', { count }),
    ],
  ];
  return translate('{count} sent: {parts}', {
    count: formatNumber(counts.invitations),
    parts: parts
      .filter(([count]) => count > 0)
      .map(([count, describe]) => describe(formatNumber(count)))
      .join(', '),
  });
};

const Invitations = ({ row }: { row: ReviewerRow }) =>
  row.invitations ? (
    <span>{describeInvitations(row)}</span>
  ) : (
    <>{renderFieldOrDash(null)}</>
  );

const Reviewer = ({ row }: { row: ReviewerRow }) => (
  <div>
    <div className="flex flex-wrap items-center gap-1.5">
      <span>{row.display_name}</span>
      {row.is_active === false && (
        <Badge variant="neutral" size="sm" shape="pill" tone="outline">
          {translate('Inactive')}
        </Badge>
      )}
    </div>
    <div className="text-xs text-quaternary">
      {row.reviewer_uuid ? row.reviewer_email : translate('No account')}
    </div>
  </div>
);

export const ReviewersReportView: FC<ReportViewProps<'reviewers'>> = ({
  data,
  scope,
}) => {
  const colors = useChartThemeColors();
  const { totals } = data;

  const rows = useMemo<ReviewerRow[]>(
    () =>
      data.reviewers.map((reviewer) => ({
        ...reviewer,
        // An invitee with no account has no uuid: the address names the row.
        uuid: reviewer.reviewer_uuid ?? `email:${reviewer.reviewer_email}`,
        display_name: reviewer.reviewer_name || reviewer.reviewer_email,
      })),
    [data.reviewers],
  );

  // Reviewers with reviews, the busiest first as the backend lists them;
  // the chart shows the first of them.
  const withReviews = useMemo(
    () => data.reviewers.filter((reviewer) => reviewer.reviews_assigned),
    [data.reviewers],
  );
  const charted = useMemo(
    () => withReviews.slice(0, CHART_LIMIT),
    [withReviews],
  );
  const options = useMemo(
    () => buildReviewerLoadOptions(charted, colors),
    [charted, colors],
  );

  const getExportData = useCallback(
    () => ({
      fields: [
        translate('Reviewer'),
        translate('Submitted'),
        translate('In progress'),
        translate('Not started'),
        translate('Declined'),
        translate('Expired'),
        translate('Withdrawn'),
      ],
      data: charted.map((reviewer) => [
        reviewer.reviewer_name || reviewer.reviewer_email,
        reviewer.reviews_submitted,
        reviewer.reviews_in_progress,
        reviewer.reviews_not_started,
        reviewer.reviews_declined,
        reviewer.reviews_expired,
        reviewer.reviews_withdrawn,
      ]),
    }),
    [charted],
  );

  const columns = useMemo<Column<ReviewerRow>[]>(
    () => [
      {
        title: translate('Reviewer'),
        orderField: 'display_name',
        rowHeader: true,
        render: Reviewer,
        export: (row) => row.display_name,
      },
      {
        title: translate('Email'),
        render: ({ row }) => <>{row.reviewer_email}</>,
        export: (row) => row.reviewer_email,
        visible: false,
      },
      {
        title: translate('Invitations'),
        orderField: 'invitations',
        render: Invitations,
        export: (row) => describeInvitations(row),
      },
      {
        title: translate('Reviews'),
        orderField: 'reviews_assigned',
        render: ({ row }) => <>{formatNumber(row.reviews_assigned)}</>,
        export: (row) => row.reviews_assigned,
      },
      {
        title: translate('Submitted'),
        orderField: 'reviews_submitted',
        render: ({ row }) => <>{formatNumber(row.reviews_submitted)}</>,
        export: (row) => row.reviews_submitted,
      },
      {
        title: translate('In progress'),
        orderField: 'reviews_in_progress',
        render: ({ row }) => <>{formatNumber(row.reviews_in_progress)}</>,
        export: (row) => row.reviews_in_progress,
      },
      {
        title: translate('Not started'),
        orderField: 'reviews_not_started',
        render: ({ row }) => <>{formatNumber(row.reviews_not_started)}</>,
        export: (row) => row.reviews_not_started,
      },
      {
        title: translate('Overdue'),
        orderField: 'reviews_overdue',
        render: ({ row }) =>
          row.reviews_overdue ? (
            <span className="text-danger font-medium">
              {formatNumber(row.reviews_overdue)}
            </span>
          ) : (
            <>{formatNumber(row.reviews_overdue)}</>
          ),
        export: (row) => row.reviews_overdue,
      },
      {
        title: translate('Declined, expired or withdrawn'),
        render: ({ row }) => <>{formatNumber(notReviewed(row))}</>,
        export: (row) => notReviewed(row),
      },
      {
        title: translate('Days to answer'),
        orderField: 'median_response_days',
        render: ({ row }) => (
          <>{renderFieldOrDash(formatDays(row.median_response_days))}</>
        ),
        export: (row) => formatDays(row.median_response_days),
      },
      {
        title: translate('Days to review'),
        orderField: 'median_turnaround_days',
        render: ({ row }) => (
          <>{renderFieldOrDash(formatDays(row.median_turnaround_days))}</>
        ),
        export: (row) => formatDays(row.median_turnaround_days),
      },
      {
        title: translate('Mean score'),
        orderField: 'mean_score',
        render: ({ row }) => (
          <>{renderFieldOrDash(formatScore(row.mean_score))}</>
        ),
        export: (row) => formatScore(row.mean_score),
      },
      {
        title: translate('Last submitted'),
        orderField: 'last_submitted_at',
        render: ({ row }) => (
          <>{renderFieldOrDash(formatOptionalDate(row.last_submitted_at))}</>
        ),
        export: (row) => formatOptionalDate(row.last_submitted_at),
      },
    ],
    [],
  );

  return (
    <>
      <StatCardGrid
        stats={[
          {
            label: translate('Reviewers'),
            value: formatNumber(totals.reviewers),
          },
          {
            label: translate('Invitations accepted'),
            value: formatNumber(totals.invitations_accepted),
            footer: (
              <span className="text-xs text-quaternary">
                {describeInvitations(totals)}
              </span>
            ),
          },
          {
            label: translate('Reviews submitted'),
            value: formatNumber(totals.reviews_submitted),
            footer: (
              <span className="text-xs text-quaternary">
                {translate('Of {count} assigned', {
                  count: formatNumber(totals.reviews_assigned),
                })}
              </span>
            ),
          },
          {
            label: translate('Reviews in progress'),
            value: formatNumber(totals.reviews_in_progress),
            footer: (
              <span className="text-xs text-quaternary">
                {translate('Not started: {count}', {
                  count: formatNumber(totals.reviews_not_started),
                })}
              </span>
            ),
          },
          {
            label: translate('Overdue reviews'),
            value: formatNumber(totals.reviews_overdue),
          },
        ]}
      />
      <div className="mb-5">
        <ChartCard
          title={translate('Reviews per reviewer')}
          summary={
            withReviews.length > CHART_LIMIT
              ? translate('The {count} busiest reviewers', {
                  count: CHART_LIMIT,
                })
              : undefined
          }
          getExportData={getExportData}
          isEmpty={!charted.length}
          chartHeight={barChartHeight(charted.length)}
        >
          {(ref) => (
            <EChart
              ref={ref}
              options={options}
              height={barChartHeight(charted.length)}
            />
          )}
        </ChartCard>
      </div>
      <ReportTable<ReviewerRow>
        table={`CallReportsReviewers-${scope.callUuid ?? scope.organizationUuid}`}
        rows={rows}
        columns={columns}
        title={translate('Reviewers')}
        verboseName={translate('reviewers')}
        queryField="display_name"
      />
    </>
  );
};
