import moment from 'moment-timezone';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';

import { getEventsList } from '@waldur/events/BaseEventsList';
import { PeriodOption } from '@waldur/form/types';
import { RootState } from '@waldur/store/reducers';
import { SUPPORT_EVENTS_LIST_FILTER_FORM_ID } from '@waldur/support/constants';

const getStartAndEndDatesOfMonthInUnixTimestamp = (period: PeriodOption) => {
  const { year, month } = period;
  const dt = moment({ year, month: month - 1 });
  return {
    start: dt.startOf('month').unix(),
    end: dt.endOf('month').unix(),
  };
};

const mapPropsToFilter = (props) => {
  const filter: Record<string, string | string[] | number> = {};
  if (props.filter) {
    if (props.filter.feature) {
      filter.feature = props.filter.feature.map((option) => option.value);
    }
    if (props.filter.date) {
      const { start, end } = getStartAndEndDatesOfMonthInUnixTimestamp(
        props.filter.date.value,
      );
      filter.created_from = start;
      filter.created_to = end;
    }
    if (props.filter.user) {
      filter.scope = props.filter.user.url;
    }
  }
  return filter;
};

const PureSupportEventsList = getEventsList({
  mapPropsToFilter,
});

const mapStateToProps = (state: RootState) => ({
  filter: getFormValues(SUPPORT_EVENTS_LIST_FILTER_FORM_ID)(state),
});

export const SupportEventsList = connect(mapStateToProps)(
  PureSupportEventsList,
);
