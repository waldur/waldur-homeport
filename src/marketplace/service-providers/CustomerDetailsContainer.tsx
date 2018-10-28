import * as React from 'react';

import { $state } from '@waldur/core/services';
import { Customer } from '@waldur/customer/types';
import { getCustomer, getProviderOfferings } from '@waldur/marketplace/common/api';
import { CustomerDetails } from '@waldur/marketplace/service-providers/CustomerDetails';
import { Offering } from '@waldur/marketplace/types';
import { connectAngularComponent } from '@waldur/store/connect';

interface CustomerDetailsContainerState {
  customer: Customer;
  loading: boolean;
  erred: boolean;
  offerings: Offering[];
}

class CustomerDetailsContainer extends React.Component<{}, CustomerDetailsContainerState> {
  state = {
    loading: true,
    erred: false,
    customer: undefined,
    offerings: [],
  };

  componentDidMount() {
    this.loadData();
  }

  async loadData() {
    try {
      const [customer, offerings] = await Promise.all([
        getCustomer($state.params.customer_uuid),
        getProviderOfferings($state.params.customer_uuid),
      ]);
      this.setState({
        customer,
        offerings,
        loading: false,
        erred: false,
      });
    } catch {
      this.setState({
        loading: false,
        erred: true,
      });
    }
  }

  render() {
    return <CustomerDetails {...this.state}/>;
  }
}

export default connectAngularComponent(CustomerDetailsContainer);
