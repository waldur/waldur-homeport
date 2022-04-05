import { FunctionComponent } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import {
  AccountingRunningField,
  getOptions,
} from '@waldur/customer/list/AccountingRunningField';
import { GROWTH_FILTER_ID } from '@waldur/invoices/constants';

export const PureGrowthFilter: FunctionComponent = () => (
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

export const GrowthFilter = reduxForm<{}, any>({
  form: GROWTH_FILTER_ID,
  initialValues: {
    accounting_is_running: getOptions()[0],
  },
})(PureGrowthFilter);
