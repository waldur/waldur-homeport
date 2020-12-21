import { FunctionComponent } from 'react';
import { Row } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import { CUSTOMER_USERS_LIST_FILTER_FORM_ID } from '@waldur/customer/team/constants';
import { OrganizationRoleSelectField } from '@waldur/customer/team/OrganizationRoleSelectField';
import { ProjectRoleSelectField } from '@waldur/customer/team/ProjectRoleSelectField';

const PureCustomerUsersListFilter: FunctionComponent = () => (
  <Row>
    <ProjectRoleSelectField />
    <OrganizationRoleSelectField />
  </Row>
);

const enhance = reduxForm({
  form: CUSTOMER_USERS_LIST_FILTER_FORM_ID,
});

export const CustomerUsersListFilter = enhance(PureCustomerUsersListFilter);
