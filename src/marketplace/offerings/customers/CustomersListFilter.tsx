import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import {
  AccountingRunningField,
  getOptions,
} from '@waldur/customer/list/AccountingRunningField';

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

const mapStateToProps = (_state, ownProps) => {
  return {
    form: ownProps.uniqueFormId,
    initialValues: {
      accounting_is_running: getOptions()[0],
    },
  };
};

export const CustomersListFilter = compose(
  connect(mapStateToProps),
  reduxForm<{}, any>({}),
)(PureCustomersListFilter);
