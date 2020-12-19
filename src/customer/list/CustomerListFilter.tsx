import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import { AccountingPeriodField } from './AccountingPeriodField';
import { AccountingRunningField } from './AccountingRunningField';
import { AccountingPeriodOption } from './types';

interface Props {
  accountingPeriods: AccountingPeriodOption[];
}

export const PureCustomerListFilter: FunctionComponent<Props> = (props) => (
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
