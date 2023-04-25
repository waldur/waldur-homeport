import { FunctionComponent } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import {
  AccountingRunningField,
  getOptions,
} from '@waldur/customer/list/AccountingRunningField';
import { CUSTOMERS_ORGANIZATION_GROUPS_FORM_ID } from '@waldur/customer/organization-groups/constants';

export const PureCustomersOrganizationGroupsFilter: FunctionComponent = () => (
  <Card>
    <Card.Body className="border-bottom mt-3">
      <form className="form-inline">
        <Row>
          <Col sm={3}>
            <AccountingRunningField />
          </Col>
        </Row>
      </form>
    </Card.Body>
  </Card>
);

export const CustomersOrganizationGroupsFilter = reduxForm<{}, any>({
  form: CUSTOMERS_ORGANIZATION_GROUPS_FORM_ID,
  initialValues: {
    accounting_is_running: getOptions()[0],
  },
})(PureCustomersOrganizationGroupsFilter);
