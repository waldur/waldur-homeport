import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';
import { reduxForm } from 'redux-form';

import { CUSTOMERS_DIVISIONS_FORM_ID } from '@waldur/customer/divisions/constants';
import {
  AccountingRunningField,
  getOptions,
} from '@waldur/customer/list/AccountingRunningField';

export const PureCustomersDivisionsFilter = () => (
  <div className="ibox">
    <div className="ibox-content border-bottom m-t-md">
      <form className="form-inline">
        <Row>
          <Col sm={3}>
            <AccountingRunningField />
          </Col>
        </Row>
      </form>
    </div>
  </div>
);

export const CustomersDivisionsFilter = reduxForm<{}, any>({
  form: CUSTOMERS_DIVISIONS_FORM_ID,
  initialValues: {
    accounting_is_running: getOptions()[0],
  },
})(PureCustomersDivisionsFilter);
