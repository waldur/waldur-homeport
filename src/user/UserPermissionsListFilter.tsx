import { FunctionComponent } from 'react';
import { Row } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import { USER_PERMISSIONS_FILTER_FORM_ID } from '@waldur/user/constants';
import { UserPermissionStateFilter } from '@waldur/user/UserPermissionStateFilter';

const PureUserPermissionsListFilter: FunctionComponent = () => (
  <Row style={{ margin: '0' }}>
    <UserPermissionStateFilter />
  </Row>
);

const enhance = reduxForm({
  form: USER_PERMISSIONS_FILTER_FORM_ID,
});

export const UserPermissionsListFilter = enhance(PureUserPermissionsListFilter);
