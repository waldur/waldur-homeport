import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import {
  AccountingRunningField,
  getOptions,
} from '@waldur/customer/list/AccountingRunningField';

const PureCustomersListFilter: FunctionComponent = () => (
  <form className="form-inline min-w-200px">
    <AccountingRunningField />
  </form>
);

const mapStateToProps = (_state, ownProps) => {
  return {
    form: ownProps.uniqueFormId,
    initialValues: {
      accounting_is_running: getOptions()[0],
    },
  };
};

export const OfferingCustomersListFilter = compose(
  connect(mapStateToProps),
  reduxForm<{}, any>({}),
)(PureCustomersListFilter);
