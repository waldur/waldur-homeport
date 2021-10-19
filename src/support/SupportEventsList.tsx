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
      const dt = DateTime.fromObject(props.filter.date.value);
      filter.created_from = dt.startOf('month').valueOf();
      filter.created_to = dt.endOf('month').valueOf();
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
