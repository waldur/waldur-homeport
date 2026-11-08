import { useQuery } from '@tanstack/react-query';
import { FC, ReactNode, useCallback, useMemo, useRef } from 'react';
import {
  AssignmentBatchList,
  AssignmentItem,
  assignmentBatchesList,
  assignmentItemsList,
  proposalReviewsList,
  ProposalWorkflowStepInstance,
  type ProposalReview,
} from 'waldur-js-client';

import { AlertItem, Badge } from 'waldur-ui';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { formatDate } from '@/core/dateUtils';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { Proposal } from '@/proposals/types';
import { statusLabel } from '@/proposals/workflow/constants';
import {
  fetchCallWorkflowSteps,
  callWorkflowStepsKey,
} from '@/proposals/workflow/queries';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { ReviewExpandableRow } from '../review/ReviewExpandableRow';
import { ReviewStateRenderer } from '../review/ReviewStateRenderer';

import { ReviewStage, reviewStage } from './reviewStage';

interface ProposalReviewsDialogProps {
  proposal: Proposal;
  /** The proposal's workflow, to say where its reviews stand. */
  workflowStates?: ProposalWorkflowStepInstance[];
  /**
   * Opened by the applicant team, who read the reviews shared with them and
   * nothing of how the review step is run.
   */
  forApplicant?: boolean;
}

/** An in-memory table: its rows are already loaded. */
const useRowsTable = <T,>(table: string, rows: T[], version: number) => {
  const rowsRef = useRef(rows);
  rowsRef.current = rows;
  const filter = useMemo(() => ({ version }), [version]);
  const fetchData = useCallback(
    () =>
      Promise.resolve({
        rows: rowsRef.current,
        resultCount: rowsRef.current.length,
      }),
    [],
  );
  return useTable({ table, fetchData, filter });
};

const tableChrome = {
  title: null,
  hasActionBar: false,
  hideRefresh: true,
  placeholderHasRetry: false,
  minHeight: 'auto',
} as const;

const ASSIGNMENT_VARIANTS: Record<string, 'neutral' | 'success' | 'danger'> = {
  accepted: 'success',
  declined: 'danger',
  coi_blocked: 'danger',
};

interface AssignmentRow {
  uuid: string;
  reviewer: string | null;
  status: string;
  statusDisplay: string;
  respondedAt: string | null;
}

/**
 * The reviewers asked to review the proposal, with how each answered. Null
 * when the viewer may not read the assignments.
 */
const useReviewerAssignments = (proposal: Proposal, enabled: boolean) =>
  useQuery<AssignmentRow[] | null>({
    queryKey: ['ProposalReviewerAssignments', proposal.uuid],
    queryFn: async () => {
      const [items, batches] = await Promise.all([
        getAllPages<AssignmentItem>((page) =>
          assignmentItemsList({
            query: {
              proposal_uuid: proposal.uuid,
              page,
              page_size: MAX_PAGE_SIZE,
            },
          }),
        ),
        getAllPages<AssignmentBatchList>((page) =>
          assignmentBatchesList({
            query: {
              call_uuid: proposal.call_uuid,
              page,
              page_size: MAX_PAGE_SIZE,
            },
          }),
        ),
      ]);
      const reviewers = new Map(
        batches.map((batch) => [batch.url, batch.reviewer_name]),
      );
      return items
        .filter((item) => item.status !== 'reassigned')
        .map((item) => ({
          uuid: item.uuid,
          reviewer: reviewers.get(item.batch) ?? null,
          status: item.status,
          statusDisplay: item.status_display,
          respondedAt: item.responded_at,
        }));
    },
    enabled,
    retry: false,
    refetchOnWindowFocus: false,
  });

