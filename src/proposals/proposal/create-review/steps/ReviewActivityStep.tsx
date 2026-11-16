import { useMemo } from 'react';

import { StepComponentProps } from 'waldur-wizard';

import { Panel } from '@/core/Panel';
import { BaseEventsList } from '@/events/BaseEventsList';
import { translate } from '@/i18n';
import { ProposalReview } from '@/proposals/types';

/**
 * The review's history, newest first: assigned, accepted, submitted and so on.
 * The reviewer and the call team read it; the backend gives nobody else any
 * of it.
 */
export const ReviewActivityStep = (props: StepComponentProps) => {
  const review: ProposalReview | undefined = props.params?.reviews?.[0];
  const filter = useMemo(() => ({ scope: review?.url }), [review?.url]);

  if (!review?.url) {
    return null;
  }

  return (
    <Panel
      cardBordered
      id={props.id}
      title={props.title}
      subtitle={translate('What happened on this review, and when.')}
    >
      <BaseEventsList
        table={`review-activity-${review.uuid}`}
        filter={filter}
        cardBordered={false}
        hasActionBar={false}
        fullWidth
        minHeight="auto"
        hideTitle
      />
    </Panel>
  );
};
