import * as React from 'react';
import ReactStars from 'react-rating-stars-component';
import useAsync from 'react-use/lib/useAsync';

import { get } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Panel } from '@waldur/core/Panel';
import { translate } from '@waldur/i18n';
import './CustomerSupportRating.scss';

const loadData = async () => {
  const feedbackReport = await get(`/support-feedback-report/`).then(
    (response) => response.data,
  );
  const averageFeedback = await get(`/support-feedback-average-report/`).then(
    (response) => response.data,
  );
  return { feedbackReport, averageFeedback };
};

const getTotalNumberOfReviews = (feedback): number => {
  let sum = 0;
  for (const item in feedback) {
    if (feedback.hasOwnProperty(item)) {
      sum += parseFloat(feedback[item]);
    }
  }
  return sum;
};

export const CustomerSupportRating = () => {
  const { loading, error, value } = useAsync(loadData, []);
  return loading ? (
    <LoadingSpinner />
  ) : error ? (
    <>
      {translate(
        'Unable to load customer support satisfaction overall rating.',
      )}
    </>
  ) : (
    <Panel
      title={translate('Customer support satisfaction overall rating')}
      className="customer-support-rating-container"
    >
      <div className="feedback-info">
        <ReactStars
          count={5}
          size={24}
          edit={false}
          isHalf={true}
          activeColor="#ffd700"
          value={value.averageFeedback}
        />
        <div className="total-reviews">
          <span>
            {getTotalNumberOfReviews(value.feedbackReport)}{' '}
            {translate('reviews')}
          </span>
        </div>
      </div>
    </Panel>
  );
};
