import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import { AccountingPeriodField, accountingPeriods } from './AccountingPeriodField';
import { AccountingRunningField, getOptions } from './AccountingRunningField';

export const PureCustomerListFilter = () => (
  <div className="ibox">
    <div className="ibox-content m-b-sm border-bottom">
      <form className="form-inline">
        <Row>
          <Col sm={9}>
            <AccountingPeriodField/>
          </Col>
          <Col sm={3}>
            <AccountingRunningField/>
          </Col>
        </Row>
      </form>
    </div>
  </div>
);

const FilterForm = reduxForm({
  form: 'customerListFilter',
})(PureCustomerListFilter);

export const CustomerListFilter = connect(
  () => ({
    initialValues: {
      accounting_period: accountingPeriods[0],
      accounting_is_running: getOptions()[0],
    },
  }),
)(FilterForm);
