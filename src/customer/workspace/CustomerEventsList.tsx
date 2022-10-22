import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';

import { isEmpty } from '@waldur/core/utils';
import { getEventsList } from '@waldur/events/BaseEventsList';
import { RootState } from '@waldur/store/reducers';
import { getCustomer } from '@waldur/workspace/selectors';

import { CustomerEventsFilter } from './CustomerEventsFilter';

export const PureCustomerEvents = getEventsList({
  mapPropsToFilter: (props) => {
    const filter = {
      ...props.userFilter,
      scope: props.customer.url,
    };
    if (props.userFilter && isEmpty(props.userFilter.feature)) {
      filter.feature = ['customers', 'projects', 'resources'];
    }
    return filter;
  },
  mapPropsToTableId: (props) => ['customer-events', props.customer.uuid],
});

const mapStateToProps = (state: RootState) => ({
  customer: getCustomer(state),
  userFilter: getFormValues('customerEventsFilter')(state),
});

const CustomerEvents = connect(mapStateToProps)(PureCustomerEvents);

export const CustomerEventsList = (props) => {
  return <CustomerEvents {...props} filters={<CustomerEventsFilter />} />;
};
