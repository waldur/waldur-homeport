import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { $state } from '@waldur/core/services';
import { withTranslation, TranslateProps } from '@waldur/i18n';
import { ShoppingCartSteps } from '@waldur/marketplace/cart/ShoppingCartSteps';
import { State } from '@waldur/marketplace/cart/types';
import { OrderSummary } from '@waldur/marketplace/orders/OrderSummary';
import { connectAngularComponent } from '@waldur/store/connect';

import { ShoppingCart } from '../cart/ShoppingCart';
import { getOrderDetails } from './api';

interface OrderDetailsContainerState {
  orderDetails: State;
  loading: boolean;
  loaded: boolean;
}

class OrderDetailsContainer extends React.Component<TranslateProps, OrderDetailsContainerState> {
  constructor(props) {
    super(props);
    this.state = {
      orderDetails: {state: 'Configure', items: []},
      loading: true,
      loaded: false,
    };
  }

  componentDidMount() {
    this.loadData();
  }

  async loadData() {
    try {
      const orderDetails = await getOrderDetails($state.params.order_uuid);
      this.setState({
        orderDetails,
        loading: false,
        loaded: true,
      });
    } catch {
      this.setState({
        orderDetails: {state: 'Configure', items: []},
        loading: false,
        loaded: false,
      });
    }
  }

  render() {
    if (this.state.loading) {
      return <LoadingSpinner/>;
    }

    if (!this.state.loaded) {
      return (
        <h3 className="text-center">
          {this.props.translate('Unable to load order details.')}
        </h3>
      );
    }

    return (
      <div className="row">
        <div className="col-xl-9 col-lg-8">
          <ShoppingCartSteps state={this.state.orderDetails.state} />
          <ShoppingCart items={this.state.orderDetails.items} editable={this.state.orderDetails.state === 'Configure'} />
        </div>
        <div className="col-xl-3 col-lg-4">
          <OrderSummary total={this.state.orderDetails.total}/>
        </div>
      </div>
    );
  }
}

export default connectAngularComponent(withTranslation(OrderDetailsContainer));
