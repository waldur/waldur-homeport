import { connect } from 'react-redux';

import { getEventsList } from '@waldur/events/BaseEventsList';
import { RootState } from '@waldur/store/reducers';
import { getCustomer } from '@waldur/workspace/selectors';

export const PureCustomerPermissionsLogList = getEventsList({
  mapPropsToFilter: (props) => ({
    scope: props.customer.url,
    event_type: ['role_granted', 'role_revoked', 'role_updated'],
  }),
});

const enhance = connect((state: RootState) => ({
  customer: getCustomer(state),
}));

export const CustomerPermissionsLogList = enhance(
  PureCustomerPermissionsLogList,
);
