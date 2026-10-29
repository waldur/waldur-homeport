import { useQuery } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import {
  supportFeedbackAverageReportRetrieve,
  supportFeedbackReportRetrieve,
} from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Panel } from '@/core/Panel';
import { translate } from '@/i18n';
import { RateStars } from '@/proposals/proposal/create-review/RateStars';

import './CustomerSupportRating.scss';

const loadData = async () => {
  const feedbackReport = await supportFeedbackReportRetrieve().then(
    (response) => response.data,
  );
  const averageFeedback = await supportFeedbackAverageReportRetrieve().then(
    (response) => response.data,
  );
  return { feedbackReport, averageFeedback };
};

const getTotalNumberOfReviews = (feedback): number => {
  let sum = 0;
  for (const item in feedback) {
    if (Object.prototype.hasOwnProperty.call(feedback, item)) {
      sum += parseFloat(feedback[item]);
    }
  }
  return sum;
};

export const CustomerSupportRating: FunctionComponent = () => {
  const {
    isLoading: loading,
    error,
    data: value,
  } = useQuery({
    queryKey: ['CustomerSupportRating'],
    queryFn: loadData,
  });
  // The average report is a plain JSON number (9.5), never a Number object;
  // anything that is not a finite number hides the panel.
  return loading ? (
    <LoadingSpinner />
  ) : error ? (
    <>
      {translate(
        'Unable to load customer support satisfaction overall rating.',
      )}
    </>
  ) : Number.isFinite(value.averageFeedback) ? (
    <Panel
      title={translate('Customer support satisfaction overall rating')}
      className="customer-support-rating-container"
    >
      <div className="feedback-info">
        <RateStars count={10} size={24} value={Number(value.averageFeedback)} />

        <div className="total-reviews">
          <span>
            {getTotalNumberOfReviews(value.feedbackReport)}{' '}
            {translate('reviews')}
          </span>
        </div>
      </div>
    </Panel>
  ) : null;
};
