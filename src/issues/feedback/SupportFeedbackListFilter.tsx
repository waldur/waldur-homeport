import { reduxForm } from 'redux-form';

import { makeLastTwelveMonthsFilterPeriods } from '@waldur/form/utils';
import { translate } from '@waldur/i18n';
import { SUPPORT_FEEDBACK_LIST_FILTER_FORM } from '@waldur/issues/feedback/constants';
import { EvaluationSelectField } from '@waldur/issues/feedback/EvaluationSelectField';
import { PeriodFilterField } from '@waldur/issues/feedback/PeriodFilterField';
import { UserAutocomplete } from '@waldur/issues/feedback/UserAutocomplete';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const PureSupportFeedbackListFilter = () => (
  <>
    <TableFilterItem
      title={translate('Date')}
      name="period"
      badgeValue={(value) => value?.label}
      ellipsis={false}
    >
      <PeriodFilterField options={makeLastTwelveMonthsFilterPeriods()} />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Evaluation')}
      name="evaluation"
      badgeValue={(value) => value?.label}
    >
      <EvaluationSelectField />
    </TableFilterItem>
    <TableFilterItem
      title={translate('User')}
      name="user"
      badgeValue={(value) => value?.full_name}
    >
      <UserAutocomplete />
    </TableFilterItem>
  </>
);

export const SupportFeedbackListFilter = reduxForm({
  form: SUPPORT_FEEDBACK_LIST_FILTER_FORM,
  initialValues: {
    period: makeLastTwelveMonthsFilterPeriods()[0],
  },
  destroyOnUnmount: false,
})(PureSupportFeedbackListFilter);
