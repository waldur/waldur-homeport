import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';
import { reduxForm } from 'redux-form';

import { AccountingPeriodField } from './AccountingPeriodField';
import { AccountingRunningField } from './AccountingRunningField';
import { AccountingPeriodOption } from './types';

interface Props {
  accountingPeriods: AccountingPeriodOption[];
}

export const PureCustomerListFilter = (props: Props) => (
  <div className="ibox">
    <div className="ibox-content m-b-sm border-bottom">
      <form className="form-inline">
        <Row>
          <Col sm={9}>
            <AccountingPeriodField options={props.accountingPeriods} />
          </Col>
          <Col sm={3}>
            <AccountingRunningField />
          </Col>
        </Row>
      </form>
    </div>
  </div>
);

export const CustomerListFilter = reduxForm<{}, Props>({
  form: 'customerListFilter',
})(PureCustomerListFilter);
