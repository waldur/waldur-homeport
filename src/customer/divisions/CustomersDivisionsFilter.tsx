import { FunctionComponent } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import { CUSTOMERS_DIVISIONS_FORM_ID } from '@waldur/customer/divisions/constants';
import {
  AccountingRunningField,
  getOptions,
} from '@waldur/customer/list/AccountingRunningField';

export const PureCustomersDivisionsFilter: FunctionComponent = () => (
  <Card>
    <Card.Body className="border-bottom m-t-md">
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

export const CustomersDivisionsFilter = reduxForm<{}, any>({
  form: CUSTOMERS_DIVISIONS_FORM_ID,
  initialValues: {
    accounting_is_running: getOptions()[0],
  },
})(PureCustomersDivisionsFilter);
