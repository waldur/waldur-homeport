import { useQuery } from '@tanstack/react-query';
import { FC, FunctionComponent } from 'react';
import { proposalReviewsRetrieve, type ProposalReview } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { RateStars } from '@/proposals/proposal/create-review/RateStars';
import { Field } from '@/resource/summary';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import { renderFieldOrDash } from '@/table/utils';

// Per-field review comments, in display order. Only non-empty ones are shown.
const COMMENT_FIELDS: { key: keyof ProposalReview; label: string }[] = [
  { key: 'comment_project_title', label: translate('Project title') },
  { key: 'comment_project_summary', label: translate('Project summary') },
  {
    key: 'comment_project_description',
    label: translate('Project description'),
  },
  { key: 'comment_project_duration', label: translate('Project duration') },
  {
    key: 'comment_project_supporting_documentation',
    label: translate('Supporting documentation'),
  },
  { key: 'comment_resource_requests', label: translate('Resource requests') },
  { key: 'comment_team', label: translate('Team') },
];

const SectionHeader: FunctionComponent<{ title: string }> = ({ title }) => (
  <div className="field-row mt-4">
    <div className="border-bottom pb-2 mb-2">
      <strong>{title}</strong>
    </div>
  </div>
);

// Shared expandable content for a proposal review: fetches the full review on
// expand (list endpoints trim heavy fields) and shows the reviewer's score,
// public/private summary comments, timestamps, and per-section comments. Reused
// by the proposal Reviews popup, the admin reviews list, and the call-manage
// reviews list.
export const ReviewExpandableRow: FC<{
  row: ProposalReview;
  fetch?: any;
}> = ({ row }) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ReviewDetail', row.uuid],
    queryFn: () =>
      proposalReviewsRetrieve({ path: { uuid: row.uuid } }).then(
        (response) => response.data,
      ),
    refetchOnWindowFocus: false,
  });

  return (
    <ExpandableContainer asTable>
      {isLoading ? (
        <LoadingSpinner />
      ) : error || !data ? (
        <LoadingErred
          message={translate('Unable to load the review details.')}
          loadData={refetch}
        />
      ) : (
        <ReviewDetails review={data} />
      )}
    </ExpandableContainer>
  );
};

// The review's score/comments block, reusable outside the expandable row
// (e.g. as a "Review from X" tab in the proposal details overview dialog).
export const ReviewDetails: FC<{ review: ProposalReview }> = ({ review }) => {
  const fieldComments = COMMENT_FIELDS.filter((field) => review[field.key]);

  return (
    <>
      <Field
        label={translate('Score')}
        value={
          review.summary_score ? (
            <div className="d-flex align-items-center gap-2">
              <RateStars value={review.summary_score} size={18} />
              <span className="text-muted">({review.summary_score}/5)</span>
            </div>
          ) : (
            '-'
          )
        }
      />
      <Field
        label={translate('Public comment')}
        value={renderFieldOrDash(review.summary_public_comment)}
      />
      <Field
        label={translate('Private comment')}
        value={renderFieldOrDash(review.summary_private_comment)}
      />
      {review.created && (
        <Field
          label={translate('Created')}
          value={formatDateTime(review.created)}
        />
      )}
      {review.modified && review.modified !== review.created && (
        <Field
          label={translate('Last modified')}
          value={formatDateTime(review.modified)}
        />
      )}
      {fieldComments.length > 0 && (
        <>
          <SectionHeader title={translate('Field comments')} />
          {fieldComments.map((field) => (
            <Field
              key={field.key}
              label={field.label}
              value={review[field.key]}
            />
          ))}
        </>
      )}
    </>
  );
};
