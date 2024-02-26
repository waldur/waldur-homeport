import { connect } from 'react-redux';

import { PermissionsLogList } from '@waldur/permissions/PermissionsLogList';
import { RootState } from '@waldur/store/reducers';
import { getCustomer } from '@waldur/workspace/selectors';

export const CustomerPermissionsLogList = connect((state: RootState) => ({
  scope: getCustomer(state),
}))(PermissionsLogList);
