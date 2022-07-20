import { connect } from 'react-redux';

import { useCustomerItems } from '@waldur/customer/utils';
import { getEventsList } from '@waldur/events/BaseEventsList';
import { RootState } from '@waldur/store/reducers';
import { getCustomer } from '@waldur/workspace/selectors';

export const PureCustomerPermissionsLogList = getEventsList({
  mapPropsToFilter: (props) => ({
    scope: props.customer.url,
    event_type: ['role_granted', 'role_revoked', 'role_updated'],
  }),
  mapPropsToTableId: (props) => ['customer-permissions', props.customer.uuid],
});

const enhance = connect((state: RootState) => ({
  customer: getCustomer(state),
}));

const CustomerPermissionsLogListView = enhance(PureCustomerPermissionsLogList);

export const CustomerPermissionsLogList = () => {
  useCustomerItems();
  return <CustomerPermissionsLogListView />;
};
