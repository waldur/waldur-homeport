import { FunctionComponent } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import { PeriodOption } from '@waldur/form/types';

import { AccountingPeriodField } from './AccountingPeriodField';
import { AccountingRunningField } from './AccountingRunningField';

interface CustomerListFilterProps {
  accountingPeriods: PeriodOption[];
}

export const PureCustomerListFilter: FunctionComponent<CustomerListFilterProps> =
  (props) => (
    <Card>
      <Card.Body className="m-b-sm border-bottom">
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
      </Card.Body>
    </Card>
  );

export const CustomerListFilter = reduxForm<{}, CustomerListFilterProps>({
  form: 'customerListFilter',
})(PureCustomerListFilter);
