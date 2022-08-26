import { connect } from 'react-redux';

import { getEventsList } from '@waldur/events/BaseEventsList';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
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
  useTitle(translate('Permission log'));
  return <CustomerPermissionsLogListView />;
};
