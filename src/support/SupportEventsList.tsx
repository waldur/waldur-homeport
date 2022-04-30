import { DateTime } from 'luxon';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';

import { getEventsList } from '@waldur/events/BaseEventsList';
import { RootState } from '@waldur/store/reducers';
import { SUPPORT_EVENTS_LIST_FILTER_FORM_ID } from '@waldur/support/constants';

const mapPropsToFilter = (props) => {
  const filter: Record<string, string | string[] | number> = {};
  if (props.filter) {
    if (props.filter.feature) {
      filter.feature = props.filter.feature.map((option) => option.value);
    }
    if (props.filter.date) {
      const { year, month } = props.filter.date.value;
      const dt = DateTime.fromObject({ year, month });
      filter.created_from = Math.trunc(dt.startOf('month').valueOf() / 1000);
      filter.created_to = Math.trunc(dt.endOf('month').valueOf() / 1000);
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
