import * as React from 'react';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';

import { isEmpty } from '@waldur/core/utils';
import { getEventsList } from '@waldur/events/BaseEventsList';
import { connectAngularComponent } from '@waldur/store/connect';

import { CustomerEventsFilter } from './CustomerEventsFilter';

export const PureCustomerEvents = getEventsList({
  mapPropsToFilter: props => {
    const filter = {
      ...props.userFilter,
      scope: props.customer.url,
    };
    if (props.userFilter && isEmpty(props.userFilter.feature)) {
      filter.feature = ['customers', 'projects', 'resources'];
    }
    return filter;
  },
});

const mapStateToProps = state => ({
  userFilter: getFormValues('customerEventsFilter')(state),
});

const CustomerEvents = connect(mapStateToProps)(PureCustomerEvents);

const CustomerEventsView = props => (
  <>
    <CustomerEventsFilter/>
    <CustomerEvents {...props}/>
  </>
);

export default connectAngularComponent(CustomerEventsView, ['customer']);
