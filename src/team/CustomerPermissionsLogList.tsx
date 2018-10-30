import { connect } from 'react-redux';

import { getEventsList } from '@waldur/events/BaseEventsList';
import { connectAngularComponent } from '@waldur/store/connect';
import { getCustomer } from '@waldur/workspace/selectors';
import { OuterState } from '@waldur/workspace/types';

export const PureCustomerPermissionsLogList = getEventsList({
  mapPropsToFilter: props => ({
    scope: props.customer.url,
    event_type: [
      'role_granted',
      'role_revoked',
      'role_updated',
    ],
  }),
});

const enhance = connect((state: OuterState) => ({ customer: getCustomer(state) }));

const CustomerPermissionsLogList = enhance(PureCustomerPermissionsLogList);

export default connectAngularComponent(CustomerPermissionsLogList);
