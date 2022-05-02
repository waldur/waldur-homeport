import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import { PeriodOption } from '@waldur/form/types';

import { AccountingPeriodField } from './AccountingPeriodField';
import { AccountingRunningField } from './AccountingRunningField';

interface CustomerListFilterProps {
  accountingPeriods: PeriodOption[];
}

export const PureCustomerListFilter: FunctionComponent<CustomerListFilterProps> =
  (props) => (
    <Row>
      <Col sm={9}>
        <AccountingPeriodField options={props.accountingPeriods} />
      </Col>
      <Col sm={3}>
        <AccountingRunningField />
      </Col>
    </Row>
  );

export const CustomerListFilter = reduxForm<{}, CustomerListFilterProps>({
  form: 'customerListFilter',
  destroyOnUnmount: false,
})(PureCustomerListFilter);
