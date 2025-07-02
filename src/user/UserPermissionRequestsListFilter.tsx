import { FunctionComponent } from 'react';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';
import { USER_PERMISSION_REQUESTS_FILTER_FORM_ID } from '@waldur/user/constants';
import {
  getStates,
  UserPermissionRequestsStateFilter,
} from '@waldur/user/UserPermissionRequestsStateFilter';

const PureUserPermissionRequestsListFilter: FunctionComponent = () => (
  <TableFilterItem name="state" title={translate('State')} instantApply={false}>
    <UserPermissionRequestsStateFilter />
  </TableFilterItem>
);

const enhance = reduxForm({
  form: USER_PERMISSION_REQUESTS_FILTER_FORM_ID,
  initialValues: {
    state: [getStates()[0]],
  },
  destroyOnUnmount: false,
});

export const UserPermissionRequestsListFilter = enhance(
  PureUserPermissionRequestsListFilter,
);
