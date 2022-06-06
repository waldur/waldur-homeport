import { FunctionComponent } from 'react';
import { Row } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import { USER_PERMISSION_REQUESTS_FILTER_FORM_ID } from '@waldur/user/constants';
import {
  getStates,
  UserPermissionRequestsStateFilter,
} from '@waldur/user/UserPermissionRequestsStateFilter';

const PureUserPermissionRequestsListFilter: FunctionComponent = () => (
  <Row style={{ margin: '0' }}>
    <UserPermissionRequestsStateFilter />
  </Row>
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