const ReviewerAssignments: FC<{ rows: AssignmentRow[]; version: number }> = ({
  rows,
  version,
}) => {
  const tableProps = useRowsTable('ProposalReviewerAssignments', rows, version);
  return (
    <Table<AssignmentRow>
      {...tableProps}
      {...tableChrome}
      verboseName={translate('reviewer assignments')}
      columns={[
        {
          title: translate('Reviewer'),
          render: ({ row }) => (
            <span className="font-medium text-primary">
              {renderFieldOrDash(row.reviewer)}
            </span>
          ),
        },
        {
          title: translate('Status'),
          render: ({ row }) => (
            <Badge
              variant={ASSIGNMENT_VARIANTS[row.status] ?? 'neutral'}
              size="sm"
              shape="pill"
              tone="outline"
            >
              {row.statusDisplay}
            </Badge>
          ),
        },
        {
          title: translate('Responded'),
          render: ({ row }) => (
            <>
              {row.respondedAt ? formatDate(row.respondedAt) : DASH_ESCAPE_CODE}
            </>
          ),
        },
      ]}
    />
  );
};

/** Why there is no review yet, from where the review step stands. */
const NoReviews: FC<{ proposal: Proposal; stage: ReviewStage }> = ({
  proposal,
  stage,
}) => {
  const started = stage.kind === 'started';
  const {
    data: assignments,
    isLoading,
    dataUpdatedAt,
  } = useReviewerAssignments(proposal, started);

  let message: string;
  switch (stage.kind) {
    case 'none':
      message = translate("This call's workflow has no review step.");
      break;
    case 'skipped':
      message = translate('The {step} step was skipped for this proposal.', {
        step: stage.step.step_name,
      });
      break;
    case 'not_started':
      message = stage.previous
        ? translate('Reviews start at {step}, after {previous}.', {
            step: stage.step.step_name,
            previous: stage.previous.step_name,
          })
        : translate('Reviews start at {step}.', {
            step: stage.step.step_name,
          });
      break;
    default:
      if (isLoading) return <LoadingSpinner />;
      if (assignments?.length) {
        return (
          <div className="flex flex-col gap-3">
            <p className="mb-0">
              {translate(
                'No review has been submitted yet. The reviewers asked to review this proposal:',
              )}
            </p>
            <ReviewerAssignments rows={assignments} version={dataUpdatedAt} />
          </div>
        );
      }
      message = translate('No reviewer has been assigned yet.');
  }
  return <AlertItem variant="info" type="floating" title={message} />;
};

/**
 * Where the running review step stands: its name and status, how many of the
 * reviews are in, and how many the step needs.
 */
const ReviewStatusLine: FC<{
  proposal: Proposal;
  stage: ReviewStage;
  reviews: ProposalReview[];
}> = ({ proposal, stage, reviews }) => {
  const step = stage.kind === 'started' ? stage.step : undefined;
  const { data: callSteps } = useQuery({
    queryKey: callWorkflowStepsKey(proposal.call_uuid),
    queryFn: () => fetchCallWorkflowSteps(proposal.call_uuid),
    enabled: Boolean(step),
    retry: false,
    refetchOnWindowFocus: false,
  });
  const callStep = step
    ? callSteps?.find((candidate) => candidate.uuid === step.call_step_uuid)
    : undefined;
  const minimum = callStep?.min_reviewers ?? callStep?.min_contributions;
  const counted = reviews.filter((review) => review.state !== 'rejected');
  const submitted = counted.filter((review) => review.state === 'submitted');

  const parts = [
    step?.step_name,
    step ? statusLabel(step.status) : undefined,
    translate('{submitted} of {total} reviews submitted', {
      submitted: submitted.length,
      total: counted.length,
    }),
    minimum ? translate('minimum {count}', { count: minimum }) : undefined,
  ].filter(Boolean);
  return (
    <p className="text-quaternary mb-3" data-testid="review-status-line">
      {parts.join(' · ')}
    </p>
  );
};

