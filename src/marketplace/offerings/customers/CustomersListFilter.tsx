import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';
import { reduxForm } from 'redux-form';

import {
  AccountingRunningField,
  getOptions,
} from '@waldur/customer/list/AccountingRunningField';
import { CUSTOMERS_LIST_FILTER } from '@waldur/marketplace/offerings/customers/constants';

export const PureCustomersListFilter = () => (
  <div className="ibox">
    <div className="ibox-content m-b-sm border-bottom">
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

export const CustomersListFilter = reduxForm<{}, any>({
  form: CUSTOMERS_LIST_FILTER,
  initialValues: {
    accounting_is_running: getOptions()[0],
  },
})(PureCustomersListFilter);
