import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { proposalReviewsRetrieve, type ProposalReview } from 'waldur-js-client';

import { PropertyItem, PropertyList } from 'waldur-ui';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { RateStars } from '@/proposals/proposal/create-review/RateStars';
import { ExpandableContainer } from '@/table/ExpandableContainer';

// Per-field review comments, in display order. Only non-empty ones are shown.
const COMMENT_FIELDS: {
  key: Extract<keyof ProposalReview, `comment_${string}`>;
  label: string;
}[] = [
  { key: 'comment_project_title', label: translate('Project title') },
  { key: 'comment_project_summary', label: translate('Project summary') },
  {
    key: 'comment_project_description',
    label: translate('Project description'),
  },
  {
    key: 'comment_project_supporting_documentation',
    label: translate('Supporting documentation'),
  },
  { key: 'comment_resource_requests', label: translate('Resource requests') },
  { key: 'comment_team', label: translate('Team') },
];

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
    <ExpandableContainer alignRows>
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

  const summaryItems = (
    <>
      <PropertyItem
        label={translate('Score')}
        value={
          review.summary_score ? (
            <div className="flex items-center gap-1.5">
              <RateStars value={review.summary_score} size={18} />
              <span className="text-quaternary">
                ({review.summary_score}/5)
              </span>
            </div>
          ) : (
            '-'
          )
        }
      />
      <PropertyItem
        label={translate('Public comment')}
        value={review.summary_public_comment}
        hideIfEmpty={false}
      />
      <PropertyItem
        label={translate('Private comment')}
        value={review.summary_private_comment}
        hideIfEmpty={false}
      />
      {review.created && (
        <PropertyItem
          label={translate('Created')}
          value={propVal.date(review.created, { precision: 'datetime' })}
        />
      )}
      {review.modified && review.modified !== review.created && (
        <PropertyItem
          label={translate('Last modified')}
          value={propVal.date(review.modified, { precision: 'datetime' })}
        />
      )}
    </>
  );

  if (fieldComments.length > 0) {
    return (
      <PropertyList variant="summary" className="flex flex-col gap-6">
        <PropertyList.Section title={translate('Summary')}>
          {summaryItems}
        </PropertyList.Section>
        <PropertyList.Section title={translate('Field comments')}>
          {fieldComments.map((field) => (
            <PropertyItem
              key={field.key}
              label={field.label}
              value={review[field.key]}
            />
          ))}
        </PropertyList.Section>
      </PropertyList>
    );
  }

  return <PropertyList variant="summary">{summaryItems}</PropertyList>;
};
