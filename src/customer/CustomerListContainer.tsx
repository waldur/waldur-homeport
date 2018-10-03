import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { CustomerListFilter } from '@waldur/customer/CustomerListFilter';
import { CustomerListFilterInterface } from '@waldur/customer/types';
import { withTranslation, TranslateProps } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';

import * as api from './api';
import { CustomerList } from './CustomerList';
import { CustomerListBilling } from './CustomerListBilling';

interface CustomerListComponentProps extends TranslateProps {
  customerListFilter: CustomerListFilterInterface;
}

export class CustomerListComponent extends React.Component<CustomerListComponentProps> {
  state = {
    total: 0,
  };

  getTotalBilling = (filter?) => {
    api.getTotal(filter).then(data => {
      this.setState({...this.state, ...data});
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.customerListFilter) {
      let params = {...nextProps.customerListFilter};
      if (nextProps.customerListFilter.accounting_period) {
        params = {
          accounting_is_running: params.accounting_is_running,
          ...nextProps.customerListFilter.accounting_period.value,
        };
      }
      this.getTotalBilling({params});
    }
  }
  componentDidMount() {
    this.getTotalBilling();
  }
  render() {
    return (
      <>
        <CustomerListFilter />
        <div className="ibox-content">
          <CustomerList />
          <CustomerListBilling total={this.state.total} {...this.props} />
        </div>
      </>
    );
  }
}

const mapStateToProps = state => ({
  customerListFilter: getFormValues('customerListFilter')(state),
});

const enhance = compose(
  connect(mapStateToProps),
  withTranslation,
);

export const CustomerListContainer = enhance(CustomerListComponent);

export default connectAngularComponent(CustomerListContainer);
