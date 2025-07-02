import { FunctionComponent } from 'react';
import ReactStars from 'react-rating-stars-component';
import { useAsync } from 'react-use';
import {
  supportFeedbackAverageReportRetrieve,
  supportFeedbackReportRetrieve,
} from 'waldur-js-client';

import { RATING_STAR_ACTIVE_COLOR } from '@waldur/core/constants';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Panel } from '@waldur/core/Panel';
import { translate } from '@waldur/i18n';
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
  const { loading, error, value } = useAsync(loadData, []);
  return loading ? (
    <LoadingSpinner />
  ) : error ? (
    <>
      {translate(
        'Unable to load customer support satisfaction overall rating.',
      )}
    </>
  ) : value.averageFeedback instanceof Number ? (
    <Panel
      title={translate('Customer support satisfaction overall rating')}
      className="customer-support-rating-container"
    >
      <div className="feedback-info">
        <ReactStars
          count={10}
          size={24}
          edit={false}
          isHalf={true}
          activeColor={RATING_STAR_ACTIVE_COLOR}
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
  ) : null;
};