const ReviewsTable: FC<{
  reviews: ProposalReview[];
  version: number;
  forApplicant?: boolean;
}> = ({ reviews, version, forApplicant }) => {
  const tableProps = useRowsTable('ProposalReviewsDialog', reviews, version);
  return (
    <Table<ProposalReview>
      {...tableProps}
      {...tableChrome}
      verboseName={translate('reviews')}
      columns={[
        {
          title: translate('Reviewer'),
          // A blind review names its reviewer only to those overseeing the
          // call; anyone else reads its label ("Reviewer 1").
          // How to reach them comes only to those overseeing the call.
          render: ({ row }) => (
            <div>
              {renderFieldOrDash(
                row.reviewer_full_name || row.anonymous_reviewer_name,
              )}
              {row.reviewer_email || row.reviewer_organization ? (
                <div className="text-quaternary">
                  {[
                    row.reviewer_email ? (
                      <a key="email" href={`mailto:${row.reviewer_email}`}>
                        {row.reviewer_email}
                      </a>
                    ) : null,
                    row.reviewer_organization || null,
                  ]
                    .filter(Boolean)
                    .reduce<ReactNode[]>(
                      (parts, part, index) =>
                        index ? [...parts, ' · ', part] : [part],
                      [],
                    )}
                </div>
              ) : null}
            </div>
          ),
          keys: [
            'reviewer_full_name',
            'anonymous_reviewer_name',
            'reviewer_email',
            'reviewer_organization',
          ],
        },
        {
          title: translate('State'),
          render: ReviewStateRenderer,
          keys: ['state'],
        },
        {
          title: translate('Score'),
          render: ({ row }) => <>{renderFieldOrDash(row.summary_score)}</>,
          keys: ['summary_score'],
        },
        !forApplicant && {
          title: translate('Review due'),
          render: ({ row }) => (
            <>
              {row.review_end_date
                ? formatDate(row.review_end_date)
                : DASH_ESCAPE_CODE}
            </>
          ),
          keys: ['review_end_date'],
        },
      ]}
      expandableRow={ReviewExpandableRow}
    />
  );
};

// Read-only overview of every review assigned to a proposal (all states), so a
// call manager can see who is reviewing and where each review stands without
// leaving the proposal. Rows expand to the reviewer's scores/comments via the
// shared ReviewExpandableRow (also used by the admin reviews list). With no
// review yet, it says why, from where the workflow's review step stands.
export const ProposalReviewsDialog: FC<ProposalReviewsDialogProps> = ({
  proposal,
  workflowStates,
  forApplicant,
}) => {
  const stage = useMemo(() => reviewStage(workflowStates), [workflowStates]);
  const {
    data: reviews,
    isLoading,
    isError,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['ProposalReviewsDialog', proposal.uuid],
    queryFn: () =>
      getAllPages<ProposalReview>((page) =>
        proposalReviewsList({
          query: {
            proposal_uuid: proposal.uuid,
            page,
            page_size: MAX_PAGE_SIZE,
          },
        }),
      ),
    refetchOnWindowFocus: false,
  });

  let content;
  if (isLoading) {
    content = <LoadingSpinner />;
  } else if (isError) {
    content = (
      <LoadingErred
        loadData={refetch}
        message={translate('Unable to load the reviews.')}
      />
    );
  } else if (!reviews?.length) {
    content = forApplicant ? (
      <AlertItem
        variant="info"
        type="floating"
        title={translate('No review has been shared with you yet.')}
      />
    ) : (
      <NoReviews proposal={proposal} stage={stage} />
    );
  } else {
    content = (
      <>
        {!forApplicant && (
          <ReviewStatusLine
            proposal={proposal}
            stage={stage}
            reviews={reviews}
          />
        )}
        <ReviewsTable
          reviews={reviews}
          version={dataUpdatedAt}
          forApplicant={forApplicant}
        />
      </>
    );
  }

  return (
    <ModalDialog title={translate('Reviews')} subtitle={proposal.name}>
      {/* A floor, so the loading state is not a sliver the table then
          stretches. */}
      <div className="min-h-60">{content}</div>
    </ModalDialog>
  );
};
