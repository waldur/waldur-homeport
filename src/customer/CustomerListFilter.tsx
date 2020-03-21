import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';

import { AccountingPeriodField } from './AccountingPeriodField';
import { AccountingRunningField } from './AccountingRunningField';
import { AccountingPeriodOption } from './types';

interface Props {
  accountingPeriods: AccountingPeriodOption[];
}

const PureCustomerListFilter = (props: Props) => (
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

let CustomerListFilter: any = reduxForm<{}, Props>({
  form: 'customerListFilter',
})(PureCustomerListFilter);

const mapStateToProps = () => ({
  initialValues: {
    accounting_is_running: {
      value: true,
      label: translate('Running accounting'),
    },
  },
});

CustomerListFilter = connect(mapStateToProps)(CustomerListFilter);

export { CustomerListFilter };
