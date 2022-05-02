import { Col, Row } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import { makeLastTwelveMonthsFilterPeriods } from '@waldur/form/utils';
import { SUPPORT_FEEDBACK_LIST_FILTER_FORM } from '@waldur/issues/feedback/constants';
import { EvaluationSelectField } from '@waldur/issues/feedback/EvaluationSelectField';
import { PeriodFilterField } from '@waldur/issues/feedback/PeriodFilterField';
import { UserAutocomplete } from '@waldur/issues/feedback/UserAutocomplete';

export const PureSupportFeedbackListFilter = () => (
  <Row>
    <Col sm={4}>
      <PeriodFilterField options={makeLastTwelveMonthsFilterPeriods()} />
    </Col>
    <Col sm={4}>
      <EvaluationSelectField />
    </Col>
    <Col sm={4}>
      <UserAutocomplete />
    </Col>
  </Row>
);

export const SupportFeedbackListFilter = reduxForm({
  form: SUPPORT_FEEDBACK_LIST_FILTER_FORM,
  initialValues: {
    period: makeLastTwelveMonthsFilterPeriods()[0],
  },
  destroyOnUnmount: false,
})(PureSupportFeedbackListFilter);
