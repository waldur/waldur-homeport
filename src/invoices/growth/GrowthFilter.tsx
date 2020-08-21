import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';
import { reduxForm } from 'redux-form';

import {
  AccountingRunningField,
  getOptions,
} from '@waldur/customer/list/AccountingRunningField';
import { GROWTH_FILTER_ID } from '@waldur/invoices/constants';

export const PureGrowthFilter = () => (
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

export const GrowthFilter = reduxForm<{}, any>({
  form: GROWTH_FILTER_ID,
  initialValues: {
    accounting_is_running: getOptions()[0],
  },
})(PureGrowthFilter);
